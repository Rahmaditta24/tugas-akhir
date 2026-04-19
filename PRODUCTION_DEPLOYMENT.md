# 🚀 Production Deployment Checklist

## Problem Summary
- ❌ Original API `emsifa.github.io` redirects to `www.emsifa.com`
- ❌ Production firewall blocks all external connections
- ❌ Error: `cURL error 7: Failed to connect to www.emsifa.com port 80`
- ✅ **SOLUTION**: Use local provinces data instead of external API

## Architecture Fix
- Before: Try external API → redirect → firewall blocks → 500 error
- After: Use `storage/provinces.json` directly → no external calls needed

---

## Hosting Information
- **Hosting**: DomCloud
- **Firewall**: Active (blocks all external outgoing connections by default)
- **Plan**: Free/Basic (outgoing connections require paid plan upgrade)
- **Solution**: Using local data, no external API calls needed

---

## Step-by-Step Deployment

### **Step 1: SSH ke Production Server**
```bash
ssh user@peta-bima.osk.dom.my.id
cd /home/peta-bima/public_html
```

### **Step 2: Pull Latest Code (sudah include fix untuk local data)**
```bash
git pull origin main

# Verify code pulled
git log --oneline -1
```

### **Step 3: Clear All Caches**
```bash
# CRITICAL: Clear cache yang lama
rm -rf bootstrap/cache/*
rm -rf storage/framework/views/*

# Laravel cache commands
php artisan cache:clear
php artisan cache:flush
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

### **Step 4: Regenerate Optimized Files**
```bash
php artisan optimize:clear
php artisan optimize
```

### **Step 5: Verify**
```bash
# Check provinces data exists and loaded
php artisan tinker
>>> collect(json_decode(file_get_contents(storage_path('provinces.json')), true))->count()
>>> exit

# Test website
curl https://peta-bima.osk.dom.my.id
```

---

## Quick Deploy Command (Copy-Paste)
```bash
cd /home/peta-bima/public_html && \
git pull origin main && \
rm -rf bootstrap/cache/* storage/framework/views/* && \
php artisan cache:clear && \
php artisan optimize:clear && \
php artisan optimize && \
echo "✅ Deployment successful!"
```

---
```bash
ssh user@peta-bima.osk.dom.my.id
# atau
ssh -i /path/to/key user@peta-bima.osk.dom.my.id
```

### **Step 2: Navigate ke Project Folder**
```bash
cd /home/peta-bima/public_html

# Verify git is set up
git status
```

### **Step 3: Run Deployment Script (RECOMMENDED)**
```bash
bash deploy.sh
```

**Atau jika tidak ada permission, jalankan manual:**

### **Step 4: Manual Deployment Commands**

```bash
# 1. Pull code terbaru
git pull origin main

# 2. Install dependencies
composer install --no-dev --optimize-autoloader

# 3. Fix permissions (CRITICAL!)
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/ bootstrap/cache/

# 4. Clear semua cache
php artisan cache:clear
php artisan config:clear  
php artisan route:clear
php artisan view:clear

# 5. Regenerate optimized cache
php artisan optimize:clear
php artisan optimize

# 6. Check Laravel version (optional)
php artisan --version
```

### **Step 5: Restart PHP-FPM (VERY IMPORTANT)**
```bash
# Option 1 (check which one works on your server)
sudo systemctl restart php-fpm

# Option 2
sudo systemctl restart php84-php-fpm

# Option 3 (jika pakai Apache)
sudo systemctl restart apache2
sudo a2enmod rewrite  # ensure rewrite mod is enabled
```

### **Step 6: Verify Deployment**
```bash
# Check if code was pulled
git log --oneline -5

# Check Laravel status
php artisan config:cache

# Test provinces API call
php artisan tinker
>>> Http::get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json')->status()
```

---

## Expected Output After Fix

Error log sebelum:
```
local.ERROR: CURL error 7: Failed to connect to www.emsifa.com port 80
```

Setelah deployment:
```
✅ Website berjalan normal
✅ No emsifa.com errors
```

---

## Troubleshooting

### **Error: "Permission denied" saat composer install**
```bash
sudo chown -R www-data:www-data /home/peta-bima/public_html
sudo chmod -R 775 /home/peta-bima/public_html
```

### **Error: "git: command not found"**
```bash
# Install git
sudo apt-get update
sudo apt-get install git
```

### **Error: Still seeing www.emsifa.com error**
```bash
# Check what PHP version is running
php -v

# Double-check code was pulled
grep -r "www.emsifa.com" /home/peta-bima/public_html/app/

# If found, force pull again
git clean -fd
git pull origin main --force
```

### **Error: File permissions issues**
```bash
# Nuclear option - fix all permissions
find /home/peta-bima/public_html -type f -exec chmod 644 {} \;
find /home/peta-bima/public_html -type d -exec chmod 755 {} \;
chmod -R 775 /home/peta-bima/public_html/storage
chmod -R 775 /home/peta-bima/public_html/bootstrap/cache
```

---

## Quick Command (Copy-Paste Ready)
```bash
cd /home/peta-bima/public_html && \
git pull origin main && \
composer install --no-dev --optimize-autoloader && \
chmod -R 755 storage/ bootstrap/cache/ && \
chown -R www-data:www-data storage/ bootstrap/cache/ && \
php artisan optimize:clear && \
php artisan optimize && \
sudo systemctl restart php-fpm && \
echo "✅ Deployment completed!"
```

---

## Final Check
Visit: https://peta-bima.osk.dom.my.id

Should work without `www.emsifa.com` errors! ✅
