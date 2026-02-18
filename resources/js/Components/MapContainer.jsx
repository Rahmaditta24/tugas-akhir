import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import ResearchModal from './ResearchModal';

const CONFIG = {
    DEFAULT_CENTER: [-2.5, 118],
    DEFAULT_ZOOM: 5,
    MIN_ZOOM: 4,
    MAX_ZOOM: 18,
    INDONESIA_BOUNDS: [[-11.0, 94.0], [6.5, 141.0]],

    ZOOM_THRESHOLDS: {
        national: { min: 4, max: 6 },
        island: { min: 4, max: 8 },
        province: { min: 8, max: 11 },
        city: { min: 11, max: 18 }
    }
};

const FIELD_COLORS = {
    "Energi": "#FF5716",
    "Kebencanaan": "#ECCEAA",
    "Kemaritiman": "#00D0FF",
    "Kesehatan": "#FF2A64",
    "Material Maju": "#FFCC00",
    "Pangan": "#10B374",
    "Pertahanan dan Keamanan": "#1C4570",
    "Produk rekayasa keteknikan": "#FE272F",
    "Sosial Humaniora": "#A72184",
    "Teknologi Informasi dan Komunikasi": "#B39B77",
    "Transportasi": "#A578AE",
    "Riset Dasar Teoritis": "#96CEB4",
    "Hilirisasi": "#8B5CF6",
    "Terapan": "#EC4899",
    "Pengembangan": "#F59E0B"
};

export default function MapContainer({
    mapData = [],
    data = [],
    displayMode = 'peneliti',
    showBubbles = true,
    viewMode = 'provinsi',
    onStatsChange
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const processingRef = useRef(null);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDetail = React.useCallback(async (id, field) => {
        if (!id || id === 'undefined' || id === '-') return;
        try {
            const path = window.location.pathname;
            let type = 'penelitian';
            if (path.includes('hilirisasi')) type = 'hilirisasi';
            else if (path.includes('pengabdian')) type = 'pengabdian';

            const response = await fetch(`/api/research/${type}/${id}`);
            if (response.ok) {
                const detailData = await response.json();
                if (detailData) {
                    // Create normalized data structure for the modal
                    const normalized = {
                        ...detailData,
                        isInstitusi: false,
                        // Ensure common field names are available
                        nama: detailData.nama || detailData.nama_ketua || detailData.nama_pengusul || '-',
                        institusi: detailData.institusi || detailData.nama_institusi || detailData.perguruan_tinggi || '-',
                        provinsi: detailData.provinsi || detailData.prov_pt || detailData.prov_mitra || '-',
                        skema: detailData.skema || detailData.nama_skema || '-',
                        tahun: detailData.tahun || detailData.thn_pelaksanaan || detailData.thn_pelaksanaan_kegiatan || '-',
                        bidang_fokus: field || detailData.bidang_fokus || detailData.skema || detailData.nama_skema || '-'
                    };
                    setSelectedResearch(normalized);
                    setIsModalOpen(true);
                }
            }
        } catch (error) {
            console.error('Error fetching research detail:', error);
        }
    }, [setSelectedResearch, setIsModalOpen]);

    useEffect(() => {
        window.openResearchDetail = (id, field) => {
            if (id) fetchDetail(id, field);
        };

        window.openInstitusiDetail = (dataString) => {
            try {
                const data = JSON.parse(decodeURIComponent(dataString));
                setSelectedResearch({ ...data, isInstitusi: true });
                setIsModalOpen(true);
            } catch (e) {
                console.error("Error parsing institusi data", e);
            }
        };

        return () => {
            // Avoid deleting if other components might still need it, but usually safe here
            window.openResearchDetail = undefined;
            window.openInstitusiDetail = undefined;
        };
    }, [fetchDetail]);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: CONFIG.DEFAULT_CENTER,
            zoom: CONFIG.DEFAULT_ZOOM,
            minZoom: CONFIG.MIN_ZOOM,
            maxZoom: 18,
            zoomControl: true,
            preferCanvas: true,
            maxBounds: CONFIG.INDONESIA_BOUNDS,
            maxBoundsViscosity: 0.8
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        map.on('click', (e) => {
            // If click is on map background (not on a marker/cluster), reset stats
            if (onStatsChange) onStatsChange(null);
        });

        map.on('zoomend', () => {
            const currentZoom = map.getZoom();
            if (onStatsChange && clusterGroupRef.current) {
                if (currentZoom <= CONFIG.DEFAULT_ZOOM) {
                    onStatsChange(null);
                    return;
                }

                const markers = [];
                clusterGroupRef.current.eachLayer((layer) => {
                    if (map.getBounds().contains(layer.getLatLng())) {
                        markers.push(layer);
                    }
                });

                if (markers.length > 0) {
                    calculateStatsFromMarkers(markers);
                } else {
                    onStatsChange(null);
                }
            }
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const generatePopupContent = (item) => {
        const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
        const formatNum = (n) => (n && !isNaN(n)) ? Number(n).toLocaleString('id-ID') : '0';

        if (item.jenis_permasalahan) {
            const region = item.kabupaten_kota || item.provinsi || 'Wilayah';
            return `
                <div style="padding: 8px 12px; min-width: 180px; font-family: sans-serif;">
                    <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 4px;">${safeValue(region)}</div>
                    <div style="font-size: 13px; color: #4b5563; line-height: 1.4;">
                        <span style="font-weight: 500;">${safeValue(item.jenis_permasalahan)}:</span> 
                        ${formatNum(item.nilai)} ${safeValue(item.satuan)}
                    </div>
                </div>
            `;
        } else {
            let popupContent = '<div class="p-3" style="max-width: 320px; font-family: sans-serif;">';
            if (item.total_penelitian) {
                popupContent += `<div class="mb-2 p-2 bg-blue-50 rounded"><p class="text-sm font-bold text-[#3E7DCA]">Total: ${formatNum(item.total_penelitian)}</p></div>`;
            }
            if (item.institusi) {
                const arr = item.institusi.split(' | ');
                const str = arr.length > 3 ? arr.slice(0, 3).join(', ') + ` (+${arr.length - 3})` : item.institusi.replace(/ \| /g, ', ');
                popupContent += `<p class="text-xs mb-1"><strong>Institusi:</strong> ${safeValue(str)}</p>`;
            }
            if (item.provinsi) popupContent += `<p class="text-xs"><strong>Provinsi:</strong> ${safeValue(item.provinsi)}</p>`;
            popupContent += '</div>';
            return popupContent;
        }
    };

    const generateDetailPopup = (title, field, institusi, provinsi, tahun, id, color) => {
        const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
        const escField = safeValue(field).replace(/'/g, "\\'");

        return `
            <div style="padding: 10px; min-width: 280px; max-width: 350px; font-family: 'Inter', sans-serif; background: #ffffff;">
                <div style="font-weight: 800; font-size: 15px; color: #3E7DCA; margin-bottom: 12px; line-height: 1.3; letter-spacing: -0.01em;">
                    ${safeValue(title)}
                </div>
                <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 12px;"></div>
                <div style="margin-bottom: 15px; space-y: 6px;">
                  <div style="display: flex; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: #2d3748; width: 75px; flex-shrink: 0;">Institusi:</span>
                    <span style="font-size: 12px; color: #4a5568;">${safeValue(institusi)}</span>
                  </div>
                  <div style="display: flex; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: #2d3748; width: 75px; flex-shrink: 0;">Provinsi:</span>
                    <span style="font-size: 12px; color: #4a5568;">${safeValue(provinsi)}</span>
                  </div>
                  <div style="display: flex; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: #2d3748; width: 75px; flex-shrink: 0;">Tahun:</span>
                    <span style="font-size: 12px; color: #4a5568;">${safeValue(tahun)}</span>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                    <div style="background-color: #3182ce; width: 24px; height: 10px; border-radius: 5px;"></div>
                    <span onclick="window.openResearchDetail('${id}', '${escField}')" 
                        style="color: #64748b; font-style: italic; border: none; background: transparent; padding: 0; font-size: 11px; cursor: pointer;">
                        Klik untuk detail
                    </span>
                </div>
            </div>
        `;
    };

    const calculateStatsFromMarkers = (markers) => {
        if (!onStatsChange) return;

        let totalResearch = 0;
        const institutions = new Set();
        const provinces = new Set();
        const fields = new Set();

        markers.forEach(marker => {
            const count = marker.options.penelitianCount || 0;
            totalResearch += count;

            const data = marker.options.statsData;
            if (data) {
                if (data.institusi) {
                    // Handle pipe separated institutions in single markers if any
                    data.institusi.split('|').forEach(i => {
                        const trimmed = i.trim();
                        if (trimmed && trimmed !== '-') institutions.add(trimmed);
                    });
                }
                if (data.provinsi) {
                    data.provinsi.split('|').forEach(p => {
                        const trimmed = p.trim();
                        if (trimmed && trimmed !== '-') provinces.add(trimmed);
                    });
                }
                if (data.bidang) {
                    data.bidang.split('|').forEach(f => {
                        const trimmed = f.trim();
                        if (trimmed && trimmed !== '-') fields.add(trimmed);
                    });
                }
            }
        });

        onStatsChange({
            totalResearch,
            totalUniversities: institutions.size,
            totalProvinces: provinces.size,
            totalFields: fields.size || 13 // Fallback to global if 0 but research exists
        });
    };

    useEffect(() => {
        const fullSource = (mapData && mapData.length) ? mapData : data;
        if (!mapInstanceRef.current) return;

        if (processingRef.current) {
            cancelAnimationFrame(processingRef.current);
            processingRef.current = null;
        }

        if (clusterGroupRef.current) {
            mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            clusterGroupRef.current = null;
        }

        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.GeoJSON) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        const isPermasalahan = fullSource.length > 0 && fullSource[0].jenis_permasalahan !== undefined;

        if (showBubbles) {
            const clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 100, // Merging markers that are closer together
                disableClusteringAtZoom: 13, // Bloom into petals only at high zoom levels
                chunkedLoading: true,
                removeOutsideVisibleBounds: true,
                iconCreateFunction: function (cluster) {
                    const total = cluster.getAllChildMarkers().reduce((sum, m) => sum + (m.options.penelitianCount || 0), 0);

                    // Set constant size for all bubbles
                    const radius = 26;
                    const fontSize = 14;
                    return L.divIcon({
                        html: `<div style="background-color: rgba(95, 151, 208, 0.8); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${total.toLocaleString('id-ID')}</div>`,
                        className: 'custom-cluster-icon',
                        iconSize: L.point(radius * 2, radius * 2, true)
                    });
                },
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false // Manual handling for "one-click bloom"
            });

            // One-click bloom logic like vanilla
            clusterGroup.on('clusterclick', function (a) {
                const targetZoom = Math.max(mapInstanceRef.current.getZoom() + 3, 11);
                mapInstanceRef.current.setView(a.latlng, targetZoom);

                // Calculate stats for this cluster
                calculateStatsFromMarkers(a.layer.getAllChildMarkers());
            });

            clusterGroupRef.current = clusterGroup;
            mapInstanceRef.current.addLayer(clusterGroup);

            let index = 0;
            const batchSize = 150;

            const processChunk = () => {
                const limit = Math.min(index + batchSize, fullSource.length);
                const markersToAdd = [];

                for (let i = index; i < limit; i++) {
                    const item = fullSource[i];
                    const lat = parseFloat(item.pt_latitude ?? item.latitude);
                    const lng = parseFloat(item.pt_longitude ?? item.longitude);
                    if (isNaN(lat) || isNaN(lng)) continue;

                    if (displayMode === 'institusi' && !isPermasalahan) {
                        const count = item.total_penelitian || 1;
                        let radius = 24;
                        let fontSize = 12;

                        const marker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                html: `<div style="background-color: #3B82F6; width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); opacity: 0.8;">${count.toLocaleString('id-ID')}</div>`,
                                className: 'custom-marker-institusi',
                                iconSize: L.point(radius * 2, radius * 2, true),
                                iconAnchor: L.point(radius, radius)
                            }),
                            penelitianCount: count,
                            statsData: {
                                institusi: item.institusi,
                                provinsi: item.provinsi
                            }
                        });
                        marker.bindPopup(`
                            <div style="padding: 12px; min-width: 200px; font-family: 'Inter', sans-serif;">
                                <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1e40af;">${item.institusi || '-'}</h3>
                                <div style="font-size: 12px; color: #64748b;">${count.toLocaleString('id-ID')} penelitian</div>
                                <div style="margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                                    <span onclick="window.openInstitusiDetail('${encodeURIComponent(JSON.stringify(item))}')"
                                       style="color: #2563eb; font-size: 11px; text-decoration: none; font-style: italic; cursor: pointer;">Lihat detail kampus</span>
                                </div>
                            </div>
                        `, { maxWidth: 300 });

                        marker.on('click', () => {
                            calculateStatsFromMarkers([marker]);
                        });

                        markersToAdd.push(marker);
                    }
                    else if (displayMode === 'peneliti' && !isPermasalahan) {
                        const hasDetails = !!item.ids;
                        const fields = hasDetails && item.bidang_fokus ? item.bidang_fokus.split('|') : [];
                        const ids = hasDetails ? item.ids.split('|') : [];
                        const titles = hasDetails && item.titles ? item.titles.split('|') : [];
                        const years = hasDetails && item.tahun_list ? item.tahun_list.split('|') : [];
                        const count = hasDetails ? ids.length : (item.total_penelitian || 1);

                        if (!hasDetails && count > 30) {
                            // High count with no details -> Regular bubble to preserve performance
                            const radius = 22;
                            const marker = L.marker([lat, lng], {
                                icon: L.divIcon({
                                    html: `<div style="background-color: rgba(95, 151, 208, 0.9); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">${count.toLocaleString('id-ID')}</div>`,
                                    className: 'custom-marker-default',
                                    iconSize: L.point(radius * 2, radius * 2, true),
                                    iconAnchor: L.point(radius, radius)
                                }),
                                penelitianCount: count,
                                statsData: {
                                    institusi: item.institusi,
                                    provinsi: item.provinsi,
                                    bidang: item.bidang_fokus
                                }
                            });
                            marker.bindPopup(generatePopupContent(item), { maxWidth: 320 });

                            marker.on('click', () => {
                                calculateStatsFromMarkers([marker]);
                            });

                            markersToAdd.push(marker);
                        } else {
                            // Expand into Floral Pattern with L.circleMarker (MATCHING VANILLA)
                            for (let idx = 0; idx < count; idx++) {
                                let matchedColor = '#3E7DCA';
                                if (hasDetails) {
                                    const field = fields[idx];
                                    for (const [key, color] of Object.entries(FIELD_COLORS)) {
                                        if (field && field.includes(key)) { matchedColor = color; break; }
                                    }
                                }

                                // Pattern Bunga: Satu lingkaran lebar agar mekar sempurna
                                let coords;
                                if (idx === 0) {
                                    coords = [lat, lng];
                                } else {
                                    // Melebarkan radius agar bentuk bunga lebih terlihat (600m)
                                    const radiusKm = 0.6;
                                    const radiusDegrees = radiusKm / 111;

                                    // Sudut rotasi: dibagi rata berdasarkan jumlah data
                                    const angle = ((idx - 1) * (2 * Math.PI / (count - 1)));

                                    coords = [
                                        lat + radiusDegrees * Math.cos(angle),
                                        lng + radiusDegrees * Math.sin(angle)
                                    ];
                                }

                                const marker = L.circleMarker(coords, {
                                    radius: 14, // Larger petals for impact
                                    fillColor: matchedColor,
                                    fillOpacity: 0.85,
                                    stroke: true,
                                    color: 'white',
                                    weight: 2,
                                    className: 'research-circle-marker-premium',
                                    penelitianCount: 1,
                                    statsData: {
                                        institusi: item.institusi,
                                        provinsi: item.provinsi,
                                        bidang: fields[idx]
                                    }
                                });

                                const popup = hasDetails ?
                                    generateDetailPopup(titles[idx] || 'Detail', fields[idx], item.institusi, item.provinsi, years[idx], ids[idx], matchedColor) :
                                    generatePopupContent(item);

                                marker.bindPopup(popup, { maxWidth: 400 });

                                marker.on('click', () => {
                                    calculateStatsFromMarkers([marker]);
                                    // Optional: also open detail on marker click directly after a short delay
                                    // so popup has time to show but user gets the modal quickly
                                    // setTimeout(() => fetchDetail(ids[idx], fields[idx]), 100);
                                });

                                markersToAdd.push(marker);
                            }
                        }
                    }
                    else {
                        const count = item.total_penelitian || 1;
                        const marker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                html: `<div style="background-color: rgba(95, 151, 208, 0.9); width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">${count.toLocaleString('id-ID')}</div>`,
                                className: 'custom-marker-default',
                                iconSize: [32, 32],
                                iconAnchor: [16, 16]
                            }),
                            penelitianCount: count,
                            statsData: {
                                institusi: item.institusi,
                                provinsi: item.provinsi
                            }
                        });
                        marker.bindPopup(generatePopupContent(item));

                        marker.on('click', () => {
                            calculateStatsFromMarkers([marker]);
                        });

                        markersToAdd.push(marker);
                    }
                }

                clusterGroup.addLayers(markersToAdd);
                index = limit;

                if (index < fullSource.length) {
                    processingRef.current = requestAnimationFrame(processChunk);
                } else {
                    processingRef.current = null;
                }
            };

            processChunk();
        }

        return () => {
            if (processingRef.current) cancelAnimationFrame(processingRef.current);
            if (mapInstanceRef.current) {
            }
        };
    }, [mapData, data, showBubbles, displayMode, viewMode]);

    return (
        <>
            <section className="relative bg-white flex justify-center mb-2">
                <div id="map" ref={mapRef} className="lg:w-[90%] w-full h-[65vh] border relative z-0 rounded-lg shadow-inner overflow-hidden" />
            </section>
            <ResearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedResearch} />
        </>
    );
}