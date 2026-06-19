<?php

namespace App\Services;

use App\Models\Hilirisasi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class HilirisasiService
{
    public function getBaseQuery(Request $request)
    {
        $query = Hilirisasi::query();

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $this->applyAdvancedQueries($query, $request);

        if ($request->filled('direktorat')) {
            $query->where('direktorat', $request->direktorat);
        }
        if ($request->filled('skema')) {
            $query->where('skema', $request->skema);
        }
        if ($request->filled('provinsi')) {
            $query->where('provinsi', $request->provinsi);
        }
        if ($request->filled('tahun')) {
            $query->where('tahun', $request->tahun);
        }

        return $query;
    }

    public function getIndexData(Request $request): array
    {
        $v = (int) Cache::get('hilirisasi_cache_version', 1);
        $baseQuery = $this->getBaseQuery($request);

        $statsCacheKey = 'stats_hilirisasi_v' . $v . '_' . md5(json_encode($request->all()));
        $stats = Cache::remember($statsCacheKey, 3600, function () use ($baseQuery) {
            $statsQ = clone $baseQuery;
            return [
                'totalResearch' => (clone $statsQ)->count(),
                'totalUniversities' => (clone $statsQ)->distinct('perguruan_tinggi')->count('perguruan_tinggi'),
                'totalProvinces' => (clone $statsQ)->distinct('provinsi')->count('provinsi'),
                'totalFields' => (clone $statsQ)->distinct('skema')->count('skema'),
            ];
        });

        $cacheKey = 'map_data_hilirisasi_v' . $v . '_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function () use ($baseQuery) {
            $query = (clone $baseQuery)
                ->select(
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('perguruan_tinggi as institusi_name'),
                    DB::raw('MAX(provinsi) as provinsi'),
                    DB::raw('COUNT(*) as total_hilirisasi')
                )
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
                ->whereNotNull('perguruan_tinggi')
                ->groupBy('perguruan_tinggi');

            return $query->get()->map(function ($item) {
                return [
                    'institusi' => $item->institusi_name,
                    'pt_latitude' => (float) $item->pt_latitude,
                    'pt_longitude' => (float) $item->pt_longitude,
                    'provinsi' => $item->provinsi,
                    'total_hilirisasi' => (int) $item->total_hilirisasi,
                ];
            })->toArray();
        });

        $isFiltered = $request->filled('search') || $request->filled('queries');

        $items = $isFiltered
            ? (clone $baseQuery)->select('id', 'judul', 'nama_pengusul as nama', 'perguruan_tinggi as institusi', 'provinsi', 'skema as bidang_fokus', 'tahun')
                ->latest('tahun')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        return [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
            'filters' => $request->all(),
            'filterOptions' => $this->getFilterOptions(),
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Hilirisasi'
        ];
    }

    private function applyAdvancedQueries($query, Request $request)
    {
        if ($request->filled('queries')) {
            $queries = json_decode($request->queries, true);
            if (is_array($queries)) {
                $query->where(function ($q) use ($queries) {
                    foreach ($queries as $index => $row) {
                        $term = trim($row['term'] ?? '');
                        if (empty($term)) continue;

                        $field = $row['field'] ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        $applyCondition = function ($subQuery) use ($term, $field) {
                            if ($field === 'all') {
                                $subQuery->where(function ($sub) use ($term) {
                                    $sub->where('judul', 'like', "%$term%")
                                        ->orWhere('nama_pengusul', 'like', "%$term%")
                                        ->orWhere('perguruan_tinggi', 'like', "%$term%")
                                        ->orWhere('skema', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match ($field) {
                                    'title' => 'judul',
                                    'university' => 'perguruan_tinggi',
                                    'researcher' => 'nama_pengusul',
                                    'directorate' => 'direktorat',
                                    'skema' => 'skema',
                                    default => 'judul'
                                };
                                $subQuery->where($dbField, 'like', "%$term%");
                            }
                        };

                        if ($index === 0) {
                            $applyCondition($q);
                        } else {
                            if ($operator === 'OR') {
                                $q->orWhere(function ($sub) use ($applyCondition) { $applyCondition($sub); });
                            } elseif ($operator === 'AND NOT') {
                                $q->whereNot(function ($sub) use ($applyCondition) { $applyCondition($sub); });
                            } else {
                                $q->where(function ($sub) use ($applyCondition) { $applyCondition($sub); });
                            }
                        }
                    }
                });
            }
        }
    }

    private function getFilterOptions()
    {
        return [
            'direktorat' => Cache::remember('filter_hilirisasi_direktorat', 7200, function () {
                return DB::table('hilirisasi')->select('direktorat')->whereNotNull('direktorat')->distinct()->orderBy('direktorat')->pluck('direktorat')->filter()->values();
            }),
            'skema' => Cache::remember('filter_hilirisasi_skema', 7200, function () {
                return DB::table('hilirisasi')->select('skema')->whereNotNull('skema')->distinct()->orderBy('skema')->pluck('skema')->filter()->values();
            }),
            'provinsi' => Cache::remember('global_provinces_final_v1', 86400, function () {
                $path = database_path('data/provinces.json');
                if (file_exists($path)) {
                    $data = json_decode(file_get_contents($path), true);
                    return collect($data)->map(fn($p) => trim($p['name']))->unique()->sort()->values()->all();
                }
                return [];
            }),
            'tahun' => Cache::remember('filter_hilirisasi_tahun', 7200, function () {
                return DB::table('hilirisasi')->select('tahun')->whereNotNull('tahun')->distinct()->orderBy('tahun', 'desc')->pluck('tahun')->filter()->values();
            }),
        ];
    }
}
