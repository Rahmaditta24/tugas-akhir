# Peta Bima Laravel

Sistem informasi geografis untuk visualisasi data penelitian, hilirisasi, pengabdian, produk, fasilitas lab, dan permasalahan di Indonesia.

## 🚀 Quick Start (Untuk Handover Project)

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ & NPM
- MySQL 8.0+
- Web server (Apache/Nginx) atau PHP built-in server

### Setup Awal

```bash
# 1. Install dependencies
composer install
npm install

# 2. Setup environment
cp .env.example .env
php artisan key:generate

# 3. Edit .env: set database credentials
# DB_DATABASE=your_database_name
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# 4. Setup database + seed semua data
php artisan migrate:fresh --seed

# 5. Build frontend
npm run build

# 6. Start development server
php artisan serve
# atau gunakan web server Anda (Apache/Nginx)
```

**✅ `migrate:fresh --seed` AMAN!** 
- Command ini akan menghapus semua tabel dan data yang ada
- Lalu membuat ulang semua tabel dari migrations
- Kemudian mengisi semua data dari seeders (membaca JSON files)
- **Kesimpulan: Data akan terisi kembali otomatis, tidak ada data yang hilang permanen!**

### Verifikasi Data

Setelah `migrate:fresh --seed`, verifikasi jumlah data:

```bash
php artisan tinker --execute="
echo 'Penelitian: ' . DB::table('penelitian')->count() . ' (expected: 66,669)' . PHP_EOL;
echo 'Hilirisasi: ' . DB::table('hilirisasi')->count() . ' (expected: 2,572)' . PHP_EOL;
echo 'Pengabdian: ' . DB::table('pengabdian')->count() . ' (expected: 11,588)' . PHP_EOL;
echo 'Produk: ' . DB::table('produk')->count() . ' (expected: 812)' . PHP_EOL;
echo 'FasilitasLab: ' . DB::table('fasilitas_lab')->count() . ' (expected: 115)' . PHP_EOL;
echo 'Permasalahan Provinsi: ' . DB::table('permasalahan_provinsi')->count() . ' (expected: ~212)' . PHP_EOL;
echo 'Permasalahan Kabupaten: ' . DB::table('permasalahan_kabupaten')->count() . ' (expected: 1,883)' . PHP_EOL;
"
```

**Expected Results:**
- ✅ Penelitian: 66,669
- ✅ Hilirisasi: 2,572
- ✅ Pengabdian: 11,588
- ✅ Produk: 812
- ✅ FasilitasLab: 115
- ✅ Permasalahan Provinsi: ~212
- ✅ Permasalahan Kabupaten: 1,883

### Login Admin

- **URL**: `http://localhost:8000/admin` atau `/admin/login`
- **Email**: `admin@petabima.com`
- **Password**: `admin123`

⚠️ **PENTING: Ganti password setelah first login!**

## 📦 Data Source

Semua data berasal dari JSON files di `../peta-bima/data/`:

### Main Data Files
- `data-penelitian.json` → 66,669 records
- `data-hilirisasi.json` → 2,572 records
- `data-pengabdian.json` → 11,588 records
- `data-produk-hilirisasi.json` → 812 records
- `data-fasilitas-lab.json` → 115 records

### Permasalahan Data Files
- `permasalahan/data-permasalahan-sampah.json` → 323 kabupaten
- `permasalahan/data-permasalahan-stunting.json` → 533 kabupaten
- `permasalahan/data-permasalahan-gizi-buruk.json` → 513 kabupaten
- `permasalahan/data-permasalahan-ketahanan-pangan.json` → 514 kabupaten
- `permasalahan/data-permasalahan-krisis-listrik.json` → 32 provinsi (hanya provinsi-level)

### Lookup Files
- `kabupaten/kabupaten-new.json` → GeoJSON lookup untuk mapping kabupaten → provinsi
- `provinsi/provinsi-new.json` → GeoJSON untuk koordinat provinsi

**⚠️ Pastikan semua file ini ada sebelum menjalankan seeders!**

## 🔄 Reset Database (Safe untuk Handover)

### Full Reset (Recommended untuk setup baru)
```bash
php artisan migrate:fresh --seed
```
✅ **AMAN**: Semua data akan terisi kembali dari seeders

### Reset Hanya Tabel Tertentu
```bash
# Contoh: Reset hanya permasalahan
php artisan tinker --execute="
DB::table('permasalahan_provinsi')->truncate();
DB::table('permasalahan_kabupaten')->truncate();
"
php artisan db:seed --class=PermasalahanSeeder
```

## 🛠️ Tech Stack

- **Backend**: Laravel 11
- **Frontend**: React + Inertia.js + Tailwind CSS
- **Database**: MySQL 8.0+
- **Maps**: Leaflet.js + Leaflet MarkerCluster
- **Charts**: Recharts

## 📋 Admin CRUD Features

Semua kategori memiliki full CRUD functionality:

### ✅ Penelitian
- **Routes**: `/admin/penelitian`
- **Controller**: `App\Http\Controllers\Admin\PenelitianController`
- **Model**: `App\Models\Penelitian`
- **Features**: Create, Read, Update, Delete, Search, Pagination

### ✅ Hilirisasi
- **Routes**: `/admin/hilirisasi`
- **Controller**: `App\Http\Controllers\Admin\HilirisasiController`
- **Model**: `App\Models\Hilirisasi`
- **Features**: Create, Read, Update, Delete, Search, Pagination, Sorting

### ✅ Pengabdian
- **Routes**: `/admin/pengabdian`
- **Controller**: `App\Http\Controllers\Admin\PengabdianController`
- **Model**: `App\Models\Pengabdian`
- **Features**: Create, Read, Update, Delete, Search, Pagination

### ✅ Produk
- **Routes**: `/admin/produk`
- **Controller**: `App\Http\Controllers\Admin\ProdukController`
- **Model**: `App\Models\Produk`
- **Features**: Create, Read, Update, Delete, Search, Pagination

### ✅ Fasilitas Lab
- **Routes**: `/admin/fasilitas-lab`
- **Controller**: `App\Http\Controllers\Admin\FasilitasLabController`
- **Model**: `App\Models\FasilitasLab`
- **Features**: Create, Read, Update, Delete, Search, Pagination, Sorting

### ✅ Permasalahan
- **Routes**: `/admin/permasalahan`
- **Controller**: `App\Http\Controllers\Admin\PermasalahanController`
- **Model**: `App\Models\PermasalahanProvinsi`, `App\Models\PermasalahanKabupaten`
- **Features**: Create, Read, Update, Delete, Search, Pagination, Tab Filter (Provinsi/Kabupaten)
- **Special**: Import from JSON files via `/admin/permasalahan/import`

## 🗂️ Database Structure

### Main Tables
- `penelitian` - Data penelitian
- `hilirisasi` - Data hilirisasi
- `pengabdian` - Data pengabdian masyarakat
- `produk` - Data produk hilirisasi
- `fasilitas_lab` - Data fasilitas laboratorium
- `permasalahan_provinsi` - Data permasalahan level provinsi
- `permasalahan_kabupaten` - Data permasalahan level kabupaten/kota
- `users` - Admin users

### Seeders

Semua seeders berada di `database/seeders/`:

1. **PenelitianSeeder** - Import dari `data-penelitian.json`
2. **HilirisasiSeeder** - Import dari `data-hilirisasi.json`
3. **PengabdianSeeder** - Import dari `data-pengabdian.json`
4. **ProdukSeeder** - Import dari `data-produk-hilirisasi.json`
5. **FasilitasLabSeeder** - Import dari `data-fasilitas-lab.json`
6. **PermasalahanSeeder** - Import dari semua file di `permasalahan/*.json`
7. **AdminUserSeeder** - Membuat admin user default

Run semua seeders:
```bash
php artisan db:seed
```

Run seeder tertentu:
```bash
php artisan db:seed --class=PenelitianSeeder
```

## 🔍 Troubleshooting

### Data tidak muncul setelah seeding
1. Pastikan semua JSON files ada di `../peta-bima/data/`
2. Check database connection di `.env`
3. Run `composer dump-autoload`
4. Run `php artisan optimize:clear`
5. Run `migrate:fresh --seed` lagi

### Admin login tidak bisa
1. Pastikan `AdminUserSeeder` sudah dijalankan
2. Check email/password: `admin@petabima.com` / `admin123`
3. Clear cache: `php artisan cache:clear && php artisan config:clear`

### Map tidak muncul
1. Pastikan Leaflet.js sudah ter-build: `npm run build`
2. Check browser console untuk errors
3. Pastikan data memiliki koordinat (`latitude`/`longitude` atau `pt_latitude`/`pt_longitude`)

### Frontend tidak update
1. Run `npm run build` untuk production
2. Atau `npm run dev` untuk development (hot reload)

## 📝 Development Notes

- Semua data di-generate dari JSON files melalui seeders
- Tidak ada data hardcoded di database
- Untuk update data, edit JSON files lalu run seeder ulang
- Seeders menggunakan `truncate()` untuk memastikan data fresh setiap seeding
- Admin UI menggunakan design minimalist modern dengan glassmorphism
- Public pages menggunakan Leaflet.js dengan marker clustering untuk permasalahan
- API endpoints tersedia di `/api/*` untuk frontend consumption

## 🚀 Production Deployment

1. Set `APP_ENV=production` dan `APP_DEBUG=false` di `.env`
2. Run `php artisan config:cache`
3. Run `php artisan route:cache`
4. Run `npm run build` untuk build frontend
5. Set proper file permissions
6. Setup web server (Apache/Nginx) dengan proper document root ke `public/`

## 📞 Support

Untuk pertanyaan atau issues, silakan hubungi tim development atau check dokumentasi Laravel/Inertia.js.

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0
