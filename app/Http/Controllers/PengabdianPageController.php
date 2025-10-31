<?php

namespace App\Http\Controllers;

use App\Models\Pengabdian;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class PengabdianPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Pengabdian::query();
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        $statsQ = clone $baseQuery;
        $stats = [
            'totalResearch' => (clone $statsQ)->count(),
            'totalUniversities' => (clone $statsQ)->distinct('nama_institusi')->count('nama_institusi'),
            'totalProvinces' => (clone $statsQ)->distinct('prov_pt')->count('prov_pt'),
            'totalFields' => (clone $statsQ)->distinct('bidang_fokus')->count('bidang_fokus'),
        ];

        $mapData = (clone $baseQuery)->select(
            'id',
            'nama_institusi as institusi',
            'pt_latitude',
            'pt_longitude',
            'prov_pt as provinsi',
            'bidang_fokus'
        )
        ->whereNotNull('pt_latitude')
        ->whereNotNull('pt_longitude')
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

        $items = (clone $baseQuery)->select('id', 'judul', 'nama_institusi as institusi', 'prov_pt as provinsi', 'nama_skema as skema', 'thn_pelaksanaan_kegiatan as tahun')
            ->latest('thn_pelaksanaan_kegiatan')
            ->limit(50)
            ->get();

        return Inertia::render('Pengabdian', [
            'mapData' => $mapData,
            'researches' => $items,
            'stats' => $stats,
        ]);
    }
}


