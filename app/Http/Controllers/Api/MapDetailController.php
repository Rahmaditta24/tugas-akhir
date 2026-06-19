<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

use App\Services\PenelitianService;
use App\Services\HilirisasiService;
use App\Services\PengabdianService;
use App\Services\ProdukService;
use App\Services\FasilitasLabService;

class MapDetailController extends Controller
{
    public function getInstitusiDetail(Request $request, $type)
    {
        $institusi = $request->input('institusi');
        if (!$institusi) {
            return response()->json(['error' => 'Institusi is required'], 400);
        }

        $filtersHash = md5(json_encode($request->all()));
        $cacheKey = "map_detail_{$type}_" . md5($institusi) . "_{$filtersHash}";

        return Cache::remember($cacheKey, 1800, function () use ($request, $type, $institusi) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');

            switch ($type) {
                case 'penelitian':
                    return $this->getPenelitianDetail($request, $institusi);
                case 'hilirisasi':
                    return $this->getHilirisasiDetail($request, $institusi);
                case 'pengabdian':
                    return $this->getPengabdianDetail($request, $institusi);
                case 'produk':
                    return $this->getProdukDetail($request, $institusi);
                case 'fasilitas-lab':
                    return $this->getFasilitasLabDetail($request, $institusi);
                default:
                    return ['error' => 'Invalid type'];
            }
        });
    }

    private function getPenelitianDetail(Request $request, $institusi)
    {
        $service = app(PenelitianService::class);
        $baseQuery = $service->getBaseQuery($request);
        
        $item = clone $baseQuery
            ->where('institusi', $institusi)
            ->select(
                DB::raw('institusi as institusi_name'),
                DB::raw('MAX(provinsi) as provinsi'),
                DB::raw('COUNT(*) as total_penelitian'),
                DB::raw('GROUP_CONCAT(COALESCE(bidang_fokus, "-") SEPARATOR "|") as all_fields'),
                DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as all_ids'),
                DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
                DB::raw('GROUP_CONCAT(COALESCE(skema, "-") SEPARATOR "|") as all_skema'),
                DB::raw('GROUP_CONCAT(CAST(thn_pelaksanaan AS CHAR) SEPARATOR "|") as all_years'),
                DB::raw('GROUP_CONCAT(COALESCE(tema_prioritas, "-") SEPARATOR "|") as all_themes'),
                DB::raw('GROUP_CONCAT(COALESCE(jenis_pt, "-") SEPARATOR "|") as all_pt_types')
            )
            ->groupBy('institusi')
            ->first();

        if (!$item) return null;

        return [
            'institusi' => $item->institusi_name,
            'provinsi' => $item->provinsi,
            'total_penelitian' => (int) $item->total_penelitian,
            'bidang_fokus' => $item->all_fields,
            'ids' => $item->all_ids,
            'titles' => $item->all_titles,
            'skema_list' => $item->all_skema,
            'tahun_list' => $item->all_years,
            'tema_list' => $item->all_themes,
            'jenis_pt_list' => $item->all_pt_types,
        ];
    }

    private function getHilirisasiDetail(Request $request, $institusi)
    {
        $service = app(HilirisasiService::class);
        $baseQuery = $service->getBaseQuery($request);
        
        $item = clone $baseQuery
            ->where('perguruan_tinggi', $institusi)
            ->select(
                DB::raw('perguruan_tinggi as institusi_name'),
                DB::raw('MAX(provinsi) as provinsi'),
                DB::raw('COUNT(*) as total_hilirisasi'),
                DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as all_ids'),
                DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
                DB::raw('GROUP_CONCAT(COALESCE(skema, "-") SEPARATOR "|") as all_skema'),
                DB::raw('GROUP_CONCAT(CAST(tahun AS CHAR) SEPARATOR "|") as all_years')
            )
            ->groupBy('perguruan_tinggi')
            ->first();

        if (!$item) return null;

        return [
            'institusi' => $item->institusi_name,
            'provinsi' => $item->provinsi,
            'total_hilirisasi' => (int) $item->total_hilirisasi,
            'ids' => $item->all_ids,
            'titles' => $item->all_titles,
            'skema_list' => $item->all_skema,
            'tahun_list' => $item->all_years,
            'bidang_fokus' => '-',
        ];
    }

    private function getPengabdianDetail(Request $request, $institusi)
    {
        $service = app(PengabdianService::class);
        $baseQuery = $service->getBaseQuery($request);
        
        $item = clone $baseQuery
            ->where('nama_institusi', $institusi)
            ->select(
                DB::raw('nama_institusi as institusi_name'),
                DB::raw('MAX(prov_pt) as provinsi'),
                DB::raw('COUNT(*) as total_penelitian'),
                DB::raw('GROUP_CONCAT(COALESCE(bidang_fokus, nama_skema, "-") SEPARATOR "|") as all_fields'),
                DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as all_ids'),
                DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
                DB::raw('GROUP_CONCAT(COALESCE(nama_skema, "-") SEPARATOR "|") as all_skema'),
                DB::raw('GROUP_CONCAT(CAST(thn_pelaksanaan_kegiatan AS CHAR) SEPARATOR "|") as all_years'),
                DB::raw('GROUP_CONCAT(COALESCE(bidang_teknologi_inovasi, "-") SEPARATOR "|") as all_themes'),
                DB::raw('GROUP_CONCAT(COALESCE(ptn_pts, "-") SEPARATOR "|") as all_pt_types')
            )
            ->groupBy('nama_institusi')
            ->first();

        if (!$item) return null;

        return [
            'institusi' => $item->institusi_name,
            'provinsi' => $item->provinsi,
            'total_pengabdian' => (int) $item->total_penelitian,
            'bidang_fokus' => $item->all_fields,
            'ids' => $item->all_ids,
            'titles' => $item->all_titles,
            'skema_list' => $item->all_skema,
            'tahun_list' => $item->all_years,
            'tema_list' => $item->all_themes,
            'jenis_pt_list' => $item->all_pt_types,
        ];
    }

    private function getProdukDetail(Request $request, $institusi)
    {
        $service = app(ProdukService::class);
        $baseQuery = $service->getBaseQuery($request);
        
        $item = clone $baseQuery
            ->where('institusi', $institusi)
            ->select(
                DB::raw('COUNT(*) as total_penelitian'),
                DB::raw('institusi as institusi_name'),
                DB::raw('MAX(provinsi) as provinsi'),
                DB::raw('GROUP_CONCAT(COALESCE(bidang, "-") ORDER BY id SEPARATOR "|") as all_fields'),
                DB::raw('GROUP_CONCAT(CAST(id AS CHAR) ORDER BY id SEPARATOR "|") as all_ids'),
                DB::raw('GROUP_CONCAT(COALESCE(nama_produk, "-") ORDER BY id SEPARATOR "|") as all_titles'),
                DB::raw('GROUP_CONCAT(COALESCE(nama_inventor, "-") ORDER BY id SEPARATOR "|") as all_researchers'),
                DB::raw('GROUP_CONCAT(COALESCE(tkt, "-") ORDER BY id SEPARATOR "|") as all_years')
            )
            ->groupBy('institusi')
            ->first();

        if (!$item) return null;

        return [
            'institusi' => $item->institusi_name,
            'provinsi' => $item->provinsi,
            'total_penelitian' => (int) $item->total_penelitian,
            'bidang_fokus' => $item->all_fields,
            'ids' => $item->all_ids,
            'titles' => $item->all_titles,
            'all_researchers' => $item->all_researchers,
            'tahun_list' => $item->all_years, 
            'tkt_list' => $item->all_years,   
            'isProduk' => true
        ];
    }

    private function getFasilitasLabDetail(Request $request, $institusi)
    {
        $service = app(FasilitasLabService::class);
        $baseQuery = $service->getBaseQuery($request);
        
        $rows = clone $baseQuery
            ->where('institusi', $institusi)
            ->select('institusi', 'kode_universitas', 'latitude', 'longitude', 'provinsi', 'nama_laboratorium', 'nama_alat')
            ->get();

        if ($rows->isEmpty()) return null;

        $total = 0;
        $labNames = [];
        $toolNames = [];

        foreach ($rows as $item) {
            $total++;
            if ($item->nama_laboratorium) {
                $labNames[] = $item->nama_laboratorium;
            }
            if ($item->nama_alat) {
                foreach (explode('|', $item->nama_alat) as $tool) {
                    $tool = trim($tool);
                    if ($tool && !in_array($tool, $toolNames)) {
                        $toolNames[] = $tool;
                    }
                }
            }
        }
        
        sort($toolNames);
        
        $first = $rows->first();
        
        return [
            'institusi'        => $first->institusi,
            'kode_universitas' => $first->kode_universitas,
            'pt_latitude'      => (float) $first->latitude,
            'pt_longitude'     => (float) $first->longitude,
            'provinsi'         => $first->provinsi,
            'total_penelitian' => $total,
            'lab_list'         => implode('|', $labNames),
            'tool_list'        => implode('|', $toolNames),
            'isFasilitasLab'   => true,
        ];
    }
}
