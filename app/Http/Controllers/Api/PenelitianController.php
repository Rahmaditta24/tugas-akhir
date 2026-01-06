<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penelitian;
use Illuminate\Http\Request;

class PenelitianController extends Controller
{
    /**
     * Get all penelitian data with filtering
     */
    public function index(Request $request)
    {
        $query = Penelitian::query();

        // Filter by provinsi
        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }

        // Filter by tahun
        if ($request->has('tahun')) {
            $query->byTahun($request->tahun);
        }

        // Filter by bidang fokus
        if ($request->has('bidang_fokus')) {
            $query->byBidangFokus($request->bidang_fokus);
        }

        // Search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Filter by coordinates bounds (untuk map viewport)
        if ($request->has('bounds')) {
            $bounds = $request->bounds;
            $query->whereBetween('pt_latitude', [$bounds['south'], $bounds['north']])
                  ->whereBetween('pt_longitude', [$bounds['west'], $bounds['east']]);
        }

        // Pagination or all
        if ($request->has('per_page')) {
            $data = $query->paginate($request->per_page);
        } else {
            $data = $query->get();
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Get single penelitian
     */
    public function show($id)
    {
        $penelitian = Penelitian::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $penelitian
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics(Request $request)
    {
        $query = Penelitian::query();

        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }

        $total = $query->count();

        $byBidang = Penelitian::select('bidang_fokus')
            ->when($request->has('provinsi'), function ($q) use ($request) {
                $q->where('provinsi', $request->provinsi);
            })
            ->groupBy('bidang_fokus')
            ->selectRaw('COUNT(*) as total')
            ->pluck('total', 'bidang_fokus');

        $byProvinsi = Penelitian::select('provinsi')
            ->groupBy('provinsi')
            ->selectRaw('COUNT(*) as total')
            ->pluck('total', 'provinsi');

        $byTahun = Penelitian::select('thn_pelaksanaan')
            ->when($request->has('provinsi'), function ($q) use ($request) {
                $q->where('provinsi', $request->provinsi);
            })
            ->groupBy('thn_pelaksanaan')
            ->selectRaw('COUNT(*) as total')
            ->pluck('total', 'thn_pelaksanaan');

        $stats = [
            'total' => $total,
            'by_bidang_fokus' => $byBidang,
            'by_provinsi' => $byProvinsi,
            'by_tahun' => $byTahun,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Export penelitian data with filters
     */
    public function export(Request $request)
    {
        try {
            $query = Penelitian::query();

            // Apply filters (support arrays)
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

            // Get data
            $data = $query->select(
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
            ->get();

            return response()->json($data);

        } catch (\Exception $e) {
            \Log::error('API Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
}
