# 🚀 Quick Start Guide

## Setup dalam 5 Langkah

### 1️⃣ Buat Database MySQL

```sql
CREATE DATABASE peta_bima CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2️⃣ Jalankan Setup Script

```bash
cd C:\laragon\www\magang-kemdikti\peta-bima-laravel
setup.bat
```

Script ini akan:
- Install dependencies
- Setup .env file
- Generate app key
- **PAUSE** untuk Anda edit database config di `.env`
- Run migrations
- Import semua data dari JSON ke MySQL

### 3️⃣ Edit File .env

Saat script pause, edit file `.env`:

```env
DB_DATABASE=peta_bima
DB_USERNAME=root
DB_PASSWORD=       # Isi password MySQL Anda
```

Tekan Enter untuk lanjut import data.

### 4️⃣ Start Laravel Server

```bash
php artisan serve
```

✅ API ready di: `http://localhost:8000/api`

### 5️⃣ Test API

Buka browser:
```
http://localhost:8000/api/penelitian
http://localhost:8000/api/hilirisasi
http://localhost:8000/api/permasalahan?level=provinsi&jenis=sampah
```

---

## 🔗 Update Frontend (Optional)

Jika ingin connect frontend ke API Laravel:

1. Baca panduan lengkap di: `FRONTEND_INTEGRATION.md`
2. Update fungsi load data di `peta-bima/js/script-*.js`
3. Replace fetch JSON dengan fetch API Laravel

**Contoh singkat:**

```javascript
// Tambah di awal file
const API_BASE_URL = 'http://localhost:8000/api';

async function fetchAPI(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
    });
    const response = await fetch(url);
    const result = await response.json();
    return result.data;
}

// Update loadWasteData
async function loadWasteData(dataType = 'sampah') {
    const data = await fetchAPI('/permasalahan', {
        level: 'provinsi',
        jenis: dataType
    });

    provinsiWasteData = data;
    // ... rest of code
}
```

---

## 📚 Dokumentasi Lengkap

- **Setup Detail**: `README_SETUP.md`
- **Frontend Integration**: `FRONTEND_INTEGRATION.md`
- **Project Summary**: `SUMMARY_PROJECT.md`

---

## ❓ Troubleshooting

### Error: "could not find driver"
Install PHP MySQL extension:
```bash
# Enable di php.ini:
extension=pdo_mysql
extension=mysqli
```

### Error: "CORS policy"
Edit `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5500', 'http://127.0.0.1:5500'],
```

### Seeding terlalu lama?
Normal! Data penelitian ~48,000 records butuh 5-10 menit.

### Migration error?
```bash
php artisan migrate:fresh --seed
```
⚠️ Ini akan hapus semua data dan import ulang!

---

## 🎯 Yang Sudah Dibuat

✅ 6 Database Tables (penelitian, hilirisasi, pengabdian, permasalahan_provinsi, permasalahan_kabupaten, fasilitas_lab)
✅ 6 Eloquent Models dengan query scopes
✅ 4 API Controllers (Penelitian, Hilirisasi, Pengabdian, Permasalahan)
✅ 4 Database Seeders (import ~57,000+ records dari JSON)
✅ 15+ API Endpoints dengan filtering, search, pagination
✅ Complete Documentation (Setup, Integration, Summary)
✅ Auto Setup Script (setup.bat)

---

## 🏁 Done!

Sekarang data JSON Anda sudah ada di MySQL database dan bisa diakses via REST API! 🎉

**Next**: Baca `FRONTEND_INTEGRATION.md` untuk connect frontend ke API.
