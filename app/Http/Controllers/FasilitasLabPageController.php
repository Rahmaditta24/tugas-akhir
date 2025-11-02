<?php

namespace App\Http\Controllers;

use App\Models\FasilitasLab;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class FasilitasLabPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = FasilitasLab::query();
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        $statsQ = clone $baseQuery;
        $stats = [
            'totalResearch' => (clone $statsQ)->count(),
            'totalUniversities' => (clone $statsQ)->distinct('institusi')->count('institusi'),
            'totalProvinces' => (clone $statsQ)->distinct('provinsi')->count('provinsi'),
            'totalFields' => (clone $statsQ)->distinct('jenis_laboratorium')->count('jenis_laboratorium'),
        ];

        $cacheKey = 'map_data_fasilitas_lab_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            $query = (clone $baseQuery)->select(
                'id',
                'institusi',
                'latitude as pt_latitude',
                'longitude as pt_longitude',
                'provinsi',
                'jenis_laboratorium as bidang_fokus',
                'nama_laboratorium as judul'
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

        $items = (clone $baseQuery)->select('id', 'nama_laboratorium as judul', 'institusi', 'provinsi', 'jenis_laboratorium as skema')
            ->latest('id')
            ->limit(50)
            ->get();

        return Inertia::render('FasilitasLab', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
        ]);
    }
}


