# Integrasi Frontend dengan Laravel API

## 📝 Panduan Mengupdate Frontend JavaScript

Berikut adalah contoh cara mengupdate frontend JavaScript Anda untuk mengambil data dari Laravel API instead of static JSON files.

## 🔧 Setup Base URL

Tambahkan konfigurasi base URL di awal file JavaScript Anda:

```javascript
// Konfigurasi API
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function untuk fetch API
async function fetchAPI(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Tambahkan query parameters
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error('API returned error');
        }

        return result.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

## 📊 Update Fungsi Load Data Permasalahan

### Before (File JSON Statis):

```javascript
async function loadWasteData(dataType = 'sampah') {
    try {
        currentDataType = dataType;
        const config = dataConfig[dataType];

        console.log(`Attempting to load ${dataType} data...`);
        const response = await fetch(config.file);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // ... process data
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
```

### After (Laravel API):

```javascript
// Update dataConfig untuk menggunakan API endpoints
var dataConfig = {
    sampah: {
        apiEndpoint: '/permasalahan',
        apiParams: { level: 'provinsi', jenis: 'sampah' },
        unit: 'ton/tahun',
        legendTitle: 'Timbulan Sampah (ton/tahun)'
    },
    stunting: {
        apiEndpoint: '/permasalahan',
        apiParams: { level: 'provinsi', jenis: 'stunting' },
        unit: '%',
        legendTitle: 'Persentase Stunting (%)'
    },
    giziBuruk: {
        apiEndpoint: '/permasalahan',
        apiParams: { level: 'provinsi', jenis: 'gizi_buruk' },
        unit: '%',
        legendTitle: 'Persentase Gizi Buruk (%)'
    },
    krisisListrik: {
        apiEndpoint: '/permasalahan',
        apiParams: { level: 'provinsi', jenis: 'krisis_listrik' },
        unit: 'Jam/Pelanggan',
        legendTitle: 'SAIDI (Jam/Pelanggan)',
        hasMetrics: true,
        metrics: {
            saidi: {
                metrik: 'saidi',
                unit: 'Jam/Pelanggan',
                label: 'SAIDI',
                legendTitle: 'SAIDI (Jam/Pelanggan)'
            },
            saifi: {
                metrik: 'saifi',
                unit: 'Kali/Pelanggan',
                label: 'SAIFI',
                legendTitle: 'SAIFI (Kali/Pelanggan)'
            }
        }
    },
    ketahananPangan: {
        apiEndpoint: '/permasalahan',
        apiParams: { level: 'provinsi', jenis: 'ketahanan_pangan' },
        unit: ' ',
        legendTitle: 'IKP Ketahanan Pangan'
    },
};

async function loadWasteData(dataType = 'sampah') {
    try {
        currentDataType = dataType;
        const config = dataConfig[dataType];

        // Siapkan API parameters
        let apiParams = { ...config.apiParams };

        // Jika krisis listrik, tambahkan metrik
        if (dataType === 'krisisListrik' && config.hasMetrics) {
            apiParams.metrik = currentMetric;
        }

        console.log(`Loading ${dataType} data from API...`);

        // Fetch data dari Laravel API
        const data = await fetchAPI(config.apiEndpoint, apiParams);

        console.log('Data received from API:', data);

        // Data sudah dalam format yang benar dari API
        // Format: { "Jawa Barat": 12345.67, "Jawa Timur": 23456.78, ... }
        provinsiWasteData = data;

        // Untuk data kabupaten
        if (currentMode === 'kabupaten') {
            apiParams.level = 'kabupaten';
            const kabupatenData = await fetchAPI(config.apiEndpoint, apiParams);
            kabupatenWasteData = kabupatenData;
        }

        // Update legend, table, dll
        updateLegendTitle();
        updateTableTitle();
        updateDataSource();
        updateDataSelected();

        const activeTab = document.getElementById('tab-provinsi').classList.contains('text-blue-600') ? 'provinsi' : 'kabupaten';
        populateTable(activeTab);

        return true;

    } catch (error) {
        console.error('Error loading data:', error);
        alert('Gagal memuat data. Pastikan Laravel API sudah berjalan.');
        return false;
    }
}
```

## 🗺️ Update Fungsi Load Bubble Data (Penelitian, Hilirisasi, Pengabdian)

### Before:

```javascript
async function loadBubbleData(type) {
    try {
        currentBubbleType = type;
        let filePath = `/data/data-${type}.json`;

        let response = await fetch(filePath);
        const rawText = await response.text();
        // ... process
    } catch (error) {
        console.error(`Error loading ${type} data:`, error);
    }
}
```

### After:

```javascript
async function loadBubbleData(type) {
    try {
        currentBubbleType = type;

        console.log(`Loading ${type} data from API...`);

        let endpoint = '';
        let params = {};

        if (type === 'penelitian') {
            endpoint = '/penelitian';
        } else if (type === 'hilirisasi') {
            endpoint = '/hilirisasi';
        } else if (type === 'pengabdian') {
            endpoint = '/pengabdian';

            // Tambahkan filter batch_type untuk pengabdian
            if (currentPengabdianSubType === 'combined') {
                // Tidak perlu filter, akan ambil semua kecuali kosabangsa
                // Atau bisa fetch terpisah dan gabungkan
            } else if (currentPengabdianSubType === 'kosabangsa') {
                params.batch_type = 'kosabangsa';
            }
        }

        // Fetch data dari API
        let loadedData = await fetchAPI(endpoint, params);

        // Untuk pengabdian combined, fetch multiple batch types
        if (type === 'pengabdian' && currentPengabdianSubType === 'combined') {
            const multitahun = await fetchAPI(endpoint, { batch_type: 'multitahun_lanjutan' });
            const batchI = await fetchAPI(endpoint, { batch_type: 'batch_i' });
            const batchII = await fetchAPI(endpoint, { batch_type: 'batch_ii' });

            loadedData = [...multitahun, ...batchI, ...batchII];
        }

        if (loadedData.length === 0) {
            console.error(`No ${type} data found.`);
            return false;
        }

        // Simpan ke variabel global
        if (type === 'penelitian') {
            penelitianData = loadedData;
            bubbleData = penelitianData;
        } else if (type === 'hilirisasi') {
            hilirisasiData = loadedData;
            bubbleData = hilirisasiData;
        } else if (type === 'pengabdian') {
            pengabdianData = loadedData;
            bubbleData = pengabdianData;
        }

        console.log(`${type} data loaded:`, bubbleData.length, 'items');

        updateBubbleSelected();
        addBubbleLayer();

        return true;
    } catch (error) {
        console.error(`Error loading ${type} data:`, error);
        alert('Gagal memuat data. Pastikan Laravel API sudah berjalan.');
        return false;
    }
}
```

## 🔍 Optimasi: Load Data dengan Bounds (Map Viewport)

Untuk performa lebih baik, Anda bisa load data hanya yang visible di map:

```javascript
function getCurrentMapBounds() {
    const bounds = map.getBounds();
    return {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
    };
}

async function loadBubbleDataWithBounds(type) {
    try {
        const bounds = getCurrentMapBounds();

        let endpoint = `/${type}`;
        let params = {
            bounds: JSON.stringify(bounds)
        };

        const data = await fetchAPI(endpoint, params);

        // Process data...
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Update data saat map dipindah/dizoom
map.on('moveend', debounce(async function() {
    await loadBubbleDataWithBounds(currentBubbleType);
    addBubbleLayer();
}, 500));
```

## 📱 Debounce Helper

Untuk menghindari terlalu banyak request saat user zoom/pan map:

```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```

## 🌐 CORS Configuration

Jika frontend dan backend berjalan di port berbeda, pastikan CORS sudah di-enable di Laravel.

Edit `config/cors.php`:

```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:5500'], // Tambahkan origin frontend Anda
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

## 🚀 Production Deployment

Untuk production, update `API_BASE_URL`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.petabima.com/api'
    : 'http://localhost:8000/api';
```

## ✅ Testing

Test API endpoints menggunakan browser atau Postman:

```
http://localhost:8000/api/penelitian
http://localhost:8000/api/hilirisasi
http://localhost:8000/api/permasalahan?level=provinsi&jenis=sampah
```

## 💡 Tips

1. **Caching**: Gunakan localStorage untuk cache data yang jarang berubah
2. **Loading State**: Tambahkan loading indicator saat fetch data
3. **Error Handling**: Tampilkan pesan error yang user-friendly
4. **Pagination**: Gunakan pagination untuk data besar
5. **Search**: Manfaatkan parameter `search` di API untuk filter data

## 🐛 Common Issues

### CORS Error
```
Access to fetch at 'http://localhost:8000/api/penelitian' from origin 'http://localhost:5500'
has been blocked by CORS policy
```

**Solution**: Enable CORS di Laravel (lihat bagian CORS Configuration di atas)

### Network Error
```
TypeError: Failed to fetch
```

**Solution**:
1. Pastikan Laravel server sudah running (`php artisan serve`)
2. Check API_BASE_URL sudah benar
3. Test endpoint di browser langsung

### Data Format Mismatch
```
Cannot read property 'Data' of undefined
```

**Solution**: API Laravel mengembalikan data langsung, tidak perlu akses `.Data` lagi.

## 📞 Need Help?

Jika ada masalah integrasi, check:
1. Laravel logs: `storage/logs/laravel.log`
2. Browser console untuk error messages
3. Network tab di DevTools untuk inspect request/response
