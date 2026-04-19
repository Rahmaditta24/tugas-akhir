import React, { useState, useMemo } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display } from '../../../Utils/format';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import ImportModal from '../../../Components/ImportModal';
import BulkUpdateModal from '../../../Components/BulkUpdateModal';
import CampusSelect from '../../../Components/CampusSelect';
import LocationSelect from '../../../Components/LocationSelect';
export default function Index({ pengabdian, stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);

    // --- Bulk selection ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        router.post(route('admin.pengabdian.bulk-destroy'), { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteModal(false);
            },
            onError: () => {
                setShowBulkDeleteModal(false);
            }
        });
    };


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
            type: filters.type || 'batch',
            search,
            filters: newFilters,
            perPage
        }, {
            only: ['pengabdian'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.pengabdian.index'), {
            search,
            type: filters.type || 'batch',
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
            type: filters.type || 'batch',
            perPage: next,
            filters: columnFilters
        }, {
            only: ['pengabdian'],
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

    // --- Bulk Update ---
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [itemsEdit, setItemsEdit] = useState([]);

    const setItemField = (id, key, value) => {
        setItemsEdit(prev => prev.map(item =>
            item.id === id ? { ...item, [key]: value } : item
        ));
    };

    const openBulkUpdateModal = () => {
        if (selectedIds.length === 0) return;
        const raw = pengabdian?.data || [];
        const prefilled = selectedIds.map(id => {
            const found = raw.find(r => r.id === id);
            return {
                id,
                batch_type: found?.batch_type || (filters.type || 'batch'),
                nama: found?.nama || '',
                nidn: found?.nidn || '',
                nama_institusi: found?.nama_institusi || '',
                pt_latitude: found?.pt_latitude || '',
                pt_longitude: found?.pt_longitude || '',
                kd_perguruan_tinggi: found?.kd_perguruan_tinggi || '',
                wilayah_lldikti: found?.wilayah_lldikti || '',
                ptn_pts: found?.ptn_pts || '',
                kab_pt: found?.kab_pt || '',
                prov_pt: found?.prov_pt || '',
                klaster: found?.klaster || '',
                judul: found?.judul || '',
                nama_singkat_skema: found?.nama_singkat_skema || '',
                thn_pelaksanaan_kegiatan: found?.thn_pelaksanaan_kegiatan || '',
                urutan_thn_kegitan: found?.urutan_thn_kegitan || '',
                nama_skema: found?.nama_skema || '',
                bidang_fokus: found?.bidang_fokus || '',
                prov_mitra: found?.prov_mitra || '',
                kab_mitra: found?.kab_mitra || '',
                nama_pendamping: found?.nama_pendamping || '',
                nidn_pendamping: found?.nidn_pendamping || '',
                kd_perguruan_tinggi_pendamping: found?.kd_perguruan_tinggi_pendamping || '',
                institusi_pendamping: found?.institusi_pendamping || '',
                lldikti_wilayah_pendamping: found?.lldikti_wilayah_pendamping || '',
                jenis_wilayah_provinsi_mitra: found?.jenis_wilayah_provinsi_mitra || '',
                bidang_teknologi_inovasi: found?.bidang_teknologi_inovasi || '',
            };
        });
        setItemsEdit(prefilled);
        setShowBulkUpdateModal(true);
    };

    const confirmBulkUpdate = (e) => {
        e.preventDefault();
        setIsBulkUpdating(true);
        router.post(route('admin.pengabdian.bulk-update'), { items: itemsEdit }, {
            onSuccess: () => {
                setShowBulkUpdateModal(false);
                setSelectedIds([]);
                setIsBulkUpdating(false);
                toast.success(`${itemsEdit.length} data pengabdian berhasil diperbarui.`);
            },
            onError: (errors) => {
                setIsBulkUpdating(false);
                const msg = Object.values(errors)[0] || 'Terjadi kesalahan.';
                toast.error(msg);
            }
        });
    };

    // --- Import Modal ---
    const [showImportModal, setShowImportModal] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async (file, onComplete) => {
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExt = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
        if (!allowedExtensions.includes('.' + fileExt)) {
            toast.error('Gagal: Tipe data harus Excel (.xlsx, .xls) atau CSV.');
            if (onComplete) onComplete();
            return;
        }

        if (file.size > 1024 * 1024) {
            toast.error('Gagal: Ukuran file maksimal 1MB.');
            if (onComplete) onComplete();
            return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    toast.error('Gagal: File tidak berisi data.');
                    setIsImporting(false);
                    return;
                }

                const requiredColumns = ['batchtype', 'nama', 'namainstitusi', 'judul', 'thnpelaksanaankegiatan'];
                const uploadedColumns = Object.keys(data[0]).map(k => k.toLowerCase().replace(/[\s\/_]/g, ''));
                
                // Allow aliases just like backend
                const aliases = {
                    'namainstitusi': ['institusi', 'perguruantinggi'],
                    'thnpelaksanaankegiatan': ['tahun']
                };

                const missingColumns = [];
                for (const req of requiredColumns) {
                    if (!uploadedColumns.includes(req)) {
                        let foundAlias = false;
                        if (aliases[req]) {
                            for (const alt of aliases[req]) {
                                if (uploadedColumns.includes(alt)) {
                                    foundAlias = true;
                                    break;
                                }
                            }
                        }
                        if (!foundAlias) missingColumns.push(req);
                    }
                }

                if (missingColumns.length > 0) {
                    toast.error(`Gagal: Kolom tidak lengkap. Kurang kolom: ${missingColumns.join(', ')}`, { duration: 5000 });
                    setIsImporting(false);
                    if (onComplete) onComplete();
                    return;
                }

                router.post(route('admin.pengabdian.import-excel'), { data }, {
                    onSuccess: () => {
                        setIsImporting(false);
                        setShowImportModal(false);
                        toast.success('Data pengabdian berhasil diimport.');
                        if (onComplete) onComplete();
                    },
                    onError: (errors) => {
                        setIsImporting(false);
                        const msg = Object.values(errors)[0] || 'Terjadi kesalahan saat menyimpan data.';
                        toast.error(`Gagal: ${msg}`);
                        if (onComplete) onComplete();
                    }
                });
            } catch (err) {
                console.error('Import error:', err);
                setIsImporting(false);
                toast.error('Gagal: Terjadi kesalahan saat membaca file.');
                if (onComplete) onComplete();
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDownloadTemplate = () => {
        let dummyData = [];
        let fileName = 'Template_Pengabdian.xlsx';

        const baseRow = {
            "batch_type": "multitahun",
            "nama": "HARIS",
            "nidn": "1208038902",
            "nama_institusi": "Universitas Negeri Makassar",
            "pt_latitude": -5.168843,
            "pt_longitude": 119.4360638,
            "kd_perguruan_tinggi": "1036",
            "wilayah_lldikti": "9",
            "ptn/pts": "PTN",
            "Kab PT": "Kota Makassar",
            "Prov PT": "Sulawesi Selatan",
            "klaster": "Kelompok PT Mandiri",
            "judul": "Peningkatan Softskill Literasi Digital dan Budidaya Toga masyarakat Desa Mallongi-longi Melalui PMM di Kabupaten Pinrang",
            "nama_singkat_skema": "PMM",
            "thn_pelaksanaan_kegiatan": 2025,
            "urutan_thn_kegitan": "Tahun ke-1",
            "nama_skema": "Pemberdayaan Masyarakat oleh Mahasiswa",
            "bidang_fokus": "Sosial Humaniora",
            "prov_mitra": "Sulawesi Selatan",
            "kab_mitra": "Kab. Pinrang",
        };

        if (filters.type === 'kosabangsa') {
            dummyData = [{
                ...baseRow,
                "batch_type": "kosabangsa",
                "nama_skema": "Kosabangsa",
                "nama_singkat_skema": "Kosabangsa",
                "nama_pendamping": "SITTI RAHMA",
                "nidn_pendamping": "0012345678",
                "kd_perguruan_tinggi_pendamping": "1099",
                "institusi_pendamping": "Universitas Hasanuddin",
                "lldikti_wilayah_pendamping": "9",
                "jenis_wilayah_provinsi_mitra": "Pedesaan",
                "bidang_teknologi_inovasi": "Pertanian dan Pangan",
            }];
            fileName = "Template_Import_Kosabangsa.xlsx";
        } else {
            dummyData = [baseRow];
            fileName = "Template_Import_Batch.xlsx";
        }

        const ws = XLSX.utils.json_to_sheet(dummyData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_Pengabdian");
        XLSX.writeFile(wb, fileName);
    };

    const handleExport = () => {
        const params = new URLSearchParams({ type: filters.type || 'batch' });
        if (search) params.set('search', search);
        Object.entries(columnFilters).forEach(([k, v]) => v && params.append(`filters[${k}]`, v));
        if (selectedIds.length > 0) {
            params.append('ids', selectedIds.join(','));
        }

        window.location.href = `/admin/pengabdian/export-csv?${params.toString()}`;
    };

    const tableData = useMemo(() => {
        return (pengabdian.data || []).map((item, index) => ({
            ...item,
            no: (pengabdian.from || 0) + index,
            aksi: (
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.pengabdian.edit', item.id)}
                        data={{
                            page: pengabdian.current_page,
                            type: filters.type || 'batch',
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
            ),
        }));
    }, [pengabdian, filters, search, perPage, columnFilters]);


    return (
        <AdminLayout title="">
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <div className="space-y-6 max-w-full">
                {/* Header */}
                <PageHeader
                    title="Data Pengabdian"
                    subtitle="Kelola data pengabdian masyarakat"
                    icon={<span className="text-xl">🤝</span>}
                    actions={(
                        <div className="flex gap-2">
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                {selectedIds.length > 0 ? `Export CSV (${selectedIds.length})` : 'Export CSV'}
                            </button>
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center text-sm font-medium shadow-sm flex-shrink-0"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Import Data
                            </button>
                            <Link href={route('admin.pengabdian.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm">+ Tambah</Link>
                        </div>
                    )}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg sm:text-xl">📦</span>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Multitahun, Batch I & II</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.batch?.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg sm:text-xl">🤝</span>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Kosabangsa</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.kosabangsa?.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg sm:text-xl">📊</span>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Total Semua</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.total?.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 z-20 bg-blue-600 text-white p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top duration-300">
                            <div className="flex items-center gap-4 ml-2">
                                <span className="text-sm font-semibold whitespace-nowrap">
                                    {selectedIds.length} data terpilih
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
                                <button
                                    onClick={openBulkUpdateModal}
                                    className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-md transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Update {selectedIds.length} Data
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-md transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Hapus {selectedIds.length} Data
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium rounded-md transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mode Tabs: Multitahun / Batch / Kosabangsa */}
                    <div className="flex border-b overflow-x-auto">
                        <button
                            onClick={() => handleTypeChange('batch')}
                            className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${(filters.type || 'batch') === 'batch'
                            className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${(filters.type || 'batch') === 'batch'
                                ? 'border-amber-600 text-amber-600 bg-amber-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            📦 Multitahun, Batch I & Batch II
                            📦 Multitahun, Batch I & Batch II
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
                                className="px-4 sm:px-8 py-1.5 sm:py-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Cari
                            </button>
                            {(filters.search || Object.values(columnFilters || {}).some(v => v)) && (
                                <Link
                                    href={route('admin.pengabdian.index', { type: filters.type })}
                                    className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-200 text-slate-700 text-sm sm:text-base font-medium rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Reset
                                </Link>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-sm text-slate-600 hidden sm:inline">Per halaman</span>
                                <select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    className="px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
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
                            selectionEnabled
                            selectedItemIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            columns={[
                                { key: 'no', title: 'No', className: 'w-16 text-center' },
                                { key: 'judul', title: 'Judul Pengabdian', sortable: true, className: 'min-w-[400px]', render: (v) => <div className="line-clamp-4 text-sm leading-relaxed" title={fmt(v)}>{display(v)}</div> },
                                { key: 'nama', title: 'Ketua Pengusul', sortable: true, className: 'min-w-[180px]', render: (v) => display(v) },
                                { key: 'nama_institusi', title: 'Institusi', sortable: true, className: 'min-w-[200px]', render: (v) => <div className="line-clamp-2 text-sm leading-relaxed" title={fmt(v)}>{display(v)}</div> },
                                { key: 'thn_pelaksanaan_kegiatan', title: 'Tahun', sortable: true, className: 'min-w-[120px] text-center', render: (v) => <Badge color="blue">{display(v)}</Badge> },
                                { key: 'aksi', title: 'Aksi', className: 'w-28 text-center sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] shadow-white/80' },
                            ]}
                            data={tableData}
                            filters={columnFilters}
                            onFilterChange={handleColumnFilterChange}
                        />
                    </div>

                    {/* Pagination */}
                    {pengabdian.last_page > 1 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-slate-200/60">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                                <div className="text-sm text-slate-600">
                                    Menampilkan {pengabdian.from?.toLocaleString('id-ID')} - {pengabdian.to?.toLocaleString('id-ID')} dari {pengabdian.total?.toLocaleString('id-ID')} data
                                </div>
                                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                    {pengabdian.links.map((link, index) => {
                                        let label = link.label;
                                        if (label.includes('Previous')) label = '&laquo;';
                                        if (label.includes('Next')) label = '&raquo;';

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${link.active
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : link.url
                                                        ? 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-100'
                                                        : 'bg-white text-slate-300 border border-slate-100 cursor-not-allowed pointer-events-none'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Individual Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Data pengabdian ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus {selectedIds.length} Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Seluruh data pengabdian terpilih ({selectedIds.length} item) akan dihapus secara permanen.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                            >
                                Ya, Hapus Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Import Modal */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                isImporting={isImporting}
                onDownloadTemplate={handleDownloadTemplate}
                title={`Import Data Pengabdian (${filters.type === 'kosabangsa' ? 'Kosabangsa' : 'Batch/Multitahun'})`}
            />

            {/* Bulk Update Modal */}
            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title={`Update ${itemsEdit.length} Data Pengabdian`}
                renderItemForm={(item) => {
                    const isKosabangsa = item.batch_type === 'kosabangsa' || filters.type === 'kosabangsa';
                    const f = (key) => item[key] || '';
                    const inp = (key, opts = {}) => (
                        <input
                            type={opts.type || 'text'}
                            value={f(key)}
                            onChange={e => setItemField(item.id, key, opts.numeric ? e.target.value.replace(/\D/g, '') : e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={opts.placeholder || ''}
                        />
                    );
                    return (
                        <div className="space-y-5">
                            {/* Section: Jenis Batch */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Klasifikasi Data</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jenis Batch / Program</label>
                                        <select value={f('batch_type')} onChange={e => setItemField(item.id, 'batch_type', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                                            <option value="batch">Multitahun, Batch I & Batch II</option>
                                            <option value="kosabangsa">Kosabangsa</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">NIDN</label>
                                        {inp('nidn', { numeric: true, placeholder: 'Nomor NIDN' })}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Institusi & Pengusul */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <span>🏫</span><p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Institusi & Pengusul</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Ketua Pengusul</label>
                                        {inp('nama')}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Institusi</label>
                                        {inp('nama_institusi')}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Kode PT</label>
                                            {inp('kd_perguruan_tinggi', { numeric: true })}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">LLDIKTI</label>
                                            {inp('wilayah_lldikti')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">PTN/PTS</label>
                                            <select value={f('ptn_pts')} onChange={e => setItemField(item.id, 'ptn_pts', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                                                <option value="">-- Pilih --</option>
                                                <option value="PTN">PTN</option>
                                                <option value="PTS">PTS</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <LocationSelect
                                                selectedProvince={f('prov_pt')}
                                                selectedRegency={f('kab_pt')}
                                                onProvinceChange={val => setItemField(item.id, 'prov_pt', val)}
                                                onRegencyChange={val => setItemField(item.id, 'kab_pt', val)}
                                                provinceErrorKey="prov_pt"
                                                regencyErrorKey="kab_pt"
                                                showRequiredIndicator={false}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Klaster</label>
                                        {inp('klaster')}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Detail Pelaksanaan */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <span>📜</span><p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Detail Pelaksanaan</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Judul Pengabdian</label>
                                        <textarea value={f('judul')} onChange={e => setItemField(item.id, 'judul', e.target.value)} rows="3" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {!isKosabangsa && (
                                            <>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Skema</label>
                                                    <select value={f('nama_skema')} onChange={e => setItemField(item.id, 'nama_skema', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                                                        <option value="">-- Pilih --</option>
                                                        {['KBM','PDB','PKM','PM-UPUD','PMM','PMP','PUK','PW','Pemberdayaan Desa Binaan','Pemberdayaan Kemitraan Masyarakat','Pemberdayaan Masyarakat oleh Mahasiswa','Pengabdian Masyarakat Pemula','Program Kemitraan Masyarakat Stimulusi'].map(v => <option key={v} value={v}>{v}</option>)}
                                                        {f('nama_skema') && !['KBM','PDB','PKM','PM-UPUD','PMM','PMP','PUK','PW','Pemberdayaan Desa Binaan','Pemberdayaan Kemitraan Masyarakat','Pemberdayaan Masyarakat oleh Mahasiswa','Pengabdian Masyarakat Pemula','Program Kemitraan Masyarakat Stimulusi','Kosabangsa'].includes(f('nama_skema')) && <option value={f('nama_skema')}>{f('nama_skema')}</option>}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Singkatan Skema</label>
                                                    <select value={f('nama_singkat_skema')} onChange={e => setItemField(item.id, 'nama_singkat_skema', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                                                        <option value="">-- Pilih --</option>
                                                        {['KBM','PDB','PKM','PM-UPUD','PMM','PMP','PUK','PW'].map(v => <option key={v} value={v}>{v}</option>)}
                                                        {f('nama_singkat_skema') && !['KBM','PDB','PKM','PM-UPUD','PMM','PMP','PUK','PW'].includes(f('nama_singkat_skema')) && <option value={f('nama_singkat_skema')}>{f('nama_singkat_skema')}</option>}
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tahun Pelaksanaan</label>
                                            <input type="number" value={f('thn_pelaksanaan_kegiatan')} onChange={e => setItemField(item.id, 'thn_pelaksanaan_kegiatan', e.target.value)} placeholder="2025" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Urutan Tahun</label>
                                            {inp('urutan_thn_kegitan', { placeholder: 'Tahun ke-1' })}
                                        </div>
                                        <div className={isKosabangsa ? '' : 'col-span-2'}>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bidang Fokus</label>
                                            {inp('bidang_fokus', { placeholder: 'Bidang fokus pengabdian' })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Kosabangsa */}
                            {isKosabangsa && (
                                <div className="border border-blue-100 bg-blue-50/40 rounded-xl overflow-hidden">
                                    <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                        <span>🎓</span><p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Informasi Pendamping (Kosabangsa)</p>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Pendamping</label>
                                            {inp('nama_pendamping')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">NIDN Pendamping</label>
                                            {inp('nidn_pendamping', { numeric: true })}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Institusi Pendamping</label>
                                            {inp('institusi_pendamping')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Kode PT Pendamping</label>
                                            {inp('kd_perguruan_tinggi_pendamping')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">LLDIKTI Pendamping</label>
                                            {inp('lldikti_wilayah_pendamping')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Jenis Wilayah Mitra</label>
                                            {inp('jenis_wilayah_provinsi_mitra')}
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bidang Teknologi Inovasi</label>
                                            {inp('bidang_teknologi_inovasi')}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Mitra & Koordinat */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <span>📍</span><p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mitra & Koordinat</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <LocationSelect
                                                selectedProvince={f('prov_mitra')}
                                                selectedRegency={f('kab_mitra')}
                                                onProvinceChange={val => setItemField(item.id, 'prov_mitra', val)}
                                                onRegencyChange={val => setItemField(item.id, 'kab_mitra', val)}
                                                provinceErrorKey="prov_mitra"
                                                regencyErrorKey="kab_mitra"
                                                showRequiredIndicator={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Latitude</label>
                                            <input type="text" value={f('pt_latitude')} onChange={e => setItemField(item.id, 'pt_latitude', e.target.value.replace(',', '.'))} placeholder="-5.168843" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Longitude</label>
                                            <input type="text" value={f('pt_longitude')} onChange={e => setItemField(item.id, 'pt_longitude', e.target.value.replace(',', '.'))} placeholder="119.436063" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }}
            />
        </AdminLayout>
    );
}
