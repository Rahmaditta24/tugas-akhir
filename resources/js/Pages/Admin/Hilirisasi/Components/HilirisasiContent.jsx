import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import AdminTable from '@/Components/AdminTable';
import Badge from '@/Components/Badge';
import { fmt, display, titleCase } from '@/Utils/format';
import { PER_PAGE_OPTIONS } from '@/Constants/options';

export default function HilirisasiContent({ context, hilirisasi }) {
    const {
        search, handleSearchChange, handleSearch,
        columnFilters, handleColumnFilterChange,
        perPage, handlePerPageChange,
        selectedIds, setSelectedIds,
        isAllSelectedGlobal, setIsAllSelectedGlobal,
        openBulkUpdateModal, handleBulkDelete,
        handleDelete,
        sort, direction
    } = context;

    const normalizeDegrees = (str) => {
        let s = String(str || '').trim();
        s = s.replace(/\\s+/g, ' ').replace(/\\.+/g, '.'); // rapikan spasi dan titik beruntun
        const key = s.replace(/[^a-z]/gi, '').toLowerCase(); // hilangkan tanda baca untuk kunci
        const map = {
            drs: 'Drs.',
            dr: 'Dr.',
            st: 'S.T.',
            mt: 'M.T.',
            stp: 'S.TP.',
            mtp: 'M.TP.',
            skom: 'S.Kom.',
            mkom: 'M.Kom.',
            se: 'S.E.',
            mm: 'M.M.',
            spd: 'S.Pd.',
            mpd: 'M.Pd.',
            ssi: 'S.Si.',
            msi: 'M.Si.',
            skes: 'S.Kes.',
            mkes: 'M.Kes.',
            deng: 'D.Eng.',
        };
        return map[key] || s;
    };

    const normalizeNameWithDegrees = (v) => {
        const s = fmt(v);
        if (!s) return '';
        const parts = s.split(/\\s*,\\s*/);
        const name = titleCase(parts[0]);
        const degrees = parts.slice(1).map(p => normalizeDegrees(p)).filter(Boolean);
        return [name, ...degrees].join(', ');
    };

    const tableData = useMemo(() => {
        return (hilirisasi.data || []).map((item, index) => ({
            ...item,
            no: (hilirisasi.from || 1) + index,
            aksi: (
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.hilirisasi.edit', item.id)}
                        data={{
                            page: hilirisasi.current_page,
                            search,
                            filters: columnFilters,
                            perPage,
                            sort,
                            direction
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
    }, [hilirisasi, search, columnFilters, perPage, sort, direction]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-600/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-10 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-3 self-start sm:self-center">
                            <div className="bg-white text-blue-600 text-xs sm:text-sm font-black h-8 sm:h-10 px-3 sm:px-4 flex items-center justify-center rounded-xl shadow-lg border-2 border-white">
                                {isAllSelectedGlobal ? hilirisasi.total : selectedIds.length}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-black text-white leading-tight uppercase tracking-wider">
                                    Data Terpilih
                                </span>
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
            {/* Search Bar */}
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
                            href={route('admin.hilirisasi.index')}
                            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-200 text-slate-700 text-sm sm:text-base rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Reset
                        </Link>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-slate-600 hidden sm:inline">Per halaman</span>
                        <select value={perPage} onChange={handlePerPageChange} className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm">
                            {PER_PAGE_OPTIONS.map(val => (<option key={val} value={val}>{val}</option>))}
                        </select>
                    </div>
                </form>
            </div>
            {/* Table */}
            <AdminTable
                striped
                localFilterEnabled={false}
                columnFilterEnabled={true}
                selectionEnabled
                selectedItemIds={selectedIds}
                onSelectionChange={setSelectedIds}
                totalItems={hilirisasi.total}
                isAllSelectedGlobal={isAllSelectedGlobal}
                onSelectAllGlobal={() => setIsAllSelectedGlobal(true)}
                onClearSelection={() => {
                    setSelectedIds([]);
                    setIsAllSelectedGlobal(false);
                }}
                filters={columnFilters}
                onFilterChange={handleColumnFilterChange}
                columns={[
                    { key: 'no', title: 'No', className: 'w-12 text-center' },
                    { key: 'judul', title: 'Judul', className: 'min-w-[320px]', render: (v) => (<div className="max-w-md line-clamp-4 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                    { key: 'nama_pengusul', title: 'Nama Pengusul', render: (v) => normalizeNameWithDegrees(v) },
                    {
                        key: 'direktorat',
                        title: 'Direktorat',
                        className: 'min-w-[220px]',
                        render: (v) => (
                            <Badge color="purple">{display(v)}</Badge>
                        )
                    },
                    { key: 'skema', title: 'Skema', className: 'min-w-[220px]', render: (v) => (<div className="max-w-md line-clamp-3 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                    { key: 'perguruan_tinggi', title: 'Perguruan Tinggi', className: 'min-w-[200px]', render: (v) => (<div className="max-w-md line-clamp-2 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                    {
                        key: 'tahun',
                        title: 'Tahun',
                        className: 'min-w-[120px] text-center',
                        render: (v) => <Badge color="blue">{display(v)}</Badge>
                    },
                    { key: 'mitra', title: 'Mitra', className: 'min-w-[320px]', render: (v) => <div className="max-w-md line-clamp-4 whitespace-normal leading-snug" title={titleCase(v)}>{display(titleCase(v))}</div> },
                    { key: 'aksi', title: 'Aksi', className: 'w-28 sticky right-0 bg-white/95 backdrop-blur-sm' },
                ]}
                data={tableData}
            />

            {/* Pagination */}
            {hilirisasi.last_page > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-slate-200/60">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-600 text-center sm:text-left">
                            Menampilkan {hilirisasi.from?.toLocaleString('id-ID')} - {hilirisasi.to?.toLocaleString('id-ID')} dari {hilirisasi.total?.toLocaleString('id-ID')} data
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                            {hilirisasi.links.map((link, index) => {
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
