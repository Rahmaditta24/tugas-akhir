import React, { useState, useMemo } from 'react';

function exportToExcel(rows, columns, filename) {
    const header = columns.map((c) => c.label).join('\t');
    const lines = rows.map((r) => columns.map((c) => r[c.key] ?? '').join('\t'));
    const tsv = [header, ...lines].join('\n');
    const blob = new Blob(['\uFEFF' + tsv], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.xls';
    a.click();
    URL.revokeObjectURL(url);
}

export default function PermasalahanDataTable({
    /** permasalahanStats[activeDataType] – array of {provinsi, nilai, satuan} */
    rows = [],
    /** kabupaten rows – array of {kabupaten_kota, provinsi, nilai, satuan} */
    kabupatenRows = [],
    activeDataType = 'Sampah',
    satuan = '',
}) {
    const [search, setSearch] = useState('');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [tab, setTab] = useState('provinsi');

    const fmt = (n) =>
        n !== null && n !== undefined && !isNaN(n)
            ? Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 })
            : '-';

    const source = tab === 'provinsi' ? rows : kabupatenRows;
    const nameKey = tab === 'provinsi' ? 'provinsi' : 'kabupaten_kota';

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return source.filter(
            (r) =>
                !q ||
                (r[nameKey] || '').toLowerCase().includes(q) ||
                String(r.nilai ?? '').includes(q)
        );
    }, [source, search, nameKey]);

    const sorted = useMemo(
        () =>
            [...filtered].sort((a, b) =>
                sortDir === 'desc'
                    ? (b.nilai ?? 0) - (a.nilai ?? 0)
                    : (a.nilai ?? 0) - (b.nilai ?? 0)
            ),
        [filtered, sortDir]
    );

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const safePage = Math.min(page, totalPages);
    const paginated = sorted.slice((safePage - 1) * perPage, safePage * perPage);

    const total = filtered.length;
    const values = filtered.map((r) => r.nilai ?? 0);
    const avg = total ? values.reduce((s, v) => s + v, 0) / total : 0;
    const max = total ? Math.max(...values) : 0;
    const min = total ? Math.min(...values) : 0;

    const colLabel = `${activeDataType} (${satuan || 'nilai'})`;
    const exportCols = [
        { key: nameKey, label: tab === 'provinsi' ? 'Provinsi' : 'Kabupaten/Kota' },
        { key: 'nilai', label: colLabel },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#3B82F6] px-6 py-3 flex items-center justify-center">
                <h2 className="text-white font-bold text-sm tracking-wide">
                    Data {activeDataType}
                </h2>
            </div>

            {/* Search + Buttons */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2 items-center">
                <input
                    type="text"
                    placeholder="Cari wilayah atau nilai..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="flex-1 min-w-[180px] border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    onClick={() => setPage(1)}
                    className="px-3 py-1.5 bg-[#3B82F6] text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                >
                    Search
                </button>
                <button
                    onClick={() => { setSearch(''); setPage(1); setSortDir('desc'); }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={() => exportToExcel(sorted, exportCols, `Data_${activeDataType}`)}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                >
                    Excel
                </button>
            </div>

            {/* Summary */}
            <div className="px-6 py-3 text-xs text-gray-600 border-b border-gray-100 flex flex-wrap gap-x-6 gap-y-1">
                <span>Total Data: <strong>{total}</strong></span>
                <span>Rata-rata: <strong>{fmt(avg)} {satuan}</strong></span>
                <span>Tertinggi: <strong>{fmt(max)} {satuan}</strong></span>
                <span>Terendah: <strong>{fmt(min)} {satuan}</strong></span>
            </div>

            {/* Tab Provinsi / Kab */}
            <div className="px-6 pt-3 flex gap-6 text-sm border-b border-gray-100">
                <button
                    onClick={() => { setTab('provinsi'); setPage(1); }}
                    className={`pb-2 font-medium border-b-2 transition-colors ${tab === 'provinsi' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Provinsi
                </button>
                {kabupatenRows.length > 0 && (
                    <button
                        onClick={() => { setTab('kabupaten'); setPage(1); }}
                        className={`pb-2 font-medium border-b-2 transition-colors ${tab === 'kabupaten' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Kabupaten/Kota
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600 w-12">No</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-600">
                                {tab === 'provinsi' ? 'Provinsi' : 'Kabupaten/Kota'}
                                <span
                                    className="ml-1 cursor-pointer text-gray-400 hover:text-gray-600"
                                    title="Sort by name"
                                >
                                    ⇅
                                </span>
                            </th>
                            <th
                                className="px-6 py-3 text-right font-semibold text-gray-600 cursor-pointer select-none hover:text-blue-600"
                                onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                            >
                                {colLabel}
                                <span className="ml-1 text-blue-500">
                                    {sortDir === 'desc' ? '↓ Tertinggi' : '↑ Terendah'}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm">
                                    Tidak ada data
                                </td>
                            </tr>
                        ) : (
                            paginated.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                                    <td className="px-6 py-3 text-gray-500">{(safePage - 1) * perPage + idx + 1}</td>
                                    <td className="px-6 py-3 text-blue-600 font-medium">
                                        {row[nameKey] || '-'}
                                    </td>
                                    <td className="px-6 py-3 text-right text-blue-600 font-medium">
                                        {fmt(row.nilai)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <span>Tampilkan:</span>
                    <select
                        value={perPage}
                        onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
                    >
                        {[10, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span>data per halaman</span>
                </div>

                <span>Menampilkan {sorted.length === 0 ? 0 : (safePage - 1) * perPage + 1} - {Math.min(safePage * perPage, sorted.length)} dari {sorted.length} data</span>

                <div className="flex items-center gap-1">
                    <PageBtn onClick={() => setPage(1)} disabled={safePage === 1} label="«" />
                    <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} label="‹" />
                    {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                        const start = Math.max(1, Math.min(safePage - 1, totalPages - 3));
                        const p = start + i;
                        return (
                            <PageBtn
                                key={p}
                                onClick={() => setPage(p)}
                                active={p === safePage}
                                label={String(p)}
                            />
                        );
                    })}
                    <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} label="›" />
                    <PageBtn onClick={() => setPage(totalPages)} disabled={safePage === totalPages} label="»" />
                </div>
            </div>
        </div>
    );
}

function PageBtn({ onClick, disabled, active, label }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors
                ${active ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            {label}
        </button>
    );
}
