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

    public function export(Request $request)
    {
        try {
            $query = Hilirisasi::query();

            if ($request->filled('provinsi')) {
                $query->whereIn('provinsi', (array) $request->provinsi);
            }

            if ($request->filled('tahun')) {
                $query->whereIn('tahun', (array) $request->tahun);
            }

            if ($request->filled('direktorat')) {
                $query->whereIn('direktorat', (array) $request->direktorat);
            }

            if ($request->filled('skema')) {
                $query->whereIn('skema', (array) $request->skema);
            }

            if ($request->filled('search')) {
                $query->search($request->search);
            }

            return response()->stream(function () use ($query) {
                echo '[';
                $first = true;

                $query->select(
                    'tahun',
                    'judul',
                    'nama_pengusul',
                    'direktorat',
                    'perguruan_tinggi',
                    'provinsi',
                    'mitra',
                    'skema',
                    'luaran'
                )
                ->orderBy('tahun', 'desc')
                ->orderBy('perguruan_tinggi')
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
            \Log::error('Hilirisasi Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
}
