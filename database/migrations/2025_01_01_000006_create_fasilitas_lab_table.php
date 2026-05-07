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
                $table->string('kode_universitas')->nullable();
                $table->string('institusi')->nullable();
                $table->string('kategori_pt')->nullable();
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->string('provinsi')->nullable();
                $table->string('kota')->nullable();
                $table->string('nama_laboratorium')->nullable();
                $table->integer('total_jumlah_alat')->nullable();
                $table->text('nama_alat')->nullable();
                $table->text('deskripsi_alat')->nullable();
                $table->string('kontak')->nullable();
                $table->timestamps();

                $table->index('provinsi');
                $table->index('institusi');
                $table->index('kode_universitas');
                $table->index(['latitude', 'longitude']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('fasilitas_lab');
    }
};
