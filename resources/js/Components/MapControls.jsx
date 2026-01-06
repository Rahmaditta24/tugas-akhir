import React, { useState } from 'react';

export default function MapControls({
    onSearch,
    onDisplayModeChange,
    onReset,
    onDownload,
    displayMode = 'peneliti',
    filters = {},
    filterOptions = {},
    onFilterChange = () => { },
    searchTerm = ''
}) {
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        onSearch(value);
    };

    const handleFilterSelect = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'Semua' || value === '') {
            delete newFilters[key];
        }
        onFilterChange(newFilters);
    };

    const filterFields = [
        { label: 'Bidang Fokus', requestKey: 'bidang_fokus', optionKey: 'bidangFokus' },
        { label: 'Tema Prioritas', requestKey: 'tema_prioritas', optionKey: 'temaPrioritas' },
        { label: 'Kategori PT', requestKey: 'kategori_pt', optionKey: 'kategoriPT' },
        { label: 'Klaster', requestKey: 'klaster', optionKey: 'klaster' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    return (
        <>
            {/* Search Box - Positioned over map */}
            <div className="absolute z-20 top-5 left-1/2 -translate-x-1/2 lg:w-1/2 w-full">
                <div className="relative w-full pl-12 pr-3">
                    <svg
                        className="absolute left-14 top-2 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 11.5a7.5 7.5 0 1 1-15 0a7.5 7.5 0 0 1 15 0m-2.107 5.42l3.08 3.08"
                        />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Cari penelitian, universitas, atau peneliti..."
                        className="w-full pl-9 lg:w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Advanced Search Panel */}
            {isAdvancedSearchOpen && (
                <div className="absolute z-30 bottom-20 left-1/2 -translate-x-1/2 w-[95%] lg:w-2/3 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 animate-fade-in-up border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filterFields.map((field) => (
                            <div key={field.requestKey} className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                                <div className="relative">
                                    <select
                                        value={filters[field.requestKey] || ''}
                                        onChange={(e) => handleFilterSelect(field.requestKey, e.target.value)}
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <option value="">Semua</option>
                                        {filterOptions[field.optionKey] && filterOptions[field.optionKey].map((option, idx) => (
                                            <option key={idx} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Control Buttons - Positioned at bottom of map */}
            <div className="absolute z-20 bottom-5 left-1/2 -translate-x-1/2 lg:w-auto w-full px-3 lg:px-0 whitespace-nowrap overflow-x-auto max-w-full">
                <div className="flex items-center gap-2 lg:gap-3 px-2">
                    {/* Peneliti Button */}
                    <button
                        onClick={() => onDisplayModeChange('peneliti')}
                        className={`flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm ${displayMode === 'peneliti'
                            ? 'bg-[#FFD700] text-black ring-2 ring-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19zM12 3C6.48 3 2 7.48 2 13c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 18.53 4 15.96 4 13c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.96-1.61 5.53-4 6.92l1 1.73c2.99-1.73 5-4.95 5-8.65c0-5.52-4.48-10-8-10z" />
                        </svg>
                        Peneliti
                    </button>

                    {/* Institusi Button */}
                    <button
                        onClick={() => onDisplayModeChange('institusi')}
                        className={`flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm ${displayMode === 'institusi'
                            ? 'bg-[#3E7DCA] text-white ring-2 ring-white'
                            : 'bg-[#3E7DCA] text-white hover:brightness-110'
                            }`}
                        title="Tampilkan Data Institusi"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2.48-1.35L12 3zm6 9.64l-3 1.64v-3.72l3-1.63v3.71zm-9 1.64l-3-1.64v-3.71l3 1.63v3.72zm0-5.36l-3-1.63l3-1.64l3 1.64l-3 1.63zM12 5.09l3 1.64l-3 1.63l-3-1.63l3-1.64z" />
                        </svg>
                        Institusi
                    </button>

                    {/* Advanced Search Button */}
                    <button
                        onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                        className={`flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm ${isAdvancedSearchOpen ? 'bg-gray-100 text-gray-900 border-2 border-gray-300' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                        </svg>
                        Advanced Search
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            className={`transition-transform duration-200 ${isAdvancedSearchOpen ? 'rotate-180' : ''}`}
                        >
                            <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z" />
                        </svg>
                    </button>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-600 hover:bg-gray-100 shadow-sm transition-all"
                        title="Reset Filter"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                        </svg>
                    </button>

                    {/* Download Excel Button */}
                    <button
                        onClick={onDownload}
                        className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-full font-bold bg-[#1D6F42] text-white hover:bg-[#185e37] transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                            </path>
                        </svg>
                        Excel
                    </button>
                </div>
            </div>
        </>
    );
}
