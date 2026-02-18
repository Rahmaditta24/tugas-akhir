import React, { useState, useRef, useEffect } from 'react';

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

export default function AdvancedSearch({ filterOptions, onFilterChange, show }) {
    // Temporary filter state (not applied yet)
    const [tempFilters, setTempFilters] = useState({
        bidang_fokus: [],
        tema_prioritas: [],
        kategori_pt: [],
        klaster: [],
        provinsi: [],
        tahun: []
    });

    // Applied filters (sent to parent)
    const [appliedFilters, setAppliedFilters] = useState({
        bidang_fokus: [],
        tema_prioritas: [],
        kategori_pt: [],
        klaster: [],
        provinsi: [],
        tahun: []
    });

    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRefs = useRef({});

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (openDropdown && dropdownRefs.current[openDropdown]) {
                const dropdown = dropdownRefs.current[openDropdown];
                if (!dropdown.contains(event.target)) {
                    setOpenDropdown(null);
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    const handleFilterToggle = (filterType, value) => {
        setTempFilters(prev => {
            const currentValues = prev[filterType] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];

            return { ...prev, [filterType]: newValues };
        });
        // Don't close dropdown after selection for better UX
    };

    const handleApplyFilters = () => {
        setAppliedFilters(tempFilters);
        onFilterChange(tempFilters);
        setOpenDropdown(null); // Close any open dropdown
    };

    const handleResetFilters = () => {
        const emptyFilters = {
            bidang_fokus: [],
            tema_prioritas: [],
            kategori_pt: [],
            klaster: [],
            provinsi: [],
            tahun: []
        };
        setTempFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        onFilterChange(emptyFilters);
        setOpenDropdown(null);
    };

    const getSelectedText = (filterType) => {
        const selected = tempFilters[filterType] || [];
        if (selected.length === 0) return 'Semua';
        if (selected.length === 1) return selected[0];
        return `${selected.length} dipilih`;
    };

    const hasUnappliedChanges = () => {
        return JSON.stringify(tempFilters) !== JSON.stringify(appliedFilters);
    };

    const renderDropdown = (filterType, label, options) => (
        <div className="flex flex-col w-full" key={filterType}>
            <label className="mb-2 text-sm font-medium text-black">{label}</label>
            <div
                className="relative w-full"
                ref={el => dropdownRefs.current[filterType] = el}
            >
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === filterType ? null : filterType)}
                    className="appearance-none w-full text-sm px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 text-left bg-white"
                >
                    <span className="truncate block">{getSelectedText(filterType)}</span>
                </button>
                <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                {openDropdown === filterType && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                        {options && options.length > 0 ? (
                            options.map((option, index) => {
                                // Determine color for Bidang Fokus or Skema
                                let optionColor = null;
                                if (filterType === 'bidang_fokus' || filterType === 'skema') {
                                    for (const [key, color] of Object.entries(FIELD_COLORS)) {
                                        if (option && option.includes(key)) {
                                            optionColor = color;
                                            break;
                                        }
                                    }
                                }

                                return (
                                    <label
                                        key={index}
                                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={tempFilters[filterType]?.includes(option) || false}
                                            onChange={() => handleFilterToggle(filterType, option)}
                                            className="mr-2 accent-blue-600"
                                        />
                                        <span
                                            className="text-sm font-medium"
                                            style={optionColor ? { color: optionColor } : { color: '#374151' }}
                                        >
                                            {optionColor && <span className="mr-1">■</span>}
                                            {option}
                                        </span>
                                    </label>
                                );
                            })
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">Tidak ada opsi</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    if (!show) return null;

    return (
        <div className="w-full mx-auto mb-5 translate-x-[-7px]">
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 shadow-sm">
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 items-end">
                    {renderDropdown('bidang_fokus', 'Bidang Fokus', filterOptions?.bidangFokus)}
                    {renderDropdown('tema_prioritas', 'Tema Prioritas', filterOptions?.temaPrioritas)}
                    {renderDropdown('kategori_pt', 'Kategori PT', filterOptions?.kategoriPT)}
                    {renderDropdown('klaster', 'Klaster', filterOptions?.klaster)}
                    {renderDropdown('provinsi', 'Provinsi', filterOptions?.provinsi)}
                    {renderDropdown('tahun', 'Tahun', filterOptions?.tahun)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-5">
                    <button
                        onClick={handleApplyFilters}
                        className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${hasUnappliedChanges()
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-blue-400 cursor-not-allowed'
                            }`}
                        disabled={!hasUnappliedChanges()}
                    >
                        Terapkan Filter
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
