import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display } from '../../../Utils/format';

export default function Index({ pengabdian, stats, filters }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);


    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.pengabdian.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);

        router.get(route('admin.pengabdian.index'), {
            search,
            filters: newFilters,
            perPage
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.pengabdian.index'), {
            search,
            type: filters.type || 'multitahun',
            perPage,
            filters: columnFilters
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.pengabdian.index'), {
            search,
            type: filters.type || 'multitahun',
            perPage: next,
            filters: columnFilters
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTypeChange = (type) => {
        router.get(route('admin.pengabdian.index'), {
            type,
            search
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };


    return (
        <AdminLayout title="">
            <div className="space-y-6 max-w-full">
                {/* Header */}
                <PageHeader
                    title="Data Pengabdian"
                    subtitle="Kelola data pengabdian masyarakat"
                    icon={<span className="text-xl">🤝</span>}
                    actions={(
                        <Link href={route('admin.pengabdian.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">+ Tambah Data</Link>
                    )}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📅</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Multitahun</p>
                                <p className="text-2xl font-black text-slate-800">{stats.multitahun?.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📦</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Batch I & II</p>
                                <p className="text-2xl font-black text-slate-800">{stats.batch?.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">🤝</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Kosabangsa</p>
                                <p className="text-2xl font-black text-slate-800">{stats.kosabangsa?.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total Semua</p>
                                <p className="text-2xl font-black text-slate-800">{stats.total?.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Mode Tabs: Multitahun / Batch / Kosabangsa */}
                    <div className="flex border-b overflow-x-auto">
                        <button
                            onClick={() => handleTypeChange('multitahun')}
                            className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${(filters.type || 'multitahun') === 'multitahun'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            📅 Multitahun Lanjutan
                        </button>
                        <button
                            onClick={() => handleTypeChange('batch')}
                            className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${filters.type === 'batch'
                                ? 'border-amber-600 text-amber-600 bg-amber-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            📦 Batch I & II
                        </button>
                        <button
                            onClick={() => handleTypeChange('kosabangsa')}
                            className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${filters.type === 'kosabangsa'
                                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            🤝 Kosabangsa
                        </button>
                    </div>


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
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari judul, peneliti / pengusul, nama institusi..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Cari
                            </button>
                            {(filters.search || Object.values(columnFilters || {}).some(v => v)) && (
                                <Link
                                    href={route('admin.pengabdian.index', { type: filters.type })}
                                    className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Reset
                                </Link>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-sm text-slate-600">Per halaman</span>
                                <select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </form>
                    </div>



                    {/* Table */}
                    <div className="overflow-x-auto">
                        <AdminTable
                            striped
                            columnFilterEnabled
                            columns={[
                                { key: 'no', title: 'No', className: 'w-16 text-center' },
                                { key: 'judul', title: 'Judul Pengabdian', className: 'min-w-[400px]', render: (v) => <div className="line-clamp-4 text-sm leading-relaxed" title={fmt(v)}>{display(v)}</div> },
                                { key: 'nama', title: 'Ketua Pengusul', className: 'min-w-[180px]', render: (v) => display(v) },
                                { key: 'nama_institusi', title: 'Institusi', className: 'min-w-[200px]', render: (v) => <div className="line-clamp-2 text-sm leading-relaxed" title={fmt(v)}>{display(v)}</div> },
                                { key: 'thn_pelaksanaan_kegiatan', title: 'Tahun', className: 'w-24 text-center', render: (v) => <Badge color="blue">{display(v)}</Badge> },
                                { key: 'aksi', title: 'Aksi', className: 'w-28 text-center' },
                            ]}
                            data={(pengabdian.data || []).map((item, index) => ({
                                ...item,
                                no: pengabdian.from + index,
                                aksi: item?.id ? (
                                    <div className="flex gap-2 justify-center">
                                        <Link
                                            href={route('admin.pengabdian.edit', item.id)}
                                            data={{
                                                page: pengabdian.current_page,
                                                type: filters.type || 'multitahun',
                                                search: filters.search || search,
                                                perPage: filters.perPage || perPage,
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
                                ) : null,
                            }))}
                            filters={columnFilters}
                            onFilterChange={handleColumnFilterChange}
                        />
                    </div>

                    {/* Pagination */}
                    {pengabdian.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200/60">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Menampilkan {pengabdian.from?.toLocaleString('id-ID')} - {pengabdian.to?.toLocaleString('id-ID')} dari {pengabdian.total?.toLocaleString('id-ID')} data
                                </div>
                                <div className="flex gap-2">
                                    {pengabdian.links.map((link, index) => (
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
                            Apakah Anda yakin ingin menghapus data pengabdian ini?
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
