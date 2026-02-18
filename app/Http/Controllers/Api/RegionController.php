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
            // Use GitHub Pages version for better reliability/CORS bypass on server side
            $response = Http::get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
            return $response->json();
        });
    }

    public function regencies($provinceId)
    {
        return Cache::remember("regencies_{$provinceId}", 86400, function () use ($provinceId) {
            $response = Http::get("https://emsifa.github.io/api-wilayah-indonesia/api/regencies/{$provinceId}.json");
            return $response->json();
        });
    }

    public function searchCampus(Request $request)
    {
        $query = $request->get('query', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $results = [];

        // 1. Try PDDIKTI API (More complete for Indonesian campuses)
        try {
            // Added User-Agent and timeout for better reliability
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
            // Log or ignore
        }

        // 2. Fallback to Hipolabs if PDDIKTI is empty or fails
        if (empty($results)) {
            try {
                $response = Http::get("http://universities.hipolabs.com/search?country=Indonesia&name={$query}");
                $hipoData = $response->json() ?? [];
                
                // Special case: IPB is "Bogor Agricultural University" in Hipolabs.
                // It doesn't contain "Institut", so it won't show up when searching "Institut".
                $qLower = strtolower($query);
                if (str_contains('institut pertanian bogor', $qLower) || $qLower === 'ipb') {
                    $ipbResponse = Http::get("http://universities.hipolabs.com/search?country=Indonesia&name=Bogor%20Agricultural");
                    if ($ipbResponse->successful()) {
                        $hipoData = array_merge($hipoData, $ipbResponse->json());
                    }
                }

                foreach ($hipoData as $item) {
                    $name = $item['name'];
                    // Basic normalization for common university names from English to Indonesian
                    if (strtolower($name) === 'bogor agricultural university') $name = 'Institut Pertanian Bogor';
                    if (strtolower($name) === 'bandung institute of technology') $name = 'Institut Teknologi Bandung';
                    if (strtolower($name) === 'university of indonesia') $name = 'Universitas Indonesia';
                    if (strtolower($name) === 'gadjah mada university') $name = 'Universitas Gadjah Mada';
                    
                    $results[] = $name;
                }
            } catch (\Exception $e) {
                // Ignore
            }
        }

        return response()->json(array_values(array_unique($results)));
    }
}
