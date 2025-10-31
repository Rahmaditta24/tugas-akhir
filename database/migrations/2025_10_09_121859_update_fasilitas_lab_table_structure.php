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
        Schema::table('fasilitas_lab', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn(['nama_lab', 'kabupaten', 'jenis_lab', 'deskripsi', 'bidang', 'tahun']);

            // Add new columns to match JSON structure
            $table->string('kode_universitas')->nullable()->after('id');
            $table->string('kategori_pt')->nullable()->after('institusi');
            $table->string('fakultas')->nullable()->after('kategori_pt');
            $table->string('departemen')->nullable()->after('fakultas');
            $table->string('nama_laboratorium')->nullable()->after('departemen');
            $table->string('jenis_laboratorium')->nullable()->after('nama_laboratorium');
            $table->string('standar_akreditasi')->nullable()->after('jenis_laboratorium');
            $table->time('jam_mulai')->nullable()->after('status_akses');
            $table->time('jam_selesai')->nullable()->after('jam_mulai');
            $table->integer('jumlah_akses')->nullable()->after('jam_selesai');
            $table->string('kota')->nullable()->after('provinsi');
            $table->string('kecamatan')->nullable()->after('kota');
            $table->integer('total_jumlah_alat')->nullable()->after('longitude');
            $table->text('nama_alat')->nullable()->after('total_jumlah_alat');
            $table->text('deskripsi_alat')->nullable()->after('nama_alat');
            $table->string('tautan_gambar')->nullable()->after('deskripsi_alat');
            $table->string('kontak')->nullable()->after('tautan_gambar');
            $table->string('tautan')->nullable()->after('kontak');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fasilitas_lab', function (Blueprint $table) {
            // Restore old columns
            $table->string('nama_lab')->nullable();
            $table->string('kabupaten')->nullable();
            $table->string('jenis_lab')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('bidang')->nullable();
            $table->integer('tahun')->nullable();

            // Drop new columns
            $table->dropColumn([
                'kode_universitas', 'kategori_pt', 'fakultas', 'departemen',
                'nama_laboratorium', 'jenis_laboratorium', 'standar_akreditasi',
                'jam_mulai', 'jam_selesai', 'jumlah_akses', 'kota', 'kecamatan',
                'total_jumlah_alat', 'nama_alat', 'deskripsi_alat',
                'tautan_gambar', 'kontak', 'tautan'
            ]);
        });
    }
};
