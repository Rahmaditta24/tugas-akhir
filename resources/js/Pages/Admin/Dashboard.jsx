import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard({ stats = {} }) {
    const statsCards = [
        {
            title: 'Total Penelitian',
            value: stats.penelitian || 0,
            icon: '🔬',
            color: 'blue',
            href: '/admin/penelitian'
        },
        {
            title: 'Total Pengabdian',
            value: stats.pengabdian || 0,
            icon: '🤝',
            color: 'green',
            href: '/admin/pengabdian'
        },
        {
            title: 'Total Hilirisasi',
            value: stats.hilirisasi || 0,
            icon: '🏭',
            color: 'purple',
            href: '/admin/hilirisasi'
        },
        {
            title: 'Total Produk',
            value: stats.produk || 0,
            icon: '📦',
            color: 'orange',
            href: '/admin/produk'
        },
        {
            title: 'Fasilitas Lab',
            value: stats.fasilitas || 0,
            icon: '🧪',
            color: 'teal',
            href: '/admin/fasilitas-lab'
        },
        {
            title: 'Permasalahan (Prov)',
            value: stats.permasalahan_prov || 0,
            icon: '⚠️',
            color: 'red',
            href: '/admin/permasalahan'
        },
        {
            title: 'Permasalahan (Kab)',
            value: stats.permasalahan_kab || 0,
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
        <AdminLayout title="Dashboard">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {statsCards.map((card, index) => (
                    <Link
                        key={index}
                        href={card.href}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 mb-2">
                                    {card.title}
                                </p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {card.value.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                                <span className="text-2xl">{card.icon}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Aksi Cepat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/admin/penelitian"
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex items-center gap-4"
                    >
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Tambah Penelitian</p>
                            <p className="text-sm text-slate-600">Buat data penelitian baru</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/pengabdian"
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex items-center gap-4"
                    >
                        <div className="p-3 bg-green-50 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Tambah Pengabdian</p>
                            <p className="text-sm text-slate-600">Buat data pengabdian baru</p>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        target="_blank"
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex items-center gap-4"
                    >
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Lihat Website</p>
                            <p className="text-sm text-slate-600">Buka peta interaktif</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan Data</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600">Total semua data riset</span>
                            <span className="font-semibold text-slate-900">
                                {((stats.penelitian || 0) + (stats.pengabdian || 0) + (stats.hilirisasi || 0)).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600">Total produk & fasilitas</span>
                            <span className="font-semibold text-slate-900">
                                {((stats.produk || 0) + (stats.fasilitas || 0)).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600">Total permasalahan</span>
                            <span className="font-semibold text-slate-900">
                                {((stats.permasalahan_prov || 0) + (stats.permasalahan_kab || 0)).toLocaleString('id-ID')}
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


