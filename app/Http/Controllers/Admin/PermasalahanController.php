<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermasalahanController extends Controller
{
    public function index(Request $request)
    {
        // Show both provinsi and kabupaten data
        $provinsiQuery = PermasalahanProvinsi::query();
        $kabupatenQuery = PermasalahanKabupaten::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $provinsiQuery->where('provinsi', 'like', "%{$search}%");
            $kabupatenQuery->where('kabupaten', 'like', "%{$search}%");
        }

        $permasalahanProvinsi = $provinsiQuery->orderByDesc('id')->limit(10)->get();
        $permasalahanKabupaten = $kabupatenQuery->orderByDesc('id')->limit(10)->get();

        $stats = [
            'totalProvinsi' => PermasalahanProvinsi::count(),
            'totalKabupaten' => PermasalahanKabupaten::count(),
            'total' => PermasalahanProvinsi::count() + PermasalahanKabupaten::count(),
        ];

        return Inertia::render('Admin/Permasalahan/Index', [
            'permasalahanProvinsi' => $permasalahanProvinsi,
            'permasalahanKabupaten' => $permasalahanKabupaten,
            'stats' => $stats,
            'filters' => ['search' => $request->search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Permasalahan/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:provinsi,kabupaten'],
            'provinsi' => ['nullable', 'string', 'max:255'],
            'kabupaten' => ['nullable', 'string', 'max:255'],
            'jenis_permasalahan' => ['required', 'string', 'max:255'],
            'nilai' => ['nullable', 'numeric'],
        ]);

        if ($validated['type'] === 'provinsi') {
            PermasalahanProvinsi::create($validated);
        } else {
            PermasalahanKabupaten::create($validated);
        }

        return redirect()->route('admin.permasalahan.index')->with('success', 'Data permasalahan berhasil ditambahkan');
    }
}
