<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FasilitasLab;
use App\Models\Hilirisasi;
use App\Models\Penelitian;
use App\Models\Pengabdian;
use App\Models\PermasalahanKabupaten;
use App\Models\PermasalahanProvinsi;
use App\Models\Produk;
use App\Models\RumusanMasalahCategory;
use App\Models\RumusanMasalahStatement;

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


