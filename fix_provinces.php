<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Produk;

echo "Memperbaiki penulisan nama provinsi...\n";

$count = 0;
Produk::chunk(200, function($products) use (&$count) {
    foreach ($products as $p) {
        $old = $p->provinsi;
        
        // Proper Title Case for provinces
        $new = ucwords(strtolower($old));
        
        // Handle special case for DI Yogyakarta & DKI Jakarta
        $new = str_replace(['Di Yogyakarta', 'Dki Jakarta'], ['DI Yogyakarta', 'DKI Jakarta'], $new);
        
        if ($old !== $new) {
            $p->provinsi = $new;
            $p->save();
            $count++;
        }
    }
});

echo "Selesai! Berhasil memperbaiki {$count} data produk.\n";
