<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PenelitianController;
use App\Http\Controllers\Api\HilirisasiController;
use App\Http\Controllers\Api\PengabdianController;
use App\Http\Controllers\Api\PermasalahanController;
use App\Http\Controllers\Api\ProdukController;
use App\Http\Controllers\Api\FasilitasLabController;
use App\Http\Controllers\Api\AdminStatsController;
use App\Http\Controllers\Api\RumusanMasalahApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Penelitian endpoints
Route::prefix('penelitian')->group(function () {
    Route::get('/', [PenelitianController::class, 'index']);
    Route::get('/export', [PenelitianController::class, 'export']);
    Route::get('/statistics', [PenelitianController::class, 'statistics']);
    Route::get('/{id}', [PenelitianController::class, 'show']);
});

// Hilirisasi endpoints
Route::prefix('hilirisasi')->group(function () {
    Route::get('/', [HilirisasiController::class, 'index']);
    Route::get('/{id}', [HilirisasiController::class, 'show']);
});

// Pengabdian endpoints
Route::prefix('pengabdian')->group(function () {
    Route::get('/', [PengabdianController::class, 'index']);
    Route::get('/{id}', [PengabdianController::class, 'show']);
});

// Permasalahan endpoints
Route::prefix('permasalahan')->group(function () {
    Route::get('/', [PermasalahanController::class, 'index']);
    Route::get('/provinsi/{provinsi}', [PermasalahanController::class, 'byProvinsi']);
    Route::get('/statistics', [PermasalahanController::class, 'statistics']);
});

// Produk endpoints
Route::prefix('produk')->group(function () {
    Route::get('/', [ProdukController::class, 'index']);
    Route::get('/statistics', [ProdukController::class, 'statistics']);
    Route::get('/{id}', [ProdukController::class, 'show']);
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

// Admin realtime stats (no worker)
Route::get('/admin/stats', [AdminStatsController::class, 'index']);
Route::get('/admin/permasalahan-breakdown', [AdminStatsController::class, 'permasalahanBreakdown']);

// Rumusan Masalah API (single endpoint)
Route::get('/rumusan-masalah', [RumusanMasalahApiController::class, 'index']);