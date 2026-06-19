<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Modules\Penelitian\Controllers\Api\PenelitianController;
use App\Modules\Hilirisasi\Controllers\Api\HilirisasiController;
use App\Modules\Pengabdian\Controllers\Api\PengabdianController;
use App\Modules\Permasalahan\Controllers\Api\PermasalahanController;
use App\Modules\Produk\Controllers\Api\ProdukController;
use App\Modules\FasilitasLab\Controllers\Api\FasilitasLabController;
use App\Modules\Dashboard\Controllers\Api\AdminStatsController;
use App\Modules\RumusanMasalah\Controllers\Api\RumusanMasalahApiController;
use App\Modules\Region\Controllers\RegionController;
use App\Modules\Produk\Controllers\Admin\ProdukController as AdminProdukController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Regional & Campus proxies
Route::get('/provinces', [RegionController::class, 'provinces']);
Route::get('/regencies/{provinceId}', [RegionController::class, 'regencies']);
Route::get('/campuses/search', [RegionController::class, 'searchCampus']);

// Endpoint Penelitian
Route::prefix('penelitian')->group(function () {
    Route::get('/', [PenelitianController::class, 'index']);
    Route::get('/export', [PenelitianController::class, 'export']);
    Route::get('/statistics', [PenelitianController::class, 'statistics']);
    Route::get('/{id}', [PenelitianController::class, 'show']);
});

// Endpoint Hilirisasi
Route::prefix('hilirisasi')->group(function () {
    Route::get('/', [HilirisasiController::class, 'index']);
    Route::get('/export', [HilirisasiController::class, 'export']);
    Route::get('/{id}', [HilirisasiController::class, 'show']);
});

// Endpoint Pengabdian
Route::prefix('pengabdian')->group(function () {
    Route::get('/', [PengabdianController::class, 'index']);
    Route::get('/export', [PengabdianController::class, 'export']);
    Route::get('/{id}', [PengabdianController::class, 'show']);
});

// Endpoint Permasalahan
Route::prefix('permasalahan')->group(function () {
    Route::get('/', [PermasalahanController::class, 'index']);
    Route::get('/provinsi/{provinsi}', [PermasalahanController::class, 'byProvinsi']);
    Route::get('/statistics', [PermasalahanController::class, 'statistics']);
});

// Endpoint Produk
Route::prefix('produk')->group(function () {
    Route::get('/', [ProdukController::class, 'index']);
    Route::get('/export', [ProdukController::class, 'export']);
    Route::get('/statistics', [ProdukController::class, 'statistics']);
    Route::get('/{id}', [ProdukController::class, 'show']);
});

// Admin Produk endpoints
Route::prefix('admin/produk')->group(function () {
    Route::get('/provinces', [AdminProdukController::class, 'getProvinces']);
});

// Fasilitas Lab endpoints
Route::prefix('fasilitas-lab')->group(function () {
    Route::get('/', [FasilitasLabController::class, 'index']);
    Route::get('/{id}', [FasilitasLabController::class, 'show']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString()
    ]);
});

// Rumusan Masalah API (single endpoint)
Route::get('/rumusan-masalah', [RumusanMasalahApiController::class, 'index']);