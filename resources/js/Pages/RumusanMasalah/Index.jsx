import React, { useState, useEffect } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import NavigationTabs from '../../Components/NavigationTabs';
import { Head } from '@inertiajs/react';

export default function RumusanMasalahIndex({ categories }) {
    // State untuk kategori yang sedang dipilih, default ke yang pertama (order_number 1)
    const [selectedCategory, setSelectedCategory] = useState(
        categories.length > 0 ? categories[0] : null
    );

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
        <MainLayout title="Dashboard Pemetaan Riset - Rumusan Masalah">
            <Head title="Rumusan Masalah" />

            <NavigationTabs activePage="rumusan-masalah" />

            <div className="w-full lg:max-w-[90%] w-full mx-auto mb-10 mt-6">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Kiri - Daftar Kategori */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                            <div className="p-3 bg-[#3374cd] text-white font-bold text-center text-lg">
                                Lihat Panduan
                            </div>
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
                                                <div className="flex items-start gap-4 mb-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-[#3E7DCA] text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm mt-1">
                                                        {statement.full_number}
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <h3 className="text-lg font-bold text-gray-900 leading-snug">
                                                            {statement.title}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* Description Box */}
                                                <div className="ml-14 bg-gray-50 rounded-lg p-5 border border-gray-100 text-gray-700 leading-relaxed text-md text-justify">
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
