<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengabdian extends Model
{
    use HasFactory;

    protected $table = 'pengabdian';

    protected $fillable = [
        'batch_type',
        'nama',
        'nidn',
        'nama_institusi',
        'pt_latitude',
        'pt_longitude',
        'kd_perguruan_tinggi',
        'wilayah_lldikti',
        'ptn_pts',
        'kab_pt',
        'prov_pt',
        'klaster',
        'judul',
        'nama_singkat_skema',
        'thn_pelaksanaan_kegiatan',
        'urutan_thn_kegitan',
        'nama_skema',
        'bidang_fokus',
        'prov_mitra',
        'kab_mitra',
        'nama_pendamping',
        'nidn_pendamping',
        'kd_perguruan_tinggi_pendamping',
        'institusi_pendamping',
        'lldikti_wilayah_pendamping',
        'jenis_wilayah_provinsi_mitra',
        'bidang_teknologi_inovasi',
    ];

    protected $casts = [
        'pt_latitude' => 'float',
        'pt_longitude' => 'float',
        'thn_pelaksanaan_kegiatan' => 'integer',
    ];

    // Scopes
    public function scopeByBatchType($query, $batchType)
    {
        return $query->where('batch_type', $batchType);
    }

    public function scopeByProvinsi($query, $provinsi)
    {
        return $query->where('prov_pt', $provinsi);
    }

    public function scopeByTahun($query, $tahun)
    {
        return $query->where('thn_pelaksanaan_kegiatan', $tahun);
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->where(function($q) use ($keyword) {
            $q->where('judul', 'like', "%{$keyword}%")
              ->orWhere('nama', 'like', "%{$keyword}%")
              ->orWhere('nama_institusi', 'like', "%{$keyword}%");
        });
    }
}
