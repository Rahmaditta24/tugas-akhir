// resources/js/Pages/Admin/Penelitian/Index.jsx
import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display, sentenceCase } from '../../../Utils/format';

import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
export default function Index({ penelitian, stats, filters }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        router.post(route('admin.penelitian.bulk-destroy'), { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteModal(false);
            },
            onError: () => {
                setShowBulkDeleteModal(false);
            }
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.penelitian.index'), {
            search,
            filters: columnFilters,
            perPage
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);

        router.get(route('admin.penelitian.index'), {
            search,
            filters: newFilters,
            perPage
        }, {
            only: ['penelitian'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.penelitian.index'), {
            search,
            filters: columnFilters,
            perPage: next
        }, {
            only: ['penelitian'],
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
            router.delete(route('admin.penelitian.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    const normalizeSkema = (v) => {
        const s = fmt(v);
        if (!s) return 'null';
        return sentenceCase(s);
    };
    const normalizeTema = (v) => {
        const s = fmt(v);
        if (!s) return 'Tidak Memilih';
        return sentenceCase(s);
    };

    // PERBAIKAN: Pastikan data ada dan valid
    const tableData = React.useMemo(() => {
        if (!penelitian?.data || !Array.isArray(penelitian.data)) {
            console.warn('⚠️ Data penelitian kosong atau bukan array');
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
    }, [penelitian]);

    console.log('✅ Table data processed:', tableData);

    const fileInputRef = React.useRef(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async (e) => {
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

                if (data.length === 0) {
                    setIsImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                router.post(route('admin.penelitian.import-excel'), { data: data }, {
                    onSuccess: () => {
                        setIsImporting(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    },
                    onError: (errors) => {
                        console.error(errors);
                        setIsImporting(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                });
            } catch (error) {
                console.error(error);
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (Object.keys(columnFilters).length > 0) {
            Object.entries(columnFilters).forEach(([k, v]) => {
                if (v) params.set(`filters[${k}]`, v);
            });
        }
        if (selectedIds.length > 0) {
            params.set('ids', selectedIds.join(','));
        }

        const url = `/admin/penelitian/export-csv?${params.toString()}`;
        window.location.href = url;
    };

    return (
        <AdminLayout title="">
            <PageHeader
                title="Data Penelitian"
                subtitle="Kelola data penelitian"
                icon={<span className="text-xl">🔬</span>}
                actions={(
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm font-medium"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            {selectedIds.length > 0 ? `Export CSV (${selectedIds.length})` : 'Export CSV'}
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center text-sm font-medium disabled:opacity-50"
                        >
                            {isImporting ? (
                                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                            ) : (
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                            )}
                            {isImporting ? 'Proses...' : 'Import Data'}
                        </button>
                        <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImport}
                        />

                        <Link
                            href={route('admin.penelitian.create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium ml-2"
                        >
                            + Tambah
                        </Link>
                    </div>
                )}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <span className="text-2xl">🔬</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Total Penelitian</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {stats?.total?.toLocaleString('id-ID') || 0}
                            </p>
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
                            <p className="text-2xl font-bold text-slate-800">{stats?.withCoordinates?.toLocaleString('id-ID') || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar — only visible when items are selected */}
            {selectedIds.length > 0 && (
                <div className="mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-between shadow-md">
                    <span className="font-medium text-sm">
                        ☑ <strong>{selectedIds.length}</strong> baris dipilih
                    </span>
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
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-md transition-colors"
                        >
                            ✕ Batal
                        </button>
                    </div>
                </div>
            )}

            {/* Search & Table */}
            <div className="bg-white rounded-lg shadow-sm">
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
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Cari
                        </button>

                        {(search || Object.values(columnFilters).some(v => v)) && (
                            <Link
                                href={route('admin.penelitian.index')}
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

                <div className="overflow-x-auto">
                    <AdminTable
                        striped
                        columnFilterEnabled
                        selectionEnabled
                        selectedItemIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        sort={{ key: filters.sort, direction: filters.direction }}
                        emptyText="Tidak ada data penelitian"
                        columns={[
                            {
                                key: 'no',
                                title: 'No',
                                className: 'w-16 text-center',
                                render: (v) => v
                            },
                            {
                                key: 'nama',
                                title: 'Peneliti',
                                sortable: true,
                                className: 'min-w-[180px]',
                                render: (v) => display(v)
                            },
                            {
                                key: 'judul',
                                title: 'Judul',
                                sortable: true,
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
                                sortable: true,
                                className: 'min-w-[200px]',
                                render: (v) => (
                                    <div className="max-w-md line-clamp-2 whitespace-normal leading-snug" title={fmt(v)}>
                                        {display(v)}
                                    </div>
                                )
                            },
                            {
                                key: 'provinsi',
                                title: 'Provinsi',
                                sortable: true,
                                className: 'min-w-[140px]',
                                render: (v) => (
                                    <Badge color="slate">{display(v)}</Badge>
                                )
                            },
                            {
                                key: 'thn_pelaksanaan',
                                title: 'Tahun',
                                sortable: true,
                                className: 'min-w-[160px] text-center',
                                render: (v) => <Badge color="blue">{display(v)}</Badge>
                            },
                            {
                                key: 'bidang_fokus',
                                title: 'Bidang Fokus',
                                className: 'min-w-[160px]',
                                render: (v) => (
                                    <Badge color="purple">{display(v, 'Umum')}</Badge>
                                )
                            },
                            {
                                key: 'tema_prioritas',
                                title: 'Tema Prioritas',
                                className: 'min-w-[180px]',
                                render: (v) => (
                                    <Badge color="emerald">{normalizeTema(v)}</Badge>
                                )
                            },
                            {
                                key: 'aksi',
                                title: 'Aksi',
                                className: 'w-28 text-center sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] shadow-white/80',
                                filterable: false,
                                render: (v) => v
                            },
                        ]}
                        data={tableData}
                        filters={columnFilters}
                        onFilterChange={handleColumnFilterChange}
                    />
                </div>

                {/* Pagination */}
                {penelitian?.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                                Menampilkan {penelitian.from?.toLocaleString('id-ID')} - {penelitian.to?.toLocaleString('id-ID')} dari {penelitian.total?.toLocaleString('id-ID')} data
                            </p>
                            <div className="flex gap-2">
                                {penelitian.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded text-sm ${link.active
                                            ? 'bg-blue-600 text-white font-semibold'
                                            : link.url
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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

            {/* Single Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Konfirmasi Hapus</h3>
                        <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus data penelitian ini?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setItemToDelete(null); }}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >Batal</button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Hapus {selectedIds.length} Data?</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Tindakan ini akan menghapus <strong>{selectedIds.length} data penelitian</strong> secara permanen dan tidak dapat dikembalikan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >Batal</button>
                            <button
                                onClick={confirmBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >Ya, Hapus Semuanya</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
