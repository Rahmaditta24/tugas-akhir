<?php

namespace App\Services;

use App\Models\Penelitian;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class PenelitianService
{
    /**
     * Build the base query for Penelitian based on request filters
     */
    public function getBaseQuery(Request $request)
    {
        $query = Penelitian::whereNotNull('judul')->where('judul', '!=', '');

        $filters = ['bidang_fokus', 'tema_prioritas', 'kategori_pt', 'klaster', 'provinsi', 'tahun', 'skema'];
        foreach ($filters as $filter) {
            if ($request->filled($filter)) {
                $column = $filter === 'tahun' ? 'thn_pelaksanaan' : $filter;
                $query->whereIn($column, (array) $request->$filter);
            }
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('queries')) {
            $this->applyAdvancedQueries($query, json_decode($request->queries, true));
        }

        return $query;
    }

    /**
     * Apply advanced multi-row queries
     */
    protected function applyAdvancedQueries($query, $queries)
    {
        if (!is_array($queries)) return;

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
                                ->orWhere('nama', 'like', "%$term%")
                                ->orWhere('institusi', 'like', "%$term%")
                                ->orWhere('bidang_fokus', 'like', "%$term%");
                        });
                    } else {
                        $dbField = match ($field) {
                            'title' => 'judul',
                            'university' => 'institusi',
                            'researcher' => 'nama',
                            'field' => 'bidang_fokus',
                            'priorityTheme' => 'tema_prioritas',
                            'category' => 'kategori_pt',
                            'cluster' => 'klaster',
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

    /**
     * Get statistics for Penelitian
     */
    public function getStats($baseQuery, Request $request)
    {
        $v = (int) Cache::get('penelitian_cache_version', 2);
        $cacheKey = 'stats_penelitian_v' . $v . '_' . md5(json_encode($request->all()));

        return Cache::remember($cacheKey, 3600, function () use ($baseQuery) {
            return [
                'totalResearch' => (clone $baseQuery)->count(),
                'totalUniversities' => (clone $baseQuery)->distinct('institusi')->count('institusi'),
                'totalProvinces' => (clone $baseQuery)->distinct('provinsi')->count('provinsi'),
                'totalFields' => (clone $baseQuery)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        });
    }

    /**
     * Get Map Data (Aggregated by institution)
     */
    public function getMapData($baseQuery, Request $request)
    {
        $v = (int) Cache::get('penelitian_cache_version', 2);
        $cacheKey = 'map_data_cache_v' . $v . '_' . md5(json_encode($request->all()));

        return Cache::remember($cacheKey, 300, function () use ($baseQuery) {
            DB::statement('SET SESSION group_concat_max_len = 100000');
            $aggregatedData = (clone $baseQuery)
                ->select(
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('COUNT(*) as total_penelitian'),
                    DB::raw('institusi as institusi_name'),
                    DB::raw('MAX(provinsi) as provinsi'),
                    DB::raw('GROUP_CONCAT(COALESCE(bidang_fokus, "-") SEPARATOR "|") as all_fields')
                )
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
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
                ];
            })->toArray();
        });
    }

    /**
     * Get Filter Options
     */
    public function getFilterOptions()
    {
        $getDistinct = function($column) {
            return DB::table('penelitian')
                ->select($column)
                ->whereNotNull($column)
                ->distinct()
                ->orderBy($column)
                ->pluck($column)
                ->filter()
                ->values();
        };

        return [
            'bidangFokus' => Cache::remember('filter_bidang_fokus', 7200, fn() => $getDistinct('bidang_fokus')),
            'temaPrioritas' => Cache::remember('filter_tema_prioritas', 7200, fn() => $getDistinct('tema_prioritas')),
            'kategoriPT' => Cache::remember('filter_kategori_pt', 7200, fn() => $getDistinct('kategori_pt')),
            'klaster' => Cache::remember('filter_klaster', 7200, fn() => $getDistinct('klaster')),
            'tahun' => Cache::remember('filter_tahun', 7200, function () {
                return DB::table('penelitian')
                    ->select('thn_pelaksanaan')
                    ->whereNotNull('thn_pelaksanaan')
                    ->distinct()
                    ->orderBy('thn_pelaksanaan', 'desc')
                    ->pluck('thn_pelaksanaan')
                    ->filter()
                    ->values();
            }),
            'skema' => Cache::remember('filter_skema', 7200, fn() => $getDistinct('skema')),
            'provinsi' => $this->getProvinces(),
        ];
    }

    protected function getProvinces()
    {
        return Cache::remember('global_provinces_final_v1', 86400, function () {
            $path = database_path('data/provinces.json');
            if (file_exists($path)) {
                $data = json_decode(file_get_contents($path), true);
                return collect($data)->map(fn($p) => trim($p['name']))->unique()->sort()->values()->all();
            }

            if (app()->environment('local')) {
                try {
                    $response = Http::timeout(10)->retry(2, 1000)->withOptions([
                        'allow_redirects' => false
                    ])->get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
                    
                    if ($response->successful()) {
                        return collect($response->json())->map(fn($p) => \Illuminate\Support\Str::title($p['name']))->sort()->values()->all();
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to fetch provinces', ['error' => $e->getMessage()]);
                }
            }
            return [];
        });
    }

    /**
     * Get paginated/limited list of researches
     */
    public function getResearchesList($baseQuery, Request $request)
    {
        $isFiltered = $request->filled('search') || $request->filled('queries');

        if (!$isFiltered) {
            return collect()->values();
        }

        return (clone $baseQuery)->select(
                'id', 'nama', 'institusi', 'judul', 'bidang_fokus', 
                'tema_prioritas', 'thn_pelaksanaan', 'skema', 'provinsi'
            )
            ->limit(50)
            ->get()
            ->values();
    }
}
