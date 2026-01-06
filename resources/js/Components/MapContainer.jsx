import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

export default function MapContainer({
    mapData = [],
    data = [],
    displayMode = 'peneliti',
    showBubbles = true,
    viewMode = 'provinsi'
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // Gradient Color Scale (Green -> Yellow -> Red)
    const getRegionColor = (value, min, max) => {
        if (value === undefined || value === null) return '#f1f5f9'; // Grey

        // If single value/no range, default to green if data exists
        if (min === max) return '#4ade80';

        const p = (value - min) / (max - min);

        if (p < 0.2) return '#4ade80'; // Green
        if (p < 0.4) return '#a3e635'; // Lime
        if (p < 0.6) return '#facc15'; // Yellow
        if (p < 0.8) return '#fb923c'; // Orange
        return '#f87171'; // Red
    };

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: [-2.5, 118.0],
            zoom: 5,
            minZoom: 4,
            maxZoom: 18,
            zoomControl: true,
            maxBounds: [
                [-11.0, 94.0],
                [6.0, 141.0]
            ],
            maxBoundsViscosity: 1.0
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setLoading(false);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Generate popup content helper
    const generatePopupContent = (item) => {
        const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;

        if (item.jenis_permasalahan) {
            // Permasalahan Style - Compact and clean
            const region = item.kabupaten_kota || item.provinsi || 'Wilayah';

            // Format nilai dengan pemisah ribuan
            let formattedNilai = safeValue(item.nilai);
            if (item.nilai && !isNaN(item.nilai)) {
                const num = typeof item.nilai === 'string' ? parseFloat(item.nilai.replace(/\./g, '').replace(',', '.')) : item.nilai;
                formattedNilai = num.toLocaleString('id-ID', { maximumFractionDigits: 2 });
            }

            return `
                <div style="padding: 8px 12px; min-width: 180px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 4px;">
                        ${safeValue(region)}
                    </div>
                    <div style="font-size: 13px; color: #4b5563; line-height: 1.4;">
                        <span style="font-weight: 500;">${safeValue(item.jenis_permasalahan)}:</span> 
                        ${formattedNilai} ${safeValue(item.satuan)}
                    </div>
                </div>
            `;
        } else {
            // Standard Style
            let popupContent = '<div class="p-3" style="max-width: 320px; font-family: sans-serif;">';
            if (item.total_penelitian) {
                popupContent += `<div class="mb-2 p-2 bg-blue-50 rounded"><p class="text-sm font-bold text-[#3E7DCA]">Total Penelitian: ${item.total_penelitian}</p></div>`;
            }
            if (item.institusi) {
                const arr = item.institusi.split(' | ');
                const str = arr.length > 3 ? arr.slice(0, 3).join(', ') + ` (+${arr.length - 3})` : item.institusi.replace(/ \| /g, ', ');
                popupContent += `<p class="text-xs mb-1"><strong>Institusi:</strong> ${safeValue(str)}</p>`;
            }
            if (item.provinsi) popupContent += `<p class="text-xs"><strong>Provinsi:</strong> ${safeValue(item.provinsi)}</p>`;
            if (item.kabupaten_kota) popupContent += `<p class="text-xs"><strong>Kabupaten:</strong> ${safeValue(item.kabupaten_kota)}</p>`;
            if (item.bidang_fokus) {
                const bf = item.bidang_fokus.length > 100 ? item.bidang_fokus.substring(0, 100) + '...' : item.bidang_fokus;
                popupContent += `<p class="text-xs mt-1"><strong>Bidang Fokus:</strong> ${safeValue(bf)}</p>`;
            }
            if (item.nilai) popupContent += `<p class="text-xs mt-1"><strong>Nilai:</strong> ${safeValue(item.nilai)} ${safeValue(item.satuan)}</p>`;
            popupContent += '</div>';
            return popupContent;
        }
    };

    // Update markers and geojson
    useEffect(() => {
        const fullSource = (mapData && mapData.length) ? mapData : data;

        // Filter Source based on View Mode
        const source = fullSource.filter(item => {
            // Apply filtering only if it's Permasalahan data types
            if (item.jenis_permasalahan !== undefined) {
                if (viewMode === 'provinsi') return !item.kabupaten_kota;
                if (viewMode === 'kabupaten') return !!item.kabupaten_kota;
            }
            return true;
        });

        if (!mapInstanceRef.current) return;

        // Clear existing cluster group
        if (clusterGroupRef.current) {
            mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            clusterGroupRef.current = null;
        }

        // Clear direct layers (markers, geojson)
        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.GeoJSON) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        // Detect Permasalahan
        const isPermasalahan = fullSource.length > 0 && fullSource[0].jenis_permasalahan !== undefined;

        // Calculate Min/Max for Gradient (using Full Source for consistent scale context)
        let minVal = Infinity;
        let maxVal = -Infinity;
        if (isPermasalahan) {
            fullSource.forEach(d => {
                if (d.nilai !== undefined && d.nilai !== null) {
                    const val = typeof d.nilai === 'string' ? parseFloat(d.nilai.replace(/\./g, '').replace(',', '.')) : d.nilai;
                    if (!isNaN(val)) {
                        if (val < minVal) minVal = val;
                        if (val > maxVal) maxVal = val;
                    }
                }
            });
            // Defaults if no data found
            if (minVal === Infinity) { minVal = 0; maxVal = 100; }
        }

        // Load GeoJSON for Permasalahan
        if (isPermasalahan) {
            // Try multiple sources in case one fails
            const geoJsonUrls = [
                'https://raw.githubusercontent.com/ans-4175/peta-indonesia-geojson/refs/heads/master/indonesia-prov.geojson',
                'https://code.highcharts.com/mapdata/countries/id/id-all.geo.json'
            ];

            const tryFetchGeoJSON = async (urls) => {
                for (const url of urls) {
                    try {
                        console.log('Trying GeoJSON URL:', url);
                        const response = await fetch(url);
                        console.log('Response status:', response.status, response.ok);

                        if (response.ok) {
                            const data = await response.json();
                            console.log('GeoJSON loaded successfully from:', url);
                            return data;
                        }
                    } catch (err) {
                        console.warn('Failed to load from', url, err);
                    }
                }
                throw new Error('All GeoJSON sources failed');
            };

            tryFetchGeoJSON(geoJsonUrls)
                .then(geoData => {
                    // console.log('GeoJSON loaded successfully, features count:', geoData.features?.length);
                    if (!mapInstanceRef.current) {
                        console.warn('Map instance not available');
                        return;
                    }

                    // Province name mapping for different GeoJSON formats
                    const provinceNameMap = {
                        'aceh': 'aceh',
                        'bali': 'bali',
                        'bangkabelitung': 'kepulauanbangkabelitung',
                        'banten': 'banten',
                        'bengkulu': 'bengkulu',
                        'gorontalo': 'gorontalo',
                        'jakarta': 'dkijakarta',
                        'jambi': 'jambi',
                        'westjava': 'jawabarat',
                        'centraljava': 'jawatengah',
                        'eastjava': 'jawatimur',
                        'westkalimantan': 'kalimantanbarat',
                        'southkalimantan': 'kalimantanselatan',
                        'centralkalimantan': 'kalimantantengah',
                        'eastkalimantan': 'kalimantantimur',
                        'northkalimantan': 'kalimantanutara',
                        'riau': 'riau',
                        'riauislands': 'kepulauanriau',
                        'lampung': 'lampung',
                        'maluku': 'maluku',
                        'northmaluku': 'malukuutara',
                        'westnusatenggara': 'nusatenggarabarat',
                        'eastnusatenggara': 'nusatenggaratimur',
                        'papua': 'papua',
                        'westpapua': 'papuabarat',
                        'westsulawesi': 'sulawesibarat',
                        'southsulawesi': 'sulawesiselatan',
                        'centralsulawesi': 'sulawesitengah',
                        'southeastsulawesi': 'sulawesitenggara',
                        'northsulawesi': 'sulawesiutara',
                        'northsumatra': 'sumaterautara',
                        'westsumatra': 'sumaterabarat',
                        'southsumatra': 'sumateraselatan',
                        'yogyakarta': 'diyogyakarta',
                        'specialregionofyogyakarta': 'diyogyakarta'
                    };



                    let matchCount = 0;

                    const geoLayer = L.geoJSON(geoData, {
                        style: (feature) => {
                            const props = feature.properties;
                            // Check ALL possible property names for province
                            const geoProvName = props.Propinsi || props.PROVINSI || props.Provinsi || props.NAME_1 || props.name || props.id || '';

                            const normalize = (s) => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                            const normalizedGeoName = normalize(geoProvName);

                            // Try to find matching data using multiple strategies
                            const provData = fullSource.find(d => {
                                if (d.kabupaten_kota || !d.provinsi) return false;

                                const normalizedDataName = normalize(d.provinsi);

                                // 1. Direct normalized match
                                if (normalizedGeoName === normalizedDataName) return true;

                                // 2. Try mapped name from our manual map
                                const geoNameEnglish = geoProvName.toString().toLowerCase().replace(/[^a-z]/g, '');
                                if (provinceNameMap[geoNameEnglish] === normalizedDataName) return true;

                                // 3. Specific manual fixes for common mismatches
                                // KALIMANTAN BARAT
                                if (normalizedGeoName.includes('kalimantan') && normalizedGeoName.includes('barat') && normalizedDataName === 'kalimantanbarat') return true;
                                // YOGYAKARTA 
                                if ((normalizedGeoName.includes('yogyakarta') || normalizedGeoName.includes('jogja')) && normalizedDataName === 'diyogyakarta') return true;
                                // JAKARTA
                                if (normalizedGeoName.includes('jakarta') && normalizedDataName === 'dkijakarta') return true;
                                // BANGKA BELITUNG
                                if (normalizedGeoName.includes('bangka') && normalizedGeoName.includes('belitung') && normalizedDataName === 'kepulauanbangkabelitung') return true;

                                // SULAWESI FIXES
                                // Sulawesi Tenggara (Kendari)
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('tenggara') && normalizedDataName.includes('sulawesitenggara')) return true;
                                // Sulawesi Utara
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('utara') && normalizedDataName.includes('sulawesiutara')) return true;
                                // Sulawesi Selatan
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('selatan') && normalizedDataName.includes('sulawesiselatan')) return true;
                                // Sulawesi Tengah
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('tengah') && normalizedDataName.includes('sulawesitengah')) return true;
                                // Sulawesi Barat
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('barat') && normalizedDataName.includes('sulawesibarat')) return true;



                                return false;
                            });

                            let val = null;
                            if (provData && provData.nilai !== undefined) {
                                val = typeof provData.nilai === 'string' ? parseFloat(provData.nilai.replace(/\./g, '').replace(',', '.')) : provData.nilai;
                                matchCount++;

                                // Log first few matches
                                if (matchCount <= 5) {
                                    // console.log(`Match #${matchCount}:`, { ... });
                                }
                            }

                            const color = getRegionColor(val, minVal, maxVal);

                            return {
                                fillColor: color,
                                weight: 2,
                                opacity: 1,
                                color: '#ffffff',
                                fillOpacity: val !== null ? 0.65 : 0.2
                            };
                        },
                        onEachFeature: (feature, layer) => {
                            const props = feature.properties;
                            // Check ALL possible property names for province
                            const geoProvName = props.Propinsi || props.PROVINSI || props.Provinsi || props.NAME_1 || props.name || props.id || '';

                            const normalize = (s) => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                            const normalizedGeoName = normalize(geoProvName);

                            const provData = fullSource.find(d => {
                                if (d.kabupaten_kota || !d.provinsi) return false;
                                const normalizedDataName = normalize(d.provinsi);

                                // Same matching logic as above
                                if (normalizedGeoName === normalizedDataName) return true;

                                const geoNameEnglish = geoProvName.toString().toLowerCase().replace(/[^a-z]/g, '');
                                if (provinceNameMap[geoNameEnglish] === normalizedDataName) return true;

                                if (normalizedGeoName.includes('kalimantan') && normalizedGeoName.includes('barat') && normalizedDataName === 'kalimantanbarat') return true;
                                if ((normalizedGeoName.includes('yogyakarta') || normalizedGeoName.includes('jogja')) && normalizedDataName === 'diyogyakarta') return true;
                                if (normalizedGeoName.includes('jakarta') && normalizedDataName === 'dkijakarta') return true;
                                if (normalizedGeoName.includes('bangka') && normalizedGeoName.includes('belitung') && normalizedDataName === 'kepulauanbangkabelitung') return true;

                                // SULAWESI FIXES
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('tenggara') && normalizedDataName.includes('sulawesitenggara')) return true;
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('utara') && normalizedDataName.includes('sulawesiutara')) return true;
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('selatan') && normalizedDataName.includes('sulawesiselatan')) return true;
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('tengah') && normalizedDataName.includes('sulawesitengah')) return true;
                                if (normalizedGeoName.includes('sulawesi') && normalizedGeoName.includes('barat') && normalizedDataName.includes('sulawesibarat')) return true;

                                return false;
                            });

                            if (provData) {
                                layer.bindPopup(generatePopupContent(provData), { className: 'custom-popup' });
                                layer.on('mouseover', () => {
                                    layer.setStyle({ fillOpacity: 0.9, weight: 2 });
                                });
                                layer.on('mouseout', () => {
                                    let val = null;
                                    if (provData.nilai !== undefined) {
                                        val = typeof provData.nilai === 'string' ? parseFloat(provData.nilai.replace(/\./g, '').replace(',', '.')) : provData.nilai;
                                    }
                                    layer.setStyle({
                                        fillOpacity: val !== null ? 0.7 : 0.3,
                                        weight: 1
                                    });
                                });
                            }
                        }
                    });

                    // Add to map and ensure it's below markers
                    geoLayer.addTo(mapInstanceRef.current);
                    geoLayer.bringToBack(); // Ensure GeoJSON is below markers

                    console.log('GeoJSON layer added to map successfully');
                })
                .catch(err => {
                    console.error("GeoJSON Load Error", err);
                });
        }

        const indonesiaBounds = L.latLngBounds([-11, 94], [6, 141]);

        // Only Render Markers (Bubbles) if showBubbles is true
        if (showBubbles) {
            const clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 80,
                disableClusteringAtZoom: 15,
                chunkedLoading: true,
                chunkDelay: 10,
                iconCreateFunction: function (cluster) {
                    const childMarkers = cluster.getAllChildMarkers();
                    const totalPenelitian = childMarkers.reduce((sum, marker) => {
                        return sum + (marker.options.penelitianCount || 0);
                    }, 0);

                    let radius = 18;
                    if (totalPenelitian > 1000) radius = 28;
                    else if (totalPenelitian > 500) radius = 24;
                    else if (totalPenelitian > 100) radius = 20;

                    const fontSize = radius > 24 ? 13 : (radius > 20 ? 12 : 11);

                    return L.divIcon({
                        html: `<div style="background-color: rgba(95, 151, 208, 0.8); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">${totalPenelitian}</div>`,
                        className: 'custom-cluster-icon',
                        iconSize: L.point(radius * 2, radius * 2, true)
                    });
                },
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                removeOutsideVisibleBounds: true
            });

            source.forEach((item) => {
                const lat = parseFloat(item.pt_latitude ?? item.latitude);
                const lng = parseFloat(item.pt_longitude ?? item.longitude);

                if (isNaN(lat) || isNaN(lng) || !indonesiaBounds.contains([lat, lng])) return;

                const count = item.total_penelitian || 1;

                let radius = 14;
                let fontSize = 10;
                if (count > 1000) { radius = 28; fontSize = 13; }
                else if (count > 500) { radius = 24; fontSize = 12; }
                else if (count > 100) { radius = 20; fontSize = 11; }
                else if (count > 50) { radius = 16; fontSize = 10; }

                const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: `<div style="background-color: rgba(95, 151, 208, 0.8); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">${count}</div>`,
                        className: 'custom-marker-icon',
                        iconSize: L.point(radius * 2, radius * 2, true),
                        iconAnchor: L.point(radius, radius)
                    }),
                    penelitianCount: count
                });

                marker.bindPopup(generatePopupContent(item), { maxWidth: 320, className: 'custom-popup' });
                marker.on('click', function (e) {
                    L.DomEvent.stopPropagation(e);
                });

                clusterGroup.addLayer(marker);
            });

            clusterGroup.addTo(mapInstanceRef.current);
            clusterGroupRef.current = clusterGroup;
        }

    }, [mapData, data, showBubbles, viewMode]);

    return (
        <section className="relative bg-white flex justify-center mb-2">
            <div id="map" ref={mapRef} className="lg:w-[90%] w-full h-[65vh] border relative z-0 rounded-lg" />
        </section>
    );
}
