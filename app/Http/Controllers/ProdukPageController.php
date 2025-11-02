<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
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

        $cacheKey = 'map_data_produk_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            $query = (clone $baseQuery)->select(
                'id',
                'institusi',
                'latitude as pt_latitude',
                'longitude as pt_longitude',
                'provinsi',
                'bidang as bidang_fokus',
                'nama_produk as judul'
            )
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');
            
            // Process in chunks to avoid memory issues
            $mapDataArray = [];
            $query->chunk(5000, function($chunk) use (&$mapDataArray) {
                foreach ($chunk as $item) {
                    $mapDataArray[] = [
                        'id' => $item->id,
                        'institusi' => $item->institusi,
                        'pt_latitude' => (float)$item->pt_latitude,
                        'pt_longitude' => (float)$item->pt_longitude,
                        'provinsi' => $item->provinsi,
                        'bidang_fokus' => $item->bidang_fokus,
                        'judul' => $item->judul ? substr($item->judul, 0, 150) : null,
                        'count' => 1,
                    ];
                }
            });
            
            return $mapDataArray;
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


