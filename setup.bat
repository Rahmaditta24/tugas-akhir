@echo off
echo ========================================
echo Setup Laravel Backend - Peta BIMA
echo ========================================
echo.

:: Check if composer is installed
where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Composer tidak ditemukan! Install composer terlebih dahulu.
    pause
    exit /b 1
)

:: Check if PHP is installed
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PHP tidak ditemukan! Install PHP terlebih dahulu.
    pause
    exit /b 1
)

echo [1/7] Checking PHP version...
php -v
echo.

echo [2/7] Installing Composer dependencies...
call composer install --no-interaction
if %errorlevel% neq 0 (
    echo [ERROR] Composer install gagal!
    pause
    exit /b 1
)
echo.

echo [3/7] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created
) else (
    echo .env file already exists
)
echo.

echo [4/7] Generating application key...
call php artisan key:generate
echo.

echo [5/7] Creating database...
echo Silakan buat database MySQL dengan nama: peta_bima
echo Lalu update konfigurasi DB di file .env
echo.
pause

echo [6/7] Running migrations...
call php artisan migrate
if %errorlevel% neq 0 (
    echo [ERROR] Migration gagal! Pastikan database sudah dibuat dan .env sudah dikonfigurasi.
    pause
    exit /b 1
)
echo.

echo [7/7] Importing data from JSON to database...
echo This may take several minutes...
call php artisan db:seed
if %errorlevel% neq 0 (
    echo [WARNING] Seeding gagal atau sebagian gagal. Check error di atas.
)
echo.

echo ========================================
echo Setup selesai!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Jalankan: php artisan serve
echo 2. API akan tersedia di: http://localhost:8000/api
echo 3. Baca dokumentasi di README_SETUP.md
echo.
pause
