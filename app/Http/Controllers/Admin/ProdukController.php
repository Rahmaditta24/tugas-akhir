<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $query = Produk::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_produk', 'like', "%{$search}%")
                  ->orWhere('institusi', 'like', "%{$search}%");
            });
        }

        $produk = $query->orderByDesc('id')->paginate(20)->withQueryString();

        $stats = [
            'total' => Produk::count(),
            'thisYear' => Produk::whereYear('created_at', date('Y'))->count(),
            'withCoordinates' => Produk::whereNotNull('latitude')->whereNotNull('longitude')->count(),
        ];

        return Inertia::render('Admin/Produk/Index', [
            'produk' => $produk,
            'stats' => $stats,
            'filters' => ['search' => $request->search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Produk/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_produk' => ['required', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        Produk::create($validated);
        return redirect()->route('admin.produk.index')->with('success', 'Data produk berhasil ditambahkan');
    }

    public function edit(Produk $produk)
    {
        return Inertia::render('Admin/Produk/Edit', ['item' => $produk]);
    }

    public function update(Request $request, Produk $produk)
    {
        $validated = $request->validate([
            'nama_produk' => ['required', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $produk->update($validated);
        return redirect()->route('admin.produk.index')->with('success', 'Data produk berhasil diperbarui');
    }

    public function destroy(Produk $produk)
    {
        $produk->delete();
        return back()->with('success', 'Data dihapus');
    }
}
