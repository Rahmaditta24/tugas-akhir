<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermasalahanKabupaten extends Model
{
    use HasFactory;

    protected $table = 'permasalahan_kabupaten';

    protected $fillable = [
        'kabupaten_kota',
        'provinsi',
        'jenis_permasalahan',
        'nilai',
        'satuan',
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

    public function scopeByKabupaten($query, $kabupaten)
    {
        return $query->where('kabupaten_kota', $kabupaten);
    }
}
