<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hilirisasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HilirisasiController extends Controller
{
    public function index(Request $request)
    {
        $query = Hilirisasi::query();

        // Whitelisted sorting and pagination
        $allowedSorts = ['id', 'judul', 'nama_pengusul', 'perguruan_tinggi', 'tahun'];
        $sort = in_array($request->get('sort'), $allowedSorts, true) ? $request->get('sort') : 'id';
        $direction = $request->get('direction') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) $request->get('perPage', 20);
        if ($perPage < 10) { $perPage = 10; }
        if ($perPage > 100) { $perPage = 100; }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_pengusul', 'like', "%{$search}%")
                  ->orWhere('perguruan_tinggi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%")
                  ->orWhere('provinsi', 'like', "%{$search}%");
            });
        }

        // Select only fields used in table to shrink payload
        $query->select(['id', 'judul', 'nama_pengusul', 'perguruan_tinggi', 'tahun']);

        $hilirisasi = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        $stats = [
            'total' => Hilirisasi::count(),
            // Use the actual data year column instead of created_at
            'thisYear' => Hilirisasi::where('tahun', (int) date('Y'))->count(),
            'withCoordinates' => Hilirisasi::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
        ];

        return Inertia::render('Admin/Hilirisasi/Index', [
            'hilirisasi' => $hilirisasi,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search'),
                'sort' => $sort,
                'direction' => $direction,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Hilirisasi/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pengusul' => ['nullable', 'string', 'max:255'],
            'perguruan_tinggi' => ['required', 'string', 'max:255'],
            'judul' => ['required', 'string'],
            'pt_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'tahun' => ['nullable', 'integer'],
        ]);

        Hilirisasi::create($validated);
        return redirect()->route('admin.hilirisasi.index')->with('success', 'Data hilirisasi berhasil ditambahkan');
    }

    public function edit(Hilirisasi $hilirisasi)
    {
        return Inertia::render('Admin/Hilirisasi/Edit', ['item' => $hilirisasi]);
    }

    public function update(Request $request, Hilirisasi $hilirisasi)
    {
        $validated = $request->validate([
            'nama_pengusul' => ['nullable', 'string', 'max:255'],
            'perguruan_tinggi' => ['required', 'string', 'max:255'],
            'judul' => ['required', 'string'],
            'pt_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'tahun' => ['nullable', 'integer'],
        ]);

        $hilirisasi->update($validated);
        return redirect()->route('admin.hilirisasi.index')->with('success', 'Data hilirisasi berhasil diperbarui');
    }

    public function destroy(Hilirisasi $hilirisasi)
    {
        $hilirisasi->delete();
        return back()->with('success', 'Data dihapus');
    }
}
