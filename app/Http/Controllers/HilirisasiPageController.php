<?php

namespace App\Http\Controllers;

use App\Models\Hilirisasi;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class HilirisasiPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Hilirisasi::query();
        
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
                                    $sub->where('judul', 'like', "%$term%")
                                        ->orWhere('nama_pengusul', 'like', "%$term%")
                                        ->orWhere('perguruan_tinggi', 'like', "%$term%")
                                        ->orWhere('skema', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match($field) {
                                    'title' => 'judul',
                                    'university' => 'perguruan_tinggi',
                                    'researcher' => 'nama_pengusul',
                                    'directorate' => 'direktorat',
                                    'skema' => 'skema',
                                    default => 'judul'
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

        if ($request->filled('direktorat')) {
            $baseQuery->where('direktorat', $request->direktorat);
        }

        if ($request->filled('skema')) {
            $baseQuery->where('skema', $request->skema);
        }

        if ($request->filled('provinsi')) {
            $baseQuery->where('provinsi', $request->provinsi);
        }

        if ($request->filled('tahun')) {
            $baseQuery->where('tahun', $request->tahun);
        }

        $statsQ = clone $baseQuery;
        $stats = [
            'totalResearch' => (clone $statsQ)->count(),
            'totalUniversities' => (clone $statsQ)->distinct('perguruan_tinggi')->count('perguruan_tinggi'),
            'totalProvinces' => (clone $statsQ)->distinct('provinsi')->count('provinsi'),
            'totalFields' => (clone $statsQ)->distinct('skema')->count('skema'),
        ];

        $cacheKey = 'map_data_hilirisasi_v9_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');
            $query = (clone $baseQuery)
                ->select(
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('perguruan_tinggi as institusi_name'),
                    DB::raw('MAX(provinsi) as provinsi'),
                    DB::raw('COUNT(*) as total_hilirisasi'),
                    DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as all_ids'),
                    DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
                    DB::raw('GROUP_CONCAT(COALESCE(skema, "-") SEPARATOR "|") as all_skema'),
                    DB::raw('GROUP_CONCAT(CAST(tahun AS CHAR) SEPARATOR "|") as all_years')
                )
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
                ->whereNotNull('perguruan_tinggi')
                ->groupBy('perguruan_tinggi');

            return $query->get()->map(function($item) {
                return [
                    'institusi' => $item->institusi_name,
                    'pt_latitude' => (float)$item->pt_latitude,
                    'pt_longitude' => (float)$item->pt_longitude,
                    'provinsi' => $item->provinsi,
                    'total_hilirisasi' => (int)$item->total_hilirisasi,
                    'ids' => $item->all_ids,
                    'titles' => $item->all_titles,
                    'skema_list' => $item->all_skema,
                    'tahun_list' => $item->all_years,
                    'bidang_fokus' => '-', 
                ];
            })->toArray();
        });

        // Only load list if filtered/searched
        $isFiltered = $request->filled('search') 
            || $request->filled('queries')
            || $request->filled('direktorat')
            || $request->filled('skema')
            || $request->filled('provinsi')
            || $request->filled('tahun');

        $items = $isFiltered
            ? (clone $baseQuery)->select('id', 'judul', 'nama_pengusul as nama', 'perguruan_tinggi as institusi', 'provinsi', 'skema as bidang_fokus', 'tahun')
                ->latest('tahun')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        // Get filter options (cached)
        $filterOptions = [
            'direktorat' => Cache::remember('filter_hilirisasi_direktorat', 7200, function() {
                return DB::table('hilirisasi')
                    ->select('direktorat')
                    ->whereNotNull('direktorat')
                    ->distinct()
                    ->orderBy('direktorat')
                    ->pluck('direktorat')
                    ->filter()
                    ->values();
            }),
            'skema' => Cache::remember('filter_hilirisasi_skema', 7200, function() {
                return DB::table('hilirisasi')
                    ->select('skema')
                    ->whereNotNull('skema')
                    ->distinct()
                    ->orderBy('skema')
                    ->pluck('skema')
                    ->filter()
                    ->values();
            }),
            'provinsi' => Cache::remember('global_provinces_list', 86400, function() {
                // Use local data directly - more reliable for production
                $path = storage_path('provinces.json');
                if (file_exists($path)) {
                    $data = json_decode(file_get_contents($path), true);
                    return collect($data)
                        ->map(fn($p) => \Illuminate\Support\Str::title($p['name']))
                        ->sort()
                        ->values()
                        ->all();
                }
                return [];
            }),
            'tahun' => Cache::remember('filter_hilirisasi_tahun', 7200, function() {
                return DB::table('hilirisasi')
                    ->select('tahun')
                    ->whereNotNull('tahun')
                    ->distinct()
                    ->orderBy('tahun', 'desc')
                    ->pluck('tahun')
                    ->filter()
                    ->values();
            }),
        ];

        return Inertia::render('Hilirisasi', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
            'filters' => $request->all(),
            'filterOptions' => $filterOptions,
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Hilirisasi'
        ]);
    }
}
