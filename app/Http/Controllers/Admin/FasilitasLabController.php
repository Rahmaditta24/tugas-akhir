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

        // Global search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_laboratorium', 'like', "%{$search}%")
                  ->orWhere('institusi', 'like', "%{$search}%")
                  ->orWhere('provinsi', 'like', "%{$search}%")
                  ->orWhere('kota', 'like', "%{$search}%")
                  ->orWhere('nama_alat', 'like', "%{$search}%")
                  ->orWhere('kontak', 'like', "%{$search}%");
            });
        }

        // Column filters
        if ($request->filled('filters')) {
            $columnFilters = $request->filters;
            foreach ($columnFilters as $key => $value) {
                if (!empty($value)) {
                    if (in_array($key, [
                        'nama_laboratorium', 'institusi', 'total_jumlah_alat', 
                        'kontak', 'provinsi', 'kota', 'kode_universitas', 'kategori_pt', 'nama_alat'
                    ])) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        // Whitelisted sorting and pagination
        $allowedSorts = ['id', 'nama_laboratorium', 'institusi', 'provinsi', 'total_jumlah_alat'];
        $sort = in_array($request->get('sort'), $allowedSorts, true) ? $request->get('sort') : 'nama_laboratorium';
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc';
        $perPage = (int) $request->get('perPage', 20);
        if ($perPage < 10) { $perPage = 10; }
        if ($perPage > 100) { $perPage = 100; }

        // Cache Versioning
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
                'search' => $request->get('search'),
                'columns' => $request->get('filters') ?? [],
                'sort' => $sort,
                'direction' => $direction,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/FasilitasLab/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_universitas' => ['nullable', 'string', 'max:50'],
            'institusi' => ['required', 'string', 'max:255'],
            'kategori_pt' => ['nullable', 'string', 'max:50'],
            'nama_laboratorium' => ['required', 'string', 'max:255'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kota' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'total_jumlah_alat' => ['nullable', 'numeric'],
            'nama_alat' => ['nullable', 'string'],
            'deskripsi_alat' => ['nullable', 'string'],
            'kontak' => ['nullable', 'string', 'max:50'],
        ]);

        FasilitasLab::create($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.fasilitas-lab.index')->with('success', 'Data fasilitas lab berhasil ditambahkan');
    }

    public function edit(Request $request, FasilitasLab $fasilitasLab)
    {
        return Inertia::render('Admin/FasilitasLab/Edit', [
            'item' => $fasilitasLab,
            'filters' => $request->only(['page', 'search', 'perPage', 'filters', 'sort', 'direction'])
        ]);
    }

    public function update(Request $request, FasilitasLab $fasilitasLab)
    {
        $validated = $request->validate([
            'kode_universitas' => ['nullable', 'string', 'max:50'],
            'institusi' => ['required', 'string', 'max:255'],
            'kategori_pt' => ['nullable', 'string', 'max:50'],
            'nama_laboratorium' => ['required', 'string', 'max:255'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kota' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'total_jumlah_alat' => ['nullable', 'numeric'],
            'nama_alat' => ['nullable', 'string'],
            'deskripsi_alat' => ['nullable', 'string'],
            'kontak' => ['nullable', 'string', 'max:50'],
        ]);

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
            'id', 'nama_laboratorium', 'institusi', 'kode_universitas', 'kategori_pt',
            'provinsi', 'kota', 'total_jumlah_alat', 'nama_alat', 'kontak',
            'latitude', 'longitude', 'deskripsi_alat'
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

        if ($filters = $request->get('filters')) {
            foreach ($filters as $key => $value) {
                if ($value && in_array($key, ['nama_laboratorium','institusi','provinsi','kota','kategori_pt','nama_alat'])) {
                    $query->where($key, 'like', '%' . $value . '%');
                }
            }
        }

        $filterLabel = ($request->filled('search') || $request->filled('filters')) ? '_filtered' : '';
        $filename = 'data-fasilitas-lab' . $filterLabel . '_' . date('Y-m-d') . '.csv';

        $columns = ['ID', 'Nama Laboratorium', 'Institusi', 'Kode Universitas', 'Kategori PT', 'Provinsi', 'Kota', 'Total Jumlah Alat', 'Nama Alat', 'Kontak', 'Latitude', 'Longitude', 'Deskripsi Alat'];

        $callback = function() use ($columns, $query) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            $query->orderBy('nama_laboratorium', 'asc')->chunk(1000, function($data) use($file) {
                foreach ($data as $row) {
                    fputcsv($file, [
                        $row->id, $row->nama_laboratorium, $row->institusi,
                        $row->kode_universitas, $row->kategori_pt, $row->provinsi,
                        $row->kota, $row->total_jumlah_alat, $row->nama_alat,
                        $row->kontak, $row->latitude, $row->longitude, $row->deskripsi_alat
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

        if ($filters = $request->get('filters')) {
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
            
            // Normalize keys
            $normalizedRow = [];
            foreach ($row as $k => $v) {
                $cleanKey = strtolower(str_replace([' ', '/', '_'], '', $k));
                $normalizedRow[$cleanKey] = $v;
            }

            // Map data with aliases
            $id = $normalizedRow['id'] ?? null;
            $namaLab = trim($normalizedRow['namalaboratorium'] ?? $normalizedRow['laboratorium'] ?? '');
            $institusi = trim($normalizedRow['institusi'] ?? $normalizedRow['namainstitusi'] ?? '');
            
            // Strict Validation
            if (empty($namaLab)) { $errors[] = "Baris #{$rowNum}: Kolom 'Nama Laboratorium' wajib diisi."; continue; }
            if (empty($institusi)) { $errors[] = "Baris #{$rowNum}: Kolom 'Institusi' wajib diisi."; continue; }

            $data = [
                'nama_laboratorium' => $namaLab,
                'institusi' => $institusi,
                'kode_universitas' => $normalizedRow['kodeuniversitas'] ?? $normalizedRow['kodept'] ?? null,
                'kategori_pt' => $normalizedRow['kategoript'] ?? '-',
                'provinsi' => $normalizedRow['provinsi'] ?? '-',
                'kota' => $normalizedRow['kota'] ?? '-',
                'total_jumlah_alat' => (int)($normalizedRow['totaljumlahalat'] ?? $normalizedRow['jumlahalat'] ?? 0),
                'nama_alat' => $normalizedRow['namaalat'] ?? null,
                'kontak' => $normalizedRow['kontak'] ?? null,
                'latitude' => $normalizedRow['latitude'] ?? -6.2,
                'longitude' => $normalizedRow['longitude'] ?? 106.8,
                'deskripsi_alat' => $normalizedRow['deskripsialat'] ?? $normalizedRow['deskripsi'] ?? null,
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
        $v = (int) Cache::get('fasilitas_lab_admin_v', 1);
        Cache::put('fasilitas_lab_admin_v', $v + 1, 86400 * 30);
        Cache::forget('fasilitas_lab_admin_stats');
        Cache::forget('admin_dashboard_stats');
    }
}
