import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard({ stats = {} }) {
    const cards = [
        { title: 'Penelitian', value: stats.penelitian },
        { title: 'Hilirisasi', value: stats.hilirisasi },
        { title: 'Pengabdian', value: stats.pengabdian },
        { title: 'Produk', value: stats.produk },
        { title: 'Fasilitas Lab', value: stats.fasilitas },
        { title: 'Permasalahan Prov', value: stats.permasalahan_prov },
        { title: 'Permasalahan Kab', value: stats.permasalahan_kab },
    ];

    return (
        <AdminLayout title="Admin Dashboard">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((c, i) => (
                    <div key={i} className="bg-white border rounded p-4">
                        <div className="text-sm text-slate-600">{c.title}</div>
                        <div className="text-2xl font-semibold">{(c.value || 0).toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border rounded p-4 h-64">Grafik per provinsi (coming soon)</div>
                <div className="bg-white border rounded p-4 h-64">Grafik per bidang (coming soon)</div>
            </div>
        </AdminLayout>
    );
}


