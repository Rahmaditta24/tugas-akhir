<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penelitian;
use Illuminate\Http\Request;

class PenelitianController extends Controller
{
    /**
     * Mengambil semua data penelitian dengan filter
     */
    public function index(Request $request)
    {
        $query = Penelitian::whereNotNull('judul')->where('judul', '!=', '');

        // Filter berdasarkan provinsi
        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }

        // Filter berdasarkan tahun
        if ($request->has('tahun')) {
            $query->byTahun($request->tahun);
        }

        // Filter berdasarkan bidang fokus
        if ($request->has('bidang_fokus')) {
            $query->byBidangFokus($request->bidang_fokus);
        }

        // Pencarian
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Filter berdasarkan batas koordinat (untuk viewport peta)
        if ($request->has('bounds')) {
            $bounds = $request->bounds;
            $query->whereBetween('pt_latitude', [$bounds['south'], $bounds['north']])
                  ->whereBetween('pt_longitude', [$bounds['west'], $bounds['east']]);
        }

        // Pagination atau semua data
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
     * Mengambil data penelitian tunggal
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
     * Mengambil statistik
     */
    public function statistics(Request $request)
    {
        $query = Penelitian::whereNotNull('judul')->where('judul', '!=', '');

        if ($request->has('provinsi')) {
            $query->byProvinsi($request->provinsi);
        }

        $total = $query->count();

        $byBidang = Penelitian::whereNotNull('judul')->where('judul', '!=', '')->select('bidang_fokus')
            ->when($request->has('provinsi'), function ($q) use ($request) {
                $q->where('provinsi', $request->provinsi);
            })
            ->groupBy('bidang_fokus')
            ->selectRaw('COUNT(*) as total')
            ->pluck('total', 'bidang_fokus');

        $byProvinsi = Penelitian::whereNotNull('judul')->where('judul', '!=', '')->select('provinsi')
            ->groupBy('provinsi')
            ->selectRaw('COUNT(*) as total')
            ->pluck('total', 'provinsi');

        $byTahun = Penelitian::whereNotNull('judul')->where('judul', '!=', '')->select('thn_pelaksanaan')
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
     * Mengekspor data penelitian dengan filter
     */
    public function export(Request $request)
    {
        try {
            $query = Penelitian::whereNotNull('judul')->where('judul', '!=', '');

            // Menerapkan filter (mendukung array)
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

            // Menerapkan pencarian jika ada
            if ($request->filled('search')) {
                $query->search($request->search);
            }

            // OPTIMIZED: Gunakan streaming response untuk menghindari kehabisan memori
            return response()->stream(function () use ($query) {
                echo '[';
                $first = true;

                $query->select(
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
                ->cursor()
                ->each(function ($item) use (&$first) {
                    if (!$first) {
                        echo ',';
                    }
                    echo json_encode($item);
                    $first = false;

                    // Bersihkan output buffer untuk mencegah penumpukan memori
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
            \Log::error('API Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
}
