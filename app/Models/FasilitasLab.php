<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FasilitasLab extends Model
{
    protected $table = 'fasilitas_lab';
    
    protected $fillable = [
        'kode_universitas',
        'institusi',
        'kategori_pt',
        'nama_laboratorium',
        'provinsi',
        'kota',
        'latitude',
        'longitude',
        'total_jumlah_alat',
        'nama_alat',
        'deskripsi_alat',
        'kontak',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'total_jumlah_alat' => 'integer',
    ];
}