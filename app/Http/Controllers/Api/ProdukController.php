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
        $stats = [
            'total' => $query->count(),
            'by_bidang' => $query->get()->groupBy('bidang')->map->count(),
            'by_provinsi' => $query->get()->groupBy('provinsi')->map->count(),
        ];
        return response()->json(['success' => true, 'data' => $stats]);
    }
}


