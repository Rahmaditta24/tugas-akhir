<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Penelitian;
use App\Models\Hilirisasi;
use App\Models\Pengabdian;
use App\Models\Produk;
use App\Models\FasilitasLab;
use App\Models\PermasalahanProvinsi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PenelitianPageController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Penelitian::whereNotNull('judul')->where('judul', '!=', '');

        if ($request->filled('bidang_fokus')) {
            $baseQuery->whereIn('bidang_fokus', (array) $request->bidang_fokus);
        }

        if ($request->filled('tema_prioritas')) {
            $baseQuery->whereIn('tema_prioritas', (array) $request->tema_prioritas);
        }

        if ($request->filled('kategori_pt')) {
            $baseQuery->whereIn('kategori_pt', (array) $request->kategori_pt);
        }

        if ($request->filled('klaster')) {
            $baseQuery->whereIn('klaster', (array) $request->klaster);
        }

        if ($request->filled('provinsi')) {
            $baseQuery->whereIn('provinsi', (array) $request->provinsi);
        }

        if ($request->filled('tahun')) {
            $baseQuery->whereIn('thn_pelaksanaan', (array) $request->tahun);
        }

        if ($request->filled('skema')) {
            $baseQuery->whereIn('skema', (array) $request->skema);
        }

        // Menerapkan pencarian sederhana jika tersedia
        if ($request->filled('search')) {
            $baseQuery->search($request->search);
        }

        // Menerapkan kueri tingkat lanjut untuk banyak baris
        if ($request->filled('queries')) {
            $queries = json_decode($request->queries, true);
            if (is_array($queries)) {
                $baseQuery->where(function ($q) use ($queries) {
                    foreach ($queries as $index => $row) {
                        $term = trim($row['term'] ?? '');
                        if (empty($term))
                            continue;

                        $field = $row['field'] ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        // Closure untuk menerapkan kondisi pada tiap kolom
                        $applyCondition = function ($query) use ($term, $field) {
                            if ($field === 'all') {
                                $query->where(function ($sub) use ($term) {
                                    $sub->where('judul', 'like', "%$term%")
                                        ->orWhere('nama', 'like', "%$term%")
                                        ->orWhere('institusi', 'like', "%$term%")
                                        ->orWhere('bidang_fokus', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match ($field) {
                                    'title' => 'judul',
                                    'university' => 'institusi',
                                    'researcher' => 'nama',
                                    'field' => 'bidang_fokus',
                                    'priorityTheme' => 'tema_prioritas',
                                    'category' => 'kategori_pt',
                                    'cluster' => 'klaster',
                                    default => 'judul'
                                };
                                $query->where($dbField, 'like', "%$term%");
                            }
                        };

                        if ($index === 0) {
                            $applyCondition($q);
                        } else {
                            if ($operator === 'OR') {
                                $q->orWhere(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
                            } elseif ($operator === 'AND NOT') {
                                $q->whereNot(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
                            } else { // AND
                                $q->where(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
                            }
                        }
                    }
                });
            }
        }

        $statsQuery = clone $baseQuery;
        // Kunci cache berbasis versi untuk keperluan statistik
        $v = (int) Cache::get('penelitian_cache_version', 2);
        $statsCacheKey = 'stats_penelitian_v' . $v . '_' . md5(json_encode($request->all()));

        $totalStats = Cache::remember($statsCacheKey, 3600, function () use ($statsQuery) {
            return [
                'totalResearch' => (clone $statsQuery)->count(),
                'totalUniversities' => (clone $statsQuery)->distinct('institusi')->count('institusi'),
                'totalProvinces' => (clone $statsQuery)->distinct('provinsi')->count('provinsi'),
                'totalFields' => (clone $statsQuery)->distinct('bidang_fokus')->count('bidang_fokus'),
            ];
        });

        // Menghapus GROUP_CONCAT, ambil detail saat diperlukan
        $cacheKey = 'map_data_cache_v7_' . md5(json_encode($request->all()));
        $mapData = Cache::remember($cacheKey, 300, function () use ($baseQuery) {
            DB::statement('SET SESSION group_concat_max_len = 1000000');
            $aggregatedData = (clone $baseQuery)
                ->select(
                    DB::raw('AVG(pt_latitude) as pt_latitude'),
                    DB::raw('AVG(pt_longitude) as pt_longitude'),
                    DB::raw('COUNT(*) as total_penelitian'),
                    DB::raw('institusi as institusi_name'),
                    DB::raw('MAX(provinsi) as provinsi'),
                    DB::raw('GROUP_CONCAT(COALESCE(bidang_fokus, "-") SEPARATOR "|") as all_fields'),
                    DB::raw('GROUP_CONCAT(CAST(id AS CHAR) SEPARATOR "|") as all_ids'),
                    DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
                    DB::raw('GROUP_CONCAT(COALESCE(skema, "-") SEPARATOR "|") as all_skema'),
                    DB::raw('GROUP_CONCAT(CAST(thn_pelaksanaan AS CHAR) SEPARATOR "|") as all_years'),
                    DB::raw('GROUP_CONCAT(COALESCE(tema_prioritas, "-") SEPARATOR "|") as all_themes'),
                    DB::raw('GROUP_CONCAT(COALESCE(jenis_pt, "-") SEPARATOR "|") as all_pt_types')
                )
                ->whereNotNull('pt_latitude')
                ->whereNotNull('pt_longitude')
                ->whereNotNull('institusi')
                ->groupBy('institusi')
                ->having('total_penelitian', '>', 0)
                ->get();

            $result = $aggregatedData->map(function ($item) {
                return [
                    'pt_latitude' => (float) $item->pt_latitude,
                    'pt_longitude' => (float) $item->pt_longitude,
                    'total_penelitian' => (int) $item->total_penelitian,
                    'institusi' => $item->institusi_name,
                    'provinsi' => $item->provinsi,
                    'bidang_fokus' => $item->all_fields,
                    'ids' => $item->all_ids,
                    'titles' => $item->all_titles,
                    'skema_list' => $item->all_skema,
                    'tahun_list' => $item->all_years,
                    'tema_list' => $item->all_themes,
                    'jenis_pt_list' => $item->all_pt_types,
                ];
            })->toArray();

            return collect($result)->values()->all();
        });

        // Untuk daftar list: hanya muat data jika terdapat pencarian atau filter aktif
        $isFiltered = $request->filled('bidang_fokus') ||
            $request->filled('tema_prioritas') ||
            $request->filled('kategori_pt') ||
            $request->filled('klaster') ||
            $request->filled('provinsi') ||
            $request->filled('tahun') ||
            $request->filled('skema') ||
            $request->filled('search') ||
            $request->filled('queries');

        $researches = $isFiltered
            ? (clone $baseQuery)->select(
                'id',
                'nama',
                'institusi',
                'judul',
                'bidang_fokus',
                'tema_prioritas',
                'thn_pelaksanaan',
                'skema',
                'provinsi'
            )
                ->limit(50) // Hanya muat 50 data pertama untuk menghemat performa
                ->get()
                ->values()
            : collect()->values(); // Koleksi kosong jika tidak ada pencarian/filter aktif

        // Dapatkan opsi filter (di-cache - menggunakan query DB secara raw demi performa)
        $filterOptions = [
            'bidangFokus' => Cache::remember('filter_bidang_fokus', 7200, function () {
                return DB::table('penelitian')
                    ->select('bidang_fokus')
                    ->whereNotNull('bidang_fokus')
                    ->distinct()
                    ->orderBy('bidang_fokus')
                    ->pluck('bidang_fokus')
                    ->filter()
                    ->values();
            }),
            'temaPrioritas' => Cache::remember('filter_tema_prioritas', 7200, function () {
                return DB::table('penelitian')
                    ->select('tema_prioritas')
                    ->whereNotNull('tema_prioritas')
                    ->distinct()
                    ->orderBy('tema_prioritas')
                    ->pluck('tema_prioritas')
                    ->filter()
                    ->values();
            }),
            'kategoriPT' => Cache::remember('filter_kategori_pt', 7200, function () {
                return DB::table('penelitian')
                    ->select('kategori_pt')
                    ->whereNotNull('kategori_pt')
                    ->distinct()
                    ->orderBy('kategori_pt')
                    ->pluck('kategori_pt')
                    ->filter()
                    ->values();
            }),
            'klaster' => Cache::remember('filter_klaster', 7200, function () {
                return DB::table('penelitian')
                    ->select('klaster')
                    ->whereNotNull('klaster')
                    ->distinct()
                    ->orderBy('klaster')
                    ->pluck('klaster')
                    ->filter()
                    ->values();
            }),
            'provinsi' => Cache::remember('global_provinces_final_v1', 86400, function () {
                $path = database_path('data/provinces.json');
                if (file_exists($path)) {
                    $data = json_decode(file_get_contents($path), true);
                    return collect($data)
                        ->map(fn($p) => trim($p['name']))
                        ->unique()
                        ->sort()
                        ->values()
                        ->all();
                }

                // Fallback hanya jika data lokal tidak ditemukan
                if (app()->environment('local')) {
                    try {
                        $response = Http::timeout(10)->retry(2, 1000)->withOptions([
                            'allow_redirects' => false
                        ])->get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
                        if ($response->successful()) {
                            return collect($response->json())
                                ->map(fn($p) => \Illuminate\Support\Str::title($p['name']))
                                ->sort()
                                ->values()
                                ->all();
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Failed to fetch provinces', ['error' => $e->getMessage()]);
                    }
                }
                return [];
            }),
            'tahun' => Cache::remember('filter_tahun', 7200, function () {
                return DB::table('penelitian')
                    ->select('thn_pelaksanaan')
                    ->whereNotNull('thn_pelaksanaan')
                    ->distinct()
                    ->orderBy('thn_pelaksanaan', 'desc')
                    ->pluck('thn_pelaksanaan')
                    ->filter()
                    ->values();
            }),
            'skema' => Cache::remember('filter_skema', 7200, function () {
                return DB::table('penelitian')
                    ->select('skema')
                    ->whereNotNull('skema')
                    ->distinct()
                    ->orderBy('skema')
                    ->pluck('skema')
                    ->filter()
                    ->values();
            }),
        ];

        return Inertia::render('Home', [
            'mapData' => $mapData,
            'researches' => $researches,
            'stats' => $totalStats,
            'filterOptions' => $filterOptions,
            'filters' => $request->all(),
            'isFiltered' => $isFiltered,
            'title' => 'Peta Persebaran Penelitian BIMA Indonesia - Penelitian'
        ]);
    }

    /**
     * Ekspor seluruh data tersaring untuk didownload dalam format Excel
     */
    public function export(Request $request)
    {
        // Bangun query dengan filter yang sama persis seperti pada index
        $query = Penelitian::whereNotNull('judul')->where('judul', '!=', '');

        // Terapkan filter
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

        if ($request->filled('skema')) {
            $query->whereIn('skema', (array) $request->skema);
        }

        // Terapkan pencarian jika tersedia
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Terapkan kueri tingkat lanjut multi baris
        if ($request->filled('queries')) {
            $queries = json_decode($request->queries, true);
            if (is_array($queries)) {
                $query->where(function ($q) use ($queries) {
                    foreach ($queries as $index => $row) {
                        $term = trim($row['term'] ?? '');
                        if (empty($term))
                            continue;

                        $field = $row['field'] ?? 'all';
                        $operator = strtoupper($row['operator'] ?? 'AND');

                        $applyCondition = function ($queryObj) use ($term, $field) {
                            if ($field === 'all') {
                                $queryObj->where(function ($sub) use ($term) {
                                    $sub->where('judul', 'like', "%$term%")
                                        ->orWhere('nama', 'like', "%$term%")
                                        ->orWhere('institusi', 'like', "%$term%")
                                        ->orWhere('bidang_fokus', 'like', "%$term%");
                                });
                            } else {
                                $dbField = match ($field) {
                                    'title' => 'judul',
                                    'university' => 'institusi',
                                    'researcher' => 'nama',
                                    'field' => 'bidang_fokus',
                                    'priorityTheme' => 'tema_prioritas',
                                    'category' => 'kategori_pt',
                                    'cluster' => 'klaster',
                                    default => 'judul'
                                };
                                $queryObj->where($dbField, 'like', "%$term%");
                            }
                        };

                        if ($index === 0) {
                            $applyCondition($q);
                        } else {
                            if ($operator === 'OR') {
                                $q->orWhere(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
                            } elseif ($operator === 'AND NOT') {
                                $q->whereNot(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
                            } else {
                                $q->where(function ($sub) use ($applyCondition) {
                                    $applyCondition($sub); });
                            }
                        }
                    }
                });
            }
        }

        try {
            // DIOPTIMALKAN: Gunakan respon streaming demi mencegah termuatnya seluruh data ke dalam memori
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

                        // Kosongkan buffer output agar memori tidak menumpuk
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
            \Log::error('Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
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
