import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display } from '../../../Utils/format';

export default function Index({ fasilitasLab, stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [columnFilters, setColumnFilters] = useState(filters.filters || {});
    const [toolsModal, setToolsModal] = useState({ show: false, title: '', items: [] });

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);

        router.get(route('admin.fasilitas-lab.index'), {
            search,
            filters: newFilters,
            perPage,
            sort,
            direction
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
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
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.fasilitas-lab.index'), {
            search,
            filters: columnFilters,
            perPage,
            sort,
            direction
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
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
            preserveScroll: true,
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
    }, [fasilitasLab]);

    return (
        <AdminLayout title="">
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
                                <p className="text-2xl font-bold text-slate-800">{(stats.total || fasilitasLab.total || 0).toLocaleString('id-ID')}</p>
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
                <div className="bg-white rounded-lg shadow-sm">
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
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Cari
                            </button>

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
                            localFilterEnabled={false}
                            emptyText="Tidak ada data fasilitas laboratorium"
                            columns={[
                                { key: 'no', title: 'No', className: 'w-16 text-center' },
                                { key: 'nama_laboratorium', title: 'Nama Lab', className: 'min-w-[200px]', sortable: true, render: (v) => <div className="truncate" title={fmt(v)}>{display(v)}</div> },
                                { key: 'institusi', title: 'Institusi', className: 'min-w-[180px]', sortable: true, render: (v) => <div className="truncate" title={fmt(v)}>{display(v)}</div> },
                                {
                                    key: 'nama_alat',
                                    title: 'Nama Alat',
                                    className: 'min-w-[300px] py-4',
                                    render: (v, row) => {
                                        const cleaned = fmt(v);
                                        if (!cleaned) return display(v);
                                        const items = cleaned.split(/\r?\n|;\s*/).map(i => i.replace(/^\d+\.\s*/, '').trim()).filter(i => i !== '');
                                        if (items.length === 0) return display(v);

                                        return (
                                            <div className="space-y-1">
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    {items.slice(0, 4).map((item, i) => (
                                                        <li key={i} className="truncate" title={item}>
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
                                { key: 'total_jumlah_alat', title: 'Total Jumlah Alat', className: 'w-32 text-center', sortable: true, render: (v) => <Badge color="blue">{display(v === 0 ? '0' : v)}</Badge> },
                                { key: 'kontak', title: 'Kontak', className: 'min-w-[140px]', render: (v) => display(v) },
                                { key: 'aksi', title: 'Aksi', className: 'w-24' },
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
                        <div className="px-6 py-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Menampilkan {fasilitasLab.from?.toLocaleString('id-ID')} - {fasilitasLab.to?.toLocaleString('id-ID')} dari {fasilitasLab.total?.toLocaleString('id-ID')} data
                                </p>
                                <div className="flex gap-2">
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
                        </div>
                    )}
                </div>
            </div>

            {/* Tools Modal */}
            {toolsModal.show && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Daftar Alat</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{toolsModal.title}</p>
                            </div>
                            <button
                                onClick={() => setToolsModal({ show: false, title: '', items: [] })}
                                className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                {toolsModal.items.map((item, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-slate-700 py-1.5 border-b border-slate-50 last:border-0 group">
                                        {toolsModal.items.length > 1 && (
                                            <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                {i + 1}
                                            </span>
                                        )}
                                        <span className="leading-relaxed pt-0.5">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium">Total: {toolsModal.items.length} Alat</span>
                            <button
                                onClick={() => setToolsModal({ show: false, title: '', items: [] })}
                                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Hapus</h3>
                        <p className="text-slate-600 mb-6 leading-relaxed text-sm">Apakah Anda yakin ingin menghapus data fasilitas ini? Tindakan ini akan menghapus data secara permanen dari server.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">Batal</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm shadow-red-200">Hapus Data</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}


