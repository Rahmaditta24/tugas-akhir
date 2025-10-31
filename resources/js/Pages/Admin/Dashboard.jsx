import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import PageHeader from '../../Components/PageHeader';
import Sparkline from '../../Components/Sparkline';
import { ResponsiveContainer, Cell } from 'recharts';
import MinimalBarChart from '../../Components/Charts/MinimalBarChart';
import MinimalDonutChart from '../../Components/Charts/MinimalDonutChart';

export default function Dashboard({ stats = {} }) {
    const [liveStats, setLiveStats] = useState(stats);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trend, setTrend] = useState([]); // simple in-memory points for sparkline
    const [breakdown, setBreakdown] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats', { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted) {
                    setLiveStats(data);
                    setLastUpdated(data.timestamp || new Date().toISOString());
                    setLoading(false);
                    setTrend((prev) => {
                        const next = [...prev, (data.penelitian || 0) + (data.pengabdian || 0) + (data.hilirisasi || 0)];
                        return next.slice(-12); // keep last 12 points
                    });
                }
            } catch (_) {}
        }
        async function fetchBreakdown() {
            try {
                const res = await fetch('/api/admin/permasalahan-breakdown', { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted) setBreakdown(data.data || {});
            } catch (_) {}
        }
        fetchStats();
        fetchBreakdown();
        const id = setInterval(fetchStats, 30000); // 30s polling, no worker
        const id2 = setInterval(fetchBreakdown, 60000);
        return () => { isMounted = false; clearInterval(id); clearInterval(id2); };
    }, []);

    const chartData = useMemo(() => ([
        { name: 'Penelitian', value: liveStats.penelitian || 0 },
        { name: 'Pengabdian', value: liveStats.pengabdian || 0 },
        { name: 'Hilirisasi', value: liveStats.hilirisasi || 0 },
        { name: 'Produk', value: liveStats.produk || 0 },
        { name: 'Fasilitas', value: liveStats.fasilitas || 0 },
    ]), [liveStats]);

    const permasalahanData = useMemo(() => ([
        { name: 'Provinsi', value: liveStats.permasalahan_prov || 0 },
        { name: 'Kabupaten', value: liveStats.permasalahan_kab || 0 },
    ]), [liveStats]);

    const barColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#14b8a6'];
    const pieColors = ['#ef4444', '#f59e0b'];
    const statsCards = [
        {
            title: 'Total Penelitian',
            value: liveStats.penelitian || 0,
            icon: '🔬',
            color: 'blue',
            href: '/admin/penelitian'
        },
        {
            title: 'Total Pengabdian',
            value: liveStats.pengabdian || 0,
            icon: '🤝',
            color: 'green',
            href: '/admin/pengabdian'
        },
        {
            title: 'Total Hilirisasi',
            value: liveStats.hilirisasi || 0,
            icon: '🏭',
            color: 'purple',
            href: '/admin/hilirisasi'
        },
        {
            title: 'Total Produk',
            value: liveStats.produk || 0,
            icon: '📦',
            color: 'orange',
            href: '/admin/produk'
        },
        {
            title: 'Fasilitas Lab',
            value: liveStats.fasilitas || 0,
            icon: '🧪',
            color: 'teal',
            href: '/admin/fasilitas-lab'
        },
        {
            title: 'Permasalahan (Prov)',
            value: liveStats.permasalahan_prov || 0,
            icon: '⚠️',
            color: 'red',
            href: '/admin/permasalahan'
        },
        {
            title: 'Permasalahan (Kab)',
            value: liveStats.permasalahan_kab || 0,
            icon: '⚠️',
            color: 'yellow',
            href: '/admin/permasalahan'
        },
    ];

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700',
        orange: 'bg-orange-50 text-orange-700',
        teal: 'bg-teal-50 text-teal-700',
        red: 'bg-red-50 text-red-700',
        yellow: 'bg-yellow-50 text-yellow-700',
    };

    return (
        <AdminLayout title="">
            <PageHeader
                title="Dashboard"
                subtitle="Statistik terkini dan ringkasan aktivitas"
                icon={<span className="text-xl">📊</span>}
            />
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {statsCards.map((card, index) => (
                    <Link
                        key={index}
                        href={card.href}
                        className="glass-card rounded-xl hover:shadow-lg transition-all p-6 block"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 mb-2">
                                    {card.title}
                                </p>
                                {loading ? (
                                    <div className="h-8 w-32 rounded bg-slate-200 animate-pulse" />
                                ) : (
                                    <p className="text-3xl font-bold text-slate-900">
                                        {card.value.toLocaleString('id-ID')}
                                    </p>
                                )}
                                <div className="mt-2">
                                    <Sparkline points={trend} width={120} height={24} color="#3b82f6" />
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                                <span className="text-2xl">{card.icon}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts */}
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
                        ) : ((liveStats.permasalahan_prov || 0) + (liveStats.permasalahan_kab || 0) === 0) ? (
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
                            <span className="ml-auto font-semibold text-slate-900">{(liveStats.permasalahan_prov || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: pieColors[1] }} />
                            <span>Kabupaten</span>
                            <span className="ml-auto font-semibold text-slate-900">{(liveStats.permasalahan_kab || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problems by Sector */}
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

            {/* Quick Links removed as requested */}

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan Data</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600">Total semua data riset</span>
                            <span className="font-semibold text-slate-900">
                                {((liveStats.penelitian || 0) + (liveStats.pengabdian || 0) + (liveStats.hilirisasi || 0)).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600">Total produk & fasilitas</span>
                            <span className="font-semibold text-slate-900">
                                {((liveStats.produk || 0) + (liveStats.fasilitas || 0)).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600">Total permasalahan</span>
                            <span className="font-semibold text-slate-900">
                                {((liveStats.permasalahan_prov || 0) + (liveStats.permasalahan_kab || 0)).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Panduan</h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Gunakan menu sidebar untuk mengakses CRUD data setiap kategori</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Klik pada kartu statistik untuk langsung menuju halaman management data</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Setiap perubahan data akan langsung terlihat di peta interaktif</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>Pastikan data memiliki koordinat (latitude/longitude) yang valid</span>
                        </li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}

function labelJenis(key) {
    const map = {
        sampah: 'Sampah',
        stunting: 'Stunting',
        gizi_buruk: 'Gizi Buruk',
        krisis_listrik: 'Krisis Listrik',
        ketahanan_pangan: 'Ketahanan Pangan',
    };
    return map[key] || key;
}


