import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { getFieldColor } from '../utils/fieldColors';

// ─── Color helpers ────────────────────────────────────────────────────────────
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
 * Green → Yellow → Red gradient, identical to the PermasalahanLegend gradient bar.
 * minPct / maxPct (0-100) allow the legend sliders to trim the scale.
 */
function getChoroColor(value, dataMin, dataMax, minPct, maxPct, activeDataType = 'Sampah') {
    if (value === null || value === undefined || isNaN(value)) return '#cccccc';

    const lo = dataMin + (dataMax - dataMin) * (minPct / 100);
    const hi = dataMin + (dataMax - dataMin) * (maxPct / 100);

    // Any value strictly outside the selected slider range is shown in grey
    if (value < lo || value > hi) {
        return '#d1d5db'; // GRAY_300
    }

    const typeLower = activeDataType.toLowerCase();

    // 1. Special logic for SAMPAH (Trash) - Remains as discrete color steps for better UI visibility
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

    // 2. Default logic (Stunting, Gizi Buruk, Krisis Listrik, Ketahanan Pangan)
    // normalized: 0 is "Good/Green", 1 is "Bad/Red"
    let normalized = hi === lo ? 0 : Math.max(0, Math.min(1, (value - lo) / (hi - lo)));

    // For Ketahanan Pangan, Higher value is Better (Secure), so we reverse the index
    // so that higher values result in Green (normalized near 0).
    if (typeLower === 'ketahanan pangan') {
        normalized = 1 - normalized;
    }

    // Use Legacy RGB logic from the old project for consistent aesthetics
    const red = Math.round(normalized * 255);
    const green = Math.round((1 - normalized) * 255);
    const blue = 50;

    return `rgb(${red}, ${green}, ${blue})`;
}

// ─── Province name normalisation ──────────────────────────────────────────────
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

// Explicit aliases: DB form → GeoJSON `state` value
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
    /** Permasalahan stats: { 'Sampah': [{provinsi, nilai, satuan, tahun}], ... } */
    permasalahanStats = {},
    /** Permasalahan stats for kabupaten/kota */
    permasalahanKabupatenStats = {},
    /** Currently selected jenis permasalahan, e.g. 'Sampah' */
    activeDataType = 'Sampah',
    /** Type of bubble markers, e.g., 'Penelitian', 'Inovasi' */
    bubbleType = 'Penelitian',
    /** Bubble markers (existing mapData from controller) */
    mapData = [],
    /** Statistics data */
    stats = {},
    /** Show / hide bubble layer */
    showBubbles = true,
    /** 'provinsi' | 'kabupaten' */
    viewMode = 'provinsi',
    /** Percentile trimming from legend s
     * sliders (0-100) */
    minPct = 0,
    maxPct = 100,
    /** Callback to inform parent about computed min/max/satuan so the legend can display them */
    onLegendUpdate,
    /** Selected metric for Krisis Listrik (saidi or saifi) */
    selectedMetrik = 'saidi',
    /** Callback when metric changes */
    onMetrikChange,
    onItemClick,
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const geoJsonLayerRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [geoJsonLoading, setGeoJsonLoading] = useState(true);
    const [modalData, setModalData] = useState(null);

    const safe = (val) => (val === null || val === undefined || val === '') ? '-' : val;
    // Store computed colour-scale params so the slider effect can access them without re-running the heavy effect
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
                // Take the largest polygon or just the first one
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
            console.error('Centroid calculation error:', e);
        }
        return null;
    }

    // Fetch GeoJSON when viewMode changes
    useEffect(() => {
        setGeoJsonLoading(true);
        const url = viewMode === 'kabupaten'
            ? '/assets/kabupaten-new.json'
            : '/assets/provinsi-new.json';

        fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error('GeoJSON fetch failed: ' + r.status);
                return r.json();
            })
            .then((data) => {
                setGeoJsonData(data);
                setGeoJsonLoading(false);
            })
            .catch((e) => {
                console.error('PermasalahanMap – GeoJSON error:', e);
                setGeoJsonLoading(false);
            });
    }, [viewMode]);

    // Initialise the Leaflet map once
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

        // Use OpenStreetMap tiles (consistent with other tabs)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            keepBuffer: 6,
            updateWhenIdle: false,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                // Simply remove the map - Leaflet handles all cleanup
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // ── Pre-calculate lookup data (useMemo for efficiency/immediate availability) ────
    const choroplethData = React.useMemo(() => {
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
                dataLookup[name] = s.nilai;
                if (name === 'dki jakarta') dataLookup['jakarta'] = s.nilai;
                if (name === 'di yogyakarta') dataLookup['yogyakarta'] = s.nilai;
            }
        });

        return { dataLookup, dataMin, dataMax, satuan, activeDataType: finalActiveDataType };
    }, [permasalahanStats, permasalahanKabupatenStats, activeDataType, viewMode, selectedMetrik]);

    // Update legend parent whenever choroplethData changes
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

    // Sync choroplethMetaRef for the slider effect
    useEffect(() => {
        choroplethMetaRef.current = choroplethData;
    }, [choroplethData]);

    // Helper to generate popup HTML reliably
    const generateGeoJsonPopup = (feature, rawName, viewMode, activeDataType, dataLookup) => {
        const geoName = normProv(rawName);
        const nilai = dataLookup[geoName] ?? dataLookup[rawName.toLowerCase().trim()];
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

    // ── Effect 1: Manage GeoJSON Layer Lifecycle ─────────────────────────────
    useEffect(() => {
        if (!mapInstanceRef.current || !geoJsonData) return;

        // Rebuild only when geometry changes (viewMode or geoJsonData)
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
                const nilai = dataLookup[geoName] ?? dataLookup[rawName.toLowerCase().trim()];
                
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
                layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.95, weight: 1.5 }));
                layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.75, weight: 0.8 }));

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

    // ── Effect 1.5: Update Layer Properties when Stats change ──────────────
    useEffect(() => {
        if (!mapInstanceRef.current || !geoJsonLayerRef.current) return;
        setModalData(null);
        
        const { dataLookup, dataMin, dataMax, satuan, activeDataType } = choroplethData;

        // Update styles & popups on existing layer
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

            // Update Style
            layer.setStyle({
                fillColor: nilai !== undefined
                    ? getChoroColor(nilai, dataMin, dataMax, minPct, maxPct, activeDataType)
                    : '#e5e7eb',
            });

            // Update Popup
            const popupContent = generateGeoJsonPopup(feature, rawName, viewMode, activeDataType, dataLookup);
            if (layer.getPopup()) {
                layer.setPopupContent(popupContent);
            } else {
                layer.bindPopup(popupContent, { closeButton: true, autoPan: true });
            }
        });
    }, [choroplethData, viewMode]);


    // ── Effect 2: Only update colours when slider changes (real-time) ────────
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

    // ── Effect 3: Marker Cluster (with cache & lazy loading) ─────────────────
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // 1. Hide bubbles
        if (!showBubbles) {
            if (clusterGroupRef.current) {
                mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            }
            return;
        }

        // 2. Show cached bubbles (if data hasn't changed)
        const dataKey = mapData.length + (mapData[0]?.id || mapData[0]?._id || '');
        if (clusterGroupRef.current && lastMapDataRef.current === dataKey && lastActiveDataTypeRef.current === activeDataType) {
            if (!mapInstanceRef.current.hasLayer(clusterGroupRef.current)) {
                clusterGroupRef.current.addTo(mapInstanceRef.current);
                if (geoJsonLayerRef.current) geoJsonLayerRef.current.bringToBack();
            }
            return;
        }

        // 3. Full rebuild
        if (clusterGroupRef.current) {
            mapInstanceRef.current.removeLayer(clusterGroupRef.current);
        }
        clusterGroupRef.current = null;
        lastMapDataRef.current = dataKey;
        lastActiveDataTypeRef.current = activeDataType;

        if (!mapData.length) return;

        const clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 80,
            zoomToBoundsOnClick: true,
            showCoverageOnHover: false, // Performance
            spiderfyOnMaxZoom: true,
            chunkedLoading: true,
            chunkSize: 500,
            chunkDelay: 10,
            iconCreateFunction: (cluster) => {
                const total = cluster.getAllChildMarkers().length;
                const size = 46;
                let bubbleColor = 'rgba(62, 125, 202, 0.7)'; // Default Blue
                if (bubbleType === 'Hilirisasi') {
                    bubbleColor = 'rgba(250, 204, 21, 0.7)'; // Yellow/Gold
                } else if (bubbleType === 'Pengabdian') {
                    bubbleColor = 'rgba(40, 167, 69, 0.7)'; // Green
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

        const processChunks = () => {
            if (!isActive || !mapInstanceRef.current) return;

            const safe = (v) => {
                if (v === null || v === undefined || v === '' || v === '-') return 'Tidak tersedia';
                if (typeof v === 'string' && v.startsWith('["') && v.endsWith('"]')) {
                    try {
                        const parsed = JSON.parse(v);
                        if (Array.isArray(parsed)) return parsed.join(', ');
                    } catch (e) {
                        return v.replace(/[\[\]"]/g, '');
                    }
                }
                return v;
            };

            const CHUNK_SIZE = 1500;
            const endIndex = Math.min(markerIndex + CHUNK_SIZE, mapData.length);

            for (let i = markerIndex; i < endIndex; i++) {
                const item = mapData[i];
                let lat = parseFloat(item.pt_latitude ?? item.latitude);
                let lng = parseFloat(item.pt_longitude ?? item.longitude);

                // For kabupaten mode, fallback to regency centroid if PT coords are missing
                if (viewMode === 'kabupaten' && (isNaN(lat) || isNaN(lng))) {
                    const kabName = item.kabupaten_kota || item.kab_mitra || item.lokus;
                    if (kabName) {
                        const norm = normProv(kabName);
                        const center = regencyCentroidsRef.current[norm];
                        if (center) {
                            lat = center[0];
                            lng = center[1];
                        }
                    }
                }

                if (isNaN(lat) || isNaN(lng)) continue;

                const marker = L.marker([lat, lng], { icon: sharedIcon });

                // Optimized click handler with small delay to prevent immediate closing
                marker.on('click', (e) => {
                    if (!isActive) return;
                    L.DomEvent.stopPropagation(e);

                    const map = mapInstanceRef.current;
                    if (map) map.setView([lat, lng], 16, { animate: true });

                    // Use a small timeout to ensure the modal doesn't immediately close 
                    // if the click propagates or triggers the map background
                    setTimeout(() => {
                        if (!isActive) return;
                        const d = item;

                        if (onItemClick) {
                            onItemClick({
                                ...d,
                                bubbleType: bubbleType
                            });
                        } else {
                            setModalData({
                                judul: safe(d.judul || d.judul_kegiatan),
                                nama: safe(d.nama || d.nama_ketua),
                                nidn: safe(d.nidn),
                                nuptk: safe(d.nuptk),
                                institusi: safe(d.institusi || d.perguruan_tinggi),
                                kategori_pt: safe(d.ptn_pts || d.jenis_pt || d.kategori_pt),
                                tahun: safe(d.tahun || d.thn_pelaksanaan),
                                skema: safe(d.skema || d.nama_skema),
                                klaster: safe(d.klaster),
                                bidang_fokus: safe(d.bidang_fokus || d.bidang),
                                tema_prioritas: safe(d.tema_prioritas),
                                mitra: safe(d.mitra || (d.kab_mitra ? `${d.kab_mitra}, ${d.prov_mitra}` : d.prov_mitra)),
                                luaran: safe(d.luaran),
                                bubbleType: bubbleType,
                                fullData: d
                            });
                        }
                    }, 300);
                });

                markers.push(marker);
            }

            markerIndex = endIndex;

            if (markerIndex < mapData.length) {
                timeoutIds.push(setTimeout(processChunks, 5));
            } else {
                if (isActive) {
                    clusterGroup.addLayers(markers);
                    clusterGroup.addTo(mapInstanceRef.current);
                    clusterGroupRef.current = clusterGroup;
                    if (geoJsonLayerRef.current) geoJsonLayerRef.current.bringToBack();
                }
            }
        };

        processChunks();

        return () => {
            isActive = false;
            timeoutIds.forEach(clearTimeout);
        };
    }, [mapData, showBubbles, activeDataType]);

    return (
        <section className="relative bg-white flex justify-center mb-2">
            {geoJsonLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 pointer-events-none">
                    <span className="text-sm text-gray-500 animate-pulse">Memuat peta provinsi...</span>
                </div>
            )}

            {/* Province click modal */}
            {modalData && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-[99999] bg-black/40 backdrop-blur-sm"
                    style={{ cursor: 'default' }}
                    onClick={() => setModalData(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col"
                        style={{ minWidth: 320, maxWidth: 650, width: '90vw', padding: '30px', position: 'relative', overflow: 'hidden' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setModalData(null)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                            aria-label="Tutup"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {modalData.judul || modalData.nama ? (
                            <>
                                {/* Header: Judul */}
                                <div style={{ fontWeight: 700, fontSize: 24, color: '#1f2937', marginBottom: 12, lineHeight: 1.2 }}>
                                    {`Detail ${modalData.bubbleType || 'Penelitian'}`}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', marginBottom: 20, paddingRight: 20, lineHeight: 1.4, textTransform: 'uppercase' }}>
                                    {modalData.judul}
                                </div>

                                {modalData.bubbleType === 'Hilirisasi' ? (
                                    /* ─── Hilirisasi Layout ─────────────────────────────────── */
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: 13, color: '#374151' }}>
                                        {/* Row 1: Pengusul | Perguruan Tinggi */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pengusul:</div>
                                                <div style={{ fontWeight: 500 }}>{modalData.nama}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Perguruan Tinggi:</div>
                                                <div style={{ fontWeight: 500 }}>{modalData.institusi}</div>
                                            </div>
                                        </div>

                                        {/* Row 2: Tahun | Skema */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tahun:</div>
                                                <div style={{ fontWeight: 500 }}>{modalData.tahun}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skema:</div>
                                                <div style={{ fontWeight: 500 }}>{modalData.skema}</div>
                                            </div>
                                        </div>

                                        {/* Row 3: Mitra */}
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mitra:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.mitra}</div>
                                        </div>

                                        {/* Row 4: Luaran */}
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Luaran:</div>
                                            <div style={{
                                                maxHeight: '120px',
                                                overflowY: 'auto',
                                                paddingRight: '12px',
                                                fontSize: '13px',
                                                lineHeight: '1.6',
                                                textAlign: 'justify',
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: '#d1d5db transparent'
                                            }}>
                                                {modalData.luaran}
                                            </div>
                                        </div>
                                    </div>
                                ) : modalData.bubbleType === 'Pengabdian' ? (
                                    /* ─── Pengabdian Layout ────────────────── */
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 30px', fontSize: 13, color: '#374151' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pelaksana:</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{modalData.nama}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>NIDN:</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{modalData.nidn}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>NUPTK:</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{modalData.nuptk}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Institusi:</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{modalData.institusi}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tahun:</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{modalData.tahun}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skema:</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{modalData.skema}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bidang Fokus:</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{modalData.bidang_fokus}</div>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lokasi Mitra:</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{modalData.mitra}</div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Grid Style for Research Detail (Penelitian) */
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 30px', fontSize: 13, color: '#374151' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Peneliti:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.nama}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>NIDN:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.nidn}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>NUPTK:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.nuptk}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Institusi:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.institusi}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Kategori PT:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.kategori_pt}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tahun:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.tahun}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skema:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.skema}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Klaster:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.klaster}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bidang Fokus:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.bidang_fokus}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tema Prioritas:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.tema_prioritas}</div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Province choropleth detail
                            <div className="flex flex-col gap-4 text-[#374151] text-[15px] leading-relaxed">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-gray-500 text-[12px] uppercase tracking-wider">
                                        {modalData.activeDataType === 'Sampah' ? 'Timbulan Sampah' : (modalData.activeDataType || 'Nilai')}
                                    </span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {modalData.nilai !== undefined
                                            ? Number(modalData.nilai).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' ' + (modalData.satuan || '')
                                            : 'Tidak ada data'}
                                    </span>
                                </div>
                                {modalData.bubblesCount !== undefined && (
                                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-1">
                                        <span className="font-semibold text-gray-500 text-[12px] uppercase tracking-wider">
                                            Jumlah {modalData.bubbleLabel || 'Penelitian'}
                                        </span>
                                        <span className="text-xl font-bold text-gray-800">
                                            {modalData.bubblesCount.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div
                ref={mapRef}
                className="lg:w-[90%] w-full h-[65vh] border border-black relative z-0 rounded-lg shadow-inner overflow-hidden"
            />
        </section>
    );
}
