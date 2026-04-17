import React, { useState, useMemo, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display } from '../../../Utils/format';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function Index({ produk, stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});



    // --- Bulk selection ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        router.post(route('admin.produk.bulk-destroy'), { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteModal(false);
            },
            onError: () => {
                setShowBulkDeleteModal(false);
                toast.error('Gagal menghapus data.');
            }
        });
    };

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);

        router.get(route('admin.produk.index'), {
            search,
            filters: newFilters,
            perPage,
            sort,
            direction
        }, {
            only: ['produk'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSort = (field) => {
        const nextDirection = sort === field && direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.produk.index'), {
            search,
            filters: columnFilters,
            perPage,
            sort: field,
            direction: nextDirection,
        }, {
            only: ['produk'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.produk.index'), {
            search,
            filters: columnFilters,
            perPage: next,
            sort,
            direction
        }, {
            only: ['produk'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.produk.index'), {
            search,
            filters: columnFilters,
            perPage,
            sort,
            direction
        }, {
            only: ['produk'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.produk.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    // --- Import / Export ---
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                router.post(route('admin.produk.import-excel'), { data: data }, {
                    onSuccess: () => {
                        setIsImporting(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    },
                    onError: () => {
                        setIsImporting(false);
                    }
                });
            } catch (err) {
                setIsImporting(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleExport = () => {
        const params = new URLSearchParams({ search });
        if (search) params.set('search', search);
        Object.entries(columnFilters).forEach(([k, v]) => v && params.append(`filters[${k}]`, v));
        if (selectedIds.length > 0) {
            params.append('ids', selectedIds.join(','));
        }

        window.location.href = route('admin.produk.export-csv') + '?' + params.toString();
    };


    const tableData = useMemo(() => {
        return (produk.data || []).map((item, index) => ({
            ...item,
            no: (produk.from || 1) + index,
            aksi: (
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.produk.edit', item.id)}
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
    }, [produk, search, columnFilters, perPage]);

    return (
        <AdminLayout title="">
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Data Produk"
                    subtitle="Kelola data produk dan paten"
                    icon={<span className="text-xl">📦</span>}
                    actions={(
                        <div className="flex gap-2">
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                {selectedIds.length > 0 ? `Export CSV (${selectedIds.length})` : 'Export CSV'}
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isImporting}
                                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center text-sm font-medium shadow-sm disabled:opacity-50"
                            >
                                {isImporting ? (
                                    <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                ) : (
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                )}
                                {isImporting ? 'Proses...' : 'Import Data'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv, .xlsx, .xls" className="hidden" />
                            <Link href={route('admin.produk.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm">+ Tambah</Link>
                        </div>
                    )}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Produk</p>
                                <p className="text-2xl font-bold text-slate-800">{(stats.total || 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Dengan Koordinat</p>
                                <p className="text-2xl font-bold text-slate-800">{(stats.withCoordinates || 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 z-20 bg-blue-600 text-white p-3 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
                            <div className="flex items-center gap-4 ml-2">
                                <span className="text-sm font-semibold whitespace-nowrap">
                                    {selectedIds.length} data terpilih
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Hapus {selectedIds.length} Data
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-md transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Search Bar */}
                    <div className="p-6 border-b">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari berdasarkan nama produk, institusi, atau bidang..."
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Cari
                            </button>
                            {(search || Object.values(columnFilters).some(v => v)) && (
                                <Link
                                    href={route('admin.produk.index')}
                                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Reset
                                </Link>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-sm text-slate-600">Per halaman</span>
                                <select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <AdminTable
                        striped
                        columnFilterEnabled
                        selectionEnabled
                        selectedItemIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        sort={sort}
                        direction={direction}
                        onSort={handleSort}
                        columnFilters={columnFilters}
                        onColumnFilterChange={handleColumnFilterChange}
                        data={tableData}
                        pagination={produk}
                        columns={[
                            { key: 'no', title: 'No', className: 'w-12 text-center' },
                            { key: 'nama_produk', title: 'Nama Produk', sortable: true, className: 'min-w-[400px]', render: (v) => <div className="line-clamp-4 text-sm leading-relaxed" title={fmt(v)}>{display(v)}</div> },
                            { key: 'institusi', title: 'Institusi', sortable: true, render: (v) => <div className="max-w-xs truncate" title={fmt(v)}>{display(v)}</div> },
                            { key: 'bidang', title: 'Bidang', sortable: true, className: 'min-w-[100px]', render: (v) => <Badge color="purple">{display(v)}</Badge> },
                            { key: 'tkt', title: 'TKT', sortable: true, className: 'min-w-[120px] text-center', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                            { key: 'aksi', title: 'Aksi', className: 'w-28 text-center sticky right-0 bg-white/95 backdrop-blur-sm' },
                        ]}
                    />

                    {/* Pagination */}
                    {produk.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200/60">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Menampilkan {produk.from?.toLocaleString('id-ID')} - {produk.to?.toLocaleString('id-ID')} dari {produk.total?.toLocaleString('id-ID')} data
                                </div>
                                <div className="flex gap-2">
                                    {produk.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded ${link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Individual Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed text-sm">
                            Data produk ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus {selectedIds.length} Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed text-sm">
                            Seluruh data produk terpilih ({selectedIds.length} item) akan dihapus secara permanen.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                            >
                                Ya, Hapus Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
