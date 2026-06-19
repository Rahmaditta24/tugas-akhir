<?php

namespace App\Modules\Hilirisasi\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUserOwnership;

class Hilirisasi extends Model
{
    use HasFactory, HasUserOwnership;

    protected $table = 'hilirisasi';

    protected $fillable = [
        'user_id',
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
        'pt_latitude' => 'float',
        'pt_longitude' => 'float',
    ];

    // Scope pencarian dan filter
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
