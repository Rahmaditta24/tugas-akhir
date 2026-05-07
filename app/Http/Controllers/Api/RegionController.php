<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class RegionController extends Controller
{
    public function provinces()
    {
        return Cache::remember('provinces', 86400, function () {
            // Coba API hanya di lingkungan pengembangan/lokal
            if (app()->environment('local')) {
                try {
                    $response = Http::timeout(10)->retry(2, 1000)->withOptions([
                        'allow_redirects' => false
                    ])->get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
                    
                    if ($response->successful()) {
                        return $response->json();
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to fetch provinces from API', ['error' => $e->getMessage()]);
                }
            }
            
            // Selalu gunakan data lokal (lebih andal)
            return $this->getLocalProvinces();
        });
    }
    
    private function getLocalProvinces()
    {
        $path = database_path('data/provinces.json');
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            // Pastikan kita mengembalikan array datar meskipun JSON berupa objek asosiatif
            return array_values($data);
        }
        return [];
    }

    public function regencies($provinceId)
    {
        return Cache::remember("regencies_{$provinceId}", 86400, function () use ($provinceId) {
            try {
                $response = Http::timeout(10)->retry(2, 1000)->get("https://emsifa.github.io/api-wilayah-indonesia/api/regencies/{$provinceId}.json");
                
                if ($response->successful()) {
                    return $response->json();
                }
            } catch (\Exception $e) {
                \Log::warning("Failed to fetch regencies for province {$provinceId}", ['error' => $e->getMessage()]);
            }
            
            // Kembalikan array kosong jika API gagal - frontend harus menanganinya dengan baik
            return [];
        });
    }

    public function searchCampus(Request $request)
    {
        $query = $request->get('query', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $results = [];

        // 1. Coba API PDDIKTI (Lebih lengkap untuk kampus di Indonesia)
        try {
            // Tambahkan User-Agent dan batas waktu (timeout) untuk keandalan yang lebih baik
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ])->timeout(5)->get("https://api-frontend.kemdikbud.go.id/hit_mhs/{$query}");
            
            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['pt'])) {
                    foreach ($data['pt'] as $item) {
                        $name = $item['text'];
                        $cleanName = preg_replace('/\s\(\d+\)$/', '', $name);
                        $results[] = $cleanName;
                    }
                }
            }
        } catch (\Exception $e) {
        }

        // 2. Cadangan ke Hipolabs jika PDDIKTI kosong atau gagal
        if (empty($results)) {
            try {
                $response = Http::get("http://universities.hipolabs.com/search?country=Indonesia&name={$query}");
                $hipoData = $response->json() ?? [];
                
                // Kasus khusus: IPB adalah "Bogor Agricultural University" di Hipolabs.
                // Tidak mengandung kata "Institut", sehingga tidak akan muncul saat mencari "Institut".
                $qLower = strtolower($query);
                if (str_contains('institut pertanian bogor', $qLower) || $qLower === 'ipb') {
                    $ipbResponse = Http::get("http://universities.hipolabs.com/search?country=Indonesia&name=Bogor%20Agricultural");
                    if ($ipbResponse->successful()) {
                        $hipoData = array_merge($hipoData, $ipbResponse->json());
                    }
                }

                foreach ($hipoData as $item) {
                    $name = $item['name'];
                    // Normalisasi dasar untuk nama universitas umum dari bahasa Inggris ke Bahasa Indonesia
                    if (strtolower($name) === 'bogor agricultural university') $name = 'Institut Pertanian Bogor';
                    if (strtolower($name) === 'bandung institute of technology') $name = 'Institut Teknologi Bandung';
                    if (strtolower($name) === 'university of indonesia') $name = 'Universitas Indonesia';
                    if (strtolower($name) === 'gadjah mada university') $name = 'Universitas Gadjah Mada';
                    
                    $results[] = $name;
                }
            } catch (\Exception $e) {
                // Abaikan
            }
        }

        return response()->json(array_values(array_unique($results)));
    }
}
