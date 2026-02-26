<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\PenelitianController;
use App\Http\Controllers\PengabdianPageController;
use App\Http\Controllers\HilirisasiPageController;
use App\Http\Controllers\FasilitasLabPageController;
use App\Http\Controllers\PermasalahanPageController;
use App\Http\Controllers\RumusanMasalahPageController;
use App\Http\Controllers\ProdukPageController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\RumusanMasalahCategoryController;
use App\Http\Controllers\Admin\RumusanMasalahStatementController;

Route::get('/', [PenelitianController::class, 'index'])->name('penelitian.index');

// API routes for export
Route::get('/api/penelitian/export', [PenelitianController::class, 'export'])->name('penelitian.export');
Route::get('/api/research/{type}/{id}', [PenelitianController::class, 'getDetail'])->name('research.detail');


Route::get('/pengabdian', [PengabdianPageController::class, 'index'])->name('pengabdian.index');
Route::get('/hilirisasi', [HilirisasiPageController::class, 'index'])->name('hilirisasi.index');
Route::get('/produk', [ProdukPageController::class, 'index'])->name('produk.index');
Route::get('/fasilitas-lab', [FasilitasLabPageController::class, 'index'])->name('fasilitas.index');
Route::get('/permasalahan', [PermasalahanPageController::class, 'index'])->name('permasalahan.index');
Route::get('/rumusan-masalah', [RumusanMasalahPageController::class, 'index'])->name('rumusan-masalah.index');

// Admin Auth under /admin
Route::get('/admin/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/admin/login', [LoginController::class, 'login'])->name('login.attempt');
Route::post('/admin/logout', [LoginController::class, 'logout'])->name('logout');

// Forgot Password routes
Route::get('/admin/forgot-password', [ForgotPasswordController::class, 'showForm'])->name('password.request')->middleware('guest');
Route::post('/admin/forgot-password', [ForgotPasswordController::class, 'sendResetLink'])->name('password.email')->middleware('guest');
Route::get('/admin/reset-password/{token}', [ResetPasswordController::class, 'showForm'])->name('password.reset')->middleware('guest');
Route::post('/admin/reset-password', [ResetPasswordController::class, 'resetPassword'])->name('password.update')->middleware('guest');

// Smart /admin entry: show login if guest, dashboard if authenticated
Route::get('/admin', function () {
    return Auth::check()
        ? app(DashboardController::class)->index()
        : redirect()->route('login');
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
    Route::get('permasalahan/{id}/edit', [\App\Http\Controllers\Admin\PermasalahanController::class, 'edit'])->name('permasalahan.edit');
    Route::put('permasalahan/{id}', [\App\Http\Controllers\Admin\PermasalahanController::class, 'update'])->name('permasalahan.update');
    Route::delete('permasalahan/{id}', [\App\Http\Controllers\Admin\PermasalahanController::class, 'destroy'])->name('permasalahan.destroy');

    // Import JSON -> DB (temporary endpoint, auth-protected)
    Route::post('permasalahan/import', [\App\Http\Controllers\Admin\PermasalahanController::class, 'importFromFiles'])->name('permasalahan.import');

    // Rumusan Masalah Management
    Route::prefix('rumusan-masalah')->name('rumusan-masalah.')->group(function () {
        
        // Redirect /admin/rumusan-masalah to /admin/rumusan-masalah/categories
        Route::get('/', function() {
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

    // Profile Management
    Route::get('/profile', [\App\Http\Controllers\Admin\ProfileController::class, 'showProfile'])->name('profile.show');
    Route::put('/profile', [\App\Http\Controllers\Admin\ProfileController::class, 'updateProfile'])->name('profile.update');
    
    // Password Change
    Route::put('/change-password', [\App\Http\Controllers\Admin\ProfileController::class, 'updatePassword'])->name('change-password.update');
});