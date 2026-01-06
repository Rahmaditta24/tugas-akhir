<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Penelitian;
use App\Models\Hilirisasi;
use App\Models\Pengabdian;
use App\Models\Produk;
use App\Models\FasilitasLab;
use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use App\Models\RumusanMasalahCategory;
use App\Models\RumusanMasalahStatement;
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
            'rumusan_masalah_category' => RumusanMasalahCategory::count(),
            'rumusan_masalah_statements' => RumusanMasalahStatement::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }
}