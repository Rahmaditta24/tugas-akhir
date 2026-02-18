<?php

namespace Database\Seeders;

use App\Models\Hilirisasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HilirisasiSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = base_path('../peta-bima/data/data-hilirisasi_clean.json');
        $normalize = function ($value) {
            if ($value === null) return null;
            if (is_string($value)) {
                $v = trim($value);
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

        $bar = $this->command->getOutput()->createProgressBar($total);
        $bar->start();

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

                $insertData[] = [
                    'tahun' => isset($item['Tahun']) && is_numeric($item['Tahun']) ? (int)$item['Tahun'] : null,
                    'id_proposal' => isset($item['ID Proposal']) && is_numeric($item['ID Proposal']) ? (int)$item['ID Proposal'] : null,
                    'judul' => $judul,
                    'nama_pengusul' => $normalize($item['Nama Pengusul'] ?? null),
                    'direktorat' => $normalize($item['Direktorat'] ?? null),
                    'perguruan_tinggi' => $perguruanTinggi,
                    'pt_latitude' => isset($item['pt_latitude']) && is_numeric($item['pt_latitude']) ? (float)$item['pt_latitude'] : null,
                    'pt_longitude' => isset($item['pt_longitude']) && is_numeric($item['pt_longitude']) ? (float)$item['pt_longitude'] : null,
                    'provinsi' => $normalize($item['provinsi'] ?? null),
                    'mitra' => $normalize($item['Mitra'] ?? null),
                    'skema' => $normalize($item['Skema'] ?? null),
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
        $this->command->info("✓ Hilirisasi: Total={$total}, Inserted={$inserted}, Skipped={$skipped}, Errors={$errors}, DB Total=" . DB::table('hilirisasi')->count());
    }
}
