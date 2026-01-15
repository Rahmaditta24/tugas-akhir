import React, { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';

export default function Index({ hilirisasi, stats, filters }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // State for filters
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    // Debounce helper
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Debounced filter update to avoid too many requests
    const updateFilters = useCallback(
        debounce((newFilters, newSearch) => {
            router.get(route('admin.hilirisasi.index'), {
                search: newSearch,
                filters: newFilters,
                sort,
                direction,
                perPage
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500),
        [sort, direction, perPage]
    );

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters(columnFilters, search);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        updateFilters(columnFilters, value);
    };

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);
        updateFilters(newFilters, search);
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.hilirisasi.index'), {
            search,
            filters: columnFilters,
            sort,
            direction,
            perPage: next
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (field) => {
        const nextDirection = sort === field && direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.hilirisasi.index'), {
            search,
            filters: columnFilters,
            sort: field,
            direction: nextDirection,
            perPage
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.hilirisasi.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    const fmt = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v).trim();
        if (s === '' || s === '-' || s === '—' || s === '?') return '';
        return s;
    };

    return (
        <AdminLayout title="">
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Data Hilirisasi"
                    subtitle="Kelola data hilirisasi riset"
                    icon={<span className="text-xl">🏭</span>}
                    actions={(
                        <Link href={route('admin.hilirisasi.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">+ Tambah Data</Link>
                    )}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Hilirisasi</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
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
                                <p className="text-2xl font-bold text-slate-800">{stats.withCoordinates}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Table */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Search Bar */}
                    <div className="p-6 border-b">
                        <form onSubmit={handleSearch} className="flex gap-3 items-center flex-wrap">
                            <input
                                type="text"
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Cari berdasarkan judul, nama pengusul, atau perguruan tinggi..."
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="hidden">
                                <button type="submit">Cari</button>
                            </div>
                            {(search || Object.values(columnFilters).some(v => v)) && (
                                <Link
                                    href={route('admin.hilirisasi.index')}
                                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Reset
                                </Link>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-sm text-slate-600">Per halaman</span>
                                <select value={perPage} onChange={handlePerPageChange} className="px-3 py-2 border border-slate-300 rounded-lg">
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
                        localFilterEnabled={false} // Disable client-side filter
                        columnFilterEnabled={true}
                        filters={columnFilters}
                        onFilterChange={handleColumnFilterChange}
                        columns={[
                            { key: 'no', title: 'No', className: 'w-12 text-center' },
                            { key: 'judul', title: 'Judul', sortable: true, render: (v) => <div className="max-w-md truncate" title={v}>{v}</div> },
                            { key: 'nama_pengusul', title: 'Nama Pengusul', sortable: true },
                            {
                                key: 'direktorat',
                                title: 'Direktorat',
                                sortable: true,
                                render: (v) => (
                                    fmt(v) ? <Badge color="purple">{fmt(v)}</Badge> : ''
                                )
                            },
                            { key: 'perguruan_tinggi', title: 'Perguruan Tinggi', sortable: true, render: (v) => <div className="max-w-xs truncate" title={v}>{v}</div> },
                            { key: 'tahun', title: 'Tahun', sortable: true, className: 'w-24 text-center' },
                            /*{ key: 'provinsi', title: 'Provinsi', sortable: true },*/
                            { key: 'aksi', title: 'Aksi', className: 'w-28' },
                        ]}
                        data={(hilirisasi.data || []).map((item, index) => ({
                            ...item,
                            no: (hilirisasi.from || 1) + index,
                            aksi: (
                                <div className="flex gap-2">
                                    <Link href={route('admin.hilirisasi.edit', item.id)} className="text-blue-600 hover:text-blue-900">Edit</Link>
                                    <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </div>
                            ),
                        }))}
                        sort={{ key: sort, direction }}
                        onSort={({ key, direction }) => handleSort(key)}
                    />

                    {/* Pagination */}
                    {hilirisasi.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200/60">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Menampilkan {hilirisasi.from} - {hilirisasi.to} dari {hilirisasi.total} data
                                </div>
                                <div className="flex gap-2">
                                    {hilirisasi.links.map((link, index) => (
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

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Konfirmasi Hapus</h3>
                        <p className="text-slate-600 mb-6">
                            Apakah Anda yakin ingin menghapus data hilirisasi ini?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
