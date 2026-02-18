<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Penelitian;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PenelitianController extends Controller
{
    public function index(Request $request)
    {
        // Build base query with filters
        $baseQuery = Penelitian::query();

        // Apply filters if provided
        if ($request->filled('bidang_fokus')) {
            $baseQuery->whereIn('bidang_fokus', (array) $request->bidang_fokus);
        }

        if ($request->filled('tema_prioritas')) {
            $baseQuery->whereIn('tema_prioritas', (array) $request->tema_prioritas);
        }

        if ($request->filled('kategori_pt')) {
            $baseQuery->whereIn('kategori_pt', (array) $request->kategori_pt);
        }

        if ($request->filled('klaster')) {
            $baseQuery->whereIn('klaster', (array) $request->klaster);
        }

        if ($request->filled('provinsi')) {
            $baseQuery->whereIn('provinsi', (array) $request->provinsi);
        }

        if ($request->filled('tahun')) {
            $baseQuery->whereIn('thn_pelaksanaan', (array) $request->tahun);
        }
        
        if ($request->filled('skema')) {
            $baseQuery->whereIn('skema', (array) $request->skema);
        }

        // Apply simple search if provided
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

                        // Define closure for applying field conditions
                        $applyCondition = function($query) use ($term, $field) {
                            if ($field === 'all') {
                                $query->where(function($sub) use ($term) {
                                    $sub->where('judul', 'like', "%$term%")
                                        ->orWhere('nama', 'like', "%$term%")
                                        ->orWhere('institusi', 'like', "%$term%")
                                        ->orWhere('bidang_fokus', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match($field) {
                                    'title' => 'judul',
                                    'university' => 'institusi',
                                    'researcher' => 'nama',
                                    'field' => 'bidang_fokus',
                                    'priorityTheme' => 'tema_prioritas',
                                    'category' => 'kategori_pt',
                                    'cluster' => 'klaster',
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
                            } else { // AND
                                $q->where(function($sub) use ($applyCondition) { $applyCondition($sub); });
                            }
                        }
                    }
                });
            }
        }

        $statsQuery = clone $baseQuery;
        $totalStats = [
            'totalResearch' => (clone $statsQuery)->count(),
            'totalUniversities' => (clone $statsQuery)->distinct('institusi')->count('institusi'),
            'totalProvinces' => (clone $statsQuery)->distinct('provinsi')->count('provinsi'),
            'totalFields' => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus'),
        ];

        // For map: MEMORY-EFFICIENT GEOGRAPHIC CLUSTERING
        $cacheKey = 'map_data_cache_v4_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 300, function() use ($baseQuery) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');
            // Aggregate by geographic location (rounded coordinates)


            $aggregatedData = (clone $baseQuery)
                ->select(
                    DB::raw('ROUND(pt_latitude, 2) as lat_rounded'),
                    DB::raw('ROUND(pt_longitude, 2) as lng_rounded'),
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('COUNT(*) as total_penelitian'),
                    DB::raw('GROUP_CONCAT(DISTINCT institusi SEPARATOR " | ") as institusi_list'),
                    DB::raw('GROUP_CONCAT(DISTINCT provinsi) as provinsi'),
                    DB::raw('GROUP_CONCAT(COALESCE(bidang_fokus, "-") SEPARATOR "|") as all_fields'),
                    DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as all_ids'),
                    DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
                    DB::raw('GROUP_CONCAT(COALESCE(skema, "-") SEPARATOR "|") as all_skema'),
                    DB::raw('GROUP_CONCAT(CAST(thn_pelaksanaan AS CHAR) SEPARATOR "|") as all_years'),
                    DB::raw('GROUP_CONCAT(COALESCE(tema_prioritas, "-") SEPARATOR "|") as all_themes'),
                    DB::raw('GROUP_CONCAT(COALESCE(jenis_pt, "-") SEPARATOR "|") as all_pt_types')

                )
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
                ->groupBy('lat_rounded', 'lng_rounded')
                ->having('total_penelitian', '>', 0)
                ->get();

            $result = $aggregatedData->map(function($item) {
                return [
                    'pt_latitude' => (float)$item->pt_latitude,
                    'pt_longitude' => (float)$item->pt_longitude,
                    'total_penelitian' => (int)$item->total_penelitian,
                    'institusi' => $item->institusi_list,
                    'provinsi' => $item->provinsi,
                    'bidang_fokus' => $item->all_fields,
                    'ids' => $item->all_ids,
                    'titles' => $item->all_titles,
                    'skema_list' => $item->all_skema,
                    'tahun_list' => $item->all_years,
                    'tema_list' => $item->all_themes,
                    'jenis_pt_list' => $item->all_pt_types,
                ];

            })->toArray();

            return collect($result)->values()->all();
        });

        // For list: only load if there are active filters or search
        $isFiltered = $request->filled('bidang_fokus') || 
                      $request->filled('tema_prioritas') || 
                      $request->filled('kategori_pt') || 
                      $request->filled('klaster') || 
                      $request->filled('provinsi') || 
                      $request->filled('tahun') || 
                      $request->filled('skema') || 
                      $request->filled('search') ||
                      $request->filled('queries');

        $researches = $isFiltered 
            ? (clone $baseQuery)->select(
                'id',
                'nama',
                'institusi',
                'judul',
                'bidang_fokus',
                'tema_prioritas',
                'thn_pelaksanaan',
                'skema'
            )
            ->limit(50) // Only load first 50 for performance
            ->get()
            ->values()
            : collect()->values(); // Empty collection if no search/filter active

        // Get filter options (cached - using raw DB queries for efficiency)
        $filterOptions = [
            'bidangFokus' => Cache::remember('filter_bidang_fokus', 7200, function() {
                return DB::table('penelitian')
                    ->select('bidang_fokus')
                    ->whereNotNull('bidang_fokus')
                    ->distinct()
                    ->orderBy('bidang_fokus')
                    ->pluck('bidang_fokus')
                    ->filter()
                    ->values();
            }),
            'temaPrioritas' => Cache::remember('filter_tema_prioritas', 7200, function() {
                return DB::table('penelitian')
                    ->select('tema_prioritas')
                    ->whereNotNull('tema_prioritas')
                    ->distinct()
                    ->orderBy('tema_prioritas')
                    ->pluck('tema_prioritas')
                    ->filter()
                    ->values();
            }),
            'kategoriPT' => Cache::remember('filter_kategori_pt', 7200, function() {
                return DB::table('penelitian')
                    ->select('kategori_pt')
                    ->whereNotNull('kategori_pt')
                    ->distinct()
                    ->orderBy('kategori_pt')
                    ->pluck('kategori_pt')
                    ->filter()
                    ->values();
            }),
            'klaster' => Cache::remember('filter_klaster', 7200, function() {
                return DB::table('penelitian')
                    ->select('klaster')
                    ->whereNotNull('klaster')
                    ->distinct()
                    ->orderBy('klaster')
                    ->pluck('klaster')
                    ->filter()
                    ->values();
            }),
            'provinsi' => Cache::remember('filter_provinsi', 7200, function() {
                return DB::table('penelitian')
                    ->select('provinsi')
                    ->whereNotNull('provinsi')
                    ->distinct()
                    ->orderBy('provinsi')
                    ->pluck('provinsi')
                    ->filter()
                    ->values();
            }),
            'tahun' => Cache::remember('filter_tahun', 7200, function() {
                return DB::table('penelitian')
                    ->select('thn_pelaksanaan')
                    ->whereNotNull('thn_pelaksanaan')
                    ->distinct()
                    ->orderBy('thn_pelaksanaan', 'desc')
                    ->pluck('thn_pelaksanaan')
                    ->filter()
                    ->values();
            }),
            'skema' => Cache::remember('filter_skema', 7200, function() {
                return DB::table('penelitian')
                    ->select('skema')
                    ->whereNotNull('skema')
                    ->distinct()
                    ->orderBy('skema')
                    ->pluck('skema')
                    ->filter()
                    ->values();
            }),
        ];

        return Inertia::render('Home', [
            'mapData' => $mapData,
            'researches' => $researches,
            'stats' => $totalStats,
            'filterOptions' => $filterOptions,
            'filters' => $request->all(),
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Penelitian'
        ]);
    }

    /**
     * Export all filtered data for Excel download
     * OPTIMIZED: Use chunked response to avoid memory exhaustion
     */
    public function export(Request $request)
    {
        // Build query with same filters as index
        $query = Penelitian::query();

        // Apply filters
        if ($request->filled('bidang_fokus')) {
            $query->whereIn('bidang_fokus', (array) $request->bidang_fokus);
        }

        if ($request->filled('tema_prioritas')) {
            $query->whereIn('tema_prioritas', (array) $request->tema_prioritas);
        }

        if ($request->filled('kategori_pt')) {
            $query->whereIn('kategori_pt', (array) $request->kategori_pt);
        }

        if ($request->filled('klaster')) {
            $query->whereIn('klaster', (array) $request->klaster);
        }

        if ($request->filled('provinsi')) {
            $query->whereIn('provinsi', (array) $request->provinsi);
        }

        if ($request->filled('tahun')) {
            $query->whereIn('thn_pelaksanaan', (array) $request->tahun);
        }

        if ($request->filled('skema')) {
            $query->whereIn('skema', (array) $request->skema);
        }

        // Apply search if provided
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        try {
            // OPTIMIZED: Use streaming response to avoid loading all data into memory
            return response()->stream(function () use ($query) {
                echo '[';
                $first = true;

                // Use cursor for memory-efficient iteration
                $query->select(
                'nama',
                'nidn',
                'institusi',
                'jenis_pt',
                'kategori_pt',
                'klaster',
                'provinsi',
                'kota',
                'judul',
                'skema',
                'thn_pelaksanaan',
                'bidang_fokus',
                'tema_prioritas'
            )
            ->orderBy('thn_pelaksanaan', 'desc')
            ->orderBy('institusi')
            ->cursor()
            ->each(function ($item) use (&$first) {
                if (!$first) {
                    echo ',';
                }
                echo json_encode($item);
                $first = false;

                // Flush output buffer to prevent memory buildup
                if (ob_get_level() > 0) {
                    ob_flush();
                    flush();
                }
            });

            echo ']';
        }, 200, [
            'Content-Type' => 'application/json',
            'Cache-Control' => 'no-cache',
        ]);
        } catch (\Exception $e) {
            \Log::error('Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    public function getDetail($type, $id)
    {
        $data = match($type) {
            'penelitian' => \App\Models\Penelitian::find($id),
            'hilirisasi' => \App\Models\Hilirisasi::find($id),
            'pengabdian' => \App\Models\Pengabdian::find($id),
            default => null
        };

        if (!$data) {
            return response()->json(['error' => 'Data not found'], 404);
        }

        return response()->json($data);
    }
}
