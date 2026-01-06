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
                <div className="flex items-center justify-center gap-2">
                    <Link 
                        href={route('admin.penelitian.edit', item.id)} 
                        className="text-blue-600 hover:text-blue-800 font-medium" 
                        title="Edit"
                    >
                        Edit
                    </Link>
                    <span className="text-slate-300">|</span>
                    <button 
                        onClick={() => handleDelete(item)} 
                        className="text-red-600 hover:text-red-800 font-medium" 
                        title="Hapus"
                    >
                        Hapus
                    </button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Penelitian</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {stats?.total?.toLocaleString('id-ID') || 0}
                            </p>
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
                            <p className="text-2xl font-bold text-slate-900">
                                {stats?.thisYear?.toLocaleString('id-ID') || 0}
                            </p>
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
                            <p className="text-2xl font-bold text-slate-900">
                                {stats?.withCoordinates?.toLocaleString('id-ID') || 0}
                            </p>
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
                                placeholder="Cari peneliti, institusi, judul, provinsi..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg 
                                className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
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
                            { 
                                key: 'kota', 
                                title: 'Kota',
                                className: 'min-w-[140px]',
                                render: (v) => fmt(v) || ''
                            },
                            { 
                                key: 'provinsi', 
                                title: 'Provinsi',
                                className: 'min-w-[140px]',
                                render: (v) => (
                                    fmt(v) ? <Badge color="slate">{fmt(v)}</Badge> : ''
                                )
                            },
                            { 
                                key: 'klaster', 
                                title: 'Klaster',
                                className: 'min-w-[140px]',
                                render: (v) => fmt(v) || ''
                            },
                            { 
                                key: 'skema', 
                                title: 'Skema',
                                className: 'min-w-[140px]',
                                render: (v) => (
                                    fmt(v) ? <Badge color="indigo">{fmt(v)}</Badge> : ''
                                )
                            },
                            { 
                                key: 'thn_pelaksanaan', 
                                title: 'Tahun',
                                className: 'min-w-[90px] text-center',
                                render: (v) => (
                                    fmt(v) ? <Badge color="blue">{fmt(v)}</Badge> : ''
                                )
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
                                key: 'tema_prioritas', 
                                title: 'Tema Prioritas',
                                className: 'min-w-[160px]',
                                render: (v) => (
                                    fmt(v) ? <Badge color="green">{fmt(v)}</Badge> : ''
                                )
                            },
                            { 
                                key: 'aksi', 
                                title: 'Aksi', 
                                className: 'w-32 text-center sticky right-0 bg-white shadow-md',
                                render: (v) => v
                            },
                        ]}
                        data={tableData}
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
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active
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
