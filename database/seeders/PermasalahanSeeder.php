<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermasalahanSeeder extends Seeder
{
    private array $kabupatenToProv = [];
    private int $tahun = 0;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info("Mengimport data permasalahan...");

        DB::table('permasalahan_provinsi')->truncate();
        DB::table('permasalahan_kabupaten')->truncate();

        // Tahun data, default ke tahun berjalan
        $this->tahun = (int) date('Y');

        $this->loadKabupatenProvinsiLookup();

        // Import Sampah
        $this->importSampah();

        // Import Stunting
        $this->importStunting();

        // Import Gizi Buruk
        $this->importGiziBuruk();

        // Import Krisis Listrik
        $this->importKrisisListrik();

        // Import Ketahanan Pangan
        $this->importKetahananPangan();

        $this->command->info("✓ Selesai import semua data permasalahan!");
    }

    private function loadKabupatenProvinsiLookup(): void
    {
        $kabPath = base_path('../peta-bima/data/kabupaten/kabupaten-new.json');
        if (!file_exists($kabPath)) {
            $this->command->warn('File kabupaten lookup tidak ditemukan: ' . $kabPath);
            return;
        }
        $raw = json_decode(file_get_contents($kabPath), true);
        
        // Handle GeoJSON format (FeatureCollection)
        if (isset($raw['type']) && $raw['type'] === 'FeatureCollection' && isset($raw['features'])) {
            foreach ($raw['features'] as $feature) {
                if (isset($feature['properties'])) {
                    $props = $feature['properties'];
                    // GeoJSON menggunakan WADMKK untuk kabupaten dan WADMPR untuk provinsi
                    $kab = $this->normalize($props['WADMKK'] ?? '');
                    $prov = $props['WADMPR'] ?? null;
                    if ($kab && $prov) {
                        $this->kabupatenToProv[$kab] = $prov;
                    }
                }
            }
        } 
        // Handle simple array format (fallback)
        else if (is_array($raw)) {
            foreach ($raw as $row) {
                $kab = $this->normalize($row['kabupaten_kota'] ?? $row['WADMKK'] ?? '');
                $prov = $row['provinsi'] ?? $row['WADMPR'] ?? null;
                if ($kab && $prov) {
                    $this->kabupatenToProv[$kab] = $prov;
                }
            }
        } else {
            $this->command->warn('Format kabupaten lookup tidak valid');
            return;
        }
        
        // Tambahkan mapping manual untuk kabupaten yang tidak ada di lookup
        $manualMapping = [
            'kota palangkaraya' => 'Kalimantan Tengah',
            'kep. siau tagulandang biaro' => 'Sulawesi Utara',
            'siau tagulandang biaro' => 'Sulawesi Utara',
            'pangkajene dan kepulauan' => 'Sulawesi Selatan',
            'kota parepare' => 'Sulawesi Selatan',
            'sibolga' => 'Sumatera Utara',
            'kota tanjungbalai' => 'Sumatera Utara',
            'kota pematang siantar' => 'Sumatera Utara',
            'kota padangsidimpuan' => 'Sumatera Utara',
            'kota padang sidimpuan' => 'Sumatera Utara',
            'kepulauan seribu' => 'DKI Jakarta',
            'kota baubau' => 'Sulawesi Tenggara',
            'kota lubuklinggau' => 'Sumatera Selatan',
            'kota pangkalpinang' => 'Kepulauan Bangka Belitung',
            'kota tanjungpinang' => 'Kepulauan Riau',
            'mamuju utara' => 'Sulawesi Barat',
            'maluku tenggara barat' => 'Maluku',
        ];
        
        foreach ($manualMapping as $kab => $prov) {
            $this->kabupatenToProv[$this->normalize($kab)] = $prov;
        }
        
        $this->command->info('Lookup kabupaten->provinsi dimuat: ' . count($this->kabupatenToProv) . ' entri (termasuk ' . count($manualMapping) . ' manual mapping)');
    }

    private function normalize(?string $text): string
    {
        if ($text === null) return '';
        return trim(mb_strtolower($text));
    }

    private function importSampah()
    {
        $jsonPath = base_path('../peta-bima/data/permasalahan/data-permasalahan-sampah.json');

        if (!file_exists($jsonPath)) {
            $this->command->warn("File sampah tidak ditemukan");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        // Import Provinsi
        if (isset($data['Provinsi'])) {
            foreach ($data['Provinsi'] as $item) {
                DB::table('permasalahan_provinsi')->insert([
                    'provinsi' => $item['Provinsi'] ?? null,
                    'jenis_permasalahan' => 'sampah',
                    'nilai' => $item['Timbulan Sampah Tahunan(ton)'] ?? null,
                    'satuan' => 'ton/tahun',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Import Kabupaten
        if (isset($data['Kabupaten'])) {
            foreach ($data['Kabupaten'] as $item) {
                $kab = $item['Kabupaten/Kota'] ?? null;
                // Prioritaskan Provinsi dari JSON, lalu coba lookup
                $prov = $item['Provinsi'] ?? $this->kabupatenToProv[$this->normalize($kab)] ?? null;
                if (!$prov || !$kab) { continue; }

                DB::table('permasalahan_kabupaten')->insert([
                    'kabupaten_kota' => $kab,
                    'provinsi' => $prov,
                    'jenis_permasalahan' => 'sampah',
                    'nilai' => $item['Timbulan Sampah Tahunan(ton)'] ?? null,
                    'satuan' => 'ton/tahun',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info("  ✓ Import data sampah selesai");
    }

    private function importStunting()
    {
        $jsonPath = base_path('../peta-bima/data/permasalahan/data-permasalahan-stunting.json');

        if (!file_exists($jsonPath)) {
            $this->command->warn("File stunting tidak ditemukan");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        // Import Provinsi
        if (isset($data['Provinsi'])) {
            foreach ($data['Provinsi'] as $item) {
                DB::table('permasalahan_provinsi')->insert([
                    'provinsi' => $item['Provinsi'] ?? null,
                    'jenis_permasalahan' => 'stunting',
                    'nilai' => $item['Persentase'] ?? null,
                    'satuan' => '%',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Import Kabupaten
        if (isset($data['Kabupaten'])) {
            foreach ($data['Kabupaten'] as $item) {
                $kab = $item['Kabupaten/Kota'] ?? null;
                // Prioritaskan Provinsi dari JSON, lalu coba lookup
                $prov = $item['Provinsi'] ?? $this->kabupatenToProv[$this->normalize($kab)] ?? null;
                if (!$prov || !$kab) { continue; }

                DB::table('permasalahan_kabupaten')->insert([
                    'kabupaten_kota' => $kab,
                    'provinsi' => $prov,
                    'jenis_permasalahan' => 'stunting',
                    'nilai' => $item['Persentase'] ?? null,
                    'satuan' => '%',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info("  ✓ Import data stunting selesai");
    }

    private function importGiziBuruk()
    {
        $jsonPath = base_path('../peta-bima/data/permasalahan/data-permasalahan-gizi-buruk.json');

        if (!file_exists($jsonPath)) {
            $this->command->warn("File gizi buruk tidak ditemukan");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        // Import Provinsi
        if (isset($data['Provinsi'])) {
            foreach ($data['Provinsi'] as $item) {
                DB::table('permasalahan_provinsi')->insert([
                    'provinsi' => $item['Provinsi'] ?? null,
                    'jenis_permasalahan' => 'gizi_buruk',
                    'nilai' => $item['Persentase'] ?? null,
                    'satuan' => '%',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Import Kabupaten
        if (isset($data['Kabupaten'])) {
            foreach ($data['Kabupaten'] as $item) {
                $kab = $item['Kabupaten/Kota'] ?? null;
                // Prioritaskan Provinsi dari JSON, lalu coba lookup
                $prov = $item['Provinsi'] ?? $this->kabupatenToProv[$this->normalize($kab)] ?? null;
                if (!$prov || !$kab) { continue; }

                DB::table('permasalahan_kabupaten')->insert([
                    'kabupaten_kota' => $kab,
                    'provinsi' => $prov,
                    'jenis_permasalahan' => 'gizi_buruk',
                    'nilai' => $item['Persentase'] ?? null,
                    'satuan' => '%',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info("  ✓ Import data gizi buruk selesai");
    }

    private function importKrisisListrik()
    {
        $jsonPath = base_path('../peta-bima/data/permasalahan/data-permasalahan-krisis-listrik.json');

        if (!file_exists($jsonPath)) {
            $this->command->warn("File krisis listrik tidak ditemukan");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        // Import SAIDI
        if (isset($data['Sheet1'])) {
            foreach ($data['Sheet1'] as $item) {
                // SAIDI
                DB::table('permasalahan_provinsi')->insert([
                    'provinsi' => $item['Provinsi'] ?? null,
                    'jenis_permasalahan' => 'krisis_listrik',
                    'metrik' => 'saidi',
                    'nilai' => $item['SAIDI (Jam/Pelanggan)'] ?? null,
                    'satuan' => 'Jam/Pelanggan',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // SAIFI
                DB::table('permasalahan_provinsi')->insert([
                    'provinsi' => $item['Provinsi'] ?? null,
                    'jenis_permasalahan' => 'krisis_listrik',
                    'metrik' => 'saifi',
                    'nilai' => $item['SAIFI (Kali/Pelanggan)'] ?? null,
                    'satuan' => 'Kali/Pelanggan',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info("  ✓ Import data krisis listrik selesai");
    }

    private function importKetahananPangan()
    {
        $jsonPath = base_path('../peta-bima/data/permasalahan/data-permasalahan-ketahanan-pangan.json');

        if (!file_exists($jsonPath)) {
            $this->command->warn("File ketahanan pangan tidak ditemukan");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        // Import Provinsi
        if (isset($data['Provinsi'])) {
            foreach ($data['Provinsi'] as $item) {
                DB::table('permasalahan_provinsi')->insert([
                    'provinsi' => $item['Provinsi'] ?? null,
                    'jenis_permasalahan' => 'ketahanan_pangan',
                    'nilai' => $item['IKP'] ?? null,
                    'satuan' => 'IKP',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Import Kabupaten
        if (isset($data['Kabupaten'])) {
            foreach ($data['Kabupaten'] as $item) {
                $kab = $item['Kabupaten/Kota'] ?? null;
                // Prioritaskan Provinsi dari JSON, lalu coba lookup
                $prov = $item['Provinsi'] ?? $this->kabupatenToProv[$this->normalize($kab)] ?? null;
                if (!$prov || !$kab) { continue; }

                DB::table('permasalahan_kabupaten')->insert([
                    'kabupaten_kota' => $kab,
                    'provinsi' => $prov,
                    'jenis_permasalahan' => 'ketahanan_pangan',
                    'nilai' => $item['IKP'] ?? null,
                    'satuan' => 'IKP',
                    'tahun' => $this->tahun,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info("  ✓ Import data ketahanan pangan selesai");
    }
}
