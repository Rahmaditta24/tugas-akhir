import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import AdminTable from '@/Components/AdminTable';
import Badge from '@/Components/Badge';
import { fmt, display, sentenceCase } from '@/Utils/format';
import { PER_PAGE_OPTIONS } from '@/Constants/options';

export default function PenelitianContent({ context, penelitian }) {
    const {
        search, handleSearchChange, handleSearch,
        columnFilters, handleColumnFilterChange,
        perPage, handlePerPageChange,
        selectedIds, setSelectedIds,
        isAllSelectedGlobal, setIsAllSelectedGlobal,
        openBulkUpdateModal, handleBulkDelete,
        handleDelete
    } = context;

    const normalizeTema = (v) => {
        const s = fmt(v);
        if (!s) return 'Tidak Memilih';
        return sentenceCase(s);
    };

    const tableData = useMemo(() => {
        if (!penelitian?.data || !Array.isArray(penelitian.data)) {
            return [];
        }

        return penelitian.data.map((item, index) => ({
            ...item,
            no: (penelitian.from || 0) + index,
            aksi: (
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.penelitian.edit', item.id)}
                        data={{
                            page: penelitian.current_page,
                            search,
                            filters: columnFilters,
                            perPage
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                        title="Edit"
                    >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                    <button
                        onClick={() => handleDelete(item)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                        title="Hapus"
                    >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        }));
    }, [penelitian, search, columnFilters, perPage]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-600/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-10 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-3 self-start sm:self-center">
                            <div className="bg-white text-blue-600 text-xs sm:text-sm font-black h-8 sm:h-10 px-3 sm:px-4 flex items-center justify-center rounded-xl shadow-lg border-2 border-white">
                                {isAllSelectedGlobal ? penelitian.total : selectedIds.length}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-black text-white leading-tight uppercase tracking-wider">
                                    Data Terpilih
                                </span>
                                {isAllSelectedGlobal && (
                                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">
                                        Seluruh Halaman
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="h-8 w-px bg-white/20 hidden md:block"></div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {!isAllSelectedGlobal && (
                                <button
                                    onClick={openBulkUpdateModal}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/20 shadow-sm flex-1 sm:flex-none active:scale-95"
                                    title="Update massal"
                                >
                                    <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="hidden sm:inline">Update</span>
                                </button>
                            )}
                            <button
                                onClick={handleBulkDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-all shadow-lg border border-red-400/30 flex-1 sm:flex-none active:scale-95"
                                title="Hapus massal"
                            >
                                <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="hidden sm:inline">Hapus</span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedIds([]);
                            setIsAllSelectedGlobal(false);
                        }}
                        className="w-full sm:w-auto text-xs font-bold text-blue-50 hover:text-white transition-all bg-white/10 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/20 active:scale-95"
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
                        placeholder="Cari judul, peneliti / pengusul, nama institusi..."
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
                            href={route('admin.penelitian.index')}
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
                    columnFilterEnabled
                    selectionEnabled
                    selectedItemIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    isAllSelectedGlobal={isAllSelectedGlobal}
                    onSelectAllGlobal={() => setIsAllSelectedGlobal(true)}
                    onClearSelection={() => {
                        setSelectedIds([]);
                        setIsAllSelectedGlobal(false);
                    }}
                    emptyText="Tidak ada data penelitian"
                    columns={[
                        { key: 'no', title: 'No', className: 'w-16 text-center' },
                        { key: 'nama', title: 'Peneliti', className: 'min-w-[180px]', render: (v) => display(v) },
                        {
                            key: 'judul',
                            title: 'Judul',
                            className: 'min-w-[420px]',
                            render: (v) => (
                                <div className="max-w-md line-clamp-4 whitespace-normal leading-snug" title={fmt(v)}>
                                    {display(v)}
                                </div>
                            )
                        },
                        {
                            key: 'institusi',
                            title: 'Institusi',
                            className: 'min-w-[200px]',
                            render: (v) => (
                                <div className="max-w-md line-clamp-2 whitespace-normal leading-snug" title={fmt(v)}>
                                    {display(v)}
                                </div>
                            )
                        },
                        { key: 'provinsi', title: 'Provinsi', className: 'min-w-[140px]', render: (v) => <Badge color="slate">{display(v)}</Badge> },
                        { key: 'thn_pelaksanaan', title: 'Tahun', className: 'min-w-[160px] text-center', render: (v) => <Badge color="blue">{display(v)}</Badge> },
                        { key: 'bidang_fokus', title: 'Bidang Fokus', className: 'min-w-[160px]', render: (v) => <Badge color="purple">{display(v, 'Umum')}</Badge> },
                        { key: 'tema_prioritas', title: 'Tema Prioritas', className: 'min-w-[180px]', render: (v) => <Badge color="emerald">{normalizeTema(v)}</Badge> },
                        { key: 'aksi', title: 'Aksi', className: 'w-28 text-center sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] shadow-white/80', filterable: false }
                    ]}
                    data={tableData}
                    filters={columnFilters}
                    onFilterChange={handleColumnFilterChange}
                />
            </div>

            {/* Pagination */}
            {penelitian?.last_page > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-600 text-center sm:text-left">
                            Menampilkan {penelitian.from?.toLocaleString('id-ID')} - {penelitian.to?.toLocaleString('id-ID')} dari {penelitian.total?.toLocaleString('id-ID')} data
                        </p>
                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                            {penelitian.links.map((link, index) => {
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
