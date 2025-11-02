<?php

namespace App\Http\Controllers;

use App\Models\Hilirisasi;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class HilirisasiPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Hilirisasi::query();
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        $statsQ = clone $baseQuery;
        $stats = [
            'totalResearch' => (clone $statsQ)->count(),
            'totalUniversities' => (clone $statsQ)->distinct('perguruan_tinggi')->count('perguruan_tinggi'),
            'totalProvinces' => (clone $statsQ)->distinct('provinsi')->count('provinsi'),
            'totalFields' => (clone $statsQ)->distinct('skema')->count('skema'),
        ];

        $cacheKey = 'map_data_hilirisasi_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            $mapDataArray = [];

            // OPTIMIZED: Use cursor() for memory-efficient iteration
            $query = (clone $baseQuery)->select(
                'id',
                'perguruan_tinggi as institusi',
                'pt_latitude',
                'pt_longitude',
                'provinsi',
                'skema as bidang_fokus',
                DB::raw('SUBSTRING(judul, 1, 150) as judul_short')
            )
            ->whereNotNull('pt_latitude')
            ->whereNotNull('pt_longitude');

            // Cursor loads one record at a time - minimal memory
            foreach ($query->cursor() as $item) {
                $mapDataArray[] = [
                    'id' => $item->id,
                    'institusi' => $item->institusi,
                    'pt_latitude' => (float)$item->pt_latitude,
                    'pt_longitude' => (float)$item->pt_longitude,
                    'provinsi' => $item->provinsi,
                    'bidang_fokus' => $item->bidang_fokus,
                    'judul' => $item->judul_short,
                    'count' => 1,
                ];
            }

            return $mapDataArray;
        });

        $items = (clone $baseQuery)->select('id', 'judul', 'perguruan_tinggi as institusi', 'provinsi', 'skema', 'tahun')
            ->latest('tahun')
            ->limit(50)
            ->get();

        return Inertia::render('Hilirisasi', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
        ]);
    }
}


