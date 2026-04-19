import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
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
    const [jenis, setJenis] = useState(filters.jenis || 'Sampah');
    const [batchType, setBatchType] = useState(filters.batch_type || (filters.baseData === 'pengabdian' ? 'Multitahun Lanjutan, Batch I & Batch II' : ''));
    const [listrikMode, setListrikMode] = useState(filters.listrikMode || 'SAIDI');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isAllSelectedGlobal, setIsAllSelectedGlobal] = useState(false);
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

    const handleBulkDelete = () => {
        if (!confirm(`Yakin ingin menghapus ${isAllSelectedGlobal ? 'seluruh' : selectedIds.length} data terpilih?`)) return;
        
        const payload = isAllSelectedGlobal 
            ? { ids: 'all', search, baseData, jenis, batch_type: batchType, columns: columnFilters, tab: activeTab } 
            : { ids: selectedIds, baseData, tab: activeTab };

        router.post(route('admin.permasalahan.bulk-destroy'), payload, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsAllSelectedGlobal(false);
            }
        });
    };

    const getVal = (item, key) => {
        if (key === 'judul') return display(item.judul);
        if (key === 'peneliti') return display(item.nama || item.nama_pengusul || item.peneliti);
        if (key === 'institusi') return display(item.nama_institusi || item.perguruan_tinggi || item.institusi);
        if (key === 'tahun') return display(item.thn_pelaksanaan_kegiatan || item.tahun || item.thn_pelaksanaan);
        if (key === 'provinsi') return titleCase(item.provinsi || item.prov_pt);
        return display(item[key]);
    };

    return (
        <AdminLayout title="Permasalahan">
            <div className="space-y-4">
                <PageHeader
                    title="Data Permasalahan"
                    subtitle={baseData === 'statistik' ? "Daftar data statistik per wilayah" : "Daftar riset terkait kategori permasalahan"}
                    icon={<span className="text-xl">⚠️</span>}
                    actions={(
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportCSV}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center text-sm font-bold shadow-sm active:scale-95"
                            >
                                <svg className="w-5 h-5 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export CSV
                            </button>
                        </div>
                    )}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="h-6 w-6 sm:h-5 sm:w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">{baseData === 'statistik' ? 'Total Provinsi' : 'Total Institusi'}</p>
                                <p className="text-2xl font-black text-slate-800">
                                    {isStatsLoading ? '...' : (baseData === 'statistik' ? (localStats.totalProvinsi || 0).toLocaleString('id-ID') : (localStats.totalInstitusi || 0).toLocaleString('id-ID'))}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="h-6 w-6 sm:h-5 sm:w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">{baseData === 'statistik' ? 'Total Kabupaten' : 'Total Provinsi'}</p>
                                <p className="text-2xl font-black text-slate-800">
                                    {isStatsLoading ? '...' : (baseData === 'statistik' ? (localStats.totalKabupaten || 0).toLocaleString('id-ID') : (localStats.totalProvinsi || 0).toLocaleString('id-ID'))}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="h-6 w-6 sm:h-5 sm:w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6m2 0h2a2 2 0 002-2v-3a2 2 0 00-2-2h-2m-2 0H5" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">Total Data</p>
                                <p className="text-2xl font-black text-slate-800">
                                    {isStatsLoading ? '...' : (localStats.total || 0).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                        {baseData === 'statistik' ? 'Cari Wilayah / Jenis' : 'Cari Judul / Peneliti'}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder={baseData === 'statistik' ? 'Ketik nama provinsi atau jenis...' : 'Ketik judul atau nama pengusul...'}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm group-hover:border-slate-300"
                                        />
                                        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button type="submit" className="flex-1 sm:flex-none px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm transition-all active:scale-95 shadow-sm shadow-blue-200">
                                        Cari
                                    </button>
                                    {(filters.search || filters.batch_type || Object.values(columnFilters).some(v => v)) && (
                                        <Link
                                            href={route('admin.permasalahan.index', { baseData, jenis })}
                                            onClick={() => setBatchType('')}
                                            className="flex-1 sm:flex-none px-6 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200 font-bold transition-all text-sm text-center shadow-sm"
                                        >
                                            Reset
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 items-end flex-wrap pt-4 border-t border-slate-100">
                                <div className="w-full sm:w-auto min-w-[200px]">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Base Data</label>
                                    <select
                                        value={baseData}
                                        onChange={handleBaseDataChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold text-slate-700"
                                    >
                                        <option value="statistik">Data Statistik (Raw)</option>
                                        <option value="penelitian">Data Penelitian</option>
                                        <option value="pengabdian">Data Pengabdian</option>
                                        <option value="hilirisasi">Data Hilirisasi</option>
                                    </select>
                                </div>

                                {baseData === 'pengabdian' && (
                                    <div className="w-full sm:w-auto min-w-[200px]">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Jenis Pengabdian</label>
                                        <select
                                            value={batchType}
                                            onChange={(e) => {
                                                setBatchType(e.target.value);
                                                router.get(route('admin.permasalahan.index'), {
                                                    search, perPage, baseData, jenis, batch_type: e.target.value, sort, direction, tab: activeTab
                                                }, { preserveState: true, replace: true });
                                            }}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold text-slate-700"
                                        >
                                            <option value="Multitahun Lanjutan, Batch I & Batch II">Multitahun Lanjutan, Batch I & Batch II</option>
                                            <option value="Kosabangsa">Kosabangsa</option>
                                        </select>
                                    </div>
                                )}

                                <div className="w-full sm:w-auto min-w-[200px]">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
                                    <select
                                        value={jenis}
                                        onChange={handleJenisChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold text-slate-700"
                                    >
                                        <option value="Sampah">Sampah</option>
                                        <option value="Stunting">Stunting</option>
                                        <option value="Gizi Buruk">Gizi Buruk</option>
                                        <option value="Krisis Listrik">Krisis Listrik</option>
                                        <option value="Ketahanan Pangan">Ketahanan Pangan</option>
                                    </select>
                                </div>

                                {jenis === 'Krisis Listrik' && baseData !== 'statistik' && (
                                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => handleListrikModeChange('SAIDI')}
                                            className={`px-6 py-1.5 text-xs font-black rounded-lg transition-all ${listrikMode === 'SAIDI' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            SAIDI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleListrikModeChange('SAIFI')}
                                            className={`px-6 py-1.5 text-xs font-black rounded-lg transition-all ${listrikMode === 'SAIFI' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            SAIFI
                                        </button>
                                    </div>
                                )}

                                <div className="flex-1"></div>

                                <div className="w-full sm:w-auto">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rows</label>
                                    <select
                                        value={perPage}
                                        onChange={handlePerPageChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold text-slate-700"
                                    >
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-blue-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                <div className="flex items-center gap-3 self-start sm:self-center">
                                    <div className="bg-white text-blue-600 text-xs font-black h-8 px-3 flex items-center justify-center rounded-lg shadow-sm">
                                        {isAllSelectedGlobal ? (baseData === 'statistik' ? (activeTab === 'provinsi' ? permasalahanProvinsi.total : permasalahanKabupaten.total) : data.total) : selectedIds.length}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white leading-tight whitespace-nowrap">
                                            Data Terpilih
                                        </span>
                                        {isAllSelectedGlobal && (
                                            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">
                                                Seluruh Halaman
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="h-8 w-px bg-blue-500/50 hidden sm:block"></div>
                                
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={handleBulkDelete}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-all shadow-sm border border-red-400/30 flex-1 sm:flex-none"
                                    >
                                        <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Hapus
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => {
                                    setSelectedIds([]);
                                    setIsAllSelectedGlobal(false);
                                }}
                                className="w-full sm:w-auto text-xs font-bold text-blue-100 hover:text-white transition-colors bg-blue-700/40 py-2 px-4 rounded-lg border border-blue-500/50 hover:bg-blue-700/60"
                            >
                                Batal
                            </button>
                        </div>
                    )}

                    <div className="p-6">
                        {baseData === 'statistik' && (
                            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 shadow-inner">
                                <button
                                    onClick={() => handleTabChange('provinsi')}
                                    className={`px-8 py-2.5 text-sm font-black rounded-xl transition-all duration-300 ${activeTab === 'provinsi' ? 'bg-white text-blue-600 shadow-lg scale-100' : 'text-slate-500 hover:text-slate-700 scale-95 opacity-70'}`}
                                >
                                    Provinsi
                                </button>
                                <button
                                    onClick={() => handleTabChange('kabupaten')}
                                    className={`px-8 py-2.5 text-sm font-black rounded-xl transition-all duration-300 ${activeTab === 'kabupaten' ? 'bg-white text-blue-600 shadow-lg scale-100' : 'text-slate-500 hover:text-slate-700 scale-95 opacity-70'}`}
                                >
                                    Kabupaten/Kota
                                </button>
                            </div>
                        )}

                        {baseData === 'statistik' ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {activeTab === 'provinsi' ? (
                                    <>
                                        <AdminTable
                                            striped
                                            selectionEnabled={true}
                                            selectedItemIds={selectedIds}
                                            onSelectionChange={setSelectedIds}
                                            totalItems={permasalahanProvinsi.total}
                                            isAllSelectedGlobal={isAllSelectedGlobal}
                                            onSelectAllGlobal={() => setIsAllSelectedGlobal(true)}
                                            onClearSelection={() => {
                                                setSelectedIds([]);
                                                setIsAllSelectedGlobal(false);
                                            }}
                                            columns={
                                                normalizedJenis === 'sampah' ? [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => <span className="font-bold text-slate-700">{titleCase(v)}</span> },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'timbulan_tahunan_ton', title: 'Timbulan Sampah Tahunan (ton)', render: (v) => <span className="font-black text-slate-800">{display(v === 0 ? '0' : Number(v).toLocaleString('id-ID'))}</span> },
                                                ] : normalizedJenis === 'krisis_listrik' ? [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => <span className="font-bold text-slate-700">{titleCase(v)}</span> },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'satuan_pln_provinsi', title: 'Satuan PLN/Provinsi', render: (v) => display(v) },
                                                    { key: 'saidi', title: 'SAIDI (Jam/Pelanggan)', render: (v) => <span className="font-black text-slate-800">{display(v === 0 ? '0' : Number(v).toLocaleString('id-ID'))}</span> },
                                                    { key: 'saifi', title: 'SAIFI (Kali/Pelanggan)', render: (v) => <span className="font-black text-slate-800">{display(v === 0 ? '0' : Number(v).toLocaleString('id-ID'))}</span> },
                                                ] : normalizedJenis === 'ketahanan_pangan' ? [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => <span className="font-bold text-slate-700">{titleCase(v)}</span> },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'ikp', title: 'IKP', render: (v) => <span className="font-black text-slate-800">{display(v === 0 ? '0' : Number(v).toLocaleString('id-ID'))}</span> },
                                                ] : [
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => <span className="font-bold text-slate-700">{titleCase(v)}</span> },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'persentase', title: 'Persentase', render: (v) => <span className="font-black text-slate-800">{display(v)}%</span> },
                                                ]
                                            }
                                            data={(permasalahanProvinsi.data || []).map(r => ({ ...r, id: r.id || r.provinsi }))}
                                        />
                                        <div className="mt-6 text-xs text-slate-400 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                            <span className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Sumber Data:</span> {sumberText}
                                        </div>
                                        <Pagination data={permasalahanProvinsi} />
                                    </>
                                ) : (
                                    <>
                                        <AdminTable
                                            striped
                                            selectionEnabled={true}
                                            selectedItemIds={selectedIds}
                                            onSelectionChange={setSelectedIds}
                                            totalItems={permasalahanKabupaten.total}
                                            isAllSelectedGlobal={isAllSelectedGlobal}
                                            onSelectAllGlobal={() => setIsAllSelectedGlobal(true)}
                                            onClearSelection={() => {
                                                setSelectedIds([]);
                                                setIsAllSelectedGlobal(false);
                                            }}
                                            columns={
                                                normalizedJenis === 'sampah' ? [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => <span className="font-bold text-slate-700">{titleCase(v)}</span> },
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'timbulan_tahunan_ton', title: 'Timbulan Sampah Tahunan (ton)', render: (v) => <span className="font-black text-slate-800">{display(v === 0 ? '0' : Number(v).toLocaleString('id-ID'))}</span> },
                                                ] : normalizedJenis === 'krisis_listrik' ? [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => <span className="font-bold text-slate-700">{titleCase(v)}</span> },
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'satuan_pln_provinsi', title: 'Satuan PLN/Provinsi', render: (v) => display(v) },
                                                    { key: 'saidi', title: 'SAIDI (Jam/Pelanggan)', render: (v) => <span className="font-black text-slate-800">{display(v === 0 ? '0' : Number(v).toLocaleString('id-ID'))}</span> },
                                                    { key: 'saifi', title: 'SAIFI (Kali/Pelanggan)', render: (v) => <span className="font-black text-slate-800">{display(v === 0 ? '0' : Number(v).toLocaleString('id-ID'))}</span> },
                                                ] : normalizedJenis === 'ketahanan_pangan' ? [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => <span className="font-bold text-slate-700">{titleCase(v)}</span> },
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'ikp', title: 'IKP', render: (v) => <span className="font-black text-slate-800">{display(v === 0 ? '0' : Number(v).toLocaleString('id-ID'))}</span> },
                                                ] : [
                                                    { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => <span className="font-bold text-slate-700">{titleCase(v)}</span> },
                                                    { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                                    { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                                    { key: 'persentase', title: 'Persentase', render: (v) => <span className="font-black text-slate-800">{display(v)}%</span> },
                                                ]
                                            }
                                            data={(permasalahanKabupaten.data || []).map(r => ({ ...r, id: r.id || r.kabupaten_kota }))}
                                        />
                                        <div className="mt-6 text-xs text-slate-400 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                            <span className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Sumber Data:</span> {sumberText}
                                        </div>
                                        <Pagination data={permasalahanKabupaten} />
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <AdminTable
                                    striped
                                    selectionEnabled={true}
                                    selectedItemIds={selectedIds}
                                    onSelectionChange={setSelectedIds}
                                    totalItems={data.total}
                                    isAllSelectedGlobal={isAllSelectedGlobal}
                                    onSelectAllGlobal={() => setIsAllSelectedGlobal(true)}
                                    onClearSelection={() => {
                                        setSelectedIds([]);
                                        setIsAllSelectedGlobal(false);
                                    }}
                                    columnFilterEnabled={true}
                                    filters={localColumnFilters}
                                    onFilterChange={handleColumnFilterChange}
                                    sort={{ key: filters.sort, direction: filters.direction }}
                                    onSort={(key) => {
                                        const nextDir = sort === key && direction === 'asc' ? 'desc' : 'asc';
                                        router.get(route('admin.permasalahan.index'), {
                                            search, perPage, baseData, jenis, batch_type: batchType, sort: key, direction: nextDir, tab: activeTab, columns: columnFilters
                                        }, { preserveState: true, replace: true });
                                    }}
                                    columns={[
                                        { key: 'no', title: 'No', className: 'w-16 text-center' },
                                        { key: 'judul', title: 'Judul Riset', sortable: true, className: 'min-w-[400px]', render: (v, item) => <div className="line-clamp-2 text-sm leading-relaxed font-bold text-slate-800" title={getVal(item, 'judul')}>{getVal(item, 'judul')}</div> },
                                        { key: 'peneliti', title: 'Peneliti / Pengusul', sortable: true, className: 'min-w-[180px]', render: (_, item) => <div className="font-semibold text-slate-700">{getVal(item, 'peneliti')}</div> },
                                        { key: 'institusi', title: 'Institusi', sortable: true, className: 'min-w-[200px]', render: (_, item) => <div className="truncate text-slate-600 text-xs" title={getVal(item, 'institusi')}>{getVal(item, 'institusi')}</div> },
                                        { key: 'provinsi', title: 'Provinsi', sortable: true, className: 'min-w-[150px]', render: (_, item) => <Badge color="blue">{getVal(item, 'provinsi')}</Badge> },
                                        { key: 'tahun', title: 'Tahun', sortable: true, className: 'min-w-[120px] text-center', render: (_, item) => <Badge color="gray">{getVal(item, 'tahun')}</Badge> },
                                    ]}
                                    data={(data.data || []).map((item, index) => ({
                                        ...item,
                                        no: (data.from || 1) + index,
                                    }))}
                                />
                                <Pagination data={data} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function Pagination({ data }) {
    if ((data.last_page || 1) <= 1) return null;
    return (
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50 mt-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Menampilkan <span className="text-slate-600">{data.from?.toLocaleString('id-ID')}</span> - <span className="text-slate-600">{data.to?.toLocaleString('id-ID')}</span> dari <span className="text-slate-600 font-black">{data.total?.toLocaleString('id-ID')}</span> data
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
                {(data.links || []).map((link, index) => {
                    let label = link.label;
                    if (label.includes('Previous')) label = '←';
                    if (label.includes('Next')) label = '→';
                    return (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`min-w-[36px] h-9 flex items-center justify-center text-xs font-black rounded-xl transition-all ${link.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : link.url ? 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200' : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed pointer-events-none'}`}
                            dangerouslySetInnerHTML={{ __html: label }}
                            preserveScroll={true}
                        />
                    );
                })}
            </div>
        </div>
    );
}
