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

        foreach (array_chunk($penelitianData, $chunkSize) as $chunk) {
            $insertData = [];

            foreach ($chunk as $item) {
                // Sama seperti peta-bima: ambil semua data tanpa filter
                // (peta-bima/js/script.js line 606: "Tidak filter lagi, ambil semua data")
                $institusi = isset($item['institusi']) ? trim($item['institusi']) : '';
                $judul = isset($item['judul']) ? trim($item['judul']) : '';
                
                // Hanya skip jika KEDUA field benar-benar kosong (null/empty setelah trim)
                // Ini lebih longgar daripada sebelumnya yang skip jika SALAH SATU kosong
                if (empty($institusi) && empty($judul)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $insertData[] = [
                    'nama' => !empty($item['nama']) ? trim($item['nama']) : null,
                    'nidn' => isset($item['nidn']) && is_numeric($item['nidn']) ? (int)$item['nidn'] : null,
                    'nuptk' => !empty($item['nuptk']) ? trim($item['nuptk']) : null,
                    'institusi' => $institusi,
                    'pt_latitude' => isset($item['pt_latitude']) && is_numeric($item['pt_latitude']) ? (float)$item['pt_latitude'] : null,
                    'pt_longitude' => isset($item['pt_longitude']) && is_numeric($item['pt_longitude']) ? (float)$item['pt_longitude'] : null,
                    'kode_pt' => !empty($item['kode_pt']) ? trim($item['kode_pt']) : null,
                    'jenis_pt' => !empty($item['jenis_pt']) ? trim($item['jenis_pt']) : null,
                    'kategori_pt' => !empty($item['kategori_pt']) ? trim($item['kategori_pt']) : null,
                    'institusi_pilihan' => !empty($item['institusi_pilihan']) ? trim($item['institusi_pilihan']) : null,
                    'klaster' => !empty($item['klaster']) ? trim($item['klaster']) : null,
                    'provinsi' => !empty($item['provinsi']) ? trim($item['provinsi']) : null,
                    'kota' => !empty($item['kota']) ? trim($item['kota']) : null,
                    'judul' => $judul,
                    'skema' => !empty($item['skema']) ? trim($item['skema']) : null,
                    'thn_pelaksanaan' => isset($item['thn_pelaksanaan']) && is_numeric($item['thn_pelaksanaan']) ? (int)$item['thn_pelaksanaan'] : null,
                    'bidang_fokus' => !empty($item['bidang_fokus']) ? trim($item['bidang_fokus']) : null,
                    'tema_prioritas' => !empty($item['tema_prioritas']) ? trim($item['tema_prioritas']) : null,
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
