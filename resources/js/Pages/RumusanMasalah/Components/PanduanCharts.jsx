import React from 'react';

export default function PanduanCharts({ loading }) {
    return (
        <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-500/10 p-8">
                <h2 className="lg:text-2xl text-xl font-bold mb-4 flex items-center gap-3">
                    Aliran Keterhubungan
                </h2>
                <p className="text-gray-600 mb-8">Visualisasi keterkaitan antara Topik Riset dengan 8 Bidang Strategis.</p>

                {loading ? (
                    <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-xl animate-pulse">
                        <p className="text-gray-400">Memuat Visualisasi...</p>
                    </div>
                ) : (
                    <div id="sankey-wrapper" className="overflow-x-auto">
                        <div id="sankey-desktop" className="hidden lg:block w-full"></div>
                        <div id="sankey-mobile" className="block lg:hidden w-full"></div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-500/10 p-8">
                <h2 className="lg:text-2xl text-xl font-bold mb-4 flex items-center gap-3">
                    Pemetaan Kepadatan Riset
                </h2>
                <p className="text-gray-600 mb-8">Heatmap yang menunjukkan konsentrasi rumusan masalah per bidang.</p>

                {loading ? (
                    <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-xl animate-pulse">
                        <p className="text-gray-400">Memuat Heatmap...</p>
                    </div>
                ) : (
                    <div id="heatmap-wrapper" className="overflow-x-auto">
                        <div id="heatmap-desktop" className="hidden lg:block w-full min-h-[800px]"></div>
                        <div id="heatmap-mobile" className="block lg:hidden w-full min-h-[600px]"></div>
                    </div>
                )}
            </div>
        </>
    );
}
