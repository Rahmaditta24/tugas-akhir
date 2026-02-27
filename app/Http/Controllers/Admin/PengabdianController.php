<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengabdian;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class PengabdianController extends Controller
{
    private function isPTN($name)
    {
        if (empty($name)) return false;
        $name = strtolower($name);
        if (strpos($name, 'negeri') !== false) return true;
        if (strpos($name, 'uin ') !== false || strpos($name, 'universitas islam negeri') !== false) return true;
        if (strpos($name, 'iain ') !== false || strpos($name, 'institut agama islam negeri') !== false) return true;
        if (strpos($name, 'stain ') !== false || strpos($name, 'sekolah tinggi agama islam negeri') !== false) return true;
        if (strpos($name, 'universitas terbuka') !== false) return true;
        $bigPTNs = [
            'universitas indonesia', 'institut teknologi bandung', 'universitas gadjah mada', 
            'institut pertanian bogor', 'ipb university', 'universitas padjadjaran', 
            'universitas airlangga', 'universitas diponegoro', 'universitas brawijaya', 
            'universitas hasanuddin', 'universitas sebelas maret', 'institut teknologi sepuluh nopember', 
            'universitas sumatera utara', 'universitas lampung', 'universitas andalas', 
            'universitas sriwijaya', 'universitas syiah kuala', 'universitas riau', 
            'universitas udayana', 'universitas jember', 'universitas jenderal soedirman', 
            'universitas lambung mangkurat', 'universitas sam ratulangi', 'universitas tanjungpura',
            'universitas nusa cendana', 'universitas palangka raya', 'universitas tadulako',
            'universitas pattimura', 'universitas cenderawasih', 'universitas mulawarman',
            'universitas pendidikan indonesia', 'universitas pendidikan ganesha',
            'universitas sultan ageng tirtayasa', 'upn \"veteran\"', 'universitas tidar',
            'universitas teuku umar', 'universitas borneo tarakan', 'universitas bangka belitung',
            'universitas musamus', 'universitas malikussaleh', 'universitas samudra',
            'universitas siliwangi', 'universitas sembilanbelas november', 
            'universitas singaperbangsa', 'universitas sulawesi barat', 'universitas papua',
            'institut seni indonesia', 'institut seni budaya indonesia',
            'institut teknologi sumatera', 'itera', 'institut teknologi kalimantan', 'itk',
            'institut teknologi bacharuddin jusuf habibie', 'ith'
        ];
        foreach ($bigPTNs as $ptn) {
            if (strpos($name, $ptn) !== false) return true;
        }
        return false;
    }

    private function formatName($name)
    {
        if (empty($name)) return $name;
        
        // Trim whitespace first
        $name = trim($name);
        
        // If it's already mixed case, assume it's possibly formatted correctly
        // Only format if it's all uppercase OR all lowercase
        if ($name !== mb_strtoupper($name) && $name !== mb_strtolower($name)) {
            return $name;
        }

        $formatted = mb_convert_case($name, MB_CASE_TITLE, "UTF-8");

        $replacements = [
            'S.pd' => 'S.Pd', 'M.pd' => 'M.Pd', 'S.t' => 'S.T', 'M.t' => 'M.T',
            'S.h' => 'S.H', 'M.h' => 'M.H', 'S.e' => 'S.E', 'M.m' => 'M.M',
            'S.si' => 'S.Si', 'M.si' => 'M.Si', 'S.sos' => 'S.Sos', 'M.sos' => 'M.Sos',
            'S.kom' => 'S.Kom', 'M.kom' => 'M.Kom', 'S.p' => 'S.P', 'M.p' => 'M.P',
            'S.pt' => 'S.Pt', 'M.pt' => 'M.Pt', 'S.hut' => 'S.Hut', 'M.hut' => 'M.Hut',
            'S.km' => 'S.KM', 'M.kes' => 'M.Kes', 'S.kep' => 'S.Kep', 'M.kep' => 'M.Kep',
            'Ph.d' => 'Ph.D', 'M.hum' => 'M.Hum', 'S.hum' => 'S.Hum', 'M.ag' => 'M.Ag',
            'S.ag' => 'S.Ag', 'M.fil' => 'M.Fil', 'S.fil' => 'S.Fil', 'M.ak' => 'M.Ak',
            'S.ak' => 'S.Ak', 'M.psi' => 'M.Psi', 'S.psi' => 'S.Psi', 'M.ti' => 'M.TI',
            'S.ti' => 'S.TI', 'M.eng' => 'M.Eng', 'S.eng' => 'S.Eng', 'M.sc' => 'M.Sc',
            'B.sc' => 'B.Sc', 'Msi' => 'MSi', 'Spd' => 'SPd',
        ];

        foreach ($replacements as $search => $replace) {
            $formatted = preg_replace('/\b' . preg_quote($search) . '\b/u', $replace, $formatted);
            // Also handle cases with comma or end of string
            $formatted = str_replace($search, $replace, $formatted);
        }

        return $formatted;
    }

    public function index(Request $request)
    {
        $type = $request->get('type', 'multitahun');

        // Fetch data from database
        $query = Pengabdian::query();
        if ($type === 'kosabangsa') {
            $query->where('batch_type', 'kosabangsa');
        } elseif ($type === 'batch') {
            $query->whereIn('batch_type', ['batch_i', 'batch_ii', 'batch']);
        } else {
            $query->whereIn('batch_type', ['multitahun', 'multitahun_lanjutan']);
        }

        // Apply filters to database query
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nama_institusi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%")
                  ->orWhere('prov_pt', 'like', "%{$search}%");
            });
        }
        if ($request->filled('filters')) {
            $filters = $request->filters;
            foreach ($filters as $key => $value) {
                if (!empty($value)) {
                    if (in_array($key, [
                        'nama','nidn','nama_institusi','judul','prov_pt','kab_pt','ptn_pts','wilayah_lldikti','klaster',
                        'nama_skema','nama_singkat_skema','bidang_fokus','thn_pelaksanaan_kegiatan','prov_mitra','kab_mitra',
                    ])) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        $dbRows = array_map(function($r) {
            $r['nama'] = $this->formatName($r['nama']);
            if (isset($r['nama_pendamping'])) $r['nama_pendamping'] = $this->formatName($r['nama_pendamping']);
            if (empty($r['kd_perguruan_tinggi'])) $r['kd_perguruan_tinggi'] = '0';
            return $r;
        }, $query->get()->toArray());

        // Prefer data source from JSON file
        $path = base_path('peta-bima/data/data-pengabdian_clean.json');
        $jsonRows = [];
        if (is_file($path)) {
            $json = json_decode(file_get_contents($path), true);
            if (is_array($json)) {
                $map = [
                    'Multitahun Lanjutan' => 'multitahun',
                    'Batch I' => 'batch',
                    'Batch II' => 'batch',
                    'Kosabangsa' => 'kosabangsa',
                ];
                $globalIdx = 0;
                foreach ($json as $group => $items) {
                    if (!is_array($items)) continue;
                    $batchType = $map[$group] ?? null;
                    
                    if (!$batchType) {
                        $globalIdx += count($items);
                        continue;
                    }
                    
                    // Filter based on active tab
                    $shouldShow = ($type === 'kosabangsa' && $batchType === 'kosabangsa') || 
                                 ($type === 'batch' && $batchType === 'batch') ||
                                 ($type === 'multitahun' && $batchType === 'multitahun');

                    foreach ($items as $it) {
                        if ($shouldShow) {
                            // Sanitasi NaN menjadi null dan hapus tanda kutip tunggal di awal
                            $sanitize = function($v) {
                                if (is_string($v)) {
                                    $v = trim($v);
                                    if (mb_strtolower($v) === 'nan') return null;
                                    return ltrim($v, "'");
                                }
                                return $v;
                            };

                            $isKosabangsa = ($batchType === 'kosabangsa');
                            
                            $jsonRows[] = [
                                'id' => 'json_' . $globalIdx, // ID unik berdasarkan posisi global di JSON
                                'batch_type' => $batchType,
                                'nama' => $this->formatName($sanitize($it['nama'] ?? ($it['nama_pelaksana'] ?? null))),
                                'nidn' => $sanitize($it['nidn'] ?? ($it['nidn_pelaksana'] ?? null)),
                                'nama_institusi' => $sanitize($it['nama_institusi'] ?? ($it['nama_institusi_pelaksana'] ?? null)),
                                'pt_latitude' => $sanitize($it['pt_latitude'] ?? null),
                                'pt_longitude' => $sanitize($it['pt_longitude'] ?? null),
                                'kd_perguruan_tinggi' => $sanitize($it['kd_perguruan_tinggi'] ?? ($it['kd_perguruan_tinggi_pelaksana'] ?? '0')) ?: '0',
                                'wilayah_lldikti' => $sanitize($it['wilayah_lldikti'] ?? ($it['lldikti_wilayah_pelaksana'] ?? null)),
                                'ptn_pts' => (function() use ($sanitize, $it, $batchType) {
                                $v = $sanitize($it['ptn/pts'] ?? ($it['ptn_pts'] ?? ($it['ptn/pts_pelaksana'] ?? ($it['ptn_pts_pelaksana'] ?? null))));
                                if (empty($v) || $v === 'null') {
                                    $inst = $sanitize($it['nama_institusi'] ?? ($it['nama_institusi_pelaksana'] ?? ''));
                                    return $this->isPTN($inst) ? 'PTN' : 'PTS';
                                }
                                return $v;
                            })(),
                                'kab_pt' => isset($it['Kab PT']) ? preg_replace(['/^kab\.\s*/i','/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($it['Kab PT'])) : (isset($it['kab_pt']) ? preg_replace(['/^kab\.\s*/i','/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($it['kab_pt'])) : null),
                                'prov_pt' => $sanitize($it['Prov PT'] ?? ($it['prov_pt'] ?? null)),
                                'klaster' => $sanitize($it['klaster'] ?? null),
                                'judul' => $sanitize($it['judul'] ?? null),
                                'nama_singkat_skema' => $sanitize($it['nama_singkat_skema'] ?? ($isKosabangsa ? 'Kosabangsa' : null)),
                                'thn_pelaksanaan_kegiatan' => $sanitize($it['thn_pelaksanaan_kegiatan'] ?? ($it['thn_pelaksanaan'] ?? null)),
                                'urutan_thn_kegitan' => $sanitize($it['urutan_thn_kegitan'] ?? null),
                                'nama_skema' => $sanitize($it['nama_skema'] ?? ($isKosabangsa ? 'Kosabangsa' : null)),
                                'bidang_fokus' => $sanitize($it['bidang_fokus'] ?? null),
                                'prov_mitra' => $sanitize($it['prov_mitra'] ?? ($it['provinsi_mitra'] ?? null)),
                                'kab_mitra' => isset($it['kab_mitra']) ? preg_replace(['/^kab\.\s*/i','/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($it['kab_mitra'])) : (isset($it['lokus']) ? preg_replace(['/^kab\.\s*/i','/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($it['lokus'])) : null),
                                
                                // Kosabangsa fields
                                'nama_pendamping' => $this->formatName($sanitize($it['nama_pendamping'] ?? null)),
                                'nidn_pendamping' => $sanitize($it['nidn_pendamping'] ?? null),
                                'kd_perguruan_tinggi_pendamping' => $sanitize($it['kd_perguruan_tinggi_pendamping'] ?? null),
                                'institusi_pendamping' => $sanitize($it['institusi_pendamping'] ?? null),
                                'lldikti_wilayah_pendamping' => $sanitize($it['lldikti_wilayah_pendamping'] ?? null),
                                'jenis_wilayah_provinsi_mitra' => $sanitize($it['jenis_wilayah_provinsi_mitra'] ?? null),
                                'bidang_teknologi_inovasi' => $sanitize($it['bidang_teknologi_inovasi'] ?? null),
                            ];
                        }
                        $globalIdx++;
                    }
                }

            }
        }

        // Apply filters to JSON rows if search/filters active
        if (!empty($jsonRows)) {
            if ($request->filled('search')) {
                $search = mb_strtolower($request->search);
                $jsonRows = array_values(array_filter($jsonRows, function ($r) use ($search) {
                    $fields = [
                        $r['nama'] ?? '',
                        $r['nama_institusi'] ?? '',
                        $r['judul'] ?? '',
                        $r['prov_pt'] ?? '',
                    ];
                    $hay = mb_strtolower(implode(' ', array_map(fn($v) => (string)$v, $fields)));
                    return $search === '' ? true : (strpos($hay, $search) !== false);
                }));
            }

            if ($request->filled('filters')) {
                $filters = (array) $request->filters;
                $whitelist = [
                    'nama','nidn','nama_institusi','judul','prov_pt','kab_pt','ptn_pts','wilayah_lldikti','klaster',
                    'nama_skema','nama_singkat_skema','bidang_fokus','thn_pelaksanaan_kegiatan','prov_mitra','kab_mitra',
                ];
                foreach ($filters as $key => $value) {
                    if ($value !== null && $value !== '' && in_array($key, $whitelist)) {
                        $v = mb_strtolower((string)$value);
                        $jsonRows = array_values(array_filter($jsonRows, function ($r) use ($key, $v) {
                            return strpos(mb_strtolower((string)($r[$key] ?? '')), $v) !== false;
                        }));
                    }
                }
            }
        }

        // Merge DB and JSON
        $allRows = array_merge($dbRows, $jsonRows);

        // Sorting: Newest ID first, then year descending
        usort($allRows, function ($a, $b) {
            // Priority 1: ID (Newest DB entries first)
            $ida = is_string($a['id']) ? 0 : ($a['id'] ?? 0);
            $idb = is_string($b['id']) ? 0 : ($b['id'] ?? 0);
            if ($ida !== $idb) {
                return $idb <=> $ida;
            }

            // Priority 2: Year descending
            $ya = (int)($a['thn_pelaksanaan_kegiatan'] ?? 0);
            $yb = (int)($b['thn_pelaksanaan_kegiatan'] ?? 0);
            if ($ya !== $yb) {
                return $yb <=> $ya;
            }

            return strcasecmp((string)($a['nama_institusi'] ?? ''), (string)($b['nama_institusi'] ?? ''));
        });

        // Filtering and pagination
        $perPage = (int) $request->get('perPage', 20);
        if ($perPage < 10) { $perPage = 10; }
        if ($perPage > 100) { $perPage = 100; }
        $page = max(1, (int) $request->get('page', 1));

        $total = count($allRows);
        $slice = array_slice($allRows, ($page - 1) * $perPage, $perPage);
        
        $pengabdian = new LengthAwarePaginator(
            $slice,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // Calculate stats for all categories (from DB and from full JSON)
        $allJsonData = [];
        if (isset($json) && is_array($json)) {
            foreach ($json as $group => $items) {
                if (is_array($items)) {
                    $bt = $map[$group] ?? null;
                    foreach ($items as $it) {
                        $allJsonData[] = array_merge($it, ['batch_type' => $bt]);
                    }
                }
            }
        }
        $jsonCol = collect($allJsonData);
        
        $stats = [
            'total' => Pengabdian::count() + $jsonCol->count(),
            'multitahun' => Pengabdian::whereIn('batch_type', ['multitahun', 'multitahun_lanjutan'])->count() 
                + $jsonCol->where('batch_type', 'multitahun')->count(),
            'batch' => Pengabdian::whereIn('batch_type', ['batch_i', 'batch_ii', 'batch'])->count() 
                + $jsonCol->where('batch_type', 'batch')->count(),
            'kosabangsa' => Pengabdian::where('batch_type', 'kosabangsa')->count()
                + $jsonCol->where('batch_type', 'kosabangsa')->count(),
            'withCoordinates' => Pengabdian::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count()
                + $jsonCol->filter(fn($r) => !empty($r['pt_latitude']) && !empty($r['pt_longitude']))->count(),
        ];

        return Inertia::render('Admin/Pengabdian/Index', [
            'pengabdian' => $pengabdian,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'type' => $type,
                'perPage' => $perPage,
                'columns' => $request->filters ?? [],
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Pengabdian/Create');
    }

    public function store(Request $request)
    {
        $request->merge([
            'pt_latitude' => is_string($request->pt_latitude) ? str_replace(',', '.', $request->pt_latitude) : $request->pt_latitude,
            'pt_longitude' => is_string($request->pt_longitude) ? str_replace(',', '.', $request->pt_longitude) : $request->pt_longitude,
            'kab_pt' => is_string($request->kab_pt) ? preg_replace(['/^kab\.\s*/i','/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($request->kab_pt)) : $request->kab_pt,
            'kab_mitra' => is_string($request->kab_mitra) ? preg_replace(['/^kab\.\s*/i','/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($request->kab_mitra)) : $request->kab_mitra,
            'nama' => is_string($request->nama) ? trim($request->nama) : $request->nama,
            'nidn' => is_string($request->nidn) ? ltrim(trim($request->nidn), "'") : (is_null($request->nidn) ? null : (string)$request->nidn),
            'kd_perguruan_tinggi' => $request->kd_perguruan_tinggi ?: '0',
            'nidn_pendamping' => is_null($request->nidn_pendamping) ? null : (string)$request->nidn_pendamping,
            'kd_perguruan_tinggi_pendamping' => is_null($request->kd_perguruan_tinggi_pendamping) ? null : (string)$request->kd_perguruan_tinggi_pendamping,
        ]);

        if ($request->batch_type === 'kosabangsa') {
            $request->merge([
                'nama_skema' => $request->nama_skema ?: 'Kosabangsa',
                'nama_singkat_skema' => $request->nama_singkat_skema ?: 'Kosabangsa',
            ]);
        }

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nidn' => ['nullable', 'string', 'regex:/^[0-9]+$/', 'max:50'],
            'nama_institusi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['required', 'numeric', 'between:-180,180'],
            'kd_perguruan_tinggi' => ['required', 'string', 'max:50'],
            'ptn_pts' => ['nullable', 'string', 'max:50'],
            'prov_pt' => ['required', 'string', 'max:100'],
            'kab_pt' => ['nullable', 'string', 'max:100'],
            'judul' => ['required', 'string'],
            'nama_skema' => ['required', 'string', 'max:255'],
            'nama_singkat_skema' => ['required', 'string', 'max:100'],
            'thn_pelaksanaan_kegiatan' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 10)],
            'bidang_fokus' => ['required', 'string', 'max:255'],
            'klaster' => ['nullable', 'string', 'max:255'],
            'wilayah_lldikti' => ['nullable', 'string', 'max:100'],
            'urutan_thn_kegitan' => ['nullable', 'string', 'max:100'],
            'prov_mitra' => ['required', 'string', 'max:100'],
            'kab_mitra' => ['nullable', 'string', 'max:100'],
            'batch_type' => ['required', 'string', 'in:multitahun,batch,kosabangsa'],
            
            // Kosabangsa specific fields
            'nama_pendamping' => ['nullable', 'string', 'max:255'],
            'nidn_pendamping' => ['nullable', 'string', 'max:50'],
            'kd_perguruan_tinggi_pendamping' => ['nullable', 'string', 'max:50'],
            'institusi_pendamping' => ['nullable', 'string', 'max:255'],
            'lldikti_wilayah_pendamping' => ['nullable', 'string', 'max:100'],
            'jenis_wilayah_provinsi_mitra' => ['nullable', 'string', 'max:255'],
            'bidang_teknologi_inovasi' => ['nullable', 'string', 'max:255'],
        ]);

        Pengabdian::create($validated);
        $this->clearCache();

        return redirect()->route('admin.pengabdian.index', ['type' => $request->batch_type])
            ->with('success', 'Data pengabdian berhasil ditambahkan');
    }

    public function edit(Request $request, $id)
    {
        if (is_string($id) && str_starts_with($id, 'json_')) {
            $index = (int) str_replace('json_', '', $id);
            $path = base_path('peta-bima/data/data-pengabdian_clean.json');
            if (is_file($path)) {
                $json = json_decode(file_get_contents($path), true);
                if (is_array($json)) {
                    $map = [
                        'Multitahun Lanjutan' => 'multitahun',
                        'Batch I' => 'batch',
                        'Batch II' => 'batch',
                        'Kosabangsa' => 'kosabangsa',
                    ];
                    
                    $globalIdx = 0;
                    $targetItem = null;
                    $targetBatchType = null;
                    
                    foreach ($json as $group => $items) {
                        if (!is_array($items)) continue;
                        $batchType = $map[$group] ?? null;
                        
                        foreach ($items as $it) {
                            if ($globalIdx === $index) {
                                $targetItem = $it;
                                $targetBatchType = $batchType;
                                break 2;
                            }
                            $globalIdx++;
                        }
                    }

                    if ($targetItem) {
                        $it = $targetItem;
                        $isKosabangsa = ($targetBatchType === 'kosabangsa');

                        // Helper to clean/sanitize data
                        $clean = function($v) {
                            if (is_string($v)) {
                                $v = trim($v);
                                if (mb_strtolower($v) === 'nan') return null;
                                return ltrim($v, "'");
                            }
                            return $v;
                        };

                        // Map JSON fields to model fields (consistent with index())
                        $item = (object) [
                            'id' => $id,
                            'batch_type' => $targetBatchType,
                            'nama' => $clean($it['nama'] ?? ($it['nama_pelaksana'] ?? null)),
                            'nidn' => $clean($it['nidn'] ?? ($it['nidn_pelaksana'] ?? null)),
                            'nama_institusi' => $clean($it['nama_institusi'] ?? ($it['nama_institusi_pelaksana'] ?? null)),
                            'pt_latitude' => $clean($it['pt_latitude'] ?? null),
                            'pt_longitude' => $clean($it['pt_longitude'] ?? null),
                            'kd_perguruan_tinggi' => $clean($it['kd_perguruan_tinggi'] ?? ($it['kd_perguruan_tinggi_pelaksana'] ?? '0')) ?: '0',
                            'wilayah_lldikti' => $clean($it['wilayah_lldikti'] ?? ($it['lldikti_wilayah_pelaksana'] ?? null)),
                            'ptn_pts' => $clean($it['ptn/pts'] ?? ($it['ptn_pts'] ?? ($it['ptn/pts_pelaksana'] ?? ($it['ptn_pts_pelaksana'] ?? null)))),
                            'kab_pt' => $clean($it['Kab PT'] ?? ($it['kab_pt'] ?? null)),
                            'prov_pt' => $clean($it['Prov PT'] ?? ($it['prov_pt'] ?? null)),
                            'klaster' => $clean($it['klaster'] ?? null),
                            'judul' => $clean($it['judul'] ?? null),
                            'nama_singkat_skema' => $clean($it['nama_singkat_skema'] ?? ($isKosabangsa ? 'Kosabangsa' : null)),
                            'thn_pelaksanaan_kegiatan' => $clean($it['thn_pelaksanaan_kegiatan'] ?? ($it['thn_pelaksanaan'] ?? null)),
                            'urutan_thn_kegitan' => $clean($it['urutan_thn_kegitan'] ?? null),
                            'nama_skema' => $clean($it['nama_skema'] ?? ($isKosabangsa ? 'Kosabangsa' : null)),
                            'bidang_fokus' => $clean($it['bidang_fokus'] ?? null),
                            'prov_mitra' => $clean($it['prov_mitra'] ?? ($it['provinsi_mitra'] ?? null)),
                            'kab_mitra' => $clean($it['kab_mitra'] ?? ($it['lokus'] ?? null)),
                            
                            // Kosabangsa fields
                            'nama_pendamping' => $clean($it['nama_pendamping'] ?? null),
                            'nidn_pendamping' => $clean($it['nidn_pendamping'] ?? null),
                            'kd_perguruan_tinggi_pendamping' => $clean($it['kd_perguruan_tinggi_pendamping'] ?? null),
                            'institusi_pendamping' => $clean($it['institusi_pendamping'] ?? null),
                            'lldikti_wilayah_pendamping' => $clean($it['lldikti_wilayah_pendamping'] ?? null),
                            'jenis_wilayah_provinsi_mitra' => $clean($it['jenis_wilayah_provinsi_mitra'] ?? null),
                            'bidang_teknologi_inovasi' => $clean($it['bidang_teknologi_inovasi'] ?? null),
                        ];
                        return Inertia::render('Admin/Pengabdian/Edit', [
                        'item' => $item,
                        'filters' => $request->only(['page', 'type', 'search', 'perPage', 'filters'])
                    ]);
                    }
                }
            }
            abort(404);
        }


        $pengabdian = Pengabdian::findOrFail($id);
        
        // Helper to clean/sanitize data
        $clean = function($v) {
            if (is_string($v)) {
                $v = trim($v);
                if (mb_strtolower($v) === 'nan') return null;
                return ltrim($v, "'");
            }
            return $v;
        };

        // Try to find missing info in JSON for ANY record (especially if coordinates or mitra details are missing)
        $needsInfo = empty($pengabdian->pt_latitude) || empty($pengabdian->pt_longitude) || 
                     empty($pengabdian->prov_mitra) || empty($pengabdian->kab_mitra) ||
                     empty($pengabdian->ptn_pts) || empty($pengabdian->klaster) ||
                     ($pengabdian->nama_skema === 'Kosabangsa' && empty($pengabdian->nama_pendamping));

        if ($needsInfo) {
            $path = base_path('peta-bima/data/data-pengabdian_clean.json');
            if (is_file($path)) {
                $json = json_decode(file_get_contents($path), true);
                if (is_array($json)) {
                    $foundMatch = false;
                    foreach ($json as $group => $items) {
                        if (!is_array($items)) continue;
                        foreach ($items as $it) {
                            $jsonNama = $clean($it['nama'] ?? ($it['nama_pelaksana'] ?? ($it['nama_ketua'] ?? '')));
                            $jsonNidn = $clean($it['nidn'] ?? ($it['nidn_pelaksana'] ?? ($it['nidn_ketua'] ?? '')));
                            
                            if ($jsonNama === $pengabdian->nama || ($jsonNidn && $jsonNidn == $pengabdian->nidn)) {
                                // Found a match in JSON, fill in missing fields if they are empty in DB
                                if (empty($pengabdian->pt_latitude)) $pengabdian->pt_latitude = $clean($it['pt_latitude'] ?? null);
                                if (empty($pengabdian->pt_longitude)) $pengabdian->pt_longitude = $clean($it['pt_longitude'] ?? null);
                                if (empty($pengabdian->prov_pt)) $pengabdian->prov_pt = $clean($it['Prov PT'] ?? ($it['prov_pt'] ?? null));
                                if (empty($pengabdian->kab_pt)) $pengabdian->kab_pt = $clean($it['Kab PT'] ?? ($it['kab_pt'] ?? null));
                                
                                // Mapping for PTN/PTS
                                if (empty($pengabdian->ptn_pts)) {
                                    $pengabdian->ptn_pts = $clean($it['status PT'] ?? ($it['status_PT'] ?? ($it['ptn/pts'] ?? ($it['ptn_pts'] ?? ($it['ptn/pts_pelaksana'] ?? ($it['ptn_pts_pelaksana'] ?? null))))));
                                }
                                
                                // Mapping for Klaster
                                if (empty($pengabdian->klaster)) {
                                    $pengabdian->klaster = $clean($it['nama_klaster'] ?? ($it['klaster'] ?? null));
                                }
                                
                                // Mapping for LLDIKTI
                                if (empty($pengabdian->wilayah_lldikti)) {
                                    $pengabdian->wilayah_lldikti = $clean($it['kd_lldikti'] ?? ($it['wilayah_lldikti'] ?? ($it['lldikti_wilayah_pelaksana'] ?? null)));
                                }

                                if (empty($pengabdian->nama_pendamping)) $pengabdian->nama_pendamping = $clean($it['nama_pendamping'] ?? null);
                                if (empty($pengabdian->nidn_pendamping)) $pengabdian->nidn_pendamping = $clean($it['nidn_pendamping'] ?? null);
                                if (empty($pengabdian->kd_perguruan_tinggi_pendamping)) $pengabdian->kd_perguruan_tinggi_pendamping = $clean($it['kd_perguruan_tinggi_pendamping'] ?? null);
                                if (empty($pengabdian->institusi_pendamping)) $pengabdian->institusi_pendamping = $clean($it['institusi_pendamping'] ?? null);
                                if (empty($pengabdian->lldikti_wilayah_pendamping)) $pengabdian->lldikti_wilayah_pendamping = $clean($it['lldikti_wilayah_pendamping'] ?? null);
                                if (empty($pengabdian->jenis_wilayah_provinsi_mitra)) $pengabdian->jenis_wilayah_provinsi_mitra = $clean($it['jenis_wilayah_provinsi_mitra'] ?? null);
                                if (empty($pengabdian->bidang_teknologi_inovasi)) $pengabdian->bidang_teknologi_inovasi = $clean($it['bidang_teknologi_inovasi'] ?? null);
                                
                                if (empty($pengabdian->prov_mitra)) $pengabdian->prov_mitra = $clean($it['prov_mitra'] ?? ($it['provinsi_mitra'] ?? null));
                                if (empty($pengabdian->kab_mitra)) $pengabdian->kab_mitra = $clean($it['kab_mitra'] ?? ($it['lokus'] ?? null));
                                if (empty($pengabdian->urutan_thn_kegitan)) $pengabdian->urutan_thn_kegitan = $clean($it['urutan_thn_kegitan'] ?? null);
                                
                                $foundMatch = true;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // Apply cleaning to all fields
        $fields = [
            'nidn', 'nama', 'judul', 'nama_institusi', 'kd_perguruan_tinggi', 
            'wilayah_lldikti', 'ptn_pts', 'kab_pt', 'prov_pt', 'klaster', 
            'nama_singkat_skema', 'nama_skema', 'bidang_fokus', 'prov_mitra', 'kab_mitra',
            'nama_pendamping', 'nidn_pendamping', 'kd_perguruan_tinggi_pendamping', 
            'institusi_pendamping', 'lldikti_wilayah_pendamping', 
            'jenis_wilayah_provinsi_mitra', 'bidang_teknologi_inovasi',
            'pt_latitude', 'pt_longitude', 'urutan_thn_kegitan'
        ];
        
        foreach ($fields as $field) {
            $pengabdian->$field = $clean($pengabdian->$field);
        }
        
        if (empty($pengabdian->kd_perguruan_tinggi)) {
            $pengabdian->kd_perguruan_tinggi = '0';
        }

        // Ensure Title Case and proper prefix for locations to help with matching in frontend
        $normalizeLoc = function($s) {
            if (!$s) return $s;
            $s = trim($s);
            // Replace "Kab." or "Kab " with "Kabupaten "
            $s = preg_replace('/^kab\.?\s+/i', 'Kabupaten ', $s);
            // Replace "Kota " with "Kota " (ensuring standard)
            $s = preg_replace('/^kota\s+/i', 'Kota ', $s);
            return mb_convert_case($s, MB_CASE_TITLE);
        };

        if ($pengabdian->prov_pt) $pengabdian->prov_pt = $normalizeLoc($pengabdian->prov_pt);
        if ($pengabdian->kab_pt) $pengabdian->kab_pt = $normalizeLoc($pengabdian->kab_pt);
        if ($pengabdian->prov_mitra) $pengabdian->prov_mitra = $normalizeLoc($pengabdian->prov_mitra);
        if ($pengabdian->kab_mitra) $pengabdian->kab_mitra = $normalizeLoc($pengabdian->kab_mitra);

        return Inertia::render('Admin/Pengabdian/Edit', [
            'item' => $pengabdian,
            'filters' => $request->only(['page', 'type', 'search', 'perPage', 'filters'])
        ]);
    }


    public function update(Request $request, $id)
    {
        $request->merge([
            'pt_latitude' => is_string($request->pt_latitude) ? str_replace(',', '.', $request->pt_latitude) : $request->pt_latitude,
            'pt_longitude' => is_string($request->pt_longitude) ? str_replace(',', '.', $request->pt_longitude) : $request->pt_longitude,
            'kab_pt' => is_string($request->kab_pt) ? preg_replace(['/^kab\.\s*/i','/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($request->kab_pt)) : $request->kab_pt,
            'kab_mitra' => is_string($request->kab_mitra) ? preg_replace(['/^kab\.\s*/i','/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($request->kab_mitra)) : $request->kab_mitra,
            'nama' => is_string($request->nama) ? trim($request->nama) : $request->nama,
            'nidn' => is_string($request->nidn) ? ltrim(trim($request->nidn), "'") : (is_null($request->nidn) ? null : (string)$request->nidn),
            'kd_perguruan_tinggi' => $request->kd_perguruan_tinggi ?: '0',
            'nidn_pendamping' => is_null($request->nidn_pendamping) ? null : (string)$request->nidn_pendamping,
            'kd_perguruan_tinggi_pendamping' => is_null($request->kd_perguruan_tinggi_pendamping) ? null : (string)$request->kd_perguruan_tinggi_pendamping,
        ]);

        if ($request->batch_type === 'kosabangsa') {
            $request->merge([
                'nama_skema' => $request->nama_skema ?: 'Kosabangsa',
                'nama_singkat_skema' => $request->nama_singkat_skema ?: 'Kosabangsa',
            ]);
        }

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nidn' => ['nullable', 'string', 'regex:/^[0-9]+$/', 'max:50'],
            'nama_institusi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['required', 'numeric', 'between:-180,180'],
            'kd_perguruan_tinggi' => ['required', 'string', 'max:50'],
            'ptn_pts' => ['nullable', 'string', 'max:50'],
            'prov_pt' => ['required', 'string', 'max:100'],
            'kab_pt' => ['nullable', 'string', 'max:100'],
            'judul' => ['required', 'string'],
            'nama_skema' => ['required', 'string', 'max:255'],
            'nama_singkat_skema' => ['required', 'string', 'max:100'],
            'thn_pelaksanaan_kegiatan' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 10)],
            'bidang_fokus' => ['required', 'string', 'max:255'],
            'klaster' => ['nullable', 'string', 'max:255'],
            'wilayah_lldikti' => ['nullable', 'string', 'max:100'],
            'urutan_thn_kegitan' => ['nullable', 'string', 'max:100'],
            'prov_mitra' => ['required', 'string', 'max:100'],
            'kab_mitra' => ['nullable', 'string', 'max:100'],
            'batch_type' => ['required', 'string', 'in:multitahun,batch,kosabangsa'],

            // Kosabangsa specific fields
            'nama_pendamping' => ['nullable', 'string', 'max:255'],
            'nidn_pendamping' => ['nullable', 'string', 'max:50'],
            'kd_perguruan_tinggi_pendamping' => ['nullable', 'string', 'max:50'],
            'institusi_pendamping' => ['nullable', 'string', 'max:255'],
            'lldikti_wilayah_pendamping' => ['nullable', 'string', 'max:100'],
            'jenis_wilayah_provinsi_mitra' => ['nullable', 'string', 'max:255'],
            'bidang_teknologi_inovasi' => ['nullable', 'string', 'max:255'],
        ]);

        if (empty($validated['ptn_pts'])) {
            $validated['ptn_pts'] = $this->isPTN($validated['nama_institusi']) ? 'PTN' : 'PTS';
        }

        if (is_string($id) && str_starts_with($id, 'json_')) {
            Pengabdian::create($validated);
            $this->clearCache();
            return redirect()->route('admin.pengabdian.index', array_merge(['type' => $request->batch_type], $request->only(['page', 'search', 'perPage', 'filters'])))
                ->with('success', 'Data dari JSON berhasil disimpan ke database');
        }

        $pengabdian = Pengabdian::findOrFail($id);
        if (empty($validated['ptn_pts'])) {
            $validated['ptn_pts'] = $this->isPTN($validated['nama_institusi']) ? 'PTN' : 'PTS';
        }
        $pengabdian->update($validated);
        $this->clearCache();

        return redirect()->route('admin.pengabdian.index', array_merge(['type' => $request->batch_type], $request->only(['page', 'search', 'perPage', 'filters'])))
            ->with('success', 'Data pengabdian berhasil diperbarui');
    }

    public function destroy(Pengabdian $pengabdian)
    {
        $pengabdian->delete();
        $this->clearCache();
        return back()->with('success', 'Data dihapus');
    }

    private function clearCache()
    {
        // Increment version to invalidate all hash-based cache keys in PengabdianPageController
        $v = (int) Cache::get('pengabdian_cache_version', 0);
        Cache::put('pengabdian_cache_version', $v + 1, 86400 * 30); // Valid for 30 days
        
        // Also clear static filter option caches
        Cache::forget('filter_pengabdian_provinsi');
        Cache::forget('filter_pengabdian_tahun');
    }
}
