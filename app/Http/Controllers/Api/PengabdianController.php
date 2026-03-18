<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengabdian;
use Illuminate\Http\Request;

class PengabdianController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengabdian::query();

        if ($request->has('batch_type')) {
            $query->byBatchType($request->batch_type);
        }

        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }

        if ($request->has('tahun')) {
            $query->byTahun($request->tahun);
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
            'data' => Pengabdian::findOrFail($id)
        ]);
    }

    public function export(Request $request)
    {
        try {
            $query = Pengabdian::query();

            if ($request->filled('dataType')) {
                $val = $request->dataType;
                if (stripos($val, 'Multitahun') !== false && stripos($val, 'Batch') !== false) {
                    $query->where(function($q) {
                        $q->where('batch_type', 'like', '%multitahun%')
                          ->orWhere('batch_type', 'like', '%batch_i%')
                          ->orWhere('batch_type', 'like', '%batch_ii%');
                    });
                } elseif (stripos($val, 'Kosabangsa') !== false) {
                    $query->where(function($q) {
                        $q->where('batch_type', 'like', '%Kosabangsa%')
                          ->orWhere('nama_skema', 'like', '%Kosabangsa%');
                    });
                } else {
                    $query->where('batch_type', $val);
                }
            }

            if ($request->filled('skema')) {
                $query->whereIn('nama_singkat_skema', (array) $request->skema);
            }

            if ($request->filled('provinsi')) {
                $query->whereIn('prov_pt', (array) $request->provinsi);
            }

            if ($request->filled('tahun')) {
                $query->whereIn('thn_pelaksanaan_kegiatan', (array) $request->tahun);
            }

            if ($request->filled('search')) {
                $query->search($request->search);
            }

            return response()->stream(function () use ($query) {
                echo '[';
                $first = true;

                $query->select(
                    'nama',
                    'nidn',
                    'nama_institusi',
                    'prov_pt',
                    'kab_pt',
                    'klaster',
                    'judul',
                    'nama_singkat_skema',
                    'nama_skema',
                    'thn_pelaksanaan_kegiatan',
                    'bidang_fokus',
                    'prov_mitra',
                    'kab_mitra',
                    'batch_type',
                    'bidang_teknologi_inovasi'
                )
                ->orderBy('thn_pelaksanaan_kegiatan', 'desc')
                ->orderBy('nama_institusi')
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
            \Log::error('Pengabdian Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
}
