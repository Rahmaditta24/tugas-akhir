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
        $requestHash = md5(json_encode($request->all()));
        
        $isFiltered = $request->filled('search') || $request->filled('queries') || $request->filled('bidang_fokus') || $request->filled('tema_prioritas') || $request->filled('provinsi') || $request->filled('tahun') || $request->filled('kategori_pt') || $request->filled('klaster') || $request->filled('skema') || $request->filled('direktorat');

        // Keywords mapping for permasalahan filtering
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

        // 1. Build Base Query based on Bubble Type
        if ($bubbleType === 'Pengabdian') {
            $query = Pengabdian::query();
            $statsQuery = clone $query;
            
            // Category-specific stats filter
            if ($request->filled('batch_type')) {
                $val = $request->batch_type;
                if (stripos($val, 'Multitahun') !== false && stripos($val, 'Batch') !== false) {
                    $statsQuery->where(function($q) {
                        $q->where('batch_type', 'like', '%multitahun%')
                          ->orWhere('batch_type', 'like', '%batch_i%') 
                          ->orWhere('batch_type', 'like', '%batch_ii%');
                    });
                } elseif (stripos($val, 'Kosabangsa') !== false) {
                    $statsQuery->where(function($q) {
                        $q->where('batch_type', 'like', '%Kosabangsa%')
                          ->orWhere('nama_skema', 'like', '%Kosabangsa%');
                    });
                }
            }

            // Keyword filter for Map and List
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

            // Standard filters
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

            $this->applyAdvancedQueries($query, $request, 'Pengabdian');

            $mapData = (clone $query)->select('id', 'judul', 'nama', 'nama_institusi as institusi', 'prov_pt as provinsi', 'kab_pt as kabupaten_kota', 'pt_latitude', 'pt_longitude', 'bidang_fokus', 'thn_pelaksanaan_kegiatan as tahun', 'nama_skema as skema')
                ->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->limit(5000)->get()->toArray();

            $researches = (clone $query)->select('id', 'judul', 'nama', 'nama_institusi as institusi', 'prov_pt as provinsi', 'kab_pt as kabupaten_kota', 'bidang_fokus', 'thn_pelaksanaan_kegiatan as tahun', 'nama_skema as skema')
                ->orderByDesc('thn_pelaksanaan_kegiatan')->limit(50)->get();

        } elseif ($bubbleType === 'Hilirisasi') {
            $query = Hilirisasi::query();
            $statsQuery = clone $query;

            $query->where(function ($q) use ($dataType, $keywordsMap) {
                if (isset($keywordsMap[$dataType])) {
                    $regex = implode('|', array_map('preg_quote', $keywordsMap[$dataType]));
                    $q->whereRaw("judul REGEXP ?", [$regex]);
                } else {
                    $q->where('judul', 'like', "%$dataType%");
                }
            });

            if ($request->filled('provinsi')) $query->whereIn('provinsi', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('tahun', (array)$request->tahun);
            if ($request->filled('skema')) $query->whereIn('skema', (array)$request->skema);
            if ($request->filled('direktorat')) $query->whereIn('direktorat', (array)$request->direktorat);

            $this->applyAdvancedQueries($query, $request, 'Hilirisasi');

            $mapData = (clone $query)->select('id', 'judul', 'nama_pengusul as nama', 'perguruan_tinggi as institusi', 'provinsi', DB::raw("NULL as kabupaten_kota"), 'pt_latitude', 'pt_longitude', 'skema', 'tahun', 'mitra', 'luaran')
                ->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->limit(5000)->get()->toArray();

            $researches = (clone $query)->select('id', 'judul', 'nama_pengusul as nama', 'perguruan_tinggi as institusi', 'provinsi', DB::raw("NULL as kabupaten_kota"), 'skema', 'tahun', 'mitra', 'luaran')
                ->orderByDesc('tahun')->limit(50)->get();

        } else { // Penelitian (Default)
            $query = Penelitian::query();
            $statsQuery = clone $query;

            $query->where(function ($q) use ($dataType, $keywordsMap) {
                if (isset($keywordsMap[$dataType])) {
                    $regex = implode('|', array_map('preg_quote', $keywordsMap[$dataType]));
                    $q->whereRaw("judul REGEXP ?", [$regex]);
                } else {
                    $q->where('judul', 'like', "%$dataType%");
                }
            });

            if ($request->filled('bidang_fokus')) $query->whereIn('bidang_fokus', (array)$request->bidang_fokus);
            if ($request->filled('tema_prioritas')) $query->whereIn('tema_prioritas', (array)$request->tema_prioritas);
            if ($request->filled('provinsi')) $query->whereIn('provinsi', (array)$request->provinsi);
            if ($request->filled('tahun')) $query->whereIn('thn_pelaksanaan', (array)$request->tahun);
            if ($request->filled('kategori_pt')) $query->whereIn('kategori_pt', (array)$request->kategori_pt);
            if ($request->filled('klaster')) $query->whereIn('klaster', (array)$request->klaster);

            $this->applyAdvancedQueries($query, $request, 'Penelitian');

            $mapData = (clone $query)->select('id', 'judul', 'nama', 'institusi', 'provinsi', 'kota as kabupaten_kota', 'pt_latitude', 'pt_longitude', 'bidang_fokus', 'thn_pelaksanaan as tahun', 'skema')
                ->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->limit(5000)->get()->toArray();

            $researches = (clone $query)->select('id', 'judul', 'nama', 'institusi', 'provinsi', 'kota as kabupaten_kota', 'bidang_fokus', 'thn_pelaksanaan as tahun', 'skema')
                ->orderByDesc('thn_pelaksanaan')->limit(50)->get();
        }

        // 2. Stats calculation - NOT filtered by Permasalahan keywords (Global Stats)
        $stats = Cache::remember("permasalahan_global_stats_{$bubbleType}_{$request->batch_type}", 3600, function() use ($statsQuery, $bubbleType) {
            if ($bubbleType === 'Hilirisasi') {
                return [
                    'totalResearch'    => (clone $statsQuery)->count(),
                    'totalUniversities'=> (clone $statsQuery)->distinct('perguruan_tinggi')->count('perguruan_tinggi'),
                    'totalProvinces'   => (clone $statsQuery)->distinct('provinsi')->count('provinsi'),
                    'totalFields'      => 0,
                ];
            } elseif ($bubbleType === 'Pengabdian') {
                return [
                    'totalResearch'    => (clone $statsQuery)->count(),
                    'totalUniversities'=> (clone $statsQuery)->distinct('nama_institusi')->count('nama_institusi'),
                    'totalProvinces'   => (clone $statsQuery)->distinct('prov_pt')->count('prov_pt'),
                    'totalFields'      => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus'),
                ];
            } else {
                return [
                    'totalResearch'    => (clone $statsQuery)->count(),
                    'totalUniversities'=> (clone $statsQuery)->distinct('institusi')->count('institusi'),
                    'totalProvinces'   => (clone $statsQuery)->distinct('provinsi')->count('provinsi'),
                    'totalFields'      => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus'),
                ];
            }
        });

        // 3. Choropleth data
        $displayNameMap = [
            'sampah' => 'Sampah', 
            'stunting' => 'Stunting', 
            'gizi_buruk' => 'Gizi Buruk', 
            'krisis_listrik' => 'Krisis Listrik', 
            'ketahanan_pangan' => 'Ketahanan Pangan'
        ];
        
        $permasalahanStats = Cache::remember('permasalahan_choropleth_stats', 86400, function () use ($displayNameMap) {
            return PermasalahanProvinsi::query()
                ->selectRaw('jenis_permasalahan, provinsi, nilai, satuan, metrik, tahun')
                ->get()
                ->groupBy('jenis_permasalahan')
                ->map(fn($items) => $items->map(fn($item) => [
                    'provinsi' => $item->provinsi,
                    'nilai'    => $item->nilai,
                    'satuan'   => $item->satuan,
                    'metrik'   => $item->metrik,
                    'tahun'    => $item->tahun,
                ])->values()->toArray())
                ->mapWithKeys(fn($items, $jenis) => [
                    $displayNameMap[$jenis] ?? $jenis => $items
                ])
                ->toArray();
        });

        $permasalahanKabupatenStats = Cache::remember('permasalahan_kabupaten_choropleth_stats', 86400, function () use ($displayNameMap) {
            return PermasalahanKabupaten::all()->groupBy('jenis_permasalahan')->map(fn($items) => $items->map(fn($item) => [
                'kabupaten_kota' => $item->kabupaten_kota,
                'provinsi' => $item->provinsi, 
                'nilai' => $item->nilai, 
                'satuan' => $item->satuan, 
                'tahun' => $item->tahun
            ])->values()->toArray())->mapWithKeys(fn($items, $jenis) => [$displayNameMap[$jenis] ?? $jenis => $items])->toArray();
        });

        $jenisPermasalahan = array_keys($permasalahanStats);
        
        // 4. Get consolidated filter options (for dynamic switching)
        $allFilterOptions = [
            'Penelitian' => [
                'bidangFokus' => Cache::remember('filter_bidang_fokus', 7200, fn() => DB::table('penelitian')->select('bidang_fokus')->whereNotNull('bidang_fokus')->distinct()->orderBy('bidang_fokus')->pluck('bidang_fokus')->filter()->values()),
                'temaPrioritas' => Cache::remember('filter_tema_prioritas', 7200, fn() => DB::table('penelitian')->select('tema_prioritas')->whereNotNull('tema_prioritas')->distinct()->orderBy('tema_prioritas')->pluck('tema_prioritas')->filter()->values()),
                'kategoriPT' => Cache::remember('filter_kategori_pt', 7200, fn() => DB::table('penelitian')->select('kategori_pt')->whereNotNull('kategori_pt')->distinct()->orderBy('kategori_pt')->pluck('kategori_pt')->filter()->values()),
                'klaster' => Cache::remember('filter_klaster', 7200, fn() => DB::table('penelitian')->select('klaster')->whereNotNull('klaster')->distinct()->orderBy('klaster')->pluck('klaster')->filter()->values()),
                'provinsi' => Cache::remember('filter_provinsi', 7200, fn() => DB::table('penelitian')->select('provinsi')->whereNotNull('provinsi')->distinct()->orderBy('provinsi')->pluck('provinsi')->filter()->values()),
                'tahun' => Cache::remember('filter_tahun', 7200, fn() => DB::table('penelitian')->select('thn_pelaksanaan')->whereNotNull('thn_pelaksanaan')->distinct()->orderBy('thn_pelaksanaan', 'desc')->pluck('thn_pelaksanaan')->filter()->values()),
            ],
            'Pengabdian' => [
                'bidangFokus' => Cache::remember('filter_pengabdian_bidang_fokus', 7200, fn() => DB::table('pengabdian')->select('bidang_fokus')->whereNotNull('bidang_fokus')->distinct()->orderBy('bidang_fokus')->pluck('bidang_fokus')->filter()->values()),
                'provinsi' => Cache::remember('filter_pengabdian_provinsi', 7200, fn() => DB::table('pengabdian')->select('prov_pt')->whereNotNull('prov_pt')->distinct()->orderBy('prov_pt')->pluck('prov_pt')->filter()->values()),
                'tahun' => Cache::remember('filter_pengabdian_tahun', 7200, fn() => DB::table('pengabdian')->select('thn_pelaksanaan_kegiatan')->whereNotNull('thn_pelaksanaan_kegiatan')->distinct()->orderBy('thn_pelaksanaan_kegiatan', 'desc')->pluck('thn_pelaksanaan_kegiatan')->filter()->values()),
                'skema' => Cache::remember('filter_pengabdian_skema', 7200, fn() => DB::table('pengabdian')->select('nama_skema')->whereNotNull('nama_skema')->distinct()->orderBy('nama_skema')->pluck('nama_skema')->filter()->values()),
                'batchType' => [
                    'Multitahun, Batch I & Batch II',
                    'Kosabangsa'
                ],
            ],
            'Hilirisasi' => [
                'skema' => Cache::remember('filter_hilirisasi_skema', 7200, function() {
                    $fromDb = DB::table('hilirisasi')->select('skema')->whereNotNull('skema')->distinct()->orderBy('skema')->pluck('skema')->filter()->values()->toArray();
                    $manual = [
                        'A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi',
                        'A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI',
                        'A3: Pengembangan produk inovasi bersama DUDI',
                        'A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering',
                        'B1: Penyelesaian persoalan yang ada di masyarakat',
                        'B2: Penyelesaian persoalan yang ada di Institusi Pemerintah',
                        'Penyelesaian persoalan yang ada di masyarakat atau Institusi Pemerintah (termasuk kegiatan pengabdian masyarakat, penyusunan naskah akademik, kebijakan, rekomendasi, dan bentuk penyelesaian lainnya)',
                        'Penyediaan jasa, tenaga ahli, dan produk kepakaran perguruan tinggi untuk Dunia Usaha Dunia Industri (DUDI) / masyarakat (termasuk bentuk kegiatan pelatihan, pembinaan, dan bentuk jasa/produk lainnya)',
                        'Adopsi atau difusi, hilirisasi, komersialisasi produk, purwarupa, teknologi, kebijakan (termasuk mini-plant, teaching factory, teaching industry) untuk memenuhi kebutuhan mitra',
                        'Pembentukan atau penguatan research and innovation center atau pusat unggulan teknologi (Centre of Excellence/CoE) bersama DUDI untuk menjadi pusat kajian atau riset untuk pengembangan DUDI atau untuk penyelesaian permasalahan DUDI',
                        'Penerapan rencana bisnis and business model canvas (BMC) untuk Startup (termasuk UMKM) yang dibangun oleh perguruan tinggi bekerja sama dengan DUDI maupun oleh mahasiswa bekerja sama dengan alumni and/atau DUDI dibawah supervisi dosen',
                        'Dorongan Teknologi - Tim Pakar/Pengkaji',
                        'Ajakan Industri PT - 1 Tahun',
                        'Ajakan Industri PT - 2 Tahun',
                        'Ajakan Industri PT - 3 Tahun',
                        'Hilirisasi Inovasi Komersial',
                        'Hilirisasi Inovasi Sosial'
                    ];
                    return array_values(array_unique(array_merge($manual, $fromDb)));
                }),
                'provinsi' => Cache::remember('filter_hilirisasi_provinsi', 7200, fn() => DB::table('hilirisasi')->select('provinsi')->whereNotNull('provinsi')->distinct()->orderBy('provinsi')->pluck('provinsi')->filter()->values()),
                'tahun' => Cache::remember('filter_hilirisasi_tahun', 7200, fn() => DB::table('hilirisasi')->select('tahun')->whereNotNull('tahun')->distinct()->orderBy('tahun', 'desc')->pluck('tahun')->filter()->values()),
                'direktorat' => Cache::remember('filter_hilirisasi_direktorat', 7200, function() {
                    $fromDb = DB::table('hilirisasi')->select('direktorat')->whereNotNull('direktorat')->distinct()->orderBy('direktorat')->pluck('direktorat')->filter()->values()->toArray();
                    $manual = ['Direktorat Hilirisasi dan Kemitraan', 'DIKSI', 'DIKTI'];
                    return array_values(array_unique(array_merge($manual, $fromDb)));
                }),
            ]
        ];

        return Inertia::render('Permasalahan', [
            'mapData'                    => $mapData, // First 5000 for initial load
            'totalMapMarkers'            => (clone $query)->whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
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
