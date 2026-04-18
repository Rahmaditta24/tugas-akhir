<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function formatNumbered($text) {
    if (empty($text) || strtolower($text) === 'null') return null;
    
    // Split by newline, semicolon, or pipe
    $items = preg_split('/[\r\n;\|]+/', $text);
    
    $cleaned = [];
    foreach ($items as $item) {
        // Remove existing numberings like "1. ", "1) ", "2) " etc.
        $item = preg_replace('/^\d+[\.\)]\s*/', '', trim($item));
        if ($item !== '') {
            $cleaned[] = $item;
        }
    }
    
    if (count($cleaned) === 0) return null;
    
    // If there is only one item, don't number it?
    // Wait, the user specifically said: "1. Alat 1 \n 1. Deskripsi 1, jadi ada penomoran biar di kolom datanayaa rapih"
    // Wait, if there's only one, "1. Alat 1" is requested by the user. Let's number them anyway.
    $numbered = [];
    foreach ($cleaned as $i => $item) {
        $numbered[] = ($i + 1) . ". " . $item;
    }
    
    return implode("\n", $numbered);
}

$fasilitas = App\Models\FasilitasLab::all();
$updatedCount = 0;

foreach ($fasilitas as $item) {
    $newNamaAlat = formatNumbered($item->nama_alat);
    $newDeskripsiAlat = formatNumbered($item->deskripsi_alat);
    
    if ($item->nama_alat !== $newNamaAlat || $item->deskripsi_alat !== $newDeskripsiAlat) {
        $item->nama_alat = $newNamaAlat;
        $item->deskripsi_alat = $newDeskripsiAlat;
        $item->save();
        $updatedCount++;
    }
}

echo "Berhasil merapihkan data Fasilitas Lab. Total diperbarui: $updatedCount\n";
