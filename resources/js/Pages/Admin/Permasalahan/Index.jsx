import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display, titleCase } from '../../../Utils/format';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

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
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);
    const { flash, importErrors } = usePage().props;
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

    // Fetch research stats via AJAX if baseData is not statistik
    useEffect(() => {
        if (baseData !== 'statistik' && (!stats || Object.keys(stats).length === 0)) {
            setIsStatsLoading(true);
            const params = new URLSearchParams({ baseData, jenis, batch_type: batchType, search });
            if (Object.keys(columnFilters).length > 0) {
                Object.entries(columnFilters).forEach(([k, v]) => {
                    if (v) params.append(`columns[${k}]`, v);
                });
            }

            fetch(route('admin.permasalahan.stats') + '?' + params.toString())
                .then(res => res.json())
                .then(data => {
                    setLocalStats(data);
                    setIsStatsLoading(false);
                })
                .catch(err => {
                    console.error("Stats fetch error:", err);
                    setIsStatsLoading(false);
                });
        } else {
            setLocalStats(stats);
            setIsStatsLoading(false);
        }
    }, [baseData, jenis, batchType, search, columnFilters, stats]);


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

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                if (data.length === 0) {
                    setIsImporting(false);
                    return;
                }
                router.post(route('admin.permasalahan.import-excel'), {
                    data: data, 
                    type: activeTab, 
                    tahun: new Date().getFullYear()
                }, {
                    onSuccess: () => {
                        setIsImporting(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    },
                    onError: () => {
                        setIsImporting(false);
                    }
                });
            } catch (error) {
                console.error(error);
                setIsImporting(false);
            }
        };
        reader.readAsBinaryString(file);
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
                        <div className="flex gap-2">
                             <button
                                onClick={handleExportCSV}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export CSV
                            </button>

                            {/*<button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isImporting}
                                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center text-sm font-medium shadow-sm disabled:opacity-50"
                            >
                                {isImporting ? (
                                    <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                ) : (
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                                    </svg>
                                )}
                                {isImporting ? 'Proses...' : 'Import Data'}
                            </button>*/}
                            <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImport}
                            />
                        </div>
                    )}
                />

                {/* Stats Cards */}
                {(baseData === 'statistik' || baseData === 'penelitian' || baseData === 'pengabdian' || baseData === 'hilirisasi') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 12h18M3 19h18" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">{baseData === 'statistik' ? 'Total Provinsi' : 'Total Institusi'}</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {isStatsLoading ? '...' : (baseData === 'statistik' ? (localStats.totalProvinsi || 0).toLocaleString('id-ID') : (localStats.totalInstitusi || 0).toLocaleString('id-ID'))}
                                    </p>
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
                                    <p className="text-sm text-slate-500 font-medium">{baseData === 'statistik' ? 'Total Kabupaten' : 'Total Provinsi'}</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {isStatsLoading ? '...' : (baseData === 'statistik' ? (localStats.totalKabupaten || 0).toLocaleString('id-ID') : (localStats.totalProvinsi || 0).toLocaleString('id-ID'))}
                                    </p>
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
                                    <p className="text-2xl font-bold text-slate-800">
                                        {isStatsLoading ? '...' : (localStats.total || 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b border-slate-200/60">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Row 1: Search and Main Actions */}
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{baseData === 'statistik' ? 'Cari Provinsi / Jenis' : 'Cari Riset'}</label>
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={baseData === 'statistik' ? 'Cari provinsi atau jenis...' : 'Cari judul, peneliti / pengusul...'}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <button type="submit" className="px-5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                                    Cari
                                </button>
                                {(filters.search || filters.batch_type || Object.values(columnFilters).some(v => v)) && (
                                    <Link
                                        href={route('admin.permasalahan.index', { baseData, jenis })}
                                        onClick={() => setBatchType('')}
                                        className="px-5 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors text-sm"
                                    >
                                        Reset
                                    </Link>
                                )}
                            </div>

                            {/* Row 2: Secondary Filters */}
                            <div className="flex gap-4 items-end flex-wrap border-t border-slate-100 pt-3">
                                <div className="w-[180px]">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Base Data</label>
                                    <select
                                        value={baseData}
                                        onChange={handleBaseDataChange}
                                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                    >
                                        <option value="statistik">Data Statistik (Raw)</option>
                                        <option value="penelitian">Data Penelitian</option>
                                        <option value="pengabdian">Data Pengabdian</option>
                                        <option value="hilirisasi">Data Hilirisasi</option>
                                    </select>
                                </div>
                                
                                {baseData === 'pengabdian' && (
                                    <div className="w-[180px]">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Jenis Pengabdian</label>
                                        <select
                                            value={batchType}
                                            onChange={(e) => {
                                                setBatchType(e.target.value);
                                                router.get(route('admin.permasalahan.index'), {
                                                    search, perPage, baseData, jenis, batch_type: e.target.value, sort, direction, tab: activeTab
                                                }, { preserveState: true, replace: true });
                                            }}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                        >
                                            <option value="Multitahun Lanjutan, Batch I & Batch II">Multitahun Lanjutan, Batch I & Batch II</option>
                                            <option value="Kosabangsa">Kosabangsa</option>
                                        </select>
                                    </div>
                                )}

                                <div className="w-[180px]">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipe Permasalahan</label>
                                    <select
                                        value={jenis}
                                        onChange={handleJenisChange}
                                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
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

                                <div className="w-[120px] ml-auto">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Per halaman</label>
                                    <select
                                        value={perPage}
                                        onChange={handlePerPageChange}
                                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
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
                                    filters={localColumnFilters}
                                    onFilterChange={handleColumnFilterChange}
                                    sort={{ key: filters.sort, direction: filters.direction }}
                                    columns={[
                                        { key: 'no', title: 'No', className: 'w-16 text-center' },
                                        { key: 'judul', title: 'Judul Riset', sortable: true, className: 'min-w-[400px]', render: (v, item) => <div className="line-clamp-2 text-sm leading-relaxed" title={getVal(item, 'judul')}>{getVal(item, 'judul')}</div> },
                                        { key: 'peneliti', title: 'Peneliti / Pengusul', sortable: true, className: 'min-w-[180px]', render: (_, item) => getVal(item, 'peneliti') },
                                        { key: 'institusi', title: 'Institusi', sortable: true, className: 'min-w-[150px]', render: (_, item) => <div className="truncate" title={getVal(item, 'institusi')}>{getVal(item, 'institusi')}</div> },
                                        { key: 'provinsi', title: 'Provinsi', sortable: true, className: 'min-w-[150px]', render: (_, item) => <Badge color="blue">{getVal(item, 'provinsi')}</Badge> },
                                        { key: 'tahun', title: 'Tahun', sortable: true, className: 'min-w-[160px] text-center', render: (_, item) => <Badge color="gray">{getVal(item, 'tahun')}</Badge> },
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

