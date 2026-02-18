<?php

namespace Database\Seeders;

use App\Models\FasilitasLab;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FasilitasLabSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = base_path('../peta-bima/data/data-fasilitas-lab_clean.json');
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
                $namaLab = $normalize($item['Nama Labolatorium'] ?? $item['Nama Laboratorium'] ?? null) ?? '';
                $institusi = $normalize($item['Institusi'] ?? null) ?? '';

                if (empty($namaLab) || empty($institusi)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $insertData[] = [
                    'institusi' => $institusi,
                    'latitude' => isset($item['Latitude']) && is_numeric($item['Latitude']) ? (float)$item['Latitude'] : null,
                    'longitude' => isset($item['Longitude']) && is_numeric($item['Longitude']) ? (float)$item['Longitude'] : null,
                    'provinsi' => $normalize($item['Provinsi'] ?? null),
                    'status_akses' => $normalize($item['Status Akses'] ?? null),
                    // new structure mapping (best-effort from JSON)
                    'kode_universitas' => $normalize($item['Kode Universitas'] ?? null),
                    'kategori_pt' => $normalize($item['Kategori PT'] ?? null),
                    'fakultas' => $normalize($item['Fakultas'] ?? null),
                    'departemen' => $normalize($item['Departemen'] ?? null),
                    'nama_laboratorium' => $namaLab ?: null,
                    'jenis_laboratorium' => $normalize($item['Jenis Labolatorium'] ?? null),
                    'standar_akreditasi' => $normalize($item['Standar Akreditasi / Sertifikasi'] ?? null),
                    'jam_mulai' => $normalize($item['Jam Mulai Operasional'] ?? null),
                    'jam_selesai' => $normalize($item['Jam Selesai Operasional'] ?? null),
                    'jumlah_akses' => isset($item['Jumlah Akses']) && is_numeric($item['Jumlah Akses']) ? (int)$item['Jumlah Akses'] : null,
                    'kota' => $normalize($item['Kota'] ?? null),
                    'kecamatan' => $normalize($item['Kecamatan'] ?? null),
                    'total_jumlah_alat' => isset($item['Total Jumlah Alat']) && is_numeric($item['Total Jumlah Alat']) ? (int)$item['Total Jumlah Alat'] : null,
                    'nama_alat' => $normalize($item['Nama Alat'] ?? null),
                    'deskripsi_alat' => $normalize($item['Deskripsi Alat'] ?? null),
                    'tautan_gambar' => $normalize($item['Tautan Gambar'] ?? null),
                    'kontak' => $normalize($item['Kontak'] ?? null),
                    'tautan' => $normalize($item['Tautan'] ?? null),
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
