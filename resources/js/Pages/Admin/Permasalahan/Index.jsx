import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display, titleCase } from '../../../Utils/format';
import HeaderActions from '../../../Components/Admin/HeaderActions';

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
    const [jenis, setJenis] = useState(filters.jenis || 'Sampah');
    const [batchType, setBatchType] = useState(filters.batch_type || (filters.baseData === 'pengabdian' ? 'Multitahun Lanjutan, Batch I & Batch II' : ''));
    const [listrikMode, setListrikMode] = useState(filters.listrikMode || 'SAIDI');
    const [activeTab, setActiveTab] = useState(filters.tab || 'provinsi');
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [localColumnFilters, setLocalColumnFilters] = useState(filters.columns || {});
    const [localStats, setLocalStats] = useState(stats || {});
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const { flash } = usePage().props;
    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    // Debounce Column Filters (Keystrokes in table headers)
    useEffect(() => {
        const handler = setTimeout(() => {
            const hasChanged = JSON.stringify(localColumnFilters) !== JSON.stringify(columnFilters);

            if (hasChanged) {
                setColumnFilters(localColumnFilters);
                router.get(route('admin.permasalahan.index'), {
                    search, perPage, baseData, jenis, batch_type: batchType, sort, direction, tab: activeTab,
                    columns: localColumnFilters, listrikMode
                }, { preserveState: true, preserveScroll: true, replace: true });
            }
        }, 600);
        return () => clearTimeout(handler);
    }, [localColumnFilters]);

    // Local stats handling
    useEffect(() => {
        setLocalStats(stats);
        setIsStatsLoading(false);
    }, [stats]);


    const sumberDataMap = {
        sampah: 'Kementerian Lingkungan Hidup 2024',
        stunting: 'SSGI 2024 Kementerian Kesehatan',
        gizi_buruk: 'SSGI 2024 Kementerian Kesehatan',
        krisis_listrik: 'Statistik PLN 2024',
        ketahanan_pangan: 'Peta Ketahanan & Kerentanan Pangan Indonesai (FSVA) 2024',
    };
    const normalizedJenis = jenis.toLowerCase().replace(/ /g, '_');
    const sumberText = jenis === 'all'
        ? 'Sampah: Kementerian Lingkungan Hidup 2024 || Stunting: SSGI 2024 Kementerian Kesehatan || Gizi Buruk: SSGI 2024 Kementerian Kesehatan || Krisis Listrik: Statistik PLN 2024 || Ketahanan Pangan: Peta Ketahanan & Kerentanan Pangan Indonesai (FSVA) 2024'
        : sumberDataMap[normalizedJenis] || '';

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage,
            baseData,
            jenis,
            batch_type: batchType,
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
        setLocalColumnFilters(prev => ({ ...prev, [key]: value }));
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage: next,
            baseData,
            jenis,
            batch_type: batchType,
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
        const nextJenis = val === 'statistik' ? 'Sampah' : jenis;
        const nextBatch = val === 'pengabdian' ? 'Multitahun Lanjutan, Batch I & Batch II' : '';
        if (val === 'statistik') setJenis('Sampah');
        if (val === 'pengabdian') setBatchType(nextBatch);
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage,
            baseData: val,
            jenis: nextJenis,
            sort: val === 'statistik' ? 'id' : (val === 'penelitian' ? 'thn_pelaksanaan' : (val === 'pengabdian' ? 'thn_pelaksanaan_kegiatan' : 'tahun')),
            direction: 'desc',
            tab: activeTab,
            batch_type: nextBatch,
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
            batch_type: batchType,
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
            batch_type: batchType,
            listrikMode: listrikMode,
            sort,
            direction,
            tab: tab
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleListrikModeChange = (mode) => {
        setListrikMode(mode);
        router.get(route('admin.permasalahan.index'), {
            search,
            perPage,
            baseData,
            jenis,
            batch_type: batchType,
            listrikMode: mode,
            sort,
            direction,
            tab: activeTab
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleExportCSV = () => {
        const params = new URLSearchParams({ baseData, jenis, search, batch_type: batchType });
        if (Object.keys(columnFilters).length > 0) {
            Object.entries(columnFilters).forEach(([k, v]) => {
                if (v) params.append(`columns[${k}]`, v);
            });
        }
        window.location.href = route('admin.permasalahan.export-csv') + '?' + params.toString();
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
            <div className="space-y-4">
                <PageHeader
                    title="Data Permasalahan"
                    subtitle={baseData === 'statistik' ? "Daftar data statistik per wilayah" : "Daftar riset terkait kategori permasalahan"}
                    icon={<span className="text-xl">⚠️</span>}
                    actions={(
                        <HeaderActions
                            onExport={handleExportCSV}
                            exportLabel="Export CSV"
                        />
                    )}
                />

                {/* Stats Cards */}
                {(baseData === 'statistik' || baseData === 'penelitian' || baseData === 'pengabdian' || baseData === 'hilirisasi') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 12h18M3 19h18" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider truncate">{baseData === 'statistik' ? 'Total Provinsi' : 'Total Institusi'}</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-800">
                                        {isStatsLoading ? '...' : (baseData === 'statistik' ? (localStats.totalProvinsi || 0).toLocaleString('id-ID') : (localStats.totalInstitusi || 0).toLocaleString('id-ID'))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider truncate">{baseData === 'statistik' ? 'Total Kabupaten' : 'Total Provinsi'}</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-800">
                                        {isStatsLoading ? '...' : (baseData === 'statistik' ? (localStats.totalKabupaten || 0).toLocaleString('id-ID') : (localStats.totalProvinsi || 0).toLocaleString('id-ID'))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider truncate">Total Data</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-800">
                                        {isStatsLoading ? '...' : (localStats.total || 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-slate-200/60">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Row 1: Search and Main Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                                <div className="w-full flex-1">
                                    <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        {baseData === 'statistik' ? 'Cari Provinsi / Jenis' : 'Cari Riset'}
                                    </label>
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={baseData === 'statistik' ? 'Cari provinsi atau jenis...' : 'Cari judul, peneliti / pengusul...'}
                                        className="w-full px-4 py-1.5 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button type="submit" className="flex-1 sm:flex-none px-5 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-all active:scale-95 shadow-sm shadow-blue-100">
                                        Cari
                                    </button>
                                    {(filters.search || filters.batch_type || Object.values(columnFilters).some(v => v)) && (
                                        <Link
                                            href={route('admin.permasalahan.index', { baseData, jenis })}
                                            onClick={() => setBatchType('')}
                                            className="flex-1 sm:flex-none px-5 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold transition-colors text-sm text-center"
                                        >
                                            Reset
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Secondary Filters */}
                            <div className="flex gap-4 items-end flex-wrap border-t border-slate-100 pt-4">
                                <div className="w-fit min-w-[140px] sm:min-w-[200px]">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Base Data</label>
                                    <select
                                        value={baseData}
                                        onChange={handleBaseDataChange}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                                    >
                                        <option value="statistik">Data Statistik (Raw)</option>
                                        <option value="penelitian">Data Penelitian</option>
                                        <option value="pengabdian">Data Pengabdian</option>
                                        <option value="hilirisasi">Data Hilirisasi</option>
                                    </select>
                                </div>

                                {baseData === 'pengabdian' && (
                                    <div className="w-fit min-w-[140px] sm:min-w-[200px]">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jenis Pengabdian</label>
                                        <select
                                            value={batchType}
                                            onChange={(e) => {
                                                setBatchType(e.target.value);
                                                router.get(route('admin.permasalahan.index'), {
                                                    search, perPage, baseData, jenis, batch_type: e.target.value, sort, direction, tab: activeTab
                                                }, { preserveState: true, replace: true });
                                            }}
                                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                                        >
                                            <option value="Multitahun Lanjutan, Batch I & Batch II">Multitahun Lanjutan, Batch I & Batch II</option>
                                            <option value="Kosabangsa">Kosabangsa</option>
                                        </select>
                                    </div>
                                )}

                                <div className="w-fit min-w-[140px] sm:min-w-[180px]">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipe Permasalahan</label>
                                    <select
                                        value={jenis}
                                        onChange={handleJenisChange}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                                    >
                                        <option value="Sampah">Sampah</option>
                                        <option value="Stunting">Stunting</option>
                                        <option value="Gizi Buruk">Gizi Buruk</option>
                                        <option value="Krisis Listrik">Krisis Listrik</option>
                                        <option value="Ketahanan Pangan">Ketahanan Pangan</option>
                                    </select>
                                </div>

                                {jenis === 'Krisis Listrik' && baseData !== 'statistik' && (
                                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => handleListrikModeChange('SAIDI')}
                                            className={`px-4 py-1 text-xs font-semibold rounded-md transition-all ${listrikMode === 'SAIDI' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            SAIDI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleListrikModeChange('SAIFI')}
                                            className={`px-4 py-1 text-xs font-semibold rounded-md transition-all ${listrikMode === 'SAIFI' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            SAIFI
                                        </button>
                                    </div>
                                )}

                                <div className="w-fit sm:ml-auto flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Per halaman</span>
                                    <select
                                        value={perPage}
                                        onChange={handlePerPageChange}
                                        className="w-fit px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                                    >
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-4 pt-1">
                        {/* Tab Switcher (Only in Statistik mode) */}
                        {baseData === 'statistik' && (
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
                                <button
                                    onClick={() => handleTabChange('provinsi')}
                                    className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'provinsi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Provinsi
                                </button>
                                <button
                                    onClick={() => handleTabChange('kabupaten')}
                                    className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'kabupaten' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                                                normalizedJenis === 'sampah' ? [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'timbulan_tahunan_ton', title: 'Timbulan Sampah Tahunan (ton)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : normalizedJenis === 'krisis_listrik' ? [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'satuan_pln_provinsi', title: 'Satuan PLN/Provinsi', render: (v) => display(v) },
                                                    { key: 'saidi', title: 'SAIDI (Jam/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                    { key: 'saifi', title: 'SAIFI (Kali/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : normalizedJenis === 'ketahanan_pangan' ? [
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
                                        <div className="mt-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="font-bold text-slate-700">Sumber Data:</span> {sumberText}
                                        </div>
                                        <Pagination data={permasalahanProvinsi} />
                                    </>
                                ) : (
                                    <>
                                        <AdminTable
                                            striped
                                            columns={
                                                normalizedJenis === 'sampah' ? [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'timbulan_tahunan_ton', title: 'Timbulan Sampah Tahunan (ton)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : normalizedJenis === 'krisis_listrik' ? [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'satuan_pln_provinsi', title: 'Satuan PLN/Provinsi', render: (v) => display(v) },
                                                    { key: 'saidi', title: 'SAIDI (Jam/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                    { key: 'saifi', title: 'SAIFI (Kali/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                                ] : normalizedJenis === 'ketahanan_pangan' ? [
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
                                        <div className="mt-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="font-bold text-slate-700">Sumber Data:</span> {sumberText}
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
                                    filters={localColumnFilters}
                                    onFilterChange={handleColumnFilterChange}
                                    sort={{ key: filters.sort, direction: filters.direction }}
                                    columns={[
                                        { key: 'no', title: 'No', className: 'w-12 text-center' },
                                        { key: 'judul', title: 'Judul Riset', sortable: true, className: 'min-w-[400px]', render: (v, item) => <div className="line-clamp-2 text-xs sm:text-sm leading-relaxed" title={getVal(item, 'judul')}>{getVal(item, 'judul')}</div> },
                                        { key: 'peneliti', title: 'Peneliti / Pengusul', sortable: true, className: 'min-w-[180px]', render: (_, item) => <div className="text-xs sm:text-sm">{getVal(item, 'peneliti')}</div> },
                                        { key: 'institusi', title: 'Institusi', sortable: true, className: 'min-w-[150px]', render: (_, item) => <div className="truncate text-xs sm:text-sm" title={getVal(item, 'institusi')}>{getVal(item, 'institusi')}</div> },
                                        { key: 'provinsi', title: 'Provinsi', sortable: true, className: 'min-w-[150px]', render: (_, item) => <Badge color="blue">{getVal(item, 'provinsi')}</Badge> },
                                        { key: 'tahun', title: 'Tahun', sortable: true, className: 'min-w-[100px] text-center', render: (_, item) => <Badge color="gray">{getVal(item, 'tahun')}</Badge> },
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
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 text-center sm:text-left">
                Menampilkan {data.from?.toLocaleString('id-ID')} - {data.to?.toLocaleString('id-ID')} dari {data.total?.toLocaleString('id-ID')} data
            </div>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {(data.links || []).map((link, index) => {
                    let label = link.label;
                    if (label.includes('Previous')) label = '&laquo;';
                    if (label.includes('Next')) label = '&raquo;';
                    return (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${link.active ? 'bg-blue-600 text-white font-semibold shadow-sm' : link.url ? 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-100' : 'bg-white text-slate-300 border border-slate-100 cursor-not-allowed pointer-events-none'}`}
                            dangerouslySetInnerHTML={{ __html: label }}
                            preserveScroll={true}
                        />
                    );
                })}
            </div>
        </div>
    );
}

