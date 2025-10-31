<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermasalahanProvinsi extends Model
{
    use HasFactory;

    protected $table = 'permasalahan_provinsi';

    protected $fillable = [
        'provinsi',
        'jenis_permasalahan',
        'nilai',
        'satuan',
        'metrik',
        'tahun',
    ];

    protected $casts = [
        'nilai' => 'float',
        'tahun' => 'integer',
    ];

    // Scopes
    public function scopeByJenisPermasalahan($query, $jenis)
    {
        return $query->where('jenis_permasalahan', $jenis);
    }

    public function scopeByProvinsi($query, $provinsi)
    {
        return $query->where('provinsi', $provinsi);
    }

    public function scopeByMetrik($query, $metrik)
    {
        return $query->where('metrik', $metrik);
    }
}
