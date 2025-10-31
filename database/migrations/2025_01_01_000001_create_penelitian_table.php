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
        Schema::create('penelitian', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->nullable();
            $table->string('nidn')->nullable();
            $table->string('nuptk')->nullable();
            $table->string('institusi')->nullable();
            $table->decimal('pt_latitude', 10, 7)->nullable();
            $table->decimal('pt_longitude', 10, 7)->nullable();
            $table->string('kode_pt')->nullable();
            $table->string('jenis_pt')->nullable();
            $table->string('kategori_pt')->nullable();
            $table->string('institusi_pilihan')->nullable();
            $table->string('klaster')->nullable();
            $table->string('provinsi')->nullable();
            $table->string('kota')->nullable();
            $table->text('judul')->nullable();
            $table->string('skema')->nullable();
            $table->integer('thn_pelaksanaan')->nullable();
            $table->string('bidang_fokus')->nullable();
            $table->string('tema_prioritas')->nullable();
            $table->timestamps();

            // Indexes untuk performa query
            $table->index('provinsi');
            $table->index('kota');
            $table->index('institusi');
            $table->index('thn_pelaksanaan');
            $table->index(['pt_latitude', 'pt_longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penelitian');
    }
};
