import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import axios from 'axios';

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
        .trim();
}

// ─── Component ────────────────────────────────────────────────────────────────
const PermasalahanMap = React.memo(({
    permasalahanStats = {},
    permasalahanKabupatenStats = {},
    activeDataType = 'Sampah',
    bubbleType = 'Penelitian',
    mapData = [],
    stats = {},
    showBubbles = true,
    viewMode = 'provinsi',
    minPct = 0,
    maxPct = 100,
    onLegendUpdate,
    selectedMetrik = 'saidi',
    onItemClick,
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const geoJsonLayerRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [geoJsonLoading, setGeoJsonLoading] = useState(true);
    
    // Lazy loading state
    const [loadedMarkers, setLoadedMarkers] = useState([]);
    const [hasMoreMarkers, setHasMoreMarkers] = useState(false);
    const [totalMarkers, setTotalMarkers] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const markerOffsetRef = useRef(5000); // Start offset for lazy loading (controller sends 5k initially)

    const safe = (val) => (val === null || val === undefined || val === '') ? '-' : val;
    
    const choroplethMetaRef = useRef({ dataLookup: {}, dataMin: 0, dataMax: 1, satuan: '' });
    const lastMapDataRef = useRef(null);
    const lastActiveDataTypeRef = useRef(null);
    const lastBubbleTypeRef = useRef(null);

    // Initial markers come from props
    useEffect(() => {
        setLoadedMarkers(mapData);
        setTotalMarkers(mapData.length); // Fallback if lazyLoad api not called yet
        markerOffsetRef.current = 5000;
        setHasMoreMarkers(mapData.length >= 5000); 
    }, [mapData]);

    // Fetch GeoJSON when viewMode changes
    useEffect(() => {
        setGeoJsonLoading(true);
        const url = viewMode === 'kabupaten'
            ? '/assets/kabupaten-new.json'
            : '/assets/provinsi-new.json';

        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                setGeoJsonData(data);
                setGeoJsonLoading(false);
            })
            .catch((e) => {
                console.error('PermasalahanMap – GeoJSON error:', e);
                setGeoJsonLoading(false);
            });
    }, [viewMode]);

    // Initialise Map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [-2.5, 118],
            zoom: 5,
            minZoom: 4,
            maxZoom: 18,
            zoomControl: true,
            preferCanvas: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // ── Pre-calculate Lookup Data ─────────────────────────────────────────────
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
                dataLookup[name] = s.nilai;
                if (name === 'dki jakarta') dataLookup['jakarta'] = s.nilai;
                if (name === 'di yogyakarta') dataLookup['yogyakarta'] = s.nilai;
                // Add normalised versions for robust lookup
                dataLookup[normProv(name)] = s.nilai;
            }
        });

        return { dataLookup, dataMin, dataMax, satuan, activeDataType: finalActiveDataType };
    }, [permasalahanStats, permasalahanKabupatenStats, activeDataType, viewMode, selectedMetrik]);

    // Update parent
    useEffect(() => {
        if (onLegendUpdate) {
            onLegendUpdate({
                min: choroplethData.dataMin,
                max: choroplethData.dataMax,
                satuan: choroplethData.satuan,
                activeDataType: choroplethData.activeDataType
            });
        }
    }, [choroplethData]);

    useEffect(() => {
        choroplethMetaRef.current = choroplethData;
    }, [choroplethData]);

    const generateGeoJsonPopup = (feature, rawName, viewMode, activeDataType, dataLookup) => {
        const geoName = normProv(rawName);
        const nilai = dataLookup[geoName] ?? dataLookup[rawName.toLowerCase().trim()];
        const satuan = choroplethData.satuan || '';

        const formattedNilai = nilai !== undefined ? Number(nilai).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '-';
        const labelName = activeDataType === 'Sampah' ? 'Timbulan Sampah' : (activeDataType || 'Nilai');

        return `
            <div style="font-family: Arial, sans-serif; font-size: 13px; min-width: 160px; line-height: 1.4;">
                <div style="color: #333; font-weight: bold; font-size: 14.5px; margin-bottom: 4px;">${rawName}</div>
                <div style="color: #333; font-size: 13.5px;">
                    <strong>${labelName}:</strong> ${formattedNilai} ${satuan}
                </div>
            </div>
        `;
    };

    // ── Effect 1: Choropleth Lifecycle ────────────────────────────────────────
    useEffect(() => {
        if (!mapInstanceRef.current || !geoJsonData) return;

        if (geoJsonLayerRef.current) {
            mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
        }

        const { dataLookup, dataMin, dataMax, activeDataType } = choroplethData;

        const layer = L.geoJSON(geoJsonData, {
            style: (feature) => {
                const rawName = viewMode === 'kabupaten' 
                    ? (feature.properties?.WADMKK || feature.properties?.NAMOBJ || '')
                    : (feature.properties?.state || feature.properties?.name || feature.properties?.PROVINSI || '');
                const geoName = normProv(rawName);
                const nilai = dataLookup[geoName] ?? dataLookup[rawName.toLowerCase().trim()];
                
                return {
                    fillColor: nilai !== undefined
                        ? getChoroColor(nilai, dataMin, dataMax, minPct, maxPct, activeDataType)
                        : '#e5e7eb',
                    fillOpacity: 0.8,
                    color: '#444',
                    weight: 0.5,
                    opacity: 1,
                };
            },
            onEachFeature: (feature, layer) => {
                layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.95, weight: 1.5 }));
                layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.8, weight: 0.5 }));

                const rawName = viewMode === 'kabupaten' 
                    ? (feature.properties?.WADMKK || feature.properties?.NAMOBJ || '')
                    : (feature.properties?.state || feature.properties?.name || feature.properties?.PROVINSI || '');
                layer.bindPopup(generateGeoJsonPopup(feature, rawName, viewMode, activeDataType, dataLookup));
            }
        }).addTo(mapInstanceRef.current);

        geoJsonLayerRef.current = layer;
        layer.bringToBack();
    }, [geoJsonData, viewMode, choroplethData]);

    // ── Effect 2: Manage Markers ──────────────────────────────────────────────
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        if (!showBubbles) {
            if (clusterGroupRef.current) mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            return;
        }

        const dataKey = loadedMarkers.length + activeDataType + bubbleType;
        if (clusterGroupRef.current && lastMapDataRef.current === dataKey) {
            if (!mapInstanceRef.current.hasLayer(clusterGroupRef.current)) clusterGroupRef.current.addTo(mapInstanceRef.current);
            return;
        }

        if (clusterGroupRef.current) mapInstanceRef.current.removeLayer(clusterGroupRef.current);
        
        const clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            chunkedLoading: true,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                let bubbleColor = '#3b82f6'; // blue-500
                if (bubbleType === 'Hilirisasi') bubbleColor = '#eab308'; // yellow-500
                else if (bubbleType === 'Pengabdian') bubbleColor = '#22c55e'; // green-500

                return L.divIcon({
                    html: `<div style="background-color: ${bubbleColor}; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 2px solid white;">${count}</div>`,
                    className: 'custom-cluster-icon',
                    iconSize: [40, 40]
                });
            }
        });

        loadedMarkers.forEach(item => {
            if (item.pt_latitude && item.pt_longitude) {
                const marker = L.marker([item.pt_latitude, item.pt_longitude]);
                const popupHtml = `
                    <div style="font-family: sans-serif; width: 220px;">
                        <div style="font-weight: bold; color: #1e40af; margin-bottom: 5px;">${safe(item.judul)}</div>
                        <div style="font-size: 12px; margin-bottom: 3px;"><strong>Ketua:</strong> ${safe(item.nama)}</div>
                        <div style="font-size: 12px; margin-bottom: 3px;"><strong>PT:</strong> ${safe(item.institusi)}</div>
                        <div style="font-size: 11px; color: #666;">${safe(item.bidang_fokus || item.skema)} | ${safe(item.tahun)}</div>
                    </div>
                `;
                marker.bindPopup(popupHtml);
                marker.on('click', () => onItemClick && onItemClick(item));
                clusterGroup.addLayer(marker);
            }
        });

        clusterGroup.addTo(mapInstanceRef.current);
        clusterGroupRef.current = clusterGroup;
        lastMapDataRef.current = dataKey;

        // Lazy load remaining markers if more exist
        if (hasMoreMarkers && !isLoadingMore) {
            loadNextBatch();
        }

    }, [loadedMarkers, showBubbles, activeDataType, bubbleType]);

    const loadNextBatch = async () => {
        setIsLoadingMore(true);
        try {
            const res = await axios.get('/api/permasalahan/markers', {
                params: {
                    bubbleType,
                    dataType: activeDataType,
                    offset: markerOffsetRef.current,
                    limit: 5000,
                    // Pass current filters from URL if possible, or just standard ones
                    ...Object.fromEntries(new URLSearchParams(window.location.search))
                }
            });

            if (res.data.markers && res.data.markers.length > 0) {
                setLoadedMarkers(prev => [...prev, ...res.data.markers]);
                markerOffsetRef.current += res.data.markers.length;
                setHasMoreMarkers(res.data.hasMore);
                setTotalMarkers(res.data.total);
            } else {
                setHasMoreMarkers(false);
            }
        } catch (e) {
            console.error('Lazy load error:', e);
            setHasMoreMarkers(false);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <div className="relative w-full h-[500px] lg:h-[650px] rounded-b-xl overflow-hidden shadow-inner bg-gray-100">
            {geoJsonLoading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-blue-600 font-medium">Memuat Geodata...</p>
                    </div>
                </div>
            )}
            <div ref={mapRef} className="w-full h-full z-0" />
            
            {/* Loading Indicator for Markers */}
            {isLoadingMore && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 text-xs font-medium text-blue-700 border border-blue-100">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Memuat marker lainnya ({loadedMarkers.length} / {totalMarkers === 0 ? '...' : totalMarkers})
                </div>
            )}
        </div>
    );
});

PermasalahanMap.displayName = 'PermasalahanMap';

export default PermasalahanMap;
