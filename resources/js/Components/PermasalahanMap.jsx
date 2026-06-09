import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';


// ─── Fungsi bantu warna ───────────────────────────────────────────────────────
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function interpolateColor(hex1, hex2, t) {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

/**
 * Gradien Hijau → Kuning → Merah, identik dengan bar gradien PermasalahanLegend.
 * minPct / maxPct (0-100) mengizinkan slider legenda untuk memangkas skala.
 */
function getChoroColor(value, dataMin, dataMax, minPct, maxPct, activeDataType = 'Sampah') {
    if (value === null || value === undefined || isNaN(value)) return '#cccccc';

    const lo = dataMin + (dataMax - dataMin) * (minPct / 100);
    const hi = dataMin + (dataMax - dataMin) * (maxPct / 100);

    // Nilai yang benar-benar di luar rentang slider ditampilkan dengan warna abu-abu
    if (value < lo || value > hi) {
        return '#d1d5db'; // GRAY_300
    }

    const typeLower = activeDataType.toLowerCase();

    // 1. Logika khusus untuk SAMPAH - Tetap menggunakan langkah warna diskrit agar lebih terlihat di UI
    if (typeLower === 'sampah') {
        const effectiveMax = hi + 5;
        const scaleFactor = Math.max(0.1, effectiveMax / 1000000);

        if (value < 100000 * scaleFactor) return '#4ade80'; // green-400
        if (value < 200000 * scaleFactor) return '#86efac'; // green-300
        if (value < 300000 * scaleFactor) return '#bef264'; // lime-300
        if (value < 400000 * scaleFactor) return '#fbbf24'; // yellow-400
        if (value < 500000 * scaleFactor) return '#fcd34d'; // yellow-300
        if (value < 750000 * scaleFactor) return '#fb923c'; // orange-400
        if (value < 1000000 * scaleFactor) return '#f87171'; // red-400
        if (value < 1500000 * scaleFactor) return '#ef4444'; // red-500
        return '#dc2626'; // red-600
    }

    // 2. Logika default (Stunting, Gizi Buruk, Krisis Listrik, Ketahanan Pangan)
    // dinormalisasi: 0 adalah "Baik/Hijau", 1 adalah "Buruk/Merah"
    let normalized = hi === lo ? 0 : Math.max(0, Math.min(1, (value - lo) / (hi - lo)));

    // Untuk Ketahanan Pangan, nilai lebih tinggi artinya lebih baik (Aman), jadi kita balik indeksnya
    // sehingga nilai lebih tinggi menghasilkan Hijau (normalized mendekati 0).
    if (typeLower === 'ketahanan pangan') {
        normalized = 1 - normalized;
    }

    // Gunakan logika RGB lama dari proyek sebelumnya untuk estetika yang konsisten
    const red = Math.round(normalized * 255);
    const green = Math.round((1 - normalized) * 255);
    const blue = 50;

    return `rgb(${red}, ${green}, ${blue})`;
}

// ─── Normalisasi nama provinsi ───────────────────────────────────────────────
function normProv(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^(prov\.\s*|provinsi\s*|daerah istimewa\s*|d\.i\.\s*|dki\s*|kab\.?|kabupaten|kota)\s+/g, '')
        .replace(/\s+(penelitian|pengabdian|hilirisasi|inovasi)$/i, '')
        .trim();
}

// Alias eksplisit: bentuk DB → nilai `state` di GeoJSON
const PROV_ALIAS = {
    'aceh': 'Aceh',
    'sumatera utara': 'Sumatera Utara',
    'sumatera barat': 'Sumatera Barat',
    'riau': 'Riau',
    'kepulauan riau': 'Kepulauan Riau',
    'jambi': 'Jambi',
    'sumatera selatan': 'Sumatera Selatan',
    'bengkulu': 'Bengkulu',
    'lampung': 'Lampung',
    'kepulauan bangka belitung': 'Kepulauan Bangka Belitung',
    'bangka belitung': 'Kepulauan Bangka Belitung',
    'banten': 'Banten',
    'jakarta': 'DKI Jakarta',
    'dki jakarta': 'DKI Jakarta',
    'jawa barat': 'Jawa Barat',
    'jawa tengah': 'Jawa Tengah',
    'yogyakarta': 'DI Yogyakarta',
    'di yogyakarta': 'DI Yogyakarta',
    'daerah istimewa yogyakarta': 'DI Yogyakarta',
    'jawa timur': 'Jawa Timur',
    'bali': 'Bali',
    'nusa tenggara barat': 'Nusa Tenggara Barat',
    'nusa tenggara timur': 'Nusa Tenggara Timur',
    'kalimantan barat': 'Kalimantan Barat',
    'kalimantan tengah': 'Kalimantan Tengah',
    'kalimantan selatan': 'Kalimantan Selatan',
    'kalimantan timur': 'Kalimantan Timur',
    'kalimantan utara': 'Kalimantan Utara',
    'sulawesi utara': 'Sulawesi Utara',
    'gorontalo': 'Gorontalo',
    'sulawesi tengah': 'Sulawesi Tengah',
    'sulawesi barat': 'Sulawesi Barat',
    'sulawesi selatan': 'Sulawesi Selatan',
    'sulawesi tenggara': 'Sulawesi Tenggara',
    'maluku': 'Maluku',
    'maluku utara': 'Maluku Utara',
    'papua barat daya': 'Papua Barat Daya',
    'papua barat': 'Papua Barat',
    'papua selatan': 'Papua Selatan',
    'papua tengah': 'Papua Tengah',
    'papua pegunungan': 'Papua Pegunungan',
    'papua': 'Papua',
};

function resolveGeoJsonName(dbName) {
    const norm = normProv(dbName);
    return PROV_ALIAS[norm] || null;
}

function getBubblesCount(geoName, viewMode, mapData) {
    if (!mapData || !geoName) return 0;
    const key = viewMode === 'kabupaten' ? 'kabupaten_kota' : 'provinsi';
    const normTarget = normProv(geoName);
    return mapData.filter((item) => {
        const itemLocation = item[key] || item.kabupaten_kota || item.provinsi || '';
        return normProv(itemLocation) === normTarget;
    }).length;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PermasalahanMap({
    /** Statistik permasalahan: { 'Sampah': [{provinsi, nilai, satuan, tahun}], ... } */
    permasalahanStats = {},
    /** Statistik permasalahan untuk kabupaten/kota */
    permasalahanKabupatenStats = {},
    /** Jenis permasalahan yang aktif saat ini, mis. 'Sampah' */
    activeDataType = 'Sampah',
    /** Jenis penanda gelembung, mis. 'Penelitian', 'Inovasi' */
    bubbleType = 'Penelitian',
    /** Penanda gelembung (mapData yang ada dari controller) */
    mapData = [],
    /** Data statistik */
    stats = {},
    /** Tampilkan / sembunyikan layer gelembung */
    showBubbles = true,
    /** 'provinsi' | 'kabupaten' */
    viewMode = 'provinsi',
    /** Pemangkasan persentil dari slider legenda (0-100) */
    minPct = 0,
    maxPct = 100,
    /** Callback untuk memberi tahu parent tentang min/max/satuan agar legenda dapat menampilkannya */
    onLegendUpdate,
    /** Metrik yang dipilih untuk Krisis Listrik (saidi atau saifi) */
    selectedMetrik = 'saidi',
    /** Callback saat metrik berubah */
    onMetrikChange,
    onItemClick,
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const geoJsonLayerRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const selectedGeoLayerRef = useRef(null); // Ref untuk wilayah yang sedang diklik
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [geoJsonLoading, setGeoJsonLoading] = useState(true);

    const safe = (val) => (val === null || val === undefined || val === '') ? '-' : val;
    // Simpan parameter skala warna yang sudah dihitung agar efek slider bisa mengaksesnya tanpa menjalankan ulang efek berat
    const choroplethMetaRef = useRef({ dataLookup: {}, dataMin: 0, dataMax: 1, satuan: '' });
    const cachedMarkersRef = useRef([]);
    const lastMapDataRef = useRef(null);
    const lastActiveDataTypeRef = useRef(null);
    const regencyCentroidsRef = useRef({});

    function calculateCentroid(feature) {
        try {
            const geom = feature.geometry;
            if (!geom) return null;

            let coords = geom.coordinates;
            let type = geom.type;
            let flatPoints = [];

            if (type === 'Polygon') {
                flatPoints = coords[0];
            } else if (type === 'MultiPolygon') {
                // Ambil poligon terbesar atau cukup yang pertama
                flatPoints = coords[0][0];
            }

            if (flatPoints && flatPoints.length > 0) {
                let sumLat = 0, sumLng = 0;
                let count = 0;
                flatPoints.forEach(p => {
                    if (Array.isArray(p) && p.length >= 2) {
                        sumLng += p[0];
                        sumLat += p[1];
                        count++;
                    }
                });
                if (count > 0) return [sumLat / count, sumLng / count];
            }
        } catch (e) {
            console.error('Kesalahan menghitung centroid:', e);
        }
        return null;
    }

    // Ambil GeoJSON saat viewMode berubah
    useEffect(() => {
        let isInstanceActive = true;
        setGeoJsonLoading(true);
        
        const url = viewMode === 'kabupaten'
            ? '/assets/kabupaten-new.json'
            : '/assets/provinsi-new.json';

        fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error('Gagal mengambil GeoJSON: ' + r.status);
                return r.json();
            })
            .then((data) => {
                if (isInstanceActive) {
                    setGeoJsonData(data);
                    // Paksa loading off di tick berikutnya agar pasti
                    setTimeout(() => setGeoJsonLoading(false), 50);
                }
            })
            .catch((e) => {
                console.error('PermasalahanMap – Gagal memuat GeoJSON:', e);
                if (isInstanceActive) setGeoJsonLoading(false);
            });
            
        return () => { isInstanceActive = false; };
    }, [viewMode]);

    // Inisialisasi peta Leaflet sekali saja
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [-2.5, 118],
            zoom: 5,
            minZoom: 4,
            maxZoom: 18,
            zoomControl: true,
            preferCanvas: true,
            maxBounds: [[-11.0, 94.0], [6.5, 141.0]],
            maxBoundsViscosity: 1.0,
            zoomAnimation: true,
            zoomAnimationThreshold: 4,
            markerZoomAnimation: true,
            fadeAnimation: true,
            inertia: true,
            inertiaDeceleration: 2500,
            inertiaMaxSpeed: 1200,
            easeLinearity: 0.15,
            wheelPxPerZoomLevel: 80,
            zoomSnap: 1,
            zoomDelta: 1,
        });

        // Gunakan tile OpenStreetMap (konsisten dengan tab lain)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            keepBuffer: 6,
            updateWhenIdle: false,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                const map = mapInstanceRef.current;
                mapInstanceRef.current = null;
                setTimeout(() => {
                    try {
                        map.remove();
                    } catch (e) {
                        console.error('Error removing map:', e);
                    }
                }, 0);
            }
        };
    }, []);

    // ── Pra-hitung data lookup (useMemo untuk efisiensi/ketersediaan langsung) ───
    const choroplethData = useMemo(() => {
        const statsSource = (viewMode === 'provinsi' ? permasalahanStats : (permasalahanKabupatenStats || {})) || {};
        const rawActiveDataType = activeDataType || 'Sampah';
        const finalActiveDataType = Array.isArray(rawActiveDataType) ? rawActiveDataType[0] : rawActiveDataType;

        let rows = statsSource[finalActiveDataType] || [];
        if (finalActiveDataType === 'Krisis Listrik') {
            rows = rows.filter((row) => !row.metrik || row.metrik === selectedMetrik);
        }

        const keyName = viewMode === 'provinsi' ? 'provinsi' : 'kabupaten_kota';
        const latestStatsMap = new Map();
        rows.forEach(row => {
            const locName = (row[keyName] || '').toLowerCase().trim();
            if (!locName) return;
            const current = latestStatsMap.get(locName);
            const rowYear = parseInt(row.tahun) || 0;
            const currentYear = current ? (parseInt(current.tahun) || 0) : -1;
            if (rowYear >= currentYear) latestStatsMap.set(locName, row);
        });
        rows = Array.from(latestStatsMap.values());

        const values = rows.map((s) => s.nilai ?? 0).filter((v) => v !== null && v !== undefined);
        const dataMin = values.length ? Math.min(...values) : 0;
        const dataMax = values.length ? Math.max(...values) : 1;
        const satuan = rows[0]?.satuan || '';

        const dataLookup = {};
        rows.forEach((s) => {
            if (s[keyName]) {
                const name = s[keyName].toLowerCase().trim();
                const normName = normProv(name);
                dataLookup[normName] = s.nilai;
                // Pertahankan kompatibilitas ke belakang untuk key yang belum dinormalisasi
                if (!dataLookup[name]) {
                    dataLookup[name] = s.nilai;
                }
            }
        });

        return { dataLookup, dataMin, dataMax, satuan, activeDataType: finalActiveDataType };
    }, [permasalahanStats, permasalahanKabupatenStats, activeDataType, viewMode, selectedMetrik]);

    // Perbarui parent legenda setiap kali choroplethData berubah
    useEffect(() => {
        if (onLegendUpdate) {
            onLegendUpdate({
                min: choroplethData.dataMin,
                max: choroplethData.dataMax,
                satuan: choroplethData.satuan,
                activeDataType: choroplethData.activeDataType
            });
        }
    }, [choroplethData, onLegendUpdate]);

    // Sinkronkan choroplethMetaRef untuk efek slider
    useEffect(() => {
        choroplethMetaRef.current = choroplethData;
    }, [choroplethData]);

    // Fungsi pembantu untuk menghasilkan HTML popup secara andal
    const generateGeoJsonPopup = (feature, rawName, viewMode, activeDataType, dataLookup) => {
        const geoName = normProv(rawName);
        const nilai = dataLookup[geoName] ?? dataLookup[rawName.toLowerCase().trim()] ?? dataLookup[resolveGeoJsonName(rawName)?.toLowerCase()];
        const satuan = choroplethData.satuan || '';

        const formattedNilai = nilai !== undefined ? Number(nilai).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '-';
        const labelName = activeDataType === 'Sampah' ? 'Timbulan Sampah' : (activeDataType || 'Nilai');
        const nilaiBesar = nilai !== undefined ? `${formattedNilai} ${satuan || ''}` : '-';

        let subtitle = '';
        if (viewMode === 'kabupaten') {
            const kec = feature.properties?.WADMKC || '';
            const desa = feature.properties?.NAMOBJ || feature.properties?.WADMD || '';
            if (kec && desa && kec !== rawName && desa !== rawName) subtitle = `${kec} - ${desa}`;
            else subtitle = feature.properties?.WADMPR || '';
        }

        return `
            <div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; min-width: 160px; line-height: 1.4;">
                <div style="color: #333; font-size: 14.5px; margin-bottom: ${subtitle ? '0' : '6'}px;">${rawName}</div>
                ${subtitle ? `<div style="color: #666; font-size: 12.5px; margin-bottom: 6px;">${subtitle}</div>` : ''}
                <div style="color: #333; font-size: 13.5px;">
                    <strong>${labelName}:</strong> ${nilaiBesar}
                </div>
            </div>
        `;
    };

    // ── Efek 1: Kelola Siklus Hidup Layer GeoJSON ────────────────────────────
    useEffect(() => {
        if (!mapInstanceRef.current || !geoJsonData) return;

        // Bangun ulang hanya saat geometri berubah (viewMode atau geoJsonData)
        if (geoJsonLayerRef.current) {
            mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
            geoJsonLayerRef.current = null;
        }

        const { dataLookup, dataMin, dataMax, satuan, activeDataType } = choroplethData;

          const layer = L.geoJSON(geoJsonData, {
            style: (feature) => {
                let rawName = '';
                if (viewMode === 'kabupaten') {
                    rawName = feature.properties?.WADMKK || feature.properties?.NAMOBJ || '';
                } else {
                    rawName = feature.properties?.state || feature.properties?.name || feature.properties?.PROVINSI || '';
                }
                const geoName = normProv(rawName);
                const nilai = dataLookup[geoName] ?? dataLookup[rawName.toLowerCase().trim()] ?? dataLookup[resolveGeoJsonName(rawName)?.toLowerCase()];
                
                return {
                    fillColor: nilai !== undefined
                        ? getChoroColor(nilai, dataMin, dataMax, minPct, maxPct, activeDataType)
                        : '#e5e7eb',
                    fillOpacity: 0.8,
                    color: '#000000',
                    weight: 1,
                    opacity: 1,
                };
            },
            onEachFeature: (feature, layer) => {
                layer.on('mouseover', () => {
                    if (selectedGeoLayerRef.current !== layer) {
                        layer.setStyle({ fillOpacity: 0.95, weight: 1.5 });
                    }
                });
                layer.on('mouseout', () => {
                    if (selectedGeoLayerRef.current !== layer) {
                        layer.setStyle({ fillOpacity: 0.75, weight: 1 });
                    }
                });
                layer.on('click', () => {
                    // Reset style wilayah yang sebelumnya dipilih
                    if (selectedGeoLayerRef.current && selectedGeoLayerRef.current !== layer) {
                        selectedGeoLayerRef.current.setStyle({ weight: 1, color: '#000000', fillOpacity: 0.75 });
                    }
                    // Jika klik wilayah yang sama → toggle off
                    if (selectedGeoLayerRef.current === layer) {
                        layer.setStyle({ weight: 1, color: '#000000', fillOpacity: 0.75 });
                        selectedGeoLayerRef.current = null;
                    } else {
                        // Highlight wilayah yang diklik dengan border tebal hitam
                        layer.setStyle({ weight: 3, color: '#000000', fillOpacity: 0.8 });
                        layer.bringToFront();
                        selectedGeoLayerRef.current = layer;
                    }
                });

                let rawName = '';
                if (viewMode === 'kabupaten') {
                    rawName = feature.properties?.WADMKK || feature.properties?.NAMOBJ || '';
                } else {
                    rawName = feature.properties?.state || feature.properties?.name || feature.properties?.PROVINSI || '';
                }
                const popupContent = generateGeoJsonPopup(feature, rawName, viewMode, activeDataType, dataLookup);
                layer.bindPopup(popupContent, { closeButton: true, autoPan: true });
            },
        }).addTo(mapInstanceRef.current);

        geoJsonLayerRef.current = layer;
        layer.bringToBack();
    }, [geoJsonData, viewMode]);

    // ── Efek 1.5: Perbarui Properti Layer saat Statistik Berubah ──────────────
    useEffect(() => {
        if (!mapInstanceRef.current || !geoJsonLayerRef.current) return;
        
        const { dataLookup, dataMin, dataMax, satuan, activeDataType } = choroplethData;

        // Perbarui style & popup pada layer yang ada
        geoJsonLayerRef.current.eachLayer((layer) => {
            const feature = layer.feature;
            let rawName = '';
            if (viewMode === 'kabupaten') {
                rawName = feature.properties?.WADMKK || feature.properties?.NAMOBJ || '';
            } else {
                rawName = feature.properties?.state || feature.properties?.name || feature.properties?.PROVINSI || '';
            }
            const geoName = normProv(rawName);
            const nilai = dataLookup[geoName] ?? dataLookup[rawName.toLowerCase().trim()];

            // Perbarui Style
            layer.setStyle({
                fillColor: nilai !== undefined
                    ? getChoroColor(nilai, dataMin, dataMax, minPct, maxPct, activeDataType)
                    : '#e5e7eb',
            });

            // Perbarui Popup
            const popupContent = generateGeoJsonPopup(feature, rawName, viewMode, activeDataType, dataLookup);
            if (layer.getPopup()) {
                layer.setPopupContent(popupContent);
            } else {
                layer.bindPopup(popupContent, { closeButton: true, autoPan: true });
            }
        });
    }, [choroplethData, viewMode]);


    // ── Efek 2: Hanya perbarui warna saat slider berubah (real-time) ─────────
    useEffect(() => {
        if (!geoJsonLayerRef.current) return;
        const { dataLookup, dataMin, dataMax } = choroplethMetaRef.current;
        geoJsonLayerRef.current.setStyle((feature) => {
            let rawName = '';
            if (viewMode === 'kabupaten') {
                rawName = feature.properties?.WADMKK || feature.properties?.NAMOBJ || '';
            } else {
                rawName = feature.properties?.state || feature.properties?.name || feature.properties?.PROVINSI || '';
            }
            const geoName = normProv(rawName);
            const nilai = dataLookup[geoName] ?? dataLookup[rawName.toLowerCase().trim()];
            return {
                fillColor: nilai !== undefined
                    ? getChoroColor(nilai, dataMin, dataMax, minPct, maxPct, activeDataType)
                    : '#e5e7eb',
                fillOpacity: 0.75,
                color: '#000000',
                weight: 0.8,
                opacity: 1,
            };
        });
    }, [minPct, maxPct]);

    // ── Efek 3: Kluster Marker (dengan cache & lazy loading) ──────────────────
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // 1. Sembunyikan gelembung
        if (!showBubbles) {
            if (clusterGroupRef.current) {
                mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            }
            return;
        }

        // 2. Tampilkan gelembung dari cache (jika mapData tidak berubah)
        // Gunakan ids dari item pertama sebagai bagian dari key agar lebih stabil
        const dataKey = mapData.length + '|' + (mapData[0]?.ids?.slice(0, 20) || '');
        if (clusterGroupRef.current && lastMapDataRef.current === dataKey) {
            if (!mapInstanceRef.current.hasLayer(clusterGroupRef.current)) {
                clusterGroupRef.current.addTo(mapInstanceRef.current);
                if (geoJsonLayerRef.current) geoJsonLayerRef.current.bringToBack();
            }
            return;
        }

        // 3. Bangun ulang penuh
        if (clusterGroupRef.current) {
            mapInstanceRef.current.removeLayer(clusterGroupRef.current);
        }
        clusterGroupRef.current = null;
        lastMapDataRef.current = dataKey;

        if (!mapData.length) return;

         const clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 80,
            zoomToBoundsOnClick: true,
            showCoverageOnHover: false, // Performa
            spiderfyOnMaxZoom: true,
            chunkedLoading: true,
            chunkSize: 500,
            chunkDelay: 5,
            iconCreateFunction: (cluster) => {
                const total = cluster.getAllChildMarkers().length;
                const size = 40;
                let bubbleColor = 'rgba(62, 125, 202, 0.7)'; // Biru default
                if (bubbleType === 'Hilirisasi') {
                    bubbleColor = 'rgba(250, 204, 21, 0.7)'; // Kuning/Emas
                } else if (bubbleType === 'Pengabdian') {
                    bubbleColor = 'rgba(40, 167, 69, 0.7)'; // Hijau
                }
                return L.divIcon({
                    html: `<div style="
                        background-color: ${bubbleColor};
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        border: 3px solid white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.2);
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">${total.toLocaleString('id-ID')}</div>`,
                    className: 'custom-cluster-marker',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                });
            },
        });


        const sharedIcon = L.divIcon({
            html: `<div style="
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: transparent;
                border: 2.5px solid black;
                box-shadow: 0 0 5px rgba(0,0,0,0.2);
                cursor: pointer;
            "></div>`,
            className: 'custom-bubble-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        const markers = [];
        let markerIndex = 0;
        let isActive = true;
        let timeoutIds = [];

        // Tambahkan clusterGroup ke peta segera agar gelembung dapat muncul progresif
        clusterGroup.addTo(mapInstanceRef.current);
        clusterGroupRef.current = clusterGroup;
        if (geoJsonLayerRef.current) geoJsonLayerRef.current.bringToBack();

        const processChunks = () => {
            if (!isActive || !mapInstanceRef.current) return;

            const CHUNK_SIZE = 25; // Proses 25 universitas per tick agar browser tetap responsif
            const endIndex = Math.min(markerIndex + CHUNK_SIZE, mapData.length);
            const chunkMarkers = [];

            for (let i = markerIndex; i < endIndex; i++) {
                const item = mapData[i];
                const lat = parseFloat(item.pt_latitude);
                const lng = parseFloat(item.pt_longitude);

                if (isNaN(lat) || isNaN(lng)) continue;

                const ids = item.ids ? item.ids.split('|') : [];
                ids.forEach((id, idx) => {
                    let coords;
                    if (idx === 0) {
                        coords = [lat, lng];
                    } else {
                        // Offset koordinat sedikit agar penanda bertumpuk tidak tumpang tindih
                        const radiusKm = 0.3;
                        const radiusDegrees = radiusKm / 111.3;
                        const angle = (idx * (2 * Math.PI / ids.length));
                        coords = [
                            lat + radiusDegrees * Math.cos(angle),
                            lng + radiusDegrees * Math.sin(angle)
                        ];
                    }

                    const marker = L.marker(coords, { icon: sharedIcon });

                    // Handler klik yang dioptimalkan
                    marker.on('click', (e) => {
                        if (!isActive) return;
                        L.DomEvent.stop(e); // Hentikan event agar tidak menyebar ke peta

                        const map = mapInstanceRef.current;
                        if (map) map.setView(coords, 16, { animate: true });

                        if (onItemClick) {
                            onItemClick({
                                id: id,
                                bubbleType: bubbleType
                            });
                        }
                    });

                    chunkMarkers.push(marker);
                });
            }

            if (isActive && chunkMarkers.length > 0) {
                clusterGroup.addLayers(chunkMarkers);
            }

            markerIndex = endIndex;

            if (markerIndex < mapData.length) {
                timeoutIds.push(setTimeout(processChunks, 5));
            }
        };

        processChunks();

        return () => {
            isActive = false;
            timeoutIds.forEach(clearTimeout);
        };
    // activeDataType SENGAJA tidak dimasukkan sebagai dependency:
    // mapData sudah tidak difilter berdasarkan dataType di backend,
    // sehingga jumlah bubble (65.991) tetap sama di semua kategori permasalahan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapData, showBubbles]);

    return (
        <section className="relative bg-white flex justify-center mb-2">
            {geoJsonLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 pointer-events-none">
                    <span className="text-sm text-gray-500 animate-pulse">Memuat peta provinsi...</span>
                </div>
            )}



            <div
                ref={mapRef}
                className="lg:w-[90%] w-full h-[65vh] relative z-0 rounded-lg shadow-inner overflow-hidden"
            />
        </section>
    );
}
