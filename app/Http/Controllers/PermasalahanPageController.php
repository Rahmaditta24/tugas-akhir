<?php

namespace App\Http\Controllers;

use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use App\Models\Penelitian;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PermasalahanPageController extends Controller
{
    public function index()
    {
        // Get penelitian with coordinates as bubble markers - lazy load on initial
        // Initial load: only first 5000 minimal records to speed up page load
        $mapDataQuery = Penelitian::selectRaw(
                'id, judul, pt_latitude, pt_longitude'
            )
            ->whereNotNull('judul')
            ->whereNotNull('pt_latitude')
            ->whereNotNull('pt_longitude')
            ->orderBy('id');
        
        $totalCount = $mapDataQuery->count();
        
        // Load only first 5000 on initial page load for fast rendering
        $mapData = $mapDataQuery
            ->limit(5000)
            ->get()
            ->toArray();
        
        // Debug logging
        \Log::info('Permasalahan mapData count: ' . count($mapData) . ' / Total: ' . $totalCount);

        // Choropleth data: group by jenis_permasalahan → [{provinsi, nilai, satuan, metrik, tahun}]
        // Map database jenis_permasalahan to display names
        $displayNameMap = [
            'sampah' => 'Sampah',
            'stunting' => 'Stunting',
            'gizi_buruk' => 'Gizi Buruk',
            'krisis_listrik' => 'Krisis Listrik',
            'ketahanan_pangan' => 'Ketahanan Pangan',
        ];

        $permasalahanStats = \Cache::remember('permasalahan_choropleth_stats', 86400, function () use ($displayNameMap) {
            return PermasalahanProvinsi::query()
                ->selectRaw('jenis_permasalahan, provinsi, nilai, satuan, metrik, tahun')
                ->get()
                ->groupBy('jenis_permasalahan')
                ->map(fn($items) => $items->map(fn($item) => [
                    'provinsi' => $item->provinsi,
                    'nilai'    => $item->nilai,
                    'satuan'   => $item->satuan,
                    'metrik'   => $item->metrik,
                    'tahun'    => $item->tahun,
                ])->values()->toArray())
                ->mapWithKeys(fn($items, $jenis) => [
                    $displayNameMap[$jenis] ?? $jenis => $items
                ])
                ->toArray();
        });

        $jenisPermasalahan = array_keys($permasalahanStats);

        // General penelitian list (first 50, ordered latest) - optimized columns
        $researches = Penelitian::selectRaw(
                'id, judul, nidn, nuptk, nama, institusi, provinsi, skema, ' .
                'thn_pelaksanaan as tahun, kategori_pt, klaster'
            )
            ->whereNotNull('judul')
            ->orderByDesc('thn_pelaksanaan')
            ->limit(50)
            ->get();

        // Clear old cache and recalculate with correct queries - cache for 24 hours
        // These are expensive DISTINCT queries, so we cache them aggressively
        $stats = \Cache::remember('permasalahan_stats', 86400, function () {
            $baseQuery = Penelitian::whereNotNull('judul')
                                  ->whereNotNull('pt_latitude')
                                  ->whereNotNull('pt_longitude');
            
            return [
                'totalResearch' => $baseQuery->count(),
                'totalUniversities' => Penelitian::whereNotNull('judul')
                    ->whereNotNull('institusi')
                    ->count(DB::raw('DISTINCT institusi')),
                'totalProvinces' => Penelitian::whereNotNull('judul')
                    ->whereNotNull('provinsi')
                    ->count(DB::raw('DISTINCT provinsi')),
                'totalFields' => Penelitian::whereNotNull('judul')
                    ->whereNotNull('bidang_fokus')
                    ->count(DB::raw('DISTINCT bidang_fokus')),
            ];
        });

        return Inertia::render('Permasalahan', [
            'mapData'            => $mapData,
            'permasalahanStats'  => $permasalahanStats,
            'jenisPermasalahan'  => $jenisPermasalahan,
            'researches'         => $researches,
            'stats'              => $stats,
        ]);
    }

    /**
     * API endpoint for lazy-loading marker details
     * Fetch markers by offset/limit or by geographic bounds
     */
    public function lazyLoadMarkers()
    {
        $offset = request()->input('offset', 5000); // Start from 5000 (after initial load)
        $limit = request()->input('limit', 5000);   // Load 5000 per chunk
        
        // Get markers with full detail for popup
        $markers = Penelitian::selectRaw(
                'id, judul, nama, institusi, provinsi, skema, ' .
                'thn_pelaksanaan as tahun, kategori_pt, klaster, ' .
                'pt_latitude, pt_longitude, bidang_fokus, tema_prioritas, nidn, nuptk'
            )
            ->whereNotNull('judul')
            ->whereNotNull('pt_latitude')
            ->whereNotNull('pt_longitude')
            ->offset($offset)
            ->limit($limit)
            ->get()
            ->toArray();

        return response()->json([
            'markers' => $markers,
            'hasMore' => ($offset + count($markers)) < Penelitian::whereNotNull('judul')
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
                ->count(),
        ]);
    }
}


