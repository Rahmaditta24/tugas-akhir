<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Urutan Thn Kegiatan ===\n";
$vals = \App\Models\Pengabdian::select('urutan_thn_kegitan')->distinct()->pluck('urutan_thn_kegitan');
echo $vals->implode(', ') . "\n\n";

echo "=== Sample Records with 'Batch' in batch_type ===\n";
$batchRecs = \App\Models\Pengabdian::where('batch_type', 'like', '%Batch%')->limit(5)->get();
if ($batchRecs->isEmpty()) echo "No records found with 'Batch' in batch_type.\n";
foreach($batchRecs as $r) echo $r->batch_type . "\n";
