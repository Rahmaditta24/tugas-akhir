<?php
$path = 'database/data/data-pengabdian.json';
$json = file_get_contents($path);
$json = str_replace(['NaN', 'Infinity', '-Infinity'], 'null', $json);
$data = json_decode($json, true);

$kosabangsa = $data['Kosabangsa'] ?? [];
$skipped = [];
$seen = [];
$duplikasi = 0;

foreach ($kosabangsa as $index => $item) {
    $judul = trim($item['judul'] ?? '');
    $namaInstitusi = trim($item['nama_institusi'] ?? $item['nama_institusi_pelaksana'] ?? '');
    $nama = trim($item['nama'] ?? $item['nama_ketua'] ?? $item['nama_pelaksana'] ?? '');

    // Check for empty required fields
    if (empty($judul) || empty($namaInstitusi) || empty($nama)) {
        $skipped[] = "Index $index: Data tidak lengkap (Judul: '$judul', Nama: '$nama', Institusi: '$namaInstitusi')";
        continue;
    }

    // Check for duplicates
    $uniqueKey = md5(strtolower($judul . '|' . $nama . '|' . $namaInstitusi));
    if (isset($seen[$uniqueKey])) {
        $duplikasi++;
        $skipped[] = "Index $index: Duplikasi ditemukan untuk '$judul'";
        continue;
    }
    $seen[$uniqueKey] = true;
}

echo "Total Data di JSON: " . count($kosabangsa) . "\n";
echo "Jumlah Duplikat: $duplikasi\n";
echo "Jumlah Skipped (Kosong): " . (count($skipped) - $duplikasi) . "\n";
foreach ($skipped as $s) echo "- $s\n";
