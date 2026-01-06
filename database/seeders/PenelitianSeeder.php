<?php

namespace Database\Seeders;

use App\Models\Penelitian;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PenelitianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = base_path('../peta-bima/data/data-penelitian.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("File tidak ditemukan: {$jsonPath}");
            return;
        }

        $this->command->info("Membaca file JSON penelitian...");

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

        $penelitianData = $data['Data'] ?? [];
        $total = count($penelitianData);
        $this->command->info("Ditemukan {$total} data penelitian");

        DB::table('penelitian')->truncate();
        $this->command->info("Mengimport data penelitian...");

        $chunkSize = 500;
        $inserted = 0;
        $skipped = 0;
        $errors = 0;

        $bar = $this->command->getOutput()->createProgressBar($total);
        $bar->start();

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

        foreach (array_chunk($penelitianData, $chunkSize) as $chunk) {
            $insertData = [];

            foreach ($chunk as $item) {
                // Sama seperti peta-bima: ambil semua data tanpa filter
                // (peta-bima/js/script.js line 606: "Tidak filter lagi, ambil semua data")
                $institusi = $normalize($item['institusi'] ?? null) ?? '';
                $judul = $normalize($item['judul'] ?? null) ?? '';
                
                // Hanya skip jika KEDUA field benar-benar kosong (null/empty setelah trim)
                // Ini lebih longgar daripada sebelumnya yang skip jika SALAH SATU kosong
                if (empty($institusi) && empty($judul)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $insertData[] = [
                    'nama' => $normalize($item['nama'] ?? null),
                    'nidn' => isset($item['nidn']) && is_numeric($item['nidn']) ? (int)$item['nidn'] : null,
                    'nuptk' => $normalize($item['nuptk'] ?? null),
                    'institusi' => $institusi,
                    'pt_latitude' => isset($item['pt_latitude']) && is_numeric($item['pt_latitude']) ? (float)$item['pt_latitude'] : null,
                    'pt_longitude' => isset($item['pt_longitude']) && is_numeric($item['pt_longitude']) ? (float)$item['pt_longitude'] : null,
                    'kode_pt' => $normalize($item['kode_pt'] ?? null),
                    'jenis_pt' => $normalize($item['jenis_pt'] ?? null),
                    'kategori_pt' => $normalize($item['kategori_pt'] ?? null),
                    'institusi_pilihan' => $normalize($item['institusi_pilihan'] ?? null),
                    'klaster' => $normalize($item['klaster'] ?? null),
                    'provinsi' => $normalize($item['provinsi'] ?? null),
                    'kota' => $normalize($item['kota'] ?? null),
                    'judul' => $judul,
                    'skema' => $normalize($item['skema'] ?? null),
                    'thn_pelaksanaan' => isset($item['thn_pelaksanaan']) && is_numeric($item['thn_pelaksanaan']) ? (int)$item['thn_pelaksanaan'] : null,
                    'bidang_fokus' => $normalize($item['bidang_fokus'] ?? null),
                    'tema_prioritas' => $normalize($item['tema_prioritas'] ?? null),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $inserted++;
                $bar->advance();
            }

            if ($insertData) {
                try {
                    DB::table('penelitian')->insert($insertData);
                } catch (\Exception $e) {
                    $errors++;
                    $this->command->warn("  Error inserting batch: " . $e->getMessage());
                }
            }
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info("✓ Penelitian: Total={$total}, Inserted={$inserted}, Skipped={$skipped}, Errors={$errors}, DB Total=" . DB::table('penelitian')->count());
    }
}
