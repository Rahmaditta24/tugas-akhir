<?php

namespace App\Http\Controllers;

use App\Models\Pengabdian;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PengabdianPageController extends Controller
{
    public function index()
    {
        $query = Pengabdian::query();

        $stats = [
            'totalResearch' => $query->count(),
            'totalUniversities' => $query->distinct('nama_institusi')->count('nama_institusi'),
            'totalProvinces' => $query->distinct('prov_pt')->count('prov_pt'),
            'totalFields' => $query->distinct('bidang_fokus')->count('bidang_fokus'),
        ];

        $mapData = $query->select(
            'nama_institusi as institusi',
            'pt_latitude',
            'pt_longitude',
            'prov_pt as provinsi',
            'bidang_fokus',
            DB::raw('COUNT(*) as total')
        )
        ->groupBy('nama_institusi', 'pt_latitude', 'pt_longitude', 'prov_pt', 'bidang_fokus')
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

        $items = $query->select('id', 'judul', 'nama_institusi as institusi', 'prov_pt as provinsi', 'nama_skema as skema', 'thn_pelaksanaan_kegiatan as tahun')
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


