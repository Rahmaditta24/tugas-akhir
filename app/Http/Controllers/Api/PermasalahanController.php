<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use Illuminate\Http\Request;

class PermasalahanController extends Controller
{
    /**
     * Get permasalahan data by level (provinsi/kabupaten)
     */
    public function index(Request $request)
    {
        $level = $request->input('level', 'provinsi'); // provinsi or kabupaten
        $jenisPermasalahan = $request->input('jenis'); // sampah, stunting, gizi_buruk, krisis_listrik, ketahanan_pangan

        if ($level === 'provinsi') {
            $query = PermasalahanProvinsi::query();
        } else {
            $query = PermasalahanKabupaten::query();
        }

        // Filter by jenis permasalahan
        if ($jenisPermasalahan) {
            $query->byJenisPermasalahan($jenisPermasalahan);
        }

        // Filter by metrik (untuk krisis listrik: saidi/saifi)
        if ($request->has('metrik')) {
            $query->byMetrik($request->metrik);
        }

        $data = $query->get();

        // Format data untuk frontend (grouping by provinsi/kabupaten)
        $formattedData = $data->mapWithKeys(function ($item) use ($level) {
            $key = $level === 'provinsi' ? $item->provinsi : $item->kabupaten_kota;
            return [$key => $item->nilai];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedData
        ]);
    }

    /**
     * Get all jenis permasalahan for a specific provinsi
     */
    public function byProvinsi($provinsi)
    {
        $data = PermasalahanProvinsi::where('provinsi', $provinsi)->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics(Request $request)
    {
        $jenisPermasalahan = $request->input('jenis');
        $level = $request->input('level', 'provinsi');

        if ($level === 'provinsi') {
            $query = PermasalahanProvinsi::query();
        } else {
            $query = PermasalahanKabupaten::query();
        }

        if ($jenisPermasalahan) {
            $query->byJenisPermasalahan($jenisPermasalahan);
        }

        $data = $query->get();

        $stats = [
            'total_records' => $data->count(),
            'min' => $data->min('nilai'),
            'max' => $data->max('nilai'),
            'avg' => $data->avg('nilai'),
            'sum' => $data->sum('nilai'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
