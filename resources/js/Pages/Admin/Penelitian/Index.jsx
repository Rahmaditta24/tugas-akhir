// resources/js/Pages/Admin/Penelitian/Index.jsx
import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';

export default function Index({ penelitian, stats, filters }) {
    // DEBUG: Tambahkan ini untuk cek data
    console.log('📊 penelitian object:', penelitian);
    console.log('📝 penelitian.data:', penelitian?.data);
    console.log('🔍 First item:', penelitian?.data?.[0]);

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Debounce function
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const updateFilters = React.useCallback(
        debounce((newFilters, newSearch) => {
            router.get(route('admin.penelitian.index'), {
                search: newSearch,
                filters: newFilters,
                perPage
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500),
        [perPage]
    );

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);
        updateFilters(newFilters, search);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters(columnFilters, search);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        updateFilters(columnFilters, value);
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.penelitian.index'), {
            search,
            filters: columnFilters,
            perPage: next
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
            router.delete(route('admin.penelitian.destroy', itemToDelete.id), {
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
                <div className="flex gap-2">
                    <Link href={route('admin.penelitian.edit', item.id)} className="text-blue-600 hover:text-blue-900">Edit</Link>
                    <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Hapus</button>
                </div>
            ),
        }));
    }, [penelitian]);

    console.log('✅ Table data processed:', tableData);

    return (
        <AdminLayout title="Data Penelitian">
            <PageHeader
                title="Data Penelitian"
                subtitle="Kelola data penelitian"
                icon={<span className="text-xl">🔬</span>}
                actions={(
                    <Link
                        href={route('admin.penelitian.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Tambah Data
                    </Link>
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
                                <p className="text-2xl font-bold text-slate-800">{stats.withCoordinates}</p>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Search & Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <form onSubmit={handleSearch} className="flex gap-3 items-center flex-wrap">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Cari peneliti, institusi, judul, provinsi..."
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="hidden">
                            <button type="submit">Cari</button>
                        </div>

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
                                className: 'min-w-[180px]',
                                render: (v) => v || '-'
                            },
                            {
                                key: 'judul',
                                title: 'Judul',
                                className: 'min-w-[280px]',
                                render: (v) => (
                                    <div className="max-w-md truncate" title={fmt(v)}>
                                        {fmt(v) || ''}
                                    </div>
                                )
                            },
                            {
                                key: 'institusi',
                                title: 'Institusi',
                                className: 'min-w-[220px]',
                                render: (v) => (
                                    <div className="max-w-xs truncate" title={fmt(v)}>
                                        {fmt(v) || ''}
                                    </div>
                                )
                            },
                            {
                                key: 'kategori_pt',
                                title: 'Kategori PT',
                                className: 'min-w-[130px]',
                                render: (v) => fmt(v) || ''
                            },
                            {
                                key: 'jenis_pt',
                                title: 'Jenis PT',
                                className: 'min-w-[120px]',
                                render: (v) => fmt(v) || ''
                            },
                            /*{
                                key: 'provinsi',
                                title: 'Provinsi',
                                className: 'min-w-[140px]',
                                render: (v) => (
                                    fmt(v) ? <Badge color="slate">{fmt(v)}</Badge> : ''
                                )
                            },*/
                            {
                                key: 'skema',
                                title: 'Skema',
                                className: 'min-w-[200px]',
                                /*render: (v) => (
                                    fmt(v) ? <Badge color="indigo">{fmt(v)}</Badge> : ''
                                )*/
                            },
                            {
                                key: 'tema_prioritas',
                                title: 'Tema Prioritas',
                                className: 'min-w-[180px]',
                                render: (v) => (
                                    fmt(v) ? <Badge color="emerald">{fmt(v)}</Badge> : ''
                                )
                            },
                            {
                                key: 'thn_pelaksanaan',
                                title: 'Tahun',
                                className: 'min-w-[90px] text-center',
                                /*render: (v) => (
                                    fmt(v) ? <Badge color="blue">{fmt(v)}</Badge> : ''
                                )*/
                            },
                            {
                                key: 'bidang_fokus',
                                title: 'Bidang Fokus',
                                className: 'min-w-[160px]',
                                render: (v) => (
                                    fmt(v) ? <Badge color="purple">{fmt(v)}</Badge> : ''
                                )
                            },
                            {
                                key: 'aksi',
                                title: 'Aksi',
                                className: 'w-28',
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
                    <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-600">
                            Menampilkan {penelitian.from} - {penelitian.to} dari {penelitian.total} data
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
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
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Konfirmasi Hapus
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Apakah Anda yakin ingin menghapus data penelitian "{itemToDelete?.nama || itemToDelete?.judul}"?
                            Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setItemToDelete(null);
                                }}
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
