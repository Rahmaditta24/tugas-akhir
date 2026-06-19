import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import AdminTable from '../../../../Components/AdminTable';
import Badge from '../../../../Components/Badge';
import { fmt, display } from '../../../../Utils/format';
import { PER_PAGE_OPTIONS } from '../../../../Constants/options';

export default function FasilitasLabContent({ context, fasilitasLab }) {
    const {
        search, handleSearchChange, handleSearch,
        columnFilters, handleColumnFilterChange,
        perPage, handlePerPageChange,
        selectedIds, setSelectedIds,
        openBulkUpdateModal, handleBulkDelete,
        setToolsModal, handleDelete,
        sort, direction
    } = context;

    const tableData = useMemo(() => {
        if (!fasilitasLab?.data || !Array.isArray(fasilitasLab.data)) {
            return [];
        }

        return fasilitasLab.data.map((item, index) => ({
            ...item,
            no: (fasilitasLab.from || 0) + index,
            aksi: (
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.fasilitas-lab.edit', item.id)}
                        data={{
                            page: fasilitasLab.current_page,
                            search,
                            filters: columnFilters,
                            perPage,
                            sort,
                            direction
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                    <button
                        onClick={() => handleDelete(item)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        }));
    }, [fasilitasLab, search, columnFilters, perPage, sort, direction, handleDelete]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="bg-white text-blue-600 text-xs sm:text-sm font-black h-8 sm:h-10 px-3 sm:px-4 flex items-center justify-center rounded-xl shadow-sm border-2 border-blue-100">
                                {selectedIds.length}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-black text-white leading-tight uppercase tracking-wider">
                                    Data Terpilih
                                </span>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-blue-500/50 hidden md:block"></div>

                        <div className="flex items-center gap-2 ml-auto sm:ml-0">
                            <button
                                onClick={openBulkUpdateModal}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 sm:px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/20 shadow-sm active:scale-95"
                                title="Update massal"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="hidden sm:inline">Update</span>
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-3 sm:px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-all shadow-sm border border-red-400/30 active:scale-95"
                                title="Hapus massal"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="hidden sm:inline">Hapus</span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedIds([])}
                        className="w-full sm:w-auto text-xs font-bold text-blue-100 hover:text-white transition-colors bg-blue-700/40 py-2.5 px-4 rounded-xl border border-blue-500/50 hover:bg-blue-700/60 active:scale-95"
                    >
                        Batal
                    </button>
                </div>
            )}
            <div className="p-6 border-b">
                <form onSubmit={handleSearch} className="flex gap-3 items-center flex-wrap">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Cari nama lab, nama alat, institusi, provinsi..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Cari
                    </button>

                    {(search || Object.values(columnFilters).some(v => v)) && (
                        <Link
                            href={route('admin.fasilitas-lab.index')}
                            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-200 text-slate-700 text-sm sm:text-base rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Reset
                        </Link>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-slate-600 hidden sm:inline">Per halaman</span>
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        >
                            {PER_PAGE_OPTIONS.map(val => (<option key={val} value={val}>{val}</option>))}
                        </select>
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto">
                <AdminTable
                    striped
                    columnFilterEnabled={true}
                    selectionEnabled
                    selectedItemIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    emptyText="Tidak ada data fasilitas laboratorium"
                    columns={[
                        { key: 'no', title: 'No', className: 'w-16 text-center' },
                        { key: 'nama_laboratorium', title: 'Nama Lab', className: 'min-w-[200px]', render: (v) => <div className="whitespace-normal leading-relaxed text-sm font-medium text-slate-700" title={fmt(v)}>{display(v)}</div> },
                        { key: 'institusi', title: 'Institusi', className: 'min-w-[180px] max-w-[250px]', render: (v) => <div className="whitespace-normal leading-relaxed text-sm font-medium text-slate-700" title={fmt(v)}>{display(v)}</div> },
                        {
                            key: 'nama_alat',
                            title: 'Nama Alat',
                            className: 'min-w-[300px] max-w-[350px] y-2',
                            render: (v, row) => {
                                const cleaned = fmt(v);
                                if (!cleaned) return display(v);
                                const items = cleaned.split(/\r?\n|;\s*|\|\s*/).map(i => i.replace(/^\d+\.\s*/, '').trim()).filter(i => i !== '');
                                if (items.length === 0) return display(v);

                                return (
                                    <div className="space-y-1">
                                        <ul className="text-sm text-slate-600 space-y-1">
                                            {items.slice(0, 4).map((item, i) => (
                                                <li key={i} className="leading-tight" title={item}>
                                                    <span className="font-medium text-slate-400 mr-1.5">{items.length > 1 ? `${i + 1}.` : ''}</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        {items.length > 4 && (
                                            <button
                                                onClick={() => setToolsModal({ show: true, title: row.nama_laboratorium, items })}
                                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1 group transition-colors"
                                            >
                                                <span>Lihat semua {items.length} alat</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            }
                        },
                        {
                            key: 'kontak',
                            title: 'Kontak',
                            className: 'min-w-[150px]',
                            render: (v) => {
                                const val = fmt(v);
                                if (!val || val.toLowerCase() === 'null') return <span className="text-slate-400 italic text-sm">Kontak tidak tersedia</span>;
                                return <span className="text-slate-700 text-sm font-medium">{val}</span>;
                            }
                        },
                        { key: 'total_jumlah_alat', title: 'Total Jumlah Alat', className: 'w-30 text-center', filterable: false, render: (v) => <Badge color="blue">{display(v === 0 ? '0' : v)}</Badge> },
                        { key: 'aksi', title: 'Aksi', className: 'w-24 sticky right-0 bg-white/95 backdrop-blur-sm' },
                    ]}
                    data={tableData}
                    filters={columnFilters}
                    onFilterChange={handleColumnFilterChange}
                />
            </div>

            {/* Pagination */}
            {fasilitasLab.last_page > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-600 text-center sm:text-left">
                            Menampilkan {fasilitasLab.from?.toLocaleString('id-ID')} - {fasilitasLab.to?.toLocaleString('id-ID')} dari {fasilitasLab.total?.toLocaleString('id-ID')} data
                        </p>
                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                            {fasilitasLab.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes('Previous')) label = '&laquo;';
                                if (label.includes('Next')) label = '&raquo;';

                                return (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${link.active
                                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                            : link.url
                                                ? 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-100'
                                                : 'bg-white text-slate-300 border border-slate-100 cursor-not-allowed pointer-events-none'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
