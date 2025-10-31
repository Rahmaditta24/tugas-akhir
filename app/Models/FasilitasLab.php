<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FasilitasLab extends Model
{
    use HasFactory;

    protected $table = 'fasilitas_lab';

    protected $fillable = [
        'institusi',
        'latitude',
        'longitude',
        'provinsi',
        'status_akses',
        // updated structure
        'kode_universitas',
        'kategori_pt',
        'fakultas',
        'departemen',
        'nama_laboratorium',
        'jenis_laboratorium',
        'standar_akreditasi',
        'jam_mulai',
        'jam_selesai',
        'jumlah_akses',
        'kota',
        'kecamatan',
        'total_jumlah_alat',
        'nama_alat',
        'deskripsi_alat',
        'tautan_gambar',
        'kontak',
        'tautan',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'jumlah_akses' => 'integer',
        'total_jumlah_alat' => 'integer',
    ];

    // Scopes
    public function scopeByProvinsi($query, $provinsi)
    {
        return $query->where('provinsi', $provinsi);
    }

    public function scopeByJenisLab($query, $jenisLab)
    {
        return $query->where('jenis_laboratorium', $jenisLab);
    }

    public function scopeByStatusAkses($query, $statusAkses)
    {
        return $query->where('status_akses', $statusAkses);
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->where(function($q) use ($keyword) {
            $q->where('nama_laboratorium', 'like', "%{$keyword}%")
              ->orWhere('institusi', 'like', "%{$keyword}%");
        });
    }
}
