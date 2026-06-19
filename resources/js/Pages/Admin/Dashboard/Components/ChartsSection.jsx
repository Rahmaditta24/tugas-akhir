import React from 'react';
import MinimalBarChart from '@/Components/Charts/MinimalBarChart';
import MinimalDonutChart from '@/Components/Charts/MinimalDonutChart';
import { pieColors, labelJenis } from '../Constants/dashboardConstants';

export default function ChartsSection({ 
    loading, 
    lastUpdated, 
    chartData, 
    permasalahanData, 
    liveStats, 
    breakdown 
}) {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="glass-card rounded-xl p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Distribusi Data</h3>
                        <span className="text-xs text-slate-500">Terakhir diperbarui: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('id-ID') : '-'}</span>
                    </div>
                    <div style={{ width: '100%', height: 280 }}>
                        {loading ? (
                            <div className="h-full w-full rounded bg-slate-200 animate-pulse" />
                        ) : (
                            <MinimalBarChart
                                data={chartData}
                                xKey="name"
                                series={[{ key: 'value', name: 'Jumlah', color: '#3b82f6' }]}
                                height={280}
                            />
                        )}
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Permasalahan (Prov vs Kab)</h3>
                    <div style={{ width: '100%', height: 280 }}>
                        {loading ? (
                            <div className="h-full w-full rounded bg-slate-200 animate-pulse" />
                        ) : ((liveStats?.permasalahan_prov || 0) + (liveStats?.permasalahan_kab || 0) === 0) ? (
                            <div className="h-full w-full flex items-center justify-center text-slate-500">
                                <div className="text-center">
                                    <div className="mb-2">⚠️</div>
                                    <p>Tidak ada data permasalahan</p>
                                </div>
                            </div>
                        ) : (
                            <MinimalDonutChart data={permasalahanData} valueKey="value" nameKey="name" colors={pieColors} height={280} />
                        )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: pieColors[0] }} />
                            <span>Provinsi</span>
                            <span className="ml-auto font-semibold text-slate-900">{(liveStats?.permasalahan_prov || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: pieColors[1] }} />
                            <span>Kabupaten</span>
                            <span className="ml-auto font-semibold text-slate-900">{(liveStats?.permasalahan_kab || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Permasalahan per Sektor</h3>
                    <span className="text-xs text-slate-500">Ringkasan per jenis</span>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    {loading || !breakdown ? (
                        <div className="h-full w-full rounded bg-slate-200 animate-pulse" />
                    ) : (
                        <MinimalBarChart
                            data={Object.keys(breakdown).map((k) => ({
                                name: labelJenis(k),
                                total: breakdown[k]?.total || 0,
                                provinsi: breakdown[k]?.provinsi || 0,
                                kabupaten: breakdown[k]?.kabupaten || 0,
                            }))}
                            xKey="name"
                            series={[
                                { key: 'provinsi', name: 'Provinsi', color: '#3b82f6', stackId: 'a' },
                                { key: 'kabupaten', name: 'Kabupaten', color: '#f59e0b', stackId: 'a' },
                            ]}
                            height={300}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
