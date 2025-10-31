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


