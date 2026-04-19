# 📊 Database Seeding Guide

## Struktur Folder untuk Data JSON

Semua JSON files harus ditempatkan di folder `database/data/`:

```
your-project/
├── database/
│   └── data/                          ← PUT JSON FILES HERE
│       ├── data-penelitian_clean.json
│       ├── data-hilirisasi_clean.json
│       ├── data-pengabdian_clean.json
│       ├── data-fasilitas-lab_clean.json
│       ├── data-produk-hilirisasi_clean.json
│       ├── kabupaten-new.json
│       ├── data-permasalahan-sampah.json
│       ├── data-permasalahan-stunting.json
│       ├── data-permasalahan-gizi-buruk.json
│       ├── data-permasalahan-krisis-listrik.json
│       └── data-permasalahan-ketahanan-pangan.json
```

---

## Cara Upload JSON Files

### Local Development (Laragon)
1. Copy semua `.json` files ke folder `database/data/`
2. Run seeder: `php artisan db:seed`

### Production (DomCloud)

#### Option 1: Via File Manager
1. Login ke DomCloud File Manager
2. Navigate ke: `/home/peta-bima/public_html/database/data/`
3. Upload semua JSON files ke sana

#### Option 2: Via SCP/SFTP
```bash
scp data/*.json user@peta-bima.osk.dom.my.id:/home/peta-bima/public_html/database/data/
```

#### Option 3: Via GIT (Recommended)
```bash
# Local
git add database/data/*.json
git commit -m "Add: Seed data files"
git push

# Production
cd /home/peta-bima/public_html
git pull origin main
```

---

## Run Seeding

### Local Development
```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=PenelitianSeeder
php artisan db:seed --class=HilirisasiSeeder
php artisan db:seed --class=PengabdianSeeder
php artisan db:seed --class=FasilitasLabSeeder
php artisan db:seed --class=ProdukSeeder
php artisan db:seed --class=PermasalahanSeeder
```

### Production
```bash
cd /home/peta-bima/public_html

# Pull latest code dengan JSON files
git pull origin main

# Run specific seeder
php artisan db:seed --class=PenelitianSeeder

# Or run all
php artisan db:seed
```

---

## JSON Files Required

| Seeder | File | Records |
|--------|------|---------|
| PenelitianSeeder | `data-penelitian_clean.json` | Research data |
| HilirisasiSeeder | `data-hilirisasi_clean.json` | Hilirisasi data |
| PengabdianSeeder | `data-pengabdian_clean.json` | Community service data |
| FasilitasLabSeeder | `data-fasilitas-lab_clean.json` | Lab facilities |
| ProdukSeeder | `data-produk-hilirisasi_clean.json` | Products |
| PermasalahanSeeder | Multiple files (see below) | Problem data |

### PermasalahanSeeder Files
- `kabupaten-new.json` - District/Regency lookup
- `data-permasalahan-sampah.json` - Trash problems
- `data-permasalahan-stunting.json` - Stunting data
- `data-permasalahan-gizi-buruk.json` - Malnutrition data
- `data-permasalahan-krisis-listrik.json` - Electricity crisis data
- `data-permasalahan-ketahanan-pangan.json` - Food security data

---

## Troubleshooting

### "File tidak ditemukan"
```
✓ Make sure files are in: database/data/
✓ Check filename is exactly correct (case-sensitive)
✓ Verify JSON format is valid
```

### Seeding fails with JSON error
```bash
# Validate JSON files
php -l database/data/data-penelitian_clean.json

# Or use jq
cat database/data/data-penelitian_clean.json | jq . > /dev/null
```

### Database connection error
```bash
# Check .env file
cat .env | grep DB_

# Test connection
php artisan tinker
>>> DB::connection()->getPdo();
```

---

## Seeding Progress

All seeders have progress bars and show:
- Total records found
- Records inserted
- Records skipped
- Errors encountered

Example output:
```
✓ PenelitianSeeder: Total=1500, Inserted=1485, Skipped=15, Errors=0
✓ HilirisasiSeeder: Total=800, Inserted=790, Skipped=10, Errors=0
✓ FasilitasLabSeeder: Total=250, Inserted=245, Skipped=5, Errors=0
```
