<?php

namespace Database\Seeders;

use App\Models\Pengabdian;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PengabdianSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = base_path('../peta-bima/data/data-pengabdian.json');
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

        $this->command->info("Membaca file JSON pengabdian...");

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

        DB::table('pengabdian')->truncate();
        $this->command->info("Mengimport data pengabdian...");

        $allData = [];

        if (isset($data['Multitahun Lanjutan']) && is_array($data['Multitahun Lanjutan'])) {
            foreach ($data['Multitahun Lanjutan'] as $item) {
                $allData[] = array_merge($item, ['batch_type' => 'multitahun_lanjutan']);
            }
        }

        if (isset($data['Batch I']) && is_array($data['Batch I'])) {
            foreach ($data['Batch I'] as $item) {
                $allData[] = array_merge($item, ['batch_type' => 'batch_i']);
            }
        }

        if (isset($data['Batch II']) && is_array($data['Batch II'])) {
            foreach ($data['Batch II'] as $item) {
                $allData[] = array_merge($item, ['batch_type' => 'batch_ii']);
            }
        }

        if (isset($data['Kosabangsa']) && is_array($data['Kosabangsa'])) {
            foreach ($data['Kosabangsa'] as $item) {
                $allData[] = array_merge($item, ['batch_type' => 'kosabangsa']);
            }
        }

        $total = count($allData);
        $this->command->info("Ditemukan {$total} data pengabdian");

        $chunkSize = 500;
        $inserted = 0;
        $skipped = 0;
        $errors = 0;

        $bar = $this->command->getOutput()->createProgressBar($total);
        $bar->start();

        foreach (array_chunk($allData, $chunkSize) as $chunk) {
            $insertData = [];

            foreach ($chunk as $item) {
                $judul = $normalize($item['judul'] ?? null) ?? '';
                $namaInstitusi = $normalize($item['nama_institusi'] ?? $item['nama_institusi_pelaksana'] ?? null) ?? '';

                if (empty($judul) || empty($namaInstitusi)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $insertData[] = [
                    'batch_type' => $normalize($item['batch_type'] ?? null),
                    'nama' => $normalize(($item['nama'] ?? $item['nama_ketua'] ?? $item['nama_pelaksana'] ?? null)),
                    'nidn' => $normalize(($item['nidn'] ?? $item['nidn_ketua'] ?? $item['nidn_pelaksana'] ?? null)),
                    'nama_institusi' => $namaInstitusi,
                    'pt_latitude' => isset($item['pt_latitude']) && is_numeric($item['pt_latitude']) ? (float)$item['pt_latitude'] : null,
                    'pt_longitude' => isset($item['pt_longitude']) && is_numeric($item['pt_longitude']) ? (float)$item['pt_longitude'] : null,
                    'kd_perguruan_tinggi' => $normalize($item['kd_perguruan_tinggi'] ?? null),
                    'wilayah_lldikti' => $normalize($item['wilayah_lldikti'] ?? null),
                    'ptn_pts' => $normalize($item['ptn/pts'] ?? null),
                    'kab_pt' => $normalize($item['Kab PT'] ?? null),
                    'prov_pt' => $normalize(($item['Prov PT'] ?? $item['provinsi_mitra'] ?? null)),
                    'klaster' => $normalize($item['klaster'] ?? null),
                    'judul' => $judul,
                    'nama_singkat_skema' => $normalize($item['nama_singkat_skema'] ?? null),
                    'thn_pelaksanaan_kegiatan' => (($thn = ($item['thn_pelaksanaan_kegiatan'] ?? $item['thn_pelaksanaan'] ?? null)) && is_numeric($thn)) ? (int)$thn : null,
                    'urutan_thn_kegitan' => isset($item['urutan_thn_kegitan']) && is_numeric($item['urutan_thn_kegitan']) ? (int)$item['urutan_thn_kegitan'] : null,
                    'nama_skema' => $normalize($item['nama_skema'] ?? null),
                    'bidang_fokus' => $normalize($item['bidang_fokus'] ?? null),
                    'prov_mitra' => $normalize(($item['prov_mitra'] ?? $item['provinsi_mitra'] ?? null)),
                    'kab_mitra' => $normalize(($item['kab_mitra'] ?? $item['lokus'] ?? null)),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $inserted++;
                $bar->advance();
            }

            if ($insertData) {
                try {
                    DB::table('pengabdian')->insert($insertData);
                } catch (\Exception $e) {
                    $errors++;
                    $this->command->warn("  Error inserting batch: " . $e->getMessage());
                }
            }
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info("✓ Pengabdian: Total={$total}, Inserted={$inserted}, Skipped={$skipped}, Errors={$errors}, DB Total=" . DB::table('pengabdian')->count());
    }
}
