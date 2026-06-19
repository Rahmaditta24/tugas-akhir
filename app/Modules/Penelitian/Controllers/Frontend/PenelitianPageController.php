<?php

namespace App\Modules\Penelitian\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Modules\Hilirisasi\Models\Hilirisasi;
use App\Modules\Pengabdian\Models\Pengabdian;
use App\Modules\Produk\Models\Produk;
use App\Modules\FasilitasLab\Models\FasilitasLab;
use App\Modules\Permasalahan\Models\PermasalahanProvinsi;
use App\Modules\Penelitian\Models\Penelitian;
use App\Modules\Penelitian\Services\PenelitianService;
use App\Services\ExportService;

class PenelitianPageController extends Controller
{
    protected PenelitianService $penelitianService;
    protected ExportService $exportService;

    public function __construct(PenelitianService $penelitianService, ExportService $exportService)
    {
        $this->penelitianService = $penelitianService;
        $this->exportService = $exportService;
    }

    public function index(Request $request)
    {
        $baseQuery = $this->penelitianService->getBaseQuery($request);

        $totalStats = $this->penelitianService->getStats($baseQuery, $request);
        $mapData = $this->penelitianService->getMapData($baseQuery, $request);
        $researches = $this->penelitianService->getResearchesList($baseQuery, $request);
        $filterOptions = $this->penelitianService->getFilterOptions();

        $isFiltered = $request->filled('search') || $request->filled('queries');

        return Inertia::render('Penelitian/Index', [
            'mapData' => $mapData,
            'researches' => $researches,
            'stats' => $totalStats,
            'filterOptions' => $filterOptions,
            'filters' => $request->all(),
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Penelitian'
        ]);
    }

    public function export(Request $request)
    {
        $query = $this->penelitianService->getBaseQuery($request);
        $query->orderBy('thn_pelaksanaan', 'desc')->orderBy('institusi');

        $columns = [
            'nama', 'nidn', 'institusi', 'jenis_pt', 'kategori_pt', 'klaster',
            'provinsi', 'kota', 'judul', 'skema', 'thn_pelaksanaan',
            'bidang_fokus', 'tema_prioritas'
        ];

        return $this->exportService->streamJsonExport($query, $columns);
    }

    public function getDetail($type, $id)
    {
        $data = match ($type) {
            'penelitian' => Penelitian::find($id),
            'hilirisasi' => Hilirisasi::find($id),
            'pengabdian' => Pengabdian::find($id),
            'produk' => Produk::find($id),
            'fasilitas-lab' => FasilitasLab::find($id),
            'permasalahan' => PermasalahanProvinsi::find($id),
            default => null
        };

        if (!$data) {
            return response()->json(['error' => 'Data not found'], 404);
        }

        return response()->json($data);
    }
}
