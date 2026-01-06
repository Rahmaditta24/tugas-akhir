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
        Schema::create('rumusan_masalah_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->constrained('rumusan_masalah_categories')
                ->onDelete('cascade');
            $table->string('order_number', 10);
            $table->string('full_number');
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('category_id');
            $table->index('order_number');
            $table->unique(['category_id', 'full_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rumusan_masalah_statements');
    }
};