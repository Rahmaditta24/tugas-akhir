<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;

use App\Models\FasilitasLab;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class FasilitasLabPageController extends Controller
{
    public function index(Request $request)
    {
        $v = (int) Cache::get('fasilitas_lab_cache_version', 1);
        $baseQuery = FasilitasLab::query();

        // Pencarian sederhana
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        // Pencarian multi-baris lanjutan
        if ($request->filled('queries')) {
            $queries = json_decode($request->queries, true);
            if (is_array($queries)) {
                $baseQuery->where(function ($q) use ($queries) {
                    foreach ($queries as $index => $row) {
                        $term = trim($row['term'] ?? '');
                        if (empty($term)) continue;

                        $field    = $row['field']    ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        $applyCondition = function ($query) use ($term, $field) {
                            if ($field === 'all') {
                                $query->where(function ($sub) use ($term) {
                                    $sub->where('nama_laboratorium', 'like', "%$term%")
                                        ->orWhere('nama_alat', 'like', "%$term%")
                                        ->orWhere('institusi', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match ($field) {
                                    'title'      => 'nama_laboratorium',
                                    'university' => 'institusi',
                                    default      => 'nama_laboratorium',
                                };
                                $query->where($dbField, 'like', "%$term%");
                            }
                        };

                        if ($index === 0) {
                            $applyCondition($q);
                        } elseif ($operator === 'OR') {
                            $q->orWhere(fn($sub) => $applyCondition($sub));
                        } elseif ($operator === 'AND NOT') {
                            $q->whereNot(fn($sub) => $applyCondition($sub));
                        } else {
                            $q->where(fn($sub) => $applyCondition($sub));
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

        // Stats & map data menggunakan base query (dengan filter)
        $statsCacheKey = 'stats_fasilitas_lab_v' . $v . '_' . md5(json_encode($request->all()));
        $stats = Cache::remember($statsCacheKey, 3600, function () use ($baseQuery) {
            return [
                'totalResearch'    => (clone $baseQuery)->count(),
                'totalUniversities'=> (clone $baseQuery)->distinct('institusi')->count('institusi'),
                'totalProvinces'   => (clone $baseQuery)->distinct('provinsi')->count('provinsi'),
            ];
        });

        $mapCacheKey = 'map_data_fasilitas_lab_v' . $v . '_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($mapCacheKey, 1800, function () use ($baseQuery) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');

            $rows = (clone $baseQuery)->select(
                'institusi',
                'kode_universitas',
                'latitude',
                'longitude',
                'provinsi',
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
                    'total_penelitian' => $entry['total_penelitian'],
                    'lab_list'         => implode('|', $entry['lab_names']),
                    'tool_list'        => implode('|', $tools),
                    'isFasilitasLab'   => true,
                ];
            }
            return $result;
        });

        $isFiltered = $request->filled('search')
            || $request->filled('queries')
            || $request->filled('kampus_ptnbh')
            || $request->filled('provinsi');

        $items = $isFiltered
            ? (clone $baseQuery)->select(
                'id',
                'nama_laboratorium as judul',
                'institusi',
                'kategori_pt',
                'provinsi',
                'kota',
                'nama_alat',
                'total_jumlah_alat',
                'kontak'
            )
                ->latest('id')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        $filterOptions = [
            'kampus_ptnbh' => Cache::remember('filter_fasilitas_kampus', 7200, function () {
                return DB::table('fasilitas_lab')
                    ->select('institusi')
                    ->whereNotNull('institusi')
                    ->distinct()
                    ->orderBy('institusi')
                    ->pluck('institusi')
                    ->filter()
                    ->values();
            }),
            'provinsi' => Cache::remember('global_provinces_final_v1', 86400, function () {
                $path = database_path('data/provinces.json');
                if (file_exists($path)) {
                    $data = json_decode(file_get_contents($path), true);
                    return collect($data)
                        ->map(fn($p) => trim($p['name']))
                        ->unique()
                        ->sort()
                        ->values()
                        ->all();
                }
                return [];
            }),
        ];

        return Inertia::render('FasilitasLab', [
            'mapData'       => $mapData,
            'researches'    => $items,
            'stats'         => $stats,
            'filters'       => $request->all(),
            'filterOptions' => $filterOptions,
            'isFiltered'    => $isFiltered,
            'title'         => 'Peta Persebaran Penelitian BIMA Indonesia - Fasilitas Lab',
        ]);
    }
}
