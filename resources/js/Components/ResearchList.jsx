import React, { useMemo, useState } from 'react';
import { getFieldColor } from '../utils/fieldColors';

export default function ResearchList({ researches = [], onAdvancedSearch, title = "Daftar Penelitian", isFiltered = false, customFieldOptions = [], placeholderAll = "Cari penelitian, universitas, atau peneliti..." }) {
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

    const normalizedRows = useMemo(
        () => searchRows.map((row) => ({ ...row, term: (row.term || '').trim().toLowerCase() })),
        [searchRows]
    );

    const hasActiveQuery = useMemo(
        () => normalizedRows.some((row) => row.term.length > 0),
        [normalizedRows]
    );

    const getValueByField = (research, field) => {
        const valuesByField = {
            title: research?.judul,
            university: research?.institusi,
            researcher: research?.nama,
            field: research?.bidang_fokus || research?.bidang,
            priorityTheme: research?.tema_prioritas,
            category: research?.kategori_pt || research?.ptn_pts || research?.jenis_pt,
            cluster: research?.klaster,
            directorate: research?.direktorat,
            skema: research?.skema,
            tkt: research?.tkt,
            provinsi: research?.provinsi,
            tahun: research?.tahun || research?.thn_pelaksanaan,
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
        if (!hasActiveQuery) return researches;

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
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-600"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="relative shrink-0">
                                <select
                                    value={row.field}
                                    onChange={(e) => updateRow(row.id, { field: e.target.value })}
                                    className="px-4 pr-10 py-2.5 text-sm font-medium text-white bg-[#4479C4] rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none min-w-[140px] cursor-pointer"
                                >
                                    {fieldOptions.map(opt => (
                                        <option key={opt.value} value={opt.value} className="bg-white text-slate-800">{opt.label}</option>
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
                            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <h4 className="font-semibold text-slate-800 mb-2">{research.judul}</h4>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p><strong>Universitas:</strong> {research.institusi}</p>
                                <p><strong>Peneliti:</strong> {research.nama}</p>
                                {research.tema_prioritas && (
                                    <p><strong>Tema Prioritas:</strong> {research.tema_prioritas}</p>
                                )}
                                {research.bidang_fokus && (
                                    <div className="pt-1">
                                        <span
                                            className="inline-block px-3 py-0.5 rounded-full text-white text-xs font-semibold"
                                            style={{ backgroundColor: getFieldColor(research.bidang_fokus) }}
                                        >
                                            {research.bidang_fokus}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
