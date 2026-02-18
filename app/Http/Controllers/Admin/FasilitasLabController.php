<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FasilitasLab;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
                        'kontak', 'provinsi', 'kota', 'kode_universitas', 'kategori_pt'
                    ])) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        // Whitelisted sorting and pagination
        $allowedSorts = ['id', 'nama_laboratorium', 'institusi', 'provinsi', 'total_jumlah_alat'];
        $sort = in_array($request->get('sort'), $allowedSorts, true) ? $request->get('sort') : 'id';
        $direction = $request->get('direction') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) $request->get('perPage', 20);
        if ($perPage < 10) { $perPage = 10; }
        if ($perPage > 100) { $perPage = 100; }

        $fasilitasLab = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        $stats = [
            'total' => FasilitasLab::count(),
            'thisYear' => FasilitasLab::whereYear('created_at', date('Y'))->count(),
            'withCoordinates' => FasilitasLab::whereNotNull('latitude')->whereNotNull('longitude')->count(),
        ];

        return Inertia::render('Admin/FasilitasLab/Index', [
            'fasilitasLab' => $fasilitasLab,
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
        return redirect()->route('admin.fasilitas-lab.index', $request->only(['page', 'search', 'perPage', 'filters', 'sort', 'direction']))
            ->with('success', 'Data fasilitas lab berhasil diperbarui');
    }

    public function destroy(FasilitasLab $fasilitasLab)
    {
        $fasilitasLab->delete();
        return back()->with('success', 'Data dihapus');
    }
}
