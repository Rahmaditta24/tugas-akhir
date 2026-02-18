<?php

namespace App\Http\Controllers;

use App\Models\Hilirisasi;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
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

        $cacheKey = 'map_data_hilirisasi_v4_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');
            $query = (clone $baseQuery)

                ->select(
                    DB::raw('ROUND(pt_latitude, 2) as lat_rounded'),
                    DB::raw('ROUND(pt_longitude, 2) as lng_rounded'),
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('GROUP_CONCAT(DISTINCT perguruan_tinggi SEPARATOR " | ") as institusi'),
                    DB::raw('MAX(provinsi) as provinsi'),
                    DB::raw('COUNT(*) as total_penelitian'),
                    DB::raw('GROUP_CONCAT(COALESCE(skema, "-") SEPARATOR "|") as all_fields'),
                    DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as all_ids'),
                    DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
                    DB::raw('GROUP_CONCAT(CAST(tahun AS CHAR) SEPARATOR "|") as all_years'),
                    DB::raw('GROUP_CONCAT(COALESCE(luaran, "-") SEPARATOR "|") as all_themes'),
                    DB::raw('GROUP_CONCAT("-" SEPARATOR "|") as all_pt_types')

                )
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
                ->groupBy('lat_rounded', 'lng_rounded')
                ->having('total_penelitian', '>', 0);

            return $query->get()->map(function($item) {
                return [
                    'institusi' => $item->institusi,
                    'pt_latitude' => (float)$item->pt_latitude,
                    'pt_longitude' => (float)$item->pt_longitude,
                    'provinsi' => $item->provinsi,
                    'total_penelitian' => (int)$item->total_penelitian,
                    'bidang_fokus' => $item->all_fields,
                    'ids' => $item->all_ids,
                    'titles' => $item->all_titles,
                    'skema_list' => $item->all_fields, // Hilirisasi uses skema as field
                    'tahun_list' => $item->all_years,
                    'tema_list' => $item->all_themes,
                    'jenis_pt_list' => $item->all_pt_types,
                ];

            })->all();
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
            'provinsi' => Cache::remember('filter_hilirisasi_provinsi', 7200, function() {
                return DB::table('hilirisasi')
                    ->select('provinsi')
                    ->whereNotNull('provinsi')
                    ->distinct()
                    ->orderBy('provinsi')
                    ->pluck('provinsi')
                    ->filter()
                    ->values();
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


