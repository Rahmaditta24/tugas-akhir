<?php

namespace App\Services;

use App\Models\Penelitian;
use App\Models\Pengabdian;
use App\Models\Hilirisasi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class PermasalahanService
{
    protected array $keywordsMap = [
        'Sampah' => ['sampah', 'limbah', 'waste', 'recycle', 'daur ulang', 'plastic', 'plastik', 'pencemaran', 'polusi', 'lingkungan', 'ekosistem', 'sanitasi', 'kehutanan', 'konservasi', 'sungai', 'laut', 'residu', 'biomassa', 'waste-to-energy', 'tPA', 'pengelolaan sampah', 'sampah kota'],
        'Stunting' => ['stunting', 'tengkes', 'kerdil', 'gizi', 'pendek', 'balita', 'bayi', 'anak', 'ibu hamil', 'puskesmas', 'posyandu', 'pertumbuhan', 'perkembangan', 'nutrisi', 'malnutrisi', 'pangan bergizi', 'pola makan', 'asupan gizi'],
        'Gizi Buruk' => ['gizi buruk', 'malnutrisi', 'nutrisi', 'stunting', 'kurus', 'vitamin', 'protein', 'karbo', 'lemak', 'kesehatan', 'medis', 'klinis', 'asupan', 'pola makan', 'gizi seimbang', 'beban ganda malnutrisi'],
        'Krisis Listrik' => ['listrik', 'energi', 'saidi', 'saifi', 'power', 'pembangkit', 'pln', 'panel', 'solar', 'baterai', 'tegangan', 'arus', 'mikrohidro', 'angin', 'elektro', 'otomatisasi', 'smart grid', 'elektrifikasi', 'energi terbarukan', 'transisi energi', 'panel surya', 'biofuel'],
        'Ketahanan Pangan' => ['pangan', 'makanan', 'food', 'beras', 'pertanian', 'pasokan pangan', 'padi', 'jagung', 'kedelai', 'ternak', 'ikan', 'panen', 'pupuk', 'hama', 'sawah', 'irigasi', 'tani', 'swasembada', 'benih', 'bioteknologi pangan', 'smart farming', 'diversifikasi pangan', 'produksi pangan'],
    ];

    public function getIndexData(Request $request): array
    {
        $bubbleType = $request->input('bubbleType', 'Penelitian');
        $dataType = $request->input('dataType', 'Sampah');
        $viewMode = $request->input('viewMode', 'provinsi');

        $isFiltered = $request->filled('search') || $request->filled('queries') || $request->filled('bidang_fokus') || $request->filled('tema_prioritas') || $request->filled('provinsi') || $request->filled('tahun') || $request->filled('kategori_pt') || $request->filled('klaster') || $request->filled('skema') || $request->filled('direktorat');

        $filterHash = md5(json_encode($request->all()));
        $mapFilterHash = md5(json_encode($request->only(['bidang_fokus', 'tema_prioritas', 'provinsi', 'tahun', 'kategori_pt', 'klaster', 'skema', 'direktorat', 'batch_type'])));

        $mapQuery = $this->buildMapQuery($request, $bubbleType);
        $query = clone $mapQuery;
        
        $this->applyKeywordFilter($query, $dataType);
        
        if ($request->filled('search')) $query->search($request->search);
        $this->applyAdvancedQueries($query, $request, $bubbleType);

        $statsQuery = clone $mapQuery;
        $researches = (clone $query)->orderByDesc($bubbleType === 'Hilirisasi' ? 'tahun' : ($bubbleType === 'Pengabdian' ? 'thn_pelaksanaan_kegiatan' : 'thn_pelaksanaan'))->limit(50)->get();

        $v = (int) Cache::get('permasalahan_cache_version', 1);
        $mapCacheKey = "permasalahan_map_" . strtolower($bubbleType) . "_v{$v}_{$mapFilterHash}";
        
        $mapData = Cache::remember($mapCacheKey, 3600, function () use ($mapQuery, $bubbleType) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');
            $groupCol = $bubbleType === 'Hilirisasi' ? 'perguruan_tinggi' : ($bubbleType === 'Pengabdian' ? 'nama_institusi' : 'institusi');
            
            return (clone $mapQuery)->select(
                DB::raw('AVG(pt_latitude) as pt_latitude'),
                DB::raw('AVG(pt_longitude) as pt_longitude'),
                DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as ids')
            )
            ->whereNotNull('pt_latitude')
            ->whereNotNull('pt_longitude')
            ->whereNotNull($groupCol)
            ->groupBy($groupCol)
            ->get()
            ->toArray();
        });

        $stats = $this->getStats($statsQuery, $bubbleType, $mapFilterHash);
        
        $jsonStats = $this->getJsonStats();

        return [
            'mapData' => $mapData,
            'totalMapMarkers' => (clone $mapQuery)->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
            'permasalahanStats' => $jsonStats['provinsi'],
            'permasalahanKabupatenStats' => $jsonStats['kabupaten'],
            'jenisPermasalahan' => array_keys($jsonStats['provinsi']),
            'researches' => $researches,
            'stats' => $stats,
            'allFilterOptions' => $this->getAllFilterOptions(),
            'filters' => $request->all(),
            'isFiltered' => $isFiltered,
        ];
    }

    protected function buildMapQuery(Request $request, string $bubbleType)
    {
        if ($bubbleType === 'Pengabdian') {
            $mapQuery = Pengabdian::query();
            if ($request->filled('batch_type')) {
                $val = $request->batch_type;
                if (stripos($val, 'Multitahun') !== false && stripos($val, 'Batch') !== false) {
                    $mapQuery->where('batch_type', 'like', '%batch%')->where('batch_type', 'not like', '%kosabangsa%');
                } elseif (stripos($val, 'Kosabangsa') !== false) {
                    $mapQuery->where(function ($q) {
                        $q->where('batch_type', 'like', '%Kosabangsa%')->orWhere('nama_skema', 'like', '%Kosabangsa%');
                    });
                }
            }
            if ($request->filled('bidang_fokus')) $mapQuery->whereIn('bidang_fokus', (array) $request->bidang_fokus);
            if ($request->filled('provinsi')) $mapQuery->whereIn('prov_pt', (array) $request->provinsi);
            if ($request->filled('tahun')) $mapQuery->whereIn('thn_pelaksanaan_kegiatan', (array) $request->tahun);
            if ($request->filled('skema')) $mapQuery->whereIn('nama_skema', (array) $request->skema);
            return $mapQuery;
        }

        if ($bubbleType === 'Hilirisasi') {
            $mapQuery = Hilirisasi::query();
            if ($request->filled('provinsi')) $mapQuery->whereIn('provinsi', (array) $request->provinsi);
            if ($request->filled('tahun')) $mapQuery->whereIn('tahun', (array) $request->tahun);
            if ($request->filled('skema')) $mapQuery->whereIn('skema', (array) $request->skema);
            if ($request->filled('direktorat')) $mapQuery->whereIn('direktorat', (array) $request->direktorat);
            return $mapQuery;
        }

        $mapQuery = Penelitian::query()->whereNotNull('judul')->where('judul', '!=', '');
        if ($request->filled('bidang_fokus')) $mapQuery->whereIn('bidang_fokus', (array) $request->bidang_fokus);
        if ($request->filled('tema_prioritas')) $mapQuery->whereIn('tema_prioritas', (array) $request->tema_prioritas);
        if ($request->filled('provinsi')) $mapQuery->whereIn('provinsi', (array) $request->provinsi);
        if ($request->filled('tahun')) $mapQuery->whereIn('thn_pelaksanaan', (array) $request->tahun);
        if ($request->filled('kategori_pt')) $mapQuery->whereIn('kategori_pt', (array) $request->kategori_pt);
        if ($request->filled('klaster')) $mapQuery->whereIn('klaster', (array) $request->klaster);
        return $mapQuery;
    }

    protected function applyKeywordFilter($query, string $dataType)
    {
        $query->where(function ($q) use ($dataType) {
            $regex = isset($this->keywordsMap[$dataType]) ? implode('|', array_map('preg_quote', $this->keywordsMap[$dataType])) : preg_quote($dataType);
            $q->whereRaw("judul REGEXP ?", [$regex]);
        });
    }

    protected function getStats($statsQuery, string $bubbleType, string $mapFilterHash): array
    {
        return Cache::remember("perm_stats_{$bubbleType}_{$mapFilterHash}", 3600, function () use ($statsQuery, $bubbleType) {
            if ($bubbleType === 'Hilirisasi') {
                return ['totalResearch' => (clone $statsQuery)->count(), 'totalUniversities' => (clone $statsQuery)->distinct('perguruan_tinggi')->count('perguruan_tinggi'), 'totalProvinces' => (clone $statsQuery)->distinct('provinsi')->count('provinsi'), 'totalFields' => 0];
            }
            if ($bubbleType === 'Pengabdian') {
                return ['totalResearch' => (clone $statsQuery)->count(), 'totalUniversities' => (clone $statsQuery)->distinct('nama_institusi')->count('nama_institusi'), 'totalProvinces' => (clone $statsQuery)->distinct('prov_pt')->count('prov_pt'), 'totalFields' => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus')];
            }
            return ['totalResearch' => (clone $statsQuery)->count(), 'totalUniversities' => (clone $statsQuery)->distinct('institusi')->count('institusi'), 'totalProvinces' => (clone $statsQuery)->distinct('provinsi')->count('provinsi'), 'totalFields' => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus')];
        });
    }

    protected function getJsonStats(): array
    {
        $jsonDir = database_path('data/');
        $filesMap = [
            'Sampah' => 'data-permasalahan-sampah.json',
            'Stunting' => 'data-permasalahan-stunting.json',
            'Gizi Buruk' => 'data-permasalahan-gizi-buruk.json',
            'Krisis Listrik' => 'data-permasalahan-krisis-listrik.json',
            'Ketahanan Pangan' => 'data-permasalahan-ketahanan-pangan.json'
        ];

        $provinsiStats = Cache::remember('permasalahan_json_provinsi_stats_v9', 86400, function () use ($jsonDir, $filesMap) {
            $result = [];
            foreach ($filesMap as $label => $filename) {
                $path = $jsonDir . $filename;
                if (!file_exists($path)) continue;
                $data = json_decode(file_get_contents($path), true);
                $list = $data['Provinsi'] ?? $data['Sheet1'] ?? [];
                $labelData = [];
                foreach ($list as $item) {
                    $metrics = ($label === 'Krisis Listrik') ? ['saidi' => 'SAIDI (Jam/Pelanggan)', 'saifi' => 'SAIFI (Kali/Pelanggan)'] : [strtolower($label) => match ($label) { 'Sampah' => 'Timbulan Sampah Tahunan(ton)', 'Stunting', 'Gizi Buruk' => 'Persentase', 'Ketahanan Pangan' => 'IKP', default => 'Persentase'}];
                    foreach ($metrics as $metrikId => $valKey) {
                        $value = 0;
                        foreach ($item as $k => $v) {
                            if (trim($k) === $valKey) {
                                $value = $v;
                                break;
                            }
                        }
                        $labelData[] = ['provinsi' => $item['Provinsi'] ?? '-', 'nilai' => (float) $value, 'satuan' => match ($label) { 'Sampah' => 'ton', 'Stunting', 'Gizi Buruk' => '%', 'Krisis Listrik' => (stripos($valKey, 'SAIDI') !== false ? 'Jam/Pelanggan' : 'Kali/Pelanggan'), 'Ketahanan Pangan' => 'Indeks', default => ''}, 'metrik' => $metrikId, 'tahun' => 2024];
                    }
                }
                $result[$label] = $labelData;
            }
            return $result;
        });

        $kabupatenStats = Cache::remember('permasalahan_json_kabupaten_stats_v9', 86400, function () use ($jsonDir, $filesMap) {
            $result = [];
            foreach ($filesMap as $label => $filename) {
                $path = $jsonDir . $filename;
                if (!file_exists($path)) continue;
                $data = json_decode(file_get_contents($path), true);
                if (!isset($data['Kabupaten'])) continue;
                $labelData = [];
                foreach ($data['Kabupaten'] as $item) {
                    $metrics = ($label === 'Krisis Listrik') ? ['saidi' => 'SAIDI (Jam/Pelanggan)', 'saifi' => 'SAIFI (Kali/Pelanggan)'] : [strtolower($label) => match ($label) { 'Sampah' => 'Timbulan Sampah Tahunan(ton)', 'Stunting', 'Gizi Buruk' => 'Persentase', 'Ketahanan Pangan' => 'IKP', default => 'Persentase'}];
                    foreach ($metrics as $metrikId => $valKey) {
                        $value = 0;
                        foreach ($item as $k => $v) {
                            if (trim($k) === $valKey) {
                                $value = $v;
                                break;
                            }
                        }
                        $labelData[] = ['kabupaten_kota' => $item['Kabupaten/Kota'] ?? '-', 'provinsi' => $item['Provinsi'] ?? '-', 'nilai' => (float) $value, 'satuan' => match ($label) { 'Sampah' => 'ton', 'Stunting', 'Gizi Buruk' => '%', 'Krisis Listrik' => (stripos($valKey, 'SAIDI') !== false ? 'Jam/Pelanggan' : 'Kali/Pelanggan'), 'Ketahanan Pangan' => 'Indeks', default => ''}, 'metrik' => $metrikId, 'tahun' => 2024];
                    }
                }
                $result[$label] = $labelData;
            }
            return $result;
        });

        return ['provinsi' => $provinsiStats, 'kabupaten' => $kabupatenStats];
    }

    protected function getAllFilterOptions(): array
    {
        return [
            'Penelitian' => [
                'bidangFokus'   => Cache::remember('filter_bidang_fokus', 7200, fn() => DB::table('penelitian')->select('bidang_fokus')->whereNotNull('bidang_fokus')->distinct()->orderBy('bidang_fokus')->pluck('bidang_fokus')->filter()->values()),
                'temaPrioritas' => Cache::remember('filter_tema_prioritas', 7200, fn() => DB::table('penelitian')->select('tema_prioritas')->whereNotNull('tema_prioritas')->distinct()->orderBy('tema_prioritas')->pluck('tema_prioritas')->filter()->values()),
                'kategoriPT'    => Cache::remember('filter_kategori_pt', 7200, fn() => DB::table('penelitian')->select('kategori_pt')->whereNotNull('kategori_pt')->distinct()->orderBy('kategori_pt')->pluck('kategori_pt')->filter()->values()),
                'klaster'       => Cache::remember('filter_klaster', 7200, fn() => DB::table('penelitian')->select('klaster')->whereNotNull('klaster')->distinct()->orderBy('klaster')->pluck('klaster')->filter()->values()),
                'provinsi'      => Cache::remember('filter_provinsi', 7200, fn() => DB::table('penelitian')->select('provinsi')->whereNotNull('provinsi')->distinct()->orderBy('provinsi')->pluck('provinsi')->filter()->values()),
                'tahun'         => Cache::remember('filter_tahun', 7200, fn() => DB::table('penelitian')->select('thn_pelaksanaan')->whereNotNull('thn_pelaksanaan')->distinct()->orderBy('thn_pelaksanaan', 'desc')->pluck('thn_pelaksanaan')->filter()->values()),
            ],
            'Pengabdian' => [
                'bidangFokus' => Cache::remember('filter_pengabdian_bidang_fokus', 7200, fn() => DB::table('pengabdian')->select('bidang_fokus')->whereNotNull('bidang_fokus')->distinct()->orderBy('bidang_fokus')->pluck('bidang_fokus')->filter()->values()),
                'skema'       => Cache::remember('filter_pengabdian_skema', 7200, fn() => DB::table('pengabdian')->select('nama_skema')->whereNotNull('nama_skema')->distinct()->orderBy('nama_skema')->pluck('nama_skema')->filter()->values()),
                'provinsi'    => Cache::remember('filter_pengabdian_provinsi', 7200, fn() => DB::table('pengabdian')->select('prov_pt')->whereNotNull('prov_pt')->distinct()->orderBy('prov_pt')->pluck('prov_pt')->filter()->values()),
                'tahun'       => Cache::remember('filter_pengabdian_tahun', 7200, fn() => DB::table('pengabdian')->select('thn_pelaksanaan_kegiatan')->whereNotNull('thn_pelaksanaan_kegiatan')->distinct()->orderBy('thn_pelaksanaan_kegiatan', 'desc')->pluck('thn_pelaksanaan_kegiatan')->filter()->values()),
                'batchType'   => ['Multitahun, Batch I & Batch II', 'Kosabangsa'],
            ],
            'Hilirisasi' => [
                'direktorat' => Cache::remember('filter_hilirisasi_direktorat', 7200, fn() => DB::table('hilirisasi')->select('direktorat')->whereNotNull('direktorat')->distinct()->orderBy('direktorat')->pluck('direktorat')->filter()->values()),
                'skema'      => Cache::remember('filter_hilirisasi_skema', 7200, fn() => DB::table('hilirisasi')->select('skema')->whereNotNull('skema')->distinct()->orderBy('skema')->pluck('skema')->filter()->values()),
                'provinsi'   => Cache::remember('filter_hilirisasi_provinsi', 7200, fn() => DB::table('hilirisasi')->select('provinsi')->whereNotNull('provinsi')->distinct()->orderBy('provinsi')->pluck('provinsi')->filter()->values()),
                'tahun'      => Cache::remember('filter_hilirisasi_tahun', 7200, fn() => DB::table('hilirisasi')->select('tahun')->whereNotNull('tahun')->distinct()->orderBy('tahun', 'desc')->pluck('tahun')->filter()->values()),
            ]
        ];
    }

    public function lazyLoadMarkers(Request $request): array
    {
        $bubbleType = $request->input('bubbleType', 'Penelitian');
        $offset = $request->input('offset', 5000);
        $limit = $request->input('limit', 5000);

        $query = $this->buildMapQuery($request, $bubbleType);
        $this->applyAdvancedQueries($query, $request, $bubbleType);

        $totalCount = (clone $query)->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count();

        if ($bubbleType === 'Pengabdian') {
            $markers = $query->select('id', 'judul', 'nama', 'nama_institusi as institusi', 'prov_pt as provinsi', 'kab_pt as kabupaten_kota', 'pt_latitude', 'pt_longitude', 'bidang_fokus', 'thn_pelaksanaan_kegiatan as tahun', 'nama_skema as skema');
        } elseif ($bubbleType === 'Hilirisasi') {
            $markers = $query->select('id', 'judul', 'nama_pengusul as nama', 'perguruan_tinggi as institusi', 'provinsi', DB::raw("NULL as kabupaten_kota"), 'pt_latitude', 'pt_longitude', 'skema', 'tahun', 'mitra', 'luaran');
        } else {
            $markers = $query->select('id', 'judul', 'nama', 'institusi', 'provinsi', 'kota as kabupaten_kota', 'pt_latitude', 'pt_longitude', 'bidang_fokus', 'thn_pelaksanaan as tahun', 'skema');
        }

        $results = $markers->whereNotNull('pt_latitude')
            ->whereNotNull('pt_longitude')
            ->offset($offset)
            ->limit($limit)
            ->get();

        return [
            'markers' => $results,
            'hasMore' => ($offset + $results->count()) < $totalCount,
            'total' => $totalCount
        ];
    }

    private function applyAdvancedQueries($query, $request, $modelType = 'Penelitian')
    {
        if ($request->filled('queries')) {
            $queries = is_array($request->queries) ? $request->queries : json_decode($request->queries, true);
            if (is_array($queries)) {
                $query->where(function ($q) use ($queries, $modelType) {
                    foreach ($queries as $index => $row) {
                        $term = trim($row['term'] ?? '');
                        if (empty($term)) continue;

                        $field = $row['field'] ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        $applyCondition = function ($query) use ($term, $field, $modelType) {
                            if ($field === 'all') {
                                $query->where(function ($sub) use ($term, $modelType) {
                                    $sub->where('judul', 'like', "%$term%");
                                    if ($modelType === 'Hilirisasi') {
                                        $sub->orWhere('nama_pengusul', 'like', "%$term%")
                                            ->orWhere('perguruan_tinggi', 'like', "%$term%");
                                    } else {
                                        $sub->orWhere('nama', 'like', "%$term%")
                                            ->orWhere(DB::raw($modelType === 'Pengabdian' ? 'nama_institusi' : 'institusi'), 'like', "%$term%");
                                    }
                                });
                            } else {
                                $dbField = match ($field) {
                                    'title' => 'judul',
                                    'university' => match ($modelType) {
                                        'Hilirisasi' => 'perguruan_tinggi',
                                        'Pengabdian' => 'nama_institusi',
                                        default => 'institusi'
                                    },
                                    'researcher' => match ($modelType) {
                                        'Hilirisasi' => 'nama_pengusul',
                                        default => 'nama'
                                    },
                                    'field' => match ($modelType) {
                                        'Hilirisasi' => 'skema',
                                        'Pengabdian' => 'bidang_fokus',
                                        default => 'bidang_fokus'
                                    },
                                    default => 'judul'
                                };
                                $query->where($dbField, 'like', "%$term%");
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
}
