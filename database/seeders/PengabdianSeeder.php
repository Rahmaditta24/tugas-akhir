<?php

namespace Database\Seeders;

use App\Models\Pengabdian;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PengabdianSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data/data-pengabdian.json');
        $toTitleCase = function ($str) {
            if (!$str || $str === 'tidak tersedia')
                return $str;
            $res = mb_convert_case($str, MB_CASE_TITLE, "UTF-8");
            // Fix PT and CV capitalization including with dots
            $res = preg_replace('/\bPt\.?\b/i', 'PT', $res);
            $res = preg_replace('/\bCv\.?\b/i', 'CV', $res);
            return $res;
        };

        $normalize = function ($value) {
            if ($value === null)
                return null;
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

        $seen = []; // Menyimpan state duplikasi

        foreach (array_chunk($allData, $chunkSize) as $chunk) {
            $insertData = [];

            foreach ($chunk as $item) {
                $judul = $normalize($item['judul'] ?? null) ?? '';
                $namaInstitusi = $normalize($item['nama_institusi'] ?? $item['nama_institusi_pelaksana'] ?? null) ?? '';
                $nama = $normalize(($item['nama'] ?? $item['nama_ketua'] ?? $item['nama_pelaksana'] ?? null)) ?? '';

                if (empty($judul) || empty($namaInstitusi) || empty($nama)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $batchType = $normalize($item['batch_type'] ?? null) ?? '';

                // Mencegah duplikasi: Judul + Nama + Institusi
                $uniqueKey = md5(strtolower($judul . '|' . $nama . '|' . $namaInstitusi));
                if (isset($seen[$uniqueKey])) {
                    $duplikasi++;
                    $bar->advance();
                    continue; // Skip duplicate
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
                    'batch_type' => $batchType,
                    'nama' => $nama ?: null,
                    'nidn' => $normalize(($item['nidn'] ?? $item['nidn_ketua'] ?? $item['nidn_pelaksana'] ?? null)),
                    'nama_institusi' => $namaInstitusi,
                    'pt_latitude' => $lat,
                    'pt_longitude' => $lon,
                    'kd_perguruan_tinggi' => $normalize($item['kd_perguruan_tinggi'] ?? null),
                    'wilayah_lldikti' => $normalize($item['wilayah_lldikti'] ?? null),
                    'ptn_pts' => $normalize($item['ptn/pts'] ?? null),
                    'kab_pt' => $normalize($item['Kab PT'] ?? null),
                    'prov_pt' => isset($item['Prov PT']) || isset($item['provinsi_mitra']) ? $toTitleCase($normalize(($item['Prov PT'] ?? $item['provinsi_mitra'] ?? null))) : null,
                    'klaster' => $normalize($item['klaster'] ?? null),
                    'judul' => $toTitleCase($judul),
                    'nama_singkat_skema' => $normalize($item['nama_singkat_skema'] ?? null),
                    'thn_pelaksanaan_kegiatan' => (($thn = ($item['thn_pelaksanaan_kegiatan'] ?? $item['thn_pelaksanaan'] ?? null)) && is_numeric($thn)) ? (int) $thn : null,
                    'urutan_thn_kegitan' => isset($item['urutan_thn_kegitan']) && is_numeric($item['urutan_thn_kegitan']) ? (int) $item['urutan_thn_kegitan'] : null,
                    'nama_skema' => $normalize($item['nama_skema'] ?? null),
                    'bidang_fokus' => $normalize($item['bidang_fokus'] ?? null),
                    'prov_mitra' => isset($item['prov_mitra']) || isset($item['provinsi_mitra']) ? $toTitleCase($normalize(($item['prov_mitra'] ?? $item['provinsi_mitra'] ?? null))) : null,
                    'kab_mitra' => $normalize(($item['kab_mitra'] ?? $item['lokus'] ?? null)),
                    'nama_pendamping' => $normalize($item['nama_pendamping'] ?? null),
                    'nidn_pendamping' => $normalize($item['nidn_pendamping'] ?? null),
                    'kd_perguruan_tinggi_pendamping' => $normalize($item['kd_perguruan_tinggi_pendamping'] ?? null),
                    'institusi_pendamping' => $normalize($item['institusi_pendamping'] ?? null),
                    'lldikti_wilayah_pendamping' => $normalize($item['lldikti_wilayah_pendamping'] ?? null),
                    'jenis_wilayah_provinsi_mitra' => $normalize(($item['jenis_wilayah_provinsi_mitra'] ?? $item['jenis_wilayah_provinsi_mitra'] ?? null)),
                    'bidang_teknologi_inovasi' => $normalize(($item['bidang_teknologi_inovasi'] ?? $item['bidang_teknologi'] ?? null)),
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
        $this->command->info("✓ Pengabdian: Total={$total}, Inserted={$inserted}, Skipped={$skipped}, Duplikat={$duplikasi}, Errors={$errors}, DB Total=" . DB::table('pengabdian')->count());
    }
}
