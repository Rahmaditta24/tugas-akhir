<?php

use App\Models\Penelitian;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$jsonPath = 'c:\laragon\www\tugas-akhir - Copy\peta-bima\data\data-penelitian.json';

if (!file_exists($jsonPath)) {
    die("JSON file not found at: $jsonPath\n");
}

echo "Opening JSON file...\n";
$handle = fopen($jsonPath, "r");
if (!$handle) {
    die("Failed to open file.\n");
}

$count = 0;
$updated = 0;
$buffer = "";
$inRecord = false;

echo "Processing records...\n";

// We read in chunks to handle the 48MB file reasonably
while (!feof($handle)) {
    $chunk = fread($handle, 8192);
    $buffer .= $chunk;

    // Very simple "parser" to find objects { ... }
    // This assumes the JSON is pretty-printed as seen in view_file
    while (($startPos = strpos($buffer, '{')) !== false && ($endPos = strpos($buffer, '}', $startPos)) !== false) {
        $recordRaw = substr($buffer, $startPos, $endPos - $startPos + 1);
        $buffer = substr($buffer, $endPos + 1);

        // Extract nama, judul, and nuptk using regex on the RAW string to avoid float issues
        preg_match('/"nama"\s*:\s*"(.*?)"/', $recordRaw, $mNama);
        preg_match('/"judul"\s*:\s*"(.*?)"/', $recordRaw, $mJudul);
        preg_match('/"nuptk"\s*:\s*(\d+)(\.0)?,/', $recordRaw, $mNuptk);

        if (isset($mNama[1]) && isset($mJudul[1]) && isset($mNuptk[1])) {
            $nama = $mNama[1];
            $judul = $mJudul[1];
            $correctNuptk = $mNuptk[1];

            // Only update if it looks like a long NUPTK that might have been truncated
            // (e.g. ends in 00 or just for any record found)
            // To be safe and thorough, we update all that we find.
            
            $affected = DB::table('penelitian')
                ->where('nama', $nama)
                ->where('judul', $judul)
                ->where('nuptk', '!=', $correctNuptk)
                ->update(['nuptk' => $correctNuptk]);

            if ($affected > 0) {
                $updated++;
                if ($updated % 100 === 0) {
                    echo "Updated $updated records...\n";
                }
            }
        }
        $count++;
    }
}

fclose($handle);
echo "Finished. Checked $count records. Updated $updated NUPTK values with correct precision.\n";
