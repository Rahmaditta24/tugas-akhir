<?php

namespace App\Modules\Dashboard\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\FasilitasLab\Models\FasilitasLab;
use App\Modules\Hilirisasi\Models\Hilirisasi;
use App\Modules\Penelitian\Models\Penelitian;
use App\Modules\Pengabdian\Models\Pengabdian;
use App\Modules\Permasalahan\Models\PermasalahanKabupaten;
use App\Modules\Permasalahan\Models\PermasalahanProvinsi;
use App\Modules\Produk\Models\Produk;
use App\Modules\RumusanMasalah\Models\RumusanMasalahCategory;
use App\Modules\RumusanMasalah\Models\RumusanMasalahStatement;

class AdminStatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'penelitian' => Penelitian::whereNotNull('judul')->where('judul', '!=', '')->count(),
            'pengabdian' => Pengabdian::count(),
            'hilirisasi' => Hilirisasi::count(),
            'produk' => Produk::count(),
            'fasilitas' => FasilitasLab::count(),
            'permasalahan_prov' => PermasalahanProvinsi::count(),
            'permasalahan_kab' => PermasalahanKabupaten::count(),
            'rumusan_masalah_category' => RumusanMasalahCategory::count(),
            'rumusan_masalah_statement' => RumusanMasalahStatement::count(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function permasalahanBreakdown()
    {
        // Agregasi berdasarkan jenis_permasalahan di seluruh provinsi dan kabupaten
        $prov = PermasalahanProvinsi::query()
            ->selectRaw('jenis_permasalahan, COUNT(*) as count')
            ->groupBy('jenis_permasalahan')
            ->pluck('count', 'jenis_permasalahan');

        $kab = PermasalahanKabupaten::query()
            ->selectRaw('jenis_permasalahan, COUNT(*) as count')
            ->groupBy('jenis_permasalahan')
            ->pluck('count', 'jenis_permasalahan');

        $keys = collect(array_unique(array_merge($prov->keys()->all(), $kab->keys()->all())));

        $data = $keys->mapWithKeys(function ($k) use ($prov, $kab) {
            return [
                $k => [
                    'provinsi' => (int)($prov[$k] ?? 0),
                    'kabupaten' => (int)($kab[$k] ?? 0),
                    'total' => (int)($prov[$k] ?? 0) + (int)($kab[$k] ?? 0),
                ],
            ];
        });

        return response()->json([
            'data' => $data,
            'timestamp' => now()->toISOString(),
        ]);
    }
}


