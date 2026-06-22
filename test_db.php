<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$sql = "SELECT MAX(pt_latitude) as pt_latitude, MAX(pt_longitude) as pt_longitude, COUNT(*) as total_penelitian, institusi as institusi_name, MAX(provinsi) as provinsi, GROUP_CONCAT(COALESCE(bidang_fokus, '-') SEPARATOR '|') as all_fields FROM penelitian WHERE judul IS NOT NULL AND judul != '' AND (judul LIKE '%teknologi bandung%' OR nama LIKE '%teknologi bandung%' OR institusi LIKE '%teknologi bandung%') AND institusi IS NOT NULL AND institusi != '' AND institusi != '-' GROUP BY institusi HAVING MAX(pt_latitude) IS NOT NULL AND MAX(pt_longitude) IS NOT NULL AND total_penelitian > 0";

$results = DB::select($sql);
echo "ROW COUNT: " . count($results) . "\n";
echo "ROWS: \n";
echo json_encode($results, JSON_PRETTY_PRINT);
