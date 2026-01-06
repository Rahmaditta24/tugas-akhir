<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rumusan_masalah_categories', function (Blueprint $table) {
            $table->id();
            $table->integer('order_number')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('image')->nullable();
            $table->timestamps();

            $table->index('order_number');
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rumusan_masalah_categories');
    }
};