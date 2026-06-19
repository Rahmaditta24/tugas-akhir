<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Modules\Penelitian\Controllers\Frontend\PenelitianPageController;
use App\Modules\Pengabdian\Controllers\Frontend\PengabdianPageController;
use App\Modules\Hilirisasi\Controllers\Frontend\HilirisasiPageController;
use App\Modules\FasilitasLab\Controllers\Frontend\FasilitasLabPageController;
use App\Modules\Permasalahan\Controllers\Frontend\PermasalahanPageController;
use App\Modules\RumusanMasalah\Controllers\Frontend\RumusanMasalahPageController;
use App\Modules\Produk\Controllers\Frontend\ProdukPageController;
use App\Modules\Auth\Controllers\LoginController;
use App\Modules\Dashboard\Controllers\Admin\DashboardController;
use App\Modules\RumusanMasalah\Controllers\Admin\RumusanMasalahCategoryController;
use App\Modules\RumusanMasalah\Controllers\Admin\RumusanMasalahStatementController;
use App\Modules\UserLog\Controllers\Admin\UserLogController;

Route::get('/', [PenelitianPageController::class, 'index'])->name('penelitian.index');

// API routes for export
Route::get('/api/penelitian/export', [PenelitianPageController::class, 'export'])->name('penelitian.export');
Route::get('/api/research/{type}/{id}', [PenelitianPageController::class, 'getDetail'])->name('research.detail');
Route::get('/api/map-detail/{type}', [\App\Modules\Dashboard\Controllers\Api\MapDetailController::class, 'getInstitusiDetail'])->name('api.map.detail');


Route::get('/pengabdian', [PengabdianPageController::class, 'index'])->name('pengabdian.index');
Route::get('/hilirisasi', [HilirisasiPageController::class, 'index'])->name('hilirisasi.index');
Route::get('/produk', [ProdukPageController::class, 'index'])->name('produk.index');
Route::get('/fasilitas-lab', [FasilitasLabPageController::class, 'index'])->name('fasilitas.index');
Route::get('/permasalahan', [PermasalahanPageController::class, 'index'])->name('permasalahan.index');
Route::get('/api/permasalahan/lazy-load-markers', [PermasalahanPageController::class, 'lazyLoadMarkers'])->name('permasalahan.lazy-load');
Route::get('/rumusan-masalah', [RumusanMasalahPageController::class, 'index'])->name('rumusan-masalah.index');
Route::get('/rumusan-masalah/panduan', [RumusanMasalahPageController::class, 'panduan'])->name('rumusan-masalah.panduan');

// Admin Auth under /admin
Route::get('/admin/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/admin/login', [LoginController::class, 'login'])->name('login.attempt');
Route::post('/admin/logout', [LoginController::class, 'logout'])->name('logout');

// Password Reset Routes
Route::get('/admin/forgot-password', [\App\Modules\Auth\Controllers\PasswordResetLinkController::class, 'create'])->middleware('guest')->name('password.request');
Route::post('/admin/forgot-password', [\App\Modules\Auth\Controllers\PasswordResetLinkController::class, 'store'])->middleware('guest')->name('password.email');
Route::get('/admin/reset-password/{token}', [\App\Modules\Auth\Controllers\NewPasswordController::class, 'create'])->middleware('guest')->name('password.reset');
Route::post('/admin/reset-password', [\App\Modules\Auth\Controllers\NewPasswordController::class, 'store'])->middleware('guest')->name('password.store');


// Smart /admin entry: show login if guest, dashboard if authenticated
Route::get('/admin', function () {
    return Auth::check()
        ? app(DashboardController::class)->index()
        : redirect()->route('login');
})->name('admin.dashboard');

// Admin authenticated routes
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    // Penelitian CRUD
    Route::post('penelitian/import-excel', [\App\Modules\Penelitian\Controllers\Admin\PenelitianController::class, 'importExcel'])->name('penelitian.import-excel');
    Route::get('penelitian/export-csv', [\App\Modules\Penelitian\Controllers\Admin\PenelitianController::class, 'exportCsv'])->name('penelitian.export-csv');
    Route::get('penelitian/export-json', [\App\Modules\Penelitian\Controllers\Admin\PenelitianController::class, 'exportJson'])->name('penelitian.export-json');
    Route::post('penelitian/bulk-update', [\App\Modules\Penelitian\Controllers\Admin\PenelitianController::class, 'bulkUpdate'])->name('penelitian.bulk-update');
    Route::post('penelitian/bulk-destroy', [\App\Modules\Penelitian\Controllers\Admin\PenelitianController::class, 'bulkDestroy'])->name('penelitian.bulk-destroy');
    Route::resource('penelitian', \App\Modules\Penelitian\Controllers\Admin\PenelitianController::class);

    // Pengabdian CRUD
    Route::post('pengabdian/import-excel', [\App\Modules\Pengabdian\Controllers\Admin\PengabdianController::class, 'importExcel'])->name('pengabdian.import-excel');
    Route::get('pengabdian/export-csv', [\App\Modules\Pengabdian\Controllers\Admin\PengabdianController::class, 'exportCsv'])->name('pengabdian.export-csv');
    Route::get('pengabdian/export-json', [\App\Modules\Pengabdian\Controllers\Admin\PengabdianController::class, 'exportJson'])->name('pengabdian.export-json');
    Route::post('pengabdian/bulk-destroy', [\App\Modules\Pengabdian\Controllers\Admin\PengabdianController::class, 'bulkDestroy'])->name('pengabdian.bulk-destroy');
    Route::post('pengabdian/bulk-update', [\App\Modules\Pengabdian\Controllers\Admin\PengabdianController::class, 'bulkUpdate'])->name('pengabdian.bulk-update');
    Route::resource('pengabdian', \App\Modules\Pengabdian\Controllers\Admin\PengabdianController::class);

    // Hilirisasi CRUD
    Route::post('hilirisasi/import-excel', [\App\Modules\Hilirisasi\Controllers\Admin\HilirisasiController::class, 'importExcel'])->name('hilirisasi.import-excel');
    Route::get('hilirisasi/export-csv', [\App\Modules\Hilirisasi\Controllers\Admin\HilirisasiController::class, 'exportCsv'])->name('hilirisasi.export-csv');
    Route::get('hilirisasi/export-json', [\App\Modules\Hilirisasi\Controllers\Admin\HilirisasiController::class, 'exportJson'])->name('hilirisasi.export-json');
    Route::post('hilirisasi/bulk-destroy', [\App\Modules\Hilirisasi\Controllers\Admin\HilirisasiController::class, 'bulkDestroy'])->name('hilirisasi.bulk-destroy');
    Route::post('hilirisasi/bulk-update', [\App\Modules\Hilirisasi\Controllers\Admin\HilirisasiController::class, 'bulkUpdate'])->name('hilirisasi.bulk-update');
    Route::resource('hilirisasi', \App\Modules\Hilirisasi\Controllers\Admin\HilirisasiController::class);

    // Produk CRUD
    Route::post('produk/import-excel', [\App\Modules\Produk\Controllers\Admin\ProdukController::class, 'importExcel'])->name('produk.import-excel');
    Route::get('produk/export-csv', [\App\Modules\Produk\Controllers\Admin\ProdukController::class, 'exportCsv'])->name('produk.export-csv');
    Route::get('produk/export-json', [\App\Modules\Produk\Controllers\Admin\ProdukController::class, 'exportJson'])->name('produk.export-json');
    Route::post('produk/bulk-destroy', [\App\Modules\Produk\Controllers\Admin\ProdukController::class, 'bulkDestroy'])->name('produk.bulk-destroy');
    Route::post('produk/bulk-update', [\App\Modules\Produk\Controllers\Admin\ProdukController::class, 'bulkUpdate'])->name('produk.bulk-update');
    Route::get('produk/provinces', [\App\Modules\Produk\Controllers\Admin\ProdukController::class, 'getProvinces'])->name('produk.provinces');
    Route::resource('produk', \App\Modules\Produk\Controllers\Admin\ProdukController::class);

    // Fasilitas Lab CRUD
    Route::post('fasilitas-lab/import-excel', [\App\Modules\FasilitasLab\Controllers\Admin\FasilitasLabController::class, 'importExcel'])->name('fasilitas-lab.import-excel');
    Route::get('fasilitas-lab/export-csv', [\App\Modules\FasilitasLab\Controllers\Admin\FasilitasLabController::class, 'exportCsv'])->name('fasilitas-lab.export-csv');
    Route::get('fasilitas-lab/export-json', [\App\Modules\FasilitasLab\Controllers\Admin\FasilitasLabController::class, 'exportJson'])->name('fasilitas-lab.export-json');
    Route::post('fasilitas-lab/bulk-destroy', [\App\Modules\FasilitasLab\Controllers\Admin\FasilitasLabController::class, 'bulkDestroy'])->name('fasilitas-lab.bulk-destroy');
    Route::post('fasilitas-lab/bulk-update', [\App\Modules\FasilitasLab\Controllers\Admin\FasilitasLabController::class, 'bulkUpdate'])->name('fasilitas-lab.bulk-update');
    Route::get('fasilitas-lab/provinces', [\App\Modules\FasilitasLab\Controllers\Admin\FasilitasLabController::class, 'getProvinces'])->name('fasilitas-lab.provinces');
    Route::resource('fasilitas-lab', \App\Modules\FasilitasLab\Controllers\Admin\FasilitasLabController::class);

    // Permasalahan CRUD
    Route::get('permasalahan', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'index'])->name('permasalahan.index');
    Route::get('permasalahan/create', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'create'])->name('permasalahan.create');
    Route::post('permasalahan', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'store'])->name('permasalahan.store');
    Route::get('permasalahan/{id}/edit', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'edit'])->name('permasalahan.edit');
    Route::put('permasalahan/{id}', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'update'])->name('permasalahan.update');
    Route::get('permasalahan/export-json', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'exportJson'])->name('permasalahan.export-json');
    Route::get('permasalahan/export-csv', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'exportCsv'])->name('permasalahan.export-csv');
    Route::get('permasalahan/stats', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'getStats'])->name('permasalahan.stats');
    Route::post('permasalahan/import-excel', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'importExcel'])->name('permasalahan.import-excel');
    Route::delete('permasalahan/{id}', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'destroy'])->name('permasalahan.destroy');

    // Import JSON -> DB (temporary endpoint, auth-protected)
    Route::post('permasalahan/import', [\App\Modules\Permasalahan\Controllers\Admin\PermasalahanController::class, 'importFromFiles'])->name('permasalahan.import');

    // Rumusan Masalah Management
    Route::prefix('rumusan-masalah')->name('rumusan-masalah.')->group(function () {

        // Redirect /admin/rumusan-masalah to /admin/rumusan-masalah/categories
        Route::get('/', function () {
            return redirect()->route('admin.rumusan-masalah.categories.index');
        });

        // Categories Routes
        Route::get('/categories', [RumusanMasalahCategoryController::class, 'index'])->name('categories.index'); // Changed to match resource standard
        Route::get('/categories/create', [RumusanMasalahCategoryController::class, 'create'])->name('categories.create');
        Route::post('/categories', [RumusanMasalahCategoryController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category}/edit', [RumusanMasalahCategoryController::class, 'edit'])->name('categories.edit');
        Route::put('/categories/{category}', [RumusanMasalahCategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [RumusanMasalahCategoryController::class, 'destroy'])->name('categories.destroy');

        // Statements Routes (Nested Index)
        // Access via: admin/rumusan-masalah/categories/{slug}/statements
        Route::get('/categories/{category:slug}/statements', [RumusanMasalahStatementController::class, 'index'])
            ->name('category.statements.index');

        // Statements Actions
        Route::post('/categories/{category:slug}/statements', [RumusanMasalahStatementController::class, 'store'])
            ->name('category.statements.store');

        Route::put('/categories/{slug}/statements/{id}', [RumusanMasalahStatementController::class, 'update'])
            ->name('category.statements.update');

        Route::delete('/categories/{slug}/statements/{id}', [RumusanMasalahStatementController::class, 'destroy'])
            ->name('category.statements.destroy');
    });

    // User Logs
    Route::get('user-logs', [UserLogController::class, 'index'])->name('user-logs.index');
    Route::delete('user-logs/{id}/kill-session', [UserLogController::class, 'killSession'])->name('user-logs.kill-session');

    // Admin realtime stats for dashboard
    Route::get('stats', [\App\Modules\Dashboard\Controllers\Api\AdminStatsController::class, 'index'])->name('stats.index');
    Route::get('permasalahan-breakdown', [\App\Modules\Dashboard\Controllers\Api\AdminStatsController::class, 'permasalahanBreakdown'])->name('stats.breakdown');
});