<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengabdian;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use App\Traits\DataFormatter;
class PengabdianController extends Controller
{
    use DataFormatter;

    public function index(Request $request)
    {
        $type = $request->input('type', 'batch');

        $query = Pengabdian::query();
        if ($type === 'kosabangsa') {
            $query->where(function($q) {
                $q->where('batch_type', 'kosabangsa')
                  ->orWhere('nama_skema', 'like', '%Kosabangsa%');
            });
        } else {
            // Masukkan batch lama dan tipe multitahun di tab default
            $query->whereIn('batch_type', ['batch_i', 'batch_ii', 'batch', 'multitahun', 'multitahun_lanjutan']);
        }

        // Pencarian global
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nama_institusi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%")
                  ->orWhere('prov_pt', 'like', "%{$search}%");
            });
        }

        // Filter berbasis kolom
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

        $perPage = (int) $request->input('perPage', 20);
        if ($perPage < 10) $perPage = 10;
        if ($perPage > 100) $perPage = 100;

        // Daftar pengurutan 
        $allowedSorts = ['id', 'nama', 'nidn', 'nama_institusi', 'judul', 'prov_pt', 'kab_pt', 'thn_pelaksanaan_kegiatan', 'nama_skema'];
        $sort = in_array($request->input('sort'), $allowedSorts, true) ? $request->input('sort') : 'id';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';

        // Versi Cache
        $v = Cache::get('pengabdian_admin_v', 5);
        $cacheKey = 'pengabdian_admin_v' . $v . '_' . md5(json_encode($request->all()));

        $data = Cache::remember($cacheKey, 600, function() use ($query, $perPage, $sort, $direction) {
            $pengabdian = $query
                ->orderBy($sort, $direction)
                ->orderBy('nama', 'asc')
                ->paginate($perPage)
                ->withQueryString();

            $pengabdian->getCollection()->transform(function ($item) {
                $item->nama = $this->formatName($item->nama);
                if (!empty($item->nama_pendamping)) {
                    $item->nama_pendamping = $this->formatName($item->nama_pendamping);
                }
                if (empty($item->kd_perguruan_tinggi)) {
                    $item->kd_perguruan_tinggi = '0';
                }
                return $item;
            });

            return $pengabdian;
        });

        $stats = Cache::remember('pengabdian_admin_stats', 3600, function() {
            return [
                'total' => Pengabdian::count(),
                'batch' => Pengabdian::whereIn('batch_type', ['batch_i', 'batch_ii', 'batch', 'multitahun', 'multitahun_lanjutan'])->count(),
                'kosabangsa' => Pengabdian::where(function($q) {
                    $q->where('batch_type', 'kosabangsa')
                      ->orWhere('nama_skema', 'like', '%Kosabangsa%');
                })->count(),
                'withCoordinates' => Pengabdian::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
            ];
        });

        return Inertia::render('Admin/Pengabdian/Index', [
            'pengabdian' => $data,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'type' => $type,
                'perPage' => $perPage,
                'columns' => $request->filters ?? [],
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Pengabdian/Routes/Create/Index');
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
            
            // Kolom spesifik Kosabangsa
            'nama_pendamping' => ['nullable', 'string', 'max:255'],
            'nidn_pendamping' => ['nullable', 'string', 'max:50'],
            'kd_perguruan_tinggi_pendamping' => ['nullable', 'string', 'max:50'],
            'institusi_pendamping' => ['nullable', 'string', 'max:255'],
            'lldikti_wilayah_pendamping' => ['nullable', 'string', 'max:100'],
            'jenis_wilayah_provinsi_mitra' => ['nullable', 'string', 'max:255'],
            'bidang_teknologi_inovasi' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['prov_pt'] = $this->formatProvinsi($validated['prov_pt'] ?? '');
        $validated['prov_mitra'] = $this->formatProvinsi($validated['prov_mitra'] ?? '');

        // Bersihkan kolom teks kosong dan deteksi PTN/PTS secara otomatis
        $fieldsToClean = ['klaster', 'wilayah_lldikti', 'bidang_fokus', 'nama_singkat_skema', 'urutan_thn_kegitan'];
        foreach ($fieldsToClean as $f) {
            if (empty($validated[$f]) || strtolower((string)$validated[$f]) === 'nan') {
                $validated[$f] = 'tidak tersedia';
            }
        }
        if (empty($validated['ptn_pts']) || strtolower((string)$validated['ptn_pts']) === 'nan') {
            $validated['ptn_pts'] = $this->isPTN($validated['nama_institusi']) ? 'PTN' : 'PTS';
        }

        Pengabdian::create($validated);
        $this->clearModuleCache();

        return redirect()->route('admin.pengabdian.index', ['type' => $request->batch_type])
            ->with('success', 'Data pengabdian berhasil ditambahkan');
    }

    public function edit(Request $request, $id)
    {
        if (is_string($id) && str_starts_with($id, 'json_')) {
            $index = (int) str_replace('json_', '', $id);
            $path = database_path('data/data-pengabdian.json');
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

                        // Fungsi untuk membersihkan data
                        $clean = function($v) {
                            if (is_string($v)) {
                                $v = trim($v);
                                if (mb_strtolower($v) === 'nan') return null;
                                return ltrim($v, "'");
                            }
                            return $v;
                        };

                        // Petakan kolom JSON ke kolom model (konsisten dengan index())
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
                            
                            // Kolom Kosabangsa
                            'nama_pendamping' => $clean($it['nama_pendamping'] ?? null),
                            'nidn_pendamping' => $clean($it['nidn_pendamping'] ?? null),
                            'kd_perguruan_tinggi_pendamping' => $clean($it['kd_perguruan_tinggi_pendamping'] ?? null),
                            'institusi_pendamping' => $clean($it['institusi_pendamping'] ?? null),
                            'lldikti_wilayah_pendamping' => $clean($it['lldikti_wilayah_pendamping'] ?? null),
                            'jenis_wilayah_provinsi_mitra' => $clean($it['jenis_wilayah_provinsi_mitra'] ?? null),
                            'bidang_teknologi_inovasi' => $clean($it['bidang_teknologi_inovasi'] ?? null),
                        ];
                        return Inertia::render('Admin/Pengabdian/Routes/Edit/Index', [
                        'item' => $item,
                        'filters' => $request->only(['page', 'type', 'search', 'perPage', 'filters'])
                    ]);
                    }
                }
            }
            abort(404);
        }


        $pengabdian = Pengabdian::findOrFail($id);
        
        // Fungsi untuk membersihkan data
        $clean = function($v) {
            if (is_string($v)) {
                $v = trim($v);
                if (mb_strtolower($v) === 'nan') return null;
                return ltrim($v, "'");
            }
            return $v;
        };

        // Coba cari informasi yang kurang dari JSON untuk SETIAP baris (terutama jika koordinat atau mitra tidak ada)
        $needsInfo = empty($pengabdian->pt_latitude) || empty($pengabdian->pt_longitude) || 
                     empty($pengabdian->prov_mitra) || empty($pengabdian->kab_mitra) ||
                     empty($pengabdian->ptn_pts) || empty($pengabdian->klaster) ||
                     ($pengabdian->nama_skema === 'Kosabangsa' && empty($pengabdian->nama_pendamping));

        if ($needsInfo) {
            $path = database_path('data/data-pengabdian.json');
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
                                // Ditemukan kecocokan di JSON, isi data jika di DB kosong
                                if (empty($pengabdian->pt_latitude)) $pengabdian->pt_latitude = $clean($it['pt_latitude'] ?? null);
                                if (empty($pengabdian->pt_longitude)) $pengabdian->pt_longitude = $clean($it['pt_longitude'] ?? null);
                                if (empty($pengabdian->prov_pt)) $pengabdian->prov_pt = $clean($it['Prov PT'] ?? ($it['prov_pt'] ?? null));
                                if (empty($pengabdian->kab_pt)) $pengabdian->kab_pt = $clean($it['Kab PT'] ?? ($it['kab_pt'] ?? null));
                                
                                // Pemetaan PTN/PTS
                                if (empty($pengabdian->ptn_pts)) {
                                    $pengabdian->ptn_pts = $clean($it['status PT'] ?? ($it['status_PT'] ?? ($it['ptn/pts'] ?? ($it['ptn_pts'] ?? ($it['ptn/pts_pelaksana'] ?? ($it['ptn_pts_pelaksana'] ?? null))))));
                                }
                                
                                // Pemetaan Klaster
                                if (empty($pengabdian->klaster)) {
                                    $pengabdian->klaster = $clean($it['nama_klaster'] ?? ($it['klaster'] ?? null));
                                }
                                
                                // Pemetaan LLDIKTI
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

        // Bersihkan semua kolom
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

        // Pastikan Huruf Kapital Di Awal dan awalan wilayah yang tepat agar pencarian frontend lebih mudah
        $normalizeLoc = function($s) {
            if (!$s) return $s;
            $s = trim($s);
            // Ganti "Kab." atau "Kab " menjadi "Kabupaten "
            $s = preg_replace('/^kab\.?\s+/i', 'Kabupaten ', $s);
            // Ganti "Kota " menjadi "Kota " (pastikan terstandar)
            $s = preg_replace('/^kota\s+/i', 'Kota ', $s);
            return mb_convert_case($s, MB_CASE_TITLE);
        };

        if ($pengabdian->prov_pt) $pengabdian->prov_pt = $normalizeLoc($pengabdian->prov_pt);
        if ($pengabdian->kab_pt) $pengabdian->kab_pt = $normalizeLoc($pengabdian->kab_pt);
        if ($pengabdian->prov_mitra) $pengabdian->prov_mitra = $normalizeLoc($pengabdian->prov_mitra);
        if ($pengabdian->kab_mitra) $pengabdian->kab_mitra = $normalizeLoc($pengabdian->kab_mitra);

        return Inertia::render('Admin/Pengabdian/Routes/Edit/Index', [
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

            // Kolom spesifik Kosabangsa
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

        $validated['prov_pt'] = $this->formatProvinsi($validated['prov_pt'] ?? '');
        $validated['prov_mitra'] = $this->formatProvinsi($validated['prov_mitra'] ?? '');

        if (is_string($id) && str_starts_with($id, 'json_')) {
            Pengabdian::create($validated);
            $this->clearModuleCache();
            return redirect()->route('admin.pengabdian.index', array_merge(['type' => $request->batch_type], $request->only(['page', 'search', 'perPage', 'filters'])))
                ->with('success', 'Data dari JSON berhasil disimpan ke database');
        }

        $pengabdian = Pengabdian::findOrFail($id);
        $pengabdian->update($validated);
        $this->clearModuleCache();

        return redirect()->route('admin.pengabdian.index', array_merge(['type' => $request->batch_type], $request->only(['page', 'search', 'perPage', 'filters'])))
            ->with('success', 'Data pengabdian berhasil diperbarui');
    }

    public function destroy(Pengabdian $pengabdian)
    {
        $pengabdian->delete();
        $this->clearModuleCache();
        return back()->with('success', 'Data dihapus');
    }

    public function bulkDestroy(Request $request)
    {
        if ($request->ids === 'all') {
            $query = Pengabdian::query();
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                        ->orWhere('nidn', 'like', "%{$search}%")
                        ->orWhere('judul', 'like', "%{$search}%")
                        ->orWhere('nama_institusi', 'like', "%{$search}%")
                        ->orWhere('prov_mitra', 'like', "%{$search}%")
                        ->orWhere('skema', 'like', "%{$search}%");
                });
            }
            if ($request->filled('filters')) {
                foreach ($request->filters as $key => $value) {
                    if (!empty($value)) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
            $count = $query->delete();
        } else {
            $request->validate([
                'ids'   => 'required|array|min:1',
            ]);
            $count = Pengabdian::whereIn('id', $request->ids)->delete();
        }

        $this->clearModuleCache();
        return back()->with('success', "{$count} data pengabdian berhasil dihapus.");
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'items'     => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:pengabdian,id',
        ]);

        $count = 0;
        foreach ($request->items as $itemData) {
            $pengabdian = Pengabdian::find($itemData['id']);
            if (!$pengabdian) continue;

            // Bersihkan koordinat
            if (isset($itemData['pt_latitude'])) {
                $itemData['pt_latitude'] = is_string($itemData['pt_latitude'])
                    ? str_replace(',', '.', $itemData['pt_latitude'])
                    : $itemData['pt_latitude'];
            }
            if (isset($itemData['pt_longitude'])) {
                $itemData['pt_longitude'] = is_string($itemData['pt_longitude'])
                    ? str_replace(',', '.', $itemData['pt_longitude'])
                    : $itemData['pt_longitude'];
            }
            // Normalisasi awalan kabupaten
            foreach (['kab_pt', 'kab_mitra'] as $field) {
                if (isset($itemData[$field]) && is_string($itemData[$field])) {
                    $itemData[$field] = preg_replace(['/^kab\.\s*/i', '/^kab\s+/i'], ['Kabupaten ', 'Kabupaten '], trim($itemData[$field]));
                }
            }
            
            // Format provinsi
            if (isset($itemData['prov_pt'])) $itemData['prov_pt'] = $this->formatProvinsi($itemData['prov_pt']);
            if (isset($itemData['prov_mitra'])) $itemData['prov_mitra'] = $this->formatProvinsi($itemData['prov_mitra']);

            // Hapus ID dari data untuk menghindari overwrite
            unset($itemData['id']);

            $pengabdian->update($itemData);
            $count++;
        }

        $this->clearModuleCache();
        return back()->with('success', "{$count} data pengabdian berhasil diperbarui.");
    }

    public function exportCsv(Request $request)
    {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        $query = Pengabdian::select(
            'id', 'nama', 'nidn', 'kd_perguruan_tinggi', 'nama_institusi', 'wilayah_lldikti',
            'ptn_pts', 'kab_pt', 'prov_pt', 'klaster', 'judul', 'nama_singkat_skema',
            'thn_pelaksanaan_kegiatan', 'urutan_thn_kegitan', 'nama_skema', 'bidang_fokus',
            'prov_mitra', 'kab_mitra', 'batch_type', 'pt_latitude', 'pt_longitude',
            'nama_pendamping', 'nidn_pendamping', 'kd_perguruan_tinggi_pendamping',
            'institusi_pendamping', 'lldikti_wilayah_pendamping', 'jenis_wilayah_provinsi_mitra',
            'bidang_teknologi_inovasi'
        );

        $type = $request->input('type', 'batch');
        if ($type === 'kosabangsa') {
            $query->where(function($q) {
                $q->where('batch_type', 'kosabangsa')
                  ->orWhere('nama_skema', 'like', '%Kosabangsa%');
            });
        } else {
            $query->whereIn('batch_type', ['batch_i', 'batch_ii', 'batch', 'multitahun', 'multitahun_lanjutan']);
        }
        
        if ($request->filled('ids') && $request->ids !== 'all') {
            $ids = explode(',', $request->ids);
            $query->whereIn('id', $ids);
        }

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
            foreach ($request->filters as $key => $value) {
                if (!empty($value) && in_array($key, [
                    'nama','nidn','nama_institusi','judul','prov_pt','kab_pt','ptn_pts',
                    'nama_skema','nama_singkat_skema','bidang_fokus','thn_pelaksanaan_kegiatan','prov_mitra','kab_mitra',
                ])) {
                    $query->where($key, 'like', "%{$value}%");
                }
            }
        }

        $filterLabel = ($request->filled('search') || $request->filled('filters')) ? '_filtered' : '';
        $filename = 'data-pengabdian-' . $type . $filterLabel . '_' . date('Y-m-d') . '.csv';

        if ($type === 'kosabangsa') {
            $columns = [
                'ID', 'Nama', 'NIDN', 'KD Perguruan Tinggi', 'Institusi', 'Wilayah LLDIKTI', 
                'PTN/PTS', 'Kab PT', 'Prov PT', 'Klaster', 'Judul', 'Nama Singkat Skema', 
                'Tahun', 'Urutan Tahun Kegiatan', 'Nama Skema', 'Bidang Fokus', 
                'Prov Mitra', 'Kab Mitra', 'Latitude', 'Longitude',
                'Nama Pendamping', 'NIDN Pendamping', 'KD Perguruan Tinggi Pendamping', 
                'Institusi Pendamping', 'LLDIKTI Wilayah Pendamping', 
                'Jenis Wilayah Provinsi Mitra', 'Bidang Teknologi Inovasi'
            ];
        } else {
            $columns = [
                'ID', 'Nama', 'NIDN', 'KD Perguruan Tinggi', 'Institusi', 'Wilayah LLDIKTI', 
                'PTN/PTS', 'Kab PT', 'Prov PT', 'Klaster', 'Judul', 'Nama Singkat Skema', 
                'Tahun', 'Urutan Tahun Kegiatan', 'Nama Skema', 'Bidang Fokus', 
                'Prov Mitra', 'Kab Mitra', 'Latitude', 'Longitude'
            ];
        }

        $callback = function() use ($columns, $query, $type) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            $query->orderBy('thn_pelaksanaan_kegiatan', 'desc')->chunk(1000, function($data) use($file, $type) {
                foreach ($data as $row) {
                    $clean = function($val) {
                        if ($val === null) return '';
                        return str_replace(["\r", "\n"], ' ', (string)$val);
                    };

                    $rowData = [
                        $row->id, 
                        $clean($row->nama), 
                        $clean($row->nidn), 
                        $clean($row->kd_perguruan_tinggi),
                        $clean($row->nama_institusi), 
                        $clean($row->wilayah_lldikti), 
                        $clean($row->ptn_pts),
                        $clean($row->kab_pt), 
                        $clean($row->prov_pt), 
                        $clean($row->klaster), 
                        $clean($row->judul),
                        $clean($row->nama_singkat_skema), 
                        $row->thn_pelaksanaan_kegiatan,
                        $clean($row->urutan_thn_kegitan), 
                        $clean($row->nama_skema), 
                        $clean($row->bidang_fokus),
                        $clean($row->prov_mitra), 
                        $clean($row->kab_mitra), 
                        $row->pt_latitude, 
                        $row->pt_longitude
                    ];
                    
                    if ($type === 'kosabangsa') {
                        $rowData = array_merge($rowData, [
                            $clean($row->nama_pendamping), 
                            $clean($row->nidn_pendamping), 
                            $clean($row->kd_perguruan_tinggi_pendamping),
                            $clean($row->institusi_pendamping), 
                            $clean($row->lldikti_wilayah_pendamping),
                            $clean($row->jenis_wilayah_provinsi_mitra), 
                            $clean($row->bidang_teknologi_inovasi)
                        ]);
                    }
                    
                    fputcsv($file, $rowData);
                }
            });
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Pragma'              => 'public',
        ]);
    }

    public function exportJson(Request $request)
    {
        $query = Pengabdian::query();

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->search . '%')
                  ->orWhere('judul', 'like', '%' . $request->search . '%')
                  ->orWhere('nama_institusi', 'like', '%' . $request->search . '%');
            });
        }

        if ($filters = $request->input('filters')) {
             foreach ($filters as $key => $value) {
                 if ($value) $query->where($key, 'like', '%' . $value . '%');
             }
        }

        $data = $query->orderBy('thn_pelaksanaan_kegiatan', 'desc')->limit(50000)->get();
        return response()->json($data);
    }

    public function importExcel(Request $request)
    {
        try {
            $request->validate([
                'data' => 'required|array',
                'data.*' => 'array',
            ]);

            $imported = 0;
            $updated = 0;
            $errors = [];
            $batch = [];

            // Validasi Header Ketat (Tolak jika kolom tidak sesuai)
            if (!empty($request->data)) {
                $firstRow = $request->data[0];
                $foundKeys = array_map(function($k) {
                    return strtolower(str_replace([' ', '/', '_'], '', $k));
                }, array_keys($firstRow));

                $required = ['batchtype', 'nama', 'namainstitusi', 'judul', 'thnpelaksanaankegiatan'];
                $missing = [];
                foreach ($required as $req) {
                    if (!in_array($req, $foundKeys)) {
                        // Sesuaikan dengan alias jika tidak ditemukan
                        $aliases = [
                            'namainstitusi' => ['institusi', 'perguruantinggi'],
                            'thnpelaksanaankegiatan' => ['tahun']
                        ];
                        $foundAlias = false;
                        if (isset($aliases[$req])) {
                            foreach ($aliases[$req] as $alt) {
                                if (in_array($alt, $foundKeys)) { $foundAlias = true; break; }
                            }
                        }
                        if (!$foundAlias) $missing[] = $req;
                    }
                }

                if (!empty($missing)) {
                    return back()->with('error', 'Format file tidak sesuai! Mohon gunakan template yang benar. Kolom wajib yang hilang: ' . implode(', ', $missing));
                }
            }

            foreach ($request->data as $index => $row) {
                $rowNum = $index + 1;
                $normalizedRow = [];
                foreach ($row as $k => $v) {
                    $cleanKey = strtolower(str_replace([' ', '/', '_'], '', $k));
                    $normalizedRow[$cleanKey] = $v;
                }

                $id = $normalizedRow['id'] ?? null;
                $nama = trim($normalizedRow['nama'] ?? $normalizedRow['peneliti'] ?? $normalizedRow['namapengusul'] ?? '');
                $institusi = trim($normalizedRow['namainstitusi'] ?? $normalizedRow['institusi'] ?? $normalizedRow['perguruan_tinggi'] ?? '');
                $judul = trim($normalizedRow['judul'] ?? $normalizedRow['judulpenelitian'] ?? $normalizedRow['judulberita'] ?? '');
                $tahun = (int)($normalizedRow['thnpelaksanaankegiatan'] ?? $normalizedRow['tahun'] ?? date('Y'));

                if (empty($nama)) { $errors[] = "Baris #{$rowNum}: Kolom 'Nama' wajib diisi."; continue; }
                if (empty($judul)) { $errors[] = "Baris #{$rowNum}: Kolom 'Judul' wajib diisi."; continue; }
                if (empty($institusi)) { $errors[] = "Baris #{$rowNum}: Kolom 'Institusi' wajib diisi."; continue; }

                $rawBatchType = strtolower(trim($normalizedRow['batchtype'] ?? 'batch'));
                $batchType = match(true) {
                    str_contains($rawBatchType, 'kosabangsa') => 'kosabangsa',
                    str_contains($rawBatchType, 'multitahun') => 'multitahun',
                    str_contains($rawBatchType, 'batchi') || str_contains($rawBatchType, 'batch1') || $rawBatchType === 'batch i' => 'batch_i',
                    str_contains($rawBatchType, 'batchii') || str_contains($rawBatchType, 'batch2') || $rawBatchType === 'batch ii' => 'batch_ii',
                    default => 'batch'
                };

                $data = [
                    'nama' => $nama,
                    'nidn' => $normalizedRow['nidn'] ?? null,
                    'nama_institusi' => $institusi,
                    'kd_perguruan_tinggi' => $normalizedRow['kdperguruantinggi'] ?? '0',
                    'prov_pt' => $normalizedRow['provpt'] ?? $normalizedRow['provinsi'] ?? '-',
                    'kab_pt' => $normalizedRow['kabpt'] ?? $normalizedRow['kabupaten'] ?? '-',
                    'pt_latitude' => $normalizedRow['ptlatitude'] ?? $normalizedRow['latitude'] ?? -6.2,
                    'pt_longitude' => $normalizedRow['ptlongitude'] ?? $normalizedRow['longitude'] ?? 106.8,
                    'judul' => $judul,
                    'nama_skema' => $normalizedRow['namaskema'] ?? $normalizedRow['skema'] ?? '-',
                    'nama_singkat_skema' => $normalizedRow['namasingkatskema'] ?? '-',
                    'thn_pelaksanaan_kegiatan' => $tahun,
                    'urutan_thn_kegitan' => $normalizedRow['urutanthnkegitan'] ?? $normalizedRow['urutantahunkegiatan'] ?? null,
                    'bidang_fokus' => $normalizedRow['bidangfokus'] ?? '-',
                    'prov_mitra' => $normalizedRow['provmitra'] ?? $normalizedRow['provinsimitra'] ?? '-',
                    'kab_mitra' => $normalizedRow['kabmitra'] ?? $normalizedRow['kabupatenmitra'] ?? '-',
                    'batch_type' => $batchType,
                    'wilayah_lldikti' => $normalizedRow['wilayahlldikti'] ?? $normalizedRow['lldikti'] ?? null,
                    'ptn_pts' => $normalizedRow['ptnpts'] ?? null,
                    'klaster' => $normalizedRow['klaster'] ?? null,
                ];

                // Tambahkan kolom khusus Kosabangsa
                if ($batchType === 'kosabangsa') {
                    $data['nama_skema'] = 'Kosabangsa';
                    $data['nama_singkat_skema'] = 'Kosabangsa';
                    $data['nama_pendamping'] = $normalizedRow['namapendamping'] ?? null;
                    $data['nidn_pendamping'] = $normalizedRow['nidnpendamping'] ?? null;
                    $data['kd_perguruan_tinggi_pendamping'] = $normalizedRow['kdperguruantinggipendamping'] ?? null;
                    $data['institusi_pendamping'] = $normalizedRow['institusipendamping'] ?? null;
                    $data['lldikti_wilayah_pendamping'] = $normalizedRow['lldiktiwilayahpendamping'] ?? null;
                    $data['jenis_wilayah_provinsi_mitra'] = $normalizedRow['jeniswilayahprovinsimitra'] ?? null;
                    $data['bidang_teknologi_inovasi'] = $normalizedRow['bidangteknologiinovasi'] ?? null;
                }

                // Auto-detect PTN/PTS jika tidak ada
                if (empty($data['ptn_pts'])) {
                    $data['ptn_pts'] = $this->isPTN($institusi) ? 'PTN' : 'PTS';
                }

                if ($id && Pengabdian::find($id)) {
                    Pengabdian::where('id', $id)->update($data);
                    $updated++;
                } else {
                    $batch[] = $data;
                    $imported++;
                }

                if (count($batch) >= 100) {
                    Pengabdian::insert($batch);
                    $batch = [];
                }
            }

            if (count($batch) > 0) Pengabdian::insert($batch);

            $this->clearModuleCache();

            $message = "Import selesai: {$imported} baru, {$updated} diperbarui.";
            if (count($errors) > 0) {
                $errorDetail = implode('; ', array_slice($errors, 0, 2));
                return back()->with('error', $message . " (" . count($errors) . " baris gagal: " . $errorDetail . "...)");
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan sistem saat import: ' . $e->getMessage());
        }
    }

    private function clearModuleCache()
    {
        // Cache admin panel
        Cache::forget('pengabdian_admin_stats');
        Cache::forget('admin_dashboard_stats');
        $v = (int) Cache::get('pengabdian_admin_v', 1);
        Cache::put('pengabdian_admin_v', $v + 1, 86400 * 30);
        
        $pv = (int) Cache::get('permasalahan_cache_version', 1);
        Cache::put('permasalahan_cache_version', $pv + 1, 86400 * 30);

        // Cache frontend publik — hapus agar website langsung update
        $fv = (int) Cache::get('pengabdian_cache_version', 1);
        Cache::put('pengabdian_cache_version', $fv + 1, 86400 * 30);
        Cache::forget('filter_pengabdian_bidang_fokus');
        Cache::forget('filter_pengabdian_skema');
        Cache::forget('filter_pengabdian_provinsi');
        Cache::forget('filter_pengabdian_tahun');
    }
}
