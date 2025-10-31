<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Penelitian, Hilirisasi, Pengabdian, Produk, FasilitasLab, PermasalahanProvinsi, PermasalahanKabupaten};
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'penelitian' => Penelitian::count(),
            'hilirisasi' => Hilirisasi::count(),
            'pengabdian' => Pengabdian::count(),
            'produk' => Produk::count(),
            'fasilitas' => FasilitasLab::count(),
            'permasalahan_prov' => PermasalahanProvinsi::count(),
            'permasalahan_kab' => PermasalahanKabupaten::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }
}


