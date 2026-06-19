<?php

namespace App\Modules\FasilitasLab\Services;

use App\Modules\FasilitasLab\Models\FasilitasLab;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class FasilitasLabService
{
    public function getBaseQuery(Request $request)
    {
        $query = FasilitasLab::query();

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $this->applyAdvancedQueries($query, $request);

        if ($request->filled('kampus_ptnbh')) {
            $values = is_array($request->kampus_ptnbh) ? $request->kampus_ptnbh : [$request->kampus_ptnbh];
            $query->whereIn('institusi', $values);
        }

        if ($request->filled('provinsi')) {
            $values = is_array($request->provinsi) ? $request->provinsi : [$request->provinsi];
            $query->whereIn('provinsi', $values);
        }

        return $query;
    }

    public function getIndexData(Request $request): array
    {
        $v = (int) Cache::get('fasilitas_lab_cache_version', 1);
        $baseQuery = $this->getBaseQuery($request);

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
            $aggregatedData = (clone $baseQuery)
                ->select(
                    DB::raw('AVG(latitude) as pt_latitude'),
                    DB::raw('AVG(longitude) as pt_longitude'),
                    DB::raw('COUNT(*) as total_penelitian'),
                    DB::raw('institusi as institusi_name'),
                    DB::raw('MAX(provinsi) as provinsi'),
                    DB::raw('MAX(kode_universitas) as kode_universitas')
                )
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->whereNotNull('institusi')
                ->groupBy('institusi')
                ->having('total_penelitian', '>', 0)
                ->get();

            return $aggregatedData->map(function ($item) {
                return [
                    'institusi'        => $item->institusi_name,
                    'kode_universitas' => $item->kode_universitas,
                    'pt_latitude'      => (float) $item->pt_latitude,
                    'pt_longitude'     => (float) $item->pt_longitude,
                    'provinsi'         => $item->provinsi,
                    'total_penelitian' => (int) $item->total_penelitian,
                    'isFasilitasLab'   => true,
                ];
            })->toArray();
        });

        $isFiltered = $request->filled('search')
            || $request->filled('queries')
            || $request->filled('kampus_ptnbh')
            || $request->filled('provinsi');

        $items = $isFiltered
            ? (clone $baseQuery)->select(
                'id', 'nama_laboratorium as judul', 'institusi', 'kategori_pt', 'provinsi', 'kota', 'nama_alat', 'total_jumlah_alat', 'kontak'
            )
                ->latest('id')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        return [
            'mapData'       => $mapData,
            'researches'    => $items,
            'stats'         => $stats,
            'filters'       => $request->all(),
            'filterOptions' => $this->getFilterOptions(),
            'isFiltered'    => $isFiltered,
            'title'         => 'Peta Persebaran Penelitian BIMA Indonesia - Fasilitas Lab',
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

                        $field    = $row['field']    ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        $applyCondition = function ($subQuery) use ($term, $field) {
                            if ($field === 'all') {
                                $subQuery->where(function ($sub) use ($term) {
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
                                $subQuery->where($dbField, 'like', "%$term%");
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
    }

    private function getFilterOptions()
    {
        return [
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
    }
}
