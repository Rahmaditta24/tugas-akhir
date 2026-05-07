<?php

namespace Database\Seeders;

use App\Models\Hilirisasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HilirisasiSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/data-hilirisasi.json');
        $conjunctions = ['dan', 'atau', 'tetapi', 'namun', 'melainkan', 'sedangkan', 'di', 'ke', 'dari', 'pada', 'dalam', 'yang', 'untuk', 'bagi', 'guna', 'buat', 'sebagai', 'dengan', 'secara', 'oleh', 'tentang', 'terhadap', 'daripada'];

        $toTitleCase = function ($str) use ($conjunctions) {
            if (!$str || $str === 'tidak tersedia') return $str;
            
            // 1. Bersihkan simbol di awal judul
            $s = preg_replace('/^[.\s…“"\'‘`]+/', '', $str);
            $s = trim($s);
            if (empty($s)) return $str;

            // 2. Pisahkan per kata
            $words = explode(' ', $s);
            $formattedWords = [];
            
            foreach ($words as $i => $word) {
                if ($word === '') continue;
                $wordLower = strtolower($word);
                
                // Kata pertama atau bukan kata penghubung
                if ($i === 0 || !in_array($wordLower, $conjunctions)) {
                    $res = mb_convert_case($wordLower, MB_CASE_TITLE, "UTF-8");
                    // Perbaiki penulisan PT dan CV
                    $res = preg_replace('/\bPt\.?\b/i', 'PT', $res);
                    $res = preg_replace('/\bCv\.?\b/i', 'CV', $res);
                    $formattedWords[] = $res;
                } else {
                    $formattedWords[] = $wordLower;
                }
            }
            return implode(' ', $formattedWords);
        };

        $normalize = function ($value) {
            if ($value === null) return null;
            if (is_string($value)) {
                $v = trim($value);
                // Tangani karakter kontrol
                $v = preg_replace('/[[:cntrl:]]/', '', $v);
                if ($v === '' || $v === '-' || $v === '—' || $v === '?' || strcasecmp($v, 'na') === 0 || strcasecmp($v, 'n/a') === 0) {
                    return null;
                }
                return $v;
            }
            return $value;
        };
        
        $normalizeArray = function ($value) {
            if ($value === null) return null;
            if (is_array($value)) {
                $filtered = array_filter(array_map(function($v) {
                    return is_string($v) ? trim($v) : $v;
                }, $value), function($v) {
                    if (!is_string($v)) return true;
                    $v = trim($v);
                    return !($v === '' || $v === '-' || $v === '—' || $v === '?' || strcasecmp($v, 'na') === 0 || strcasecmp($v, 'n/a') === 0);
                });
                return !empty($filtered) ? json_encode($filtered, JSON_UNESCAPED_UNICODE) : null;
            }
            if (is_string($value)) {
                $v = trim($value);
                if ($v === '' || $v === '-' || $v === '—' || $v === '?' || strcasecmp($v, 'na') === 0 || strcasecmp($v, 'n/a') === 0) {
                    return null;
                }
                return json_encode([$v], JSON_UNESCAPED_UNICODE);
            }
            return null;
        };

        if (!file_exists($jsonPath)) {
            $this->command->error("File tidak ditemukan: {$jsonPath}");
            return;
        }

        $this->command->info("Membaca file JSON hilirisasi...");

        $jsonContent = file_get_contents($jsonPath);
        if (substr($jsonContent, 0, 3) === "\xEF\xBB\xBF") {
            $jsonContent = substr($jsonContent, 3);
        }
        $jsonContent = str_replace(['NaN', 'Infinity', '-Infinity'], 'null', $jsonContent);

        $data = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Error parsing JSON: " . json_last_error_msg());
            return;
        }

        $hilirisasiData = $data['Data'] ?? [];
        $total = count($hilirisasiData);
        $this->command->info("Ditemukan {$total} data hilirisasi");

        DB::table('hilirisasi')->truncate();
        $this->command->info("Mengimport data hilirisasi...");

        $chunkSize = 500;
        $inserted = 0;
        $skipped = 0;
        $errors = 0;
        $duplikasi = 0;

        $bar = $this->command->getOutput()->createProgressBar($total);
        $bar->start();

        $validateCoords = function ($lat, $lon) {
            $lat = (float) $lat;
            $lon = (float) $lon;
            if ($lat < -90 || $lat > 90 || $lon < -180 || $lon > 180) {
                return [null, null];
            }
            return [$lat, $lon];
        };

        $seen = []; // Peta array untuk melacak duplikat judul+institusi

        foreach (array_chunk($hilirisasiData, $chunkSize) as $chunk) {
            $insertData = [];

            foreach ($chunk as $item) {
                $judul = $normalize($item['Judul'] ?? null) ?? '';
                $perguruanTinggi = $normalize($item['Perguruan Tinggi'] ?? null) ?? '';
                
                if (empty($judul) || empty($perguruanTinggi)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $namaField = $normalize($item['Nama Pengusul'] ?? null) ?? '';
                // Buat kunci unik dari Judul dan Pengusul
                $uniqueKey = md5(strtolower($judul . '|' . $namaField));
                if (isset($seen[$uniqueKey])) {
                    $duplikasi++;
                    $bar->advance();
                    continue; // Lewati duplikat
                }
                $seen[$uniqueKey] = true;

                $latRaw = $item['pt_latitude'] ?? null;
                $lonRaw = $item['pt_longitude'] ?? null;
                $lat = null;
                $lon = null;

                if (is_numeric($latRaw) && is_numeric($lonRaw)) {
                    [$lat, $lon] = $validateCoords($latRaw, $lonRaw);
                }

                $insertData[] = [
                    'tahun' => isset($item['Tahun']) && is_numeric($item['Tahun']) ? (int)$item['Tahun'] : null,
                    'id_proposal' => isset($item['ID Proposal']) && is_numeric($item['ID Proposal']) ? (int)$item['ID Proposal'] : 0,
                    'judul' => $judul ? $toTitleCase($judul) : 'tidak tersedia',
                    'nama_pengusul' => $namaField ?: 'tidak tersedia',
                    'direktorat' => $normalize($item['Direktorat'] ?? null) ?: 'tidak tersedia',
                    'perguruan_tinggi' => $perguruanTinggi ?: 'tidak tersedia',
                    'pt_latitude' => $lat,
                    'pt_longitude' => $lon,
                    'provinsi' => $item['provinsi'] ? $toTitleCase($normalize($item['provinsi'])) : 'tidak tersedia',
                    'mitra' => $item['Mitra'] ? $toTitleCase($normalize($item['Mitra'])) : 'tidak tersedia',
                    'skema' => $normalize($item['Skema'] ?? null) ?: 'tidak tersedia',
                    'luaran' => $normalizeArray($item['Luaran'] ?? null),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $inserted++;
                $bar->advance();
            }

            if ($insertData) {
                try {
                    DB::table('hilirisasi')->insert($insertData);
                } catch (\Exception $e) {
                    $errors++;
                    $this->command->warn("  Error inserting batch: " . $e->getMessage());
                }
            }
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info("✓ Hilirisasi: Total={$total}, Inserted={$inserted}, Skipped={$skipped}, Duplikat={$duplikasi}, Errors={$errors}, DB Total=" . DB::table('hilirisasi')->count());
    }
}
