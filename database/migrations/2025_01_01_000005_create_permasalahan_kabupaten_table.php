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
        Schema::create('permasalahan_kabupaten', function (Blueprint $table) {
            $table->id();
            $table->string('kabupaten_kota')->index();
            $table->string('provinsi')->index();
            $table->string('jenis_permasalahan')->index(); // sampah, stunting, gizi_buruk
            $table->decimal('nilai', 15, 2)->nullable();
            $table->string('satuan')->nullable();
            $table->integer('tahun')->nullable();
            $table->timestamps();

            // Composite indexes
            $table->index(['kabupaten_kota', 'jenis_permasalahan']);
            $table->index(['provinsi', 'jenis_permasalahan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permasalahan_kabupaten');
    }
};
