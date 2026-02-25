<?php

namespace App\Http\Controllers;

use App\Models\Pengabdian;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class PengabdianPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Pengabdian::query();
        
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
                                        ->orWhere('nama', 'like', "%$term%")
                                        ->orWhere('nama_institusi', 'like', "%$term%")
                                        ->orWhere('bidang_fokus', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match($field) {
                                    'title' => 'judul',
                                    'university' => 'nama_institusi',
                                    'researcher' => 'nama',
                                    'field' => 'bidang_fokus',
                                    'skema' => 'nama_skema', // Added skema support
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
                            } else { 
                                $q->where(function($sub) use ($applyCondition) { $applyCondition($sub); });
                            }
                        }
                    }
                });
            }
        }

        // Apply standard filters
        if ($request->filled('dataType')) {
            $val = $request->dataType;
            
            // If "Multitahun, Batch I & II" is selected
            if (stripos($val, 'Multitahun') !== false && stripos($val, 'Batch') !== false) {
                 $baseQuery->where(function($q) {
                     $q->where('batch_type', 'like', '%multitahun%')
                       ->orWhere('batch_type', 'like', '%batch_i%') // matches both batch_i and batch_ii if naive, but let's be specific
                       ->orWhere('batch_type', 'like', '%batch_ii%');
                 });
            } 
            // If "Kosabangsa" is selected
            elseif (stripos($val, 'Kosabangsa') !== false) {
                 $baseQuery->where(function($q) {
                     $q->where('batch_type', 'like', '%Kosabangsa%')
                       ->orWhere('nama_skema', 'like', '%Kosabangsa%');
                 });
            }
        }
        
        if ($request->filled('skema')) {
             $val = $request->skema;
             $baseQuery->where(function($q) use ($val) {
                 $q->where('nama_skema', $val)
                   ->orWhere('nama_singkat_skema', $val);
             });
        }
        
        if ($request->filled('provinsi')) {
             $baseQuery->where('prov_pt', $request->provinsi);
        }

        if ($request->filled('tahun')) {
             $baseQuery->where('thn_pelaksanaan_kegiatan', $request->tahun);
        }

        // Cache statistics
        $statsCacheKey = 'stats_pengabdian_v4_' . md5(json_encode($request->all()));
        $stats = Cache::remember($statsCacheKey, 3600, function() use ($baseQuery) {
            $statsQ = clone $baseQuery;
            return [
                'totalResearch' => (clone $statsQ)->count(),
                'totalUniversities' => (clone $statsQ)->distinct('nama_institusi')->count('nama_institusi'),
                'totalProvinces' => (clone $statsQ)->distinct('prov_pt')->count('prov_pt'),
                'totalFields' => (clone $statsQ)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        });

        $cacheKey = 'map_data_pengabdian_v4_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');
            $query = (clone $baseQuery)

                ->select(
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('nama_institusi as institusi_name'),
                    DB::raw('MAX(prov_pt) as provinsi'),
                    DB::raw('COUNT(*) as total_penelitian'),
                    DB::raw('GROUP_CONCAT(COALESCE(bidang_fokus, nama_skema, "-") SEPARATOR "|") as all_fields'),
                    DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as all_ids'),
                    DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
                    DB::raw('GROUP_CONCAT(COALESCE(nama_skema, "-") SEPARATOR "|") as all_skema'),
                    DB::raw('GROUP_CONCAT(CAST(thn_pelaksanaan_kegiatan AS CHAR) SEPARATOR "|") as all_years'),
                    DB::raw('GROUP_CONCAT(COALESCE(bidang_teknologi_inovasi, "-") SEPARATOR "|") as all_themes'),
                    DB::raw('GROUP_CONCAT(COALESCE(ptn_pts, "-") SEPARATOR "|") as all_pt_types')
                )
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
                ->whereNotNull('nama_institusi')
                ->groupBy('nama_institusi')
                ->having('total_penelitian', '>', 0);

            return $query->get()->map(function($item) {
                return [
                    'institusi' => $item->institusi_name,
                    'pt_latitude' => (float)$item->pt_latitude,
                    'pt_longitude' => (float)$item->pt_longitude,
                    'provinsi' => $item->provinsi,
                    'total_penelitian' => (int)$item->total_penelitian,
                    'bidang_fokus' => $item->all_fields,
                    'ids' => $item->all_ids,
                    'titles' => $item->all_titles,
                    'skema_list' => $item->all_skema,
                    'tahun_list' => $item->all_years,
                    'tema_list' => $item->all_themes,
                    'jenis_pt_list' => $item->all_pt_types,
                ];

            })->all();
        });

        // Only load list if filtered/searched
        $isFiltered = $request->filled('search') 
            || $request->filled('queries')
            || $request->filled('dataType')
            || $request->filled('skema')
            || $request->filled('provinsi')
            || $request->filled('tahun');
        
        $items = $isFiltered 
            ? (clone $baseQuery)->select('id', 'judul', 'nama', 'nama_institusi as institusi', 'prov_pt as provinsi', 'nama_skema as bidang_fokus', 'thn_pelaksanaan_kegiatan as tahun')
                ->latest('thn_pelaksanaan_kegiatan')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        // Get filter options (cached)
        $filterOptions = [
            'provinsi' => Cache::remember('filter_pengabdian_provinsi', 7200, function() {
                return DB::table('pengabdian')
                    ->select('prov_pt')
                    ->whereNotNull('prov_pt')
                    ->distinct()
                    ->orderBy('prov_pt')
                    ->pluck('prov_pt')
                    ->filter()
                    ->values();
            }),
            'tahun' => Cache::remember('filter_pengabdian_tahun', 7200, function() {
                return DB::table('pengabdian')
                    ->select('thn_pelaksanaan_kegiatan')
                    ->whereNotNull('thn_pelaksanaan_kegiatan')
                    ->distinct()
                    ->orderBy('thn_pelaksanaan_kegiatan', 'desc')
                    ->pluck('thn_pelaksanaan_kegiatan')
                    ->filter()
                    ->values();
            }),
        ];

        return Inertia::render('Pengabdian', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
            'filters' => $request->all(),
            'filterOptions' => $filterOptions,
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Pengabdian'
        ]);
    }
}


