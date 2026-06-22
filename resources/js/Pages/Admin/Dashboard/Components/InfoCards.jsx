import React from 'react';

export default function InfoCards({ liveStats }) {
    return (
        <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-blue-600 font-bold">📊</span> Ringkasan Data
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="py-2 border-b lg:border-b-0 lg:border-r border-slate-100 pr-4">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">Total Riset</span>
                        <span className="text-2xl font-bold text-slate-900">
                            {((liveStats?.penelitian || 0) + (liveStats?.pengabdian || 0) + (liveStats?.hilirisasi || 0)).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="py-2 border-b lg:border-b-0 lg:border-r border-slate-100 pr-4">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">Total Produk</span>
                        <span className="text-2xl font-bold text-slate-900">
                            {(liveStats?.produk || 0).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="py-2 border-b lg:border-b-0 lg:border-r border-slate-100 pr-4">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">Fasilitas Lab</span>
                        <span className="text-2xl font-bold text-slate-900">
                            {(liveStats?.fasilitas || 0).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="py-2 border-b lg:border-b-0 lg:border-r border-slate-100 pr-4">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">Permasalahan</span>
                        <span className="text-2xl font-bold text-slate-900">
                            {((liveStats?.permasalahan_prov || 0) + (liveStats?.permasalahan_kab || 0)).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="py-2">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">Rumusan Masalah</span>
                        <span className="text-2xl font-bold text-slate-900">
                            {(liveStats?.rumusan_masalah_category || 0).toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
