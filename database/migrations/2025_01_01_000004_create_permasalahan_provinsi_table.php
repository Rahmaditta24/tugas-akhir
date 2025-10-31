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
        Schema::create('permasalahan_provinsi', function (Blueprint $table) {
            $table->id();
            $table->string('provinsi')->index();
            $table->string('jenis_permasalahan')->index(); // sampah, stunting, gizi_buruk, krisis_listrik, ketahanan_pangan
            $table->decimal('nilai', 15, 2)->nullable();
            $table->string('satuan')->nullable(); // ton/tahun, %, Jam/Pelanggan, etc
            $table->string('metrik')->nullable(); // untuk krisis listrik: saidi, saifi
            $table->integer('tahun')->nullable();
            $table->timestamps();

            // Composite index untuk query cepat
            $table->index(['provinsi', 'jenis_permasalahan']);
            $table->index(['jenis_permasalahan', 'metrik']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permasalahan_provinsi');
    }
};
