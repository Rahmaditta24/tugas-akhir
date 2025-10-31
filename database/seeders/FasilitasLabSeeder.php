<?php

namespace Database\Seeders;

use App\Models\FasilitasLab;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FasilitasLabSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = base_path('../peta-bima/data/data-fasilitas-lab.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("File tidak ditemukan: {$jsonPath}");
            return;
        }

        $this->command->info("Membaca file JSON fasilitas lab...");

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

        $allData = [];
        foreach ($data as $sheetName => $sheetData) {
            if (is_array($sheetData)) {
                $allData = array_merge($allData, $sheetData);
            }
        }

        $total = count($allData);
        $this->command->info("Ditemukan {$total} data fasilitas lab");

        DB::table('fasilitas_lab')->truncate();
        $this->command->info("Mengimport data fasilitas lab...");

        $chunkSize = 100;
        $inserted = 0;
        $skipped = 0;
        $errors = 0;

        $bar = $this->command->getOutput()->createProgressBar($total);
        $bar->start();

        foreach (array_chunk($allData, $chunkSize) as $chunk) {
            $insertData = [];

            foreach ($chunk as $item) {
                $namaLab = trim($item['Nama Labolatorium'] ?? '');
                $institusi = trim($item['Institusi'] ?? '');

                if (empty($namaLab) || empty($institusi)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                // Combine deskripsi alat into deskripsi if available
                $deskripsi = trim($item['Deskripsi Alat'] ?? '');

                $insertData[] = [
                    'nama_lab' => $namaLab,
                    'institusi' => $institusi,
                    'latitude' => isset($item['Latitude']) && is_numeric($item['Latitude']) ? (float)$item['Latitude'] : null,
                    'longitude' => isset($item['Longitude']) && is_numeric($item['Longitude']) ? (float)$item['Longitude'] : null,
                    'provinsi' => !empty($item['Provinsi']) ? trim($item['Provinsi']) : null,
                    'kabupaten' => !empty($item['Kota']) ? trim($item['Kota']) : null,
                    'jenis_lab' => !empty($item['Jenis Labolatorium']) ? trim($item['Jenis Labolatorium']) : null,
                    'status_akses' => !empty($item['Status Akses']) ? trim($item['Status Akses']) : null,
                    'deskripsi' => !empty($deskripsi) ? $deskripsi : null,
                    'bidang' => !empty($item['Fakultas']) ? trim($item['Fakultas']) : null,
                    'tahun' => null, // Tidak ada field tahun di JSON
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $inserted++;
                $bar->advance();
            }

            if ($insertData) {
                try {
                    DB::table('fasilitas_lab')->insert($insertData);
                } catch (\Exception $e) {
                    $errors++;
                    $this->command->warn("  Error inserting batch: " . $e->getMessage());
                }
            }
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info("✓ FasilitasLab: Total={$total}, Inserted={$inserted}, Skipped={$skipped}, Errors={$errors}, DB Total=" . DB::table('fasilitas_lab')->count());
    }
}
