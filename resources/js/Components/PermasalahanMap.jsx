import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

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
function getChoroColor(value, dataMin, dataMax, minPct, maxPct) {
    if (value === null || value === undefined) return '#e5e7eb';
    const lo = dataMin + (dataMax - dataMin) * (minPct / 100);
    const hi = dataMin + (dataMax - dataMin) * (maxPct / 100);
    const clamped = Math.max(lo, Math.min(hi, value));
    const t = hi === lo ? 0 : (clamped - lo) / (hi - lo);
    if (t < 0.5) return interpolateColor('#4ade80', '#facc15', t * 2);
    return interpolateColor('#facc15', '#f87171', (t - 0.5) * 2);
}

// ─── Province name normalisation ──────────────────────────────────────────────
function normProv(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^(prov\.\s*|provinsi\s*|daerah istimewa\s*|d\.i\.\s*|dki\s*)/g, '')
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function PermasalahanMap({
    /** Permasalahan stats: { 'Sampah': [{provinsi, nilai, satuan, tahun}], ... } */
    permasalahanStats = {},
    /** Currently selected jenis permasalahan, e.g. 'Sampah' */
    activeDataType = 'Sampah',
    /** Bubble markers (existing mapData from controller) */
    mapData = [],
    /** Statistics data */
    stats = {},
    /** Show / hide bubble layer */
    showBubbles = true,
    /** 'provinsi' | 'kabupaten' */
    viewMode = 'provinsi',
    /** Percentile trimming from legend sliders (0-100) */
    minPct = 0,
    maxPct = 100,
    /** Callback to inform parent about computed min/max/satuan so the legend can display them */
    onLegendDataChange,
    /** Selected metric for Krisis Listrik (saidi or saifi) */
    selectedMetrik = 'saidi',
    /** Callback when metric changes */
    onMetrikChange,
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const geoJsonLayerRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [geoJsonLoading, setGeoJsonLoading] = useState(true);
    const [modalData, setModalData] = useState(null);
    // Store computed colour-scale params so the slider effect can access them without re-running the heavy effect
    const choroplethMetaRef = useRef({ provMap: {}, dataMin: 0, dataMax: 1, satuan: '' });

    // Fetch GeoJSON once on mount using local file
    useEffect(() => {
        fetch('/assets/indonesia-provinces.geojson')
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
    }, []);

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

    // ── Effect 1: Rebuild choropleth layer when DATA changes ─────────────────
    useEffect(() => {
        if (!mapInstanceRef.current || !geoJsonData) return;

        // Remove old GeoJSON layer
        if (geoJsonLayerRef.current) {
            mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
            geoJsonLayerRef.current = null;
        }

        // Clear modal when data type changes
        setModalData(null);

        // Build province→nilai lookup for the selected jenis
        let rows = permasalahanStats[activeDataType] || [];

        // For Krisis Listrik, filter by selected metrik
        if (activeDataType === 'Krisis Listrik') {
            rows = rows.filter((row) => !row.metrik || row.metrik === selectedMetrik);
        }

        const provMap = {};
        rows.forEach((row) => {
            const geoName = resolveGeoJsonName(row.provinsi);
            if (geoName) provMap[geoName] = row.nilai;
        });

        const values = Object.values(provMap).filter((v) => v !== null && v !== undefined);
        const dataMin = values.length ? Math.min(...values) : 0;
        const dataMax = values.length ? Math.max(...values) : 1;
        const satuan = rows[0]?.satuan || '';

        // Store so the slider effect can call setStyle without re-running this
        choroplethMetaRef.current = { provMap, dataMin, dataMax, satuan };

        // Inform parent legend
        if (onLegendDataChange) {
            onLegendDataChange({ min: dataMin, max: dataMax, satuan, activeDataType });
        }

        const layer = L.geoJSON(geoJsonData, {
            style: (feature) => {
                const geoName = feature.properties?.state || feature.properties?.name || '';
                const nilai = provMap[geoName];
                return {
                    fillColor: nilai !== undefined
                        ? getChoroColor(nilai, dataMin, dataMax, minPct, maxPct)
                        : '#e5e7eb',
                    fillOpacity: 0.75,
                    color: '#ffffff',
                    weight: 1.5,
                    opacity: 1,
                };
            },
            onEachFeature: (feature, layer) => {
                const geoName = feature.properties?.state || feature.properties?.name || '';
                const nilai = provMap[geoName];
                const formattedNilai = nilai !== undefined
                    ? Number(nilai).toLocaleString('id-ID') + ' ' + satuan
                    : 'Tidak ada data';

                layer.on('click', () => {
                    setModalData({ geoName, formattedNilai, activeDataType, nilai, satuan });
                });
                layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.95, weight: 2.5 }));
                layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.75, weight: 1.5 }));
            },
        });

        layer.addTo(mapInstanceRef.current);
        geoJsonLayerRef.current = layer;
        layer.bringToBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geoJsonData, activeDataType, permasalahanStats, selectedMetrik]);

    // ── Effect 2: Only update colours when slider changes (real-time) ────────
    useEffect(() => {
        if (!geoJsonLayerRef.current) return;
        const { provMap, dataMin, dataMax } = choroplethMetaRef.current;
        geoJsonLayerRef.current.setStyle((feature) => {
            const geoName = feature.properties?.state || feature.properties?.name || '';
            const nilai = provMap[geoName];
            return {
                fillColor: nilai !== undefined
                    ? getChoroColor(nilai, dataMin, dataMax, minPct, maxPct)
                    : '#e5e7eb',
                fillOpacity: 0.75,
                color: '#ffffff',
                weight: 1.5,
                opacity: 1,
            };
        });
    }, [minPct, maxPct]);

    // Redraw bubble marker cluster
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        if (clusterGroupRef.current) {
            mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            clusterGroupRef.current = null;
        }

        if (!showBubbles || !mapData.length) {
            console.log(`[Bubble] Skipping: showBubbles=${showBubbles}, mapData.length=${mapData.length}`);
            return;
        }

        console.log(`[Bubble] mapData sample:`, mapData.slice(0, 2));

        // Don't filter - show all available bubble data (no kota field check)
        const filteredData = mapData;

        console.log(`[Bubble] viewMode=${viewMode}, total mapData=${mapData.length}, filtered=${filteredData.length}`);

        // Create clustering layer with optimized settings for 50k+ markers
        const clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 80,
            zoomToBoundsOnClick: true,
            showCoverageOnHover: true,
            spiderfyOnMaxZoom: true,
            spiderfyDistanceMultiplier: 1.5,
            disableClusteringAtZoom: null,
            chunkedLoading: true,
            chunkSize: 500,
            chunkDelay: 10,
            chunkInterval: 200,
            iconCreateFunction: (cluster) => {
                const childMarkers = cluster.getAllChildMarkers();
                const total = childMarkers.length;
                const size = 50;
                return L.divIcon({
                    html: `<div style="background:rgba(62,125,202,0.7);width:${size}px;height:${size}px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.25);">${total.toLocaleString('id-ID')}</div>`,
                    className: '',
                    iconSize: L.point(size, size, true),
                    iconAnchor: L.point(size / 2, size / 2),
                });
            },
        });

        const markers = [];
        const CHUNK_SIZE = 2000;
        let markerIndex = 0;
        let isActive = true; // Track if effect is still active
        let timeoutIds = []; // Store timeout IDs for cleanup

        // Function to process markers in chunks
        const processMarkersInChunks = () => {
            if (!isActive) return; // Stop if effect was cleaned up

            const endIndex = Math.min(markerIndex + CHUNK_SIZE, filteredData.length);
            
            for (let i = markerIndex; i < endIndex; i++) {
                const item = filteredData[i];
                const lat = parseFloat(item.pt_latitude ?? item.latitude);
                const lng = parseFloat(item.pt_longitude ?? item.longitude);
                if (isNaN(lat) || isNaN(lng)) continue;

                const size = 28;
                const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: `<div style="background:transparent;width:${size}px;height:${size}px;border-radius:50%;border:2px solid rgba(62,125,202,0.85);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer;"></div>`,
                        className: '',
                        iconSize: L.point(size, size, true),
                        iconAnchor: L.point(size / 2, size / 2),
                    }),
                });

                marker.itemData = item;
                marker.markerLat = lat;
                marker.markerLng = lng;

                marker.on('click', function(e) {
                    if (!isActive) return; // Don't process clicks if effect cleaned up

                    const clickedLat = this.markerLat;
                    const clickedLng = this.markerLng;
                    const clickedItem = this.itemData;
                    
                    console.log('[Marker Click]', { clickedLat, clickedLng, item: clickedItem.judul });
                    
                    L.DomEvent.stopPropagation(e);
                    
                    const map = mapInstanceRef.current;
                    if (map) {
                        console.log('[Map setView]', clickedLat, clickedLng, 16);
                        map.setView([clickedLat, clickedLng], 16, { animate: true, duration: 1.2 });
                    }

                    setTimeout(() => {
                        if (!isActive) return;
                        console.log('[Show Modal]');
                        setModalData({
                            judul: clickedItem.judul || 'Penelitian',
                            nama: clickedItem.nama || '-',
                            institusi: clickedItem.institusi || '-',
                            nidn: clickedItem.nidn || '-',
                            nuptk: clickedItem.nuptk || '-',
                            provinsi: clickedItem.provinsi || '-',
                            skema: clickedItem.skema || '-',
                            klaster: clickedItem.klaster || '-',
                            kategori_pt: clickedItem.kategori_pt || '-',
                            tahun: clickedItem.tahun || '-',
                            bidang_fokus: clickedItem.bidang_fokus || '-',
                            tema_prioritas: clickedItem.tema_prioritas || '-',
                            fullData: clickedItem
                        });
                    }, 1200);
                });

                markers.push(marker);
            }

            markerIndex = endIndex;

            if (markerIndex < filteredData.length) {
                const timeoutId = setTimeout(processMarkersInChunks, 0);
                timeoutIds.push(timeoutId);
            } else {
                // All chunks processed, add to cluster
                if (isActive && mapInstanceRef.current && clusterGroupRef.current === null) {
                    clusterGroup.addLayers(markers);
                    clusterGroup.addTo(mapInstanceRef.current);
                    clusterGroupRef.current = clusterGroup;

                    if (geoJsonLayerRef.current) geoJsonLayerRef.current.bringToBack();
                }
            }
        };

        processMarkersInChunks();

        // Cleanup function
        return () => {
            isActive = false;
            timeoutIds.forEach(id => clearTimeout(id)); // Clear all pending timeouts
            timeoutIds = [];
        };
    }, [mapData, showBubbles]);

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
                    className="absolute inset-0 flex items-center justify-center z-[1000]"
                    style={{ top: 0, left: 0, right: 0, bottom: 0, cursor: 'default' }}
                    onClick={() => setModalData(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl border border-gray-200"
                        style={{ minWidth: 280, maxWidth: 420, padding: '20px 24px', position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setModalData(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                            aria-label="Tutup"
                        >
                            ✕
                        </button>

                        {/* Title */}
                        <div style={{ fontWeight: 700, fontSize: 17, color: '#1f2937', marginBottom: 12, paddingRight: 20 }}>
                            Detail Penelitian
                        </div>

                        {/* Research Title */}
                        {modalData.judul && (
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 16, lineHeight: 1.5, paddingRight: 20 }}>
                                {modalData.judul}
                            </div>
                        )}

                        {/* Content */}
                        {modalData.fullData ? (
                            // Penelitian detail - 2 column layout
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: 13, color: '#374151' }}>
                                {/* Left Column */}
                                <div>
                                    {modalData.nama && modalData.nama !== '-' && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Peneliti:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.nama}</div>
                                        </div>
                                    )}
                                    {modalData.nidn && modalData.nidn !== '-' && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>NIDN:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.nidn}</div>
                                        </div>
                                    )}
                                    {modalData.kategori_pt && modalData.kategori_pt !== '-' && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Kategori PT:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.kategori_pt}</div>
                                        </div>
                                    )}
                                    {modalData.skema && modalData.skema !== '-' && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Skema:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.skema}</div>
                                        </div>
                                    )}
                                    {modalData.bidang_fokus && modalData.bidang_fokus !== '-' && (
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Bidang Fokus:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.bidang_fokus}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div>
                                    {modalData.institusi && modalData.institusi !== '-' && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Institusi:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.institusi}</div>
                                        </div>
                                    )}
                                    {modalData.tahun && modalData.tahun !== '-' && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Tahun:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.tahun}</div>
                                        </div>
                                    )}
                                    {modalData.klaster && modalData.klaster !== '-' && (
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Klaster:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.klaster}</div>
                                        </div>
                                    )}
                                    {modalData.tema_prioritas && modalData.tema_prioritas !== '-' && (
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Tema Prioritas:</div>
                                            <div style={{ fontWeight: 500 }}>{modalData.tema_prioritas}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Province choropleth detail
                            <div style={{ fontSize: 14, color: '#374151' }}>
                                <span style={{ fontWeight: 600 }}>{modalData.activeDataType}:</span>{' '}
                                <span>
                                    {modalData.nilai !== undefined
                                        ? Number(modalData.nilai).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' ' + modalData.satuan
                                        : 'Tidak ada data'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div
                ref={mapRef}
                className="lg:w-[90%] w-full h-[65vh] border relative z-0 rounded-lg shadow-inner overflow-hidden"
            />
        </section>
    );
}
