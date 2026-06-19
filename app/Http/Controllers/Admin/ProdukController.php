<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Traits\DataFormatter;
class ProdukController extends Controller
{
    use DataFormatter;

    public function index(Request $request)
    {
        $query = Produk::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                    ->orWhere('institusi', 'like', "%{$search}%")
                    ->orWhere('nomor_paten', 'like', "%{$search}%")
                    ->orWhere('deskripsi_paten', 'like', "%{$search}%")
                    ->orWhere('bidang', 'like', "%{$search}%");
            });
        }

        // Tangani filter kolom
        $filters = $request->input('filters', []);
        if (is_array($filters)) {
            foreach ($filters as $column => $value) {
                if (!empty($value) && in_array($column, ['nama_produk', 'institusi', 'bidang', 'tkt', 'provinsi', 'nomor_paten', 'deskripsi_paten'])) {
                    $query->where($column, 'like', "%{$value}%");
                }
            }
        }

        $perPage = $request->input('perPage', 20);

        // Pengurutan
        $allowedSorts = ['id', 'nama_produk', 'institusi', 'bidang', 'tkt', 'provinsi', 'nomor_paten', 'deskripsi_paten'];
        $sort = in_array($request->input('sort'), $allowedSorts, true) ? $request->input('sort') : 'id';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';

        // Versi Cache
        $v = Cache::get('produk_admin_v', 1);
        $cacheKey = 'produk_admin_v' . $v . '_' . md5(json_encode($request->all()));

        $data = Cache::remember($cacheKey, 600, function () use ($query, $perPage, $sort, $direction) {
            $produk = $query
                ->orderBy($sort, $direction)
                ->orderBy('nama_inventor', 'asc')
                ->paginate($perPage)
                ->withQueryString();

            $produk->getCollection()->transform(function ($item) {
                if (isset($item->nama_inventor)) {
                    $item->nama_inventor = $this->formatName($item->nama_inventor);
                }
                
                // Pemulihan otomatis (self-healing) untuk state kosong
                $clean = function($v, $isNumeric = false) {
                    if (is_string($v)) $v = ltrim(trim($v), "'");
                    if ($v === null || $v === '' || (is_numeric($v) && is_nan((float)$v)) || $v === 'NaN') {
                        return $isNumeric ? 0 : 'tidak tersedia';
                    }
                    return $v;
                };

                $item->provinsi = $this->formatProvinsi($clean($item->provinsi));
                $item->bidang = $clean($item->bidang);
                $item->nomor_paten = $clean($item->nomor_paten);
                $item->deskripsi_paten = $clean($item->deskripsi_paten);
                $item->deskripsi_produk = $clean($item->deskripsi_produk);
                $item->email_inventor = ($item->email_inventor === 'NaN' || !$item->email_inventor) ? 'tidak tersedia' : $item->email_inventor;

                return $item;
            });

            return $produk;
        });

        $stats = Cache::remember('produk_admin_stats', 3600, function () {
            return [
                'total' => Produk::count(),
                'withCoordinates' => Produk::whereNotNull('latitude')->whereNotNull('longitude')->count(),
            ];
        });

        return Inertia::render('Admin/Produk/Index', [
            'produk' => $data,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
                'columns' => $filters,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Produk/Routes/Create/Index');
    }

    public function store(Request $request)
    {
        $request->merge([
            'latitude' => is_string($request->latitude) ? str_replace(',', '.', $request->latitude) : $request->latitude,
            'longitude' => is_string($request->longitude) ? str_replace(',', '.', $request->longitude) : $request->longitude,
        ]);

        $validated = $request->validate([
            'nama_produk' => ['required', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'deskripsi_produk' => ['required', 'string'],
            'bidang' => ['required', 'string', 'max:255'],
            'tkt' => ['required', 'numeric', 'min:1', 'max:9'],
            'provinsi' => ['required', 'string', 'max:255'],
            'nama_inventor' => ['required', 'string', 'max:255'],
            'email_inventor' => ['nullable', 'email', 'max:255'],
            'nomor_paten' => ['nullable', 'string', 'max:255'],
            'deskripsi_paten' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $validated['provinsi'] = $this->formatProvinsi($validated['provinsi'] ?? '');

        Produk::create($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.produk.index')->with('success', 'Data produk berhasil ditambahkan');
    }

    public function edit(Produk $produk)
    {
        return Inertia::render('Admin/Produk/Routes/Edit/Index', ['item' => $produk]);
    }

    public function update(Request $request, Produk $produk)
    {
        $request->merge([
            'latitude' => is_string($request->latitude) ? str_replace(',', '.', $request->latitude) : $request->latitude,
            'longitude' => is_string($request->longitude) ? str_replace(',', '.', $request->longitude) : $request->longitude,
        ]);

        $validated = $request->validate([
            'nama_produk' => ['required', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'deskripsi_produk' => ['required', 'string'],
            'bidang' => ['required', 'string', 'max:255'],
            'tkt' => ['required', 'numeric', 'min:1', 'max:9'],
            'provinsi' => ['required', 'string', 'max:255'],
            'nama_inventor' => ['required', 'string', 'max:255'],
            'email_inventor' => ['nullable', 'email', 'max:255'],
            'nomor_paten' => ['nullable', 'string', 'max:255'],
            'deskripsi_paten' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $validated['provinsi'] = trim(str_replace(['di yogyakarta', 'dki jakarta'], ['DI Yogyakarta', 'DKI Jakarta'], ucwords(strtolower(trim($validated['provinsi'])))));

        $produk->update($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.produk.index')->with('success', 'Data produk berhasil diperbarui');
    }

    public function destroy(Produk $produk)
    {
        $produk->delete();
        $this->clearModuleCache();
        return back()->with('success', 'Data produk berhasil dihapus');
    }

    public function bulkDestroy(Request $request)
    {
        if ($request->ids === 'all') {
            $query = Produk::query();
            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('nama_produk', 'like', '%' . $request->search . '%')
                        ->orWhere('institusi', 'like', '%' . $request->search . '%')
                        ->orWhere('bidang', 'like', '%' . $request->search . '%');
                });
            }
            if ($request->filled('filters')) {
                foreach ($request->filters as $key => $value) {
                    if ($value) {
                        $query->where($key, 'like', '%' . $value . '%');
                    }
                }
            }
            $count = $query->delete();
        } else {
            $request->validate(['ids' => 'required|array']);
            $count = Produk::whereIn('id', $request->ids)->delete();
        }

        $this->clearModuleCache();
        return back()->with('success', "{$count} data produk berhasil dihapus.");
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:produk,id',
        ]);

        $count = 0;
        foreach ($request->items as $itemData) {
            $produk = Produk::find($itemData['id']);
            if ($produk) {
                // Standarisasi nama provinsi jika terdapat di update
                if (isset($itemData['provinsi'])) {
                    $itemData['provinsi'] = trim(str_replace(['di yogyakarta', 'dki jakarta'], ['DI Yogyakarta', 'DKI Jakarta'], ucwords(strtolower(trim($itemData['provinsi'])))));
                }
                $produk->update($itemData);
                $count++;
            }
        }

        $this->clearModuleCache();
        return back()->with('success', "{$count} data produk berhasil diperbarui.");
    }



    private function clearModuleCache()
    {
        // Cache admin panel
        $v = (int) Cache::get('produk_admin_v', 1);
        Cache::put('produk_admin_v', $v + 1, 86400 * 30);
        
        $pv = (int) Cache::get('produk_cache_version', 1);
        Cache::put('produk_cache_version', $pv + 1, 86400 * 30);
        Cache::forget('produk_admin_stats');
        Cache::forget('admin_dashboard_stats');

        // Cache frontend publik — hapus agar website langsung update
        Cache::forget('filter_produk_bidang');
        Cache::forget('filter_produk_tkt');
        Cache::forget('global_provinces_final_v1');
    }

    public function exportCsv(Request $request)
    {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        $query = Produk::select(
            'id',
            'nama_produk',
            'institusi',
            'bidang',
            'tkt',
            'provinsi',
            'nama_inventor',
            'email_inventor',
            'nomor_paten',
            'deskripsi_paten',
            'latitude',
            'longitude',
            'deskripsi_produk'
        );

        if ($request->filled('ids') && $request->ids !== 'all') {
            $ids = explode(',', $request->ids);
            $query->whereIn('id', $ids);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                    ->orWhere('institusi', 'like', "%{$search}%")
                    ->orWhere('bidang', 'like', "%{$search}%");
            });
        }

        if ($filters = $request->input('filters')) {
            foreach ($filters as $key => $value) {
                if ($value && in_array($key, ['nama_produk', 'institusi', 'bidang', 'tkt', 'provinsi'])) {
                    $query->where($key, 'like', '%' . $value . '%');
                }
            }
        }

        $filterLabel = ($request->filled('search') || $request->filled('filters')) ? '_filtered' : '';
        $filename = 'data-produk' . $filterLabel . '_' . date('Y-m-d') . '.csv';

        // Kolom yang didefinisikan dalam urutan yang tepat dengan urutan `fputcsv
        $columns = [
            'ID', 
            'Nama Produk', 
            'Deskripsi Produk', 
            'Bidang', 
            'TKT', 
            'Institusi', 
            'Provinsi', 
            'Nama Inventor', 
            'Email Inventor', 
            'Nomor Paten', 
            'Deskripsi Paten', 
            'Latitude', 
            'Longitude'
        ];

        $callback = function () use ($columns, $query) {
            $file = fopen('php://output', 'w');
            
            // Tambahkan UTF-8 BOM
            fwrite($file, "\xEF\xBB\xBF");
            
            // Gunakan Titik Koma (;) untuk kompatibilitas Excel bahasa Indonesia
            fputcsv($file, $columns, ';');

            $query->orderBy('nama_produk', 'asc')->chunk(1000, function ($data) use ($file) {
                foreach ($data as $row) {
                    $clean = function($val) {
                        if ($val === null) return '';
                        return trim(str_replace(["\r", "\n", ";"], ' ', (string)$val));
                    };

                    // Format Lat/Long dengan koma untuk Excel bahasa Indonesia
                    $lat = str_replace('.', ',', (string)$row->latitude);
                    $lng = str_replace('.', ',', (string)$row->longitude);

                    fputcsv($file, [
                        $row->id,
                        $clean($row->nama_produk),
                        $clean($row->deskripsi_produk),
                        $clean($row->bidang),
                        $row->tkt,
                        $clean($row->institusi),
                        $clean($row->provinsi),
                        $clean($row->nama_inventor),
                        $clean($row->email_inventor),
                        $clean($row->nomor_paten),
                        $clean($row->deskripsi_paten),
                        $lat,
                        $lng
                    ], ';');
                }
            });
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Pragma' => 'public',
        ]);
    }

    public function exportJson(Request $request)
    {
        $query = Produk::query();

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                    ->orWhere('institusi', 'like', "%{$search}%")
                    ->orWhere('bidang', 'like', "%{$search}%");
            });
        }

        if ($filters = $request->input('filters')) {
            foreach ($filters as $key => $value) {
                if ($value)
                    $query->where($key, 'like', '%' . $value . '%');
            }
        }

        $data = $query->orderBy('nama_produk', 'asc')->limit(50000)->get();
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

            // Validasi Header Ketat
            if (!empty($request->data)) {
            }

            foreach ($request->data as $index => $row) {
                $rowNum = $index + 1;
                $normalizedRow = [];
                foreach ($row as $k => $v) {
                    $cleanKey = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', (string)$k));
                    $normalizedRow[$cleanKey] = $v;
                }

                $namaProduk = '';
                $institusi = '';
                $latRaw = '';
                $lngRaw = '';
                $provRaw = 'tidak tersedia';
                $deskProdukRaw = 'tidak tersedia';
                $tktRaw = 1;
                $bidangRaw = 'tidak tersedia';
                $inventorRaw = 'tidak tersedia';
                $emailRaw = 'tidak tersedia';
                $nomorPatenRaw = '';
                $deskripsiPatenRaw = '';

                // Pencocokan kata kunci luas untuk setiap field
                foreach ($normalizedRow as $slug => $val) {
                    // Nama Produk
                    if (str_contains($slug, 'namaproduk') || str_contains($slug, 'investasi') || str_contains($slug, 'produk')) {
                        if (empty($namaProduk)) $namaProduk = trim((string)$val);
                    }
                    // Institusi
                    if (str_contains($slug, 'institusi') || str_contains($slug, 'universitas') || str_contains($slug, 'perguruan')) {
                        if (empty($institusi)) $institusi = trim((string)$val);
                    }
                    // Koordinat
                    if (str_contains($slug, 'latitude') || $slug === 'lat') $latRaw = $val;
                    if (str_contains($slug, 'longitude') || $slug === 'lng' || $slug === 'long') $lngRaw = $val;
                    // Field lainnya
                    if (str_contains($slug, 'provinsi')) $provRaw = $val;
                    if (str_contains($slug, 'deskripsiproduk') || $slug === 'deskripsi') $deskProdukRaw = $val;
                    if (str_contains($slug, 'tkt') || str_contains($slug, 'tingkatkesiap')) $tktRaw = $val;
                    if (str_contains($slug, 'bidang')) $bidangRaw = $val;
                    if (str_contains($slug, 'namainventor') || str_contains($slug, 'inventor')) $inventorRaw = $val;
                    if (str_contains($slug, 'email')) $emailRaw = $val;
                    if (str_contains($slug, 'nomorpaten') || $slug === 'nopat') $nomorPatenRaw = $val;
                    if (str_contains($slug, 'deskripsipaten') || str_contains($slug, 'detailpaten') || str_contains($slug, 'isipaten')) $deskripsiPatenRaw = $val;
                }
                
                if (empty($namaProduk) || empty($institusi)) {
                    $keysFound = implode(', ', array_keys($normalizedRow));
                    $missing = empty($namaProduk) ? 'Nama Produk' : 'Institusi';
                    $errors[] = "Baris #{$rowNum}: Kolom '{$missing}' tidak ditemukan. Header terdeteksi: [{$keysFound}]";
                    continue;
                }
                // Parsing koordinat cerdas (menangani koma atau titik)
                $parseCoord = function($val, $default) {
                    if (empty($val)) return $default;
                    $val = str_replace(',', '.', (string)$val);
                    return (float) $val;
                };

                $data = [
                    'nama_produk' => $namaProduk,
                    'institusi' => $institusi,
                    'latitude' => $parseCoord($latRaw, -6.2),
                    'longitude' => $parseCoord($lngRaw, 106.8),
                    'provinsi' => $this->formatProvinsi($provRaw),
                    'deskripsi_produk' => trim($deskProdukRaw),
                    'tkt' => (int) $tktRaw,
                    'bidang' => trim($bidangRaw),
                    'nama_inventor' => trim($inventorRaw),
                    'email_inventor' => trim($emailRaw),
                    'nomor_paten' => $nomorPatenRaw ?: 'tidak tersedia',
                    'deskripsi_paten' => $deskripsiPatenRaw ?: 'tidak tersedia',
                ];

                $batch[] = $data;
                $imported++;

                if (count($batch) >= 100) {
                    Produk::insert($batch);
                    $batch = [];
                }
            }

            if (count($batch) > 0) Produk::insert($batch);

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



    public function getProvinces()
    {
        $provinces = Cache::remember('provinces', 86400, function () {
            // Gunakan data lokal secara langsung - lebih dapat diandalkan untuk produksi
            $path = database_path('data/provinces.json');
            if (file_exists($path)) {
                return json_decode(file_get_contents($path), true);
            }
            return [];
        });

        // Ambil hanya nama provinsi, diurutkan alfabetis
        $names = collect($provinces)
            ->pluck('name')
            ->map(fn($name) => ucwords(strtolower($name)))
            ->sort()
            ->values();

        return response()->json($names);
    }
}
