<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Batch I / II Check ===\n";
$batchI = \App\Models\Pengabdian::where('batch_type', 'like', '%batch_i%')->count();
$batchII = \App\Models\Pengabdian::where('batch_type', 'like', '%batch_ii%')->count();
echo "Batch I count: $batchI\n";
echo "Batch II count: $batchII\n";
