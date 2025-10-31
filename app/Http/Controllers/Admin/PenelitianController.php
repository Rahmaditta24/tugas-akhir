<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Penelitian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenelitianController extends Controller
{
    public function index(Request $request)
    {
        $query = Penelitian::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('institusi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%")
                  ->orWhere('provinsi', 'like', "%{$search}%");
            });
        }

        $penelitian = $query->orderByDesc('id')->paginate(20)->withQueryString();

        // Statistics
        $stats = [
            'total' => Penelitian::count(),
            'thisYear' => Penelitian::whereYear('created_at', date('Y'))->count(),
            'withCoordinates' => Penelitian::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
        ];

        return Inertia::render('Admin/Penelitian/Index', [
            'penelitian' => $penelitian,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Penelitian/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['nullable', 'string', 'max:255'],
            'nidn' => ['nullable', 'string', 'max:50'],
            'nuptk' => ['nullable', 'string', 'max:50'],
            'institusi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'kode_pt' => ['nullable', 'string', 'max:50'],
            'jenis_pt' => ['nullable', 'string', 'max:100'],
            'kategori_pt' => ['nullable', 'string', 'max:100'],
            'institusi_pilihan' => ['nullable', 'string', 'max:255'],
            'klaster' => ['nullable', 'string', 'max:255'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kota' => ['nullable', 'string', 'max:100'],
            'judul' => ['required', 'string'],
            'skema' => ['nullable', 'string', 'max:255'],
            'thn_pelaksanaan' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 10)],
            'bidang_fokus' => ['nullable', 'string', 'max:255'],
            'tema_prioritas' => ['nullable', 'string', 'max:255'],
        ]);

        Penelitian::create($validated);

        return redirect()->route('admin.penelitian.index')->with('success', 'Data penelitian berhasil ditambahkan');
    }

    public function edit(Penelitian $penelitian)
    {
        return Inertia::render('Admin/Penelitian/Edit', [
            'item' => $penelitian,
        ]);
    }

    public function update(Request $request, Penelitian $penelitian)
    {
        $validated = $request->validate([
            'nama' => ['nullable', 'string', 'max:255'],
            'nidn' => ['nullable', 'string', 'max:50'],
            'nuptk' => ['nullable', 'string', 'max:50'],
            'institusi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'kode_pt' => ['nullable', 'string', 'max:50'],
            'jenis_pt' => ['nullable', 'string', 'max:100'],
            'kategori_pt' => ['nullable', 'string', 'max:100'],
            'institusi_pilihan' => ['nullable', 'string', 'max:255'],
            'klaster' => ['nullable', 'string', 'max:255'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kota' => ['nullable', 'string', 'max:100'],
            'judul' => ['required', 'string'],
            'skema' => ['nullable', 'string', 'max:255'],
            'thn_pelaksanaan' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 10)],
            'bidang_fokus' => ['nullable', 'string', 'max:255'],
            'tema_prioritas' => ['nullable', 'string', 'max:255'],
        ]);

        $penelitian->update($validated);

        return redirect()->route('admin.penelitian.index')->with('success', 'Data penelitian berhasil diperbarui');
    }

    public function destroy(Penelitian $penelitian)
    {
        $penelitian->delete();
        return back()->with('success', 'Data dihapus');
    }
}


