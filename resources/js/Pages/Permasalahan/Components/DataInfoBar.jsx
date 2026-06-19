import React from 'react';

export default function DataInfoBar({ filters }) {
    const getSumberData = (dataType) => {
        switch (dataType) {
            case 'Sampah': return 'Kementerian Lingkungan Hidup 2024';
            case 'Stunting': return 'SSGI 2024 Kementerian Kesehatan';
            case 'Gizi Buruk': return 'SSGI 2024 Kementerian Kesehatan';
            case 'Krisis Listrik': return 'Statistik PLN 2024';
            case 'Ketahanan Pangan': return 'Peta Ketahanan & Kerentanan Pangan Indonesai (FSVA) 2024';
            default: return 'Kementerian Terkait';
        }
    };

    return (
        <div className="w-full lg:max-w-[90%] mx-auto mt-4 px-4 py-3 bg-[#f8fbff] border border-blue-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-2 shadow-sm text-sm">
            <div className="space-y-1">
                <p className="text-gray-700">
                    <span className="font-bold text-gray-900">Data Dipilih:</span> {filters.dataType}
                </p>
                <p className="text-gray-700">
                    <span className="font-bold text-gray-900">Jenis Bubble Dipilih:</span> {filters.bubbleType}
                    {filters.bubbleType === 'Pengabdian' && (
                        <>
                            {filters.skema && ` (${Array.isArray(filters.skema) ? filters.skema.join(', ') : filters.skema})`}
                            {filters.batch_type && ` (${Array.isArray(filters.batch_type) ? filters.batch_type.join(', ') : filters.batch_type})`}
                        </>
                    )}
                    {filters.bubbleType === 'Hilirisasi' && filters.skema && ` (${Array.isArray(filters.skema) ? filters.skema.join(', ') : filters.skema})`}
                </p>
            </div>
            <div className="text-gray-700 font-medium">
                <span className="font-bold text-gray-900">Sumber Data:</span> {getSumberData(filters.dataType)}
            </div>
        </div>
    );
}
