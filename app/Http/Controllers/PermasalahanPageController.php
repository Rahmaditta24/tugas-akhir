<?php

namespace App\Http\Controllers;

use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use App\Models\Penelitian;
use App\Models\Pengabdian;
use App\Models\Hilirisasi;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class PermasalahanPageController extends Controller
{
    public function index(Request $request)
    {
        // 1. Determine Bubble Type and Data Type (Overlap filter)
        $bubbleType = $request->input('bubbleType', 'Penelitian');
        $dataType = $request->input('dataType', 'Sampah');
        
        $isFiltered = $request->filled('search') || $request->filled('queries') || $request->filled('bidang_fokus') || $request->filled('tema_prioritas') || $request->filled('provinsi') || $request->filled('tahun') || $request->filled('kategori_pt') || $request->filled('klaster') || $request->filled('skema') || $request->filled('direktorat');

        // Keywords mapping from Admin controller for consistent counts
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

        // 2. Build Query based on Bubble Type
        if ($bubbleType === 'Pengabdian') {
            $query = \App\Models\Pengabdian::query();
            // Apply overlap filter (exact Admin logic)
            $query->where(function ($q) use ($dataType, $keywordsMap) {
                if (isset($keywordsMap[$dataType])) {
                    $regex = implode('|', array_map('preg_quote', $keywordsMap[$dataType]));
                    $q->whereRaw("judul REGEXP ?", [$regex])
                      ->orWhereRaw("bidang_fokus REGEXP ?", [$regex]);
                } else {
                    $q->where('judul', 'like', "%$dataType%")
                      ->orWhere('bidang_fokus', 'like', "%$dataType%");
                }
            });

            // Apply other filters
            if ($request->filled('bidang_fokus')) $query->whereIn('bidang_fokus', (array)$request->bidang_fokus);
            if ($request->filled('provinsi')) $query->whereIn('prov_pt', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('thn_pelaksanaan_kegiatan', (array)$request->tahun);
            if ($request->filled('skema')) $query->whereIn('nama_skema', (array)$request->skema);
            
            if ($request->filled('batch_type')) {
                $batchValues = (array)$request->batch_type;
                // Mapping combined UI value to DB values
                if (in_array('Multitahun Lanjutan, Batch I & Batch II', $batchValues)) {
                    $batchValues = array_merge($batchValues, ['multitahun_lanjutan', 'batch_ii', 'batch_i']);
                }
                $query->whereIn('batch_type', $batchValues);
            }

            // Apply Search and Queries
            $this->applyAdvancedQueries($query, $request, 'Pengabdian');
            
            $isFiltered = true; // Ensure isFiltered is true when we apply these filters

            $mapQuery = clone $query;
            $mapData = $mapQuery->select('id', 'judul', 'nama', 'nama_institusi as institusi', 'prov_pt as provinsi', 'kab_pt as kabupaten_kota', 'pt_latitude', 'pt_longitude', 'nama_skema as bidang_fokus', 'thn_pelaksanaan_kegiatan as tahun', 'nidn', 'klaster', 'prov_mitra', 'kab_mitra', 'ptn_pts as kategori_pt', 'nama_skema as skema')
                ->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->get()->toArray();

            $researches = (clone $query)->select('id', 'judul', 'nama', 'nama_institusi as institusi', 'prov_pt as provinsi', 'kab_pt as kabupaten_kota', 'nama_skema as bidang_fokus', 'thn_pelaksanaan_kegiatan as tahun', 'nidn', 'klaster', 'prov_mitra', 'kab_mitra', 'ptn_pts as kategori_pt', 'nama_skema as skema')
                ->orderByDesc('thn_pelaksanaan_kegiatan')->limit(50)->get();

        } elseif ($bubbleType === 'Hilirisasi') {
            $query = \App\Models\Hilirisasi::query();
            // Apply overlap filter (exact Admin logic)
            $query->where(function ($q) use ($dataType, $keywordsMap) {
                if (isset($keywordsMap[$dataType])) {
                    $regex = implode('|', array_map('preg_quote', $keywordsMap[$dataType]));
                    $q->whereRaw("judul REGEXP ?", [$regex]);
                } else {
                    $q->where('judul', 'like', "%$dataType%");
                }
            });

            // Apply other filters
            if ($request->filled('provinsi')) $query->whereIn('provinsi', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('tahun', (array)$request->tahun);
            if ($request->filled('skema')) $query->whereIn('skema', (array)$request->skema);
            if ($request->filled('direktorat')) $query->whereIn('direktorat', (array)$request->direktorat);

            // Apply Search and Queries
            $this->applyAdvancedQueries($query, $request, 'Hilirisasi');

            $mapQuery = clone $query;
            $mapData = $mapQuery->select('id', 'judul', 'nama_pengusul as nama', 'perguruan_tinggi as institusi', 'provinsi', \DB::raw("NULL as kabupaten_kota"), 'pt_latitude', 'pt_longitude', 'skema', 'tahun', 'mitra', 'luaran')
                ->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->get()->toArray();

            $researches = (clone $query)->select('id', 'judul', 'nama_pengusul as nama', 'perguruan_tinggi as institusi', 'provinsi', \DB::raw("NULL as kabupaten_kota"), 'skema', 'tahun', 'mitra', 'luaran')
                ->orderByDesc('tahun')->limit(50)->get();

        } else { // Penelitian (Default)
            $query = \App\Models\Penelitian::query();
            // Apply overlap filter (exact Admin logic)
            $query->where(function ($q) use ($dataType, $keywordsMap) {
                if (isset($keywordsMap[$dataType])) {
                    $regex = implode('|', array_map('preg_quote', $keywordsMap[$dataType]));
                    $q->whereRaw("judul REGEXP ?", [$regex]);
                } else {
                    $q->where('judul', 'like', "%$dataType%");
                }
            });

            // Apply other filters
            if ($request->filled('bidang_fokus')) $query->whereIn('bidang_fokus', (array)$request->bidang_fokus);
            if ($request->filled('tema_prioritas')) $query->whereIn('tema_prioritas', (array)$request->tema_prioritas);
            if ($request->filled('provinsi')) $query->whereIn('provinsi', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('thn_pelaksanaan', (array)$request->tahun);
            if ($request->filled('kategori_pt')) $query->whereIn('kategori_pt', (array)$request->kategori_pt);
            if ($request->filled('klaster')) $query->whereIn('klaster', (array)$request->klaster);

            // Apply Search and Queries
            $this->applyAdvancedQueries($query, $request, 'Penelitian');

            $mapQuery = clone $query;
            $mapData = $mapQuery->select('id', 'judul', 'nama', 'institusi', 'provinsi', 'kota as kabupaten_kota', 'pt_latitude', 'pt_longitude', 'bidang_fokus', 'thn_pelaksanaan as tahun', 'nidn', 'nuptk', 'kategori_pt', 'klaster', 'skema', 'tema_prioritas')
                ->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->get()->toArray();

            $researches = (clone $query)->select('id', 'judul', 'nama', 'institusi', 'provinsi', 'kota as kabupaten_kota', 'bidang_fokus', 'thn_pelaksanaan as tahun', 'nidn', 'nuptk', 'kategori_pt', 'klaster', 'skema', 'tema_prioritas')
                ->orderByDesc('thn_pelaksanaan')->limit(50)->get();
        }

        // 3. Stats calculation - dynamic based on bubbleType
        if ($bubbleType === 'Hilirisasi') {
            $globalStatsQuery = \App\Models\Hilirisasi::query();
            $stats = [
                'totalResearch'    => (clone $globalStatsQuery)->count(),
                'totalUniversities'=> (clone $globalStatsQuery)->distinct('perguruan_tinggi')->count('perguruan_tinggi'),
                'totalProvinces'   => (clone $globalStatsQuery)->distinct('provinsi')->count('provinsi'),
                'totalFields'      => 0, // Hilirisasi tidak memiliki kolom bidang_fokus
            ];
        } elseif ($bubbleType === 'Pengabdian') {
            $globalStatsQuery = \App\Models\Pengabdian::query();
            $stats = [
                'totalResearch'    => (clone $globalStatsQuery)->count(),
                'totalUniversities'=> (clone $globalStatsQuery)->distinct('nama_institusi')->count('nama_institusi'),
                'totalProvinces'   => (clone $globalStatsQuery)->distinct('prov_pt')->count('prov_pt'),
                'totalFields'      => (clone $globalStatsQuery)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        } else {
            $globalStatsQuery = \App\Models\Penelitian::query();
            $stats = [
                'totalResearch'    => (clone $globalStatsQuery)->count(),
                'totalUniversities'=> (clone $globalStatsQuery)->distinct('institusi')->count('institusi'),
                'totalProvinces'   => (clone $globalStatsQuery)->distinct('provinsi')->count('provinsi'),
                'totalFields'      => (clone $globalStatsQuery)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        }

        // 4. Choropleth data (including Kabupaten)
        $displayNameMap = ['sampah' => 'Sampah', 'stunting' => 'Stunting', 'gizi_buruk' => 'Gizi Buruk', 'krisis_listrik' => 'Krisis Listrik', 'ketahanan_pangan' => 'Ketahanan Pangan'];
        
        $permasalahanStats = \Cache::remember('permasalahan_choropleth_stats', 86400, function () use ($displayNameMap) {
            return PermasalahanProvinsi::all()->groupBy('jenis_permasalahan')->map(fn($items) => $items->map(fn($item) => ['provinsi' => $item->provinsi, 'nilai' => $item->nilai, 'satuan' => $item->satuan, 'metrik' => $item->metrik, 'tahun' => $item->tahun])->values()->toArray())->mapWithKeys(fn($items, $jenis) => [$displayNameMap[$jenis] ?? $jenis => $items])->toArray();
        });

        $permasalahanKabupatenStats = \Cache::remember('permasalahan_kabupaten_choropleth_stats', 86400, function () use ($displayNameMap) {
            return PermasalahanKabupaten::all()->groupBy('jenis_permasalahan')->map(fn($items) => $items->map(fn($item) => [
                'kabupaten_kota' => $item->kabupaten_kota,
                'provinsi' => $item->provinsi, 
                'nilai' => $item->nilai, 
                'satuan' => $item->satuan, 
                'tahun' => $item->tahun
            ])->values()->toArray())->mapWithKeys(fn($items, $jenis) => [$displayNameMap[$jenis] ?? $jenis => $items])->toArray();
        });

        $jenisPermasalahan = array_keys($permasalahanStats);
        
        // 5. Get consolidated filter options (for dynamic switching)
        $allFilterOptions = [
            'Penelitian' => [
                'bidangFokus' => \Cache::remember('filter_bidang_fokus', 7200, fn() => DB::table('penelitian')->select('bidang_fokus')->whereNotNull('bidang_fokus')->distinct()->orderBy('bidang_fokus')->pluck('bidang_fokus')->filter()->values()),
                'temaPrioritas' => \Cache::remember('filter_tema_prioritas', 7200, fn() => DB::table('penelitian')->select('tema_prioritas')->whereNotNull('tema_prioritas')->distinct()->orderBy('tema_prioritas')->pluck('tema_prioritas')->filter()->values()),
                'kategoriPT' => \Cache::remember('filter_kategori_pt', 7200, fn() => DB::table('penelitian')->select('kategori_pt')->whereNotNull('kategori_pt')->distinct()->orderBy('kategori_pt')->pluck('kategori_pt')->filter()->values()),
                'klaster' => \Cache::remember('filter_klaster', 7200, fn() => DB::table('penelitian')->select('klaster')->whereNotNull('klaster')->distinct()->orderBy('klaster')->pluck('klaster')->filter()->values()),
                'provinsi' => \Cache::remember('filter_provinsi', 7200, fn() => DB::table('penelitian')->select('provinsi')->whereNotNull('provinsi')->distinct()->orderBy('provinsi')->pluck('provinsi')->filter()->values()),
                'tahun' => \Cache::remember('filter_tahun', 7200, fn() => DB::table('penelitian')->select('thn_pelaksanaan')->whereNotNull('thn_pelaksanaan')->distinct()->orderBy('thn_pelaksanaan', 'desc')->pluck('thn_pelaksanaan')->filter()->values()),
            ],
            'Pengabdian' => [
                'bidangFokus' => \Cache::remember('filter_pengabdian_bidang_fokus', 7200, fn() => DB::table('pengabdian')->select('bidang_fokus')->whereNotNull('bidang_fokus')->distinct()->orderBy('bidang_fokus')->pluck('bidang_fokus')->filter()->values()),
                'provinsi' => \Cache::remember('filter_pengabdian_provinsi', 7200, fn() => DB::table('pengabdian')->select('prov_pt')->whereNotNull('prov_pt')->distinct()->orderBy('prov_pt')->pluck('prov_pt')->filter()->values()),
                'tahun' => \Cache::remember('filter_pengabdian_tahun', 7200, fn() => DB::table('pengabdian')->select('thn_pelaksanaan_kegiatan')->whereNotNull('thn_pelaksanaan_kegiatan')->distinct()->orderBy('thn_pelaksanaan_kegiatan', 'desc')->pluck('thn_pelaksanaan_kegiatan')->filter()->values()),
                'skema' => \Cache::remember('filter_pengabdian_skema', 7200, fn() => DB::table('pengabdian')->select('nama_skema')->whereNotNull('nama_skema')->distinct()->orderBy('nama_skema')->pluck('nama_skema')->filter()->values()),
                'batchType' => [
                    'Multitahun Lanjutan, Batch I & Batch II',
                    'Kosabangsa'
                ],
            ],
            'Hilirisasi' => [
                'skema' => \Cache::remember('filter_hilirisasi_skema', 7200, fn() => DB::table('hilirisasi')->select('skema')->whereNotNull('skema')->distinct()->orderBy('skema')->pluck('skema')->filter()->values()),
                'provinsi' => \Cache::remember('filter_hilirisasi_provinsi', 7200, fn() => DB::table('hilirisasi')->select('provinsi')->whereNotNull('provinsi')->distinct()->orderBy('provinsi')->pluck('provinsi')->filter()->values()),
                'tahun' => \Cache::remember('filter_hilirisasi_tahun', 7200, fn() => DB::table('hilirisasi')->select('tahun')->whereNotNull('tahun')->distinct()->orderBy('tahun', 'desc')->pluck('tahun')->filter()->values()),
                'direktorat' => \Cache::remember('filter_hilirisasi_direktorat', 7200, fn() => DB::table('hilirisasi')->select('direktorat')->whereNotNull('direktorat')->distinct()->orderBy('direktorat')->pluck('direktorat')->filter()->values()),
            ]
        ];

        return Inertia::render('Permasalahan', [
            'mapData'                    => $mapData,
            'permasalahanStats'          => $permasalahanStats,
            'permasalahanKabupatenStats' => $permasalahanKabupatenStats,
            'jenisPermasalahan'          => $jenisPermasalahan,
            'researches'                 => $researches,
            'stats'                      => $stats,
            'allFilterOptions'           => $allFilterOptions,
            'filters'                    => $request->all(),
            'isFiltered'                 => $isFiltered,
        ]);
    }

    private function applyAdvancedQueries($query, $request, $type)
    {
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('queries')) {
            $queries = json_decode($request->queries, true);
            if (is_array($queries)) {
                $query->where(function ($q) use ($queries, $type) {
                    foreach ($queries as $index => $row) {
                        $term = trim($row['term'] ?? '');
                        if (empty($term)) continue;

                        $field = $row['field'] ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        $applyCondition = function($query) use ($term, $field, $type) {
                            if ($field === 'all') {
                                $query->where(function($sub) use ($term) {
                                    $sub->where('judul', 'like', "%$term%")
                                        ->orWhere('nama', 'like', "%$term%")
                                        ->orWhere('bidang_fokus', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match($field) {
                                    'title' => 'judul',
                                    'researcher' => 'nama',
                                    'field' => 'bidang_fokus',
                                    'skema' => 'skema',
                                    default => 'judul'
                                };
                                // Handle differences in table columns
                                if ($type === 'Pengabdian' && $dbField === 'nama') $dbField = 'nama';
                                if ($type === 'Hilirisasi' && $dbField === 'nama') $dbField = 'nama_pengusul';
                                
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
    }

    private function getProvinceCoordinates()
    {
        return [
            'aceh' => [5.55, 95.32],
            'sumatera utara' => [3.595, 98.672],
            'sumatera barat' => [-0.949, 100.354],
            'riau' => [0.507, 101.447],
            'kepulauan riau' => [1.082, 104.03],
            'jambi' => [-1.611, 103.615],
            'sumatera selatan' => [-3.0, 104.75],
            'bengkulu' => [-3.795, 102.259],
            'lampung' => [-5.429, 105.262],
            'kepulauan bangka belitung' => [-2.1, 106.1],
            'banten' => [-6.4, 106.13],
            'dki jakarta' => [-6.2, 106.816],
            'jawa barat' => [-6.914, 107.609],
            'jawa tengah' => [-7.0, 110.416],
            'di yogyakarta' => [-7.795, 110.369],
            'jawa timur' => [-7.25, 112.75],
            'bali' => [-8.409, 115.188],
            'nusa tenggara barat' => [-8.583, 116.116],
            'nusa tenggara timur' => [-10.177, 123.607],
            'kalimantan barat' => [0.0, 109.32],
            'kalimantan tengah' => [-2.21, 113.92],
            'kalimantan selatan' => [-3.319, 114.592],
            'kalimantan timur' => [-0.502, 117.153],
            'kalimantan utara' => [3.0, 116.0],
            // Kalimantan Aliases
            'prov. kalimantan barat' => [0.0, 109.32],
            'kalbar' => [0.0, 109.32],
            'kaltim' => [-0.502, 117.153],
            'kalsel' => [-3.319, 114.592],
            'kalteng' => [-2.21, 113.92],
            'kalut' => [3.0, 116.0],
            'sulawesi utara' => [1.48, 124.84],
            'gorontalo' => [0.54, 123.06],
            'sulawesi tengah' => [-0.9, 119.87],
            'sulawesi barat' => [-2.67, 118.86],
            'sulawesi selatan' => [-5.14, 119.41],
            'sulawesi tenggara' => [-4.0, 122.0], // Added missing province
            'maluku' => [-3.7, 128.18],
            'maluku utara' => [0.79, 127.38],
            'papua' => [-2.53, 140.71],
            'papua barat' => [-0.87, 134.08],
            'papua barat daya' => [-0.92, 131.28],
            'papua selatan' => [-6.0, 140.0],
            'papua tengah' => [-3.47, 138.08],
            'papua pegunungan' => [-4.0, 138.0],
            // Aliases for robustness
            'daerah istimewa yogyakarta' => [-7.795, 110.369],
            'yogyakarta' => [-7.795, 110.369],
            'diy' => [-7.795, 110.369],
            'jakarta' => [-6.2, 106.816],
            'jakarta raya' => [-6.2, 106.816],
            'batam' => [1.145, 104.7],
        ];
    }
}


