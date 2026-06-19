<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FasilitasLab;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class FasilitasLabController extends Controller
{
    public function index(Request $request)
    {
        $query = FasilitasLab::query();

        // Pencarian global
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_laboratorium', 'like', "%{$search}%")
                  ->orWhere('institusi', 'like', "%{$search}%")
                  ->orWhere('provinsi', 'like', "%{$search}%")
                  ->orWhere('nama_alat', 'like', "%{$search}%")
                  ->orWhere('kontak', 'like', "%{$search}%");
            });
        }

        // Filter kolom
        if ($request->filled('filters')) {
            $columnFilters = $request->filters;
            foreach ($columnFilters as $key => $value) {
                if (!empty($value)) {
                    if (in_array($key, [
                        'nama_laboratorium', 'institusi', 'total_jumlah_alat', 
                        'kontak', 'provinsi', 'kode_universitas', 'nama_alat'
                    ])) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        // Pengurutan dan paginasi
        $allowedSorts = ['id', 'nama_laboratorium', 'institusi', 'provinsi', 'total_jumlah_alat'];
        $sort = in_array($request->input('sort'), $allowedSorts, true) ? $request->input('sort') : 'id';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) $request->input('perPage', 20);
        if ($perPage < 10) { $perPage = 10; }
        if ($perPage > 100) { $perPage = 100; }

        // Versi Cache
        $v = Cache::get('fasilitas_lab_admin_v', 1);
        $cacheKey = 'fasilitas_lab_admin_v' . $v . '_' . md5(json_encode($request->all()));

        $data = Cache::remember($cacheKey, 600, function() use ($query, $perPage, $sort, $direction) {
            return $query
                ->orderBy($sort, $direction)
                ->paginate($perPage)
                ->withQueryString();
        });

        $stats = Cache::remember('fasilitas_lab_admin_stats', 3600, function() {
            return [
                'total' => FasilitasLab::count(),
                'thisYear' => FasilitasLab::whereYear('created_at', date('Y'))->count(),
                'withCoordinates' => FasilitasLab::whereNotNull('latitude')->whereNotNull('longitude')->count(),
            ];
        });

        return Inertia::render('Admin/FasilitasLab/Index', [
            'fasilitasLab' => $data,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search'),
                'columns' => $request->input('filters') ?? [],
                'sort' => $sort,
                'direction' => $direction,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/FasilitasLab/Routes/Create/Index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_universitas' => ['nullable', 'string', 'max:50'],
            'institusi' => ['required', 'string', 'max:255'],
            'kategori_pt' => ['nullable', 'string', 'max:100'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kota' => ['nullable', 'string', 'max:100'],
            'nama_laboratorium' => ['required', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'total_jumlah_alat' => ['nullable', 'numeric'],
            'nama_alat' => ['nullable', 'string'],
            'deskripsi_alat' => ['nullable', 'string'],
            'kontak' => ['nullable', 'string', 'max:50'],
        ]);

        $validated['nama_alat'] = $this->formatNumbered($validated['nama_alat'] ?? null);
        $validated['deskripsi_alat'] = $this->formatNumbered($validated['deskripsi_alat'] ?? null);

        FasilitasLab::create($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.fasilitas-lab.index')->with('success', 'Data fasilitas lab berhasil ditambahkan');
    }

    public function edit(Request $request, FasilitasLab $fasilitasLab)
    {
        return Inertia::render('Admin/FasilitasLab/Routes/Edit/Index', [
            'item' => $fasilitasLab,
            'filters' => $request->only(['page', 'search', 'perPage', 'filters', 'sort', 'direction'])
        ]);
    }

    private function formatNumbered($text) {
        if (empty($text) || strtolower($text) === 'null') return null;
        $items = preg_split('/[\r\n;\|]+/', $text);
        
        $cleaned = [];
        foreach ($items as $item) {
            $item = preg_replace('/^\d+[\.\)]\s*/', '', trim($item));
            if ($item !== '') {
                $cleaned[] = $item;
            }
        }
        
        if (count($cleaned) === 0) return null;
        
        $numbered = [];
        foreach ($cleaned as $i => $item) {
            $numbered[] = ($i + 1) . ". " . $item;
        }
        
        return implode("\n", $numbered);
    }

    public function update(Request $request, FasilitasLab $fasilitasLab)
    {
        $validated = $request->validate([
            'kode_universitas' => ['nullable', 'string', 'max:50'],
            'institusi' => ['required', 'string', 'max:255'],
            'kategori_pt' => ['nullable', 'string', 'max:100'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kota' => ['nullable', 'string', 'max:100'],
            'nama_laboratorium' => ['required', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'total_jumlah_alat' => ['nullable', 'numeric'],
            'nama_alat' => ['nullable', 'string'],
            'deskripsi_alat' => ['nullable', 'string'],
            'kontak' => ['nullable', 'string', 'max:50'],
        ]);

        $validated['nama_alat'] = $this->formatNumbered($validated['nama_alat'] ?? null);
        $validated['deskripsi_alat'] = $this->formatNumbered($validated['deskripsi_alat'] ?? null);

        $fasilitasLab->update($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.fasilitas-lab.index', $request->only(['page', 'search', 'perPage', 'filters', 'sort', 'direction']))
            ->with('success', 'Data fasilitas lab berhasil diperbarui');
    }

    public function destroy(FasilitasLab $fasilitasLab)
    {
        $fasilitasLab->delete();
        $this->clearModuleCache();
        return back()->with('success', 'Data dihapus');
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:fasilitas_lab,id'
        ]);

        $count = 0;
        foreach ($request->items as $itemData) {
            $fasilitasLab = FasilitasLab::find($itemData['id']);
            if ($fasilitasLab) {
                // Standarisasi provinsi
                if (isset($itemData['provinsi'])) {
                    $val = trim($itemData['provinsi']);
                    $val = str_replace(['di yogyakarta', 'dki jakarta'], ['DI Yogyakarta', 'DKI Jakarta'], ucwords(strtolower($val)));
                    $itemData['provinsi'] = $val;
                }
                if (isset($itemData['nama_alat'])) {
                    $itemData['nama_alat'] = $this->formatNumbered($itemData['nama_alat']);
                }
                if (isset($itemData['deskripsi_alat'])) {
                    $itemData['deskripsi_alat'] = $this->formatNumbered($itemData['deskripsi_alat']);
                }
                $fasilitasLab->update($itemData);
                $count++;
            }
        }

        $this->clearModuleCache();
        return back()->with('success', "{$count} data fasilitas lab berhasil diperbarui.");
    }

    public function getProvinces()
    {
        $provinces = Cache::remember('fasilitas_lab_provinces', 86400, function () {
            $path = database_path('data/provinces.json');
            if (file_exists($path)) {
                $data = json_decode(file_get_contents($path), true);
                return array_column($data, 'name');
            }
            return [];
        });

        return response()->json($provinces);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:fasilitas_lab,id',
        ]);

        $count = FasilitasLab::whereIn('id', $request->ids)->delete();
        $this->clearModuleCache();
        return back()->with('success', "{$count} data fasilitas lab berhasil dihapus.");
    }

    public function exportCsv(Request $request)
    {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        $query = FasilitasLab::select(
            'id', 'kode_universitas', 'institusi', 'kategori_pt', 'provinsi', 'kota',
            'nama_laboratorium', 'latitude', 'longitude', 'total_jumlah_alat', 'nama_alat', 'deskripsi_alat', 'kontak'
        );

        if ($request->filled('ids')) {
            $ids = explode(',', $request->ids);
            $query->whereIn('id', $ids);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_laboratorium', 'like', "%{$search}%")
                  ->orWhere('institusi', 'like', "%{$search}%")
                  ->orWhere('nama_alat', 'like', "%{$search}%");
            });
        }

        if ($filters = $request->input('filters')) {
            foreach ($filters as $key => $value) {
                if ($value && in_array($key, ['nama_laboratorium','institusi','provinsi','nama_alat'])) {
                    $query->where($key, 'like', '%' . $value . '%');
                }
            }
        }

        $filterLabel = ($request->filled('search') || $request->filled('filters')) ? '_filtered' : '';
        $filename = 'data-fasilitas-lab' . $filterLabel . '_' . date('Y-m-d') . '.csv';

        $columns = ['ID', 'Kode Universitas', 'Institusi', 'Kategori PT', 'Provinsi', 'Kota/Kabupaten', 'Nama Laboratorium', 'Latitude', 'Longitude', 'Total Jumlah Alat', 'Nama Alat', 'Deskripsi Alat', 'Kontak'];

        $callback = function() use ($columns, $query) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            $query->orderBy('nama_laboratorium', 'asc')->chunk(1000, function($data) use($file) {
                foreach ($data as $row) {
                    $clean = function($val) {
                        if ($val === null) return '';
                        return str_replace(["\r", "\n"], ' ', (string)$val);
                    };

                    fputcsv($file, [
                        $row->id, 
                        $clean($row->kode_universitas), 
                        $clean($row->institusi),
                        $clean($row->kategori_pt),
                        $clean($row->provinsi),
                        $clean($row->kota),
                        $clean($row->nama_laboratorium), 
                        $row->latitude, 
                        $row->longitude, 
                        $row->total_jumlah_alat, 
                        $clean($row->nama_alat),
                        $clean($row->deskripsi_alat),
                        $clean($row->kontak)
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
        $query = FasilitasLab::query();

        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_laboratorium', 'like', "%{$search}%")
                  ->orWhere('institusi', 'like', "%{$search}%")
                  ->orWhere('nama_alat', 'like', "%{$search}%");
            });
        }

        if ($filters = $request->input('filters')) {
             foreach ($filters as $key => $value) {
                 if ($value) $query->where($key, 'like', '%' . $value . '%');
             }
        }

        $data = $query->orderBy('nama_laboratorium', 'asc')->limit(50000)->get();
        return response()->json($data);
    }

    public function importExcel(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
            'data.*' => 'array',
        ]);

        $imported = 0;
        $updated = 0;
        $errors = [];
        $batch = [];

        foreach ($request->data as $index => $row) {
            $rowNum = $index + 1;
            
            // Normalisasi 
            $normalizedRow = [];
            foreach ($row as $k => $v) {
                $cleanKey = strtolower(str_replace([' ', '/', '_'], '', $k));
                $normalizedRow[$cleanKey] = $v;
            }

            // Pemetaan data dengan alias
            $id = $normalizedRow['id'] ?? null;
            $namaLab = trim($normalizedRow['namalaboratorium'] ?? $normalizedRow['laboratorium'] ?? '');
            $institusi = trim($normalizedRow['institusi'] ?? $normalizedRow['namainstitusi'] ?? '');
            
            // Validasi baris kolom
            if (empty($namaLab)) { $errors[] = "Baris #{$rowNum}: Kolom 'Nama Laboratorium' wajib diisi."; continue; }
            if (empty($institusi)) { $errors[] = "Baris #{$rowNum}: Kolom 'Institusi' wajib diisi."; continue; }

            $data = [
                'kode_universitas' => $normalizedRow['kodeuniversitas'] ?? $normalizedRow['kodept'] ?? null,
                'institusi' => $institusi,
                'kategori_pt' => $normalizedRow['kategoript'] ?? $normalizedRow['jenispt'] ?? null,
                'provinsi' => trim(str_replace(['di yogyakarta', 'dki jakarta'], ['DI Yogyakarta', 'DKI Jakarta'], ucwords(strtolower(trim($normalizedRow['provinsi'] ?? 'tidak tersedia'))))),
                'kota' => $normalizedRow['kota'] ?? $normalizedRow['kabupaten'] ?? null,
                'nama_laboratorium' => $namaLab,
                'latitude' => (float)($normalizedRow['latitude'] ?? -6.2),
                'longitude' => (float)($normalizedRow['longitude'] ?? 106.8),
                'total_jumlah_alat' => (int)($normalizedRow['totaljumlahalat'] ?? $normalizedRow['jumlahalat'] ?? 0),
                'nama_alat' => $normalizedRow['namaalat'] ?? null,
                'deskripsi_alat' => $normalizedRow['deskripsialat'] ?? $normalizedRow['deskripsi'] ?? null,
                'kontak' => $normalizedRow['kontak'] ?? null,
            ];

            if ($id && FasilitasLab::find($id)) {
                FasilitasLab::where('id', $id)->update($data);
                $updated++;
            } else {
                $batch[] = $data;
                $imported++;
            }

            if (count($batch) >= 100) {
                FasilitasLab::insert($batch);
                $batch = [];
            }
        }

        if (count($batch) > 0) {
            FasilitasLab::insert($batch);
        }

        $this->clearModuleCache();

        $message = "Import selesai: {$imported} baru, {$updated} diperbarui.";
        if (count($errors) > 0) {
            $errorDetail = implode('; ', array_slice($errors, 0, 2));
            return back()->with('error', $message . " (" . count($errors) . " baris gagal: " . $errorDetail . "...)");
        }

        return back()->with('success', $message);
    }
    private function clearModuleCache()
    {
        // Cache admin panel
        $v = (int) Cache::get('fasilitas_lab_admin_v', 1);
        Cache::put('fasilitas_lab_admin_v', $v + 1, 86400 * 30);
        Cache::forget('fasilitas_lab_admin_stats');
        Cache::forget('admin_dashboard_stats');

        // Cache frontend publik
        $fv = (int) Cache::get('fasilitas_lab_cache_version', 1);
        Cache::put('fasilitas_lab_cache_version', $fv + 1, 86400 * 30);
        
        Cache::forget('filter_fasilitas_kampus');
    }
}
