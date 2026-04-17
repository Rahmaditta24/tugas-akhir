import React, { useMemo, useState } from 'react';
import { display } from '../Utils/format';

export default function AdminTable({
    columns = [], // [{ key, title, className, sortable }]
    data = [],
    sort = null, // { key, direction: 'asc'|'desc' }
    onSort = null,
    footer = null, // optional JSX
    striped = false,
    emptyText = 'Tidak ada data',
    localFilterEnabled = false,
    filterPlaceholder = 'Cari di tabel ini...',
    filterKeys = [], // keys to search; defaults to all visible columns
    columnFilterEnabled = false,
    filters = null, // External filter state
    onFilterChange = null, // External change handler
    // --- Bulk selection ---
    selectionEnabled = false,
    selectedItemIds = [],
    onSelectionChange = null,
}) {
    const [query, setQuery] = useState('');
    const [internalFilterValues, setFilterValues] = useState({});

    // Controlled vs uncontrolled filter mode
    const isControlled = !!onFilterChange;
    const filterValues = isControlled ? (filters || {}) : internalFilterValues;

    const handleFilterChange = (key, value) => {
        if (isControlled) {
            onFilterChange(key, value);
        } else {
            setFilterValues((fv) => ({ ...fv, [key]: value }));
        }
    };

    const handleSort = (col) => {
        if (!onSort || !col.sortable) return;
        const nextDir = sort?.key === col.key && sort?.direction === 'asc' ? 'desc' : 'asc';
        onSort({ key: col.key, direction: nextDir });
    };

    // --- Selection helpers ---
    const allIds = useMemo(() => data.map((r) => r.id).filter(Boolean), [data]);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedItemIds.includes(id));
    const someSelected = allIds.some((id) => selectedItemIds.includes(id));

    const toggleAll = () => {
        if (!onSelectionChange) return;
        if (allSelected) {
            onSelectionChange(selectedItemIds.filter((id) => !allIds.includes(id)));
        } else {
            onSelectionChange([...new Set([...selectedItemIds, ...allIds])]);
        }
    };

    const toggleRow = (id) => {
        if (!onSelectionChange) return;
        if (selectedItemIds.includes(id)) {
            onSelectionChange(selectedItemIds.filter((i) => i !== id));
        } else {
            onSelectionChange([...selectedItemIds, id]);
        }
    };
    // --- End selection helpers ---

    const visibleKeys = useMemo(() => (columns || []).map((c) => c.key), [columns]);
    const effectiveKeys = filterKeys && filterKeys.length > 0 ? filterKeys : visibleKeys;

    const filteredData = useMemo(() => {
        if (!localFilterEnabled || !query) return data;
        const q = query.toString().toLowerCase();
        return (data || []).filter((row) =>
            effectiveKeys.some((k) => {
                const v = row?.[k];
                if (v === null || v === undefined) return false;
                return String(v).toLowerCase().includes(q);
            })
        );
    }, [data, query, localFilterEnabled, effectiveKeys]);

    const columnFilteredData = useMemo(() => {
        if (isControlled) return filteredData;
        const keys = Object.keys(filterValues || {}).filter((k) => (filterValues[k] ?? '') !== '');
        if (!columnFilterEnabled || keys.length === 0) return filteredData;
        return (filteredData || []).filter((row) =>
            keys.every((k) => String(row?.[k] ?? '').toLowerCase().includes(String(filterValues[k]).toLowerCase()))
        );
    }, [filteredData, filterValues, columnFilterEnabled]);

    const totalCols = columns.length + (selectionEnabled ? 1 : 0);

    return (
        <div className="overflow-x-auto">
            {localFilterEnabled && (
                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={filterPlaceholder}
                        className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-md"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded-md">Reset</button>
                    )}
                </div>
            )}
            <table className={`min-w-full text-sm ${striped ? 'striped' : ''}`}>
                <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                        {selectionEnabled && (
                            <th className="px-4 py-3 w-10">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600"
                                    checked={allSelected}
                                    ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                                    onChange={toggleAll}
                                    title="Pilih semua di halaman ini"
                                />
                            </th>
                        )}
                        {columns.map((col) => {
                            const isSorted = sort?.key === col.key;
                            const arrow = isSorted ? (sort.direction === 'asc' ? '▲' : '▼') : '';
                            return (
                                <th
                                    key={col.key}
                                    className={`text-left px-4 py-3 whitespace-nowrap select-none ${col.className || ''} ${col.sortable ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleSort(col)}
                                >
                                    <span className="inline-flex items-center gap-1 text-slate-700">
                                        {col.title}
                                        {col.sortable && (
                                            <span className="text-[10px] text-slate-400">{arrow}</span>
                                        )}
                                    </span>
                                </th>
                            );
                        })}
                    </tr>
                    {columnFilterEnabled && (
                        <tr className="border-b border-slate-200/60">
                            {selectionEnabled && <th className="px-4"><div className="h-8" /></th>}
                            {columns.map((col) => (
                                <th key={`filter-${col.key}`} className={`px-4 pt-1 pb-4 leading-none ${col.className || ''}`}>
                                    {col.key === 'aksi' || col.key === 'no' || col.filterable === false ? (
                                        <div className="h-8" />
                                    ) : (
                                        <div className="relative group w-full">
                                            <input
                                                type="text"
                                                value={filterValues[col.key] ?? ''}
                                                onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                                placeholder={`Filter ${col.title}`}
                                                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                            />
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-blue-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </span>
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    )}
                </thead>
                <tbody>
                    {columnFilteredData.length === 0 && (
                        <tr>
                            <td colSpan={totalCols} className="px-4 py-6 text-center text-slate-500">
                                {emptyText}
                            </td>
                        </tr>
                    )}
                    {columnFilteredData.map((row, idx) => {
                        const isSelected = selectionEnabled && selectedItemIds.includes(row.id);
                        return (
                            <tr
                                key={row.id ?? idx}
                                className={`align-top transition-colors ${isSelected ? 'bg-blue-50/70' : ''}`}
                            >
                                {selectionEnabled && (
                                    <td className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600"
                                            checked={isSelected}
                                            onChange={() => toggleRow(row.id)}
                                        />
                                    </td>
                                )}
                                {columns.map((col) => {
                                    const val = row[col.key];
                                    return (
                                        <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className || ''}`}>
                                            {typeof col.render === 'function'
                                                ? col.render(val, row)
                                                : (React.isValidElement(val) ? val : display(val))}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
                {footer}
            </table>
        </div>
    );
}
