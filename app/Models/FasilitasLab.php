<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FasilitasLab extends Model
{
    use HasFactory;

    protected $table = 'fasilitas_lab';

    protected $fillable = [
        'nama_lab',
        'institusi',
        'latitude',
        'longitude',
        'provinsi',
        'kabupaten',
        'jenis_lab',
        'status_akses',
        'deskripsi',
        'bidang',
        'tahun',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'tahun' => 'integer',
    ];

    // Scopes
    public function scopeByProvinsi($query, $provinsi)
    {
        return $query->where('provinsi', $provinsi);
    }

    public function scopeByJenisLab($query, $jenisLab)
    {
        return $query->where('jenis_lab', $jenisLab);
    }

    public function scopeByStatusAkses($query, $statusAkses)
    {
        return $query->where('status_akses', $statusAkses);
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->where(function($q) use ($keyword) {
            $q->where('nama_lab', 'like', "%{$keyword}%")
              ->orWhere('institusi', 'like', "%{$keyword}%");
        });
    }
}
