<?php

namespace App\Modules\Produk\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUserOwnership;

class Produk extends Model
{
    use HasFactory, HasUserOwnership;

    protected $table = 'produk';

    protected $fillable = [
        'user_id',
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
        'deskripsi_paten',
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


