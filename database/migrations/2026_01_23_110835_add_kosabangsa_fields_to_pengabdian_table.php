<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pengabdian', function (Blueprint $table) {
            $table->string('nama_pendamping')->nullable()->after('judul');
            $table->string('nidn_pendamping')->nullable()->after('nama_pendamping');
            $table->string('kd_perguruan_tinggi_pendamping')->nullable()->after('nidn_pendamping');
            $table->string('institusi_pendamping')->nullable()->after('kd_perguruan_tinggi_pendamping');
            $table->string('lldikti_wilayah_pendamping')->nullable()->after('institusi_pendamping');
            $table->string('jenis_wilayah_provinsi_mitra')->nullable()->after('lldikti_wilayah_pendamping');
            $table->string('bidang_teknologi_inovasi')->nullable()->after('jenis_wilayah_provinsi_mitra');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengabdian', function (Blueprint $table) {
            $table->dropColumn([
                'nama_pendamping',
                'nidn_pendamping',
                'kd_perguruan_tinggi_pendamping',
                'institusi_pendamping',
                'lldikti_wilayah_pendamping',
                'jenis_wilayah_provinsi_mitra',
                'bidang_teknologi_inovasi'
            ]);
        });
    }
};
