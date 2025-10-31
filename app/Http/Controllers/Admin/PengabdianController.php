<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengabdian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengabdianController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengabdian::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nama_institusi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%")
                  ->orWhere('prov_pt', 'like', "%{$search}%");
            });
        }

        $pengabdian = $query->orderByDesc('id')->paginate(20)->withQueryString();

        $stats = [
            'total' => Pengabdian::count(),
            'thisYear' => Pengabdian::whereYear('created_at', date('Y'))->count(),
            'withCoordinates' => Pengabdian::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
        ];

        return Inertia::render('Admin/Pengabdian/Index', [
            'pengabdian' => $pengabdian,
            'stats' => $stats,
            'filters' => ['search' => $request->search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Pengabdian/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_peneliti' => ['nullable', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'judul' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kota' => ['nullable', 'string', 'max:100'],
            'skema' => ['nullable', 'string', 'max:255'],
            'tahun_pelaksanaan' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 10)],
            'bidang_fokus' => ['nullable', 'string', 'max:255'],
        ]);

        Pengabdian::create($validated);

        return redirect()->route('admin.pengabdian.index')->with('success', 'Data pengabdian berhasil ditambahkan');
    }

    public function edit(Pengabdian $pengabdian)
    {
        return Inertia::render('Admin/Pengabdian/Edit', ['item' => $pengabdian]);
    }

    public function update(Request $request, Pengabdian $pengabdian)
    {
        $validated = $request->validate([
            'nama_peneliti' => ['nullable', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'judul' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kota' => ['nullable', 'string', 'max:100'],
            'skema' => ['nullable', 'string', 'max:255'],
            'tahun_pelaksanaan' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 10)],
            'bidang_fokus' => ['nullable', 'string', 'max:255'],
        ]);

        $pengabdian->update($validated);

        return redirect()->route('admin.pengabdian.index')->with('success', 'Data pengabdian berhasil diperbarui');
    }

    public function destroy(Pengabdian $pengabdian)
    {
        $pengabdian->delete();
        return back()->with('success', 'Data dihapus');
    }
}
