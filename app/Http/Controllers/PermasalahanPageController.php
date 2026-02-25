<?php

namespace App\Http\Controllers;

use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use App\Models\Penelitian;
use Inertia\Inertia;

class PermasalahanPageController extends Controller
{
    public function index()
    {
        // Province coordinates lookup
        $provinceCoords = $this->getProvinceCoordinates();
        
        // Get all permasalahan data with coordinates
        $provinsiData = PermasalahanProvinsi::all()->map(function ($item) use ($provinceCoords) {
            // Normalize province name: lowercase, trim, remove extra spaces
            $cleanProv = strtolower(trim(preg_replace('/\s+/', ' ', $item->provinsi)));
            $coords = $provinceCoords[$cleanProv] ?? null;
            
            // Debug fallback for Kalimantan Barat if still missing
            if (!$coords && str_contains($cleanProv, 'kalimantan') && str_contains($cleanProv, 'barat')) {
                 $coords = [0.0, 109.32]; // Force coords for Kalbar
            }

            return [
                'id' => $item->id,
                'provinsi' => $item->provinsi,
                'jenis_permasalahan' => $item->jenis_permasalahan,
                'nilai' => $item->nilai, // Raw value
                'satuan' => $item->satuan,
                'metrik' => $item->metrik,
                'tahun' => $item->tahun,
                'pt_latitude' => $coords ? $coords[0] : null,
                'pt_longitude' => $coords ? $coords[1] : null,
            ];
        })->filter(fn($item) => !is_null($item['pt_latitude']) && !is_null($item['pt_longitude']));

        $kabupatenData = PermasalahanKabupaten::all()->map(function ($item) use ($provinceCoords) {
            // For kabupaten, use provinsi coordinates as fallback
            $cleanProv = strtolower(trim(preg_replace('/\s+/', ' ', $item->provinsi)));
            $coords = $provinceCoords[$cleanProv] ?? null;

            // Debug fallback
            if (!$coords && str_contains($cleanProv, 'kalimantan') && str_contains($cleanProv, 'barat')) {
                 $coords = [0.0, 109.32];
            }
            
            return [
                'id' => $item->id,
                'kabupaten_kota' => $item->kabupaten_kota,
                'provinsi' => $item->provinsi,
                'jenis_permasalahan' => $item->jenis_permasalahan,
                'nilai' => $item->nilai,
                'satuan' => $item->satuan,
                'tahun' => $item->tahun,
                'pt_latitude' => $coords ? $coords[0] : null,
                'pt_longitude' => $coords ? $coords[1] : null,
            ];
        })->filter(fn($item) => !is_null($item['pt_latitude']) && !is_null($item['pt_longitude']));

        // Combine both datasets
        $mapData = $provinsiData->merge($kabupatenData)->values()->all();

        // Choropleth data: group by jenis_permasalahan → [{provinsi, nilai, satuan, metrik, tahun}]
        $permasalahanStats = PermasalahanProvinsi::all()
            ->groupBy('jenis_permasalahan')
            ->map(fn($items) => $items->map(fn($item) => [
                'provinsi' => $item->provinsi,
                'nilai'    => $item->nilai,
                'satuan'   => $item->satuan,
                'metrik'   => $item->metrik,
                'tahun'    => $item->tahun,
            ])->values()->toArray())
            ->toArray();

        $jenisPermasalahan = array_keys($permasalahanStats);

        // General penelitian list (first 50, ordered latest)
        $researches = Penelitian::select(
                'id', 'judul', 'nidn', 'nuptk', 'nama', 'institusi',
                'provinsi', 'skema', 'thn_pelaksanaan as tahun',
                'kategori_pt', 'klaster'
            )
            ->whereNotNull('judul')
            ->orderByDesc('thn_pelaksanaan')
            ->limit(50)
            ->get()
            ->values();

        return Inertia::render('Permasalahan', [
            'mapData'            => $mapData,
            'permasalahanStats'  => $permasalahanStats,
            'jenisPermasalahan'  => $jenisPermasalahan,
            'researches'         => $researches,
            'stats' => [
                'totalResearch' => PermasalahanProvinsi::count() + PermasalahanKabupaten::count(),
                'totalUniversities' => 0, // Not applicable for Permasalahan
                'totalProvinces' => PermasalahanProvinsi::distinct('provinsi')->count('provinsi'),
                'totalFields' => PermasalahanProvinsi::distinct('jenis_permasalahan')->count('jenis_permasalahan') + 
                                 PermasalahanKabupaten::distinct('jenis_permasalahan')->count('jenis_permasalahan'),
            ],
        ]);
    }

    private function getProvinceCoordinates()
    {
        return [
            'aceh' => [5.55, 95.32],
            'sumatera utara' => [3.595, 98.672],
            'sumatera barat' => [-0.949, 100.354],
            'riau' => [0.507, 101.447],
            'kepulauan riau' => [1.082, 104.03],
            'jambi' => [-1.611, 103.615],
            'sumatera selatan' => [-3.0, 104.75],
            'bengkulu' => [-3.795, 102.259],
            'lampung' => [-5.429, 105.262],
            'kepulauan bangka belitung' => [-2.1, 106.1],
            'banten' => [-6.4, 106.13],
            'dki jakarta' => [-6.2, 106.816],
            'jawa barat' => [-6.914, 107.609],
            'jawa tengah' => [-7.0, 110.416],
            'di yogyakarta' => [-7.795, 110.369],
            'jawa timur' => [-7.25, 112.75],
            'bali' => [-8.409, 115.188],
            'nusa tenggara barat' => [-8.583, 116.116],
            'nusa tenggara timur' => [-10.177, 123.607],
            'kalimantan barat' => [0.0, 109.32],
            'kalimantan tengah' => [-2.21, 113.92],
            'kalimantan selatan' => [-3.319, 114.592],
            'kalimantan timur' => [-0.502, 117.153],
            'kalimantan utara' => [3.0, 116.0],
            // Kalimantan Aliases
            'prov. kalimantan barat' => [0.0, 109.32],
            'kalbar' => [0.0, 109.32],
            'kaltim' => [-0.502, 117.153],
            'kalsel' => [-3.319, 114.592],
            'kalteng' => [-2.21, 113.92],
            'kalut' => [3.0, 116.0],
            'sulawesi utara' => [1.48, 124.84],
            'gorontalo' => [0.54, 123.06],
            'sulawesi tengah' => [-0.9, 119.87],
            'sulawesi barat' => [-2.67, 118.86],
            'sulawesi selatan' => [-5.14, 119.41],
            'sulawesi tenggara' => [-4.0, 122.0], // Added missing province
            'maluku' => [-3.7, 128.18],
            'maluku utara' => [0.79, 127.38],
            'papua' => [-2.53, 140.71],
            'papua barat' => [-0.87, 134.08],
            'papua barat daya' => [-0.92, 131.28],
            'papua selatan' => [-6.0, 140.0],
            'papua tengah' => [-3.47, 138.08],
            'papua pegunungan' => [-4.0, 138.0],
            // Aliases for robustness
            'daerah istimewa yogyakarta' => [-7.795, 110.369],
            'yogyakarta' => [-7.795, 110.369],
            'diy' => [-7.795, 110.369],
            'jakarta' => [-6.2, 106.816],
            'jakarta raya' => [-6.2, 106.816],
        ];
    }
}


