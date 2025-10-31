import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Single blue color for all markers (matching original peta-bima implementation)
const MARKER_COLOR = '#3E7DCA';

export default function MapContainer({ mapData = [], data = [], displayMode = 'peneliti' }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [loading, setLoading] = useState(true);

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

        setTimeout(() => setLoading(false), 1000);

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

        // Data is already aggregated from backend, just display it
        // Group by location if needed
        const locationGroups = {};

        source.forEach(item => {
            if (!item.pt_latitude || !item.pt_longitude) return;

            const key = displayMode === 'institusi'
                ? item.institusi
                : `${item.pt_latitude},${item.pt_longitude}`;

            if (!locationGroups[key]) {
                locationGroups[key] = {
                    lat: parseFloat(item.pt_latitude),
                    lng: parseFloat(item.pt_longitude),
                    institusi: item.institusi,
                    count: 0,
                    fields: {}
                };
            }

            locationGroups[key].count += parseInt(item.count || 1);

            // Count bidang fokus
            const field = item.bidang_fokus || 'Other';
            locationGroups[key].fields[field] = (locationGroups[key].fields[field] || 0) + parseInt(item.count || 1);
        });

        // Create markers for each location group
        Object.values(locationGroups).forEach(group => {
            const count = group.count;

            // Use single blue color for all markers
            const color = MARKER_COLOR;

            // Create bubble marker with size based on count
            const radius = Math.min(50, Math.max(15, Math.sqrt(count) * 5));

            const circleMarker = L.circleMarker([group.lat, group.lng], {
                radius: radius,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });

            // Create popup content
            const fieldsHtml = Object.entries(group.fields)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([field, count]) => `<li><strong>${field}:</strong> ${count}</li>`)
                .join('');

            const popupContent = `
                <div class="p-2">
                    <h3 class="font-bold text-lg mb-2">${group.institusi || 'Unknown'}</h3>
                    <p class="mb-2"><strong>Total Penelitian:</strong> ${count}</p>
                    <div class="mb-2">
                        <strong>Top Bidang Fokus:</strong>
                        <ul class="list-disc ml-4 mt-1">
                            ${fieldsHtml}
                        </ul>
                    </div>
                </div>
            `;

            circleMarker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            circleMarker.addTo(mapInstanceRef.current);
            markersRef.current.push(circleMarker);

            // Add count label for larger clusters
            if (count > 5) {
                const divIcon = L.divIcon({
                    html: `<div style="
                        background: white;
                        border: 2px solid ${color};
                        border-radius: 50%;
                        width: ${Math.min(40, Math.max(20, radius))}px;
                        height: ${Math.min(40, Math.max(20, radius))}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: ${count > 100 ? '10px' : '12px'};
                        color: ${color};
                    ">${count}</div>`,
                    className: 'custom-div-icon',
                    iconSize: [radius * 2, radius * 2],
                    iconAnchor: [radius, radius]
                });

                const marker = L.marker([group.lat, group.lng], { icon: divIcon });
                marker.bindPopup(popupContent, {
                    maxWidth: 300,
                    className: 'custom-popup'
                });
                marker.addTo(mapInstanceRef.current);
                markersRef.current.push(marker);
            }
        });

    }, [mapData, displayMode]);

    return (
        <section className="relative bg-white flex justify-center mb-2">
            <div id="map" ref={mapRef} className="lg:w-[90%] w-full h-[65vh] border relative z-0 rounded-lg">
                {loading && (
                    <div
                        className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center"
                    >
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Memuat data penelitian...</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
