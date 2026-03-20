<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

ini_set('memory_limit', '1024M');

$jsonPath = 'c:/laragon/www/tugas-akhir_FIX/peta-bima/data/data-penelitian.json';
$content = file_get_contents($jsonPath);
$decoded = json_decode($content, true);

if (!$decoded) {
    echo "JSON Decode error: " . json_last_error_msg() . "\n";
    exit;
}

$data = $decoded['Data'];
$missingInJson = 0;
$missingDetails = [];

foreach($data as $idx => $item) {
    if (!isset($item['pt_latitude']) || !isset($item['pt_longitude']) || $item['pt_latitude'] === null || $item['pt_longitude'] === null || trim($item['pt_latitude']) === '' || trim($item['pt_longitude']) === '') {
        $missingInJson++;
        $missingDetails[] = "  • " . ($item['nama'] ?? 'Unknown') . " (" . ($item['institusi'] ?? 'Unknown') . ")";
    }
}
echo "Total data in JSON: " . count($data) . "\n";
echo "Missing coordinates in JSON ('data-penelitian.json'): $missingInJson\n";
if ($missingInJson > 0) {
    foreach(array_slice($missingDetails, 0, 10) as $msg) {
        echo "$msg\n";
    }
}

$missingInDb = App\Models\Penelitian::whereNull('pt_latitude')->orWhereNull('pt_longitude')->get();
echo "\nTotal missing in DB: " . $missingInDb->count() . "\n";
if ($missingInDb->count() > 0) {
    foreach($missingInDb->take(10) as $row) {
        echo "  • {$row->nama} ({$row->institusi})\n";
    }
}
