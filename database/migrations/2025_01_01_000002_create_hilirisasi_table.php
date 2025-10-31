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
        Schema::create('hilirisasi', function (Blueprint $table) {
            $table->id();
            $table->integer('tahun')->nullable();
            $table->integer('id_proposal')->nullable();
            $table->text('judul')->nullable();
            $table->string('nama_pengusul')->nullable();
            $table->string('direktorat')->nullable();
            $table->string('perguruan_tinggi')->nullable();
            $table->decimal('pt_latitude', 10, 7)->nullable();
            $table->decimal('pt_longitude', 10, 7)->nullable();
            $table->string('provinsi')->nullable();
            $table->string('mitra')->nullable();
            $table->string('skema')->nullable();
            $table->text('luaran')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('provinsi');
            $table->index('tahun');
            $table->index('perguruan_tinggi');
            $table->index(['pt_latitude', 'pt_longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hilirisasi');
    }
};
