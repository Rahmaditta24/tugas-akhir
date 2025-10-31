<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    use HasFactory;

    protected $table = 'produk';

    protected $fillable = [
        'institusi',
        'latitude',
        'longitude',
        'provinsi',
        'nama_produk',
        'deskripsi_produk',
        'tkt',
        'bidang',
        'nama_inventor',
        'email_inventor',
        'nomor_paten',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'tkt' => 'integer',
    ];

    public function scopeByProvinsi($query, $provinsi)
    {
        return $query->where('provinsi', $provinsi);
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->where(function($q) use ($keyword) {
            $q->where('nama_produk', 'like', "%{$keyword}%")
              ->orWhere('institusi', 'like', "%{$keyword}%")
              ->orWhere('bidang', 'like', "%{$keyword}%");
        });
    }
}


