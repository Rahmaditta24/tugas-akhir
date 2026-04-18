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
        Schema::table('hilirisasi', function (Blueprint $table) {
            $table->string('id_proposal')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hilirisasi', function (Blueprint $table) {
            $table->integer('id_proposal')->nullable()->change();
        });
    }
};
