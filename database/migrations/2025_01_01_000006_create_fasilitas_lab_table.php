<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('fasilitas_lab')) {
            Schema::create('fasilitas_lab', function (Blueprint $table) {
                $table->id();
                $table->string('institusi')->nullable();
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->string('provinsi')->nullable();
                $table->string('kota')->nullable();
                $table->string('kecamatan')->nullable();
                $table->string('kode_universitas')->nullable();
                $table->string('kategori_pt')->nullable();
                $table->string('fakultas')->nullable();
                $table->string('departemen')->nullable();
                $table->string('nama_laboratorium')->nullable();
                $table->string('jenis_laboratorium')->nullable();
                $table->string('standar_akreditasi')->nullable();
                $table->time('jam_mulai')->nullable();
                $table->time('jam_selesai')->nullable();
                $table->integer('jumlah_akses')->nullable();
                $table->integer('total_jumlah_alat')->nullable();
                $table->text('nama_alat')->nullable();
                $table->text('deskripsi_alat')->nullable();
                $table->string('tautan_gambar')->nullable();
                $table->string('kontak')->nullable();
                $table->string('tautan')->nullable();
                $table->string('status_akses')->nullable();
                $table->timestamps();
                $table->index('provinsi');
                $table->index('kota');
                $table->index('institusi');
                $table->index('jenis_laboratorium');
                $table->index('status_akses');
                $table->index(['latitude', 'longitude']);
            });
            return;
        }

        $drops1 = array_filter(['nama_lab','kabupaten','jenis_lab','deskripsi','bidang','tahun'], fn($c)=>Schema::hasColumn('fasilitas_lab',$c));
        if (!empty($drops1)) {
            Schema::table('fasilitas_lab', function (Blueprint $table) use ($drops1) {
                $table->dropColumn($drops1);
            });
        }

        Schema::table('fasilitas_lab', function (Blueprint $table) {
            if (!Schema::hasColumn('fasilitas_lab', 'kode_universitas')) $table->string('kode_universitas')->nullable()->after('id');
            if (!Schema::hasColumn('fasilitas_lab', 'kategori_pt')) $table->string('kategori_pt')->nullable()->after('institusi');
            if (!Schema::hasColumn('fasilitas_lab', 'nama_laboratorium')) $table->string('nama_laboratorium')->nullable()->after('kategori_pt');
            if (!Schema::hasColumn('fasilitas_lab', 'kota')) $table->string('kota')->nullable()->after('nama_laboratorium');
            if (!Schema::hasColumn('fasilitas_lab', 'total_jumlah_alat')) $table->integer('total_jumlah_alat')->nullable()->after('longitude');
            if (!Schema::hasColumn('fasilitas_lab', 'nama_alat')) $table->text('nama_alat')->nullable()->after('total_jumlah_alat');
            if (!Schema::hasColumn('fasilitas_lab', 'deskripsi_alat')) $table->text('deskripsi_alat')->nullable()->after('nama_alat');
            if (!Schema::hasColumn('fasilitas_lab', 'kontak')) $table->string('kontak')->nullable()->after('deskripsi_alat');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('fasilitas_lab')) {
            return;
        }
        Schema::table('fasilitas_lab', function (Blueprint $table) {
            $table->string('nama_lab')->nullable();
            $table->string('kabupaten')->nullable();
            $table->string('jenis_lab')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('bidang')->nullable();
            $table->integer('tahun')->nullable();
        });

        $drops2 = array_filter(['kode_universitas','kategori_pt','nama_laboratorium','kota','total_jumlah_alat','nama_alat','deskripsi_alat','kontak'], fn($c)=>Schema::hasColumn('fasilitas_lab',$c));
        if (!empty($drops2)) {
            Schema::table('fasilitas_lab', function (Blueprint $table) use ($drops2) {
                $table->dropColumn($drops2);
            });
        }
    }
};
