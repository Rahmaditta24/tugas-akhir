import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';

export default function Index({ fasilitasLab, stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

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
            router.get(route('admin.fasilitas-lab.index'), {
                search: newSearch,
                filters: newFilters,
                perPage,
                sort,
                direction
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500),
        [perPage, sort, direction]
    );

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);
        updateFilters(newFilters, search);
    };

    const handleSort = (field) => {
        const nextDirection = sort === field && direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.fasilitas-lab.index'), {
            search,
            filters: columnFilters,
            perPage,
            sort: field,
            direction: nextDirection,
        }, {
            preserveState: true,
            replace: true,
        });
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
        router.get(route('admin.fasilitas-lab.index'), {
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
        if (!itemToDelete) return;
        router.delete(route('admin.fasilitas-lab.destroy', itemToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setItemToDelete(null);
            },
        });
    };

    const tableData = React.useMemo(() => {
        if (!fasilitasLab?.data || !Array.isArray(fasilitasLab.data)) {
            return [];
        }

        return fasilitasLab.data.map((item, index) => ({
            ...item,
            no: (fasilitasLab.from || 0) + index,
            aksi: (
                <div className="flex gap-2">
                    <Link href={route('admin.fasilitas-lab.edit', item.id)} className="text-blue-600 hover:text-blue-900">Edit</Link>
                    <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">Hapus</button>
                </div>
            ),
        }));
    }, [fasilitasLab]);

    return (
        <AdminLayout title="Data Fasilitas Lab">
            <div className="space-y-6 max-w-full">
                {/* Header */}
                <PageHeader
                    title="Data Fasilitas Lab"
                    subtitle="Kelola data fasilitas laboratorium"
                    icon={<span className="text-xl">🧪</span>}
                    actions={(
                        <Link
                            href={route('admin.fasilitas-lab.create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            + Tambah Data
                        </Link>
                    )}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Fasilitas</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.total || fasilitasLab.total || 0}</p>
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
                                <p className="text-2xl font-bold text-slate-800">{stats.withCoordinates || 0}</p>
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
                                placeholder="Cari nama laboratorium, institusi, provinsi, kota..."
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {(search || Object.values(columnFilters).some(v => v)) && (
                                <Link
                                    href={route('admin.fasilitas-lab.index')}
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
                            localFilterEnabled={false}
                            emptyText="Tidak ada data fasilitas laboratorium"
                            columns={[
                                { key: 'no', title: 'No', className: 'w-16 text-center' },
                                { key: 'nama_laboratorium', title: 'Nama Lab', className: 'min-w-[200px]', sortable: true, render: (v) => <div className="truncate" title={v}>{v || '-'}</div> },
                                { key: 'institusi', title: 'Institusi', className: 'min-w-[200px]', sortable: true },
                                { key: 'total_jumlah_alat', title: 'Total Jumlah Alat', className: 'w-32 text-center', sortable: true },
                                { key: 'kontak', title: 'Kontak', className: 'min-w-[150px]' },
                                { key: 'aksi', title: 'Aksi', className: 'w-28' },
                            ]}
                            data={tableData}
                            filters={columnFilters}
                            onFilterChange={handleColumnFilterChange}
                            sort={{ key: sort, direction }}
                            onSort={({ key }) => handleSort(key)}
                        />
                    </div>

                    {/* Pagination */}
                    {fasilitasLab.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-600">
                                Menampilkan {fasilitasLab.from} - {fasilitasLab.to} dari {fasilitasLab.total} data
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {fasilitasLab.links.map((link, index) => (
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
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Konfirmasi Hapus</h3>
                        <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus data fasilitas ini? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">Batal</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}


