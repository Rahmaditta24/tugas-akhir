<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$missingInDb = App\Models\Penelitian::whereNull('pt_latitude')->orWhereNull('pt_longitude')->get();
echo "\nTotal missing in DB: " . $missingInDb->count() . "\n";
if ($missingInDb->count() > 0) {
    echo "Daftar Institusi yang hilang koordinatnya:\n";
    foreach($missingInDb as $row) {
        echo "  • {$row->institusi}\n";
    }
}
