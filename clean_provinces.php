<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

function formatProvinsi($name) {
    if (empty($name) || strtolower($name) === 'tidak tersedia' || strtolower($name) === 'null' || $name === '-') return $name;
    $name = trim($name);
    
    // Title Case
    $formatted = mb_convert_case($name, MB_CASE_TITLE, "UTF-8");
    
    // Fixing acronyms
    $fixes = [
        'Dki Jakarta' => 'DKI Jakarta',
        'Di Yogyakarta' => 'DI Yogyakarta',
    ];
    
    return $fixes[$formatted] ?? $formatted;
}

$tables = [
    'penelitian' => ['provinsi'],
    'pengabdian' => ['prov_pt', 'prov_mitra'],
    'hilirisasi' => ['provinsi'],
    'produk' => ['provinsi'],
];

$totalUpdated = 0;

foreach ($tables as $table => $columns) {
    echo "Processing table: $table...\n";
    $rows = DB::table($table)->get();
    
    foreach ($rows as $row) {
        $update = [];
        foreach ($columns as $column) {
            $formatted = formatProvinsi($row->$column);
            if ($row->$column !== $formatted) {
                $update[$column] = $formatted;
            }
        }
        
        if (!empty($update)) {
            DB::table($table)->where('id', $row->id)->update($update);
            $totalUpdated++;
        }
    }
}

echo "Done! Total records updated: $totalUpdated\n";
