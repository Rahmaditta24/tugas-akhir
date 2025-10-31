import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Single blue color for all markers (matching original peta-bima implementation)
const MARKER_COLOR = '#3E7DCA';

export default function MapContainer({ mapData = [], data = [], displayMode = 'peneliti' }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
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
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        console.log('MapContainer rendering markers:', source.length, 'items, displayMode:', displayMode);

        // Group data based on display mode
        const groups = {};

        source.forEach((item, idx) => {
            const latRaw = item.pt_latitude ?? item.latitude;
            const lngRaw = item.pt_longitude ?? item.longitude;
            const lat = parseFloat(latRaw);
            const lng = parseFloat(lngRaw);

            // Validate coordinates (Indonesia bounds)
            if (isNaN(lat) || isNaN(lng) || lat < -11 || lat > 7 || lng < 94 || lng > 142) {
                console.warn(`Invalid coords for item ${idx}:`, lat, lng);
                return;
            }

            // ALWAYS group by institusi + coordinates for clean bubble grouping
            // This matches the native implementation: aggregateResearchByCampus
            // Both modes use the same grouping - difference is only in what data is shown
            const key = `${item.institusi}_${lat.toFixed(4)}_${lng.toFixed(4)}`;

            if (!groups[key]) {
                groups[key] = {
                    lat,
                    lng,
                    count: 0,
                    institusi: item.institusi ?? null,
                    provinsi: item.provinsi ?? null,
                    bidang_fokus: item.bidang_fokus ?? null,
                    items: []
                };
            }

            groups[key].count += 1;  // Count each record
            groups[key].items.push(item);

            // Use first item's coordinates for the group (campus location)
            // Don't average - keep the exact campus coordinates
        });

        // Render markers for each group
        Object.values(groups).forEach(group => {
            const count = group.count;
            const color = MARKER_COLOR;

            // Match native bubble size calculation
            // CONFIG.BUBBLE_SIZE: { min: 50, max: 50, multiplier: 2 }
            // But with logarithmic scaling for better visualization
            const size = Math.min(64, Math.max(32, 18 + Math.log(count + 1) * 12));
            const fontSize = count > 999 ? 12 : 14;

            const divIcon = L.divIcon({
                html: `<div style="
                    display:flex;align-items:center;justify-content:center;
                    width:${size}px;height:${size}px;border-radius:50%;
                    background:${color};color:#fff;border:4px solid #ffffffcc;
                    box-shadow:0 2px 6px rgba(0,0,0,0.25);font-weight:700;
                    font-size:${fontSize}px;line-height:1;">${count.toLocaleString('id-ID')}</div>`,
                className: 'cluster-bubble',
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            });

            const marker = L.marker([group.lat, group.lng], { icon: divIcon });

            // Enhanced popup content
            const popupContent = `
                <div class="p-3">
                    ${group.institusi ? `<h3 class="font-bold text-[#3E7DCA] mb-2">${group.institusi}</h3>` : ''}
                    ${group.provinsi ? `<p class="text-sm"><strong>Provinsi:</strong> ${group.provinsi}</p>` : ''}
                    <p class="text-sm"><strong>Total ${displayMode === 'institusi' ? 'Penelitian' : 'Item'}:</strong> ${count.toLocaleString('id-ID')}</p>
                    ${group.bidang_fokus ? `<p class="text-sm"><strong>Bidang Fokus:</strong> ${group.bidang_fokus}</p>` : ''}
                    ${displayMode === 'institusi' ? '<p class="text-xs text-gray-500 mt-2 italic">Klik untuk melihat detail penelitian</p>' : ''}
                </div>`;

            marker.bindPopup(popupContent, { maxWidth: 320, className: 'custom-popup' });
            marker.addTo(mapInstanceRef.current);
            markersRef.current.push(marker);
        });

        console.log('Rendered', markersRef.current.length, 'markers from', Object.keys(groups).length, 'groups');

    }, [mapData, data, displayMode]);

    return (
        <section className="relative bg-white flex justify-center mb-2">
            <div id="map" ref={mapRef} className="lg:w-[90%] w-full h-[65vh] border relative z-0 rounded-lg" />
        </section>
    );
}
