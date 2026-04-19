# 🚀 Performance Optimization Guide - LCP 21.32s → Target 3-5s

## Root Causes Identified

### 1. **GROUP_CONCAT Queries (KILLER BOTTLENECK)**
```php
// ❌ SLOW - Multiple GROUP_CONCAT in single query
DB::raw('GROUP_CONCAT(COALESCE(id, "-") SEPARATOR "|") as all_ids'),
DB::raw('GROUP_CONCAT(COALESCE(judul, "-") SEPARATOR "|") as all_titles'),
DB::raw('GROUP_CONCAT(COALESCE(nama, "-") SEPARATOR "|") as all_researchers'),
// ... 10+ more GROUP_CONCAT
```

**Why slow:**
- Concatenating 1000+ records into single string per institution
- Setting `group_concat_max_len = 1000000` forces large memory allocation
- MySQL has to process + concatenate all data before returning

**Impact:** ~10-15 seconds per query with 1000+ records

---

### 2. **Data Aggregation Issues**
- Loading **all data** at once instead of pagination
- No lazy loading of details
- Frontend processes huge JSON strings
- Browser has to parse/render massive data

---

### 3. **Cache Strategy**
```php
// ❌ Cache key changes on every filter
$cacheKey = 'map_data_cache_v5_' . md5(json_encode($request->all()));
// Results in: different cache for every filter combination
// Defeats caching purpose when users change filters frequently
```

---

## 🎯 Optimization Strategy

### **Phase 1: Quick Wins (1-2 hours)**

#### 1. Remove GROUP_CONCAT, Use Relationship Loading
```php
// ✅ FAST - Load relationships on demand
$mapData = (clone $baseQuery)
    ->select('id', 'institusi', 'pt_latitude', 'pt_longitude', 'provinsi')
    ->whereNotNull('pt_latitude')
    ->whereNotNull('pt_longitude')
    ->groupBy('institusi')
    ->get();

// Then on frontend: load full details only when clicked
```

#### 2. Separate Map Pins from Details
```php
// Map endpoint - minimal data
GET /api/penelitian/map-pins
→ Returns: [{ lat, lon, institusi, count }]  // ~500KB

// Detail endpoint - fetch when needed  
GET /api/penelitian/institusi/{id}
→ Returns: { id, titles, researchers, skema } // ~100KB each
```

#### 3. Implement Pagination
```php
// ❌ Load 5000 records
$researches = $baseQuery->get();

// ✅ Load 50 at a time
$researches = $baseQuery->paginate(50);
```

#### 4. Frontend Lazy Loading
```javascript
// ✅ Load map first, details on demand
useEffect(() => {
    // 1. Load map pins (fast)
    fetchMapPins();
    
    // 2. Load filter options (cached)
    fetchFilterOptions();
    
    // 3. Load details only when user clicks (on demand)
}, []);
```

---

### **Phase 2: Database Optimization (2-3 hours)**

#### 5. Add Indexes
```sql
-- For map queries
ALTER TABLE penelitian ADD INDEX idx_institusi_coords (institusi, pt_latitude, pt_longitude);
ALTER TABLE penelitian ADD INDEX idx_filters (bidang_fokus, tema_prioritas, kategori_pt, klaster);

-- For aggregation
ALTER TABLE penelitian ADD INDEX idx_group_by (institusi, thn_pelaksanaan);
```

#### 6. Denormalize Data (if needed)
```sql
-- Create summary table
CREATE TABLE penelitian_summary (
    institusi VARCHAR(255) PRIMARY KEY,
    provinsi VARCHAR(100),
    pt_latitude FLOAT,
    pt_longitude FLOAT,
    total_count INT,
    avg_year INT,
    updated_at TIMESTAMP
);

-- Update with cron job every hour
-- Query from this instead of aggregating on demand
```

#### 7. Materialized Views Pattern
```php
// Cache the aggregated data once, not per filter
Cache::remember('map_data_all', 3600, function() {
    return DB::table('penelitian')
        ->select('institusi', 'provinsi', 'pt_latitude', 'pt_longitude', DB::raw('COUNT(*) as count'))
        ->whereNotNull('pt_latitude')
        ->groupBy('institusi')
        ->get();
});
```

---

### **Phase 3: Frontend Optimization (1-2 hours)**

#### 8. Code Splitting
```javascript
// ✅ Load map component only when needed
const MapContainer = lazy(() => import('./MapContainer'));

<Suspense fallback={<Loading />}>
    <MapContainer data={mapData} />
</Suspense>
```

#### 9. Virtual Scrolling for Lists
```javascript
// ✅ Render only visible items
import { FixedSizeList } from 'react-window';

<FixedSizeList
    height={600}
    itemCount={researches.length}
    itemSize={80}
    width="100%"
>
    {Row}
</FixedSizeList>
```

#### 10. Optimize Assets
```bash
# ✅ Minify GeoJSON
$ gzip kab_prov_map.json  # Result: 200KB → 50KB

# ✅ Image optimization
$ imagemin --plugin.mozjpeg.quality=80 assets/images/*
```

---

## 📋 Implementation Checklist

### Quick Wins First (Target: 21s → 10s)
- [ ] Remove GROUP_CONCAT, use minimal map pins query
- [ ] Implement pagination (50 per page)
- [ ] Separate map data from detail data
- [ ] Add lazy loading on frontend

### Database (Target: 10s → 5s)
- [ ] Add indexes on institusi, bidang_fokus, tema_prioritas
- [ ] Test query performance: `EXPLAIN SELECT ...`
- [ ] Consider denormalization if GROUP_BY still slow

### Frontend (Target: 5s → 3s)
- [ ] Lazy load components
- [ ] Virtual scroll for lists
- [ ] Optimize GeoJSON size
- [ ] Minify CSS/JS

---

## 🧪 Performance Testing Commands

```bash
# Query performance (should be < 1 second)
php artisan tinker
>>> DB::enableQueryLog();
>>> Penelitian::where(...)->get();
>>> dd(DB::getQueryLog());

# Measure LCP in browser console
>>> window.addEventListener('load', () => {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    console.log('LCP:', lcpEntries[lcpEntries.length - 1].renderTime / 1000, 'seconds');
});
```

---

## 💡 Priority Order

1. **URGENT (1 hour):** Remove GROUP_CONCAT → Replace with pagination API
2. **HIGH (2 hours):** Add database indexes + test queries
3. **MEDIUM (2 hours):** Frontend lazy loading + virtual scroll
4. **LOW (1 hour):** Asset optimization + CDN caching

---

## Expected Results

| Optimization | Time Saved |
|--------------|-----------|
| Remove GROUP_CONCAT | 10-12s |
| Add indexes | 2-3s |
| Pagination | 1-2s |
| Lazy loading | 2-3s |
| Asset optimization | 1-2s |
| **TOTAL** | **16-22s → 3-5s** |

---

## Next: Pick an optimization to start with!

Recommend starting dengan:
1. Remove GROUP_CONCAT (biggest impact)
2. Add indexes
3. Frontend lazy loading

Siap untuk kode?
