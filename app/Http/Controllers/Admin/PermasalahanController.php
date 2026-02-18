<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class PermasalahanController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int)($request->get('perPage', 20));
        $baseData = $request->get('baseData', 'statistik');
        $jenis = $request->get('jenis', 'all');
        $search = $request->get('search');
        $activeTab = $request->get('tab', 'provinsi');

        // Smart default sorting: prioritize year descending for research data
        $sort = $request->get('sort');
        $direction = $request->get('direction');

        if (!$sort || $sort === 'id' || 
            ($baseData === 'penelitian' && $sort === 'thn_pelaksanaan_kegiatan') ||
            ($baseData === 'pengabdian' && $sort === 'thn_pelaksanaan') ||
            ($baseData === 'hilirisasi' && ($sort === 'thn_pelaksanaan' || $sort === 'thn_pelaksanaan_kegiatan')) ||
            ($baseData !== 'statistik' && !in_array($sort, ['id', 'judul', 'nama', 'nama_pengusul', 'institusi', 'perguruan_tinggi', 'tahun', 'thn_pelaksanaan', 'thn_pelaksanaan_kegiatan', 'provinsi']))
        ) {
            if ($baseData === 'penelitian') $sort = 'thn_pelaksanaan';
            elseif ($baseData === 'pengabdian') $sort = 'thn_pelaksanaan_kegiatan';
            elseif ($baseData === 'hilirisasi') $sort = 'tahun';
            else $sort = 'id';
            
            // Default to Descending for years
            if (!$direction || $request->get('sort') === 'id' || !$request->has('direction') || $sort !== $request->get('sort')) {
                $direction = 'desc';
            }
        }
        
        $direction = $direction ?: 'desc';

        // Mode 1: Raw Statistics (from JSON files)
        if ($baseData === 'statistik') {
            // default jenis to 'sampah' if not provided
            if (!$request->has('jenis') || $jenis === 'all') {
                $jenis = 'sampah';
            }

            $baseDir = realpath(base_path('..'.DIRECTORY_SEPARATOR.'peta-bima'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.'permasalahan'));
            $rows = [];
            $kabRows = [];

            if ($jenis === 'sampah') {
                $path = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-sampah.json';
                if (is_file($path)) {
                    $json = json_decode(file_get_contents($path), true);
                    foreach (($json['Provinsi'] ?? []) as $r) {
                        $rows[] = [
                            'provinsi' => $r['Provinsi'] ?? '',
                            'jenis_permasalahan' => 'sampah',
                            'timbulan_tahunan_ton' => isset($r['Timbulan Sampah Tahunan(ton)']) ? (float)$r['Timbulan Sampah Tahunan(ton)'] : null,
                        ];
                    }
                    foreach (($json['Kabupaten'] ?? []) as $r) {
                        $kabRows[] = [
                            'kabupaten_kota' => $r['Kabupaten/Kota'] ?? '',
                            'provinsi' => $r['Provinsi'] ?? null,
                            'jenis_permasalahan' => 'sampah',
                            'timbulan_tahunan_ton' => isset($r['Timbulan Sampah Tahunan(ton)']) ? (float)$r['Timbulan Sampah Tahunan(ton)'] : null,
                        ];
                    }
                }
            } elseif ($jenis === 'stunting') {
                $path = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-stunting.json';
                if (is_file($path)) {
                    $json = json_decode(file_get_contents($path), true);
                    foreach (($json['Provinsi'] ?? []) as $r) {
                        $rows[] = [
                            'provinsi' => $r['Provinsi'] ?? '',
                            'jenis_permasalahan' => 'stunting',
                            'persentase' => isset($r['Persentase']) ? (float)$r['Persentase'] : null,
                        ];
                    }
                    foreach (($json['Kabupaten'] ?? []) as $r) {
                        $kabRows[] = [
                            'kabupaten_kota' => $r['Kabupaten/Kota'] ?? '',
                            'provinsi' => $r['Provinsi'] ?? null,
                            'jenis_permasalahan' => 'stunting',
                            'persentase' => isset($r['Persentase']) ? (float)$r['Persentase'] : null,
                        ];
                    }
                }
            } elseif ($jenis === 'gizi_buruk') {
                $path = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-gizi-buruk.json';
                if (is_file($path)) {
                    $json = json_decode(file_get_contents($path), true);
                    foreach (($json['Provinsi'] ?? []) as $r) {
                        $rows[] = [
                            'provinsi' => $r['Provinsi'] ?? '',
                            'jenis_permasalahan' => 'gizi_buruk',
                            'persentase' => isset($r['Persentase']) ? (float)$r['Persentase'] : null,
                        ];
                    }
                    foreach (($json['Kabupaten'] ?? []) as $r) {
                        $kabRows[] = [
                            'kabupaten_kota' => $r['Kabupaten/Kota'] ?? '',
                            'provinsi' => $r['Provinsi'] ?? null,
                            'jenis_permasalahan' => 'gizi_buruk',
                            'persentase' => isset($r['Persentase']) ? (float)$r['Persentase'] : null,
                        ];
                    }
                }
            } elseif ($jenis === 'krisis_listrik') {
                $path = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-krisis-listrik.json';
                if (is_file($path)) {
                    $json = json_decode(file_get_contents($path), true);
                    foreach (($json['Sheet1'] ?? []) as $r) {
                        $rows[] = [
                            'provinsi' => $r['Provinsi'] ?? '',
                            'jenis_permasalahan' => 'krisis_listrik',
                            'satuan_pln_provinsi' => $r['Satuan PLN/Provinsi'] ?? null,
                            'saidi' => isset($r['SAIDI (Jam/Pelanggan)']) ? (float)$r['SAIDI (Jam/Pelanggan)'] : null,
                            'saifi' => isset($r['SAIFI (Kali/Pelanggan)']) ? (float)$r['SAIFI (Kali/Pelanggan)'] : null,
                        ];
                    }
                }
            } elseif ($jenis === 'ketahanan_pangan') {
                $path = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-ketahanan-pangan.json';
                if (is_file($path)) {
                    $json = json_decode(file_get_contents($path), true);
                    foreach (($json['Provinsi'] ?? []) as $r) {
                        $rows[] = [
                            'provinsi' => $r['Provinsi'] ?? '',
                            'jenis_permasalahan' => 'ketahanan_pangan',
                            'ikp' => isset($r['IKP']) ? (float)$r['IKP'] : null,
                        ];
                    }
                    foreach (($json['Kabupaten'] ?? []) as $r) {
                        $kabRows[] = [
                            'kabupaten_kota' => $r['Kabupaten/Kota'] ?? '',
                            'provinsi' => $r['Provinsi'] ?? null,
                            'jenis_permasalahan' => 'ketahanan_pangan',
                            'ikp' => isset($r['IKP']) ? (float)$r['IKP'] : null,
                        ];
                    }
                }
            }

            // Search filter by provinsi/jenis (prov tab) dan kabupaten/provinsi/jenis (kab tab)
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

            // Column filters dihilangkan sesuai permintaan

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
                // Dalam mode statistik, default gunakan ascending agar Aceh di depan
                $dir = 'asc';
                if ($direction && in_array($direction, ['asc','desc'])) $dir = $direction;
                return $dir === 'asc' ? $cmp : -$cmp;
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

            // Kabupaten paginator dari JSON jika tersedia
            $kabPage = (int)($request->get('kabPage', 1));
            $totalKab = count($kabRows);
            $sliceKab = array_slice($kabRows, ($kabPage - 1) * $perPage, $perPage);
            $permasalahanKabupaten = new LengthAwarePaginator($sliceKab, $totalKab, $perPage, $kabPage, ['path' => $request->url(), 'query' => $request->query()]);

            $stats = [
                'totalProvinsi' => $total,
                'totalKabupaten' => $totalKab,
                'total' => $total + $totalKab,
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
                    'baseData' => $baseData,
                    'jenis' => $jenis,
                    'tab' => $activeTab,
                ],
            ]);
        }

        // Mode 2: Research Overlay (The keyword matching view)
        $keywords = [
            'sampah' => [
                'sampah', 'limbah', 'waste', 'recycle', 'daur ulang', 'plastic', 'plastik', 'pencemaran', 
                'polusi', 'lingkungan', 'ekosistem', 'sanitasi', 'kehutanan', 'konservasi', 'sungai', 'laut'
            ],
            'stunting' => [
                'stunting', 'tengkes', 'kerdil', 'gizis', 'pendek', 'balita', 'bayi', 'anak', 'ibu ham', 
                'puskesmas', 'posyandu', 'pertumbuhan', 'perkembangan', 'nutrisi'
            ],
            'gizi_buruk' => [
                'gizi buruk', 'malnutrisi', 'nutrisi', 'stunting', 'kurus', 'vitamin', 'protein', 'karbo', 
                'lemak', 'kesehatan', 'medis', 'klinis', 'asupan', 'pola makan'
            ],
            'krisis_listrik' => [
                'listrik', 'energi', 'saidi', 'saifi', 'power', 'pembangkit', 'pln', 'panel', 'solar', 
                'baterai', 'tegangan', 'arus', 'mikrohidro', 'angin', 'elektro', 'otomat'
            ],
            'ketahanan_pangan' => [
                'pangan', 'makanan', 'food', 'beras', 'pertanian', 'pasokan pangan', 'padi', 'jagung', 
                'kedelai', 'ternak', 'ikan', 'panen', 'pupuk', 'hama', 'sawah', 'irigasi', 'tani'
            ],
        ];

        $query = null;
        if ($baseData === 'pengabdian') {
            $query = \App\Models\Pengabdian::query();
        } elseif ($baseData === 'hilirisasi') {
            $query = \App\Models\Hilirisasi::query();
        } else {
            $query = \App\Models\Penelitian::query();
            $baseData = 'penelitian';
        }

        // Apply problem category filter (Overlay logic)
        // If 'all', we don't apply any keyword filter so it shows 100% of the data
        if ($jenis !== 'all' && $jenis !== 'none' && isset($keywords[$jenis])) {
            $query->where(function ($q) use ($jenis, $keywords) {
                foreach ($keywords[$jenis] as $kw) {
                    $q->orWhere('judul', 'like', "%{$kw}%");
                }
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search, $baseData) {
                // Common fields
                $q->where('judul', 'like', "%{$search}%");
                
                // Base data specific fields for global search
                if ($baseData === 'penelitian') {
                    $q->orWhere('nama', 'like', "%{$search}%")
                      ->orWhere('institusi', 'like', "%{$search}%")
                      ->orWhere('provinsi', 'like', "%{$search}%");
                } elseif ($baseData === 'pengabdian') {
                    $q->orWhere('nama', 'like', "%{$search}%")
                      ->orWhere('nama_institusi', 'like', "%{$search}%")
                      ->orWhere('prov_pt', 'like', "%{$search}%");
                } elseif ($baseData === 'hilirisasi') {
                    $q->orWhere('nama_pengusul', 'like', "%{$search}%")
                      ->orWhere('perguruan_tinggi', 'like', "%{$search}%")
                      ->orWhere('provinsi', 'like', "%{$search}%");
                }
            });
        }

        // Apply column filters
        $columnFilters = $request->get('columns', []);
        if (is_array($columnFilters) && count($columnFilters) > 0) {
            foreach ($columnFilters as $col => $val) {
                if (!$val) continue;
                
                $dbCol = $col;
                if ($col === 'peneliti') {
                    $dbCol = $baseData === 'penelitian' ? 'nama' : 'nama_pengusul';
                } elseif ($col === 'institusi') {
                    if ($baseData === 'penelitian') $dbCol = 'institusi';
                    elseif ($baseData === 'pengabdian') $dbCol = 'nama_institusi';
                    else $dbCol = 'perguruan_tinggi';
                } elseif ($col === 'provinsi') {
                    $dbCol = $baseData === 'pengabdian' ? 'prov_pt' : 'provinsi';
                } elseif ($col === 'tahun') {
                    if ($baseData === 'penelitian') $dbCol = 'thn_pelaksanaan';
                    elseif ($baseData === 'pengabdian') $dbCol = 'thn_pelaksanaan_kegiatan';
                    else $dbCol = 'tahun';
                }
                
                $query->where($dbCol, 'like', "%{$val}%");
            }
        }

        $results = $query->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Permasalahan/Index', [
            'data' => $results,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
                'baseData' => $baseData,
                'jenis' => $jenis,
                'columns' => $columnFilters,
            ],
            'stats' => [],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Permasalahan/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:provinsi,kabupaten'],
            'provinsi' => ['nullable', 'string', 'max:255'],
            'kabupaten_kota' => ['nullable', 'string', 'max:255'],
            'jenis_permasalahan' => ['required', 'string', 'max:255'],
            'nilai' => ['nullable', 'numeric'],
            'satuan' => ['nullable', 'string', 'max:50'],
            'metrik' => ['nullable', 'string', 'max:255'],
            'tahun' => ['nullable', 'integer'],
        ]);

        if ($validated['type'] === 'provinsi') {
            PermasalahanProvinsi::create([
                'provinsi' => $validated['provinsi'] ?? null,
                'jenis_permasalahan' => $validated['jenis_permasalahan'],
                'nilai' => $validated['nilai'] ?? null,
                'satuan' => $validated['satuan'] ?? null,
                'metrik' => $validated['metrik'] ?? null,
                'tahun' => $validated['tahun'] ?? null,
            ]);
        } else {
            PermasalahanKabupaten::create([
                'kabupaten_kota' => $validated['kabupaten_kota'] ?? null,
                'provinsi' => $validated['provinsi'] ?? null,
                'jenis_permasalahan' => $validated['jenis_permasalahan'],
                'nilai' => $validated['nilai'] ?? null,
                'satuan' => $validated['satuan'] ?? null,
                'tahun' => $validated['tahun'] ?? null,
            ]);
        }

        return redirect()->route('admin.permasalahan.index')->with('success', 'Data permasalahan berhasil ditambahkan');
    }

    public function edit(Request $request, $id)
    {
        $type = $request->get('type', 'provinsi');
        $permasalahan = null;

        if ($type === 'provinsi') {
            $permasalahan = PermasalahanProvinsi::findOrFail($id);
            $permasalahan->type = 'provinsi';
        } else {
            $permasalahan = PermasalahanKabupaten::findOrFail($id);
            $permasalahan->type = 'kabupaten';
        }

        return Inertia::render('Admin/Permasalahan/Edit', [
            'permasalahan' => $permasalahan,
            'filters' => $request->only(['page', 'search', 'perPage', 'baseData', 'type', 'tab', 'jenis'])
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:provinsi,kabupaten'],
            'provinsi' => ['nullable', 'string', 'max:255'],
            'kabupaten_kota' => ['nullable', 'string', 'max:255'],
            'jenis_permasalahan' => ['required', 'string', 'max:255'],
            'nilai' => ['nullable', 'numeric'],
            'satuan' => ['nullable', 'string', 'max:50'],
            'metrik' => ['nullable', 'string', 'max:255'],
            'tahun' => ['nullable', 'integer'],
        ]);

        if ($validated['type'] === 'provinsi') {
            $permasalahan = PermasalahanProvinsi::findOrFail($id);
            $permasalahan->update([
                'provinsi' => $validated['provinsi'] ?? null,
                'jenis_permasalahan' => $validated['jenis_permasalahan'],
                'nilai' => $validated['nilai'] ?? null,
                'satuan' => $validated['satuan'] ?? null,
                'metrik' => $validated['metrik'] ?? null,
                'tahun' => $validated['tahun'] ?? null,
            ]);
        } else {
            $permasalahan = PermasalahanKabupaten::findOrFail($id);
            $permasalahan->update([
                'kabupaten_kota' => $validated['kabupaten_kota'] ?? null,
                'provinsi' => $validated['provinsi'] ?? null,
                'jenis_permasalahan' => $validated['jenis_permasalahan'],
                'nilai' => $validated['nilai'] ?? null,
                'satuan' => $validated['satuan'] ?? null,
                'tahun' => $validated['tahun'] ?? null,
            ]);
        }

        return redirect()->route('admin.permasalahan.index', $request->only(['page', 'search', 'perPage', 'baseData', 'type', 'tab', 'jenis']))
            ->with('success', 'Data permasalahan berhasil diperbarui');
    }

    public function destroy(Request $request, $id)
    {
        $type = $request->get('type', 'provinsi');

        if ($type === 'provinsi') {
            $permasalahan = PermasalahanProvinsi::findOrFail($id);
        } else {
            $permasalahan = PermasalahanKabupaten::findOrFail($id);
        }

        $permasalahan->delete();

        return back()->with('success', 'Data permasalahan berhasil dihapus');
    }

    public function importFromFiles(Request $request)
    {
        $tahun = (int) ($request->get('tahun') ?? date('Y'));
        $baseDir = realpath(base_path('..'.DIRECTORY_SEPARATOR.'peta-bima'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.'permasalahan'));

        if (!$baseDir || !is_dir($baseDir)) {
            return back()->with('error', 'Folder data permasalahan tidak ditemukan');
        }

        $imported = 0;

        // Helper closures
        $upsertProv = function (string $provinsi, string $jenis, string $metrik, ?float $nilai, ?string $satuan) use ($tahun, &$imported) {
            if ($provinsi === '' || $nilai === null) { return; }
            PermasalahanProvinsi::updateOrCreate(
                [
                    'provinsi' => $provinsi,
                    'jenis_permasalahan' => $jenis,
                    'metrik' => $metrik,
                    'tahun' => $tahun,
                ],
                [
                    'nilai' => $nilai,
                    'satuan' => $satuan,
                ]
            );
            $imported++;
        };

        $upsertKab = function (string $kab, ?string $prov, string $jenis, string $metrik, ?float $nilai, ?string $satuan) use ($tahun, &$imported) {
            if ($kab === '' || $nilai === null) { return; }
            PermasalahanKabupaten::updateOrCreate(
                [
                    'kabupaten_kota' => $kab,
                    'provinsi' => $prov,
                    'jenis_permasalahan' => $jenis,
                    'tahun' => $tahun,
                ],
                [
                    'nilai' => $nilai,
                    'satuan' => $satuan,
                ]
            );
            $imported++;
        };

        // 1) Gizi Buruk
        $giziPath = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-gizi-buruk.json';
        if (is_file($giziPath)) {
            $json = json_decode(file_get_contents($giziPath), true);
            if (isset($json['Provinsi']) && is_array($json['Provinsi'])) {
                foreach ($json['Provinsi'] as $row) {
                    $upsertProv($row['Provinsi'] ?? '', 'gizi_buruk', 'persentase', isset($row['Persentase']) ? (float)$row['Persentase'] : null, '%');
                }
            }
            if (isset($json['Kabupaten']) && is_array($json['Kabupaten'])) {
                foreach ($json['Kabupaten'] as $row) {
                    $upsertKab($row['Kabupaten/Kota'] ?? '', null, 'gizi_buruk', 'persentase', isset($row['Persentase']) ? (float)$row['Persentase'] : null, '%');
                }
            }
        }

        // 2) Stunting
        $stuntingPath = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-stunting.json';
        if (is_file($stuntingPath)) {
            $json = json_decode(file_get_contents($stuntingPath), true);
            if (isset($json['Provinsi']) && is_array($json['Provinsi'])) {
                foreach ($json['Provinsi'] as $row) {
                    $upsertProv($row['Provinsi'] ?? '', 'stunting', 'persentase', isset($row['Persentase']) ? (float)$row['Persentase'] : null, '%');
                }
            }
            if (isset($json['Kabupaten']) && is_array($json['Kabupaten'])) {
                foreach ($json['Kabupaten'] as $row) {
                    $upsertKab($row['Kabupaten/Kota'] ?? '', null, 'stunting', 'persentase', isset($row['Persentase']) ? (float)$row['Persentase'] : null, '%');
                }
            }
        }

        // 3) Ketahanan Pangan (IKP)
        $panganPath = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-ketahanan-pangan.json';
        if (is_file($panganPath)) {
            $json = json_decode(file_get_contents($panganPath), true);
            if (isset($json['Provinsi']) && is_array($json['Provinsi'])) {
                foreach ($json['Provinsi'] as $row) {
                    $upsertProv($row['Provinsi'] ?? '', 'ketahanan_pangan', 'IKP', isset($row['IKP']) ? (float)$row['IKP'] : null, 'indeks');
                }
            }
            if (isset($json['Kabupaten']) && is_array($json['Kabupaten'])) {
                foreach ($json['Kabupaten'] as $row) {
                    $upsertKab($row['Kabupaten/Kota'] ?? '', null, 'ketahanan_pangan', 'IKP', isset($row['IKP']) ? (float)$row['IKP'] : null, 'indeks');
                }
            }
        }

        // 4) Krisis Listrik (SAIDI/SAIFI) – provinsi-level only pada file
        $listrikPath = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-krisis-listrik.json';
        if (is_file($listrikPath)) {
            $json = json_decode(file_get_contents($listrikPath), true);
            if (isset($json['Sheet1']) && is_array($json['Sheet1'])) {
                foreach ($json['Sheet1'] as $row) {
                    $prov = trim((string)($row['Provinsi'] ?? ''));
                    if ($prov === '') { continue; }
                    $saidi = isset($row['SAIDI (Jam/Pelanggan)']) ? (float)$row['SAIDI (Jam/Pelanggan)'] : null;
                    $saifi = isset($row['SAIFI (Kali/Pelanggan)']) ? (float)$row['SAIFI (Kali/Pelanggan)'] : null;
                    if ($saidi !== null) { $upsertProv($prov, 'krisis_listrik', 'SAIDI', $saidi, 'Jam/Pelanggan'); }
                    if ($saifi !== null) { $upsertProv($prov, 'krisis_listrik', 'SAIFI', $saifi, 'Kali/Pelanggan'); }
                }
            }
        }

        return back()->with('success', "Import selesai: {$imported} baris diperbarui/dibuat untuk tahun {$tahun}.");
    }
}
