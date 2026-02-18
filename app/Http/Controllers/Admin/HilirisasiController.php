<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hilirisasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HilirisasiController extends Controller
{
    private function isPTN($name)
    {
        if (empty($name)) return false;
        $name = strtolower($name);
        
        // Basic keywords
        if (strpos($name, 'negeri') !== false) return true;
        if (strpos($name, 'politeknik') !== false && strpos($name, 'negeri') !== false) return true;
        if (strpos($name, 'uin ') !== false || strpos($name, 'universitas islam negeri') !== false) return true;
        if (strpos($name, 'iain ') !== false || strpos($name, 'institut agama islam negeri') !== false) return true;
        if (strpos($name, 'stain ') !== false || strpos($name, 'sekolah tinggi agama islam negeri') !== false) return true;

        // Known big PTNs without \"Negeri\" in name
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
        $query = Hilirisasi::query();

        // Whitelisted sorting and pagination
        $allowedSorts = ['id', 'judul', 'id_proposal', 'nama_pengusul', 'perguruan_tinggi', 'tahun', 'direktorat', 'provinsi', 'skema'];
        $sort = in_array($request->get('sort'), $allowedSorts, true)? $request->get('sort'): 'tahun';
        $direction = $request->get('direction') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) $request->get('perPage', 20);
        if ($perPage < 10) { $perPage = 10; }
        if ($perPage > 100) { $perPage = 100; }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_pengusul', 'like', "%{$search}%")
                  ->orWhere('perguruan_tinggi', 'like', "%{$search}%")
                  ->orWhere('judul', 'like', "%{$search}%")
                  ->orWhere('provinsi', 'like', "%{$search}%")
                  ->orWhere('skema', 'like', "%{$search}%")
                  ->orWhere('direktorat', 'like', "%{$search}%")
                  ->orWhere('mitra', 'like', "%{$search}%");
            });
        }

        // Column filters
        if ($request->filled('filters')) {
            $filters = $request->filters;
            foreach ($filters as $key => $value) {
                if (!empty($value)) {
                    // Whitelisted columns for filtering
                    if (in_array($key, [
                        'judul', 'nama_pengusul', 'perguruan_tinggi', 
                        'tahun', 'direktorat', 'provinsi', 'skema', 'mitra'
                    ])) {
                        $query->where($key, 'like', "%{$value}%");
                    }
                }
            }
        }

        // Select statement removed to ensure all required fields are available
        // $query->select([...]);

        $hilirisasi = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        $hilirisasi->getCollection()->transform(function ($item) {
            $item->nama_pengusul = $this->formatName($item->nama_pengusul);
            return $item;
        });

        $stats = [
            'total' => Hilirisasi::count(),
            'thisYear' => Hilirisasi::where('tahun', (int) date('Y'))->count(),
            'withCoordinates' => Hilirisasi::whereNotNull('pt_latitude')->whereNotNull('pt_longitude')->count(),
        ];

        return Inertia::render('Admin/Hilirisasi/Index', [
            'hilirisasi' => $hilirisasi,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search'),
                'columns' => $request->get('filters', []), // Pass column filters back
                'sort' => $sort,
                'direction' => $direction,
                'perPage' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Hilirisasi/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tahun' => ['required', 'numeric'],
            'id_proposal' => ['required'],
            'judul' => ['required', 'string'],
            'nama_pengusul' => ['required', 'string', 'max:255'],
            'direktorat' => ['required', 'string', 'max:255'],
            'perguruan_tinggi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['required', 'numeric', 'between:-180,180'],
            'provinsi' => ['required', 'string', 'max:255'],
            'mitra' => ['required', 'string', 'max:255'],
            'skema' => ['required', 'string', 'max:255'],
            'luaran' => ['required', 'string'],
        ]);

        Hilirisasi::create($validated);
        return redirect()->route('admin.hilirisasi.index')->with('success', 'Data hilirisasi berhasil ditambahkan');
    }

    public function edit(Request $request, Hilirisasi $hilirisasi)
    {
        return Inertia::render('Admin/Hilirisasi/Edit', [
            'item' => $hilirisasi,
            'filters' => $request->only(['page', 'search', 'perPage', 'filters', 'sort', 'direction'])
        ]);
    }

    public function update(Request $request, Hilirisasi $hilirisasi)
    {
        $validated = $request->validate([
            'tahun' => ['required', 'numeric'],
            'id_proposal' => ['required'],
            'judul' => ['required', 'string'],
            'nama_pengusul' => ['required', 'string', 'max:255'],
            'direktorat' => ['required', 'string', 'max:255'],
            'perguruan_tinggi' => ['required', 'string', 'max:255'],
            'pt_latitude' => ['required', 'numeric', 'between:-90,90'],
            'pt_longitude' => ['required', 'numeric', 'between:-180,180'],
            'provinsi' => ['required', 'string', 'max:255'],
            'mitra' => ['required', 'string', 'max:255'],
            'skema' => ['required', 'string', 'max:255'],
            'luaran' => ['required', 'string'],
        ]);

        $hilirisasi->update($validated);
        return redirect()->route('admin.hilirisasi.index', $request->only(['page', 'search', 'perPage', 'filters', 'sort', 'direction']))
            ->with('success', 'Data hilirisasi berhasil diperbarui');
    }

    public function destroy(Hilirisasi $hilirisasi)
    {
        $hilirisasi->delete();
        return back()->with('success', 'Data dihapus');
    }
}
