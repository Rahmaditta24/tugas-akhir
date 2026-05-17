<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;

use App\Models\Produk;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class ProdukPageController extends Controller
{
    public function index(Request $request)
    {
        $v = (int) Cache::get('produk_cache_version', 1);
        $baseQuery = Produk::query();

        // Menerapkan pencarian sederhana
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        // Menerapkan kueri tingkat lanjut multi baris
        if ($request->filled('queries')) {
            $queries = json_decode($request->queries, true);
            if (is_array($queries)) {
                $baseQuery->where(function ($q) use ($queries) {
                    foreach ($queries as $index => $row) {
                        $term = trim($row['term'] ?? '');
                        if (empty($term))
                            continue;

                        $field = $row['field'] ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        $applyCondition = function ($query) use ($term, $field) {
                            if ($field === 'all') {
                                $query->where(function ($sub) use ($term) {
                                    $sub->where('nama_produk', 'like', "%$term%")
                                        ->orWhere('nama_inventor', 'like', "%$term%")
                                        ->orWhere('institusi', 'like', "%$term%")
                                        ->orWhere('bidang', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match ($field) {
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
                                $q->orWhere(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
                            } elseif ($operator === 'AND NOT') {
                                $q->whereNot(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
                            } else {
                                $q->where(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
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
        $statsCacheKey = 'stats_produk_v' . $v . '_' . md5(json_encode($request->all()));
        $stats = Cache::remember($statsCacheKey, 3600, function () use ($baseQuery) {
            $statsQ = clone $baseQuery;
            return [
                'totalResearch' => (clone $statsQ)->count(),
                'totalUniversities' => (clone $statsQ)->distinct('institusi')->count('institusi'),
                'totalProvinces' => (clone $statsQ)->distinct('provinsi')->count('provinsi'),
                'totalFields' => (clone $statsQ)->distinct('bidang')->count('bidang'),
            ];
        });

        $cacheKey = 'map_data_produk_v' . $v . '_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function () use ($baseQuery) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');
            $aggregatedData = (clone $baseQuery)
                ->select(
                    DB::raw('AVG(latitude) as pt_latitude'),
                    DB::raw('AVG(longitude) as pt_longitude'),
                    DB::raw('COUNT(*) as total_penelitian'),
                    DB::raw('institusi as institusi_name'),
                    DB::raw('MAX(provinsi) as provinsi'),
                    DB::raw('GROUP_CONCAT(COALESCE(bidang, "-") ORDER BY id SEPARATOR "|") as all_fields'),
                    DB::raw('GROUP_CONCAT(CAST(id AS CHAR) ORDER BY id SEPARATOR "|") as all_ids'),
                    DB::raw('GROUP_CONCAT(COALESCE(nama_produk, "-") ORDER BY id SEPARATOR "|") as all_titles'),
                    DB::raw('GROUP_CONCAT(COALESCE(nama_inventor, "-") ORDER BY id SEPARATOR "|") as all_researchers'),
                    DB::raw('GROUP_CONCAT(COALESCE(tkt, "-") ORDER BY id SEPARATOR "|") as all_years') // TKT dialiaskan ke years untuk konsistensi MapContainer
                )
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->whereNotNull('institusi')
                ->groupBy('institusi')
                ->having('total_penelitian', '>', 0)
                ->get();

            return $aggregatedData->map(function ($item) {
                return [
                    'pt_latitude' => (float) $item->pt_latitude,
                    'pt_longitude' => (float) $item->pt_longitude,
                    'total_penelitian' => (int) $item->total_penelitian,
                    'institusi' => $item->institusi_name,
                    'provinsi' => $item->provinsi,
                    'bidang_fokus' => $item->all_fields,
                    'ids' => $item->all_ids,
                    'titles' => $item->all_titles,
                    'all_researchers' => $item->all_researchers,
                    'tahun_list' => $item->all_years, 
                    'tkt_list' => $item->all_years,   
                    'isProduk' => true
                ];
            })->toArray();
        });

        // Hanya muat data list jika terfilter/tersaring
        $isFiltered = $request->filled('search')
            || $request->filled('queries');

        $items = $isFiltered
            ? (clone $baseQuery)->select('id', 'nama_produk as judul', 'nama_inventor as nama', 'institusi', 'provinsi', 'bidang as bidang_fokus', 'tkt')
                ->latest('id')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        // Dapatkan opsi filter (di-cache)
        $filterOptions = [
            'bidang' => Cache::remember('filter_produk_bidang', 7200, function () {
                return DB::table('produk')
                    ->select('bidang')
                    ->whereNotNull('bidang')
                    ->distinct()
                    ->orderBy('bidang')
                    ->pluck('bidang')
                    ->filter()
                    ->values();
            }),
            'tkt' => Cache::remember('filter_produk_tkt', 7200, function () {
                return DB::table('produk')
                    ->select('tkt')
                    ->whereNotNull('tkt')
                    ->distinct()
                    ->orderBy('tkt')
                    ->pluck('tkt')
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


