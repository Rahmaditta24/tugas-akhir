<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class PermasalahanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $baseData = $request->get('baseData', 'statistik');

        if ($baseData === 'statistik') {
            return $this->handleStatistikMode($request);
        }

        return $this->handleResearchMode($request);
    }

    /**
     * Handle JSON-based statistics mode.
     */
    private function handleStatistikMode(Request $request)
    {
        $perPage = (int)$request->get('perPage', 20);
        $jenis = $request->get('jenis', 'Sampah');
        if (!$jenis || $jenis === 'all') $jenis = 'Sampah';
        
        $search = $request->get('search');
        $activeTab = $request->get('tab', 'provinsi');
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'asc');

        $normalizedJenis = strtolower(str_replace(' ', '_', $jenis));
        $baseDir = realpath(base_path('..'.DIRECTORY_SEPARATOR.'peta-bima'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.'permasalahan'));
        $rows = [];
        $kabRows = [];

        $jsonMap = [
            'sampah' => 'data-permasalahan-sampah.json',
            'stunting' => 'data-permasalahan-stunting.json',
            'gizi_buruk' => 'data-permasalahan-gizi-buruk.json',
            'krisis_listrik' => 'data-permasalahan-krisis-listrik.json',
            'ketahanan_pangan' => 'data-permasalahan-ketahanan-pangan.json',
        ];

        $cacheKey = "permasalahan_json_{$normalizedJenis}";
        $rawRows = Cache::remember($cacheKey, 3600, function() use ($baseDir, $jsonMap, $normalizedJenis) {
            $rows = [];
            $kabRows = [];
            
            if (isset($jsonMap[$normalizedJenis])) {
                $path = $baseDir.DIRECTORY_SEPARATOR.$jsonMap[$normalizedJenis];
                if (is_file($path)) {
                    $json = json_decode(file_get_contents($path), true);
                    
                    // Provinsi Mapping
                    $provData = $json['Provinsi'] ?? ($json['Sheet1'] ?? []);
                    foreach ($provData as $r) {
                        $rows[] = [
                            'provinsi' => $r['Provinsi'] ?? '',
                            'jenis_permasalahan' => $normalizedJenis,
                            'timbulan_tahunan_ton' => isset($r['Timbulan Sampah Tahunan(ton)']) ? (float)$r['Timbulan Sampah Tahunan(ton)'] : null,
                            'persentase' => isset($r['Persentase']) ? (float)$r['Persentase'] : null,
                            'ikp' => isset($r['IKP']) ? (float)$r['IKP'] : null,
                            'saidi' => isset($r['SAIDI (Jam/Pelanggan)']) ? (float)$r['SAIDI (Jam/Pelanggan)'] : null,
                            'saifi' => isset($r['SAIFI (Kali/Pelanggan)']) ? (float)$r['SAIFI (Kali/Pelanggan)'] : null,
                            'satuan_pln_provinsi' => $r['Satuan PLN/Provinsi'] ?? null,
                        ];
                    }

                    // Kabupaten Mapping
                    foreach (($json['Kabupaten'] ?? []) as $r) {
                        $kabRows[] = [
                            'kabupaten_kota' => $r['Kabupaten/Kota'] ?? '',
                            'provinsi' => $r['Provinsi'] ?? null,
                            'jenis_permasalahan' => $normalizedJenis,
                            'timbulan_tahunan_ton' => isset($r['Timbulan Sampah Tahunan(ton)']) ? (float)$r['Timbulan Sampah Tahunan(ton)'] : null,
                            'persentase' => isset($r['Persentase']) ? (float)$r['Persentase'] : null,
                            'ikp' => isset($r['IKP']) ? (float)$r['IKP'] : null,
                        ];
                    }
                }
            }
            return ['prov' => $rows, 'kab' => $kabRows];
        });

        $rows = $rawRows['prov'];
        $kabRows = $rawRows['kab'];

        if ($search) {
            $needle = mb_strtolower($search);
            $rows = array_values(array_filter($rows, function($row) use ($needle) {
                $hay = mb_strtolower(trim(($row['provinsi'] ?? '').' '.($row['jenis_permasalahan'] ?? '')));
                return strpos($hay, $needle) !== false;
            }));
            $kabRows = array_values(array_filter($kabRows, function($row) use ($needle) {
                $hay = mb_strtolower(trim(($row['kabupaten_kota'] ?? '').' '.($row['provinsi'] ?? '').' '.($row['jenis_permasalahan'] ?? '')));
                return strpos($hay, $needle) !== false;
            }));
        }

        // Sorting
        usort($rows, function($a, $b) use ($sort, $direction) {
            // Aceh first
            $ap = ($a['provinsi'] ?? '');
            $bp = ($b['provinsi'] ?? '');
            if ($ap === 'Aceh' && $bp !== 'Aceh') return -1;
            if ($bp === 'Aceh' && $ap !== 'Aceh') return 1;
            
            $va = $a[$sort] ?? ($a['provinsi'] ?? null);
            $vb = $b[$sort] ?? ($b['provinsi'] ?? null);
            
            if (is_numeric($va) && is_numeric($vb)) {
                $cmp = $va <=> $vb;
            } else {
                $cmp = strcasecmp((string)$va, (string)$vb);
            }
            
            return $direction === 'asc' ? $cmp : -$cmp;
        });
        
        usort($kabRows, function($a, $b) {
            return strcasecmp((string)($a['kabupaten_kota'] ?? ''), (string)($b['kabupaten_kota'] ?? ''));
        });

        // Pagination
        $page = (int)($request->get('provPage', $request->get('page', 1)));
        $total = count($rows);
        $slice = array_slice($rows, ($page - 1) * $perPage, $perPage);
        $permasalahanProvinsi = new LengthAwarePaginator(
            $slice, $total, $perPage, $page, ['path' => $request->url(), 'query' => $request->query()]
        );

        $kabPage = (int)($request->get('kabPage', 1));
        $totalKab = count($kabRows);
        $sliceKab = array_slice($kabRows, ($kabPage - 1) * $perPage, $perPage);
        $permasalahanKabupaten = new LengthAwarePaginator($sliceKab, $totalKab, $perPage, $kabPage, ['path' => $request->url(), 'query' => $request->query()]);

        $stats = [
            'totalProvinsi' => count($rows),
            'totalKabupaten' => count($kabRows),
            'total' => count($rows) + count($kabRows),
        ];

        return Inertia::render('Admin/Permasalahan/Index', [
            'permasalahanProvinsi' => $permasalahanProvinsi,
            'permasalahanKabupaten' => $permasalahanKabupaten,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
                'baseData' => 'statistik',
                'jenis' => $jenis,
                'tab' => $activeTab,
            ],
        ]);
    }

    /**
     * Handle Database-based research overlaps mode.
     */
    private function handleResearchMode(Request $request)
    {
        $perPage = (int)$request->get('perPage', 20);
        $baseData = $request->get('baseData', 'penelitian');
        $jenis = $request->get('jenis', 'Sampah');
        $batch_type = $request->get('batch_type');
        $search = $request->get('search');
        $columnFilters = $request->get('columns', []);
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');

        if (!$jenis || $jenis === 'all') $jenis = 'Sampah';

        // Keywords mapping from Public controller for consistent counts (Extensive list)
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

        // Default 'batch_type' for Pengabdian to match public dashboard
        if ($baseData === 'pengabdian' && (!$batch_type || $batch_type === 'all')) {
            $batch_type = 'Multitahun Lanjutan, Batch I & Batch II';
            $request->merge(['batch_type' => $batch_type]);
        }

        $query = match($baseData) {
            'pengabdian' => \App\Models\Pengabdian::query(),
            'hilirisasi' => \App\Models\Hilirisasi::query(),
            default => \App\Models\Penelitian::query()
        };

        if (isset($keywordsMap[$jenis])) {
            $regex = implode('|', array_map('preg_quote', $keywordsMap[$jenis]));
            $query->where(function ($q) use ($regex, $baseData) {
                $q->whereRaw("judul REGEXP ?", [$regex]);
                if ($baseData === 'pengabdian') $q->orWhereRaw("bidang_fokus REGEXP ?", [$regex]);
            });
        }

        if ($baseData === 'pengabdian' && $batch_type) {
            $bts = (array)$batch_type;
            if (in_array('Multitahun Lanjutan, Batch I & Batch II', $bts)) {
                $bts = array_merge($bts, ['multitahun_lanjutan', 'batch_ii', 'batch_i']);
            }
            $query->whereIn('batch_type', $bts);
        }

        if ($search) {
            $query->where('judul', 'like', "%{$search}%");
        }

        if (is_array($columnFilters)) {
            foreach ($columnFilters as $col => $val) {
                if (!$val) continue;
                $dbCol = match($col) {
                    'peneliti' => $baseData === 'penelitian' ? 'nama' : 'nama_pengusul',
                    'institusi' => match($baseData) { 'penelitian' => 'institusi', 'pengabdian' => 'nama_institusi', default => 'perguruan_tinggi' },
                    'provinsi' => $baseData === 'pengabdian' ? 'prov_pt' : 'provinsi',
                    'tahun' => match($baseData) { 'penelitian' => 'thn_pelaksanaan', 'pengabdian' => 'thn_pelaksanaan_kegiatan', default => 'tahun' },
                    default => $col
                };
                $query->where($dbCol, 'like', "%{$val}%");
            }
        }

        // Logic for default sorting
        if (!$sort || $sort === 'id' || 
            ($baseData === 'penelitian' && $sort === 'thn_pelaksanaan_kegiatan') ||
            ($baseData === 'pengabdian' && $sort === 'thn_pelaksanaan') ||
            ($baseData === 'hilirisasi' && ($sort === 'thn_pelaksanaan' || $sort === 'thn_pelaksanaan_kegiatan')) ||
            (!in_array($sort, ['id', 'judul', 'nama', 'nama_pengusul', 'institusi', 'perguruan_tinggi', 'tahun', 'thn_pelaksanaan', 'thn_pelaksanaan_kegiatan', 'provinsi']))
        ) {
            if ($baseData === 'penelitian') $sort = 'thn_pelaksanaan';
            elseif ($baseData === 'pengabdian') $sort = 'thn_pelaksanaan_kegiatan';
            elseif ($baseData === 'hilirisasi') $sort = 'tahun';
            else $sort = 'id';
            
            if (!$request->has('direction')) {
                $direction = 'desc';
            }
        }

        $v = Cache::get('permasalahan_admin_v', 1);
        $statsHash = md5(json_encode(['fullStats', $baseData, $jenis, $batch_type, $search, $columnFilters]));
        
        $stats = Cache::remember("perm_adm_fullstats_v{$v}_{$statsHash}", 3600, function() use ($query, $baseData) {
            $q = clone $query;
            $distinctCol = match($baseData) { 'penelitian' => 'institusi', 'pengabdian' => 'nama_institusi', default => 'perguruan_tinggi' };
            $provCol = ($baseData === 'pengabdian') ? 'prov_pt' : 'provinsi';
            
            $res = $q->selectRaw("COUNT(*) as total, COUNT(DISTINCT {$distinctCol}) as totalInstitusi, COUNT(DISTINCT {$provCol}) as totalProvinsi")->first();
            return [
                'total' => (int)($res->total ?? 0),
                'totalInstitusi' => (int)($res->totalInstitusi ?? 0),
                'totalProvinsi' => (int)($res->totalProvinsi ?? 0),
            ];
        });

        $results = new LengthAwarePaginator(
            $query->orderBy($sort, $direction)->offset(($request->get('page', 1) - 1) * $perPage)->limit($perPage)->get(),
            $stats['total'],
            $perPage,
            $request->get('page', 1),
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Admin/Permasalahan/Index', [
            'data' => $results,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
                'baseData' => $baseData,
                'jenis' => $jenis,
                'batch_type' => $batch_type,
                'listrikMode' => $request->get('listrikMode', 'SAIDI'),
                'columns' => $columnFilters,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * AJAX endpoint for statistics loading.
     */
    public function getStats(Request $request)
    {
        $baseData = $request->get('baseData', 'penelitian');
        $jenis = $request->get('jenis', 'Sampah');
        $batch_type = $request->get('batch_type');
        $search = $request->get('search');
        $columnFilters = $request->get('columns', []);

        $v = Cache::get('permasalahan_admin_v', 1);
        $statsHash = md5(json_encode(['fullStats', $baseData, $jenis, $batch_type, $search, $columnFilters]));

        $data = Cache::remember("perm_adm_fullstats_v{$v}_{$statsHash}", 7200, function() use ($baseData, $jenis, $batch_type, $search, $columnFilters) {
            $query = match($baseData) {
                'pengabdian' => \App\Models\Pengabdian::query(),
                'hilirisasi' => \App\Models\Hilirisasi::query(),
                default => \App\Models\Penelitian::query()
            };

            $keywordsMap = [
                'Sampah' => ['sampah', 'limbah', 'waste', 'recycle', 'daur ulang', 'plastic', 'plastik', 'pencemaran', 'polusi', 'lingkungan', 'ekosistem', 'sanitasi', 'kehutanan', 'konservasi', 'sungai', 'laut', 'residu', 'biomassa', 'waste-to-energy', 'tPA', 'pengelolaan sampah', 'sampah kota'],
                'Stunting' => ['stunting', 'tengkes', 'kerdil', 'gizi', 'pendek', 'balita', 'bayi', 'anak', 'ibu hamil', 'puskesmas', 'posyandu', 'pertumbuhan', 'perkembangan', 'nutrisi', 'malnutrisi', 'pangan bergizi', 'pola makan', 'asupan gizi'],
                'Gizi Buruk' => ['gizi buruk', 'malnutrisi', 'nutrisi', 'stunting', 'kurus', 'vitamin', 'protein', 'karbo', 'lemak', 'kesehatan', 'medis', 'klinis', 'asupan', 'pola makan', 'gizi seimbang', 'beban ganda malnutrisi'],
                'Krisis Listrik' => ['listrik', 'energi', 'saidi', 'saifi', 'power', 'pembangkit', 'pln', 'panel', 'solar', 'baterai', 'tegangan', 'arus', 'mikrohidro', 'angin', 'elektro', 'otomatisasi', 'smart grid', 'elektrifikasi', 'energi terbarukan', 'transisi energi', 'panel surya', 'biofuel'],
                'Ketahanan Pangan' => ['pangan', 'makanan', 'food', 'beras', 'pertanian', 'pasokan pangan', 'padi', 'jagung', 'kedelai', 'ternak', 'ikan', 'panen', 'pupuk', 'hama', 'sawah', 'irigasi', 'tani', 'swasembada', 'benih', 'bioteknologi pangan', 'smart farming', 'diversifikasi pangan', 'produksi pangan'],
            ];

            if (isset($keywordsMap[$jenis])) {
                $regex = implode('|', array_map('preg_quote', $keywordsMap[$jenis]));
                $query->where(function ($q) use ($regex, $baseData) {
                    $q->whereRaw("judul REGEXP ?", [$regex]);
                    if ($baseData === 'pengabdian') $q->orWhereRaw("bidang_fokus REGEXP ?", [$regex]);
                });
            }

            if ($baseData === 'pengabdian' && $batch_type) {
                $bts = (array)$batch_type;
                if (in_array('Multitahun Lanjutan, Batch I & Batch II', $bts)) $bts = array_merge($bts, ['multitahun_lanjutan', 'batch_ii', 'batch_i']);
                $query->whereIn('batch_type', $bts);
            }

            if ($search) $query->where('judul', 'like', "%{$search}%");

            if (is_array($columnFilters)) {
                foreach ($columnFilters as $col => $val) {
                    if (!$val) continue;
                    $dbCol = match($col) {
                        'peneliti' => $baseData === 'penelitian' ? 'nama' : 'nama_pengusul',
                        'institusi' => match($baseData) { 'penelitian' => 'institusi', 'pengabdian' => 'nama_institusi', default => 'perguruan_tinggi' },
                        'provinsi' => $baseData === 'pengabdian' ? 'prov_pt' : 'provinsi',
                        'tahun' => match($baseData) { 'penelitian' => 'thn_pelaksanaan', 'pengabdian' => 'thn_pelaksanaan_kegiatan', default => 'tahun' },
                        default => $col
                    };
                    $query->where($dbCol, 'like', "%{$val}%");
                }
            }

            $distinctCol = match($baseData) { 'penelitian' => 'institusi', 'pengabdian' => 'nama_institusi', default => 'perguruan_tinggi' };
            $provCol = ($baseData === 'pengabdian') ? 'prov_pt' : 'provinsi';

            $res = $query->selectRaw("COUNT(*) as total, COUNT(DISTINCT {$distinctCol}) as totalInstitusi, COUNT(DISTINCT {$provCol}) as totalProvinsi")->first();

            return [
                'total' => (int)($res->total ?? 0),
                'totalInstitusi' => (int)($res->totalInstitusi ?? 0),
                'totalProvinsi' => (int)($res->totalProvinsi ?? 0),
            ];
        });

        return response()->json($data);
    }

    /**
     * CSV Export implementation.
     */
    public function exportCsv(Request $request)
    {
        $baseData = $request->get('baseData', 'statistik');
        $jenis = $request->get('jenis', 'Sampah');
        $search = $request->get('search');
        $columnFilters = $request->get('columns', []);

        $safeJenis = strtolower(str_replace(' ', '_', $jenis));
        $fileName = "permasalahan_{$baseData}_{$safeJenis}.csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($baseData, $jenis, $search, $columnFilters) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            if ($baseData === 'statistik') {
                $normalizedJenis = strtolower(str_replace(' ', '_', $jenis));
                $header = match($normalizedJenis) {
                    'sampah' => ['Wilayah', 'Jenis', 'Timbulan Sampah Tahunan(ton)'],
                    'krisis_listrik' => ['Wilayah', 'Jenis', 'Satuan PLN/Provinsi', 'SAIDI (Jam/Pelanggan)', 'SAIFI (Kali/Pelanggan)'],
                    'ketahanan_pangan' => ['Wilayah', 'Jenis', 'IKP'],
                    default => ['Wilayah', 'Jenis', 'Persentase']
                };
                
                fputcsv($file, $header);

                $baseDir = realpath(base_path('..'.DIRECTORY_SEPARATOR.'peta-bima'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.'permasalahan'));
                $jsonMap = [
                    'sampah' => 'data-permasalahan-sampah.json',
                    'stunting' => 'data-permasalahan-stunting.json',
                    'gizi_buruk' => 'data-permasalahan-gizi-buruk.json',
                    'krisis_listrik' => 'data-permasalahan-krisis-listrik.json',
                    'ketahanan_pangan' => 'data-permasalahan-ketahanan-pangan.json',
                ];

                if (isset($jsonMap[$normalizedJenis])) {
                    $path = $baseDir.DIRECTORY_SEPARATOR.$jsonMap[$normalizedJenis];
                    if (is_file($path)) {
                        $json = json_decode(file_get_contents($path), true);
                        $provData = $json['Provinsi'] ?? ($json['Sheet1'] ?? []);
                        foreach ($provData as $r) {
                            $row = match($normalizedJenis) {
                                'sampah' => [$r['Provinsi'] ?? '', 'Sampah', $r['Timbulan Sampah Tahunan(ton)'] ?? 0],
                                'krisis_listrik' => [$r['Provinsi'] ?? '', 'Krisis Listrik', $r['Satuan PLN/Provinsi'] ?? '', $r['SAIDI (Jam/Pelanggan)'] ?? 0, $r['SAIFI (Kali/Pelanggan)'] ?? 0],
                                'ketahanan_pangan' => [$r['Provinsi'] ?? '', 'Ketahanan Pangan', $r['IKP'] ?? 0],
                                default => [$r['Provinsi'] ?? '', ucwords(str_replace('_', ' ', $normalizedJenis)), $r['Persentase'] ?? 0]
                            };
                            fputcsv($file, $row);
                        }
                    }
                }
            } else {
                fputcsv($file, ['Judul', 'Peneliti/Pengusul', 'Institusi', 'Provinsi', 'Tahun', 'Tipe Data']);
                
                $query = match($baseData) {
                    'pengabdian' => \App\Models\Pengabdian::query(),
                    'hilirisasi' => \App\Models\Hilirisasi::query(),
                    default => \App\Models\Penelitian::query()
                };

                $keywordsMap = [
                    'Sampah' => ['sampah', 'limbah', 'waste', 'recycle', 'daur ulang', 'plastic', 'plastik', 'pencemaran', 'polusi', 'lingkungan', 'ekosistem', 'sanitasi', 'kehutanan', 'konservasi', 'sungai', 'laut', 'residu', 'biomassa', 'waste-to-energy', 'tPA', 'pengelolaan sampah', 'sampah kota'],
                    'Stunting' => ['stunting', 'tengkes', 'kerdil', 'gizi', 'pendek', 'balita', 'bayi', 'anak', 'ibu hamil', 'puskesmas', 'posyandu', 'pertumbuhan', 'perkembangan', 'nutrisi', 'malnutrisi', 'pangan bergizi', 'pola makan', 'asupan gizi'],
                    'Gizi Buruk' => ['gizi buruk', 'malnutrisi', 'nutrisi', 'stunting', 'kurus', 'vitamin', 'protein', 'karbo', 'lemak', 'kesehatan', 'medis', 'klinis', 'asupan', 'pola makan', 'gizi seimbang', 'beban ganda malnutrisi'],
                    'Krisis Listrik' => ['listrik', 'energi', 'saidi', 'saifi', 'power', 'pembangkit', 'pln', 'panel', 'solar', 'baterai', 'tegangan', 'arus', 'mikrohidro', 'angin', 'elektro', 'otomatisasi', 'smart grid', 'elektrifikasi', 'energi terbarukan', 'transisi energi', 'panel surya', 'biofuel'],
                    'Ketahanan Pangan' => ['pangan', 'makanan', 'food', 'beras', 'pertanian', 'pasokan pangan', 'padi', 'jagung', 'kedelai', 'ternak', 'ikan', 'panen', 'pupuk', 'hama', 'sawah', 'irigasi', 'tani', 'swasembada', 'benih', 'bioteknologi pangan', 'smart farming', 'diversifikasi pangan', 'produksi pangan'],
                ];

                if ($jenis !== 'all' && isset($keywordsMap[$jenis])) {
                    $regex = implode('|', array_map('preg_quote', $keywordsMap[$jenis]));
                    $query->where(function ($q) use ($regex, $baseData) {
                        $q->whereRaw("judul REGEXP ?", [$regex]);
                        if ($baseData === 'pengabdian') $q->orWhereRaw("bidang_fokus REGEXP ?", [$regex]);
                    });
                }

                if ($search) $query->where('judul', 'like', "%{$search}%");

                $query->chunk(500, function($items) use ($file, $baseData) {
                    foreach ($items as $item) {
                        $judul = str_replace(["\r", "\n"], ' ', $item->judul);
                        if ($baseData === 'penelitian') {
                            fputcsv($file, [$judul, $item->nama, $item->institusi, $item->provinsi, $item->thn_pelaksanaan, 'Penelitian']);
                        } elseif ($baseData === 'pengabdian') {
                            fputcsv($file, [$judul, $item->nama, $item->nama_institusi, $item->prov_pt, $item->thn_pelaksanaan_kegiatan, 'Pengabdian']);
                        } else {
                            fputcsv($file, [$judul, $item->nama_pengusul, $item->perguruan_tinggi, $item->provinsi, $item->tahun, 'Hilirisasi']);
                        }
                    }
                });
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function create() { return Inertia::render('Admin/Permasalahan/Create'); }

    public function store(Request $request)
    {
        $v = $request->validate(['type' => 'required', 'provinsi' => 'nullable', 'kabupaten_kota' => 'nullable', 'jenis_permasalahan' => 'required', 'nilai' => 'nullable', 'satuan' => 'nullable', 'metrik' => 'nullable', 'tahun' => 'nullable']);
        if ($v['type'] === 'provinsi') PermasalahanProvinsi::create($v);
        else PermasalahanKabupaten::create($v);
        $this->clearModuleCache();
        return redirect()->route('admin.permasalahan.index')->with('success', 'Data ditambahkan');
    }

    public function edit(Request $request, $id)
    {
        $type = $request->get('type', 'provinsi');
        $p = ($type === 'provinsi') ? PermasalahanProvinsi::findOrFail($id) : PermasalahanKabupaten::findOrFail($id);
        $p->type = $type;
        return Inertia::render('Admin/Permasalahan/Edit', ['permasalahan' => $p, 'filters' => $request->all()]);
    }

    public function update(Request $request, $id)
    {
        $v = $request->validate(['type' => 'required', 'provinsi' => 'nullable', 'kabupaten_kota' => 'nullable', 'jenis_permasalahan' => 'required', 'nilai' => 'nullable', 'satuan' => 'nullable', 'metrik' => 'nullable', 'tahun' => 'nullable']);
        $p = ($v['type'] === 'provinsi') ? PermasalahanProvinsi::findOrFail($id) : PermasalahanKabupaten::findOrFail($id);
        $p->update($v);
        $this->clearModuleCache();
        return redirect()->route('admin.permasalahan.index')->with('success', 'Data diperbarui');
    }

    public function importExcel(Request $request)
    {
        $data = $request->get('data', []);
        $type = $request->get('type', 'provinsi');
        $tahun = (int) ($request->get('tahun', date('Y')));
        $imported = 0;
        $errors = [];

        if (empty($data)) {
            return back()->with('error', 'Data import kosong atau tidak terbaca.');
        }

        foreach ($data as $index => $row) {
            $rowNum = $index + 1;
            
            $normalizedRow = [];
            foreach ($row as $k => $v) {
                $cleanKey = strtolower(str_replace([' ', '/', '_'], '', $k));
                $normalizedRow[$cleanKey] = $v;
            }

            $prov = $normalizedRow['provinsi'] ?? $normalizedRow['wilayah'] ?? '';
            $kab = $normalizedRow['kabupatenkota'] ?? $normalizedRow['kabupaten'] ?? $normalizedRow['kota'] ?? '';
            $nilai = $normalizedRow['nilai'] ?? $normalizedRow['timbulansampahtahunanton'] ?? $normalizedRow['persentase'] ?? $normalizedRow['ikp'] ?? null;
            $jenis = $normalizedRow['jenispermasalahan'] ?? $normalizedRow['jenis'] ?? 'sampah';

            if ($type === 'provinsi' && empty($prov)) {
                $errors[] = "Baris #{$rowNum}: Kolom 'Provinsi' wajib diisi."; continue;
            }
            if ($type === 'kabupaten' && empty($kab)) {
                $errors[] = "Baris #{$rowNum}: Kolom 'Kabupaten/Kota' wajib diisi."; continue;
            }
            if ($nilai === null || $nilai === '') {
                $errors[] = "Baris #{$rowNum}: Kolom 'Nilai' tidak boleh kosong."; continue;
            }
            if (!is_numeric($nilai)) {
                $errors[] = "Baris #{$rowNum}: Kolom 'Nilai' harus berupa angka (ditemukan: '{$nilai}')."; continue;
            }

            if ($type === 'provinsi') {
                PermasalahanProvinsi::updateOrCreate(
                    ['provinsi' => $prov, 'jenis_permasalahan' => $jenis, 'tahun' => $tahun],
                    ['nilai' => (float)$nilai, 'satuan' => $normalizedRow['satuan'] ?? '']
                );
            } else {
                PermasalahanKabupaten::updateOrCreate(
                    ['kabupaten_kota' => $kab, 'provinsi' => $prov ?: null, 'jenis_permasalahan' => $jenis, 'tahun' => $tahun],
                    ['nilai' => (float)$nilai, 'satuan' => $normalizedRow['satuan'] ?? '']
                );
            }
            $imported++;
        }

        $this->clearModuleCache();

        if (count($errors) > 0) {
            $msg = "Import selesai: {$imported} data berhasil, " . count($errors) . " baris gagal.";
            $errorDetail = implode('; ', array_slice($errors, 0, 2));
            return back()->with('error', $msg . " (" . $errorDetail . "...)");
        }

        return back()->with('success', "Import selesai: {$imported} data diperbarui.");
    }

    public function destroy(Request $request, $id)
    {
        $type = $request->get('type', 'provinsi');
        $p = ($type === 'provinsi') ? PermasalahanProvinsi::findOrFail($id) : PermasalahanKabupaten::findOrFail($id);
        $p->delete();
        $this->clearModuleCache();
        return back()->with('success', 'Data dihapus');
    }

    private function clearModuleCache()
    {
        Cache::forget('permasalahan_json_sampah');
        Cache::forget('permasalahan_json_stunting');
        Cache::forget('permasalahan_json_gizi_buruk');
        Cache::forget('permasalahan_json_krisis_listrik');
        Cache::forget('permasalahan_json_ketahanan_pangan');
        Cache::increment('permasalahan_admin_v');
    }
}