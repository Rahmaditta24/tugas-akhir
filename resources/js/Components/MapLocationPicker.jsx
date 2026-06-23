import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map click events
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

// Component to fly the map to a given position
function MapFlyTo({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], 14, { animate: true, duration: 1 });
        }
    }, [position, map]);
    return null;
}

// The modal content rendered via portal
function MapModal({ markerPos, onMarkerChange, onSave, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [flyTarget, setFlyTarget] = useState(null);
    const searchInputRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Focus search on open
    useEffect(() => {
        setTimeout(() => searchInputRef.current?.focus(), 100);
    }, []);

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults([]);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=7&q=${encodeURIComponent(searchQuery)}`,
                { headers: { 'Accept-Language': 'id,en' } }
            );
            const data = await res.json();
            setSearchResults(data);
        } catch {
            // silent fail
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result) => {
        const pos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        onMarkerChange(pos);
        setFlyTarget(pos);
        setSearchResults([]);
        setSearchQuery(result.display_name.split(',').slice(0, 2).join(','));
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
            onMouseDown={(e) => {
                // Only close if clicking directly on backdrop (not children)
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh' }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cari &amp; Pilih Lokasi
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <form
                        onSubmit={handleSearchSubmit}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{ position: 'relative' }}
                    >
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama tempat, jalan, atau kota..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    onMouseDown={(e) => e.stopPropagation()}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 whitespace-nowrap"
                            >
                                {isSearching ? 'Mencari...' : 'Cari'}
                            </button>
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div
                                className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto"
                                style={{ zIndex: 99999, maxHeight: '220px', top: '100%' }}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                {searchResults.map((res, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSelectResult(res);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                        <div className="text-sm font-medium text-slate-800 truncate">
                                            {res.display_name.split(',')[0]}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate mt-0.5">
                                            {res.display_name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                {/* Map */}
                <div className="flex-1 relative" style={{ minHeight: '380px' }}>
                    <MapContainer
                        center={[markerPos.lat, markerPos.lng]}
                        zoom={13}
                        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                            position={[markerPos.lat, markerPos.lng]}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const { lat, lng } = e.target.getLatLng();
                                    onMarkerChange({ lat, lng });
                                },
                            }}
                        />
                        <MapClickHandler onMapClick={onMarkerChange} />
                        {flyTarget && <MapFlyTo position={flyTarget} />}
                    </MapContainer>

                    {/* Coordinate badge */}
                    <div
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow border border-slate-200 text-xs font-mono text-slate-700"
                        style={{ zIndex: 400 }}
                    >
                        {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
                    </div>

                    {/* Hint */}
                    <div
                        className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none"
                        style={{ zIndex: 400 }}
                    >
                        <span className="bg-slate-900/75 text-white px-4 py-1.5 rounded-full text-xs backdrop-blur-sm shadow">
                            Klik peta atau geser marker untuk memilih titik lokasi
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
                    <span className="text-xs text-slate-500">
                        Koordinat: <span className="font-mono font-medium text-slate-700">{markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}</span>
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                        >
                            Terapkan Koordinat
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function MapLocationPicker({
    latitude,
    longitude,
    onLatitudeChange,
    onLongitudeChange,
    latError,
    lngError,
    onLatBlur,
    onLngBlur,
}) {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [markerPos, setMarkerPos] = useState({
        lat: latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : -6.175392,
        lng: longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : 106.827153,
    });

    // Sync when external lat/lng values change (e.g. on edit page load)
    useEffect(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            setMarkerPos({ lat, lng });
        }
    }, [latitude, longitude]);

    const handleOpenMap = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMapOpen(true);
    };

    const handleClose = useCallback(() => {
        setIsMapOpen(false);
    }, []);

    const handleMarkerChange = useCallback((pos) => {
        setMarkerPos(pos);
    }, []);

    const handleSave = useCallback(() => {
        onLatitudeChange(markerPos.lat.toString());
        onLongitudeChange(markerPos.lng.toString());
        setIsMapOpen(false);
    }, [markerPos, onLatitudeChange, onLongitudeChange]);

    return (
        <div className="col-span-1 md:col-span-2">
            {/* Label + Button */}
            <div className="flex justify-between items-end mb-2 h-5">
                <label className="text-sm font-medium text-slate-700 leading-none">
                    Koordinat Lokasi
                </label>
                <button
                    type="button"
                    onClick={handleOpenMap}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors translate-y-1"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pilih dari Peta
                </button>
            </div>

            {/* Manual inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={latitude}
                        onChange={(e) => {
                            const val = e.target.value.replace(',', '.').replace(/[^0-9.-]/g, '');
                            e.target.value = val;
                            onLatitudeChange(val);
                        }}
                        onBlur={onLatBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            latError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                        }`}
                        placeholder="-6.200000"
                    />
                    {latError && <p className="mt-1 text-xs text-red-600">{latError}</p>}
                    <p className="mt-0.5 text-xs text-slate-400">Rentang valid: -90 hingga 90</p>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={longitude}
                        onChange={(e) => {
                            const val = e.target.value.replace(',', '.').replace(/[^0-9.-]/g, '');
                            e.target.value = val;
                            onLongitudeChange(val);
                        }}
                        onBlur={onLngBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            lngError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                        }`}
                        placeholder="106.816666"
                    />
                    {lngError && <p className="mt-1 text-xs text-red-600">{lngError}</p>}
                    <p className="mt-0.5 text-xs text-slate-400">Rentang valid: -180 hingga 180</p>
                </div>
            </div>

            {isMapOpen && (
                <MapModal
                    markerPos={markerPos}
                    onMarkerChange={handleMarkerChange}
                    onSave={handleSave}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
