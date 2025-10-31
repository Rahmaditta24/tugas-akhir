<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hilirisasi extends Model
{
    use HasFactory;

    protected $table = 'hilirisasi';

    protected $fillable = [
        'tahun',
        'id_proposal',
        'judul',
        'nama_pengusul',
        'direktorat',
        'perguruan_tinggi',
        'pt_latitude',
        'pt_longitude',
        'provinsi',
        'mitra',
        'skema',
        'luaran',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'id_proposal' => 'integer',
        'pt_latitude' => 'float',
        'pt_longitude' => 'float',
    ];

    // Scopes
    public function scopeByProvinsi($query, $provinsi)
    {
        return $query->where('provinsi', $provinsi);
    }

    public function scopeByTahun($query, $tahun)
    {
        return $query->where('tahun', $tahun);
    }

    public function scopeBySkema($query, $skema)
    {
        return $query->where('skema', $skema);
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->where(function($q) use ($keyword) {
            $q->where('judul', 'like', "%{$keyword}%")
              ->orWhere('nama_pengusul', 'like', "%{$keyword}%")
              ->orWhere('perguruan_tinggi', 'like', "%{$keyword}%");
        });
    }
}
