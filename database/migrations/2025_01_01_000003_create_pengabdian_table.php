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
        Schema::create('pengabdian', function (Blueprint $table) {
            $table->id();
            $table->string('batch_type')->nullable(); // multitahun_lanjutan, batch_i, batch_ii, kosabangsa
            $table->string('nama')->nullable();
            $table->string('nidn')->nullable();
            $table->string('nama_institusi')->nullable();
            $table->decimal('pt_latitude', 10, 7)->nullable();
            $table->decimal('pt_longitude', 10, 7)->nullable();
            $table->string('kd_perguruan_tinggi')->nullable();
            $table->string('wilayah_lldikti')->nullable();
            $table->string('ptn_pts')->nullable();
            $table->string('kab_pt')->nullable();
            $table->string('prov_pt')->nullable();
            $table->string('klaster')->nullable();
            $table->text('judul')->nullable();
            $table->string('nama_singkat_skema')->nullable();
            $table->integer('thn_pelaksanaan_kegiatan')->nullable();
            $table->string('urutan_thn_kegitan')->nullable();
            $table->string('nama_skema')->nullable();
            $table->string('bidang_fokus')->nullable();
            $table->string('prov_mitra')->nullable();
            $table->string('kab_mitra')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('batch_type');
            $table->index('prov_pt');
            $table->index('kab_pt');
            $table->index('thn_pelaksanaan_kegiatan');
            $table->index('nama_institusi');
            $table->index(['pt_latitude', 'pt_longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengabdian');
    }
};
