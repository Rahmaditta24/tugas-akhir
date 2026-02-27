import React, { useState, useEffect } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import NavigationTabs from '../../Components/NavigationTabs';
import { Head, Link } from '@inertiajs/react';

export default function RumusanMasalahIndex({ categories }) {
    // State untuk kategori yang sedang dipilih, default ke yang pertama (order_number 1)
    const [selectedCategory, setSelectedCategory] = useState(
        categories.length > 0 ? categories[0] : null
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Update selected category if categories prop changes
    useEffect(() => {
        if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0]);
        }
    }, [categories]);

    // Handle klik kategori
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    return (
        <MainLayout
            title="Rumusan Masalah 8 Industri Strategis (Beta)"
            headerTitle={<>Rumusan Masalah 8 Industri Strategis <span className="font-normal text-gray-800">(Beta)</span></>}
        >
            <Head title="Rumusan Masalah" />


            <NavigationTabs activePage="rumusan-masalah" />



            {/* Tombol Floating Mobile - Muncul di kanan tengah */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#3374cd] text-white p-3 rounded-l-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            {/* Mobile Drawer Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Drawer Content */}
            <div className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-800">Pilih Bidang</h2>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <Link
                        href="/rumusan-masalah/panduan"
                        className="p-3 bg-[#4285f4] text-white font-bold text-center rounded-lg mb-6 shadow-md hover:bg-blue-600 transition-colors"
                    >
                        Lihat Panduan
                    </Link>

                    <div className="space-y-1">
                        {categories && categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    handleCategoryClick(category);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-all ${selectedCategory?.id === category.id ? 'bg-blue-50 font-bold' : ''}`}
                            >
                                <img
                                    src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/storage/${category.image}`}
                                    alt={category.name}
                                    className="w-8 h-8 object-contain"
                                />
                                <span className="text-[14px] text-gray-700 font-medium">{category.name}</span>
                            </button>
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
                                href="/rumusan-masalah/panduan"
                                className="p-3 bg-[#3374cd] text-white font-bold text-center text-lg block hover:bg-blue-700 transition-colors"
                            >
                                Lihat Panduan
                            </Link>
                            <div className="flex flex-col py-1">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category)}
                                        className={`flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 rounded-md mx-2 mb-1 ${selectedCategory?.id === category.id
                                            ? 'bg-blue-50 font-bold text-gray-900'
                                            : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent'
                                            }`}
                                    >
                                        <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                                            {/* Fix image rendering: use direct storage path if simple filename, or full path logic */}
                                            {category.image ? (
                                                <img
                                                    src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/storage/${category.image}`}
                                                    alt={category.name}
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-2 h-2 bg-gray-300 rounded-full"></div>'; }}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            )}
                                        </div>
                                        <span className="text-[15px] text-gray-700 font-medium">{category.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Konten Kanan - Detail Rumusan Masalah */}
                    <div className="w-full lg:w-3/4">
                        {selectedCategory ? (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                    {selectedCategory.order_number}. Rumusan Masalah {selectedCategory.name}
                                </h2>

                                <div className="space-y-6">
                                    {selectedCategory.statements && selectedCategory.statements.length > 0 ? (
                                        selectedCategory.statements.map((statement, index) => (
                                            <div key={statement.id} className="relative pl-0">
                                                {/* Header Bar */}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex-shrink-0 w-9 h-9 bg-[#3E7DCA] text-white rounded-md flex items-center justify-center font-bold text-sm shadow-sm">
                                                        {statement.full_number}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                                                            {statement.title}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* Description Box */}
                                                <div className="ml-12 bg-gray-50/80 rounded-lg p-5 border border-gray-100 text-gray-600 leading-relaxed text-[14px] text-justify shadow-sm">
                                                    {statement.description}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500 italic">
                                            Belum ada data rumusan masalah untuk kategori ini.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">Pilih kategori untuk melihat rumusan masalah</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
