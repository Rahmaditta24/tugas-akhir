import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function NavigationTabs({ activePage = 'penelitian' }) {
    const [openDropdown, setOpenDropdown] = useState(null);

    const tabs = [
        { name: 'Penelitian', url: '/', key: 'penelitian' },
        { name: 'Pengabdian', url: '/pengabdian', key: 'pengabdian' },
        { name: 'Hilirisasi', url: '/hilirisasi', key: 'hilirisasi' },
        { name: 'Produk', url: '/produk', key: 'produk' },
        { name: 'Fasilitas Lab', url: '/fasilitas-lab', key: 'fasilitas-lab' },
        {
            name: 'Permasalahan',
            key: 'permasalahan-group',
            items: [
                { name: 'Permasalahan', url: '/permasalahan', key: 'permasalahan' },
                { name: 'Rumusan Masalah', url: '/rumusan-masalah', key: 'rumusan-masalah' },
            ]
        },
    ];

    const toggleDropdown = (key) => {
        setOpenDropdown(openDropdown === key ? null : key);
    };

    return (
        <div className="flex justify-center flex-wrap gap-3 mb-2">
            {tabs.map((tab) => {
                // Check if this tab is a dropdown group
                if (tab.items) {
                    // Check if any child is currently active
                    const isActive = tab.items.some(t => t.key === activePage);

                    return (
                        <div key={tab.key} className="relative flex-1 min-w-[140px] max-w-[150px]">
                            <button
                                onClick={() => toggleDropdown(tab.key)}
                                className={`w-full h-full flex items-center justify-between px-4 py-2 rounded-lg font-semibold text-center lg:text-sm text-xs transition-colors ${isActive
                                        ? 'bg-yellow-400 text-black'
                                        : 'bg-[#3E7DCA] text-white hover:bg-blue-900'
                                    }`}
                            >
                                <span className="flex-1">{tab.name}</span>
                                <svg
                                    className={`w-4 h-4 transform transition-transform duration-200 ${openDropdown === tab.key ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {openDropdown === tab.key && (
                                <>
                                    {/* Overlay for closing when clicking outside */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setOpenDropdown(null)}
                                    />
                                    <div className="absolute top-full text-left left-0 w-[120%] -ml-[10%] mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100">
                                        {tab.items.map((item) => (
                                            <Link
                                                key={item.key}
                                                href={item.url}
                                                onClick={() => setOpenDropdown(null)}
                                                className={`block px-4 py-3 text-sm transition-colors ${activePage === item.key
                                                        ? 'bg-gray-50 text-blue-700 font-bold'
                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                                    }`}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                }

                // Regular Tab
                return (
                    <Link
                        key={tab.key}
                        href={tab.url}
                        className={`flex-1 min-w-[140px] max-w-[150px] lg:text-sm text-xs px-4 py-2 rounded-lg font-semibold text-center flex items-center justify-center ${activePage === tab.key
                                ? 'bg-yellow-400 text-black'
                                : 'bg-[#3E7DCA] text-white hover:bg-blue-900'
                            }`}
                    >
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
