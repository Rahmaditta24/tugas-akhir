<?php

namespace App\Http\Controllers;

use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use App\Models\Penelitian;
use App\Models\Pengabdian;
use App\Models\Hilirisasi;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class PermasalahanPageController extends Controller
{
    public function index()
    {
        $dataType = request('dataType', 'Sampah');
        $bubbleType = request('bubbleType', 'Penelitian');
        $viewMode = request('viewMode', 'provinsi');

        // Province coordinates lookup
        $provinceCoords = $this->getProvinceCoordinates();

        // 1. Get Permasalahan (Problem) data for the choropleth map (Polygons)
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

        // Standardize keys for frontend (Title Case)
        $formattedPermasalahanStats = [];
        foreach ($permasalahanStats as $key => $value) {
            $formattedPermasalahanStats[ucwords(str_replace('_', ' ', $key))] = $value;
        }

        $jenisPermasalahan = array_keys($formattedPermasalahanStats);

        // 2. Filter data for bubbles
        $keywords = $this->getKeywordsForDataType($dataType);
        $mapData = collect();
        $researches = collect();
        $filteredStats = [];

        if ($bubbleType === 'Data Permasalahan') {
            // Markers represent the problem metrics (e.g. tons of waste)
            $mapData = PermasalahanKabupaten::where('jenis_permasalahan', strtolower(str_replace(' ', '_', $dataType)))
                ->get()
                ->map(function($item) {
                    return [
                        'institusi' => $item->kabupaten_kota, // Using city name as identifier
                        'provinsi' => $item->provinsi,
                        'total_penelitian' => $item->nilai, // 'total_penelitian' here acts as the 'value' for sizing
                        'nilai' => $item->nilai,
                        'satuan' => $item->satuan,
                        'pt_latitude' => $item->latitude,
                        'pt_longitude' => $item->longitude,
                        'is_problem_data' => true
                    ];
                });
            
            // For the research list and stats, we still use keywords filtered research
            // to show "what research is related to this problem"
            $researchQuery = Penelitian::query();
            if (!empty($keywords)) {
                $researchQuery->where(function($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        $q->orWhere('judul', 'LIKE', '%' . $keyword . '%');
                    }
                });
            }
            $researches = (clone $researchQuery)->orderByDesc('thn_pelaksanaan')->limit(50)->get()->map(fn($item) => $this->mapResearchItem($item, 'Penelitian'));
            $filteredStats = [
                'totalResearch' => $researchQuery->count(),
                'totalUniversities' => $researchQuery->distinct('institusi')->count('institusi'),
                'totalProvinces' => $researchQuery->distinct('provinsi')->count('provinsi'),
                'totalFields' => $researchQuery->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        } else {
            // Base query based on bubbleType (Research/Pengabdian/Hilirisasi)
            if ($bubbleType === 'Pengabdian') {
                $query = Pengabdian::query();
                $institusiField = 'nama_institusi';
                $provField = 'prov_pt';
                $latField = 'pt_latitude';
                $lngField = 'pt_longitude';
            } elseif ($bubbleType === 'Hilirisasi') {
                $query = Hilirisasi::query();
                $institusiField = 'perguruan_tinggi';
                $provField = 'provinsi';
                $latField = 'pt_latitude';
                $lngField = 'pt_longitude';
            } else {
                $query = Penelitian::query();
                $institusiField = 'institusi';
                $provField = 'provinsi';
                $latField = 'pt_latitude';
                $lngField = 'pt_longitude';
            }

            // Apply keywords filter (Robust Case Normalization)
            if (!empty($keywords)) {
                $query->where(function($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        $q->orWhere('judul', 'LIKE', '%' . $keyword . '%');
                    }
                });
            }

            // Apply Request Filters
            $this->applyRequestFilters($query, $bubbleType);

            // 3. Prepare data for Markers (Aggregation by Institution)
            // Using REAL coordinates from the DB instead of province approximations
            $mapData = (clone $query)
                ->select(
                    $institusiField . ' as institusi', 
                    $provField . ' as provinsi', 
                    \DB::raw('count(*) as total_penelitian'),
                    \DB::raw('MAX(' . $latField . ') as pt_latitude'),
                    \DB::raw('MAX(' . $lngField . ') as pt_longitude')
                )
                ->groupBy($institusiField, $provField)
                ->get()
                ->map(function($item) {
                    return [
                        'institusi' => $item->institusi,
                        'provinsi' => $item->provinsi,
                        'total_penelitian' => $item->total_penelitian,
                        'pt_latitude' => $item->pt_latitude,
                        'pt_longitude' => $item->pt_longitude,
                        'is_problem_data' => false
                    ];
                })
                ->filter(fn($item) => !is_null($item['pt_latitude']) && !is_null($item['pt_longitude']))
                ->values();

            $researches = (clone $query)
                ->orderByDesc($bubbleType === 'Hilirisasi' ? 'tahun' : 'thn_pelaksanaan')
                ->limit(50)
                ->get()
                ->map(fn($item) => $this->mapResearchItem($item, $bubbleType));
            
            $filteredStats = [
                'totalResearch' => (clone $query)->count(),
                'totalUniversities' => (clone $query)->distinct($institusiField)->count($institusiField),
                'totalProvinces' => (clone $query)->distinct($provField)->count($provField),
                'totalFields' => $bubbleType === 'Hilirisasi' ? 0 : (clone $query)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        }


        // 5. Global Stats (cached) for the Cards
        $globalStats = Cache::remember('permasalahan_global_all_types', 3600, function() {
            return [
                'Penelitian' => [
                    'totalResearch' => Penelitian::count(),
                    'totalUniversities' => Penelitian::distinct('institusi')->count('institusi'),
                    'totalProvinces' => Penelitian::distinct('provinsi')->count('provinsi'),
                    'totalFields' => Penelitian::distinct('bidang_fokus')->count('bidang_fokus'),
                ],
                'Pengabdian' => [
                    'totalResearch' => Pengabdian::count(),
                    'totalUniversities' => Pengabdian::distinct('nama_institusi')->count('nama_institusi'),
                    'totalProvinces' => Pengabdian::distinct('prov_pt')->count('prov_pt'),
                    'totalFields' => Pengabdian::distinct('bidang_fokus')->count('bidang_fokus'),
                ],
                'Hilirisasi' => [
                    'totalResearch' => Hilirisasi::count(),
                    'totalUniversities' => Hilirisasi::distinct('perguruan_tinggi')->count('perguruan_tinggi'),
                    'totalProvinces' => Hilirisasi::distinct('provinsi')->count('provinsi'),
                    'totalFields' => Hilirisasi::distinct('skema')->count('skema'),
                ],
            ];
        });

        return Inertia::render('Permasalahan', [
            'mapData'            => $mapData,
            'permasalahanStats'  => $formattedPermasalahanStats,
            'jenisPermasalahan'  => $jenisPermasalahan,
            'researches'         => $researches,
            'stats'              => [
                'Penelitian' => $globalStats['Penelitian'],
                'Pengabdian' => $globalStats['Pengabdian'],
                'Hilirisasi' => $globalStats['Hilirisasi'],
                'Data Permasalahan' => $bubbleType === 'Data Permasalahan' ? $filteredStats : [],
            ],
            'filters'            => [
                'dataType' => $dataType,
                'bubbleType' => $bubbleType,
                'viewMode' => $viewMode,
                'provinsi' => request('provinsi'),
                'tahun' => request('tahun'),
                'bidang_fokus' => request('bidang_fokus'),
            ]
        ]);
    }

    private function mapResearchItem($item, $bubbleType)
    {
        return [
            'id' => $item->id,
            'judul' => ($bubbleType === 'Hilirisasi') ? $item->judul_penelitian : $item->judul,
            'nama' => ($bubbleType === 'Hilirisasi') ? ($item->nama_ketua ?? '-') : $item->nama,
            'institusi' => ($bubbleType === 'Pengabdian') ? $item->nama_institusi : (($bubbleType === 'Hilirisasi') ? $item->perguruan_tinggi : $item->institusi),
            'provinsi' => ($bubbleType === 'Pengabdian') ? $item->prov_pt : $item->provinsi,
            'bidang_fokus' => $item->bidang_fokus ?? ($item->skema ?? '-'),
            'tema_prioritas' => $item->tema_prioritas ?? null,
            'tahun' => ($bubbleType === 'Penelitian' || $bubbleType === 'Pengabdian') ? $item->thn_pelaksanaan : $item->tahun,
            'kategori_pt' => $item->kategori_pt ?? null,
            'klaster' => $item->klaster ?? null,
        ];
    }

    private function applyRequestFilters($query, $bubbleType)
    {
        if (request('provinsi')) {
            $provField = $bubbleType === 'Pengabdian' ? 'prov_pt' : 'provinsi';
            if (is_array(request('provinsi'))) {
                $query->whereIn($provField, request('provinsi'));
            } else {
                $query->where($provField, request('provinsi'));
            }
        }
        
        if (request('tahun')) {
            $yearField = $bubbleType === 'Penelitian' ? 'thn_pelaksanaan' : ($bubbleType === 'Pengabdian' ? 'thn_pelaksanaan' : 'tahun');
            if (is_array(request('tahun'))) {
                $query->whereIn($yearField, request('tahun'));
            } else {
                $query->where($yearField, request('tahun'));
            }
        }

        if (request('bidang_fokus')) {
            if (is_array(request('bidang_fokus'))) {
                $query->whereIn('bidang_fokus', request('bidang_fokus'));
            } else {
                $query->where('bidang_fokus', request('bidang_fokus'));
            }
        }
    }

    private function getKeywordsForDataType($dataType)
    {
        $dataType = ucwords(strtolower(str_replace(['_', '-'], ' ', $dataType)));
        
        $map = [
            'Sampah' => [
                'sampah', 'limbah', 'waste', 'recycle', 'daur ulang', 'plastic', 'plastik', 'pencemaran', 
                'polusi', 'lingkungan', 'ekosistem', 'sanitasi', 'kehutanan', 'konservasi', 'sungai', 'laut'
            ],
            'Stunting' => [
                'stunting', 'tengkes', 'kerdil', 'gizi', 'pendek', 'balita', 'bayi', 'anak', 'ibu hamil', 
                'puskesmas', 'posyandu', 'pertumbuhan', 'perkembangan', 'nutrisi'
            ],
            'Gizi Buruk' => [
                'gizi buruk', 'malnutrisi', 'nutrisi', 'stunting', 'kurus', 'vitamin', 'protein', 'karbo', 
                'lemak', 'kesehatan', 'medis', 'klinis', 'asupan', 'pola makan'
            ],
            'Krisis Listrik' => [
                'listrik', 'energi', 'saidi', 'saifi', 'power', 'pembangkit', 'pln', 'panel', 'solar', 
                'baterai', 'tegangan', 'arus', 'mikrohidro', 'angin', 'elektro', 'otomat'
            ],
            'Ketahanan Pangan' => [
                'pangan', 'makanan', 'food', 'beras', 'pertanian', 'pasokan pangan', 'padi', 'jagung', 
                'kedelai', 'ternak', 'ikan', 'panen', 'pupuk', 'hama', 'sawah', 'irigasi', 'tani'
            ],
        ];

        return $map[$dataType] ?? [];
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


