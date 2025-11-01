<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PermasalahanProvinsi;
use App\Models\PermasalahanKabupaten;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermasalahanController extends Controller
{
    public function index(Request $request)
    {
        // Show both provinsi and kabupaten data with pagination
        $perPage = (int)($request->get('perPage', 20));
        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');

        $provinsiQuery = PermasalahanProvinsi::query();
        $kabupatenQuery = PermasalahanKabupaten::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $provinsiQuery->where(function ($q) use ($search) {
                $q->where('provinsi', 'like', "%{$search}%")
                  ->orWhere('jenis_permasalahan', 'like', "%{$search}%")
                  ->orWhere('tahun', 'like', "%{$search}%");
            });
            $kabupatenQuery->where(function ($q) use ($search) {
                $q->where('kabupaten_kota', 'like', "%{$search}%")
                  ->orWhere('provinsi', 'like', "%{$search}%")
                  ->orWhere('jenis_permasalahan', 'like', "%{$search}%")
                  ->orWhere('tahun', 'like', "%{$search}%");
            });
        }

        $permasalahanProvinsi = $provinsiQuery
            ->select(['id','provinsi','jenis_permasalahan','metrik','nilai','satuan','tahun'])
            ->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'provPage')
            ->withQueryString();

        $permasalahanKabupaten = $kabupatenQuery
            ->select(['id','kabupaten_kota','provinsi','jenis_permasalahan','metrik','nilai','satuan','tahun'])
            ->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'kabPage')
            ->withQueryString();

        $stats = [
            'totalProvinsi' => PermasalahanProvinsi::count(),
            'totalKabupaten' => PermasalahanKabupaten::count(),
            'total' => PermasalahanProvinsi::count() + PermasalahanKabupaten::count(),
        ];

        return Inertia::render('Admin/Permasalahan/Index', [
            'permasalahanProvinsi' => $permasalahanProvinsi,
            'permasalahanKabupaten' => $permasalahanKabupaten,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'perPage' => $perPage,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Permasalahan/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:provinsi,kabupaten'],
            'provinsi' => ['nullable', 'string', 'max:255'],
            'kabupaten_kota' => ['nullable', 'string', 'max:255'],
            'jenis_permasalahan' => ['required', 'string', 'max:255'],
            'nilai' => ['nullable', 'numeric'],
            'satuan' => ['nullable', 'string', 'max:50'],
            'tahun' => ['nullable', 'integer'],
        ]);

        if ($validated['type'] === 'provinsi') {
            PermasalahanProvinsi::create([
                'provinsi' => $validated['provinsi'] ?? null,
                'jenis_permasalahan' => $validated['jenis_permasalahan'],
                'nilai' => $validated['nilai'] ?? null,
                'satuan' => $validated['satuan'] ?? null,
                'tahun' => $validated['tahun'] ?? null,
            ]);
        } else {
            PermasalahanKabupaten::create([
                'kabupaten_kota' => $validated['kabupaten_kota'] ?? null,
                'provinsi' => $validated['provinsi'] ?? null,
                'jenis_permasalahan' => $validated['jenis_permasalahan'],
                'nilai' => $validated['nilai'] ?? null,
                'satuan' => $validated['satuan'] ?? null,
                'tahun' => $validated['tahun'] ?? null,
            ]);
        }

        return redirect()->route('admin.permasalahan.index')->with('success', 'Data permasalahan berhasil ditambahkan');
    }

    public function edit(Request $request, $id)
    {
        $type = $request->get('type', 'provinsi');
        $permasalahan = null;

        if ($type === 'provinsi') {
            $permasalahan = PermasalahanProvinsi::findOrFail($id);
            $permasalahan->type = 'provinsi';
        } else {
            $permasalahan = PermasalahanKabupaten::findOrFail($id);
            $permasalahan->type = 'kabupaten';
        }

        return Inertia::render('Admin/Permasalahan/Edit', [
            'permasalahan' => $permasalahan,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:provinsi,kabupaten'],
            'provinsi' => ['nullable', 'string', 'max:255'],
            'kabupaten_kota' => ['nullable', 'string', 'max:255'],
            'jenis_permasalahan' => ['required', 'string', 'max:255'],
            'nilai' => ['nullable', 'numeric'],
            'satuan' => ['nullable', 'string', 'max:50'],
            'metrik' => ['nullable', 'string', 'max:255'],
            'tahun' => ['nullable', 'integer'],
        ]);

        if ($validated['type'] === 'provinsi') {
            $permasalahan = PermasalahanProvinsi::findOrFail($id);
            $permasalahan->update([
                'provinsi' => $validated['provinsi'] ?? null,
                'jenis_permasalahan' => $validated['jenis_permasalahan'],
                'nilai' => $validated['nilai'] ?? null,
                'satuan' => $validated['satuan'] ?? null,
                'metrik' => $validated['metrik'] ?? null,
                'tahun' => $validated['tahun'] ?? null,
            ]);
        } else {
            $permasalahan = PermasalahanKabupaten::findOrFail($id);
            $permasalahan->update([
                'kabupaten_kota' => $validated['kabupaten_kota'] ?? null,
                'provinsi' => $validated['provinsi'] ?? null,
                'jenis_permasalahan' => $validated['jenis_permasalahan'],
                'nilai' => $validated['nilai'] ?? null,
                'satuan' => $validated['satuan'] ?? null,
                'metrik' => $validated['metrik'] ?? null,
                'tahun' => $validated['tahun'] ?? null,
            ]);
        }

        return redirect()->route('admin.permasalahan.index')->with('success', 'Data permasalahan berhasil diperbarui');
    }

    public function destroy(Request $request, $id)
    {
        $type = $request->get('type', 'provinsi');

        if ($type === 'provinsi') {
            $permasalahan = PermasalahanProvinsi::findOrFail($id);
        } else {
            $permasalahan = PermasalahanKabupaten::findOrFail($id);
        }

        $permasalahan->delete();

        return back()->with('success', 'Data permasalahan berhasil dihapus');
    }

    public function importFromFiles(Request $request)
    {
        $tahun = (int) ($request->get('tahun') ?? date('Y'));
        $baseDir = realpath(base_path('..'.DIRECTORY_SEPARATOR.'peta-bima'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.'permasalahan'));

        if (!$baseDir || !is_dir($baseDir)) {
            return back()->with('error', 'Folder data permasalahan tidak ditemukan');
        }

        $imported = 0;

        // Helper closures
        $upsertProv = function (string $provinsi, string $jenis, string $metrik, ?float $nilai, ?string $satuan) use ($tahun, &$imported) {
            if ($provinsi === '' || $nilai === null) { return; }
            PermasalahanProvinsi::updateOrCreate(
                [
                    'provinsi' => $provinsi,
                    'jenis_permasalahan' => $jenis,
                    'metrik' => $metrik,
                    'tahun' => $tahun,
                ],
                [
                    'nilai' => $nilai,
                    'satuan' => $satuan,
                ]
            );
            $imported++;
        };

        $upsertKab = function (string $kab, ?string $prov, string $jenis, string $metrik, ?float $nilai, ?string $satuan) use ($tahun, &$imported) {
            if ($kab === '' || $nilai === null) { return; }
            PermasalahanKabupaten::updateOrCreate(
                [
                    'kabupaten_kota' => $kab,
                    'provinsi' => $prov,
                    'jenis_permasalahan' => $jenis,
                    'tahun' => $tahun,
                ],
                [
                    'nilai' => $nilai,
                    'satuan' => $satuan,
                ]
            );
            $imported++;
        };

        // 1) Gizi Buruk
        $giziPath = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-gizi-buruk.json';
        if (is_file($giziPath)) {
            $json = json_decode(file_get_contents($giziPath), true);
            if (isset($json['Provinsi']) && is_array($json['Provinsi'])) {
                foreach ($json['Provinsi'] as $row) {
                    $upsertProv($row['Provinsi'] ?? '', 'gizi_buruk', 'persentase', isset($row['Persentase']) ? (float)$row['Persentase'] : null, '%');
                }
            }
            if (isset($json['Kabupaten']) && is_array($json['Kabupaten'])) {
                foreach ($json['Kabupaten'] as $row) {
                    $upsertKab($row['Kabupaten/Kota'] ?? '', null, 'gizi_buruk', 'persentase', isset($row['Persentase']) ? (float)$row['Persentase'] : null, '%');
                }
            }
        }

        // 2) Stunting
        $stuntingPath = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-stunting.json';
        if (is_file($stuntingPath)) {
            $json = json_decode(file_get_contents($stuntingPath), true);
            if (isset($json['Provinsi']) && is_array($json['Provinsi'])) {
                foreach ($json['Provinsi'] as $row) {
                    $upsertProv($row['Provinsi'] ?? '', 'stunting', 'persentase', isset($row['Persentase']) ? (float)$row['Persentase'] : null, '%');
                }
            }
            if (isset($json['Kabupaten']) && is_array($json['Kabupaten'])) {
                foreach ($json['Kabupaten'] as $row) {
                    $upsertKab($row['Kabupaten/Kota'] ?? '', null, 'stunting', 'persentase', isset($row['Persentase']) ? (float)$row['Persentase'] : null, '%');
                }
            }
        }

        // 3) Ketahanan Pangan (IKP)
        $panganPath = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-ketahanan-pangan.json';
        if (is_file($panganPath)) {
            $json = json_decode(file_get_contents($panganPath), true);
            if (isset($json['Provinsi']) && is_array($json['Provinsi'])) {
                foreach ($json['Provinsi'] as $row) {
                    $upsertProv($row['Provinsi'] ?? '', 'ketahanan_pangan', 'IKP', isset($row['IKP']) ? (float)$row['IKP'] : null, 'indeks');
                }
            }
            if (isset($json['Kabupaten']) && is_array($json['Kabupaten'])) {
                foreach ($json['Kabupaten'] as $row) {
                    $upsertKab($row['Kabupaten/Kota'] ?? '', null, 'ketahanan_pangan', 'IKP', isset($row['IKP']) ? (float)$row['IKP'] : null, 'indeks');
                }
            }
        }

        // 4) Krisis Listrik (SAIDI/SAIFI) – provinsi-level only pada file
        $listrikPath = $baseDir.DIRECTORY_SEPARATOR.'data-permasalahan-krisis-listrik.json';
        if (is_file($listrikPath)) {
            $json = json_decode(file_get_contents($listrikPath), true);
            if (isset($json['Sheet1']) && is_array($json['Sheet1'])) {
                foreach ($json['Sheet1'] as $row) {
                    $prov = trim((string)($row['Provinsi'] ?? ''));
                    if ($prov === '') { continue; }
                    $saidi = isset($row['SAIDI (Jam/Pelanggan)']) ? (float)$row['SAIDI (Jam/Pelanggan)'] : null;
                    $saifi = isset($row['SAIFI (Kali/Pelanggan)']) ? (float)$row['SAIFI (Kali/Pelanggan)'] : null;
                    if ($saidi !== null) { $upsertProv($prov, 'krisis_listrik', 'SAIDI', $saidi, 'Jam/Pelanggan'); }
                    if ($saifi !== null) { $upsertProv($prov, 'krisis_listrik', 'SAIFI', $saifi, 'Kali/Pelanggan'); }
                }
            }
        }

        return back()->with('success', "Import selesai: {$imported} baris diperbarui/dibuat untuk tahun {$tahun}.");
    }
}
