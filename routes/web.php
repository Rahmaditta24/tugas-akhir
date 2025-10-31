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
    Route::get('/penelitian', [\App\Http\Controllers\Admin\PenelitianController::class, 'index'])->name('penelitian.index');
    Route::get('/penelitian/create', [\App\Http\Controllers\Admin\PenelitianController::class, 'create'])->name('penelitian.create');
    Route::post('/penelitian', [\App\Http\Controllers\Admin\PenelitianController::class, 'store'])->name('penelitian.store');
    Route::get('/penelitian/{penelitian}/edit', [\App\Http\Controllers\Admin\PenelitianController::class, 'edit'])->name('penelitian.edit');
    Route::put('/penelitian/{penelitian}', [\App\Http\Controllers\Admin\PenelitianController::class, 'update'])->name('penelitian.update');
    Route::delete('/penelitian/{penelitian}', [\App\Http\Controllers\Admin\PenelitianController::class, 'destroy'])->name('penelitian.destroy');
});
