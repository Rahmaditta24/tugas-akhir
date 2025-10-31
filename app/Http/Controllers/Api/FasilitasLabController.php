<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FasilitasLab;
use Illuminate\Http\Request;

class FasilitasLabController extends Controller
{
    public function index(Request $request)
    {
        $query = FasilitasLab::query();

        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }

        if ($request->has('jenis')) {
            $query->where('jenis_laboratorium', $request->jenis);
        }

        if ($request->has('status_akses')) {
            $query->byStatusAkses($request->status_akses);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('bounds')) {
            $bounds = $request->bounds;
            $query->whereBetween('latitude', [$bounds['south'], $bounds['north']])
                  ->whereBetween('longitude', [$bounds['west'], $bounds['east']]);
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
            'data' => FasilitasLab::findOrFail($id)
        ]);
    }
}


