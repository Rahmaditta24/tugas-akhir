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
    /** Bubble markers (research projects/institutions) */
    mapData = [],
    /** Full research list for modal detail */
    researches = [],
    /** Show / hide bubble layer */
    showBubbles = true,
    /** 'provinsi' | 'kabupaten' */
    viewMode = 'provinsi',
    /** Percentile trimming from legend sliders (0-100) */
    minPct = 0,
    maxPct = 100,
    /** Callback to inform parent about computed min/max/satuan so the legend can display them */
    onLegendDataChange,
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
            maxBoundsViscosity: 0.8,
            // ── Smooth zoom & pan ──────────────────────────────────────
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

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            keepBuffer: 6,
            updateWhenIdle: false,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
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
        const rows = permasalahanStats[activeDataType] || [];
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
                    color: '#333333',
                    weight: 1.0,
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
                    // Filter researches for this province
                    const provResearches = (researches || []).filter(r => {
                        const rGeoName = resolveGeoJsonName(r.provinsi || r.prov_pt);
                        return rGeoName === geoName;
                    });
                    
                    setModalData({ geoName, formattedNilai, activeDataType, nilai, satuan, provResearches });
                });
                layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.95, weight: 2.5 }));
                layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.75, weight: 1.5 }));
            },
        });

        layer.addTo(mapInstanceRef.current);
        geoJsonLayerRef.current = layer;
        layer.bringToBack();
    }, [geoJsonData, activeDataType, permasalahanStats, researches]);

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

        if (!showBubbles || !mapData.length) return;

        const clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 80,
            disableClusteringAtZoom: 8,
            chunkedLoading: true,
            zoomToBoundsOnClick: false,
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: false,
            // ── Premium Cluster Styling ──────────────────────────────────────
            iconCreateFunction: (cluster) => {
                const total = cluster.getAllChildMarkers().reduce(
                    (s, m) => s + (m.options.penelitianCount || 0),
                    0
                );
                const firstMarker = cluster.getAllChildMarkers()[0];
                const isProblem = firstMarker?.options?.isProblemData;
                const bubbleColor = isProblem ? '#1d4ed8' : getMarkerColorByBubbleType(activeDataType);

                const size = 44;
                return L.divIcon({
                    html: `<div style="background:${bubbleColor};width:${size}px;height:${size}px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:11px;box-shadow:0 4px 10px rgba(0,0,0,0.25);transition: transform 0.2s ease;">${total.toLocaleString('id-ID')}</div>`,
                    className: 'marker-cluster-premium',
                    iconSize: L.point(size, size, true),
                    iconAnchor: L.point(size / 2, size / 2),
                });
            },
        });

        // Helper to get marker color based on context
        function getMarkerColorByBubbleType(type) {
            // Using the bold blue from the screenshot
            return '#1d4ed8'; 
        }

        clusterGroup.on('clusterclick', (a) => {
            const currentZoom = mapInstanceRef.current.getZoom();
            const targetZoom = Math.min(currentZoom + 3, 14);
            mapInstanceRef.current.flyTo(a.latlng, targetZoom, {
                animate: true,
                duration: 0.55,
                easeLinearity: 0.15,
            });
        });

        const markers = [];
        mapData.forEach((item) => {
            const lat = parseFloat(item.pt_latitude);
            const lng = parseFloat(item.pt_longitude);
            if (isNaN(lat) || isNaN(lng)) return;

            const count = item.total_penelitian || 1;
            const size = 44;
            const isProblem = item.is_problem_data;
            
            // Bold blue from screenshot
            const color = '#3b82f6'; 

            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:10px;box-shadow:0 3px 6px rgba(0,0,0,0.2);">${count.toLocaleString('id-ID')}</div>`,
                    className: 'marker-premium',
                    iconSize: L.point(size, size, true),
                    iconAnchor: L.point(size / 2, size / 2),
                }),
                penelitianCount: count,
                isProblemData: isProblem
            });

            if (isProblem) {
                marker.bindPopup(
                    `<div style="padding:10px;min-width:180px;font-family:'Inter', sans-serif;">
                        <div style="font-weight:800;font-size:13px;color:#1e40af;margin-bottom:4px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${item.institusi || '-'}</div>
                        <div style="font-size:12px;color:#4b5563;margin-top:4px;">
                            <span style="font-weight:700;">${activeDataType}:</span> ${Number(item.nilai).toLocaleString('id-ID')} ${item.satuan || ''}
                        </div>
                        <div style="font-size:11px;color:#9ca3af;margin-top:2px;">${item.provinsi || '-'}</div>
                    </div>`,
                    { offset: [0, -size/2] }
                );
            } else {
                marker.bindPopup(
                    `<div style="padding:10px;min-width:200px;font-family:'Inter', sans-serif;">
                        <div style="font-weight:800;font-size:13px;color:#1e40af;margin-bottom:4px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${item.institusi || '-'}</div>
                        <div style="font-size:12px;color:#4b5563;margin-top:4px;">
                            <span style="font-weight:700;">Total Riset:</span> ${count.toLocaleString('id-ID')}
                        </div>
                         <div style="font-size:11px;color:#9ca3af;margin-top:2px;">${item.provinsi || '-'}</div>
                    </div>`,
                    { offset: [0, -size/2] }
                );
            }
            markers.push(marker);
        });

        clusterGroup.addLayers(markers);
        clusterGroup.addTo(mapInstanceRef.current);
        clusterGroupRef.current = clusterGroup;

        // Keep choropleth below bubbles
        if (geoJsonLayerRef.current) geoJsonLayerRef.current.bringToBack();
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
                        className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                        style={{ width: '90%', maxWidth: 450, position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center group">
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{modalData.geoName}</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Ringkasan Data & Riset</p>
                            </div>
                            <button
                                onClick={() => setModalData(null)}
                                className="p-1.5 rounded-full hover:bg-white hover:shadow-sm text-gray-400 hover:text-gray-700 transition-all"
                                aria-label="Tutup"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Problem Value Card */}
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 mb-6">
                                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">Status {modalData.activeDataType}</div>
                                <div className="text-xl font-black text-slate-800">
                                    {modalData.nilai !== undefined
                                        ? Number(modalData.nilai).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' ' + modalData.satuan
                                        : 'Tidak ada data'}
                                </div>
                            </div>

                            {/* Research List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Riset Terkait ({modalData.provResearches?.length || 0})</h4>
                                </div>

                                {modalData.provResearches && modalData.provResearches.length > 0 ? (
                                    <div className="space-y-3">
                                        {modalData.provResearches.slice(0, 10).map((r, i) => (
                                            <div key={i} className="group p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-default">
                                                <div className="text-[13px] font-bold text-slate-800 group-hover:text-blue-700 leading-snug line-clamp-2 uppercase">
                                                    {r.judul}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-medium">
                                                    <span className="truncate max-w-[150px]">{r.institusi}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{r.tahun}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {modalData.provResearches.length > 10 && (
                                            <p className="text-[11px] text-center text-slate-400 italic pt-1">
                                                Dan {modalData.provResearches.length - 10} riset lainnya...
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <p className="text-xs text-slate-400 font-medium">Belum ada riset terdata di wilayah ini</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                             <button
                                onClick={() => setModalData(null)}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                            >
                                Tutup
                            </button>
                        </div>
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
