<?php

namespace App\Http\Controllers;

use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use App\Models\Penelitian;
use App\Models\Pengabdian;
use App\Models\Hilirisasi;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class PermasalahanPageController extends Controller
{
    public function index(Request $request)
    {
        $bubbleType = $request->input('bubbleType', 'Penelitian');
        $dataType = $request->input('dataType', 'Sampah');
        $viewMode = $request->input('viewMode', 'provinsi');
        
        $isFiltered = $request->filled('search') || $request->filled('queries') || $request->filled('bidang_fokus') || $request->filled('tema_prioritas') || $request->filled('provinsi') || $request->filled('tahun') || $request->filled('kategori_pt') || $request->filled('klaster') || $request->filled('skema') || $request->filled('direktorat');

        $keywordsMap = [
            'Sampah' => ['sampah', 'limbah', 'waste', 'recycle', 'daur ulang', 'plastic', 'plastik', 'pencemaran', 'polusi', 'lingkungan', 'ekosistem', 'sanitasi', 'kehutanan', 'konservasi', 'sungai', 'laut', 'residu', 'biomassa', 'waste-to-energy', 'tPA', 'pengelolaan sampah', 'sampah kota'],
            'Stunting' => ['stunting', 'tengkes', 'kerdil', 'gizi', 'pendek', 'balita', 'bayi', 'anak', 'ibu hamil', 'puskesmas', 'posyandu', 'pertumbuhan', 'perkembangan', 'nutrisi', 'malnutrisi', 'pangan bergizi', 'pola makan', 'asupan gizi'],
            'Gizi Buruk' => ['gizi buruk', 'malnutrisi', 'nutrisi', 'stunting', 'kurus', 'vitamin', 'protein', 'karbo', 'lemak', 'kesehatan', 'medis', 'klinis', 'asupan', 'pola makan', 'gizi seimbang', 'beban ganda malnutrisi'],
            'Krisis Listrik' => ['listrik', 'energi', 'saidi', 'saifi', 'power', 'pembangkit', 'pln', 'panel', 'solar', 'baterai', 'tegangan', 'arus', 'mikrohidro', 'angin', 'elektro', 'otomatisasi', 'smart grid', 'elektrifikasi', 'energi terbarukan', 'transisi energi', 'panel surya', 'biofuel'],
            'Ketahanan Pangan' => ['pangan', 'makanan', 'food', 'beras', 'pertanian', 'pasokan pangan', 'padi', 'jagung', 'kedelai', 'ternak', 'ikan', 'panen', 'pupuk', 'hama', 'sawah', 'irigasi', 'tani', 'swasembada', 'benih', 'bioteknologi pangan', 'smart farming', 'diversifikasi pangan', 'produksi pangan'],
        ];

        // Query selection
        if ($bubbleType === 'Pengabdian') {
            $query = Pengabdian::query();
            $statsQuery = clone $query;
            if ($request->filled('batch_type')) {
                $val = $request->batch_type;
                if (stripos($val, 'Multitahun') !== false && stripos($val, 'Batch') !== false) {
                    $query->where(function($q) { $q->where('batch_type', 'like', '%multitahun%')->orWhere('batch_type', 'like', '%batch_i%')->orWhere('batch_type', 'like', '%batch_ii%'); });
                } elseif (stripos($val, 'Kosabangsa') !== false) {
                    $query->where(function($q) { $q->where('batch_type', 'like', '%Kosabangsa%')->orWhere('nama_skema', 'like', '%Kosabangsa%'); });
                }
            }
            $query->where(function ($q) use ($dataType, $keywordsMap) {
                $regex = isset($keywordsMap[$dataType]) ? implode('|', array_map('preg_quote', $keywordsMap[$dataType])) : preg_quote($dataType);
                $q->whereRaw("judul REGEXP ?", [$regex])->orWhereRaw("bidang_fokus REGEXP ?", [$regex]);
            });
            if ($request->filled('bidang_fokus')) $query->whereIn('bidang_fokus', (array)$request->bidang_fokus);
            if ($request->filled('provinsi')) $query->whereIn('prov_pt', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('thn_pelaksanaan_kegiatan', (array)$request->tahun);
            $mapData = (clone $query)->select('id', 'judul', 'nama', 'nama_institusi as institusi', 'prov_pt as provinsi', 'kab_pt as kabupaten_kota', 'pt_latitude', 'pt_longitude', 'bidang_fokus', 'thn_pelaksanaan_kegiatan as tahun', 'nama_skema as skema')->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->limit(15000)->get()->toArray();
            $researches = (clone $query)->orderByDesc('thn_pelaksanaan_kegiatan')->limit(50)->get();
        } elseif ($bubbleType === 'Hilirisasi') {
            $query = Hilirisasi::query();
            $statsQuery = clone $query;
            $query->where(function ($q) use ($dataType, $keywordsMap) {
                $regex = isset($keywordsMap[$dataType]) ? implode('|', array_map('preg_quote', $keywordsMap[$dataType])) : preg_quote($dataType);
                $q->whereRaw("judul REGEXP ?", [$regex]);
            });
            if ($request->filled('provinsi')) $query->whereIn('provinsi', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('tahun', (array)$request->tahun);
            $mapData = (clone $query)->select('id', 'judul', 'nama_pengusul as nama', 'perguruan_tinggi as institusi', 'provinsi', DB::raw("NULL as kabupaten_kota"), 'pt_latitude', 'pt_longitude', 'skema', 'tahun', 'mitra', 'luaran')->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->limit(15000)->get()->toArray();
            $researches = (clone $query)->orderByDesc('tahun')->limit(50)->get();
        } else {
            $query = Penelitian::query();
            $statsQuery = clone $query;
            $query->where(function ($q) use ($dataType, $keywordsMap) {
                $regex = isset($keywordsMap[$dataType]) ? implode('|', array_map('preg_quote', $keywordsMap[$dataType])) : preg_quote($dataType);
                $q->whereRaw("judul REGEXP ?", [$regex]);
            });
            if ($request->filled('bidang_fokus')) $query->whereIn('bidang_fokus', (array)$request->bidang_fokus);
            if ($request->filled('provinsi')) $query->whereIn('provinsi', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('thn_pelaksanaan', (array)$request->tahun);
            $mapData = (clone $query)->select('id', 'judul', 'nama', 'institusi', 'provinsi', 'kota as kabupaten_kota', 'pt_latitude', 'pt_longitude', 'bidang_fokus', 'thn_pelaksanaan as tahun', 'skema')->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->limit(15000)->get()->toArray();
            $researches = (clone $query)->orderByDesc('thn_pelaksanaan')->limit(50)->get();
        }

        $this->applyAdvancedQueries($query, $request, $bubbleType);

        $stats = Cache::remember("perm_stats_{$bubbleType}_{$request->batch_type}", 3600, function() use ($statsQuery, $bubbleType) {
            if ($bubbleType === 'Hilirisasi') return ['totalResearch' => (clone $statsQuery)->count(), 'totalUniversities' => (clone $statsQuery)->distinct('perguruan_tinggi')->count('perguruan_tinggi'), 'totalProvinces' => (clone $statsQuery)->distinct('provinsi')->count('provinsi'), 'totalFields' => 0];
            if ($bubbleType === 'Pengabdian') return ['totalResearch' => (clone $statsQuery)->count(), 'totalUniversities' => (clone $statsQuery)->distinct('nama_institusi')->count('nama_institusi'), 'totalProvinces' => (clone $statsQuery)->distinct('prov_pt')->count('prov_pt'), 'totalFields' => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus')];
            return ['totalResearch' => (clone $statsQuery)->count(), 'totalUniversities' => (clone $statsQuery)->distinct('institusi')->count('institusi'), 'totalProvinces' => (clone $statsQuery)->distinct('provinsi')->count('provinsi'), 'totalFields' => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus')];
        });

        // JSON Data loading
        $jsonDir = database_path('data/');
        $filesMap = [
            'Sampah' => 'data-permasalahan-sampah.json',
            'Stunting' => 'data-permasalahan-stunting.json',
            'Gizi Buruk' => 'data-permasalahan-gizi-buruk.json',
            'Krisis Listrik' => 'data-permasalahan-krisis-listrik.json',
            'Ketahanan Pangan' => 'data-permasalahan-ketahanan-pangan.json'
        ];
        
        $permasalahanStats = Cache::remember('permasalahan_json_provinsi_stats_v9', 86400, function () use ($jsonDir, $filesMap) {
            $result = [];
            foreach ($filesMap as $label => $filename) {
                $path = $jsonDir . $filename; if (!file_exists($path)) continue;
                $data = json_decode(file_get_contents($path), true);
                $list = $data['Provinsi'] ?? $data['Sheet1'] ?? [];
                $labelData = [];
                foreach ($list as $item) {
                    $metrics = ($label === 'Krisis Listrik') ? ['saidi' => 'SAIDI (Jam/Pelanggan)', 'saifi' => 'SAIFI (Kali/Pelanggan)'] : [strtolower($label) => match($label) { 'Sampah' => 'Timbulan Sampah Tahunan(ton)', 'Stunting', 'Gizi Buruk' => 'Persentase', 'Ketahanan Pangan' => 'IKP', default => 'Persentase' }];
                    foreach ($metrics as $metrikId => $valKey) {
                        $value = 0; foreach ($item as $k => $v) { if (trim($k) === $valKey) { $value = $v; break; } }
                        $labelData[] = ['provinsi' => $item['Provinsi'] ?? '-', 'nilai' => (float)$value, 'satuan' => match($label) { 'Sampah' => 'ton', 'Stunting', 'Gizi Buruk' => '%', 'Krisis Listrik' => (stripos($valKey, 'SAIDI') !== false ? 'Jam/Pelanggan' : 'Kali/Pelanggan'), 'Ketahanan Pangan' => 'Indeks', default => '' }, 'metrik' => $metrikId, 'tahun' => 2024];
                    }
                }
                $result[$label] = $labelData;
            }
            return $result;
        });

        $permasalahanKabupatenStats = Cache::remember('permasalahan_json_kabupaten_stats_v9', 86400, function () use ($jsonDir, $filesMap) {
            $result = [];
            foreach ($filesMap as $label => $filename) {
                $path = $jsonDir . $filename; if (!file_exists($path)) continue;
                $data = json_decode(file_get_contents($path), true); if (!isset($data['Kabupaten'])) continue;
                $labelData = [];
                foreach ($data['Kabupaten'] as $item) {
                    $metrics = ($label === 'Krisis Listrik') ? ['saidi' => 'SAIDI (Jam/Pelanggan)', 'saifi' => 'SAIFI (Kali/Pelanggan)'] : [strtolower($label) => match($label) { 'Sampah' => 'Timbulan Sampah Tahunan(ton)', 'Stunting', 'Gizi Buruk' => 'Persentase', 'Ketahanan Pangan' => 'IKP', default => 'Persentase' }];
                    foreach ($metrics as $metrikId => $valKey) {
                        $value = 0; foreach ($item as $k => $v) { if (trim($k) === $valKey) { $value = $v; break; } }
                        $labelData[] = ['kabupaten_kota' => $item['Kabupaten/Kota'] ?? '-', 'provinsi' => $item['Provinsi'] ?? '-', 'nilai' => (float)$value, 'satuan' => match($label) { 'Sampah' => 'ton', 'Stunting', 'Gizi Buruk' => '%', 'Krisis Listrik' => (stripos($valKey, 'SAIDI') !== false ? 'Jam/Pelanggan' : 'Kali/Pelanggan'), 'Ketahanan Pangan' => 'Indeks', default => '' }, 'metrik' => $metrikId, 'tahun' => 2024];
                    }
                }
                $result[$label] = $labelData;
            }
            return $result;
        });

        $allFilterOptions = [
            'Penelitian' => [
                'bidangFokus' => Cache::remember('filter_bidang_fokus', 7200, fn() => DB::table('penelitian')->select('bidang_fokus')->whereNotNull('bidang_fokus')->distinct()->orderBy('bidang_fokus')->pluck('bidang_fokus')->filter()->values()),
                'provinsi' => Cache::remember('filter_provinsi', 7200, fn() => DB::table('penelitian')->select('provinsi')->whereNotNull('provinsi')->distinct()->orderBy('provinsi')->pluck('provinsi')->filter()->values()),
                'tahun' => Cache::remember('filter_tahun', 7200, fn() => DB::table('penelitian')->select('thn_pelaksanaan')->whereNotNull('thn_pelaksanaan')->distinct()->orderBy('thn_pelaksanaan', 'desc')->pluck('thn_pelaksanaan')->filter()->values()),
            ],
            'Pengabdian' => [
                'bidangFokus' => Cache::remember('filter_pengabdian_bidang_fokus', 7200, fn() => DB::table('pengabdian')->select('bidang_fokus')->whereNotNull('bidang_fokus')->distinct()->orderBy('bidang_fokus')->pluck('bidang_fokus')->filter()->values()),
                'provinsi' => Cache::remember('filter_pengabdian_provinsi', 7200, fn() => DB::table('pengabdian')->select('prov_pt')->whereNotNull('prov_pt')->distinct()->orderBy('prov_pt')->pluck('prov_pt')->filter()->values()),
                'tahun' => Cache::remember('filter_pengabdian_tahun', 7200, fn() => DB::table('pengabdian')->select('thn_pelaksanaan_kegiatan')->whereNotNull('thn_pelaksanaan_kegiatan')->distinct()->orderBy('thn_pelaksanaan_kegiatan', 'desc')->pluck('thn_pelaksanaan_kegiatan')->filter()->values()),
                'batchType' => ['Multitahun, Batch I & Batch II', 'Kosabangsa'],
            ],
            'Hilirisasi' => [
                'provinsi' => Cache::remember('filter_hilirisasi_provinsi', 7200, fn() => DB::table('hilirisasi')->select('provinsi')->whereNotNull('provinsi')->distinct()->orderBy('provinsi')->pluck('provinsi')->filter()->values()),
                'tahun' => Cache::remember('filter_hilirisasi_tahun', 7200, fn() => DB::table('hilirisasi')->select('tahun')->whereNotNull('tahun')->distinct()->orderBy('tahun', 'desc')->pluck('tahun')->filter()->values()),
            ]
        ];

        return Inertia::render('Permasalahan', [
            'mapData' => $mapData,
            'totalMapMarkers' => (clone $query)->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
            'permasalahanStats' => $permasalahanStats,
            'permasalahanKabupatenStats' => $permasalahanKabupatenStats,
            'jenisPermasalahan' => array_keys($permasalahanStats),
            'researches' => $researches,
            'stats' => $stats,
            'allFilterOptions' => $allFilterOptions,
            'filters' => $request->all(),
            'isFiltered' => $isFiltered,
        ]);
    }

    /**
     * API endpoint for lazy-loading marker details
     */
    public function lazyLoadMarkers(Request $request)
    {
        $bubbleType = $request->input('bubbleType', 'Penelitian');
        $dataType = $request->input('dataType', 'Sampah');
        $offset = $request->input('offset', 5000);
        $limit = $request->input('limit', 5000);

        // Same keywords as index
        $keywordsMap = [
            'Sampah' => [
                'sampah', 'limbah', 'waste', 'recycle', 'daur ulang', 'plastic', 'plastik', 'pencemaran', 
                'polusi', 'lingkungan', 'ekosistem', 'sanitasi', 'kehutanan', 'konservasi', 'sungai', 'laut',
                'residu', 'biomassa', 'waste-to-energy', 'tPA', 'pengelolaan sampah', 'sampah kota'
            ],
            'Stunting' => [
                'stunting', 'tengkes', 'kerdil', 'gizi', 'pendek', 'balita', 'bayi', 'anak', 'ibu hamil', 
                'puskesmas', 'posyandu', 'pertumbuhan', 'perkembangan', 'nutrisi', 'malnutrisi', 'pangan bergizi',
                'pola makan', 'asupan gizi'
            ],
            'Gizi Buruk' => [
                'gizi buruk', 'malnutrisi', 'nutrisi', 'stunting', 'kurus', 'vitamin', 'protein', 'karbo', 
                'lemak', 'kesehatan', 'medis', 'klinis', 'asupan', 'pola makan', 'gizi seimbang', 'beban ganda malnutrisi'
            ],
            'Krisis Listrik' => [
                'listrik', 'energi', 'saidi', 'saifi', 'power', 'pembangkit', 'pln', 'panel', 'solar', 
                'baterai', 'tegangan', 'arus', 'mikrohidro', 'angin', 'elektro', 'otomatisasi', 'smart grid',
                'elektrifikasi', 'energi terbarukan', 'transisi energi', 'panel surya', 'biofuel'
            ],
            'Ketahanan Pangan' => [
                'pangan', 'makanan', 'food', 'beras', 'pertanian', 'pasokan pangan', 'padi', 'jagung', 
                'kedelai', 'ternak', 'ikan', 'panen', 'pupuk', 'hama', 'sawah', 'irigasi', 'tani', 'swasembada',
                'benih', 'bioteknologi pangan', 'smart farming', 'diversifikasi pangan', 'produksi pangan'
            ],
        ];

        if ($bubbleType === 'Pengabdian') {
            $query = Pengabdian::query();
        } elseif ($bubbleType === 'Hilirisasi') {
            $query = Hilirisasi::query();
        } else {
            $query = Penelitian::query();
        }

        // Apply keyword filter
        $query->where(function ($q) use ($dataType, $keywordsMap) {
            if (isset($keywordsMap[$dataType])) {
                $regex = implode('|', array_map('preg_quote', $keywordsMap[$dataType]));
                $q->whereRaw("judul REGEXP ?", [$regex]);
            } else {
                $q->where('judul', 'like', "%$dataType%");
            }
        });

        // Apply standard filters
        if ($bubbleType === 'Pengabdian') {
            if ($request->filled('bidang_fokus')) $query->whereIn('bidang_fokus', (array)$request->bidang_fokus);
            if ($request->filled('provinsi')) $query->whereIn('prov_pt', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('thn_pelaksanaan_kegiatan', (array)$request->tahun);
            if ($request->filled('skema')) $query->whereIn('nama_skema', (array)$request->skema);
            
            if ($request->filled('batch_type')) {
                $val = $request->batch_type;
                if (stripos($val, 'Multitahun') !== false && stripos($val, 'Batch') !== false) {
                    $query->where(function($q) {
                        $q->where('batch_type', 'like', '%multitahun%')
                          ->orWhere('batch_type', 'like', '%batch_i%') 
                          ->orWhere('batch_type', 'like', '%batch_ii%');
                    });
                } elseif (stripos($val, 'Kosabangsa') !== false) {
                    $query->where(function($q) {
                        $q->where('batch_type', 'like', '%Kosabangsa%')
                          ->orWhere('nama_skema', 'like', '%Kosabangsa%');
                    });
                }
            }
        } elseif ($bubbleType === 'Hilirisasi') {
            if ($request->filled('provinsi')) $query->whereIn('provinsi', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('tahun', (array)$request->tahun);
            if ($request->filled('skema')) $query->whereIn('skema', (array)$request->skema);
            if ($request->filled('direktorat')) $query->whereIn('direktorat', (array)$request->direktorat);
        } else {
            if ($request->filled('bidang_fokus')) $query->whereIn('bidang_fokus', (array)$request->bidang_fokus);
            if ($request->filled('tema_prioritas')) $query->whereIn('tema_prioritas', (array)$request->tema_prioritas);
            if ($request->filled('provinsi')) $query->whereIn('provinsi', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('thn_pelaksanaan', (array)$request->tahun);
            if ($request->filled('kategori_pt')) $query->whereIn('kategori_pt', (array)$request->kategori_pt);
            if ($request->filled('klaster')) $query->whereIn('klaster', (array)$request->klaster);
        }

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

        return response()->json([
            'markers' => $results,
            'hasMore' => ($offset + $results->count()) < $totalCount,
            'total'   => $totalCount
        ]);
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

                        $applyCondition = function($query) use ($term, $field, $modelType) {
                            if ($field === 'all') {
                                $query->where(function($sub) use ($term, $modelType) {
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
                                $dbField = match($field) {
                                    'title' => 'judul',
                                    'university' => match($modelType) {
                                        'Hilirisasi' => 'perguruan_tinggi',
                                        'Pengabdian' => 'nama_institusi',
                                        default => 'institusi'
                                    },
                                    'researcher' => match($modelType) {
                                        'Hilirisasi' => 'nama_pengusul',
                                        default => 'nama'
                                    },
                                    'field' => match($modelType) {
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
    }
}
