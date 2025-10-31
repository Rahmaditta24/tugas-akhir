<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PenelitianController;
use Inertia\Inertia;
use App\Http\Controllers\PengabdianPageController;
use App\Http\Controllers\HilirisasiPageController;
use App\Http\Controllers\FasilitasLabPageController;
use App\Http\Controllers\PermasalahanPageController;
use App\Http\Controllers\ProdukPageController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Auth;

Route::get('/', [PenelitianController::class, 'index'])->name('penelitian.index');

// API routes for export
Route::get('/api/penelitian/export', [PenelitianController::class, 'export'])->name('penelitian.export');

Route::get('/pengabdian', [PengabdianPageController::class, 'index'])->name('pengabdian.index');

Route::get('/hilirisasi', [HilirisasiPageController::class, 'index'])->name('hilirisasi.index');

Route::get('/produk', [ProdukPageController::class, 'index'])->name('produk.index');

Route::get('/fasilitas-lab', [FasilitasLabPageController::class, 'index'])->name('fasilitas.index');

Route::get('/permasalahan', [PermasalahanPageController::class, 'index'])->name('permasalahan.index');

// Admin Auth under /admin
Route::get('/admin/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/admin/login', [LoginController::class, 'login'])->name('login.attempt');
Route::post('/admin/logout', [LoginController::class, 'logout'])->name('logout');

// Smart /admin entry: show login if guest, dashboard if authenticated
Route::get('/admin', function () {
    return Auth::check()
        ? app(DashboardController::class)->index()
        : app(LoginController::class)->showLogin();
})->name('admin.dashboard');

// Admin authenticated routes
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    // Penelitian CRUD
    Route::resource('penelitian', \App\Http\Controllers\Admin\PenelitianController::class);

    // Pengabdian CRUD
    Route::resource('pengabdian', \App\Http\Controllers\Admin\PengabdianController::class);

    // Hilirisasi CRUD
    Route::resource('hilirisasi', \App\Http\Controllers\Admin\HilirisasiController::class);

    // Produk CRUD
    Route::resource('produk', \App\Http\Controllers\Admin\ProdukController::class);

    // Fasilitas Lab CRUD
    Route::resource('fasilitas-lab', \App\Http\Controllers\Admin\FasilitasLabController::class);

    // Permasalahan CRUD
    Route::get('permasalahan', [\App\Http\Controllers\Admin\PermasalahanController::class, 'index'])->name('permasalahan.index');
    Route::get('permasalahan/create', [\App\Http\Controllers\Admin\PermasalahanController::class, 'create'])->name('permasalahan.create');
    Route::post('permasalahan', [\App\Http\Controllers\Admin\PermasalahanController::class, 'store'])->name('permasalahan.store');
});
