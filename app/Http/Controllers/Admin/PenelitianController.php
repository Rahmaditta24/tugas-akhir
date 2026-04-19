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

    private function formatProvinsi($name)
    {
        if (empty($name) || strtolower($name) === 'tidak tersedia') return 'tidak tersedia';
        $name = trim($name);
        if ($name === '') return 'tidak tersedia';

        $formatted = mb_convert_case($name, MB_CASE_TITLE, "UTF-8");
        $fixes = [
            'Dki Jakarta' => 'DKI Jakarta',
            'Di Yogyakarta' => 'DI Yogyakarta',
        ];

        return $fixes[$formatted] ?? $formatted;
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
                            'kategori_pt',
                            'klaster',
                            'institusi_pilihan'
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
        $sort = in_array($request->get('sort'), $allowedSorts, true) ? $request->get('sort') : 'id';
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
                // Formatting name
                $item->nama = $this->formatName($item->nama);

                // Self-healing rules for display consistency
                $clean = function($v, $isNumeric = false) {
                    if (is_string($v)) $v = ltrim(trim($v), "'");
                    if ($v === null || $v === '') return $isNumeric ? '0' : '-';
                    return $v;
                };

                $numericFields = ['nidn', 'nuptk', 'kode_pt'];
                $textFields = ['institusi', 'provinsi', 'institusi_pilihan', 'skema', 'kota'];
                $dropdownFields = ['jenis_pt', 'kategori_pt', 'klaster', 'bidang_fokus', 'tema_prioritas'];
                
                foreach ($numericFields as $f) {
                    $item->$f = $clean($item->$f, true);
                }
                foreach ($textFields as $f) {
                    $item->$f = $clean($item->$f, false);
                }
                foreach ($dropdownFields as $f) {
                    // Jika data asli adalah '-' atau kosong, paksa jadi string kosong agar Select Tag pindah ke "-- Pilih --"
                    $val = ltrim(trim($item->$f), "'");
                    $item->$f = ($val === '' || $val === '-' || $val === null) ? '' : $val;
                }

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
            'nidn' => $this->normalizeNumeric($request->nidn),
            'nuptk' => $this->normalizeNumeric($request->nuptk),
            'kode_pt' => $this->normalizeNumeric($request->kode_pt),
            'kategori_pt' => empty($request->kategori_pt) ? '-' : $request->kategori_pt,
            'institusi_pilihan' => empty($request->institusi_pilihan) ? '-' : $request->institusi_pilihan,
            'klaster' => empty($request->klaster) ? '-' : $request->klaster,
            'provinsi' => empty($request->provinsi) ? '-' : $request->provinsi,
            'kota' => empty($request->kota) ? '-' : $request->kota,
            'skema' => empty($request->skema) ? '-' : $request->skema,
            'bidang_fokus' => empty($request->bidang_fokus) ? '-' : $request->bidang_fokus,
            'tema_prioritas' => empty($request->tema_prioritas) ? '-' : $request->tema_prioritas,
        ]);

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nidn' => ['nullable', 'string'],
            'nuptk' => ['nullable', 'string'],
            'institusi' => ['required', 'string'],
            'kode_pt' => ['required', 'string'],
            'jenis_pt' => ['required', 'string'],
            'kategori_pt' => ['required', 'string'],
            'institusi_pilihan' => ['required', 'string'],
            'klaster' => ['required', 'string'],
            'provinsi' => ['required', 'string'],
            'kota' => ['required', 'string'],
            'pt_latitude' => ['required', 'numeric'],
            'pt_longitude' => ['required', 'numeric'],
            'judul' => ['required', 'string'],
            'skema' => ['required', 'string'],
            'thn_pelaksanaan' => ['required', 'integer'],
            'bidang_fokus' => ['nullable', 'string'],
            'tema_prioritas' => 'nullable|string',
        ]);

        $validated['provinsi'] = $this->formatProvinsi($validated['provinsi'] ?? '');

        Penelitian::create($validated);
        $this->clearModuleCache();
        return redirect()->route('admin.penelitian.index')->with('success', 'Data ditambahkan');
    }

    public function edit(Request $request, Penelitian $penelitian)
    {
        // Clean data from DB
        $clean = function($v, $isNumeric = false) {
            if (is_string($v)) {
                $v = ltrim(trim($v), "'");
            }
            if ($v === null || $v === '') {
                return $isNumeric ? '0' : '-';
            }
            return $v;
        };

        $numericFields = ['nidn', 'nuptk', 'kode_pt'];
        $textFields = ['institusi', 'provinsi', 'institusi_pilihan', 'skema', 'kota'];
        $dropdownFields = ['jenis_pt', 'kategori_pt', 'klaster', 'bidang_fokus', 'tema_prioritas'];
        
        foreach ($numericFields as $f) {
            $penelitian->$f = $clean($penelitian->$f, true);
        }
        foreach ($textFields as $f) {
            $penelitian->$f = $clean($penelitian->$f, false);
        }
        foreach ($dropdownFields as $f) {
            $val = ltrim(trim($penelitian->$f), "'");
            $penelitian->$f = ($val === '' || $val === '-' || $val === null) ? '' : $val;
        }
        
        return Inertia::render('Admin/Penelitian/Edit', [
            'item'    => $penelitian,
            'filters' => $request->only(['page', 'search', 'perPage', 'filters'])
        ]);
    }

    public function update(Request $request, Penelitian $penelitian)
    {
        $request->merge([
            'pt_latitude' => is_string($request->pt_latitude) ? str_replace(',', '.', $request->pt_latitude) : $request->pt_latitude,
            'pt_longitude' => is_string($request->pt_longitude) ? str_replace(',', '.', $request->pt_longitude) : $request->pt_longitude,
            'nidn' => $this->normalizeNumeric($request->nidn),
            'nuptk' => $this->normalizeNumeric($request->nuptk),
            'kode_pt' => $this->normalizeNumeric($request->kode_pt),
            'kategori_pt' => empty($request->kategori_pt) ? '-' : $request->kategori_pt,
            'institusi_pilihan' => empty($request->institusi_pilihan) ? '-' : $request->institusi_pilihan,
            'klaster' => empty($request->klaster) ? '-' : $request->klaster,
            'provinsi' => $this->formatProvinsi($request->provinsi ?? '-'),
            'kota' => empty($request->kota) ? '-' : $request->kota,
            'skema' => empty($request->skema) ? '-' : $request->skema,
            'bidang_fokus' => empty($request->bidang_fokus) ? '-' : $request->bidang_fokus,
            'tema_prioritas' => empty($request->tema_prioritas) ? '-' : $request->tema_prioritas,
        ]);
        
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
        if ($request->ids === 'all') {
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
                    if (!empty($value)) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
            $count = $query->delete();
        } else {
            $request->validate(['ids' => 'required|array']);
            $count = Penelitian::whereIn('id', $request->ids)->delete();
        }
        
        $this->clearModuleCache();
        return back()->with('success', "{$count} data penelitian berhasil dihapus.");
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'items'       => 'required|array|min:1',
            'items.*.id'  => 'required|integer|exists:penelitian,id',
        ]);

        $allowedFields = [
            'nama', 'nidn', 'nuptk', 'institusi', 'kode_pt', 'jenis_pt', 'kategori_pt',
            'klaster', 'institusi_pilihan', 'provinsi', 'kota',
            'pt_latitude', 'pt_longitude', 'skema',
            'thn_pelaksanaan', 'bidang_fokus', 'tema_prioritas',
        ];

        $count = 0;
        foreach ($request->items as $item) {
            $id = $item['id'] ?? null;
            if (!$id) continue;

            $updateData = [];
            foreach ($item as $key => $value) {
                if ($key === 'id') continue;
                if (!in_array($key, $allowedFields)) continue;
                
                // Normalisasi NIDN/NUPTK/Kode PT
                if (in_array($key, ['nidn', 'nuptk', 'kode_pt'])) {
                    $updateData[$key] = $this->normalizeNumeric($value);
                } else if (in_array($key, ['pt_latitude', 'pt_longitude'])) {
                    if ($value === null || $value === '' || !is_numeric(str_replace(',', '.', $value))) {
                        $updateData[$key] = 0;
                    } else {
                        $updateData[$key] = (float)str_replace(',', '.', $value);
                    }
                } else if ($key === 'thn_pelaksanaan') {
                    if ($value === null || $value === '' || !is_numeric($value)) {
                        $updateData[$key] = 0;
                    } else {
                        $updateData[$key] = (int)$value;
                    }
                } else if ($key === 'provinsi') {
                    $updateData[$key] = $this->formatProvinsi($value);
                } else {
                    $updateData[$key] = $value;
                }
            }

            if (!empty($updateData)) {
                Penelitian::where('id', $id)->update($updateData);
                $count++;
            }
        }

        $this->clearModuleCache();
        return back()->with('success', "{$count} data penelitian berhasil diperbarui.");
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

        if ($request->filled('ids') && $request->ids !== 'all') {
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
                    $clean = function($val) {
                        if ($val === null) return '';
                        return str_replace(["\r", "\n"], ' ', (string)$val);
                    };

                    fputcsv($file, [
                        $row->id,
                        $clean($row->nama),
                        $clean($row->nidn),
                        $clean($row->nuptk),
                        $clean($row->institusi),
                        $clean($row->jenis_pt),
                        $clean($row->kategori_pt),
                        $clean($row->klaster),
                        $clean($row->provinsi),
                        $clean($row->kota),
                        $row->pt_latitude,
                        $row->pt_longitude,
                        $clean($row->judul),
                        $clean($row->skema),
                        $row->thn_pelaksanaan,
                        $clean($row->bidang_fokus),
                        $clean($row->tema_prioritas)
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
                    // Buang semua karakter non-alfanumerik dari header (spasi, _, /, dsb)
                    $cleanKey = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $k));
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
                    'nidn' => $this->normalizeNumeric($normalizedRow['nidn'] ?? null),
                    'nuptk' => $this->normalizeNumeric($normalizedRow['nuptk'] ?? null),
                    'institusi' => $institusi,
                    'kode_pt' => $this->normalizeNumeric($normalizedRow['kodept'] ?? 'IMPORT_EXCEL'),
                    'jenis_pt' => !empty($normalizedRow['jenispt']) ? $normalizedRow['jenispt'] : 'Negeri/Swasta',
                    'kategori_pt' => !empty($normalizedRow['kategoript']) ? $normalizedRow['kategoript'] : '-',
                    'institusi_pilihan' => !empty($normalizedRow['institusipilihan']) ? $normalizedRow['institusipilihan'] : (!empty($normalizedRow['institusipenerima']) ? $normalizedRow['institusipenerima'] : '-'),
                    'klaster' => !empty($normalizedRow['klaster']) ? $normalizedRow['klaster'] : '-',
                    'provinsi' => $this->formatProvinsi($normalizedRow['provinsi'] ?? 'tidak tersedia'),
                    'kota' => !empty($normalizedRow['kota']) ? $normalizedRow['kota'] : '-',
                    'pt_latitude' => !empty($normalizedRow['ptlatitude']) ? $normalizedRow['ptlatitude'] : (!empty($normalizedRow['latitude']) ? $normalizedRow['latitude'] : -6.2),
                    'pt_longitude' => !empty($normalizedRow['ptlongitude']) ? $normalizedRow['ptlongitude'] : (!empty($normalizedRow['longitude']) ? $normalizedRow['longitude'] : 106.8),
                    'judul' => $judul,
                    'skema' => !empty($normalizedRow['skema']) ? $normalizedRow['skema'] : '-',
                    'thn_pelaksanaan' => $tahun,
                    'bidang_fokus' => !empty($normalizedRow['bidangfokus']) ? $normalizedRow['bidangfokus'] : (!empty($normalizedRow['bidangfokustugas']) ? $normalizedRow['bidangfokustugas'] : '-'),
                    'tema_prioritas' => !empty($normalizedRow['temaprioritas']) ? $normalizedRow['temaprioritas'] : (!empty($normalizedRow['temaprioritastugas']) ? $normalizedRow['temaprioritastugas'] : '-'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // LOGIKA UPDATE:
                // 1. Cari berdasarkan ID (jika ada di excel)
                // 2. Jika ID kosong, cari berdasarkan Judul + Nama (Smart Match)
                $existing = null;
                if ($id) {
                    $existing = Penelitian::find($id);
                } else {
                    $existing = Penelitian::where('judul', 'like', $judul)
                                        ->where('nama', 'like', $nama)
                                        ->first();
                }

                if ($existing) {
                    $existing->update($data);
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

    private function normalizeNumeric($val)
    {
        if (empty($val) || trim($val) === '') return '0';
        $val = trim($val);
        // Jika mengandung E+ (scientific notation)
        if (str_contains(strtoupper($val), 'E+')) {
            return sprintf('%.0f', (float) $val);
        }
        return $val;
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
