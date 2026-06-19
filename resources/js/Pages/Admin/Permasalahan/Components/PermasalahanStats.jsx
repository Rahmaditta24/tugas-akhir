import React from 'react';

export default function PermasalahanStats({ baseData, stats, isStatsLoading }) {
    if (!['statistik', 'penelitian', 'pengabdian', 'hilirisasi'].includes(baseData)) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 12h18M3 19h18" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider truncate">
                            {baseData === 'statistik' ? 'Total Provinsi' : 'Total Institusi'}
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-slate-800">
                            {isStatsLoading ? '...' : (baseData === 'statistik' ? (stats.totalProvinsi || 0).toLocaleString('id-ID') : (stats.totalInstitusi || 0).toLocaleString('id-ID'))}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider truncate">
                            {baseData === 'statistik' ? 'Total Kabupaten' : 'Total Provinsi'}
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-slate-800">
                            {isStatsLoading ? '...' : (baseData === 'statistik' ? (stats.totalKabupaten || 0).toLocaleString('id-ID') : (stats.totalProvinsi || 0).toLocaleString('id-ID'))}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider truncate">Total Data</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-800">
                            {isStatsLoading ? '...' : (stats.total || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
