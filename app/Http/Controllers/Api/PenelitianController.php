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

        $stats = [
            'total' => $query->count(),
            'by_bidang_fokus' => $query->get()->groupBy('bidang_fokus')->map->count(),
            'by_provinsi' => $query->get()->groupBy('provinsi')->map->count(),
            'by_tahun' => $query->get()->groupBy('thn_pelaksanaan')->map->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
