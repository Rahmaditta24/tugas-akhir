<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penelitian extends Model
{
    use HasFactory;

    protected $table = 'penelitian';

    protected $fillable = [
        'nama',
        'nidn',
        'nuptk',
        'institusi',
        'pt_latitude',
        'pt_longitude',
        'kode_pt',
        'jenis_pt',
        'kategori_pt',
        'institusi_pilihan',
        'klaster',
        'provinsi',
        'kota',
        'judul',
        'skema',
        'thn_pelaksanaan',
        'bidang_fokus',
        'tema_prioritas',
    ];

    protected $casts = [
        'pt_latitude' => 'float',
        'pt_longitude' => 'float',
        'thn_pelaksanaan' => 'integer',
    ];

    // Scopes untuk filter
    public function scopeByProvinsi($query, $provinsi)
    {
        return $query->where('provinsi', $provinsi);
    }

    public function scopeByTahun($query, $tahun)
    {
        return $query->where('thn_pelaksanaan', $tahun);
    }

    public function scopeByBidangFokus($query, $bidangFokus)
    {
        return $query->where('bidang_fokus', $bidangFokus);
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->where(function($q) use ($keyword) {
            $q->where('judul', 'like', "%{$keyword}%")
              ->orWhere('nama', 'like', "%{$keyword}%")
              ->orWhere('institusi', 'like', "%{$keyword}%");
        });
    }
}
