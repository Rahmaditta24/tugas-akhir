<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations to add indexes for search and filtering columns.
     */
    public function up(): void
    {
        Schema::table('penelitian', function (Blueprint $table) {
            if (!$this->hasIndex('penelitian', 'penelitian_nama_index')) $table->index('nama');
            if (!$this->hasIndex('penelitian', 'penelitian_institusi_index')) $table->index('institusi');
            if (!$this->hasIndex('penelitian', 'penelitian_judul_index')) $table->index([DB::raw('judul(255)')], 'penelitian_judul_index');
            if (!$this->hasIndex('penelitian', 'penelitian_thn_pelaksanaan_index')) $table->index('thn_pelaksanaan');
        });

        Schema::table('pengabdian', function (Blueprint $table) {
            if (!$this->hasIndex('pengabdian', 'pengabdian_nama_index')) $table->index('nama');
            if (!$this->hasIndex('pengabdian', 'pengabdian_nama_institusi_index')) $table->index('nama_institusi');
            if (!$this->hasIndex('pengabdian', 'pengabdian_judul_index')) $table->index([DB::raw('judul(255)')], 'pengabdian_judul_index');
            if (!$this->hasIndex('pengabdian', 'pengabdian_thn_pelaksanaan_kegiatan_index')) $table->index('thn_pelaksanaan_kegiatan');
        });

        Schema::table('hilirisasi', function (Blueprint $table) {
            if (!$this->hasIndex('hilirisasi', 'hilirisasi_nama_pengusul_index')) $table->index('nama_pengusul');
            if (!$this->hasIndex('hilirisasi', 'hilirisasi_perguruan_tinggi_index')) $table->index('perguruan_tinggi');
            if (!$this->hasIndex('hilirisasi', 'hilirisasi_judul_index')) $table->index([DB::raw('judul(255)')], 'hilirisasi_judul_index');
            if (!$this->hasIndex('hilirisasi', 'hilirisasi_tahun_index')) $table->index('tahun');
        });

        Schema::table('produk', function (Blueprint $table) {
            if (!$this->hasIndex('produk', 'produk_nama_produk_index')) $table->index('nama_produk');
            if (!$this->hasIndex('produk', 'produk_institusi_index')) $table->index('institusi');
        });

        Schema::table('fasilitas_lab', function (Blueprint $table) {
            if (!$this->hasIndex('fasilitas_lab', 'fasilitas_lab_nama_laboratorium_index')) $table->index('nama_laboratorium');
            if (!$this->hasIndex('fasilitas_lab', 'fasilitas_lab_institusi_index')) $table->index('institusi');
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
        Schema::table('penelitian', function (Blueprint $table) {
            $table->dropIndex(['nama', 'institusi', 'judul', 'thn_pelaksanaan']);
        });

        Schema::table('pengabdian', function (Blueprint $table) {
            $table->dropIndex(['nama', 'nama_institusi', 'judul', 'thn_pelaksanaan_kegiatan']);
        });

        Schema::table('hilirisasi', function (Blueprint $table) {
            $table->dropIndex(['nama_pengusul', 'perguruan_tinggi', 'judul', 'tahun']);
        });

        Schema::table('produk', function (Blueprint $table) {
            $table->dropIndex(['nama_produk', 'institusi']);
        });

        Schema::table('fasilitas_lab', function (Blueprint $table) {
            $table->dropIndex(['nama_laboratorium', 'institusi']);
        });
    }
};
