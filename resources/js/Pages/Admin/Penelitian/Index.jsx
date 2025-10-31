import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';

export default function Index({ penelitian, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.penelitian.index'), { search }, {
            preserveState: true,
            preserveScroll: true,
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

    return (
        <AdminLayout title="">
            <PageHeader
                title="Data Penelitian"
                subtitle="Kelola data penelitian"
                icon={<span className="text-xl">🔬</span>}
                actions={(
                    <Link href={route('admin.penelitian.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Tambah Data</Link>
                )}
            />
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Penelitian</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <span className="text-2xl">🔬</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Data Tahun Ini</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.thisYear.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <span className="text-2xl">📅</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Dengan Koordinat</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.withCoordinates.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <span className="text-2xl">📍</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari peneliti, institusi, judul..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </form>

                    {/* Add Button */}
                    <Link
                        href={route('admin.penelitian.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Data
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <AdminTable
                        striped
                        localFilterEnabled
                        columnFilterEnabled
                        columns={[
                            { key: 'no', title: 'No', className: 'w-12' },
                            { key: 'nama', title: 'Peneliti' },
                            { key: 'institusi', title: 'Institusi', render: (v) => <div className="max-w-xs truncate">{v}</div> },
                            { key: 'judul', title: 'Judul', render: (v, row) => <div className="max-w-xs truncate" title={v}>{v}</div> },
                            { key: 'thn_pelaksanaan', title: 'Tahun', render: (v) => <Badge color="blue">{v || '-'}</Badge> },
                            { key: 'bidang_fokus', title: 'Bidang Fokus', render: (v) => <Badge color="purple">{v || '-'}</Badge> },
                            { key: 'aksi', title: 'Aksi', className: 'w-24' },
                        ]}
                        data={(penelitian.data || []).map((item, index) => ({
                            ...item,
                            no: penelitian.from + index,
                            aksi: (
                                <div className="flex items-center justify-center gap-2">
                                    <Link href={route('admin.penelitian.edit', item.id)} className="text-blue-600 hover:text-blue-800" title="Edit">Edit</Link>
                                    <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800" title="Hapus">Hapus</button>
                                </div>
                            ),
                        }))}
                    />
                </div>

                {/* Pagination */}
                {penelitian.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200/60 flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Menampilkan {penelitian.from} - {penelitian.to} dari {penelitian.total} data
                        </p>
                        <div className="flex gap-2">
                            {penelitian.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
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
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Konfirmasi Hapus</h3>
                        <p className="text-slate-600 mb-6">
                            Apakah Anda yakin ingin menghapus data penelitian ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
