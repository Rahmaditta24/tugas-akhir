<?php

namespace App\Http\Controllers;

use App\Models\FasilitasLab;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class FasilitasLabPageController extends Controller
{
    public function index()
    {
        $query = FasilitasLab::query();

        $stats = [
            'totalResearch' => $query->count(),
            'totalUniversities' => $query->distinct('institusi')->count('institusi'),
            'totalProvinces' => $query->distinct('provinsi')->count('provinsi'),
            'totalFields' => $query->distinct('jenis_lab')->count('jenis_lab'),
        ];

        $mapData = $query->select(
            'institusi',
            'latitude as pt_latitude',
            'longitude as pt_longitude',
            'provinsi',
            'jenis_lab as bidang_fokus',
            DB::raw('COUNT(*) as total')
        )
        ->groupBy('institusi', 'latitude', 'longitude', 'provinsi', 'jenis_lab')
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

        $items = $query->select('id', 'nama_lab as judul', 'institusi', 'provinsi', 'jenis_lab as skema', 'tahun')
            ->latest('tahun')
            ->limit(50)
            ->get();

        return Inertia::render('FasilitasLab', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
        ]);
    }
}


