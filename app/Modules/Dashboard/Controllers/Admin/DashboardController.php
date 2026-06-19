<?php

namespace App\Modules\Dashboard\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Penelitian\Models\Penelitian;
use App\Modules\Hilirisasi\Models\Hilirisasi;
use App\Modules\Pengabdian\Models\Pengabdian;
use App\Modules\Produk\Models\Produk;
use App\Modules\FasilitasLab\Models\FasilitasLab;
use App\Modules\Permasalahan\Models\PermasalahanProvinsi;
use App\Modules\Permasalahan\Models\PermasalahanKabupaten;
use App\Modules\RumusanMasalah\Models\RumusanMasalahCategory;
use App\Modules\RumusanMasalah\Models\RumusanMasalahStatement;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = Cache::remember('admin_dashboard_stats', 600, function() {
            return [
                'penelitian' => Penelitian::whereNotNull('judul')->where('judul', '!=', '')->count(),
                'hilirisasi' => Hilirisasi::count(),
                'pengabdian' => Pengabdian::count(),
                'produk' => Produk::count(),
                'fasilitas' => FasilitasLab::count(),
                'permasalahan_prov' => PermasalahanProvinsi::count(),
                'permasalahan_kab' => PermasalahanKabupaten::count(),
                'rumusan_masalah_category' => RumusanMasalahCategory::count(),
                'rumusan_masalah_statement' => RumusanMasalahStatement::count(),
            ];
        });

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
        ]);
    }
}
