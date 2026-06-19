<?php

namespace App\Services;

use App\Models\Pengabdian;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;

class PengabdianService
{
    public function getIndexData(Request $request): array
    {
        $v = (int) Cache::get('pengabdian_cache_version', 1);

    public function getBaseQuery(Request $request)
    {
        $dataTypeEffective = $request->input('dataType');
        if (!$request->has('dataType') && !$request->has('search') && !$request->has('queries')) {
            $dataTypeEffective = 'Multitahun, Batch I & Batch II';
        }

        $query = Pengabdian::query();

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $this->applyAdvancedQueries($query, $request);

        if (!empty($dataTypeEffective)) {
            $val = $dataTypeEffective;
            if (stripos($val, 'Multitahun') !== false && stripos($val, 'Batch') !== false) {
                $query->where(function ($q) {
                    $q->where('batch_type', 'like', '%multitahun%')
                        ->orWhere('batch_type', 'like', '%batch_i%')
                        ->orWhere('batch_type', 'like', '%batch_ii%');
                });
            } elseif (stripos($val, 'Kosabangsa') !== false) {
                $query->where(function ($q) {
                    $q->where('batch_type', 'like', '%Kosabangsa%')
                        ->orWhere('nama_skema', 'like', '%Kosabangsa%');
                });
            }
        }

        if ($request->filled('skema')) {
            $skemaValues = (array) $request->skema;
            $query->where(function ($q) use ($skemaValues) {
                $q->whereIn('nama_skema', $skemaValues)
                  ->orWhereIn('nama_singkat_skema', $skemaValues);
            });
        }

        if ($request->filled('provinsi')) {
            $query->whereIn('prov_pt', (array) $request->provinsi);
        }

        if ($request->filled('tahun')) {
            $tahunValues = array_map('intval', (array) $request->tahun);
            $query->whereIn('thn_pelaksanaan_kegiatan', $tahunValues);
        }

        return $query;
    }

    public function getIndexData(Request $request): array
    {
        $v = (int) Cache::get('pengabdian_cache_version', 1);
        $baseQuery = $this->getBaseQuery($request);

        $statsCacheKey = 'stats_pengabdian_v5_' . $v . '_' . md5(json_encode($request->all()));
        $stats = Cache::remember($statsCacheKey, 3600, function () use ($baseQuery) {
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

        $cacheKey = 'map_data_pengabdian_v9_' . $v . '_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function () use ($baseQuery) {
            $query = (clone $baseQuery)
                ->select(
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('nama_institusi as institusi_name'),
                    DB::raw('MAX(prov_pt) as provinsi'),
                    DB::raw('COUNT(*) as total_penelitian')
                )
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
                ->whereNotNull('nama_institusi')
                ->groupBy('nama_institusi')
                ->having('total_penelitian', '>', 0);

            return $query->get()->map(function ($item) {
                return [
                    'institusi' => $item->institusi_name,
                    'pt_latitude' => (float) $item->pt_latitude,
                    'pt_longitude' => (float) $item->pt_longitude,
                    'provinsi' => $item->provinsi,
                    'total_pengabdian' => (int) $item->total_penelitian,
                ];
            })->toArray();
        });

        $isFiltered = $request->filled('search') || $request->filled('queries');

        $items = $isFiltered
            ? (clone $baseQuery)->select(
                'id', 'judul', 'nama', 'nama_institusi as institusi', 'prov_pt as provinsi',
                'nama_skema as bidang_fokus', 'thn_pelaksanaan_kegiatan as tahun', 'nama_pendamping',
                'institusi_pendamping', 'bidang_teknologi_inovasi', 'jenis_wilayah_provinsi_mitra', 'prov_mitra'
            )
                ->latest('thn_pelaksanaan_kegiatan')
                ->limit(50)
                ->get()
                ->values()
            : collect()->values();

        return [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
            'filters' => $request->all(),
            'filterOptions' => $this->getFilterOptions($v),
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Pengabdian'
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
                                        ->orWhere('nama', 'like', "%$term%")
                                        ->orWhere('nama_institusi', 'like', "%$term%")
                                        ->orWhere('bidang_fokus', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match ($field) {
                                    'title' => 'judul',
                                    'university' => 'nama_institusi',
                                    'researcher' => 'nama',
                                    'field' => 'bidang_fokus',
                                    'skema' => 'nama_skema',
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
        }
    }

    private function getFilterOptions($v)
    {
        return [
            'provinsi' => Cache::remember('global_provinces_final_v1', 86400, function () {
                $path = database_path('data/provinces.json');
                if (file_exists($path)) {
                    $data = json_decode(file_get_contents($path), true);
                    return collect($data)->map(fn($p) => trim($p['name']))->unique()->sort()->values()->all();
                }
                return [];
            }),
            'tahun' => Cache::remember('filter_pengabdian_tahun_' . $v, 7200, function () {
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
    }
}
