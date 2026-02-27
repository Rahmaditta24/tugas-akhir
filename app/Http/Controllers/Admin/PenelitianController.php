<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Penelitian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenelitianController extends Controller
{
    private function isPTN($name)
    {
        if (empty($name)) return false;
        $name = strtolower($name);
        if (strpos($name, 'negeri') !== false) return true;
        if (strpos($name, 'politeknik') !== false && strpos($name, 'negeri') !== false) return true;
        if (strpos($name, 'uin ') !== false || strpos($name, 'universitas islam negeri') !== false) return true;
        if (strpos($name, 'iain ') !== false || strpos($name, 'institut agama islam negeri') !== false) return true;
        if (strpos($name, 'stain ') !== false || strpos($name, 'sekolah tinggi agama islam negeri') !== false) return true;
        $bigPTNs = [
            'universitas indonesia', 'institut teknologi bandung', 'universitas gadjah mada', 
            'institut pertanian bogor', 'ipb university', 'universitas padjadjaran', 
            'universitas airlangga', 'universitas diponegoro', 'universitas brawijaya', 
            'universitas hasanuddin', 'universitas sebelas maret', 'institut teknologi sepuluh nopember', 
            'universitas sumatera utara', 'universitas lampung', 'universitas andalas', 
            'universitas sriwijaya', 'universitas syiah kuala', 'universitas riau', 
            'universitas udayana', 'universitas jember', 'universitas jenderal soedirman', 
            'universitas lambung mangkurat', 'universitas sam ratulangi', 'universitas tanjungpura',
            'universitas nusa cendana', 'universitas palangka raya', 'universitas tadulako',
            'universitas pattimura', 'universitas cenderawasih', 'universitas mulawarman',
            'universitas pendidikan indonesia', 'universitas pendidikan ganesha',
            'universitas sultan ageng tirtayasa', 'upn \"veteran\"', 'universitas tidar',
            'universitas teuku umar', 'universitas borneo tarakan', 'universitas bangka belitung',
            'universitas musamus', 'universitas malikussaleh', 'universitas samudra',
            'universitas siliwangi', 'universitas sembilanbelas november', 
            'universitas singaperbangsa', 'universitas sulawesi barat', 'universitas papua',
            'institut seni indonesia', 'institut seni budaya indonesia'
        ];
        foreach ($bigPTNs as $ptn) {
            if (strpos($name, $ptn) !== false) return true;
        }
        return false;
    }

    private function formatName($name)
    {
        if (empty($name)) return $name;
        $name = trim($name);
        if ($name !== mb_strtoupper($name) && $name !== mb_strtolower($name)) {
            return $name;
        }
        $formatted = mb_convert_case($name, MB_CASE_TITLE, "UTF-8");
        $replacements = [
            'S.pd' => 'S.Pd', 'M.pd' => 'M.Pd', 'S.t' => 'S.T', 'M.t' => 'M.T',
            'S.h' => 'S.H', 'M.h' => 'M.H', 'S.e' => 'S.E', 'M.m' => 'M.M',
            'S.si' => 'S.Si', 'M.si' => 'M.Si', 'S.sos' => 'S.Sos', 'M.sos' => 'M.Sos',
            'S.kom' => 'S.Kom', 'M.kom' => 'M.Kom', 'S.p' => 'S.P', 'M.p' => 'M.P',
            'S.pt' => 'S.Pt', 'M.pt' => 'M.Pt', 'S.hut' => 'S.Hut', 'M.hut' => 'M.Hut',
            'S.km' => 'S.KM', 'M.kes' => 'M.Kes', 'S.kep' => 'S.Kep', 'M.kep' => 'M.Kep',
            'Ph.d' => 'Ph.D', 'M.hum' => 'M.Hum', 'S.hum' => 'S.Hum', 'M.ag' => 'M.Ag',
            'S.ag' => 'S.Ag', 'M.fil' => 'M.Fil', 'S.fil' => 'S.Fil', 'M.ak' => 'M.Ak',
            'S.ak' => 'S.Ak', 'M.psi' => 'M.Psi', 'S.psi' => 'S.Psi', 'M.ti' => 'M.TI',
            'S.ti' => 'S.TI', 'M.eng' => 'M.Eng', 'S.eng' => 'S.Eng', 'M.sc' => 'M.Sc',
            'B.sc' => 'B.Sc', 'Msi' => 'MSi', 'Spd' => 'SPd',
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
            $query->where(function($q) use ($search) {
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
                    if (in_array($key, [
                        'nama', 'nidn', 'nuptk', 'institusi', 'judul', 'skema', 'thn_pelaksanaan',
                        'bidang_fokus', 'tema_prioritas', 'provinsi', 'kota', 
                        'jenis_pt', 'kategori_pt'
                    ])) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        // Per page
        $perPage = (int) $request->get('perPage', 20);
        if ($perPage < 10) { $perPage = 10; }
        if ($perPage > 100) { $perPage = 100; }

        // Order by ID descending (newest record first)
        $penelitian = $query
            ->orderByDesc('id')
            ->orderByDesc('thn_pelaksanaan')
            ->paginate($perPage)
            ->withQueryString();

        $penelitian->getCollection()->transform(function ($item) {
            $item->nama = $this->formatName($item->nama);
            return $item;
        });

        // Statistics
        $stats = [
            'total' => Penelitian::count(),
            'thisYear' => Penelitian::whereYear('created_at', date('Y'))->count(),
            'withCoordinates' => Penelitian::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
        ];

        return Inertia::render('Admin/Penelitian/Index', [
            'penelitian' => $penelitian,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'columns' => $request->filters ?? [], // Pass column filters back
                'perPage' => $perPage,
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
            'nidn' => ['nullable', 'string', 'regex:/^[0-9]+$/', 'max:50'],
            'nuptk' => ['nullable', 'string', 'regex:/^[0-9]+$/', 'max:50'],
            'institusi' => ['required', 'string', 'max:255'],
            'institusi_pilihan' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['required', 'numeric', 'between:-180,180'],
            'kode_pt' => ['required', 'string', 'max:50'],
            'jenis_pt' => ['required', 'string', 'max:100'],
            'kategori_pt' => ['required', 'string', 'max:100'],
            'klaster' => ['required', 'string', 'max:255'],
            'provinsi' => ['required', 'string', 'max:100'],
            'kota' => ['required', 'string', 'max:100'],
            'judul' => ['required', 'string'],
            'skema' => ['nullable', 'string', 'max:255'],
            'thn_pelaksanaan' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 10)],
            'bidang_fokus' => ['required', 'string', 'max:255'],
            'tema_prioritas' => ['required', 'string', 'max:255'],
        ]);

        if (strcasecmp($validated['institusi'], 'Bogor Agricultural University') === 0) {
            $validated['institusi'] = 'Institut Pertanian Bogor';
        }
        Penelitian::create($validated);

        return redirect()->route('admin.penelitian.index')->with('success', 'Data penelitian berhasil ditambahkan');
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
        $penelitian->kota = $clean($penelitian->kota);
        $penelitian->skema = $clean($penelitian->skema);
        $penelitian->bidang_fokus = $clean($penelitian->bidang_fokus);
        $penelitian->tema_prioritas = $clean($penelitian->tema_prioritas);

        return Inertia::render('Admin/Penelitian/Edit', [
            'item' => $penelitian,
            'filters' => $request->only(['page', 'search', 'perPage', 'filters'])
        ]);
    }

    public function update(Request $request, Penelitian $penelitian)
    {
        $request->merge([
            'pt_latitude' => is_string($request->pt_latitude) ? str_replace(',', '.', $request->pt_latitude) : $request->pt_latitude,
            'pt_longitude' => is_string($request->pt_longitude) ? str_replace(',', '.', $request->pt_longitude) : $request->pt_longitude,
            'nidn' => is_string($request->nidn) ? ltrim(trim($request->nidn), "'") : $request->nidn,
            'nuptk' => is_string($request->nuptk) ? ltrim(trim($request->nuptk), "'") : $request->nuptk,
        ]);
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nidn' => ['nullable', 'string', 'regex:/^[0-9]+$/', 'max:50'],
            'nuptk' => ['nullable', 'string', 'regex:/^[0-9]+$/', 'max:50'],
            'institusi' => ['required', 'string', 'max:255'],
            'institusi_pilihan' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['required', 'numeric', 'between:-180,180'],
            'kode_pt' => ['required', 'string', 'max:50'],
            'jenis_pt' => ['required', 'string', 'max:100'],
            'kategori_pt' => ['required', 'string', 'max:100'],
            'klaster' => ['required', 'string', 'max:255'],
            'provinsi' => ['required', 'string', 'max:100'],
            'kota' => ['required', 'string', 'max:100'],
            'judul' => ['required', 'string'],
            'skema' => ['nullable', 'string', 'max:255'],
            'thn_pelaksanaan' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 10)],
            'bidang_fokus' => ['required', 'string', 'max:255'],
            'tema_prioritas' => ['required', 'string', 'max:255'],
        ]);

        if (strcasecmp($validated['institusi'], 'Bogor Agricultural University') === 0) {
            $validated['institusi'] = 'Institut Pertanian Bogor';
        }
        $penelitian->update($validated);

        return redirect()->route('admin.penelitian.index', $request->only(['page', 'search', 'perPage', 'filters']))
            ->with('success', 'Data penelitian berhasil diperbarui');
    }

    public function destroy(Penelitian $penelitian)
    {
        $penelitian->delete();
        return back()->with('success', 'Data dihapus');
    }
}


