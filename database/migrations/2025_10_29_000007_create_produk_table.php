<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('produk', function (Blueprint $table) {
            $table->id();
            $table->string('institusi')->index();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('provinsi')->nullable()->index();
            $table->string('nama_produk');
            $table->text('deskripsi_produk')->nullable();
            $table->unsignedTinyInteger('tkt')->nullable();
            $table->string('bidang')->nullable();
            $table->string('nama_inventor')->nullable();
            $table->string('email_inventor')->nullable();
            $table->text('nomor_paten')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk');
    }
};


