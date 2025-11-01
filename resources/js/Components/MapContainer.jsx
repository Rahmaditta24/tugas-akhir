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

        // Remove existing cluster group
        if (clusterGroupRef.current) {
            mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            clusterGroupRef.current = null;
        }

        console.log('MapContainer rendering markers:', source.length, 'items, displayMode:', displayMode);

        // Create marker cluster group exactly like peta-bima
        const clusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            iconCreateFunction: function (cluster) {
                const childCount = cluster.getChildCount();
                let color = '#D5A6BD'; // Default color
                
                // Get the most common color from child markers
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

                // Cluster icon exactly like peta-bima: 40px, white border, no multiple rings
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

        const indonesiaBounds = L.latLngBounds([-11, 94], [6, 141]);
        let addedCount = 0;
        let skippedCount = 0;

        // Add individual circle markers to cluster group
        source.forEach((item, index) => {
            const latRaw = item.pt_latitude ?? item.latitude;
            const lngRaw = item.pt_longitude ?? item.longitude;
            const lat = parseFloat(latRaw);
            const lng = parseFloat(lngRaw);

            // Validate coordinates
            if (isNaN(lat) || isNaN(lng) || lat === null || lng === null || !indonesiaBounds.contains([lat, lng])) {
                console.warn(`Skipping item ${index}: Invalid coords`);
                skippedCount++;
                return;
            }

            // Create circle marker exactly like peta-bima
            const bubbleColor = getBubbleColor(item);
            const bubble = L.circleMarker([lat, lng], {
                radius: 8,
                fillColor: bubbleColor,
                color: '#000',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.1
            });

            // Store fillColor for cluster icon color detection
            bubble.options.fillColor = bubbleColor;

            // Create popup content
            const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
            
            let popupContent = '<div class="p-3">';
            
            if (item.jenis_permasalahan) {
                // Permasalahan popup
                popupContent += `<h3 class="font-bold text-[#3E7DCA] mb-2">${safeValue(item.jenis_permasalahan)}</h3>`;
                if (item.provinsi) popupContent += `<p class="text-sm"><strong>Provinsi:</strong> ${safeValue(item.provinsi)}</p>`;
                if (item.kabupaten) popupContent += `<p class="text-sm"><strong>Kabupaten:</strong> ${safeValue(item.kabupaten)}</p>`;
                if (item.tahun) popupContent += `<p class="text-sm"><strong>Tahun:</strong> ${safeValue(item.tahun)}</p>`;
            } else {
                // Penelitian/Hilirisasi/Pengabdian popup
                if (item.institusi) popupContent += `<h3 class="font-bold text-[#3E7DCA] mb-2">${safeValue(item.institusi)}</h3>`;
                if (item.provinsi) popupContent += `<p class="text-sm"><strong>Provinsi:</strong> ${safeValue(item.provinsi)}</p>`;
                if (item.bidang_fokus) popupContent += `<p class="text-sm"><strong>Bidang Fokus:</strong> ${safeValue(item.bidang_fokus)}</p>`;
                if (item.judul) popupContent += `<p class="text-sm"><strong>Judul:</strong> ${safeValue(item.judul)}</p>`;
            }
            
            popupContent += '</div>';
            
            bubble.bindPopup(popupContent, { maxWidth: 320, className: 'custom-popup' });
            bubble.on('click', function (e) {
                L.DomEvent.stopPropagation(e);
                // You can add modal/detail view here if needed
            });

            clusterGroup.addLayer(bubble);
            addedCount++;
        });

        if (addedCount > 0) {
            clusterGroup.addTo(mapInstanceRef.current);
            clusterGroupRef.current = clusterGroup;
        }

        console.log(`Rendered ${addedCount} markers (skipped ${skippedCount})`);

    }, [mapData, data, displayMode]);

    return (
        <section className="relative bg-white flex justify-center mb-2">
            <div id="map" ref={mapRef} className="lg:w-[90%] w-full h-[65vh] border relative z-0 rounded-lg" />
        </section>
    );
}
