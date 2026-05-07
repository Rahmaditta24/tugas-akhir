<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Mengatur batas memori untuk menangani dataset besar
ini_set('memory_limit', '1024M');

define('LARAVEL_START', microtime(true));

// Tentukan apakah aplikasi dalam mode pemeliharaan...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Daftarkan autoloader Composer...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel dan tangani permintaan...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
