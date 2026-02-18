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
                  ->orWhere('institusi', 'like', "%{$search}%")
                  ->orWhere('bidang', 'like', "%{$search}%");
            });
        }

        // Handle column filters
        $filters = $request->input('filters', []);
        if (is_array($filters)) {
            foreach ($filters as $column => $value) {
                if (!empty($value) && in_array($column, ['nama_produk', 'institusi', 'bidang', 'tkt', 'provinsi'])) {
                    $query->where($column, 'like', "%{$value}%");
                }
            }
        }

        $perPage = $request->input('perPage', 20);
        $produk = $query->orderByDesc('id')->paginate($perPage)->withQueryString();

        $stats = [
            'total' => Produk::count(),
            'thisYear' => Produk::whereYear('created_at', date('Y'))->count(),
            'withCoordinates' => Produk::whereNotNull('latitude')->whereNotNull('longitude')->count(),
        ];

        return Inertia::render('Admin/Produk/Index', [
            'produk' => $produk,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
                'columns' => $filters,
            ],
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
        return redirect()->route('admin.produk.index')->with('success', 'Data produk berhasil diperbarui');
    }

    public function destroy(Produk $produk)
    {
        $produk->delete();
        return back()->with('success', 'Data dihapus');
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