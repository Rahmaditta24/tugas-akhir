<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PenelitianController;
use Inertia\Inertia;
use App\Http\Controllers\PengabdianPageController;
use App\Http\Controllers\HilirisasiPageController;
use App\Http\Controllers\FasilitasLabPageController;
use App\Http\Controllers\PermasalahanPageController;
use App\Http\Controllers\ProdukPageController;

Route::get('/', [PenelitianController::class, 'index'])->name('penelitian.index');

Route::get('/pengabdian', [PengabdianPageController::class, 'index'])->name('pengabdian.index');

Route::get('/hilirisasi', [HilirisasiPageController::class, 'index'])->name('hilirisasi.index');

Route::get('/produk', [ProdukPageController::class, 'index'])->name('produk.index');

Route::get('/fasilitas-lab', [FasilitasLabPageController::class, 'index'])->name('fasilitas.index');

Route::get('/permasalahan', [PermasalahanPageController::class, 'index'])->name('permasalahan.index');
