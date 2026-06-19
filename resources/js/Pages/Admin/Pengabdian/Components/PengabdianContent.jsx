import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import AdminTable from '@/Components/AdminTable';
import Badge from '@/Components/Badge';
import { fmt, display } from '@/Utils/format';
import { PER_PAGE_OPTIONS } from '@/Constants/options';

export default function PengabdianContent({ context, pengabdian }) {
    const {
        search, handleSearchChange, handleSearch,
        columnFilters, handleColumnFilterChange,
        perPage, handlePerPageChange,
        selectedIds, setSelectedIds,
        isAllSelectedGlobal, setIsAllSelectedGlobal,
        openBulkUpdateModal, handleBulkDelete,
        handleDelete, type, handleTypeChange
    } = context;

    const tableData = useMemo(() => {
        return (pengabdian.data || []).map((item, index) => ({
            ...item,
            no: (pengabdian.from || 0) + index,
            aksi: (
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.pengabdian.edit', item.id)}
                        data={{
                            page: pengabdian.current_page,
                            type,
                            search,
                            perPage,
                            filters: columnFilters
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                    <button onClick={() => handleDelete(item)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        }));
    }, [pengabdian, type, search, perPage, columnFilters]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
            {/* Mode Tabs: Multitahun / Batch / Kosabangsa */}
            <div className="flex border-b overflow-x-auto">
                <button
                    onClick={() => handleTypeChange('batch')}
                    className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${type === 'batch'
                        ? 'border-amber-600 text-amber-600 bg-amber-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    📦 Multitahun, Batch I & Batch II
                </button>
                <button
                    onClick={() => handleTypeChange('kosabangsa')}
                    className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${type === 'kosabangsa'
                        ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    🤝 Kosabangsa
                </button>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-3 self-start sm:self-center">
                            <div className="bg-white text-blue-600 text-xs font-black h-8 px-3 flex items-center justify-center rounded-lg shadow-sm">
                                {isAllSelectedGlobal ? pengabdian.total : selectedIds.length}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-white leading-tight whitespace-nowrap">
                                    Data Terpilih
                                </span>
                                {isAllSelectedGlobal && (
                                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">
                                        Seluruh Halaman
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="h-8 w-px bg-blue-500/50 hidden sm:block"></div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {!isAllSelectedGlobal && (
                                <button
                                    onClick={openBulkUpdateModal}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500/50 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all border border-blue-400/30 shadow-sm flex-1 sm:flex-none"
                                >
                                    <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Update
                                </button>
                            )}
                            <button
                                onClick={handleBulkDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-all shadow-sm border border-red-400/30 flex-1 sm:flex-none"
                            >
                                <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedIds([]);
                            setIsAllSelectedGlobal(false);
                        }}
                        className="w-full sm:w-auto text-xs font-bold text-blue-100 hover:text-white transition-colors bg-blue-700/40 py-2 px-4 rounded-lg border border-blue-500/50 hover:bg-blue-700/60"
                    >
                        Batal
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="p-6 border-b bg-slate-50/50">
                <form onSubmit={handleSearch} className="flex gap-3 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[300px]">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => context.setSearch(e.target.value)}
                            placeholder="Cari judul, peneliti / pengusul, nama institusi..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 sm:px-8 py-1.5 sm:py-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Cari
                    </button>
                    {(search || Object.values(columnFilters || {}).some(v => v)) && (
                        <Link
                            href={route('admin.pengabdian.index', { type })}
                            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-200 text-slate-700 text-sm sm:text-base font-medium rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Reset
                        </Link>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-slate-600 hidden sm:inline">Per halaman</span>
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                        >
                            {PER_PAGE_OPTIONS.map(val => (<option key={val} value={val}>{val}</option>))}
                        </select>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <AdminTable
                    striped
                    columnFilterEnabled
                    selectionEnabled
                    selectedItemIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    columns={[
                        { key: 'no', title: 'No', className: 'w-16 text-center' },
                        { key: 'judul', title: 'Judul Pengabdian', className: 'min-w-[400px]', render: (v) => <div className="line-clamp-4 text-sm leading-relaxed" title={fmt(v)}>{display(v)}</div> },
                        { key: 'nama', title: 'Ketua Pengusul', className: 'min-w-[180px]', render: (v) => display(v) },
                        { key: 'nama_institusi', title: 'Institusi', className: 'min-w-[200px]', render: (v) => <div className="line-clamp-2 text-sm leading-relaxed" title={fmt(v)}>{display(v)}</div> },
                        { key: 'thn_pelaksanaan_kegiatan', title: 'Tahun', className: 'min-w-[120px] text-center', render: (v) => <Badge color="blue">{display(v)}</Badge> },
                        { key: 'aksi', title: 'Aksi', className: 'w-28 text-center sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] shadow-white/80' },
                    ]}
                    data={tableData}
                    filters={columnFilters}
                    onFilterChange={handleColumnFilterChange}
                    totalItems={pengabdian.total}
                    isAllSelectedGlobal={isAllSelectedGlobal}
                    onSelectAllGlobal={() => setIsAllSelectedGlobal(true)}
                    onClearSelection={() => {
                        setSelectedIds([]);
                        setIsAllSelectedGlobal(false);
                    }}
                />
            </div>

            {/* Pagination */}
            {pengabdian.last_page > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-slate-200/60">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div className="text-sm text-slate-600">
                            Menampilkan {pengabdian.from?.toLocaleString('id-ID')} - {pengabdian.to?.toLocaleString('id-ID')} dari {pengabdian.total?.toLocaleString('id-ID')} data
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                            {pengabdian.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes('Previous')) label = '&laquo;';
                                if (label.includes('Next')) label = '&raquo;';

                                return (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${link.active
                                            ? 'bg-blue-600 text-white shadow-sm'
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
