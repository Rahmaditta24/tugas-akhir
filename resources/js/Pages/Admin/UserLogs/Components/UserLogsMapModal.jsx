import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function UserLogsMapModal({ context }) {
    const { selectedLocation, setSelectedLocation } = context;

    if (!selectedLocation) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">
                        Lokasi Login: {selectedLocation.name}
                    </h3>
                    <button
                        onClick={() => setSelectedLocation(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-sm text-slate-600 flex justify-between">
                    <span>{selectedLocation.loc}</span>
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200">
                        {selectedLocation.lat}, {selectedLocation.lng}
                    </span>
                </div>
                <div className="h-[400px] w-full relative z-0">
                    <MapContainer
                        center={[selectedLocation.lat, selectedLocation.lng]}
                        zoom={13}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                            <Popup>
                                <div className="text-sm font-semibold">{selectedLocation.name}</div>
                                <div className="text-xs text-slate-500">{selectedLocation.loc}</div>
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
