import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// Import markercluster - it extends L with markerClusterGroup
import 'leaflet.markercluster';

// Get bubble color based on data type/category
function getBubbleColor(item) {
    // Check if it's permasalahan data
    if (item.jenis_permasalahan) {
        // Permasalahan types can have different colors if needed
        return 'rgba(39, 127, 245, 0.7)'; // Blue for permasalahan
    }
    // Default blue for penelitian
    return 'rgba(39, 127, 245, 0.7)';
}

export default function MapContainer({ mapData = [], data = [], displayMode = 'peneliti' }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const [loading, setLoading] = useState(false);

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

    // Update markers when mapData changes
    useEffect(() => {
        const source = (mapData && mapData.length) ? mapData : data;
        if (!mapInstanceRef.current || !source.length) return;

        // Clear existing markers
        if (clusterGroupRef.current) {
            mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            clusterGroupRef.current = null;
        }

        // Clear any direct markers
        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        // Detect if this is permasalahan data
        const isPermasalahan = source.length > 0 && source[0].jenis_permasalahan !== undefined;

        const indonesiaBounds = L.latLngBounds([-11, 94], [6, 141]);
        let addedCount = 0;
        let skippedCount = 0;

        if (isPermasalahan) {
            // For permasalahan: use clustering
            const clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 50,
                disableClusteringAtZoom: 17,
                iconCreateFunction: function (cluster) {
                    const childCount = cluster.getChildCount();
                    let color = '#D5A6BD';

                    const childMarkers = cluster.getAllChildMarkers();
                    const colorCounts = {};
                    childMarkers.forEach(marker => {
                        const markerColor = marker.options.fillColor || '#D5A6BD';
                        colorCounts[markerColor] = (colorCounts[markerColor] || 0) + 1;
                    });

                    const mostCommonColor = Object.keys(colorCounts).reduce((a, b) =>
                        colorCounts[a] > colorCounts[b] ? a : b, null
                    );
                    if (mostCommonColor) {
                        color = mostCommonColor;
                    }

                    return L.divIcon({
                        html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${childCount}</div>`,
                        className: 'custom-cluster-icon',
                        iconSize: L.point(40, 40, true)
                    });
                },
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: true,
                zoomToBoundsOnClick: true
            });

            source.forEach((item) => {
                const latRaw = item.pt_latitude ?? item.latitude;
                const lngRaw = item.pt_longitude ?? item.longitude;
                const lat = parseFloat(latRaw);
                const lng = parseFloat(lngRaw);

                if (isNaN(lat) || isNaN(lng) || lat === null || lng === null || !indonesiaBounds.contains([lat, lng])) {
                    skippedCount++;
                    return;
                }

                const bubbleColor = getBubbleColor(item);
                const bubble = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: bubbleColor,
                    color: '#000',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.1
                });

                bubble.options.fillColor = bubbleColor;

                const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
                let popupContent = '<div class="p-3">';
                popupContent += `<h3 class="font-bold text-[#3E7DCA] mb-2">${safeValue(item.jenis_permasalahan)}</h3>`;
                if (item.provinsi) popupContent += `<p class="text-sm"><strong>Provinsi:</strong> ${safeValue(item.provinsi)}</p>`;
                if (item.kabupaten_kota) popupContent += `<p class="text-sm"><strong>Kabupaten:</strong> ${safeValue(item.kabupaten_kota)}</p>`;
                if (item.tahun) popupContent += `<p class="text-sm"><strong>Tahun:</strong> ${safeValue(item.tahun)}</p>`;
                if (item.nilai !== null && item.nilai !== undefined) popupContent += `<p class="text-sm"><strong>Nilai:</strong> ${safeValue(item.nilai)} ${safeValue(item.satuan)}</p>`;
                popupContent += '</div>';

                bubble.bindPopup(popupContent, { maxWidth: 320, className: 'custom-popup' });
                bubble.on('click', function (e) {
                    L.DomEvent.stopPropagation(e);
                });

                clusterGroup.addLayer(bubble);
                addedCount++;
            });

            if (addedCount > 0) {
                clusterGroup.addTo(mapInstanceRef.current);
                clusterGroupRef.current = clusterGroup;
            }
        } else {
            // For penelitian/hilirisasi/pengabdian: ULTRA-OPTIMIZED with requestAnimationFrame
            const clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 80,
                disableClusteringAtZoom: 15,
                chunkedLoading: true,
                chunkDelay: 10, // Minimal delay
                iconCreateFunction: function (cluster) {
                    const childCount = cluster.getChildCount();
                    let size = 'small';
                    if (childCount > 100) size = 'large';
                    else if (childCount > 50) size = 'medium';

                    const sizes = {
                        small: { width: 40, fontSize: 12 },
                        medium: { width: 50, fontSize: 13 },
                        large: { width: 60, fontSize: 14 }
                    };

                    return L.divIcon({
                        html: `<div style="background-color: rgba(39, 127, 245, 0.8); width: ${sizes[size].width}px; height: ${sizes[size].width}px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${sizes[size].fontSize}px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${childCount}</div>`,
                        className: 'custom-cluster-icon',
                        iconSize: L.point(sizes[size].width, sizes[size].width, true)
                    });
                },
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                removeOutsideVisibleBounds: true
            });

            // CRITICAL OPTIMIZATION: Use requestAnimationFrame instead of setTimeout
            // This syncs with browser's repaint cycle for smoother performance
            const BATCH_SIZE = 200; // Smaller batches for smoother UI
            let currentIndex = 0;

            const processNextBatch = () => {
                const endIndex = Math.min(currentIndex + BATCH_SIZE, source.length);

                for (let i = currentIndex; i < endIndex; i++) {
                    const item = source[i];
                    const latRaw = item.pt_latitude ?? item.latitude;
                    const lngRaw = item.pt_longitude ?? item.longitude;
                    const lat = parseFloat(latRaw);
                    const lng = parseFloat(lngRaw);

                    if (isNaN(lat) || isNaN(lng) || lat === null || lng === null || !indonesiaBounds.contains([lat, lng])) {
                        continue;
                    }

                    const bubbleColor = getBubbleColor(item);
                    const bubble = L.circleMarker([lat, lng], {
                        radius: 6,
                        fillColor: bubbleColor,
                        color: '#fff',
                        weight: 1.5,
                        opacity: 0.8,
                        fillOpacity: 0.6
                    });

                    const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
                    let popupContent = '<div class="p-3" style="max-width: 300px;">';
                    if (item.institusi) popupContent += `<h3 class="font-bold text-[#3E7DCA] mb-2 text-sm">${safeValue(item.institusi)}</h3>`;
                    if (item.provinsi) popupContent += `<p class="text-xs"><strong>Provinsi:</strong> ${safeValue(item.provinsi)}</p>`;
                    if (item.bidang_fokus) popupContent += `<p class="text-xs"><strong>Bidang:</strong> ${safeValue(item.bidang_fokus)}</p>`;
                    if (item.judul) popupContent += `<p class="text-xs mt-1"><strong>Judul:</strong> ${safeValue(item.judul).substring(0, 80)}${item.judul && item.judul.length > 80 ? '...' : ''}</p>`;
                    popupContent += '</div>';

                    bubble.bindPopup(popupContent, { maxWidth: 320, className: 'custom-popup' });
                    bubble.on('click', function (e) {
                        L.DomEvent.stopPropagation(e);
                    });

                    clusterGroup.addLayer(bubble);
                }

                currentIndex = endIndex;

                // Continue processing if there are more items
                if (currentIndex < source.length) {
                    requestAnimationFrame(processNextBatch);
                }
            };

            // Add cluster group immediately and start processing
            clusterGroup.addTo(mapInstanceRef.current);
            clusterGroupRef.current = clusterGroup;

            // Start processing with requestAnimationFrame
            requestAnimationFrame(processNextBatch);
        }

    }, [mapData, data]);

    return (
        <section className="relative bg-white flex justify-center mb-2">
            <div id="map" ref={mapRef} className="lg:w-[90%] w-full h-[65vh] border relative z-0 rounded-lg" />
        </section>
    );
}
