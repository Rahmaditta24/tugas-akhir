import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display, titleCase } from '../../../Utils/format';

export default function Index({
    data = {},
    permasalahanProvinsi = {},
    permasalahanKabupaten = {},
    stats = {},
    filters = {}
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [baseData, setBaseData] = useState(filters.baseData || 'statistik');
    const [jenis, setJenis] = useState((filters.baseData === 'statistik' ? (filters.jenis || 'sampah') : (filters.jenis || 'sampah')));
    const [activeTab, setActiveTab] = useState(filters.tab || 'provinsi');
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';
    const sumberDataMap = {
        sampah: 'Kementerian Lingkungan Hidup 2024',
        stunting: 'SSGI 2024 Kementerian Kesehatan',
        gizi_buruk: 'SSGI 2024 Kementerian Kesehatan',
        krisis_listrik: 'Statistik PLN 2024',
        ketahanan_pangan: 'Peta Ketahanan & Kerentanan Pangan Indonesai (FSVA) 2024',
    };
    const sumberText = jenis === 'all'
        ? 'Sampah: Kementerian Lingkungan Hidup 2024 || Stunting: SSGI 2024 Kementerian Kesehatan || Gizi Buruk: SSGI 2024 Kementerian Kesehatan || Krisis Listrik: Statistik PLN 2024 || Ketahanan Pangan: Peta Ketahanan & Kerentanan Pangan Indonesai (FSVA) 2024'
        : sumberDataMap[jenis] || '';

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage,
            baseData,
            jenis,
            sort,
            direction,
            tab: activeTab,
            columns: columnFilters
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage,
            baseData,
            jenis,
            sort,
            direction,
            tab: activeTab,
            columns: newFilters
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage: next,
            baseData,
            jenis,
            sort,
            direction,
            tab: activeTab
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleBaseDataChange = (e) => {
        const val = e.target.value;
        setBaseData(val);
        const nextJenis = val === 'statistik' ? 'sampah' : jenis;
        if (val === 'statistik') setJenis('sampah');
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage,
            baseData: val,
            jenis: nextJenis,
            sort: val === 'statistik' ? 'id' : (val === 'penelitian' ? 'thn_pelaksanaan' : (val === 'pengabdian' ? 'thn_pelaksanaan_kegiatan' : 'tahun')),
            direction: 'desc',
            tab: activeTab,
            columns: {} // Reset column filters when switching base data
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };


    const handleJenisChange = (e) => {
        const val = e.target.value;
        setJenis(val);
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage,
            baseData,
            jenis: val,
            sort,
            direction,
            tab: activeTab
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage,
            baseData,
            jenis,
            sort,
            direction,
            tab: tab
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleDelete = (id, type) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        router.delete(route('admin.permasalahan.destroy', id), {
            data: { type },
            preserveScroll: true,
        });
    };

    // Helper to get formatted value (standardizing column names)
    const getVal = (item, key) => {
        if (key === 'judul') return display(item.judul);
        if (key === 'peneliti') return display(item.nama || item.nama_pengusul || item.peneliti);
        if (key === 'institusi') return display(item.nama_institusi || item.perguruan_tinggi || item.institusi);
        if (key === 'tahun') return display(item.thn_pelaksanaan_kegiatan || item.tahun || item.thn_pelaksanaan);
        if (key === 'provinsi') return titleCase(item.provinsi || item.prov_pt);
        return display(item[key]);
    };

    return (
        <AdminLayout title="">
            <div className="space-y-6">
                <PageHeader
                    title={baseData === 'statistik' ? "Data Permasalahan" : "Data Permasalahan (Overlaps)"}
                    subtitle={baseData === 'statistik' ? "Kelola data statistik per wilayah" : "Daftar riset yang berkaitan dengan kategori permasalahan"}
                    icon={<span className="text-xl">⚠️</span>}
                />

                {/* Stats Cards (Only in Statistik mode) */}
                {baseData === 'statistik' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 12h18M3 19h18" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Total Provinsi</p>
                                    <p className="text-2xl font-bold text-slate-800">{(stats.totalProvinsi || 0).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Total Kabupaten</p>
                                    <p className="text-2xl font-bold text-slate-800">{(stats.totalKabupaten || 0).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Total Data</p>
                                    <p className="text-2xl font-bold text-slate-800">{(stats.total || 0).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b border-slate-200/60">
                        <form onSubmit={handleSearch} className="flex gap-4 items-end flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{baseData === 'statistik' ? 'Cari Provinsi / Jenis' : 'Cari Riset'}</label>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={baseData === 'statistik' ? 'Cari provinsi atau jenis...' : 'Cari judul, peneliti / pengusul, nama institusi...'}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="w-[200px]">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Base Data</label>
                                <select
                                    value={baseData}
                                    onChange={handleBaseDataChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="statistik">Data Statistik (Raw)</option>
                                    <option value="penelitian">Data Penelitian</option>
                                    <option value="pengabdian">Data Pengabdian</option>
                                    <option value="hilirisasi">Data Hilirisasi</option>
                                </select>
                            </div>

                            <div className="w-[180px]">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipe Permasalahan</label>
                                <select
                                    value={jenis}
                                    onChange={handleJenisChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="sampah">Sampah</option>
                                    <option value="stunting">Stunting</option>
                                    <option value="gizi_buruk">Gizi Buruk</option>
                                    <option value="krisis_listrik">Krisis Listrik</option>
                                    <option value="ketahanan_pangan">Ketahanan Pangan</option>
                                </select>
                            </div>

                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                Cari
                            </button>

                            {(filters.search || Object.values(columnFilters).some(v => v)) && (
                                <Link
                                    href={route('admin.permasalahan.index', { baseData, jenis })}
                                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors"
                                >
                                    Reset
                                </Link>
                            )}

                            <div className="ml-auto flex flex-col items-end">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Per halaman</label>
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

                    <div className="p-6 pt-2">
                        {/* Tab Switcher (Only in Statistik mode) */}
                        {baseData === 'statistik' && (
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
                                <button
                                    onClick={() => handleTabChange('provinsi')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'provinsi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Provinsi
                                </button>
                                <button
                                    onClick={() => handleTabChange('kabupaten')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'kabupaten' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Kabupaten/Kota
                                </button>
                            </div>
                        )}

                        {/* Mode 1: Statistik View */}
                        {baseData === 'statistik' ? (
                            <>
                                {activeTab === 'provinsi' ? (
                                    <>
                                        <AdminTable
                                            striped
                                            columns={
                                                jenis === 'sampah' ? [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'timbulan_tahunan_ton', title: 'Timbulan Sampah Tahunan (ton)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : jenis === 'krisis_listrik' ? [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'satuan_pln_provinsi', title: 'Satuan PLN/Provinsi', render: (v) => display(v) },
                                                    { key: 'saidi', title: 'SAIDI (Jam/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                    { key: 'saifi', title: 'SAIFI (Kali/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : jenis === 'ketahanan_pangan' ? [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'ikp', title: 'IKP', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'persentase', title: 'Persentase', render: (v) => display(v) },
                                                ]
                                            }
                                            data={permasalahanProvinsi.data || []}
                                        />
                                        <div className="mt-3 text-sm text-slate-600">
                                            <span className="font-semibold">Sumber Data:</span> {sumberText}
                                        </div>
                                        <Pagination data={permasalahanProvinsi} />
                                    </>
                                ) : (
                                    <>
                                        <AdminTable
                                            striped
                                            columns={
                                                jenis === 'sampah' ? [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'timbulan_tahunan_ton', title: 'Timbulan Sampah Tahunan (ton)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : jenis === 'krisis_listrik' ? [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'satuan_pln_provinsi', title: 'Satuan PLN/Provinsi', render: (v) => display(v) },
                                                    { key: 'saidi', title: 'SAIDI (Jam/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                    { key: 'saifi', title: 'SAIFI (Kali/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : jenis === 'ketahanan_pangan' ? [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'ikp', title: 'IKP', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'persentase', title: 'Persentase', render: (v) => display(v) },
                                                ]
                                            }
                                            data={permasalahanKabupaten.data || []}
                                        />
                                        <div className="mt-3 text-sm text-slate-600">
                                            <span className="font-semibold">Sumber Data:</span> {sumberText}
                                        </div>
                                        <Pagination data={permasalahanKabupaten} />
                                    </>
                                )}
                            </>
                        ) : (
                            /* Mode 2: Overlaps Data */
                            <>
                                <AdminTable
                                    striped
                                    columnFilterEnabled={true}
                                    filters={columnFilters}
                                    onFilterChange={handleColumnFilterChange}
                                    columns={[
                                        { key: 'no', title: 'No', className: 'w-16 text-center' },
                                        { key: 'judul', title: 'Judul Riset', className: 'min-w-[400px]', render: (v, item) => <div className="line-clamp-2 text-sm leading-relaxed" title={getVal(item, 'judul')}>{getVal(item, 'judul')}</div> },
                                        { key: 'peneliti', title: 'Peneliti / Pengusul', className: 'min-w-[180px]', render: (_, item) => getVal(item, 'peneliti') },
                                        { key: 'institusi', title: 'Institusi', className: 'min-w-[200px]', render: (_, item) => <div className="truncate" title={getVal(item, 'institusi')}>{getVal(item, 'institusi')}</div> },
                                        { key: 'provinsi', title: 'Provinsi', className: 'min-w-[150px]', render: (_, item) => <Badge color="blue">{getVal(item, 'provinsi')}</Badge> },
                                        { key: 'tahun', title: 'Tahun', className: 'w-24 text-center', render: (_, item) => <Badge color="gray">{getVal(item, 'tahun')}</Badge> },
                                    ]}
                                    data={(data.data || []).map((item, index) => ({
                                        ...item,
                                        no: (data.from || 1) + index,
                                    }))}
                                />
                                <Pagination data={data} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Internal Pagination Component for cleaner main component
function Pagination({ data }) {
    if ((data.last_page || 1) <= 1) return null;
    return (
        <div className="pt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">Menampilkan {data.from?.toLocaleString('id-ID')} - {data.to?.toLocaleString('id-ID')} dari {data.total?.toLocaleString('id-ID')} data</div>
            <div className="flex gap-2">
                {(data.links || []).map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white font-semibold' : link.url ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-50 text-slate-400 cursor-not-allowed'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll={true}
                    />
                ))}
            </div>
        </div>
    );
}


