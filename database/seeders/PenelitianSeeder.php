<?php

namespace Database\Seeders;

use App\Modules\Penelitian\Models\Penelitian;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PenelitianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/data-penelitian.json');

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

        // Langkah 1: Bangun Peta Referensi untuk Data Institusi
        $referenceMap = [];
        $this->command->info("Building reference map for incomplete data...");
        
        // Pindai seluruh data sekali untuk membangun peta
        foreach ($penelitianData as $item) {
            if (empty($item['institusi'])) continue;
            
            $name = trim($item['institusi']);
            // Inisialisasi jika belum ada
            if (!isset($referenceMap[$name])) {
                $referenceMap[$name] = [
                    'kota' => null,
                    'kategori_pt' => null,
                    'jenis_pt' => null,
                    'klaster' => null,
                    'provinsi' => null,
                    'kode_pt' => null,
                ];
            }

            // Perbarui referensi jika item saat ini memiliki data dan referensi bernilai null
            foreach (['kota', 'kategori_pt', 'jenis_pt', 'klaster', 'provinsi', 'kode_pt'] as $field) {
                $val = $item[$field] ?? null;
                // Periksa apakah nilai mentah valid (tidak null dan bukan 'NaN')
                if ($val !== null && $val !== 'NaN' && $referenceMap[$name][$field] === null) {
                    $referenceMap[$name][$field] = $val;
                }
            }
        }

        $validateCoords = function ($lat, $lon) {
            $lat = (float) $lat;
            $lon = (float) $lon;
            // Latitude harus antara -90 dan 90
            // Longitude harus antara -180 dan 180
            // Periksa juga apakah sesuai dengan format decimal(10,7) yang memperbolehkan maksimal 3 digit sebelum desimal
            if ($lat < -90 || $lat > 90 || $lon < -180 || $lon > 180) {
                return [null, null];
            }
            return [$lat, $lon];
        };

        foreach (array_chunk($penelitianData, $chunkSize) as $chunk) {
            $insertData = [];

            foreach ($chunk as $item) {
                // Sama seperti peta-bima: ambil semua data tanpa filter
                // Ambil semua data")
                $institusi = $normalize($item['institusi'] ?? null) ?? '';
                $judul = $normalize($item['judul'] ?? null) ?? '';
                
                // Hanya skip jika KEDUA field benar-benar kosong (null/empty setelah trim)
                if (empty($institusi) && empty($judul)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                // Mencoba mengisi data yang hilang dari peta referensi
                $ref = $referenceMap[$institusi] ?? [];

                $kategori_pt = $normalize($item['kategori_pt'] ?? null) ?? $normalize($ref['kategori_pt'] ?? null);
                $jenis_pt = $normalize($item['jenis_pt'] ?? null) ?? $normalize($ref['jenis_pt'] ?? null);
                $klaster = $normalize($item['klaster'] ?? null) ?? $normalize($ref['klaster'] ?? null);
                $provinsi = $normalize($item['provinsi'] ?? null) ?? $normalize($ref['provinsi'] ?? null);
                $kota = $normalize($item['kota'] ?? null) ?? $normalize($ref['kota'] ?? null);
                $kode_pt = $normalize($item['kode_pt'] ?? null) ?? $normalize($ref['kode_pt'] ?? null);

                $latRaw = $item['pt_latitude'] ?? null;
                $lonRaw = $item['pt_longitude'] ?? null;
                $lat = null;
                $lon = null;

                if (is_numeric($latRaw) && is_numeric($lonRaw)) {
                    [$lat, $lon] = $validateCoords($latRaw, $lonRaw);
                }

                $insertData[] = [
                    'nama' => $normalize($item['nama'] ?? null),
                    'nidn' => isset($item['nidn']) && is_numeric($item['nidn']) ? (int)$item['nidn'] : null,
                    'nuptk' => $normalize($item['nuptk'] ?? null),
                    'institusi' => $institusi,
                    'pt_latitude' => $lat,
                    'pt_longitude' => $lon,
                    'kode_pt' => $kode_pt,
                    'jenis_pt' => $jenis_pt,
                    'kategori_pt' => $kategori_pt,
                    'institusi_pilihan' => $normalize($item['institusi_pilihan'] ?? null),
                    'klaster' => $klaster,
                    'provinsi' => $provinsi,
                    'kota' => $kota,
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
