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

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_laboratorium', 'like', "%{$search}%")
                  ->orWhere('institusi', 'like', "%{$search}%");
            });
        }

        $fasilitasLab = $query->orderByDesc('id')->paginate(20)->withQueryString();

        $stats = [
            'total' => FasilitasLab::count(),
            'thisYear' => FasilitasLab::whereYear('created_at', date('Y'))->count(),
            'withCoordinates' => FasilitasLab::whereNotNull('latitude')->whereNotNull('longitude')->count(),
        ];

        return Inertia::render('Admin/FasilitasLab/Index', [
            'fasilitasLab' => $fasilitasLab,
            'stats' => $stats,
            'filters' => ['search' => $request->search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/FasilitasLab/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_laboratorium' => ['required', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'deskripsi_alat' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        FasilitasLab::create($validated);
        return redirect()->route('admin.fasilitas-lab.index')->with('success', 'Data fasilitas lab berhasil ditambahkan');
    }

    public function edit(FasilitasLab $fasilitasLab)
    {
        return Inertia::render('Admin/FasilitasLab/Edit', ['item' => $fasilitasLab]);
    }

    public function update(Request $request, FasilitasLab $fasilitasLab)
    {
        $validated = $request->validate([
            'nama_laboratorium' => ['required', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'deskripsi_alat' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $fasilitasLab->update($validated);
        return redirect()->route('admin.fasilitas-lab.index')->with('success', 'Data fasilitas lab berhasil diperbarui');
    }

    public function destroy(FasilitasLab $fasilitasLab)
    {
        $fasilitasLab->delete();
        return back()->with('success', 'Data dihapus');
    }
}
