<?php

namespace Database\Seeders;

use App\Models\Hilirisasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HilirisasiSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = base_path('../peta-bima/data/data-hilirisasi.json');

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
                $judul = trim($item['Judul'] ?? '');
                $perguruanTinggi = trim($item['Perguruan Tinggi'] ?? '');
                
                if (empty($judul) || empty($perguruanTinggi)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $insertData[] = [
                    'tahun' => isset($item['Tahun']) && is_numeric($item['Tahun']) ? (int)$item['Tahun'] : null,
                    'id_proposal' => isset($item['ID Proposal']) && is_numeric($item['ID Proposal']) ? (int)$item['ID Proposal'] : null,
                    'judul' => $judul,
                    'nama_pengusul' => !empty($item['Nama Pengusul']) ? trim($item['Nama Pengusul']) : null,
                    'direktorat' => !empty($item['Direktorat']) ? trim($item['Direktorat']) : null,
                    'perguruan_tinggi' => $perguruanTinggi,
                    'pt_latitude' => isset($item['pt_latitude']) && is_numeric($item['pt_latitude']) ? (float)$item['pt_latitude'] : null,
                    'pt_longitude' => isset($item['pt_longitude']) && is_numeric($item['pt_longitude']) ? (float)$item['pt_longitude'] : null,
                    'provinsi' => !empty($item['provinsi']) ? trim($item['provinsi']) : null,
                    'mitra' => !empty($item['Mitra']) ? trim($item['Mitra']) : null,
                    'skema' => !empty($item['Skema']) ? trim($item['Skema']) : null,
                    'luaran' => !empty($item['Luaran']) ? trim($item['Luaran']) : null,
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
