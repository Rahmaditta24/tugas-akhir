<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hilirisasi;
use Illuminate\Http\Request;

class HilirisasiController extends Controller
{
    public function index(Request $request)
    {
        $query = Hilirisasi::query();

        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }

        if ($request->has('tahun')) {
            $query->byTahun($request->tahun);
        }

        if ($request->has('skema')) {
            $query->bySkema($request->skema);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('bounds')) {
            $bounds = $request->bounds;
            $query->whereBetween('pt_latitude', [$bounds['south'], $bounds['north']])
                  ->whereBetween('pt_longitude', [$bounds['west'], $bounds['east']]);
        }

        $data = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => Hilirisasi::findOrFail($id)
        ]);
    }
}
