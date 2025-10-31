<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Penelitian;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PenelitianController extends Controller
{
    public function index(Request $request)
    {
        // Build query with filters
        $query = Penelitian::query();

        // Apply filters if provided
        if ($request->filled('bidang_fokus')) {
            $query->whereIn('bidang_fokus', (array) $request->bidang_fokus);
        }

        if ($request->filled('tema_prioritas')) {
            $query->whereIn('tema_prioritas', (array) $request->tema_prioritas);
        }

        if ($request->filled('kategori_pt')) {
            $query->whereIn('kategori_pt', (array) $request->kategori_pt);
        }

        if ($request->filled('klaster')) {
            $query->whereIn('klaster', (array) $request->klaster);
        }

        if ($request->filled('provinsi')) {
            $query->whereIn('provinsi', (array) $request->provinsi);
        }

        if ($request->filled('tahun')) {
            $query->whereIn('thn_pelaksanaan', (array) $request->tahun);
        }

        // Apply search if provided
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Get statistics without loading all data into memory
        $totalStats = [
            'totalResearch' => $query->count(),
            'totalUniversities' => $query->distinct('institusi')->count('institusi'),
            'totalProvinces' => $query->distinct('provinsi')->count('provinsi'),
            'totalFields' => $query->distinct('bidang_fokus')->count('bidang_fokus'),
        ];

        // For map: aggregate by location to reduce markers
        // Group by institusi and coordinates, count total per location
        $mapData = $query->select(
            'institusi',
            'pt_latitude',
            'pt_longitude',
            'provinsi',
            'bidang_fokus',
            DB::raw('COUNT(*) as total')
        )
        ->groupBy('institusi', 'pt_latitude', 'pt_longitude', 'provinsi', 'bidang_fokus')
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

        // For list: paginate and only load what's needed
        $researches = $query->select(
            'id',
            'nama',
            'institusi',
            'judul',
            'bidang_fokus',
            'tema_prioritas',
            'thn_pelaksanaan',
            'skema'
        )
        ->latest()
        ->limit(50) // Only load first 50 for initial render
        ->get();

        // Get filter options (cache these in production)
        $filterOptions = [
            'bidangFokus' => Cache::remember('filter_bidang_fokus', 3600, function() {
                return Penelitian::distinct()->pluck('bidang_fokus')->filter()->sort()->values();
            }),
            'temaPrioritas' => Cache::remember('filter_tema_prioritas', 3600, function() {
                return Penelitian::distinct()->pluck('tema_prioritas')->filter()->sort()->values();
            }),
            'kategoriPT' => Cache::remember('filter_kategori_pt', 3600, function() {
                return Penelitian::distinct()->pluck('kategori_pt')->filter()->sort()->values();
            }),
            'klaster' => Cache::remember('filter_klaster', 3600, function() {
                return Penelitian::distinct()->pluck('klaster')->filter()->sort()->values();
            }),
            'provinsi' => Cache::remember('filter_provinsi', 3600, function() {
                return Penelitian::distinct()->pluck('provinsi')->filter()->sort()->values();
            }),
            'tahun' => Cache::remember('filter_tahun', 3600, function() {
                return Penelitian::distinct()->orderBy('thn_pelaksanaan', 'desc')->pluck('thn_pelaksanaan')->filter()->values();
            }),
        ];

        return Inertia::render('Home', [
            'mapData' => $mapData,
            'researches' => $researches,
            'stats' => $totalStats,
            'filterOptions' => $filterOptions,
        ]);
    }
}
