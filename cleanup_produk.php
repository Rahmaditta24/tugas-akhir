<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Produk;
use Illuminate\Support\Facades\DB;

$jsonPath = 'c:/laragon/www/tugas-akhir_FIX/peta-bima/data/data-produk-hilirisasi.json';
if (!file_exists($jsonPath)) {
    die("File JSON tidak ditemukan!\n");
}

$jsonContent = file_get_contents($jsonPath);
$jsonContent = str_replace(': NaN', ': null', $jsonContent);
$data = json_decode($jsonContent, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    die("JSON Decode Error: " . json_last_error_msg() . "\n");
}

if (!$data || !isset($data['Data'])) {
    die("Data key not found in JSON!\n");
}

echo "Memulai sinkronisasi data produk...\n";

DB::beginTransaction();
try {
    // Opsional: Kosongkan tabel produk jika ingin fresh start
    // Produk::truncate();

    foreach ($data['Data'] as $item) {
        $institusi = $item['Institusi'] ?? 'tidak tersedia';
        $namaProduk = $item['Nama Produk Siap Investasi'] ?? 'tidak tersedia';
        
        // Parsing Nomor dan Deskripsi Paten
        $rawPaten = $item['Nomor dan Deskripsi Paten'] ?? '';
        $nomorPaten = 'tidak tersedia';
        $detailPaten = 'tidak tersedia';

        if ($rawPaten && $rawPaten !== 'NaN' && $rawPaten !== 'NaN' && !is_null($rawPaten)) {
            // Logic split: Cari ". Diskripsi:" atau ". Deskripsi:" atau koma pertama
            // Contoh: "S00202409180. Diskripsi: Dalam invensi..."
            if (preg_match('/^(.*?)\.\s*(Diskripsi|Deskripsi):\s*(.*)$/i', $rawPaten, $matches)) {
                $nomorPaten = trim($matches[1]);
                $detailPaten = trim($matches[3]);
            } elseif (preg_match('/^(.*?),\s*(.*)$/', $rawPaten, $matches)) {
                 $nomorPaten = trim($matches[1]);
                 $detailPaten = trim($matches[2]);
            } else {
                $nomorPaten = trim($rawPaten);
                $detailPaten = 'tidak tersedia';
            }
        }

        // Cari atau buat data
        Produk::updateOrCreate(
            [
                'institusi' => $institusi,
                'nama_produk' => $namaProduk,
            ],
            [
                'latitude' => is_numeric($item['Latitude']) ? $item['Latitude'] : null,
                'longitude' => is_numeric($item['Longitude']) ? $item['Longitude'] : null,
                'provinsi' => $item['Provinsi'] ?? 'tidak tersedia',
                'deskripsi_produk' => $item['Deskripsi Produk'] ?? 'tidak tersedia',
                'tkt' => is_numeric($item['TIngkat Kesiapterapan Teknologi (TKT)']) ? $item['TIngkat Kesiapterapan Teknologi (TKT)'] : 0,
                'bidang' => $item['Bidang'] ?? 'tidak tersedia',
                'nama_inventor' => $item['Nama Inventor (Tanpa Gelar)'] ?? 'tidak tersedia',
                'email_inventor' => $item['Email Inventor'] ?? 'tidak tersedia',
                'nomor_paten' => $nomorPaten,
                'detail_paten' => $detailPaten,
            ]
        );
    }

    DB::commit();
    echo "Sinkronisasi selesai! Data produk telah dikonsistenkan.\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Gagal: " . $e->getMessage() . "\n";
}
