import React, { useMemo, useState } from 'react';
import { getFieldColor } from '../Utils/fieldColors';

export default function ResearchList({ researches = [], totalCount = 0, onAdvancedSearch, onItemClick, onFilteredResults, title = "Daftar Penelitian", isFiltered = false, isFasilitasLab = false, isPenelitianPage = false, isHilirisasiPage = false, isProdukPage = false, isPermasalahanPage = false, customFieldOptions = [], placeholderAll = "Cari penelitian, universitas, atau peneliti..." }) {
    const [searchRows, setSearchRows] = useState([
        { id: Date.now(), term: '', field: 'all', operator: 'AND' }
    ]);

    const addRow = () => {
        setSearchRows(prev => [...prev, { id: Date.now(), term: '', field: 'all', operator: 'AND' }]);
    };

    const removeRow = (id) => {
        if (searchRows.length > 1) {
            setSearchRows(prev => prev.filter(row => row.id !== id));
        }
    };

    const updateRow = (id, updates) => {
        setSearchRows(prev => prev.map(row => row.id === id ? { ...row, ...updates } : row));
    };

    const handleSearchTrigger = () => {
        if (onAdvancedSearch) {
            onAdvancedSearch(searchRows);
        }
    };

    // USE DEBOUNCE to prevent lagging
    const [debouncedRows, setDebouncedRows] = React.useState(searchRows);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedRows(searchRows);
        }, 500); // Wait 500ms after user stops typing
        return () => clearTimeout(handler);
    }, [searchRows]);

    const normalizedRows = useMemo(
        () => debouncedRows.map((row) => ({ ...row, term: (row.term || '').trim().toLowerCase() })),
        [debouncedRows]
    );

    const hasActiveQuery = useMemo(
        () => normalizedRows.some((row) => row.term.length > 0),
        [normalizedRows]
    );

    const getValueByField = (research, field) => {
        const valuesByField = {
            title: research?.judul || research?.judul_kegiatan || research?.nama_produk,
            university: research?.institusi || research?.nama_institusi || research?.perguruan_tinggi,
            researcher: research?.nama || research?.nama_ketua || research?.nama_pengusul || research?.nama_inventor,
            field: research?.bidang_fokus || research?.bidang,
            priorityTheme: research?.tema_prioritas,
            category: research?.kategori_pt || research?.ptn_pts || research?.jenis_pt,
            cluster: research?.klaster,
            directorate: research?.direktorat,
            skema: research?.skema || research?.nama_skema,
            tkt: research?.tkt,
            provinsi: research?.provinsi || research?.prov_pt,
            tahun: research?.tahun || research?.thn_pelaksanaan || research?.thn_pelaksanaan_kegiatan,
        };

        if (field === 'all') {
            return Object.values(valuesByField).filter(Boolean).join(' ');
        }

        return valuesByField[field] || '';
    };

    const matchesRow = (research, row) => {
        if (!row.term) return true;
        const rawValue = getValueByField(research, row.field);
        return String(rawValue || '').toLowerCase().includes(row.term);
    };

    const filteredResearches = useMemo(() => {
        if (!Array.isArray(researches)) return [];
        if (!hasActiveQuery) return researches; // FIXED: show data from server if no local search active

        return researches.filter((research) => {
            let result = matchesRow(research, normalizedRows[0]);

            for (let i = 1; i < normalizedRows.length; i += 1) {
                const row = normalizedRows[i];
                const rowMatch = matchesRow(research, row);

                if (row.operator === 'OR') {
                    result = result || rowMatch;
                } else if (row.operator === 'AND NOT') {
                    result = result && !rowMatch;
                } else {
                    result = result && rowMatch;
                }
            }

            return result;
        });
    }, [researches, normalizedRows, hasActiveQuery]);

    // Lift state up whenever filteredResearches changes
    React.useEffect(() => {
        if (onFilteredResults) {
            onFilteredResults(filteredResearches);
        }
    }, [filteredResearches, onFilteredResults]);

    const defaultFieldOptions = [
        { value: 'all', label: 'Semua' },
        { value: 'title', label: 'Judul Penelitian' },
        { value: 'university', label: 'Universitas' },
        { value: 'researcher', label: 'Peneliti' },
        { value: 'field', label: 'Bidang Fokus' },
        { value: 'priorityTheme', label: 'Tema Prioritas' },
        { value: 'category', label: 'Kategori PT' },
        { value: 'cluster', label: 'Klaster' },
    ];

    const fieldOptions = customFieldOptions.length > 0 ? customFieldOptions : defaultFieldOptions;

    const getPlaceholder = (fieldValue) => {
        if (fieldValue === 'all') {
            return placeholderAll;
        }

        const option = fieldOptions.find(opt => opt.value === fieldValue);
        if (option) {
            return `Cari ${option.label.toLowerCase()}...`;
        }

        return "Cari...";
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex lg:flex-row flex-col lg:gap-0 gap-2 justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                {hasActiveQuery && debouncedRows !== searchRows && (
                    <div className="flex items-center gap-2 text-blue-500 animate-pulse text-sm font-medium">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mencari...
                    </div>
                )}
            </div>

            <div className="space-y-4 mb-6">
                {searchRows.map((row, index) => (
                    <div key={row.id} className="space-y-3">
                        {index > 0 && (
                            <div className="flex items-center gap-2">
                                <select
                                    value={row.operator}
                                    onChange={(e) => updateRow(row.id, { operator: e.target.value })}
                                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                >
                                    <option value="AND">AND</option>
                                    <option value="OR">OR</option>
                                    <option value="AND NOT">AND NOT</option>
                                </select>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={row.term}
                                    onChange={(e) => updateRow(row.id, { term: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
                                    placeholder={getPlaceholder(row.field)}
                                    className="w-full px-4 pr-10 py-2.5 border border-slate-300 rounded-lg  shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoComplete="off"
                                />
                                {row.term && (
                                    <button
                                        onClick={() => updateRow(row.id, { term: '' })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        title="Hapus teks"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className="relative shrink-0">
                                <select
                                    value={row.field}
                                    onChange={(e) => updateRow(row.id, { field: e.target.value })}
                                    className="px-4 pr-10 py-2.5 text-sm font-medium text-white bg-[#4479C4] rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none min-w-[140px] cursor-pointer"
                                >
                                    {fieldOptions.map(opt => (
                                        <option key={opt.value} value={opt.value} className="bg-[#4479C4] text-white">{opt.label}</option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                            {index > 0 && (
                                <button
                                    onClick={() => removeRow(row.id)}
                                    className="p-2.5 text-white bg-[#EF4444] rounded-lg hover:bg-red-600 transition-colors shadow-sm shrink-0"
                                    title="Hapus baris"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={handleSearchTrigger}
                        className="flex items-center gap-2 px-6 py-2 bg-[#22C55E] text-white rounded-lg font-medium hover:bg-green-600 transition-all shadow-sm active:scale-95 h-[42px]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                    </button>
                    <button
                        onClick={addRow}
                        className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-blue-600 transition-all shadow-sm active:scale-95 text-sm h-[42px]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add search field
                    </button>
                </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pt-4 border-t border-slate-100">
                {(!Array.isArray(researches) || researches.length === 0) ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 font-medium">
                            {isFiltered
                                ? "Tidak ada data yang sesuai dengan filter"
                                : `Masukkan kata kunci untuk mencari ${title.toLowerCase().replace('daftar ', '')}`}
                        </p>
                    </div>
                ) : (hasActiveQuery && filteredResearches.length === 0) ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 font-medium">Tidak ada data yang sesuai dengan kata kunci</p>
                    </div>
                ) : (
                    filteredResearches.map((research, index) => (
                        <div
                            key={index}
                            className={`border ${isPenelitianPage || isHilirisasiPage || isProdukPage || isPermasalahanPage ? 'border-slate-200 rounded-xl bg-[#f8fafc]' : 'border-gray-200 rounded-md bg-white'} p-4 ${onItemClick && (isPenelitianPage || isHilirisasiPage || isProdukPage || isPermasalahanPage) ? 'cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200' : ''}`}
                            onClick={() => {
                                if (!onItemClick) return;
                                if (isPenelitianPage || isHilirisasiPage || isProdukPage || isFasilitasLab || isPermasalahanPage) {
                                    onItemClick(research);
                                }
                            }}
                        >

                            {isFasilitasLab ? (
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors leading-tight">
                                            {research.judul || research.nama_laboratorium}
                                        </h4>
                                        <div
                                            className="w-4 h-1.5 rounded-full opacity-60 mt-2"
                                            style={{ backgroundColor: getFieldColor(research.bidang_fokus || research.bidang) }}
                                        />
                                    </div>

                                    <div className="space-y-0.5 text-[12.5px] text-slate-600">
                                        <p><span className="font-bold text-slate-700">Institusi:</span> {research.institusi || '-'}</p>
                                        {/* <p><span className="font-bold text-slate-700">Fakultas:</span> {research.fakultas || '-'}</p>
                                        <p><span className="font-bold text-slate-700">Departemen:</span> {research.departemen || '-'}</p>
                                        <p><span className="font-bold text-slate-700">Status Akses:</span> {research.status_akses || '-'}</p> */}
                                    </div>

                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="text-slate-400 text-[11px] font-medium">
                                            <span>{research.provinsi}{research.kota ? `, ${research.kota}` : ''}</span>
                                        </div>
                                        <div className="text-slate-900 text-[11.5px] font-bold">
                                            {research.total_jumlah_alat !== undefined ? research.total_jumlah_alat : (research.nama_alat ? (typeof research.nama_alat === 'string' ? research.nama_alat.split('|').filter(Boolean).length : 0) : 0)} Alat
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="pl-0 flex flex-col h-full">
                                    {isHilirisasiPage ? (
                                        <div className="flex flex-col gap-2 mb-3">
                                            {((research.tkt && research.tkt !== '-') || research.bidang_fokus || research.bidang) && (
                                                <div className="self-start">
                                                    <span 
                                                        className="inline-block px-3 py-1.5 rounded-xl text-[11.5px] font-bold text-white shadow-sm leading-relaxed max-w-full break-words"
                                                        style={{ backgroundColor: (research.tkt && research.tkt !== '-') ? '#2A3F54' : getFieldColor(research.bidang_fokus || research.bidang) }}
                                                    >
                                                        {(research.tkt && research.tkt !== '-') ? `TKT ${research.tkt}` : (research.bidang_fokus || research.bidang)}
                                                    </span>
                                                </div>
                                            )}
                                            <h4 className="font-bold text-[#334155] text-[15px] leading-snug">{research.judul || '-'}</h4>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <h4 className="font-bold text-[#334155] text-[15px] leading-snug">{research.judul || '-'}</h4>
                                            {((research.tkt && research.tkt !== '-') || research.bidang_fokus || research.bidang) && (
                                                <div className="shrink-0 text-right ml-auto">
                                                    <span 
                                                        className="inline-block px-3 py-1.5 rounded-xl text-[11.5px] font-bold text-white shadow-sm leading-tight"
                                                        style={{ backgroundColor: (research.tkt && research.tkt !== '-') ? '#2A3F54' : getFieldColor(research.bidang_fokus || research.bidang) }}
                                                    >
                                                        {(research.tkt && research.tkt !== '-') ? `TKT ${research.tkt}` : (research.bidang_fokus || research.bidang)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-[13px] text-slate-500 space-y-1.5 flex-1 mb-4">
                                        {(isProdukPage || research.nama_inventor || research.inventor) ? (
                                            <p><strong className="text-slate-700 font-bold">Inventor:</strong> {research.nama_inventor || research.inventor || research.nama || research.researcher || '-'}</p>
                                        ) : (
                                            <p><strong className="text-slate-700 font-bold">Peneliti:</strong> {research.nama || research.researcher || '-'}</p>
                                        )}
                                        <p><strong className="text-slate-700 font-bold">Universitas:</strong> {research.institusi || research.nama_institusi || '-'}</p>
                                        {(research.provinsi || research.prov_pt) && (research.provinsi || research.prov_pt) !== '-' && <p><strong className="text-slate-700 font-bold">Provinsi:</strong> {research.provinsi || research.prov_pt}</p>}
                                        {(research.skema || research.nama_skema) && (research.skema || research.nama_skema) !== '-' && <p><strong className="text-slate-700 font-bold">Skema:</strong> {research.skema || research.nama_skema}</p>}
                                    </div>
                                    {(research.tahun || research.thn_pelaksanaan || research.thn_pelaksanaan_kegiatan) && (research.tahun || research.thn_pelaksanaan || research.thn_pelaksanaan_kegiatan) !== '-' && (
                                        <div className="text-slate-400 text-[13px] font-medium mt-auto">
                                            {research.tahun || research.thn_pelaksanaan || research.thn_pelaksanaan_kegiatan}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            {(Array.isArray(filteredResearches) && filteredResearches.length > 0 && totalCount > 0) && (
                <div className="mt-6 text-center text-slate-500 font-medium">
                    Menampilkan {filteredResearches.length} dari {totalCount} hasil
                </div>
            )}
        </div>
    );
}
