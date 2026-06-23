import React from 'react';
import { Link } from '@inertiajs/react';

export const FloatingButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="lg:hidden fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#3374cd] text-white p-3 rounded-l-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center group"
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    </button>
);

export const MobileSidebar = ({ isOpen, onClose, categories, selectedCategory, onCategoryClick }) => {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}
            <div className={`fixed top-0 right-0 h-full w-[300px] bg-white z-[60] transform transition-transform duration-300 ease-in-out lg:hidden shadow-[-4px_0_20px_rgba(0,0,0,0.1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-0 flex flex-col h-full">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-800 text-lg">Pilih Bidang</h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all"
                            aria-label="Tutup menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                        <Link
                            href="/rumusan-masalah/panduan"
                            className="w-full p-4 bg-[#4285f4] text-white font-bold text-center px-5 rounded-xl mb-6 shadow-md hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group"
                        >
                            <span>Lihat Panduan</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </Link>

                        <div className="space-y-1">
                                {categories && categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => onCategoryClick(category)}
                                    className={`w-full flex items-center justify-start text-left gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-all ${selectedCategory?.id === category.id ? 'bg-blue-50 font-bold' : ''}`}
                                >
                                    <img
                                        src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/storage/${category.image}`}
                                        alt={category.name}
                                        className="w-8 h-8 object-contain shrink-0"
                                    />
                                    <span className="text-[14px] text-gray-700 font-medium text-left leading-tight">{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const DesktopSidebar = ({ categories, selectedCategory, onCategoryClick }) => {
    return (
        <div className="hidden lg:block w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                <Link
                    href="/rumusan-masalah/panduan"
                    className="p-3 bg-[#3374cd] text-white font-bold text-center px-5 text-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                    Lihat Panduan
                </Link>
                <div className="flex flex-col py-1">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onCategoryClick(category)}
                            className={`flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 rounded-md mx-2 mb-1 ${selectedCategory?.id === category.id
                                ? 'bg-blue-50 font-bold text-gray-900'
                                : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent'
                                }`}
                        >
                            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
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
    );
};
