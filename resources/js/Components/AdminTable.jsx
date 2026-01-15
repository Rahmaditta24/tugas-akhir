import React from 'react';

import { useMemo, useState } from 'react';

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
}) {
    const [query, setQuery] = useState('');
    const [internalFilterValues, setFilterValues] = useState({});

    // Determine if we are in controlled mode
    const isControlled = !!onFilterChange;
    const filterValues = isControlled ? (filters || {}) : internalFilterValues;

    // Handle filter change
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
        // If controlled (server-side), we don't filter client-side
        if (isControlled) return filteredData;

        const keys = Object.keys(filterValues || {}).filter((k) => (filterValues[k] ?? '') !== '');
        if (!columnFilterEnabled || keys.length === 0) return filteredData;
        return (filteredData || []).filter((row) =>
            keys.every((k) => String(row?.[k] ?? '').toLowerCase().includes(String(filterValues[k]).toLowerCase()))
        );
    }, [filteredData, filterValues, columnFilterEnabled]);

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
                <thead>
                    <tr>
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
                        <tr>
                            {columns.map((col) => (
                                <th key={`filter-${col.key}`} className={`px-4 py-2 ${col.className || ''}`}>
                                    {col.key === 'aksi' ? null : (
                                        <input
                                            type="text"
                                            value={filterValues[col.key] ?? ''}
                                            onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                            placeholder={`Filter ${col.title}`}
                                            className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs"
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    )}
                </thead>
                <tbody>
                    {columnFilteredData.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500">
                                {emptyText}
                            </td>
                        </tr>
                    )}
                    {columnFilteredData.map((row, idx) => (
                        <tr key={row.id ?? idx} className="align-top">
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-3 text-slate-700">
                                    {typeof col.render === 'function' ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {footer}
            </table>
        </div>
    );
}


