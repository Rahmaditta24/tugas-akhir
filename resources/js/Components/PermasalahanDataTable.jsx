import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { titleCase } from '../Utils/format';


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

    const colLabel = `${titleCase(activeDataType)} ${satuan ? `(${satuan})` : ''}`.toUpperCase();
    const exportCols = [
        { key: nameKey, label: tab === 'provinsi' ? 'Provinsi' : 'Kabupaten/Kota' },
        { key: 'nilai', label: colLabel },
    ];

    const handleDownloadExcel = () => {
        const excelColLabel = `${titleCase(activeDataType)}${satuan ? ` (${satuan.toLowerCase()})` : ''}`;

        const dataToExport = filtered.map((row, index) => ({
            No: index + 1,
            [tab === 'provinsi' ? 'Provinsi' : 'Kabupaten/Kota']: titleCase(row[nameKey] || '-'),
            [excelColLabel]: row.nilai ?? 0,
        }));

        const sheetName = tab === 'provinsi' ? 'Data Provinsi' : 'Data Kabupaten';

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `Data_${activeDataType.replace(/\s+/g, '_')}_${tab}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-[#2563EB] py-3 flex items-center justify-center">
                <h2 className="text-white font-bold text-[15px] tracking-wide">
                    Data {titleCase(activeDataType)}
                </h2>
            </div>

            {/* Search + Buttons */}
            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-200 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[250px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Cari wilayah atau nilai..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <button
                    onClick={() => setPage(1)}
                    className="inline-flex items-center px-4 py-2 bg-[#2563EB] border border-transparent rounded-md font-semibold text-white text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                >
                    <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    Search
                </button>
                <button
                    onClick={() => { setSearch(''); setPage(1); setSortDir('desc'); }}
                    className="inline-flex items-center px-4 py-2 bg-[#64748B] border border-transparent rounded-md font-semibold text-white text-sm hover:bg-slate-600 transition-colors shadow-sm"
                >
                    Reset
                </button>
                <button
                    onClick={handleDownloadExcel}
                    className="inline-flex items-center px-4 py-2 bg-[#16A34A] border border-transparent rounded-md font-semibold text-white text-sm hover:bg-green-700 transition-colors shadow-sm"
                >
                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M12 18v-6"></path>
                        <path d="M9 15l3 3 3-3"></path>
                    </svg>
                    Excel
                </button>
            </div>

            {/* Summary */}
            <div className="px-6 py-4 text-[13px] text-gray-700 border-b border-gray-200 flex flex-wrap justify-center gap-x-6 gap-y-2">
                <span>Total Data: <strong>{total}</strong></span>
                <span>Rata-rata: <strong>{fmt(avg)} {satuan}</strong></span>
                <span>Tertinggi: <strong>{fmt(max)} {satuan}</strong></span>
                <span>Terendah: <strong>{fmt(min)} {satuan}</strong></span>
            </div>

            {/* Tab Provinsi / Kab */}
            <div className="flex border-b border-gray-200 bg-white">
                <button
                    onClick={() => { setTab('provinsi'); setPage(1); }}
                    className={`flex-1 text-center py-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'provinsi' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Provinsi
                </button>
                {kabupatenRows.length > 0 && (
                    <button
                        onClick={() => { setTab('kabupaten'); setPage(1); }}
                        className={`flex-1 text-center py-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'kabupaten' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Kabupaten/Kota
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-[#F8FAFC]">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#F8FAFC] border-b-2 border-slate-200 shadow-sm">
                        <tr>
                            <th className="px-6 py-4 text-left font-bold tracking-wider text-gray-700 uppercase text-[12px] w-16">NO</th>
                            <th className="px-6 py-4 text-left font-bold tracking-wider text-gray-700 uppercase text-[12px]">
                                {tab === 'provinsi' ? 'PROVINSI' : 'KABUPATEN/KOTA'}
                                <span
                                    className="ml-2 cursor-pointer text-gray-400 hover:text-gray-600 font-normal"
                                    title="Urutkan"
                                >
                                    ⇅
                                </span>
                            </th>
                            <th
                                className="px-6 py-4 text-left font-bold tracking-wider text-gray-700 uppercase text-[12px] cursor-pointer select-none hover:text-[#2563EB]"
                                onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                            >
                                {colLabel}
                                <span className="ml-2 text-[#2563EB] font-normal">
                                    {sortDir === 'desc' ? '↓ TERTINGGI' : '↑ TERENDAH'}
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
                                <tr key={idx} className="bg-white border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600 text-[13px]">{(safePage - 1) * perPage + idx + 1}</td>
                                    <td className="px-6 py-4 text-[#334155] font-semibold text-[13.5px]">
                                        {row[nameKey] || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-[#2563EB] font-semibold text-[13.5px]">
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
