<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hilirisasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Cache;
use App\Traits\DataFormatter;
class HilirisasiController extends Controller
{
    use DataFormatter;


    public function index(Request $request)
    {
        $query = Hilirisasi::query();

        // Pengurutan dan paginasi 
        $allowedSorts = ['id', 'judul', 'id_proposal', 'nama_pengusul', 'perguruan_tinggi', 'tahun', 'direktorat', 'provinsi', 'skema'];
        $sort = in_array($request->input('sort'), $allowedSorts, true) ? $request->input('sort') : 'id';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) $request->input('perPage', 20);
        if ($perPage < 10) { $perPage = 10; }
        if ($perPage > 100) { $perPage = 100; }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_pengusul', 'like', "%{$search}%")
                  ->orWhere('perguruan_tinggi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%")
                  ->orWhere('provinsi', 'like', "%{$search}%")
                  ->orWhere('skema', 'like', "%{$search}%")
                  ->orWhere('direktorat', 'like', "%{$search}%")
                  ->orWhere('mitra', 'like', "%{$search}%");
            });
        }

        // Filter kolom
        if ($request->filled('filters')) {
            $filters = $request->filters;
            foreach ($filters as $key => $value) {
                if (!empty($value)) {
                    if (in_array($key, [
                        'judul', 'nama_pengusul', 'perguruan_tinggi',
                        'tahun', 'direktorat', 'provinsi', 'skema', 'mitra'
                    ])) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        // Versi Cache
        $v = Cache::get('hilirisasi_admin_v', 5);
        $cacheKey = 'hilirisasi_admin_v' . $v . '_' . md5(json_encode($request->all()));

        $data = Cache::remember($cacheKey, 600, function() use ($query, $perPage, $sort, $direction) {
            $hilirisasi = $query
                ->orderBy($sort, $direction)
                ->orderBy('nama_pengusul', 'asc')
                ->paginate($perPage)
                ->withQueryString();

            $hilirisasi->getCollection()->transform(function ($item) {
                $item->nama_pengusul = $this->formatName($item->nama_pengusul);
                
                // Aturan pemulihan otomatis (self-healing) untuk konsistensi tampilan
                $clean = function($v, $isNumeric = false) {
                    if (is_string($v)) $v = ltrim(trim($v), "'");
                    if ($v === null || $v === '' || (is_numeric($v) && is_nan((float)$v)) || $v === 'NaN') {
                        return $isNumeric ? 0 : 'tidak tersedia';
                    }
                    return $v;
                };

                $numericFields = ['tahun'];
                $textFields = ['id_proposal', 'perguruan_tinggi', 'provinsi', 'mitra', 'luaran'];
                $dropdownFields = ['direktorat', 'skema'];
                
                foreach ($numericFields as $f) {
                    $item->$f = $clean($item->$f, true);
                }
                foreach ($textFields as $f) {
                    $item->$f = $clean($item->$f, false);
                }
                foreach ($dropdownFields as $f) {
                    $val = ltrim(trim($item->$f), "'");
                    $item->$f = ($val === '' || $val === '-' || $val === null) ? '' : $val;
                }

                return $item;
            });

            return $hilirisasi;
        });

        $stats = Cache::remember('hilirisasi_admin_stats', 3600, function() {
            return [
                'total' => Hilirisasi::count(),
                'thisYear' => Hilirisasi::where('tahun', (int) date('Y'))->count(),
                'withCoordinates' => Hilirisasi::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
            ];
        });

        return Inertia::render('Admin/Hilirisasi/Index', [
            'hilirisasi' => $data,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search'),
                'columns' => $request->input('filters', []), // Kembalikan filter kolom
                'sort' => $sort,
                'direction' => $direction,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Hilirisasi/Routes/Create/Index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tahun' => ['required', 'numeric'],
            'id_proposal' => ['required'],
            'judul' => ['required', 'string'],
            'nama_pengusul' => ['required', 'string', 'max:255'],
            'direktorat' => ['required', 'string', 'max:255'],
            'perguruan_tinggi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['required', 'numeric', 'between:-180,180'],
            'provinsi' => ['required', 'string', 'max:255'],
            'mitra' => ['required', 'string', 'max:255'],
            'skema' => ['required', 'string', 'max:255'],
            'luaran' => ['required', 'string'],
        ]);

        $validated['provinsi'] = $this->formatProvinsi($validated['provinsi'] ?? '');

        Hilirisasi::create($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.hilirisasi.index')->with('success', 'Data hilirisasi berhasil ditambahkan');
    }

    public function edit(Request $request, Hilirisasi $hilirisasi)
    {
        $clean = function($v, $isNumeric = false) {
            if (is_string($v)) $v = ltrim(trim($v), "'");
            if ($v === null || $v === '' || (is_numeric($v) && is_nan((float)$v)) || $v === 'NaN') {
                return $isNumeric ? 0 : 'tidak tersedia';
            }
            return $v;
        };

        $numericFields = ['tahun'];
        $textFields = ['id_proposal', 'perguruan_tinggi', 'provinsi', 'mitra', 'luaran'];
        $dropdownFields = ['direktorat', 'skema'];
        
        foreach ($numericFields as $f) {
            $hilirisasi->$f = $clean($hilirisasi->$f, true);
        }
        foreach ($textFields as $f) {
            $hilirisasi->$f = $clean($hilirisasi->$f, false);
        }
        foreach ($dropdownFields as $f) {
            $val = ltrim(trim($hilirisasi->$f), "'");
            $hilirisasi->$f = ($val === '' || $val === '-' || $val === null) ? '' : $val;
        }

        return Inertia::render('Admin/Hilirisasi/Routes/Edit/Index', [
            'item' => $hilirisasi,
            'filters' => $request->only(['page', 'search', 'perPage', 'filters', 'sort', 'direction'])
        ]);
    }

    public function update(Request $request, Hilirisasi $hilirisasi)
    {
        $request->merge([
            'pt_latitude' => is_string($request->pt_latitude) ? str_replace(',', '.', $request->pt_latitude) : $request->pt_latitude,
            'pt_longitude' => is_string($request->pt_longitude) ? str_replace(',', '.', $request->pt_longitude) : $request->pt_longitude,
            'provinsi' => empty($request->provinsi) ? 'tidak tersedia' : $request->provinsi,
            'mitra' => empty($request->mitra) ? 'tidak tersedia' : $request->mitra,
            'skema' => empty($request->skema) ? 'tidak tersedia' : $request->skema,
            'direktorat' => empty($request->direktorat) ? 'tidak tersedia' : $request->direktorat,
            'luaran' => empty($request->luaran) ? 'tidak tersedia' : $request->luaran,
        ]);

        $validated = $request->validate([
            'tahun' => ['required', 'numeric'],
            'id_proposal' => ['required'],
            'judul' => ['required', 'string'],
            'nama_pengusul' => ['required', 'string', 'max:255'],
            'direktorat' => ['required', 'string', 'max:255'],
            'perguruan_tinggi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['required', 'numeric', 'between:-180,180'],
            'provinsi' => ['required', 'string', 'max:255'],
            'mitra' => ['required', 'string', 'max:255'],
            'skema' => ['required', 'string', 'max:255'],
            'luaran' => ['required', 'string'],
        ]);

        $validated['provinsi'] = $this->formatProvinsi($validated['provinsi'] ?? '');

        $hilirisasi->update($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.hilirisasi.index', $request->only(['page', 'search', 'perPage', 'filters', 'sort', 'direction']))
            ->with('success', 'Data hilirisasi berhasil diperbarui');
    }

    public function destroy(Hilirisasi $hilirisasi)
    {
        $hilirisasi->delete();
        $this->clearModuleCache();
        return back()->with('success', 'Data dihapus');
    }

    public function bulkDestroy(Request $request)
    {
        if ($request->ids === 'all') {
            $query = Hilirisasi::query();
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('judul', 'like', "%{$search}%")
                        ->orWhere('id_proposal', 'like', "%{$search}%")
                        ->orWhere('nama_pengusul', 'like', "%{$search}%")
                        ->orWhere('perguruan_tinggi', 'like', "%{$search}%")
                        ->orWhere('mitra', 'like', "%{$search}%");
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
            $request->validate(['ids' => 'required|array']);
            $count = Hilirisasi::whereIn('id', $request->ids)->delete();
        }

        $this->clearModuleCache();
        return back()->with('success', "{$count} data hilirisasi berhasil dihapus.");
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'items'       => 'required|array|min:1',
            'items.*.id'  => 'required|integer|exists:hilirisasi,id',
        ]);

        $allowedFields = [
            'tahun', 'id_proposal', 'judul', 'nama_pengusul', 'direktorat',
            'perguruan_tinggi', 'pt_latitude', 'pt_longitude', 'provinsi',
            'mitra', 'skema', 'luaran',
        ];

        $count = 0;
        foreach ($request->items as $item) {
            $id = $item['id'] ?? null;
            if (!$id) continue;

            $updateData = [];
            foreach ($item as $key => $value) {
                if ($key === 'id') continue;
                if (!in_array($key, $allowedFields)) continue;

                if (in_array($key, ['pt_latitude', 'pt_longitude'])) {
                    if ($value === null || $value === '' || !is_numeric(str_replace(',', '.', $value))) {
                        $updateData[$key] = 0;
                    } else {
                        $updateData[$key] = (float)str_replace(',', '.', $value);
                    }
                } else if ($key === 'tahun') {
                    if ($value === null || $value === '' || !is_numeric($value)) {
                        $updateData[$key] = 0;
                    } else {
                        $updateData[$key] = (int)$value;
                    }
                } else if ($key === 'provinsi') {
                    $updateData[$key] = $this->formatProvinsi($value);
                } else {
                    // normalisasi kosong menjadi "tidak tersedia" untuk field teks
                    if (in_array($key, ['id_proposal', 'provinsi', 'mitra', 'skema', 'direktorat', 'luaran'])) {
                        if (empty($value) && $value !== '0') $value = 'tidak tersedia';
                    }
                    $updateData[$key] = $value;
                }
            }

            if (!empty($updateData)) {
                Hilirisasi::where('id', $id)->update($updateData);
                $count++;
            }
        }

        $this->clearModuleCache();
        return back()->with('success', "{$count} data hilirisasi berhasil diperbarui.");
    }

    private function clearModuleCache()
    {
        // Cache admin panel
        $v = (int) Cache::get('hilirisasi_admin_v', 1);
        Cache::put('hilirisasi_admin_v', $v + 1, 86400);
        Cache::forget('hilirisasi_admin_stats');
        Cache::forget('admin_dashboard_stats');
        
        // Versi cache frontend publik
        $hv = (int) Cache::get('hilirisasi_cache_version', 1);
        Cache::put('hilirisasi_cache_version', $hv + 1, 86400 * 30);
        
        $pv = (int) Cache::get('permasalahan_cache_version', 1);
        Cache::put('permasalahan_cache_version', $pv + 1, 86400 * 30);



        // Cache frontend publik — hapus agar website langsung update
        Cache::forget('filter_hilirisasi_direktorat');
        Cache::forget('filter_hilirisasi_skema');
        Cache::forget('filter_hilirisasi_provinsi');
        Cache::forget('filter_hilirisasi_tahun');
    }

    public function exportCsv(Request $request)
    {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        $query = Hilirisasi::select(
            'id', 'tahun', 'id_proposal', 'judul', 'nama_pengusul', 'direktorat',
            'perguruan_tinggi', 'pt_latitude', 'pt_longitude', 'provinsi',
            'mitra', 'skema', 'luaran'
        );

        if ($request->filled('ids') && $request->ids !== 'all') {
            $ids = explode(',', $request->ids);
            $query->whereIn('id', $ids);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_pengusul', 'like', "%{$search}%")
                  ->orWhere('perguruan_tinggi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%");
            });
        }

        if ($filters = $request->input('filters')) {
            foreach ($filters as $key => $value) {
                if ($value && in_array($key, ['judul','nama_pengusul','perguruan_tinggi','tahun','direktorat','provinsi','skema','mitra'])) {
                    $query->where($key, 'like', '%' . $value . '%');
                }
            }
        }

        $filterLabel = ($request->filled('search') || $request->filled('filters')) ? '_filtered' : '';
        $filename = 'data-hilirisasi' . $filterLabel . '_' . date('Y-m-d') . '.csv';

        $columns = ['ID', 'Tahun', 'ID Proposal', 'Judul', 'Nama Pengusul', 'Direktorat', 'Perguruan Tinggi', 'Provinsi', 'Mitra', 'Skema', 'Luaran', 'Latitude', 'Longitude'];

        $callback = function() use ($columns, $query) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            $query->orderBy('tahun', 'desc')->chunk(1000, function($data) use($file) {
                foreach ($data as $row) {
                    $clean = function($val) {
                        if ($val === null) return '';
                        return str_replace(["\r", "\n"], ' ', (string)$val);
                    };
                    
                    fputcsv($file, [
                        $row->id, 
                        $row->tahun, 
                        $clean($row->id_proposal), 
                        $clean($row->judul),
                        $clean($row->nama_pengusul), 
                        $clean($row->direktorat), 
                        $clean($row->perguruan_tinggi),
                        $clean($row->provinsi), 
                        $clean($row->mitra), 
                        $clean($row->skema), 
                        $clean($row->luaran),
                        $row->pt_latitude, 
                        $row->pt_longitude
                    ]);
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
        $query = Hilirisasi::query();

        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_pengusul', 'like', "%{$search}%")
                  ->orWhere('perguruan_tinggi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%");
            });
        }

        if ($filters = $request->input('filters')) {
             foreach ($filters as $key => $value) {
                 if ($value) $query->where($key, 'like', '%' . $value . '%');
             }
        }

        $data = $query->orderBy('tahun', 'desc')->limit(50000)->get();
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

                $required = [
                    'tahun', 'idproposal', 'judul', 'namapengusul', 'direktorat', 
                    'perguruantinggi', 'ptlatitude', 'ptlongitude', 'provinsi', 
                    'mitra', 'skema', 'luaran'
                ];
                $missing = [];
                foreach ($required as $req) {
                    if (!in_array($req, $foundKeys)) {
                        $aliases = [
                            'namapengusul' => ['nama', 'peneliti', 'inventor'],
                            'perguruantinggi' => ['institusi', 'namainstitusi'],
                            'idproposal' => ['id_proposal'],
                            'ptlatitude' => ['latitude'],
                            'ptlongitude' => ['longitude'],
                        ];
                        $foundAlias = false;
                        if (isset($aliases[$req])) {
                            foreach ($aliases[$req] as $alt) { 
                                if (in_array(strtolower(str_replace([' ', '/', '_'], '', $alt)), $foundKeys)) { $foundAlias = true; break; } 
                            }
                        }
                        if (!$foundAlias) $missing[] = str_replace('pt', 'pt_', $req);
                    }
                }
                if (!empty($missing)) {
                    return back()->with('error', 'Format file ditolak! File harus memiliki kolom lengkap sesuai database: ' . implode(', ', $missing));
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
                $nama = trim($normalizedRow['namapengusul'] ?? $normalizedRow['nama'] ?? $normalizedRow['peneliti'] ?? '');
                $institusi = trim($normalizedRow['perguruantinggi'] ?? $normalizedRow['institusi'] ?? $normalizedRow['namainstitusi'] ?? '');
                $judul = trim($normalizedRow['judul'] ?? $normalizedRow['judulpenelitian'] ?? $normalizedRow['judulhilirisasi'] ?? '');
                $tahun = (int)($normalizedRow['tahun'] ?? date('Y'));

                if (empty($nama)) { $errors[] = "Baris #{$rowNum}: Kolom 'Nama Pengusul' wajib diisi."; continue; }
                if (empty($judul)) { $errors[] = "Baris #{$rowNum}: Kolom 'Judul' wajib diisi."; continue; }
                if (empty($institusi)) { $errors[] = "Baris #{$rowNum}: Kolom 'Perguruan Tinggi' wajib diisi."; continue; }

                $data = [
                    'nama_pengusul' => $nama,
                    'perguruan_tinggi' => $institusi,
                    'judul' => $judul,
                    'tahun' => $tahun,
                    'direktorat' => $normalizedRow['direktorat'] ?? 'tidak tersedia',
                    'skema' => $normalizedRow['skema'] ?? 'tidak tersedia',
                    'mitra' => $normalizedRow['mitra'] ?? 'tidak tersedia',
                    'provinsi' => $this->formatProvinsi($normalizedRow['provinsi'] ?? 'tidak tersedia'),
                    'pt_latitude' => $normalizedRow['ptlatitude'] ?? $normalizedRow['latitude'] ?? -6.2,
                    'pt_longitude' => $normalizedRow['ptlongitude'] ?? $normalizedRow['longitude'] ?? 106.8,
                    'id_proposal' => $normalizedRow['idproposal'] ?? '0',
                    'luaran' => $normalizedRow['luaran'] ?? 'tidak tersedia',
                ];

                if ($id && Hilirisasi::find($id)) {
                    Hilirisasi::where('id', $id)->update($data);
                    $updated++;
                } else {
                    $batch[] = $data;
                    $imported++;
                }

                if (count($batch) >= 100) {
                    Hilirisasi::insert($batch);
                    $batch = [];
                }
            }

            if (count($batch) > 0) Hilirisasi::insert($batch);

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
}
