<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produk;

class ProdukSeeder extends Seeder
{
    public function run(): void
    {
        $path = base_path('../peta-bima/data/data-produk-hilirisasi.json');
        if (!file_exists($path)) {
            $this->command?->warn('Produk JSON not found: ' . $path);
            return;
        }

        $contents = file_get_contents($path);

        // Strip UTF-8 BOM if present
        if (substr($contents, 0, 3) === "\xEF\xBB\xBF") {
            $contents = substr($contents, 3);
        }

        // Sanitize non-JSON tokens
        $contents = str_replace(['NaN', 'Infinity', '-Infinity'], 'null', $contents);

        $json = json_decode($contents, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command?->warn('Invalid Produk JSON format: ' . json_last_error_msg());
            return;
        }

        // Accept either { Data: [...] } or top-level array [...]
        if (isset($json['Data']) && is_array($json['Data'])) {
            $rows = $json['Data'];
        } elseif (is_array($json)) {
            $rows = $json;
        } else {
            $this->command?->warn('Invalid Produk JSON structure.');
            return;
        }
        $batch = [];
        $now = now();

        $total = count($rows);
        $inserted = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            // Minimal required: institusi and nama produk
            $institusi = (string)($row['Institusi'] ?? '');
            $namaProduk = (string)($row['Nama Produk Siap Investasi'] ?? '');
            if ($institusi === '' || $namaProduk === '') {
                $skipped++;
                continue;
            }

            $batch[] = [
                'institusi' => $institusi,
                'latitude' => isset($row['Latitude']) ? (float)$row['Latitude'] : null,
                'longitude' => isset($row['Longitude']) ? (float)$row['Longitude'] : null,
                'provinsi' => (string)($row['Provinsi'] ?? null),
                'nama_produk' => $namaProduk,
                'deskripsi_produk' => isset($row['Deskripsi Produk']) ? (string)$row['Deskripsi Produk'] : null,
                'tkt' => isset($row['TIngkat Kesiapterapan Teknologi (TKT)']) ? (int)$row['TIngkat Kesiapterapan Teknologi (TKT)'] : null,
                'bidang' => (string)($row['Bidang'] ?? null),
                'nama_inventor' => (string)($row['Nama Inventor (Tanpa Gelar)'] ?? null),
                'email_inventor' => (string)($row['Email Inventor'] ?? null),
                'nomor_paten' => isset($row['Nomor dan Deskripsi Paten']) && $row['Nomor dan Deskripsi Paten'] !== 'NaN'
                    ? (string)$row['Nomor dan Deskripsi Paten']
                    : null,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($batch) >= 500) {
                Produk::insert($batch);
                $inserted += count($batch);
                $batch = [];
            }
        }

        if ($batch) {
            Produk::insert($batch);
            $inserted += count($batch);
        }

        $this->command?->info("Produk rows in JSON: {$total} | inserted: {$inserted} | skipped: {$skipped}");
        $this->command?->info('Produk seeded total in DB: ' . Produk::count());
    }
}


