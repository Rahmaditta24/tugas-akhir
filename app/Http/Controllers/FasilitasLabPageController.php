<?php

namespace App\Http\Controllers;

use App\Models\FasilitasLab;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class FasilitasLabPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = FasilitasLab::query();
        
        // Apply simple search
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        // Apply advanced multi-row queries
        if ($request->filled('queries')) {
            $queries = json_decode($request->queries, true);
            if (is_array($queries)) {
                $baseQuery->where(function ($q) use ($queries) {
                    foreach ($queries as $index => $row) {
                        $term = trim($row['term'] ?? '');
                        if (empty($term)) continue;

                        $field = $row['field'] ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        $applyCondition = function($query) use ($term, $field) {
                            if ($field === 'all') {
                                $query->where(function($sub) use ($term) {
                                    $sub->where('nama_laboratorium', 'like', "%$term%")
                                        ->orWhere('nama_alat', 'like', "%$term%")
                                        ->orWhere('institusi', 'like', "%$term%")
                                        ->orWhere('jenis_laboratorium', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match($field) {
                                    'title' => 'nama_laboratorium',
                                    'university' => 'institusi',
                                    'field' => 'jenis_laboratorium',
                                    default => 'nama_laboratorium'
                                };
                                $query->where($dbField, 'like', "%$term%");
                            }
                        };

                        if ($index === 0) {
                            $applyCondition($q);
                        } else {
                            if ($operator === 'OR') {
                                $q->orWhere(function($sub) use ($applyCondition) { $applyCondition($sub); });
                            } elseif ($operator === 'AND NOT') {
                                $q->whereNot(function($sub) use ($applyCondition) { $applyCondition($sub); });
                            } else { 
                                $q->where(function($sub) use ($applyCondition) { $applyCondition($sub); });
                            }
                        }
                    }
                });
            }
        }

        if ($request->filled('kampus_ptnbh')) {
            $values = is_array($request->kampus_ptnbh) ? $request->kampus_ptnbh : [$request->kampus_ptnbh];
            $baseQuery->whereIn('institusi', $values);
        }

        if ($request->filled('provinsi')) {
            $values = is_array($request->provinsi) ? $request->provinsi : [$request->provinsi];
            $baseQuery->whereIn('provinsi', $values);
        }


        // For map and stats, we use the global query (without filters)
        // so the map stays full and stats stay static as requested.
        $globalQuery = FasilitasLab::query();

        $stats = [
            'totalResearch' => (clone $globalQuery)->count(),
            'totalUniversities' => (clone $globalQuery)->distinct('institusi')->count('institusi'),
            'totalProvinces' => (clone $globalQuery)->distinct('provinsi')->count('provinsi'),
        ];

        $cacheKey = 'map_data_fasilitas_lab_v8_global';
        $mapData = Cache::remember($cacheKey, 1800, function() use ($globalQuery) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');
            $rows = (clone $globalQuery)->select(
                'institusi',
                'kode_universitas',
                'latitude',
                'longitude',
                'provinsi',
                'kategori_pt',
                'nama_laboratorium',
                'nama_alat',
            )
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->cursor();

            $grouped = [];
            foreach ($rows as $item) {
                $key = $item->institusi ?? 'Unknown';
                if (!isset($grouped[$key])) {
                    $grouped[$key] = [
                        'institusi'        => $item->institusi,
                        'kode_universitas' => $item->kode_universitas,
                        'pt_latitude'      => (float) $item->latitude,
                        'pt_longitude'     => (float) $item->longitude,
                        'provinsi'         => $item->provinsi,
                        'kategori_pt'      => $item->kategori_pt,
                        'total_penelitian' => 0,
                        'lab_names'        => [],
                        'tool_names'       => [],
                        'isFasilitasLab'   => true,
                    ];
                }
                $grouped[$key]['total_penelitian']++;
                if ($item->nama_laboratorium) {
                    $grouped[$key]['lab_names'][] = $item->nama_laboratorium;
                }
                if ($item->nama_alat) {
                    foreach (explode('|', $item->nama_alat) as $tool) {
                        $tool = trim($tool);
                        if ($tool && !in_array($tool, $grouped[$key]['tool_names'])) {
                            $grouped[$key]['tool_names'][] = $tool;
                        }
                    }
                }
            }

            $result = [];
            foreach ($grouped as $entry) {
                $tools = $entry['tool_names'];
                sort($tools);

                $result[] = [
                    'institusi'        => $entry['institusi'],
                    'kode_universitas' => $entry['kode_universitas'],
                    'pt_latitude'      => $entry['pt_latitude'],
                    'pt_longitude'     => $entry['pt_longitude'],
                    'provinsi'         => $entry['provinsi'],
                    'kategori_pt'      => $entry['kategori_pt'],
                    'total_penelitian' => $entry['total_penelitian'],
                    'lab_list'         => implode('|', $entry['lab_names']),
                    'tool_list'        => implode('|', $tools),
                    'isFasilitasLab'   => true,
                ];
            }
            return $result;
        });

        // Only load list if filtered/searched
        $isFiltered = $request->filled('search') 
            || $request->filled('queries')
            || $request->filled('kampus_ptnbh')
            || $request->filled('provinsi');

        $items = $isFiltered
            ? (clone $baseQuery)->select(
                'id', 
                'nama_laboratorium as judul', 
                'institusi', 
                'provinsi', 
                'jenis_laboratorium as bidang_fokus',
                'fakultas',
                'departemen',
                'status_akses',
                'kota',
                'nama_alat',
                'total_jumlah_alat'
            )
                ->latest('id')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        $filterOptions = [
            'kampus_ptnbh' => Cache::remember('filter_fasilitas_kampus', 7200, function() {
                return DB::table('fasilitas_lab')
                    ->select('institusi')
                    ->whereNotNull('institusi')
                    ->distinct()
                    ->orderBy('institusi')
                    ->pluck('institusi')
                    ->filter()
                    ->values();
            }),
            'provinsi' => Cache::remember('global_provinces_list', 86400, function() {
                $response = Http::get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
                if ($response->successful()) {
                    return collect($response->json())
                        ->map(fn($p) => str()->title($p['name']))
                        ->sort()
                        ->values()
                        ->all();
                }
                return [];
            }),
        ];

        return Inertia::render('FasilitasLab', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
            'filters' => $request->all(),
            'filterOptions' => $filterOptions,
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Fasilitas Lab'
        ]);
    }
}


