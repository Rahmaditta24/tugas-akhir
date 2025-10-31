<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ProdukPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Produk::query();
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        $statsQ = clone $baseQuery;
        $stats = [
            'totalResearch' => (clone $statsQ)->count(),
            'totalUniversities' => (clone $statsQ)->distinct('institusi')->count('institusi'),
            'totalProvinces' => (clone $statsQ)->distinct('provinsi')->count('provinsi'),
            'totalFields' => (clone $statsQ)->distinct('bidang')->count('bidang'),
        ];

        $mapData = (clone $baseQuery)->select(
            'id',
            'institusi',
            'latitude as pt_latitude',
            'longitude as pt_longitude',
            'provinsi',
            'bidang as bidang_fokus'
        )
        ->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->get()
        ->map(function($item) {
            return [
                'id' => $item->id,
                'institusi' => $item->institusi,
                'pt_latitude' => (float)$item->pt_latitude,
                'pt_longitude' => (float)$item->pt_longitude,
                'provinsi' => $item->provinsi,
                'bidang_fokus' => $item->bidang_fokus,
                'count' => 1,
            ];
        });

        $items = (clone $baseQuery)->select('id', 'nama_produk as judul', 'institusi', 'provinsi', 'bidang as skema', 'tkt as tahun')
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


