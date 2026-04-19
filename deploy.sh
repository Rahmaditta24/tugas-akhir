#!/bin/bash

# Deployment script for Laravel production
# Usage: bash deploy.sh

echo "🚀 Starting deployment..."

# 1. Pull latest code
echo "📥 Pulling latest code from git..."
git pull origin main

# 2. Install dependencies
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader

# 3. Fix permissions
echo "🔐 Fixing permissions..."
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
chown -R www-data:www-data storage/ bootstrap/cache/

# 4. Clear all caches
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 5. Regenerate optimized cache
echo "⚡ Generating optimized cache..."
php artisan optimize:clear
php artisan optimize

# 6. Run migrations (if needed)
# php artisan migrate --force

echo "✅ Deployment completed successfully!"
