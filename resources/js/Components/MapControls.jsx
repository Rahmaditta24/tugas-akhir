import React, { useState, useEffect } from 'react';
import { titleCase } from '../Utils/format';

const FIELD_COLORS = {
    "Energi": "#FF5716",
    "Kebencanaan": "#ECCEAA",
    "Kemaritiman": "#00D0FF",
    "Kesehatan": "#FF2A64",
    "Material Maju": "#FFCC00",
    "Pangan": "#10B374",
    "Pertahanan dan Keamanan": "#1C4570",
    "Produk rekayasa keteknikan": "#FE272F",
    "Sosial Humaniora": "#A72184",
    "Teknologi Informasi dan Komunikasi": "#B39B77",
    "Transportasi": "#A578AE",
    "Riset Dasar Teoritis": "#96CEB4"
};


export default function MapControls({
    onSearch,
    onDisplayModeChange,
    onReset,
    onDownload,
    onDownloadSecondary,
    downloadLabel = 'Excel',
    downloadSecondaryLabel = 'Excel 2',
    displayMode = 'peneliti',
    filters = {},
    filterOptions = {},
    onFilterChange = () => { },
    searchTerm = '',
    filterFields: customFilterFields = [],
    hideDisplayMode = false, // Hide Peneliti/Institusi buttons
    hideDownload = false, // Hide Excel download button
    hideSearch = false, // Hide search bar
    showPermasalahanControls = false, // Show Hide Bubbles & Mode buttons
    showBubbles = true,
    onToggleBubbles = () => { },
    viewMode = 'provinsi',
    onViewModeChange = () => { },
    isLoading = false,
    gridClass = "grid-cols-1 md:grid-cols-2",
    widthClass = "w-[95%] lg:w-[40%]",
    hideFilterIcons = undefined,
    selectedMetrik = 'saidi',
    onMetrikChange = () => { }
}) {
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

    const [localSearch, setLocalSearch] = useState(searchTerm);

    useEffect(() => {
        setLocalSearch(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localSearch !== searchTerm) {
                onSearch(localSearch);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [localSearch]);

    const handleSearchChange = (e) => {
        setLocalSearch(e.target.value);
    };

    const handleFilterSelect = (key, value, isChecked, type = 'multi') => {
        if (type === 'single') {
            const newFilters = { ...filters };
            // For single select, we don't allow 'Semua' anymore based on requirement 
            // but we keep the logic flexible: if a value is passed, use it.
            if (value) {
                newFilters[key] = value;
            }
            onFilterChange(newFilters);
            setOpenDropdown(null);
            return;
        }

        const currentValues = Array.isArray(filters[key]) ? filters[key] : (filters[key] ? [filters[key]] : []);

        let newValues;
        if (isChecked) {
            newValues = [...currentValues, value];
        } else {
            newValues = currentValues.filter(v => v !== value);
        }

        const newFilters = { ...filters };
        if (newValues.length > 0) {
            newFilters[key] = newValues;
        } else {
            delete newFilters[key];
        }

        onFilterChange(newFilters);
    };

    const isSelected = (key, value) => {
        if (!filters[key]) return false;
        const values = Array.isArray(filters[key]) ? filters[key] : [filters[key]];
        return values.includes(value);
    };

    const getSelectedCount = (key, type = 'multi') => {
        if (!filters[key]) return 0;
        if (type === 'single') return 1;
        return Array.isArray(filters[key]) ? filters[key].length : 1;
    };

    const defaultFields = [
        { label: 'Bidang Fokus', requestKey: 'bidang_fokus', optionKey: 'bidangFokus' },
        { label: 'Tema Prioritas', requestKey: 'tema_prioritas', optionKey: 'temaPrioritas' },
        { label: 'Kategori PT', requestKey: 'kategori_pt', optionKey: 'kategoriPT' },
        { label: 'Klaster', requestKey: 'klaster', optionKey: 'klaster' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    const filterFields = customFilterFields.length > 0 ? customFilterFields : defaultFields;

    const [openDropdown, setOpenDropdown] = useState(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('.dropdown-container')) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    const renderField = (field) => {
        const isSingle = field.type === 'single';
        const selectedCount = getSelectedCount(field.requestKey, field.type);
        let buttonText = isSingle ? (filters[field.requestKey] || 'Pilih...') : 'Semua';
        if (!isSingle && selectedCount > 0) {
            if (selectedCount === 1) {
                const selectedValues = filters[field.requestKey] || [];
                buttonText = Array.isArray(selectedValues) ? selectedValues[0] : selectedValues;
            } else {
                buttonText = `${selectedCount} dipilih`;
            }
        }

        return (
            <div className="relative dropdown-container">
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === field.requestKey ? null : field.requestKey)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-[13px] text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-50 transition-colors flex items-center justify-between shadow-sm"
                >
                    <span className="text-gray-700 truncate mr-2 font-medium">
                        {titleCase(buttonText)}
                    </span>
                    <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdown === field.requestKey ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {openDropdown === field.requestKey && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-[999] max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                        {/* 'Semua' Toggle Option */}
                        {(() => {
                            const isAllSelected = !filters[field.requestKey] || (Array.isArray(filters[field.requestKey]) && filters[field.requestKey].length === 0);
                            const shoudHideIcon = field.hideIcon || (typeof hideFilterIcons !== 'undefined' && hideFilterIcons);

                            if (shoudHideIcon || field.hideAllOption) return null;

                            return (
                                <div
                                    onClick={() => {
                                        const newFilters = { ...filters };
                                        delete newFilters[field.requestKey];
                                        onFilterChange(newFilters);
                                        if (field.type === 'single') setOpenDropdown(null);
                                    }}
                                    className={`flex items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-gray-100 ${isAllSelected ? 'bg-blue-50/50' : ''}`}
                                >
                                    {!shoudHideIcon ? (
                                        <label className="flex items-center w-full cursor-pointer">
                                            <input
                                                type={field.type === 'single' ? 'radio' : 'checkbox'}
                                                checked={isAllSelected}
                                                readOnly
                                                className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${field.type === 'single' ? 'rounded-full' : 'rounded'}`}
                                            />
                                            <span className="ml-3 text-sm text-gray-700 font-bold">Semua</span>
                                        </label>
                                    ) : (
                                        <span className={`text-sm ${isAllSelected ? 'text-blue-600 font-bold' : 'text-gray-700 font-medium'}`}>
                                            Semua
                                        </span>
                                    )}
                                </div>
                            );
                        })()}

                        {filterOptions[field.optionKey] && filterOptions[field.optionKey].map((option, idx) => {
                            let optionColor = null;
                            if (field.requestKey === 'bidang_fokus' || field.requestKey === 'skema') {
                                for (const [key, color] of Object.entries(FIELD_COLORS)) {
                                    if (option && option.includes(key)) {
                                        optionColor = color;
                                        break;
                                    }
                                }
                            }

                            const selected = isSelected(field.requestKey, option);
                            const shoudHideIcon = field.hideIcon || (typeof hideFilterIcons !== 'undefined' && hideFilterIcons);

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleFilterSelect(field.requestKey, option, !selected, field.type)}
                                    className={`flex items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${selected ? 'bg-blue-50/30' : ''}`}
                                >
                                    {!shoudHideIcon ? (
                                        <label className="flex items-center w-full cursor-pointer">
                                            <input
                                                type={field.type === 'single' ? 'radio' : 'checkbox'}
                                                checked={selected}
                                                readOnly
                                                className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${field.type === 'single' ? 'rounded-full' : 'rounded'}`}
                                            />
                                            <span
                                                className="ml-3 text-sm text-gray-700 font-medium"
                                                style={optionColor ? { color: optionColor } : {}}
                                            >
                                                {optionColor && <span className="mr-1.5 font-bold">■</span>}
                                                {titleCase(option)}
                                            </span>
                                        </label>
                                    ) : (
                                        <span
                                            className={`text-sm ${selected ? 'text-blue-600 font-bold' : 'text-gray-700 font-medium'}`}
                                            style={optionColor ? { color: optionColor } : {}}
                                        >
                                            {optionColor && <span className="mr-1.5 font-bold">■</span>}
                                            {titleCase(option)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Search Box - Positioned over map */}
            {!hideSearch && (
                <div className="absolute z-20 top-5 left-[52%] sm:left-1/2 -translate-x-1/2 lg:w-1/2 w-[75%]">
                    <div className="relative w-full px-3">
                        <svg
                            className="absolute left-6 top-2 text-slate-400"
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onSearch(searchTerm);
                                }
                            }}
                            placeholder={`Cari ${filters.bubbleType === 'Penelitian' ? 'penelitian, universitas, atau peneliti' : (filters.bubbleType === 'Pengabdian' ? 'pengabdian' : (filters.bubbleType === 'Hilirisasi' ? 'hilirisasi' : 'penelitian, universitas, atau peneliti'))}...`}
                            className="w-full pl-10 lg:w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Advanced Search Panel */}
            {isAdvancedSearchOpen && (
                <div className={`absolute z-30 bottom-24 left-1/2 -translate-x-1/2 ${widthClass} bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-4 lg:p-5 animate-fade-in-up border border-gray-100`}>

                    {/* Render fields with better layout logic */}
                    {showPermasalahanControls ? (
                        <div className="flex flex-col gap-4">
                            {/* Special Top Section for Permasalahan */}
                            <div className="flex flex-col gap-4">
                                <div className={`grid grid-cols-1 ${filters.dataType === 'Krisis Listrik' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-x-8 gap-y-3`}>
                                    {filterFields.slice(0, 2).map((field) => (
                                        <div key={field.requestKey} className="flex flex-col gap-1">
                                            <label className="text-[12px] font-bold text-gray-800 ml-1">{field.label}</label>
                                            {renderField(field)}
                                        </div>
                                    ))}

                                    {filters.dataType === 'Krisis Listrik' && (
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[12px] font-bold text-gray-800 ml-1">Metrik Listrik</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onMetrikChange('saidi')}
                                                    className={`flex-1 py-1 px-3 h-[38px] rounded-lg text-xs font-bold transition-all border ${selectedMetrik === 'saidi'
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    SAIDI
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onMetrikChange('saifi')}
                                                    className={`flex-1 py-1 px-3 h-[38px] rounded-lg text-xs font-bold transition-all border ${selectedMetrik === 'saifi'
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    SAIFI
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Jenis Pengabdian ONLY if active and above the line */}
                                {filters.bubbleType === 'Pengabdian' && filterFields[2] && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[12px] font-bold text-gray-800 ml-1">{filterFields[2].label}</label>
                                        {renderField(filterFields[2])}
                                    </div>
                                )}
                            </div>

                            {/* Visual Divider */}
                            <div className="h-px bg-slate-200/60 w-full my-0.5" />

                            {/* Rest of the Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-3">
                                {(() => {
                                    const isPengabdian = filters.bubbleType === 'Pengabdian';
                                    const topCount = isPengabdian ? 3 : 2;
                                    return filterFields.slice(topCount).map((field) => (
                                        <div key={field.requestKey} className={`flex flex-col gap-1 ${field.colSpan || ''}`}>
                                            <label className="text-[12px] font-bold text-gray-800 ml-1">{field.label}</label>
                                            {renderField(field)}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className={`grid ${gridClass} gap-4`}>
                            {filterFields.map((field) => (
                                <div key={field.requestKey} className="flex flex-col gap-1">
                                    <label className="text-[12px] font-bold text-gray-800 ml-1">{field.label}</label>
                                    {renderField(field)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Control Buttons - Positioned at bottom of map */}
            <div className="absolute z-20 bottom-5 left-1/2 -translate-x-1/2 w-[95%] lg:w-auto px-1">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 lg:gap-3">
                    
                    {/* TOP ROW (Mobile) / Left Group (Desktop) - MODES & TOGGLES */}
                    <div className="flex items-center justify-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {!hideDisplayMode && (
                            <>
                                <button
                                    onClick={() => onDisplayModeChange('peneliti')}
                                    className={`flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm flex-shrink-0 ${displayMode === 'peneliti'
                                        ? 'bg-[#FFD700] text-black'
                                        : 'bg-[#3E7DCA] text-white hover:brightness-110'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M18.5 19l-4.7-7.5V5h1v-2h-5.6v2h1v6.5L5.5 19c-.6.9-.1 2.1 1 2.1h11c1.1 0 1.6-1.2 1-2.1zM9.8 8.6V5h4.4v3.6c0 .1 0 .1-.1.2l-1.2 1.9h-1.8l-1.2-1.9c-.1-.1-.1-.1-.1-.2z" />
                                    </svg>
                                    Peneliti
                                </button>
                                <button
                                    onClick={() => onDisplayModeChange('institusi')}
                                    className={`flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm flex-shrink-0 ${displayMode === 'institusi'
                                        ? 'bg-[#FFD700] text-black'
                                        : 'bg-[#3E7DCA] text-white hover:brightness-110'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                                    </svg>
                                    Institusi
                                </button>
                            </>
                        )}

                        {showPermasalahanControls && (
                            <>
                                <button
                                    onClick={onToggleBubbles}
                                    className={`flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm flex-shrink-0 ${!showBubbles ? 'bg-purple-600' : 'bg-purple-500'} text-white`}
                                >
                                    {showBubbles ? 'Hide Bubbles' : 'Show Bubbles'}
                                </button>
                                <button
                                    onClick={() => onViewModeChange('provinsi')}
                                    className={`flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm flex-shrink-0 ${viewMode === 'provinsi' ? 'bg-[#FFD700] text-black' : 'bg-[#3E7DCA] text-white'}`}
                                >
                                    Provinsi
                                </button>
                                <button
                                    onClick={() => onViewModeChange('kabupaten')}
                                    className={`flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm flex-shrink-0 ${viewMode === 'kabupaten' ? 'bg-[#FFD700] text-black' : 'bg-[#3E7DCA] text-white'}`}
                                >
                                    Kabupaten
                                </button>
                            </>
                        )}
                    </div>

                    {/* BOTTOM ROW (Mobile) / Right Group (Desktop) - ACTIONS */}
                    <div className="flex items-center justify-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                            className={`flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-full font-bold transition-all shadow-sm ${isAdvancedSearchOpen ? 'bg-gray-100' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z" />
                            </svg>
                            <span className="hidden sm:inline">Advanced Search</span>
                            <span className="sm:hidden">Advanced</span>
                        </button>

                        <button
                            onClick={onReset}
                            className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50"
                            title="Reset Filter"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </button>

                        {!hideDownload && (
                            <button
                                onClick={onDownload}
                                disabled={isLoading}
                                className={`flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-full font-bold text-white transition-all shadow-sm ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#16a34a] hover:bg-[#15803d]'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Excel</span>
                            </button>
                        )}
                        
                        {!hideDownload && onDownloadSecondary && (
                            <button
                                onClick={onDownloadSecondary}
                                disabled={isLoading}
                                className={`flex items-center justify-center gap-2 text-xs md:text-sm px-4 py-2 rounded-full font-bold text-white transition-all shadow-sm ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                <span>Excel 2</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
