<?php

namespace App\Http\Controllers;

use App\Models\Hilirisasi;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HilirisasiPageController extends Controller
{
    public function index()
    {
        $query = Hilirisasi::query();

        $stats = [
            'totalResearch' => $query->count(),
            'totalUniversities' => $query->distinct('perguruan_tinggi')->count('perguruan_tinggi'),
            'totalProvinces' => $query->distinct('provinsi')->count('provinsi'),
            'totalFields' => $query->distinct('skema')->count('skema'),
        ];

        $mapData = $query->select(
            'perguruan_tinggi as institusi',
            'pt_latitude',
            'pt_longitude',
            'provinsi',
            'skema as bidang_fokus',
            DB::raw('COUNT(*) as total')
        )
        ->groupBy('perguruan_tinggi', 'pt_latitude', 'pt_longitude', 'provinsi', 'skema')
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

        $items = $query->select('id', 'judul', 'perguruan_tinggi as institusi', 'provinsi', 'skema', 'tahun')
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


