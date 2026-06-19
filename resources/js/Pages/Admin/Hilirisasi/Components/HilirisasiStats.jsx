import React from 'react';

export default function HilirisasiStats({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total Hilirisasi</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800">{(stats?.total ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Dengan Koordinat</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800">{(stats?.withCoordinates ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
