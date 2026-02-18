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

class AdminStatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'penelitian' => \App\Models\Penelitian::count(),
            'pengabdian' => \App\Models\Pengabdian::count(),
            'hilirisasi' => \App\Models\Hilirisasi::count(),
            'produk' => \App\Models\Produk::count(),
            'fasilitas' => \App\Models\FasilitasLab::count(),
            'permasalahan_prov' => \App\Models\PermasalahanProvinsi::count(),
            'permasalahan_kab' => \App\Models\PermasalahanKabupaten::count(),
            'rumusan_masalah_category' => \App\Models\RumusanMasalahCategory::count(),
            'rumusan_masalah_statement' => \App\Models\RumusanMasalahStatement::count(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function permasalahanBreakdown()
    {
        // Aggregate by jenis_permasalahan across provinsi and kabupaten
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


