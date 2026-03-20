<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\Request;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $query = Produk::query();

        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('bounds')) {
            $bounds = $request->bounds;
            $query->whereBetween('latitude', [$bounds['south'], $bounds['north']])
                  ->whereBetween('longitude', [$bounds['west'], $bounds['east']]);
        }

        $data = $request->has('per_page') ? $query->paginate($request->per_page) : $query->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show($id)
    {
        return response()->json(['success' => true, 'data' => Produk::findOrFail($id)]);
    }

    public function export(Request $request)
    {
        try {
            $query = Produk::query();

            if ($request->filled('provinsi')) {
                $query->whereIn('provinsi', (array) $request->provinsi);
            }

            if ($request->filled('bidang')) {
                $query->whereIn('bidang', (array) $request->bidang);
            }

            if ($request->filled('tkt')) {
                $query->whereIn('tkt', (array) $request->tkt);
            }

            if ($request->filled('search')) {
                $query->search($request->search);
            }

            return response()->stream(function () use ($query) {
                echo '[';
                $first = true;

                $query->select(
                    'institusi',
                    'provinsi',
                    'nama_produk',
                    'deskripsi_produk',
                    'tkt',
                    'bidang',
                    'nama_inventor',
                    'email_inventor',
                    'nomor_paten'
                )
                ->orderBy('institusi')
                ->orderBy('nama_produk')
                ->cursor()
                ->each(function ($item) use (&$first) {
                    if (!$first) {
                        echo ',';
                    }
                    echo json_encode($item);
                    $first = false;

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
        } catch (\Exception $e) {
            \Log::error('Produk Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
    public function statistics(Request $request)
    {
        $query = Produk::query();
        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }
        $total = $query->count();

        $byBidang = Produk::select('bidang')
            ->when($request->has('provinsi'), function ($q) use ($request) {
                $q->where('provinsi', $request->provinsi);
            })
            ->groupBy('bidang')
            ->selectRaw('COUNT(*) as total')
            ->pluck('total', 'bidang');

        $byProvinsi = Produk::select('provinsi')
            ->groupBy('provinsi')
            ->selectRaw('COUNT(*) as total')
            ->pluck('total', 'provinsi');

        $stats = [
            'total' => $total,
            'by_bidang' => $byBidang,
            'by_provinsi' => $byProvinsi,
        ];
        return response()->json(['success' => true, 'data' => $stats]);
    }
}


