<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class ProdukPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Produk::query();
        
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
                                    $sub->where('nama_produk', 'like', "%$term%")
                                        ->orWhere('nama_inventor', 'like', "%$term%")
                                        ->orWhere('institusi', 'like', "%$term%")
                                        ->orWhere('bidang', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match($field) {
                                    'title' => 'nama_produk',
                                    'university' => 'institusi',
                                    'researcher' => 'nama_inventor',
                                    'field' => 'bidang',
                                    default => 'nama_produk'
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

        if ($request->filled('bidang')) {
            $baseQuery->where('bidang', $request->bidang);
        }

        if ($request->filled('tkt')) {
            $baseQuery->where('tkt', $request->tkt);
        }

        if ($request->filled('provinsi')) {
            $baseQuery->where('provinsi', $request->provinsi);
        }

        $statsQ = clone $baseQuery;
        $stats = [
            'totalResearch' => (clone $statsQ)->count(),
            'totalUniversities' => (clone $statsQ)->distinct('institusi')->count('institusi'),
            'totalProvinces' => (clone $statsQ)->distinct('provinsi')->count('provinsi'),
            'totalFields' => (clone $statsQ)->distinct('bidang')->count('bidang'),
        ];

        $cacheKey = 'map_data_produk_v6_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            $mapDataArray = [];
            $query = (clone $baseQuery)->select(
                'id',
                'institusi',
                'latitude as pt_latitude',
                'longitude as pt_longitude',
                'provinsi',
                'bidang as bidang_fokus',
                'nama_inventor',
                DB::raw('SUBSTRING(nama_produk, 1, 150) as judul_short')
            )
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');
            
            foreach ($query->cursor() as $item) {
                $mapDataArray[] = [
                    'id' => $item->id,
                    'institusi' => $item->institusi,
                    'pt_latitude' => (float)$item->pt_latitude,
                    'pt_longitude' => (float)$item->pt_longitude,
                    'provinsi' => $item->provinsi,
                    'bidang_fokus' => $item->bidang_fokus,
                    'nama_inventor' => $item->nama_inventor,
                    'judul' => $item->judul_short,
                    'count' => 1,
                ];
            }
            return collect($mapDataArray)->values()->all();
        });

        // Only load list if filtered/searched
        $isFiltered = $request->filled('search') 
            || $request->filled('queries')
            || $request->filled('bidang')
            || $request->filled('tkt')
            || $request->filled('provinsi');

        $items = $isFiltered
            ? (clone $baseQuery)->select('id', 'nama_produk as judul', 'nama_inventor as nama', 'institusi', 'provinsi', 'bidang as bidang_fokus', 'tkt')
                ->latest('id')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        // Get filter options (cached)
        $filterOptions = [
            'bidang' => Cache::remember('filter_produk_bidang', 7200, function() {
                return DB::table('produk')
                    ->select('bidang')
                    ->whereNotNull('bidang')
                    ->distinct()
                    ->orderBy('bidang')
                    ->pluck('bidang')
                    ->filter()
                    ->values();
            }),
            'tkt' => Cache::remember('filter_produk_tkt', 7200, function() {
                return DB::table('produk')
                    ->select('tkt')
                    ->whereNotNull('tkt')
                    ->distinct()
                    ->orderBy('tkt')
                    ->pluck('tkt')
                    ->filter()
                    ->values();
            }),
            'provinsi' => Cache::remember('filter_produk_provinsi', 7200, function() {
                return DB::table('produk')
                    ->select('provinsi')
                    ->whereNotNull('provinsi')
                    ->distinct()
                    ->orderBy('provinsi')
                    ->pluck('provinsi')
                    ->filter()
                    ->values();
            }),
        ];

        return Inertia::render('Produk', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
            'filters' => $request->all(),
            'filterOptions' => $filterOptions,
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Produk'
        ]);
    }
}


