# Setup Laravel Backend untuk Peta BIMA

## 📋 Requirements

- PHP >= 8.2
- Composer
- MySQL >= 8.0
- Node.js & NPM (optional untuk development)

## 🚀 Instalasi

### 1. Setup Database

Buat database MySQL baru:

```sql
CREATE DATABASE peta_bima CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Konfigurasi Environment

Copy file `.env.example` ke `.env`:

```bash
cd C:\laragon\www\magang-kemdikti\peta-bima-laravel
cp .env.example .env
```

Edit file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=peta_bima
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Install Dependencies (jika belum)

```bash
composer install
```

### 5. Jalankan Migrations

```bash
php artisan migrate
```

Ini akan membuat tabel-tabel berikut:
- `penelitian` - Data penelitian akademik
- `hilirisasi` - Data hilirisasi riset
- `pengabdian` - Data pengabdian masyarakat
- `permasalahan_provinsi` - Data permasalahan tingkat provinsi
- `permasalahan_kabupaten` - Data permasalahan tingkat kabupaten
- `fasilitas_lab` - Data fasilitas laboratorium

### 6. Import Data dari JSON ke Database

```bash
php artisan db:seed
```

Proses ini akan:
1. Import data penelitian (~ribuan records)
2. Import data hilirisasi
3. Import data pengabdian (semua batch)
4. Import data permasalahan (sampah, stunting, gizi buruk, krisis listrik, ketahanan pangan)

⏱️ **Estimasi waktu:** 5-15 menit tergantung ukuran data

### 7. Jalankan Development Server

```bash
php artisan serve
```

API akan tersedia di: `http://localhost:8000/api`

## 📡 API Endpoints

### Penelitian

```
GET /api/penelitian
GET /api/penelitian/{id}
GET /api/penelitian/statistics
```

**Query Parameters:**
- `provinsi` - Filter by provinsi
- `tahun` - Filter by tahun
- `bidang_fokus` - Filter by bidang fokus
- `search` - Search by judul, nama, institusi
- `per_page` - Pagination (default: all)
- `bounds` - Filter by map viewport (format: `{"north": -2, "south": -7, "west": 106, "east": 112}`)

**Contoh Request:**
```javascript
// Get all penelitian
fetch('http://localhost:8000/api/penelitian')

// Get penelitian by provinsi
fetch('http://localhost:8000/api/penelitian?provinsi=jawa+barat')

// Get penelitian with search
fetch('http://localhost:8000/api/penelitian?search=blockchain')

// Get penelitian statistics
fetch('http://localhost:8000/api/penelitian/statistics')
```

### Hilirisasi

```
GET /api/hilirisasi
GET /api/hilirisasi/{id}
```

**Query Parameters:**
- `provinsi` - Filter by provinsi
- `tahun` - Filter by tahun
- `skema` - Filter by skema
- `search` - Search query
- `per_page` - Pagination

### Pengabdian

```
GET /api/pengabdian
GET /api/pengabdian/{id}
```

**Query Parameters:**
- `batch_type` - Filter by batch (multitahun_lanjutan, batch_i, batch_ii, kosabangsa)
- `provinsi` - Filter by provinsi
- `tahun` - Filter by tahun
- `search` - Search query
- `per_page` - Pagination

### Permasalahan

```
GET /api/permasalahan
GET /api/permasalahan/provinsi/{provinsi}
GET /api/permasalahan/statistics
```

**Query Parameters untuk GET /api/permasalahan:**
- `level` - provinsi atau kabupaten (required)
- `jenis` - sampah, stunting, gizi_buruk, krisis_listrik, ketahanan_pangan (required)
- `metrik` - saidi atau saifi (hanya untuk krisis_listrik)

**Contoh Request:**
```javascript
// Get data sampah tingkat provinsi
fetch('http://localhost:8000/api/permasalahan?level=provinsi&jenis=sampah')

// Get data stunting tingkat kabupaten
fetch('http://localhost:8000/api/permasalahan?level=kabupaten&jenis=stunting')

// Get data krisis listrik (SAIDI)
fetch('http://localhost:8000/api/permasalahan?level=provinsi&jenis=krisis_listrik&metrik=saidi')

// Get statistics
fetch('http://localhost:8000/api/permasalahan/statistics?level=provinsi&jenis=sampah')
```

## 🔄 Response Format

Semua API mengembalikan format JSON standar:

```json
{
  "success": true,
  "data": {
    // ... data hasil query
  }
}
```

Untuk data dengan pagination:

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [...],
    "first_page_url": "http://localhost:8000/api/penelitian?page=1",
    "from": 1,
    "last_page": 10,
    "last_page_url": "http://localhost:8000/api/penelitian?page=10",
    "links": [...],
    "next_page_url": "http://localhost:8000/api/penelitian?page=2",
    "path": "http://localhost:8000/api/penelitian",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 150
  }
}
```

## 🔧 Update Data

Jika ada perubahan pada file JSON dan ingin update database:

```bash
# Fresh migration dan re-seed
php artisan migrate:fresh --seed
```

⚠️ **Warning:** Perintah ini akan **menghapus semua data** dan import ulang dari JSON!

## 🛠️ Development

### Enable CORS untuk Frontend

Edit `config/cors.php` atau install package:

```bash
composer require fruitcake/laravel-cors
```

Atau tambahkan middleware CORS manual di `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->api(prepend: [
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
})
```

### Optimize untuk Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

## 📊 Database Schema

### Tabel Penelitian
- id, nama, nidn, nuptk, institusi, pt_latitude, pt_longitude
- kode_pt, jenis_pt, kategori_pt, institusi_pilihan, klaster
- provinsi, kota, judul, skema, thn_pelaksanaan
- bidang_fokus, tema_prioritas

### Tabel Hilirisasi
- id, tahun, id_proposal, judul, nama_pengusul, direktorat
- perguruan_tinggi, pt_latitude, pt_longitude, provinsi
- mitra, skema, luaran

### Tabel Pengabdian
- id, batch_type, nama, nidn, nama_institusi
- pt_latitude, pt_longitude, kd_perguruan_tinggi
- wilayah_lldikti, ptn_pts, kab_pt, prov_pt, klaster
- judul, nama_singkat_skema, thn_pelaksanaan_kegiatan
- urutan_thn_kegitan, nama_skema, bidang_fokus
- prov_mitra, kab_mitra

### Tabel Permasalahan Provinsi
- id, provinsi, jenis_permasalahan, nilai, satuan, metrik, tahun

### Tabel Permasalahan Kabupaten
- id, kabupaten_kota, provinsi, jenis_permasalahan, nilai, satuan, tahun

## 🐛 Troubleshooting

### Error: Class not found
```bash
composer dump-autoload
```

### Error: Migration already exists
```bash
php artisan migrate:fresh
```

### Slow query / Performance issues
Pastikan indexes sudah terinstall dengan baik. Check dengan:
```sql
SHOW INDEX FROM penelitian;
```

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue atau hubungi tim development.
