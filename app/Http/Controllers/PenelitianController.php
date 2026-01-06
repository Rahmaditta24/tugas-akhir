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
        // Build base query with filters
        $baseQuery = Penelitian::query();

        // Apply filters if provided
        if ($request->filled('bidang_fokus')) {
            $baseQuery->whereIn('bidang_fokus', (array) $request->bidang_fokus);
        }

        if ($request->filled('tema_prioritas')) {
            $baseQuery->whereIn('tema_prioritas', (array) $request->tema_prioritas);
        }

        if ($request->filled('kategori_pt')) {
            $baseQuery->whereIn('kategori_pt', (array) $request->kategori_pt);
        }

        if ($request->filled('klaster')) {
            $baseQuery->whereIn('klaster', (array) $request->klaster);
        }

        if ($request->filled('provinsi')) {
            $baseQuery->whereIn('provinsi', (array) $request->provinsi);
        }

        if ($request->filled('tahun')) {
            $baseQuery->whereIn('thn_pelaksanaan', (array) $request->tahun);
        }

        // Apply search if provided
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        // Get statistics without loading all data into memory (cached for performance)
        $statsCacheKey = 'stats_penelitian_' . md5(json_encode($request->all()));
        $totalStats = Cache::remember($statsCacheKey, 3600, function() use ($baseQuery) {
            $statsQuery = clone $baseQuery;
            return [
                'totalResearch' => (clone $statsQuery)->count(),
                'totalUniversities' => (clone $statsQuery)->distinct('institusi')->count('institusi'),
                'totalProvinces' => (clone $statsQuery)->distinct('provinsi')->count('provinsi'),
                'totalFields' => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        });

        // For map: CRITICAL OPTIMIZATION - Only send aggregated/sampled data
        // Sending 66k+ markers causes massive performance issues
        // Strategy: Send only top 5000 most relevant records initially
        $cacheKey = 'map_data_penelitian_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 1800, function() use ($baseQuery) {
            $mapDataArray = [];

            // OPTIMIZATION: Limit to 5000 records for initial map load
            // This dramatically improves frontend rendering performance
            $query = (clone $baseQuery)->select(
                'id',
                'institusi',
                'pt_latitude',
                'pt_longitude',
                'provinsi',
                'bidang_fokus',
                DB::raw('SUBSTRING(judul, 1, 100) as judul_short')
            )
            ->whereNotNull('pt_latitude')
            ->whereNotNull('pt_longitude')
            ->latest('thn_pelaksanaan') // Prioritize recent research
            ->limit(2000); // CRITICAL: Reduced to 2000 for better performance

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

        // For list: paginate and only load what's needed
        $researches = (clone $baseQuery)->select(
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

        // Get filter options (cached - using raw DB queries for efficiency)
        $filterOptions = [
            'bidangFokus' => Cache::remember('filter_bidang_fokus', 7200, function() {
                return DB::table('penelitian')
                    ->select('bidang_fokus')
                    ->whereNotNull('bidang_fokus')
                    ->distinct()
                    ->orderBy('bidang_fokus')
                    ->pluck('bidang_fokus')
                    ->filter()
                    ->values();
            }),
            'temaPrioritas' => Cache::remember('filter_tema_prioritas', 7200, function() {
                return DB::table('penelitian')
                    ->select('tema_prioritas')
                    ->whereNotNull('tema_prioritas')
                    ->distinct()
                    ->orderBy('tema_prioritas')
                    ->pluck('tema_prioritas')
                    ->filter()
                    ->values();
            }),
            'kategoriPT' => Cache::remember('filter_kategori_pt', 7200, function() {
                return DB::table('penelitian')
                    ->select('kategori_pt')
                    ->whereNotNull('kategori_pt')
                    ->distinct()
                    ->orderBy('kategori_pt')
                    ->pluck('kategori_pt')
                    ->filter()
                    ->values();
            }),
            'klaster' => Cache::remember('filter_klaster', 7200, function() {
                return DB::table('penelitian')
                    ->select('klaster')
                    ->whereNotNull('klaster')
                    ->distinct()
                    ->orderBy('klaster')
                    ->pluck('klaster')
                    ->filter()
                    ->values();
            }),
            'provinsi' => Cache::remember('filter_provinsi', 7200, function() {
                return DB::table('penelitian')
                    ->select('provinsi')
                    ->whereNotNull('provinsi')
                    ->distinct()
                    ->orderBy('provinsi')
                    ->pluck('provinsi')
                    ->filter()
                    ->values();
            }),
            'tahun' => Cache::remember('filter_tahun', 7200, function() {
                return DB::table('penelitian')
                    ->select('thn_pelaksanaan')
                    ->whereNotNull('thn_pelaksanaan')
                    ->distinct()
                    ->orderBy('thn_pelaksanaan', 'desc')
                    ->pluck('thn_pelaksanaan')
                    ->filter()
                    ->values();
            }),
        ];

        return Inertia::render('Home', [
            'mapData' => $mapData,
            'researches' => $researches,
            'stats' => $totalStats,
            'filterOptions' => $filterOptions,
            'filters' => $request->all(),
        ]);
    }

    /**
     * Export all filtered data for Excel download
     * OPTIMIZED: Use chunked response to avoid memory exhaustion
     */
    public function export(Request $request)
    {
        // Build query with same filters as index
        $query = Penelitian::query();

        // Apply filters
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

        // OPTIMIZED: Use streaming response to avoid loading all data into memory
        return response()->stream(function () use ($query) {
            echo '[';
            $first = true;

            // Use cursor for memory-efficient iteration
            $query->select(
                'nama',
                'nidn',
                'institusi',
                'jenis_pt',
                'kategori_pt',
                'klaster',
                'provinsi',
                'kota',
                'judul',
                'skema',
                'thn_pelaksanaan',
                'bidang_fokus',
                'tema_prioritas'
            )
            ->orderBy('thn_pelaksanaan', 'desc')
            ->orderBy('institusi')
            ->cursor()
            ->each(function ($item) use (&$first) {
                if (!$first) {
                    echo ',';
                }
                echo json_encode($item);
                $first = false;

                // Flush output buffer to prevent memory buildup
                if (ob_get_level() > 0) {
                    ob_flush();
                    flush();
                }
            });

            echo ']';
        }, 200, [
            'Content-Type' => 'application/json',
            'Cache-Control' => 'no-cache',
        ]);
    }
}
