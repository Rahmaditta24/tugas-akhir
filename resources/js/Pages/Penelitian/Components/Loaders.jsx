import React from 'react';

export const MapLoading = () => (
    <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
        <div className="text-gray-400 font-medium">Memuat peta...</div>
    </div>
);

export const ListLoading = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
        ))}
    </div>
);
