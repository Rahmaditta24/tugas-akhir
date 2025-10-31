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
        Schema::create('fasilitas_lab', function (Blueprint $table) {
            $table->id();
            $table->string('nama_lab')->nullable();
            $table->string('institusi')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('provinsi')->nullable();
            $table->string('kabupaten')->nullable();
            $table->string('jenis_lab')->nullable(); // Laboratorium Riset, Pendidikan, dll
            $table->string('status_akses')->nullable(); // Publik, Internal, Terbatas
            $table->text('deskripsi')->nullable();
            $table->string('bidang')->nullable();
            $table->integer('tahun')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('provinsi');
            $table->index('kabupaten');
            $table->index('institusi');
            $table->index('jenis_lab');
            $table->index('status_akses');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fasilitas_lab');
    }
};
