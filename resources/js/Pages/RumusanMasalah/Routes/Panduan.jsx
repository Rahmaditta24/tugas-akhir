import React from 'react';
import { Head, Link } from '@inertiajs/react';

import usePanduan from '../Hooks/usePanduan';
import MainLayout from '../../../Layouts/MainLayout';
import NavigationTabs from '../../../Components/NavigationTabs';
import { FloatingButton } from '../Components/Sidebars';

import PanduanIntro from '../Components/PanduanIntro';
import PanduanCharts from '../Components/PanduanCharts';
import PanduanExamples from '../Components/PanduanExamples';
import PanduanSteps from '../Components/PanduanSteps';

export default function Panduan({ categories }) {
    const { loading, sidebarOpen, setSidebarOpen, currentCategories } = usePanduan({ categories });

    return (
        <MainLayout
            title="Panduan Rumusan Masalah 8 Industri Strategis (Beta)"
            headerTitle={<>Rumusan Masalah 8 Industri Strategis <span className="font-normal text-gray-800">(Beta)</span></>}
        >
            <Head title="Panduan Rumusan Masalah" />
            
            <NavigationTabs activePage="rumusan-masalah" />

            <FloatingButton onClick={() => setSidebarOpen(true)} />

            {/* Overlay Drawer Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Konten Drawer Mobile */}
            <div className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-800">Navigasi Bidang</h2>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <Link
                        href="/rumusan-masalah"
                        className="p-3 bg-[#4285f4] text-white font-bold text-center rounded-lg mb-6 shadow-md hover:bg-blue-600 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Lihat Panduan
                    </Link>

                    <div className="space-y-1">
                        {currentCategories && currentCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/rumusan-masalah#${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2"
                            >
                                <img
                                    src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/storage/${category.image}`}
                                    alt={category.name}
                                    className="w-8 h-8 object-contain"
                                />
                                <span className="text-[14px] text-gray-700 font-medium">{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-10 mt-6 lg:px-0 px-4">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Kiri (Desktop Only) */}
                    <div className="hidden lg:block w-full lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                            <Link
                                href="/rumusan-masalah"
                                className="p-3 bg-[#3374cd] text-white font-bold text-center text-lg block hover:bg-blue-700 transition-colors"
                            >
                                Kembali ke Data
                            </Link>
                            <div className="flex flex-col py-1">
                                {currentCategories && currentCategories.length > 0 ? (
                                    currentCategories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/rumusan-masalah#${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 rounded-md mx-2 mb-1 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent"
                                        >
                                            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                                                {category.image ? (
                                                    <img
                                                        src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/storage/${category.image}`}
                                                        alt={category.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>'; }}
                                                    />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                )}
                                            </div>
                                            <span className="text-[14px] text-gray-700 font-medium">{category.name}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-4 bg-blue-50/50">
                                        <ul className="space-y-4">
                                            {/* (Daftar hardcoded cadangan jika prop categories tidak ada) */}
                                            {['Kesehatan', 'Pangan', 'Energi', 'Maritim', 'Pertahanan', 'Digitalisasi: AI & Semikonduktor', 'Manufaktur & Material Maju', 'Hilirisasi & Industrialisasi'].map((f, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">{i + 1}</div>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Konten Kanan */}
                    <div className="w-full lg:w-3/4 space-y-12">
                        <PanduanIntro />
                        <PanduanCharts loading={loading} />
                        <PanduanExamples />
                        <PanduanSteps />
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
