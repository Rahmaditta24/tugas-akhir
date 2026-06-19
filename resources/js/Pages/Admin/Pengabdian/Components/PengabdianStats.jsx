import React from 'react';

export default function PengabdianStats({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg sm:text-xl">📦</span>
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Multitahun, Batch I & II</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.batch?.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg sm:text-xl">🤝</span>
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Kosabangsa</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.kosabangsa?.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg sm:text-xl">📊</span>
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Total Semua</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.total?.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
