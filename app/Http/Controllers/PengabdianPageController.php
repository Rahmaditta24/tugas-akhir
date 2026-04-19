<?php

namespace App\Http\Controllers;

use App\Models\Pengabdian;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class PengabdianPageController extends Controller
{
    public function index(Request $request)
    {
        $v = (int) Cache::get('pengabdian_cache_version', 1);
        
        // Default dataType to 'Multitahun, Batch I & II' if not present
        if (!$request->has('dataType') && !$request->has('search') && !$request->has('queries')) {
            $request->merge(['dataType' => 'Multitahun, Batch I & Batch II']);
        }
        
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
        $statsCacheKey = 'stats_pengabdian_v5_' . $v . '_' . md5(json_encode($request->all()));
        $stats = Cache::remember($statsCacheKey, 3600, function() use ($baseQuery) {
            $statsQ = clone $baseQuery;
            return [
                'totalResearch' => (clone $statsQ)->count(),
                'totalUniversities' => (clone $statsQ)->distinct('nama_institusi')->count('nama_institusi'),
                'totalProvinces' => (clone $statsQ)->distinct('prov_pt')->count('prov_pt'),
                'totalFields' => (clone $statsQ)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        });

        $themeSql = Schema::hasColumn('pengabdian', 'bidang_teknologi_inovasi')
            ? 'MAX(COALESCE(bidang_teknologi_inovasi, bidang_fokus, nama_skema)) as sample_theme'
            : 'MAX(COALESCE(bidang_fokus, nama_skema)) as sample_theme';

        $cacheKey = 'map_data_pengabdian_v8_' . $v . '_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery, $themeSql) {
            // PERFORMANCE OPTIMIZATION: Remove GROUP_CONCAT, load details on demand
            // Only return summary data for map pins
            $query = (clone $baseQuery)
                ->select(
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('nama_institusi as institusi_name'),
                    DB::raw('MAX(prov_pt) as provinsi'),
                    DB::raw('COUNT(*) as total_penelitian'),
                    DB::raw('MAX(bidang_fokus) as sample_field'),
                    DB::raw($themeSql),
                    DB::raw('GROUP_CONCAT(DISTINCT nama_skema SEPARATOR "|") as skema_list')
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
                    'bidang_fokus' => $item->sample_field ?? '-',
                    'skema_list' => $item->skema_list ?? '-',
                    // REMOVED: ids, titles, researchers, etc.
                    // Loaded via API when user clicks
                ];

            })->all();
        });

        // Only load list if specifically searched (keyword)
        $isFiltered = $request->filled('search') 
            || $request->filled('queries');
        
        $items = $isFiltered 
            ? (clone $baseQuery)->select(
                    'id', 'judul', 'nama', 'nama_institusi as institusi', 
                    'prov_pt as provinsi', 'nama_skema as bidang_fokus', 
                    'thn_pelaksanaan_kegiatan as tahun', 'nama_pendamping', 
                    'institusi_pendamping', 'bidang_teknologi_inovasi', 
                    'jenis_wilayah_provinsi_mitra', 'prov_mitra'
                )
                ->latest('thn_pelaksanaan_kegiatan')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        // Get filter options (cached)
        $filterOptions = [
            'provinsi' => Cache::remember('global_provinces_list', 86400, function() {
                // Use local data directly - more reliable for production
                $path = storage_path('provinces.json');
                if (file_exists($path)) {
                    $data = json_decode(file_get_contents($path), true);
                    return collect($data)
                        ->map(fn($p) => str()->title($p['name']))
                        ->sort()
                        ->values()
                        ->all();
                }
                return [];
            }),
            'tahun' => Cache::remember('filter_pengabdian_tahun_' . $v, 7200, function() {
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


