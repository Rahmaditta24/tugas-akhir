<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Penelitian;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Cache;

class PenelitianController extends Controller
{
    private function isPTN($name)
    {
        if (empty($name))
            return false;
        $name = strtolower($name);
        if (strpos($name, 'negeri') !== false)
            return true;
        if (strpos($name, 'politeknik') !== false && strpos($name, 'negeri') !== false)
            return true;
        if (strpos($name, 'uin ') !== false || strpos($name, 'universitas islam negeri') !== false)
            return true;
        if (strpos($name, 'iain ') !== false || strpos($name, 'institut agama islam negeri') !== false)
            return true;
        if (strpos($name, 'stain ') !== false || strpos($name, 'sekolah tinggi agama islam negeri') !== false)
            return true;
        $bigPTNs = [
            'universitas indonesia',
            'institut teknologi bandung',
            'universitas gadjah mada',
            'institut pertanian bogor',
            'ipb university',
            'universitas padjadjaran',
            'universitas airlangga',
            'universitas diponegoro',
            'universitas brawijaya',
            'universitas hasanuddin',
            'universitas sebelas maret',
            'institut teknologi sepuluh nopember',
            'universitas sumatera utara',
            'universitas lampung',
            'universitas andalas',
            'universitas sriwijaya',
            'universitas syiah kuala',
            'universitas riau',
            'universitas udayana',
            'universitas jember',
            'universitas jenderal soedirman',
            'universitas lambung mangkurat',
            'universitas sam ratulangi',
            'universitas tanjungpura',
            'universitas nusa cendana',
            'universitas palangka raya',
            'universitas tadulako',
            'universitas pattimura',
            'universitas cenderawasih',
            'universitas mulawarman',
            'universitas pendidikan indonesia',
            'universitas pendidikan ganesha',
            'universitas sultan ageng tirtayasa',
            'upn \"veteran\"',
            'universitas tidar',
            'universitas teuku umar',
            'universitas borneo tarakan',
            'universitas bangka belitung',
            'universitas musamus',
            'universitas malikussaleh',
            'universitas samudra',
            'universitas siliwangi',
            'universitas sembilanbelas november',
            'universitas singaperbangsa',
            'universitas sulawesi barat',
            'universitas papua',
            'institut seni indonesia',
            'institut seni budaya indonesia'
        ];
        foreach ($bigPTNs as $ptn) {
            if (strpos($name, $ptn) !== false)
                return true;
        }
        return false;
    }

    private function formatName($name)
    {
        if (empty($name))
            return $name;
        $name = trim($name);
        if ($name !== mb_strtoupper($name) && $name !== mb_strtolower($name)) {
            return $name;
        }
        $formatted = mb_convert_case($name, MB_CASE_TITLE, "UTF-8");
        $replacements = [
            'S.pd' => 'S.Pd',
            'M.pd' => 'M.Pd',
            'S.t' => 'S.T',
            'M.t' => 'M.T',
            'S.h' => 'S.H',
            'M.h' => 'M.H',
            'S.e' => 'S.E',
            'M.m' => 'M.M',
            'S.si' => 'S.Si',
            'M.si' => 'M.Si',
            'S.sos' => 'S.Sos',
            'M.sos' => 'M.Sos',
            'S.kom' => 'S.Kom',
            'M.kom' => 'M.Kom',
            'S.p' => 'S.P',
            'M.p' => 'M.P',
            'S.pt' => 'S.Pt',
            'M.pt' => 'M.Pt',
            'S.hut' => 'S.Hut',
            'M.hut' => 'M.Hut',
            'S.km' => 'S.KM',
            'M.kes' => 'M.Kes',
            'S.kep' => 'S.Kep',
            'M.kep' => 'M.Kep',
            'Ph.d' => 'Ph.D',
            'M.hum' => 'M.Hum',
            'S.hum' => 'S.Hum',
            'M.ag' => 'M.Ag',
            'S.ag' => 'S.Ag',
            'M.fil' => 'M.Fil',
            'S.fil' => 'S.Fil',
            'M.ak' => 'M.Ak',
            'S.ak' => 'S.Ak',
            'M.psi' => 'M.Psi',
            'S.psi' => 'S.Psi',
            'M.ti' => 'M.TI',
            'S.ti' => 'S.TI',
            'M.eng' => 'M.Eng',
            'S.eng' => 'S.Eng',
            'M.sc' => 'M.Sc',
            'B.sc' => 'B.Sc',
            'Msi' => 'MSi',
            'Spd' => 'SPd',
        ];
        foreach ($replacements as $search => $replace) {
            $formatted = preg_replace('/\b' . preg_quote($search) . '\b/u', $replace, $formatted);
            $formatted = str_replace($search, $replace, $formatted);
        }
        return $formatted;
    }

    public function index(Request $request)
    {
        $query = Penelitian::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('institusi', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%")
                    ->orWhere('provinsi', 'like', "%{$search}%")
                    ->orWhere('skema', 'like', "%{$search}%")
                    ->orWhere('bidang_fokus', 'like', "%{$search}%")
                    ->orWhere('tema_prioritas', 'like', "%{$search}%")
                    ->orWhere('thn_pelaksanaan', 'like', "%{$search}%");
            });
        }

        // Column filters
        if ($request->filled('filters')) {
            $filters = $request->filters;
            foreach ($filters as $key => $value) {
                if (!empty($value)) {
                    // Check if column exists in table to avoid errors, or whitelist
                    if (
                        in_array($key, [
                            'nama',
                            'nidn',
                            'nuptk',
                            'institusi',
                            'judul',
                            'skema',
                            'thn_pelaksanaan',
                            'bidang_fokus',
                            'tema_prioritas',
                            'provinsi',
                            'kota',
                            'jenis_pt',
                            'kategori_pt'
                        ])
                    ) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        // Per page
        $perPage = (int) $request->get('perPage', 20);
        if ($perPage < 10) {
            $perPage = 10;
        }
        if ($perPage > 100) {
            $perPage = 100;
        }

        // Whitelisted sorting and pagination
        $allowedSorts = ['id', 'nama', 'nidn', 'institusi', 'judul', 'skema', 'thn_pelaksanaan', 'bidang_fokus', 'tema_prioritas', 'provinsi'];
        $sort = in_array($request->get('sort'), $allowedSorts, true) ? $request->get('sort') : 'thn_pelaksanaan';
        $direction = $request->get('direction') === 'asc' ? 'asc' : 'desc';

        // Cache Versioning for instant invalidation
        $v = Cache::get('penelitian_admin_v', 1);
        $cacheKey = 'penelitian_admin_v' . $v . '_' . md5(json_encode($request->all()));

        $data = Cache::remember($cacheKey, 600, function () use ($query, $perPage, $sort, $direction) {
            $penelitian = $query
                ->orderBy($sort, $direction)
                ->orderBy('nama', 'asc')
                ->paginate($perPage)
                ->withQueryString();

            $penelitian->getCollection()->transform(function ($item) {
                $item->nama = $this->formatName($item->nama);
                return $item;
            });

            return $penelitian;
        });

        // Cache statistics separately (longer duration)
        $stats = Cache::remember('penelitian_admin_stats', 3600, function () {
            return [
                'total' => Penelitian::count(),
                'thisYear' => Penelitian::whereYear('created_at', date('Y'))->count(),
                'withCoordinates' => Penelitian::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
            ];
        });

        return Inertia::render('Admin/Penelitian/Index', [
            'penelitian' => $data,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'columns' => $request->filters ?? [], // Pass column filters back
                'perPage' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Penelitian/Create');
    }

    public function store(Request $request)
    {
        $request->merge([
            'pt_latitude' => is_string($request->pt_latitude) ? str_replace(',', '.', $request->pt_latitude) : $request->pt_latitude,
            'pt_longitude' => is_string($request->pt_longitude) ? str_replace(',', '.', $request->pt_longitude) : $request->pt_longitude,
            'nidn' => is_string($request->nidn) ? ltrim(trim($request->nidn), "'") : $request->nidn,
            'nuptk' => is_string($request->nuptk) ? ltrim(trim($request->nuptk), "'") : $request->nuptk,
        ]);
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'institusi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric'],
            'pt_longitude' => ['required', 'numeric'],
            'judul' => ['required', 'string'],
            'thn_pelaksanaan' => ['required', 'integer'],
            'bidang_fokus' => ['nullable', 'string', 'max:255'],
            'tema_prioritas' => ['nullable', 'string', 'max:255'],
        ]);

        Penelitian::create($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.penelitian.index')->with('success', 'Data ditambahkan');
    }

    public function edit(Request $request, Penelitian $penelitian)
    {
        // Clean data from DB
        $clean = fn($v) => is_string($v) ? ltrim(trim($v), "'") : $v;
        $penelitian->nidn = $clean($penelitian->nidn);
        $penelitian->nuptk = $clean($penelitian->nuptk);
        $penelitian->nama = $clean($penelitian->nama);
        $penelitian->judul = $clean($penelitian->judul);
        $penelitian->institusi = $clean($penelitian->institusi);
        $penelitian->kode_pt = $clean($penelitian->kode_pt);
        $penelitian->provinsi = $clean($penelitian->provinsi);
        return Inertia::render('Admin/Penelitian/Edit', [
            'penelitian' => $penelitian,
            'params' => $request->only(['page', 'search', 'perPage', 'filters'])
        ]);
    }

    public function update(Request $request, Penelitian $penelitian)
    {
        $penelitian->update($request->all());
        $this->clearModuleCache();
        return redirect()->route('admin.penelitian.index')->with('success', 'Data penelitian berhasil diperbarui');
    }

    public function destroy(Penelitian $penelitian)
    {
        $penelitian->delete();
        $this->clearModuleCache();
        return back()->with('success', 'Data penelitian berhasil dihapus');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $count = Penelitian::whereIn('id', $request->ids)->delete();
        $this->clearModuleCache();
        return back()->with('success', "{$count} data penelitian berhasil dihapus.");
    }



    public function exportCsv(Request $request)
    {
        // Allow large exports to complete
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        // Build query using same filters as index
        $query = Penelitian::select(
            'id',
            'nama',
            'nidn',
            'nuptk',
            'institusi',
            'jenis_pt',
            'kategori_pt',
            'klaster',
            'provinsi',
            'kota',
            'pt_latitude',
            'pt_longitude',
            'judul',
            'skema',
            'thn_pelaksanaan',
            'bidang_fokus',
            'tema_prioritas'
        );

        if ($request->filled('ids')) {
            $ids = explode(',', $request->ids);
            $query->whereIn('id', $ids);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('institusi', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%")
                    ->orWhere('provinsi', 'like', "%{$search}%")
                    ->orWhere('skema', 'like', "%{$search}%")
                    ->orWhere('bidang_fokus', 'like', "%{$search}%")
                    ->orWhere('tema_prioritas', 'like', "%{$search}%")
                    ->orWhere('thn_pelaksanaan', 'like', "%{$search}%");
            });
        }

        if ($request->filled('filters')) {
            $filters = $request->filters;
            foreach ($filters as $key => $value) {
                if (!empty($value)) {
                    if (
                        in_array($key, [
                            'nama',
                            'nidn',
                            'nuptk',
                            'institusi',
                            'judul',
                            'skema',
                            'thn_pelaksanaan',
                            'bidang_fokus',
                            'tema_prioritas',
                            'provinsi',
                            'kota',
                            'jenis_pt',
                            'kategori_pt'
                        ])
                    ) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        $filterLabel = ($request->filled('search') || $request->filled('filters')) ? '_filtered' : '';
        $filename = 'data-penelitian' . $filterLabel . '_' . date('Y-m-d') . '.csv';

        $headers = [
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Expires' => '0',
            'Pragma' => 'public'
        ];

        $columns = ['ID', 'Nama', 'NIDN', 'NUPTK', 'Institusi', 'Jenis PT', 'Kategori PT', 'Klaster', 'Provinsi', 'Kota', 'Latitude', 'Longitude', 'Judul', 'Skema', 'Tahun', 'Bidang Fokus', 'Tema Prioritas'];

        $callback = function () use ($columns, $query) {
            $file = fopen('php://output', 'w');
            // UTF-8 BOM so Excel handles Indonesian characters correctly
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            $query->orderBy('thn_pelaksanaan', 'desc')->chunk(1000, function ($data) use ($file) {
                foreach ($data as $row) {
                    fputcsv($file, [
                        $row->id,
                        $row->nama,
                        $row->nidn,
                        $row->nuptk,
                        $row->institusi,
                        $row->jenis_pt,
                        $row->kategori_pt,
                        $row->klaster,
                        $row->provinsi,
                        $row->kota,
                        $row->pt_latitude,
                        $row->pt_longitude,
                        $row->judul,
                        $row->skema,
                        $row->thn_pelaksanaan,
                        $row->bidang_fokus,
                        $row->tema_prioritas
                    ]);
                }
            });
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportJson(Request $request)
    {
        // Same filter logic as index / exportCsv
        $query = Penelitian::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('institusi', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%")
                    ->orWhere('provinsi', 'like', "%{$search}%")
                    ->orWhere('skema', 'like', "%{$search}%")
                    ->orWhere('bidang_fokus', 'like', "%{$search}%")
                    ->orWhere('tema_prioritas', 'like', "%{$search}%")
                    ->orWhere('thn_pelaksanaan', 'like', "%{$search}%");
            });
        }

        if ($request->filled('filters')) {
            foreach ($request->filters as $key => $value) {
                if (
                    !empty($value) && in_array($key, [
                        'nama',
                        'nidn',
                        'nuptk',
                        'institusi',
                        'judul',
                        'skema',
                        'thn_pelaksanaan',
                        'bidang_fokus',
                        'tema_prioritas',
                        'provinsi',
                        'kota',
                        'jenis_pt',
                        'kategori_pt'
                    ])
                ) {
                    $query->where($key, 'like', "%{$value}%");
                }
            }
        }

        // Cap at 100k rows for safety
        $cap = 100000;
        $total = (clone $query)->count();
        if ($total > $cap) {
            return response()->json(['error' => "Data terlalu besar ({$total} baris, maks {$cap}). Silakan gunakan filter terlebih dahulu."], 422);
        }

        // Use chunked retrieval to avoid memory exhaustion
        $columns = [
            'id',
            'nama',
            'nidn',
            'nuptk',
            'institusi',
            'jenis_pt',
            'kategori_pt',
            'klaster',
            'provinsi',
            'kota',
            'pt_latitude',
            'pt_longitude',
            'judul',
            'skema',
            'thn_pelaksanaan',
            'bidang_fokus',
            'tema_prioritas'
        ];

        $data = [];
        $query->select($columns)->chunk(2000, function ($chunk) use (&$data) {
            foreach ($chunk as $row) {
                $data[] = $row;
            }
        });

        return response()->json($data);
    }

    public function importExcel(Request $request)
    {
        try {
            $request->validate([
                'data' => 'required|array',
                'data.*' => 'array',
            ]);

            $imported = 0;
            $updated = 0;
            $errors = [];
            $batch = [];

            // Strict Header Validation
            if (!empty($request->data)) {
                $firstRow = $request->data[0];
                $foundKeys = array_map(function($k) {
                    return strtolower(str_replace([' ', '/', '_'], '', $k));
                }, array_keys($firstRow));

                $required = ['nama', 'institusi', 'judul', 'thnpelaksanaan'];
                $missing = [];
                foreach ($required as $req) {
                     if (!in_array($req, $foundKeys)) {
                         // Check aliases
                         $aliases = [
                             'thnpelaksanaan' => ['tahun', 'thnpelaksanaankegiatan', 'thnpelaksanaan'],
                             'institusi' => ['namainstitusi', 'perguruantinggi'],
                         ];
                         $foundAlias = false;
                         if (isset($aliases[$req])) {
                             foreach ($aliases[$req] as $alt) { if (in_array($alt, $foundKeys)) { $foundAlias = true; break; } }
                         }
                         if (!$foundAlias) $missing[] = $req;
                     }
                }
                if (!empty($missing)) {
                    return back()->with('error', 'Format file tidak sesuai! Kolom wajib tidak ditemukan: ' . implode(', ', $missing));
                }
            }

            foreach ($request->data as $index => $row) {
                $rowNum = $index + 1;
                $normalizedRow = [];
                foreach ($row as $k => $v) {
                    $cleanKey = strtolower(str_replace([' ', '/', '_'], '', $k));
                    $normalizedRow[$cleanKey] = $v;
                }

                $id = $normalizedRow['id'] ?? null;
                $nama = trim($normalizedRow['nama'] ?? $normalizedRow['peneliti'] ?? $normalizedRow['namapeneliti'] ?? '');
                $institusi = trim($normalizedRow['institusi'] ?? $normalizedRow['namainstitusi'] ?? $normalizedRow['perguruan_tinggi'] ?? '');
                $judul = trim($normalizedRow['judul'] ?? $normalizedRow['judulpenelitian'] ?? '');
                $tahun = (int)($normalizedRow['thnpelaksanaan'] ?? $normalizedRow['tahun'] ?? date('Y'));

                if (empty($nama)) { $errors[] = "Baris #{$rowNum}: Kolom 'Nama' wajib diisi."; continue; }
                if (empty($institusi)) { $errors[] = "Baris #{$rowNum}: Kolom 'Institusi' wajib diisi."; continue; }
                if (empty($judul)) { $errors[] = "Baris #{$rowNum}: Kolom 'Judul' wajib diisi."; continue; }

                $data = [
                    'nama' => $nama,
                    'nidn' => $normalizedRow['nidn'] ?? null,
                    'nuptk' => $normalizedRow['nuptk'] ?? null,
                    'institusi' => $institusi,
                    'kode_pt' => $normalizedRow['kodept'] ?? 'IMPORT_EXCEL',
                    'jenis_pt' => $normalizedRow['jenispt'] ?? 'Negeri/Swasta',
                    'kategori_pt' => $normalizedRow['kategoript'] ?? '-',
                    'klaster' => $normalizedRow['klaster'] ?? '-',
                    'provinsi' => $normalizedRow['provinsi'] ?? '-',
                    'kota' => $normalizedRow['kota'] ?? '-',
                    'pt_latitude' => $normalizedRow['ptlatitude'] ?? $normalizedRow['latitude'] ?? -6.2,
                    'pt_longitude' => $normalizedRow['ptlongitude'] ?? $normalizedRow['longitude'] ?? 106.8,
                    'judul' => $judul,
                    'skema' => $normalizedRow['skema'] ?? '-',
                    'thn_pelaksanaan' => $tahun,
                    'bidang_fokus' => $normalizedRow['bidangfokus'] ?? '',
                    'tema_prioritas' => $normalizedRow['temaprioritas'] ?? '',
                ];

                if ($id && Penelitian::find($id)) {
                    Penelitian::where('id', $id)->update($data);
                    $updated++;
                } else {
                    $batch[] = $data;
                    $imported++;
                }

                if (count($batch) >= 100) {
                    Penelitian::insert($batch);
                    $batch = [];
                }
            }

            if (count($batch) > 0) Penelitian::insert($batch);

            $this->clearModuleCache();

            $message = "Import selesai: {$imported} baru, {$updated} diperbarui.";
            if (count($errors) > 0) {
                $errorDetail = implode('; ', array_slice($errors, 0, 2));
                return back()->with('error', $message . " (" . count($errors) . " baris gagal: " . $errorDetail . "...)");
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan sistem saat import: ' . $e->getMessage());
        }
    }

    private function clearModuleCache()
    {
        $v = Cache::get('penelitian_admin_v', 1);
        Cache::put('penelitian_admin_v', $v + 1, 86400);
        Cache::forget('penelitian_admin_stats');
        Cache::forget('admin_dashboard_stats');
        $pv = (int) Cache::get('permasalahan_admin_v', 1);
        Cache::put('permasalahan_admin_v', $pv + 1, 86400 * 30);
    }
}
