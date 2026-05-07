<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add missing indexes to improve query performance on filter columns
     */
    public function up(): void
    {
        Schema::table('fasilitas_lab', function (Blueprint $table) {
        });

        // Menambahkan indeks komposit untuk kombinasi filter umum
        Schema::table('pengabdian', function (Blueprint $table) {
            if (!$this->hasIndex('pengabdian', 'pengabdian_prov_year_index')) {
                $table->index(['prov_pt', 'thn_pelaksanaan_kegiatan'], 'pengabdian_prov_year_index');
            }
        });

        Schema::table('permasalahan_provinsi', function (Blueprint $table) {
            if (!$this->hasIndex('permasalahan_provinsi', 'permasalahan_prov_type_year_index')) {
                $table->index(['jenis_permasalahan', 'tahun'], 'permasalahan_prov_type_year_index');
            }
        });

        Schema::table('permasalahan_kabupaten', function (Blueprint $table) {
            if (!$this->hasIndex('permasalahan_kabupaten', 'permasalahan_kab_type_year_index')) {
                $table->index(['jenis_permasalahan', 'tahun'], 'permasalahan_kab_type_year_index');
            }
        });

        Schema::table('produk', function (Blueprint $table) {
            if (!$this->hasIndex('produk', 'produk_prov_bidang_index')) {
                $table->index(['provinsi', 'bidang'], 'produk_prov_bidang_index');
            }
        });
    }
    
    /**
     * Check if index exists on table
     */
    private function hasIndex(string $table, string $indexName): bool
    {
        $indexes = DB::select("SHOW INDEX FROM {$table}");
        foreach ($indexes as $index) {
            if ($index->Key_name === $indexName) {
                return true;
            }
        }
        return false;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fasilitas_lab', function (Blueprint $table) {
            //
        });

        Schema::table('pengabdian', function (Blueprint $table) {
            $table->dropIndex('pengabdian_prov_year_index');
        });

        Schema::table('permasalahan_provinsi', function (Blueprint $table) {
            $table->dropIndex('permasalahan_prov_type_year_index');
        });

        Schema::table('permasalahan_kabupaten', function (Blueprint $table) {
            $table->dropIndex('permasalahan_kab_type_year_index');
        });

        Schema::table('produk', function (Blueprint $table) {
            $table->dropIndex('produk_prov_bidang_index');
        });
    }
};
