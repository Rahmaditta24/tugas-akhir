<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProdukPageController extends Controller
{
    public function index()
    {
        $query = Produk::query();

        $stats = [
            'totalResearch' => $query->count(),
            'totalUniversities' => $query->distinct('institusi')->count('institusi'),
            'totalProvinces' => $query->distinct('provinsi')->count('provinsi'),
            'totalFields' => $query->distinct('bidang')->count('bidang'),
        ];

        $mapData = $query->select(
            'institusi',
            'latitude as pt_latitude',
            'longitude as pt_longitude',
            'provinsi',
            'bidang as bidang_fokus',
            DB::raw('COUNT(*) as total')
        )
        ->groupBy('institusi', 'latitude', 'longitude', 'provinsi', 'bidang')
        ->get()
        ->map(function($item) {
            return [
                'institusi' => $item->institusi,
                'pt_latitude' => $item->pt_latitude,
                'pt_longitude' => $item->pt_longitude,
                'provinsi' => $item->provinsi,
                'bidang_fokus' => $item->bidang_fokus,
                'count' => $item->total,
            ];
        });

        $items = $query->select('id', 'nama_produk as judul', 'institusi', 'provinsi', 'bidang as skema', 'tkt as tahun')
            ->latest('id')
            ->limit(50)
            ->get();

        return Inertia::render('Produk', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
        ]);
    }
}


