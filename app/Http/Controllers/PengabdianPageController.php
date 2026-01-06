<?php

namespace App\Http\Controllers;

use App\Models\Pengabdian;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class PengabdianPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Pengabdian::query();
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        // Cache statistics to avoid memory issues
        $statsCacheKey = 'stats_pengabdian_' . md5(json_encode($request->all()));
        $stats = Cache::remember($statsCacheKey, 3600, function() use ($baseQuery) {
            $statsQ = clone $baseQuery;
            return [
                'totalResearch' => (clone $statsQ)->count(),
                'totalUniversities' => (clone $statsQ)->distinct('nama_institusi')->count('nama_institusi'),
                'totalProvinces' => (clone $statsQ)->distinct('prov_pt')->count('prov_pt'),
                'totalFields' => (clone $statsQ)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        });

        $cacheKey = 'map_data_pengabdian_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            $mapDataArray = [];

            // OPTIMIZATION: Limit to 5000 records for performance
            $query = (clone $baseQuery)->select(
                'id',
                'nama_institusi as institusi',
                'pt_latitude',
                'pt_longitude',
                'prov_pt as provinsi',
                'bidang_fokus',
                DB::raw('SUBSTRING(judul, 1, 100) as judul_short')
            )
            ->whereNotNull('pt_latitude')
            ->whereNotNull('pt_longitude')
            ->latest('thn_pelaksanaan_kegiatan')
            ->limit(2000);

            foreach ($query->cursor() as $item) {
                $mapDataArray[] = [
                    'id' => $item->id,
                    'institusi' => $item->institusi,
                    'pt_latitude' => (float)$item->pt_latitude,
                    'pt_longitude' => (float)$item->pt_longitude,
                    'provinsi' => $item->provinsi,
                    'bidang_fokus' => $item->bidang_fokus,
                    'judul' => $item->judul_short,
                ];
            }

            return $mapDataArray;
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


