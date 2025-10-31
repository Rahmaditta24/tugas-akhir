import React from 'react';
import { Link } from '@inertiajs/react';

export default function NavigationTabs({ activePage = 'penelitian' }) {
    const tabs = [
        { name: 'Penelitian', url: '/', key: 'penelitian' },
        { name: 'Pengabdian', url: '/pengabdian', key: 'pengabdian' },
        { name: 'Hilirisasi', url: '/hilirisasi', key: 'hilirisasi' },
        { name: 'Produk', url: '/produk', key: 'produk' },
        { name: 'Fasilitas Lab', url: '/fasilitas-lab', key: 'fasilitas-lab' },
        { name: 'Permasalahan', url: '/permasalahan', key: 'permasalahan' },
    ];

    return (
        <div className="flex justify-center flex-wrap gap-3 mb-2">
            {tabs.map((tab) => (
                <Link
                    key={tab.key}
                    href={tab.url}
                    className={`flex-1 min-w-[140px] max-w-[150px] lg:text-sm text-xs px-4 py-2 rounded-lg font-semibold ${
                        activePage === tab.key
                            ? 'bg-yellow-400 text-black'
                            : 'bg-[#3E7DCA] text-white hover:bg-blue-900'
                    }`}
                >
                    {tab.name}
                </Link>
            ))}
        </div>
    );
}
