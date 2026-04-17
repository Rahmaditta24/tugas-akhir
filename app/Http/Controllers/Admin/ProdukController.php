<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Cache;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $query = Produk::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                    ->orWhere('institusi', 'like', "%{$search}%")
                    ->orWhere('nomor_paten', 'like', "%{$search}%")
                    ->orWhere('bidang', 'like', "%{$search}%");
            });
        }

        // Handle column filters
        $filters = $request->input('filters', []);
        if (is_array($filters)) {
            foreach ($filters as $column => $value) {
                if (!empty($value) && in_array($column, ['nama_produk', 'institusi', 'bidang', 'tkt', 'provinsi', 'nomor_paten'])) {
                    $query->where($column, 'like', "%{$value}%");
                }
            }
        }

        $perPage = $request->input('perPage', 20);

        // Whitelisted sorting
        $allowedSorts = ['id', 'nama_produk', 'institusi', 'bidang', 'tkt', 'provinsi', 'nomor_paten'];
        $sort = in_array($request->get('sort'), $allowedSorts, true) ? $request->get('sort') : 'nama_produk';
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc'; // default asc for names

        // Cache Versioning
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
                if (isset($item->nomor_paten)) {
                    // Hanya ambil bagian kode/nomor saja
                    $item->nomor_paten = trim(preg_split("/[;.\(\,]/", $item->nomor_paten)[0]);
                }
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
        return Inertia::render('Admin/Produk/Create');
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
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        Produk::create($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.produk.index')->with('success', 'Data produk berhasil ditambahkan');
    }

    public function edit(Produk $produk)
    {
        return Inertia::render('Admin/Produk/Edit', ['item' => $produk]);
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
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

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
        $request->validate(['ids' => 'required|array']);
        $count = Produk::whereIn('id', $request->ids)->delete();
        $this->clearModuleCache();
        return back()->with('success', "{$count} data produk berhasil dihapus.");
    }

    private function formatName($name)
    {
        if (empty($name))
            return $name;
        $name = trim($name);
        if ($name !== mb_strtoupper($name) && $name !== mb_strtolower($name)) {
            return $name;
        }
        $formatted = mb_convert_case($name, MB_CASE_TITLE, "UTF-8");
        $replacements = [
            'S.pd' => 'S.Pd',
            'M.pd' => 'M.Pd',
            'S.t' => 'S.T',
            'M.t' => 'M.T',
            'S.h' => 'S.H',
            'M.h' => 'M.H',
            'S.e' => 'S.E',
            'M.m' => 'M.M',
            'S.si' => 'S.Si',
            'M.si' => 'M.Si',
            'S.sos' => 'S.Sos',
            'M.sos' => 'M.Sos',
            'S.kom' => 'S.Kom',
            'M.kom' => 'M.Kom',
            'S.p' => 'S.P',
            'M.p' => 'M.P',
            'S.pt' => 'S.Pt',
            'M.pt' => 'M.Pt',
            'S.hut' => 'S.Hut',
            'M.hut' => 'M.Hut',
            'S.km' => 'S.KM',
            'M.kes' => 'M.Kes',
            'S.kep' => 'S.Kep',
            'M.kep' => 'M.Kep',
            'Ph.d' => 'Ph.D',
            'M.hum' => 'M.Hum',
            'S.hum' => 'S.Hum',
            'M.ag' => 'M.Ag',
            'S.ag' => 'S.Ag',
            'M.fil' => 'M.Fil',
            'S.fil' => 'S.Fil',
            'M.ak' => 'M.Ak',
            'S.ak' => 'S.Ak',
            'M.psi' => 'M.Psi',
            'S.psi' => 'S.Psi',
            'M.ti' => 'M.TI',
            'S.ti' => 'S.TI',
            'M.eng' => 'M.Eng',
            'S.eng' => 'S.Eng',
            'M.sc' => 'M.Sc',
            'B.sc' => 'B.Sc',
            'Msi' => 'MSi',
            'Spd' => 'SPd',
        ];
        foreach ($replacements as $search => $replace) {
            $formatted = preg_replace('/\b' . preg_quote($search) . '\b/u', $replace, $formatted);
            $formatted = str_replace($search, $replace, $formatted);
        }
        return $formatted;
    }

    private function clearModuleCache()
    {
        $v = (int) Cache::get('produk_admin_v', 1);
        Cache::put('produk_admin_v', $v + 1, 86400 * 30);
        Cache::forget('produk_admin_stats');
        Cache::forget('admin_dashboard_stats');
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
            'latitude',
            'longitude',
            'deskripsi_produk'
        );

        if ($request->filled('ids')) {
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

        if ($filters = $request->get('filters')) {
            foreach ($filters as $key => $value) {
                if ($value && in_array($key, ['nama_produk', 'institusi', 'bidang', 'tkt', 'provinsi'])) {
                    $query->where($key, 'like', '%' . $value . '%');
                }
            }
        }

        $filterLabel = ($request->filled('search') || $request->filled('filters')) ? '_filtered' : '';
        $filename = 'data-produk' . $filterLabel . '_' . date('Y-m-d') . '.csv';

        $columns = ['ID', 'Nama Produk', 'Institusi', 'Bidang', 'TKT', 'Provinsi', 'Nama Inventor', 'Email Inventor', 'Nomor Paten', 'Latitude', 'Longitude', 'Deskripsi'];

        $callback = function () use ($columns, $query) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            $query->orderBy('nama_produk', 'asc')->chunk(1000, function ($data) use ($file) {
                foreach ($data as $row) {
                    // Clean Nomor Paten to show only the number
                    $nomor_paten = trim(preg_split("/[;.\(\,\s]/", $row->nomor_paten ?? '')[0]);

                    // Clean newlines from description and patent number to prevent breaking CSV rows
                    $nomor_paten = preg_replace("/\r|\n/", " ", $nomor_paten);
                    $deskripsi = preg_replace("/\r|\n/", " ", $row->deskripsi_produk ?? '');

                    fputcsv($file, [
                        $row->id,
                        $row->nama_produk,
                        $row->institusi,
                        $row->bidang,
                        $row->tkt,
                        $row->provinsi,
                        $row->nama_inventor,
                        $row->email_inventor,
                        $nomor_paten,
                        $row->latitude,
                        $row->longitude,
                        $deskripsi
                    ]);
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

        if ($filters = $request->get('filters')) {
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

            // Strict Header Validation
            if (!empty($request->data)) {
                $firstRow = $request->data[0];
                $foundKeys = array_map(function($k) {
                    return strtolower(str_replace([' ', '/', '_'], '', $k));
                }, array_keys($firstRow));

                $required = ['namaproduk', 'institusi'];
                $missing = [];
                foreach ($required as $req) {
                     if (!in_array($req, $foundKeys)) {
                         // Check aliases
                         $aliases = [
                             'namaproduk' => ['nama', 'produk'],
                             'institusi' => ['namainstitusi', 'perguruantinggi'],
                         ];
                         $foundAlias = false;
                         if (isset($aliases[$req])) {
                             foreach ($aliases[$req] as $alt) { if (in_array($alt, $foundKeys)) { $foundAlias = true; break; } }
                         }
                         if (!$foundAlias) $missing[] = $req;
                     }
                }
                if (!empty($missing)) {
                    return back()->with('error', 'Format file tidak sesuai! Kolom wajib tidak ditemukan: ' . implode(', ', $missing));
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
                $namaProduk = trim($normalizedRow['namaproduk'] ?? $normalizedRow['namaproduksiapinvestasi'] ?? '');
                $institusi = trim($normalizedRow['institusi'] ?? $normalizedRow['namainstitusi'] ?? $normalizedRow['perguruan_tinggi'] ?? '');
                
                if (empty($namaProduk)) { $errors[] = "Baris #{$rowNum}: Kolom 'Nama Produk' wajib diisi."; continue; }
                if (empty($institusi)) { $errors[] = "Baris #{$rowNum}: Kolom 'Institusi' wajib diisi."; continue; }

                $data = [
                    'nama_produk' => $namaProduk,
                    'institusi' => $institusi,
                    'bidang' => trim($normalizedRow['bidang'] ?? '-'),
                    'tkt' => (int) ($normalizedRow['tkt'] ?? $normalizedRow['tingkatkesiapterapanteknologitkt'] ?? 1),
                    'provinsi' => $normalizedRow['provinsi'] ?? '-',
                    'nama_inventor' => $normalizedRow['namainventor'] ?? $normalizedRow['inventor'] ?? $normalizedRow['namainventortanpagelar'] ?? '-',
                    'email_inventor' => $normalizedRow['emailinventor'] ?? $normalizedRow['email'] ?? null,
                    'nomor_paten' => $normalizedRow['nomorpaten'] ?? $normalizedRow['nopaten'] ?? $normalizedRow['nomordandeskripsipaten'] ?? null,
                    'latitude' => $normalizedRow['latitude'] ?? -6.2,
                    'longitude' => $normalizedRow['longitude'] ?? 106.8,
                    'deskripsi_produk' => $normalizedRow['deskripsiproduk'] ?? $normalizedRow['deskripsi'] ?? '-',
                ];

                if ($id && Produk::find($id)) {
                    Produk::where('id', $id)->update($data);
                    $updated++;
                } else {
                    $batch[] = $data;
                    $imported++;
                }

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
        // Daftar provinsi dari script-produk.js yang valid untuk data produk
        $provinces = [
            'Aceh',
            'Sumatera Utara',
            'Sumatera Barat',
            'Riau',
            'Kepulauan Riau',
            'Jambi',
            'Sumatera Selatan',
            'Bengkulu',
            'Lampung',
            'Kepulauan Bangka Belitung',
            'Banten',
            'DKI Jakarta',
            'Jawa Barat',
            'Jawa Tengah',
            'DI Yogyakarta',
            'Jawa Timur',
            'Bali',
            'Nusa Tenggara Barat',
            'Nusa Tenggara Timur',
            'Kalimantan Barat',
            'Kalimantan Tengah',
            'Kalimantan Selatan',
            'Kalimantan Timur',
            'Kalimantan Utara',
            'Sulawesi Utara',
            'Gorontalo',
            'Sulawesi Tengah',
            'Sulawesi Barat',
            'Sulawesi Selatan',
            'Maluku',
            'Maluku Utara',
            'Papua',
            'Papua Barat',
            'Papua Barat Daya',
            'Papua Selatan',
            'Papua Tengah',
            'Papua Pegunungan'
        ];

        return response()->json($provinces);
    }

}