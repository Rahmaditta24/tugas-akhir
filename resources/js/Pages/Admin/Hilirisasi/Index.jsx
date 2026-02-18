import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display, titleCase } from '../../../Utils/format';

export default function Index({ hilirisasi, stats, filters }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // State for filters
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.hilirisasi.index'), {
            search,
            filters: columnFilters,
            sort,
            direction,
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

        router.get(route('admin.hilirisasi.index'), {
            search,
            filters: newFilters,
            sort,
            direction,
            perPage
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
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
            preserveScroll: true,
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
            router.delete(route('admin.hilirisasi.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    const normalizeDegrees = (str) => {
        let s = String(str || '').trim();
        s = s.replace(/\s+/g, ' ').replace(/\.+/g, '.'); // rapikan spasi dan titik beruntun
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
        const parts = s.split(/\s*,\s*/);
        const name = titleCase(parts[0]);
        const degrees = parts.slice(1).map(p => normalizeDegrees(p)).filter(Boolean);
        return [name, ...degrees].join(', ');
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
                                <p className="text-2xl font-bold text-slate-800">{(stats?.total ?? 0).toLocaleString('id-ID')}</p>
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
                                <p className="text-2xl font-bold text-slate-800">{(stats?.withCoordinates ?? 0).toLocaleString('id-ID')}</p>
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
                            { key: 'judul', title: 'Judul', className: 'min-w-[320px]', render: (v) => (<div className="max-w-md line-clamp-4 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                            { key: 'nama_pengusul', title: 'Nama Pengusul', sortable: true, render: (v) => normalizeNameWithDegrees(v) },
                            {
                                key: 'direktorat',
                                title: 'Direktorat',
                                sortable: true,
                                render: (v) => (
                                    <Badge color="purple">{display(v)}</Badge>
                                )
                            },
                            { key: 'skema', title: 'Skema', className: 'min-w-[280px]', render: (v) => (<div className="max-w-md line-clamp-3 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                            { key: 'perguruan_tinggi', title: 'Perguruan Tinggi', className: 'min-w-[200px]', render: (v) => (<div className="max-w-md line-clamp-2 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                            {
                                key: 'tahun',
                                title: 'Tahun',
                                className: 'w-24 text-center',
                                render: (v) => <Badge color="blue">{display(v)}</Badge>
                            },
                            { key: 'mitra', title: 'Mitra', sclassName: 'min-w-[320px]', render: (v) => <div className="max-w-md line-clamp-4 whitespace-normal leading-snug" title={titleCase(v)}>{display(titleCase(v))}</div> },
                            { key: 'aksi', title: 'Aksi', className: 'w-28' },
                        ]}
                        data={(hilirisasi.data || []).map((item, index) => ({
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
                        }))}
                        sort={{ key: sort, direction }}
                        onSort={({ key, direction }) => handleSort(key)}
                    />

                    {/* Pagination */}
                    {hilirisasi.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200/60">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Menampilkan {hilirisasi.from?.toLocaleString('id-ID')} - {hilirisasi.to?.toLocaleString('id-ID')} dari {hilirisasi.total?.toLocaleString('id-ID')} data
                                </div>
                                <div className="flex gap-2">
                                    {hilirisasi.links.map((link, index) => (
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
