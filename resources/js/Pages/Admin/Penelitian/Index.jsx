import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import ImportModal from '../../../Components/ImportModal';
import BulkUpdateModal from '../../../Components/BulkUpdateModal';
import CampusSelect from '../../../Components/CampusSelect';
import LocationSelect from '../../../Components/LocationSelect';
import { fmt, display, sentenceCase, titleCase } from '../../../Utils/format';
export default function Index({ penelitian, stats, filters }) {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [itemsEdit, setItemsEdit] = useState([]);
    const fileInputRef = React.useRef(null);

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        router.post(route('admin.penelitian.bulk-destroy'), { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteModal(false);
            },
            onError: () => {
                setShowBulkDeleteModal(false);
            }
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.penelitian.index'), {
            search,
            filters: columnFilters,
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

        router.get(route('admin.penelitian.index'), {
            search,
            filters: newFilters,
            perPage
        }, {
            only: ['penelitian'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.penelitian.index'), {
            search,
            filters: columnFilters,
            perPage: next
        }, {
            only: ['penelitian'],
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
            router.delete(route('admin.penelitian.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }
            });
        }
    };

    const normalizeSkema = (v) => {
        const s = fmt(v);
        if (!s) return 'null';
        return sentenceCase(s);
    };
    const normalizeTema = (v) => {
        const s = fmt(v);
        if (!s) return 'Tidak Memilih';
        return sentenceCase(s);
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
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.penelitian.edit', item.id)}
                        data={{
                            page: penelitian.current_page,
                            search,
                            filters: columnFilters,
                            perPage
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
    }, [penelitian]);

    console.log('✅ Table data processed:', tableData);

    const openBulkUpdateModal = () => {
        if (selectedIds.length === 0) return;
        const raw = penelitian?.data || [];
        const prefilled = selectedIds.map(id => {
            const found = raw.find(r => r.id === id);
            return {
                id,
                nama: found?.nama || '',
                nidn: found?.nidn || '',
                nuptk: found?.nuptk || '',
                institusi: found?.institusi || '',
                kode_pt: found?.kode_pt || '',
                jenis_pt: found?.jenis_pt || '',
                kategori_pt: found?.kategori_pt || '',
                klaster: found?.klaster || '',
                institusi_pilihan: found?.institusi_pilihan || '',
                provinsi: found?.provinsi || '',
                kota: found?.kota || '',
                pt_latitude: found?.pt_latitude || '',
                pt_longitude: found?.pt_longitude || '',
                judul: found?.judul || '',
                skema: found?.skema || '',
                thn_pelaksanaan: found?.thn_pelaksanaan || '',
                bidang_fokus: found?.bidang_fokus || '',
                tema_prioritas: found?.tema_prioritas || '',
            };
        });
        setItemsEdit(prefilled);
        setShowBulkUpdateModal(true);
    };

    const setItemField = (id, key, value) => {
        setItemsEdit(prev => prev.map(item =>
            item.id === id ? { ...item, [key]: value } : item
        ));
    };

    const confirmBulkUpdate = (e) => {
        e.preventDefault();
        setIsBulkUpdating(true);
        router.post(route('admin.penelitian.bulk-update'), { items: itemsEdit }, {
            onSuccess: () => {
                setShowBulkUpdateModal(false);
                setSelectedIds([]);
                setIsBulkUpdating(false);
                toast.success(`${itemsEdit.length} data berhasil diperbarui.`);
            },
            onError: (errors) => {
                setIsBulkUpdating(false);
                const msg = Object.values(errors)[0] || 'Terjadi kesalahan.';
                toast.error(msg);
            }
        });
    };

    const handleDownloadTemplate = () => {
        const dummyData = [{
            "nama": "RETNO MARTANTI ENDAH LESTARI",
            "nidn": "425097604",
            "nuptk": "6257754655230103",
            "institusi": "Universitas Pakuan",
            "pt_latitude": -6.5993984,
            "pt_longitude": 106.8123668,
            "kode_pt": "41004",
            "jenis_pt": "Universitas",
            "kategori_pt": "PTS",
            "institusi_pilihan": "LLDIKTI Wilayah IV",
            "klaster": "Kelompok PT Utama",
            "provinsi": "Jawa Barat",
            "kota": "Kota Bogor",
            "judul": "Eksplorasi Tata Kelola Rantai Nilai Berbasis Blockchain Pada Komoditas Kopi",
            "skema": "Penelitian Fundamental - Reguler",
            "thn_pelaksanaan": 2025,
            "bidang_fokus": "Sosial Humaniora",
            "tema_prioritas": "Digitalisasi"
        }];
        const ws = XLSX.utils.json_to_sheet(dummyData);

        // Paksa kolom B (NIDN), C (NUPTK), dan G (Kode PT) menjadi TEXT
        // agar tidak berubah jadi scientific notation (7E+15) saat dibuka Excel
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            ['B', 'C', 'G'].forEach(col => {
                const cell = ws[col + (R + 1)];
                if (cell) {
                    cell.t = 's'; // Set type to 'string'
                    cell.z = '@'; // Set format to 'text'
                }
            });
        }
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_Penelitian");
        XLSX.writeFile(wb, "Template_Import_Penelitian.xlsx");
    };

    const handleImport = async (file, onComplete) => {
        // 1. Validasi Tipe Data
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExt = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
        if (!allowedExtensions.includes('.' + fileExt)) {
            toast.error('Gagal: Tipe data harus Excel (.xlsx, .xls) atau CSV.');
            if (onComplete) onComplete();
            return;
        }

        // 2. Validasi Ukuran (Max 1MB)
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

                // 3. Validasi Nama Kolom (Harus ada semua)
                const requiredColumns = [
                    'nama', 'nidn', 'nuptk', 'institusi', 'pt_latitude', 'pt_longitude',
                    'kode_pt', 'jenis_pt', 'kategori_pt', 'institusi_pilihan', 'klaster',
                    'provinsi', 'kota', 'judul', 'skema', 'thn_pelaksanaan', 'bidang_fokus',
                    'tema_prioritas'
                ];

                const uploadedColumns = Object.keys(data[0]).map(k => k.toLowerCase().trim());
                const missingColumns = requiredColumns.filter(col => !uploadedColumns.includes(col.toLowerCase()));

                if (missingColumns.length > 0) {
                    toast.error(`Gagal: Kolom tidak lengkap. Kurang kolom: ${missingColumns.join(', ')}`, { duration: 5000 });
                    setIsImporting(false);
                    if (onComplete) onComplete();
                    return;
                }

                router.post(route('admin.penelitian.import-excel'), { data }, {
                    onSuccess: () => {
                        setIsImporting(false);
                        setShowImportModal(false);
                        toast.success('Data penelitian berhasil diimport.');
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

    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (Object.keys(columnFilters).length > 0) {
            Object.entries(columnFilters).forEach(([k, v]) => {
                if (v) params.set(`filters[${k}]`, v);
            });
        }
        if (selectedIds.length > 0) {
            params.set('ids', selectedIds.join(','));
        }
        const url = `/admin/penelitian/export-csv?${params.toString()}`;
        window.location.href = url;
    };

    return (
        <AdminLayout title="">
            <Toaster position="top-right" />
            <PageHeader
                title="Data Penelitian"
                subtitle="Kelola data penelitian"
                icon={<span className="text-xl">🔬</span>}
                actions={(
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            {selectedIds.length > 0 ? `Export CSV (${selectedIds.length})` : 'Export CSV'}
                        </button>

                        <button
                            onClick={() => setShowImportModal(true)}
                            disabled={isImporting}
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center text-sm font-medium shadow-sm disabled:opacity-50"
                        >
                            {isImporting ? (
                                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                            ) : (
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            )}
                            {isImporting ? 'Proses...' : 'Import Data'}
                        </button>

                        <Link
                            href={route('admin.penelitian.create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm"
                        >
                            + Tambah
                        </Link>
                    </div>
                )}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-slate-100">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <span className="text-xl sm:text-2xl">🔬</span>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">Total Penelitian</p>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900">
                                {stats?.total?.toLocaleString('id-ID') || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">Dengan Koordinat</p>
                            <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats?.withCoordinates?.toLocaleString('id-ID') || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
                {/* Bulk Action Bar — only visible when items are selected */}
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
                            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Cari
                        </button>

                        {(search || Object.values(columnFilters).some(v => v)) && (
                            <Link
                                href={route('admin.penelitian.index')}
                                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-200 text-slate-700 text-sm sm:text-base rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Reset
                            </Link>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm text-slate-600 hidden sm:inline">Per halaman</span>
                            <select
                                value={perPage}
                                onChange={handlePerPageChange}
                                className="px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
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
                        columnFilterEnabled
                        selectionEnabled
                        selectedItemIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        sort={{ key: filters.sort, direction: filters.direction }}
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
                                sortable: true,
                                sortable: true,
                                className: 'min-w-[180px]',
                                render: (v) => display(v)
                            },
                            {
                                key: 'judul',
                                title: 'Judul',
                                sortable: true,
                                sortable: true,
                                className: 'min-w-[420px]',
                                render: (v) => (
                                    <div className="max-w-md line-clamp-4 whitespace-normal leading-snug" title={fmt(v)}>
                                        {display(v)}
                                    </div>
                                )
                            },
                            {
                                key: 'institusi',
                                title: 'Institusi',
                                sortable: true,
                                className: 'min-w-[200px]',
                                sortable: true,
                                className: 'min-w-[200px]',
                                render: (v) => (
                                    <div className="max-w-md line-clamp-2 whitespace-normal leading-snug" title={fmt(v)}>
                                        {display(v)}
                                    </div>
                                )
                            },
                            {
                                key: 'provinsi',
                                title: 'Provinsi',
                                sortable: true,
                                sortable: true,
                                className: 'min-w-[140px]',
                                render: (v) => (
                                    <Badge color="slate">{display(v)}</Badge>
                                )
                            },
                            {
                                key: 'thn_pelaksanaan',
                                title: 'Tahun',
                                sortable: true,
                                className: 'min-w-[160px] text-center',
                                sortable: true,
                                className: 'min-w-[160px] text-center',
                                render: (v) => <Badge color="blue">{display(v)}</Badge>
                            },
                            {
                                key: 'bidang_fokus',
                                title: 'Bidang Fokus',
                                className: 'min-w-[160px]',
                                render: (v) => (
                                    <Badge color="purple">{display(v, 'Umum')}</Badge>
                                )
                            },
                            {
                                key: 'tema_prioritas',
                                title: 'Tema Prioritas',
                                className: 'min-w-[180px]',
                                render: (v) => (
                                    <Badge color="emerald">{normalizeTema(v)}</Badge>
                                )
                            },
                            {
                                key: 'aksi',
                                title: 'Aksi',
                                className: 'w-28 text-center sticky right-0 bg-white/95 backdrop-blur-sm shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] shadow-white/80',
                                filterable: false,
                                render: (v) => v
                            },
                        ]}
                        data={tableData}
                        filters={columnFilters}
                        onFilterChange={handleColumnFilterChange}
                    />
                </div>

                {/* Pagination */}
                {penelitian?.last_page > 1 && (
                    <div className="px-4 sm:px-6 py-4 border-t border-slate-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-slate-600 text-center sm:text-left">
                                Menampilkan {penelitian.from?.toLocaleString('id-ID')} - {penelitian.to?.toLocaleString('id-ID')} dari {penelitian.total?.toLocaleString('id-ID')} data
                            </p>
                            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                {penelitian.links.map((link, index) => {
                                    // Handle labels for mobile
                                    let label = link.label;
                                    if (label.includes('Previous')) label = '&laquo;';
                                    if (label.includes('Next')) label = '&raquo;';

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${link.active
                                                ? 'bg-blue-600 text-white font-semibold shadow-sm'
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

            {/* Single Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Konfirmasi Hapus</h3>
                        <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus data penelitian ini?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setItemToDelete(null); }}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >Batal</button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Hapus {selectedIds.length} Data?</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Tindakan ini akan menghapus <strong>{selectedIds.length} data penelitian</strong> secara permanen dan tidak dapat dikembalikan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >Batal</button>
                            <button
                                onClick={confirmBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >Ya, Hapus Semuanya</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Bulk Update Modal Component */}
            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title="Bulk Update Data Penelitian"
                renderItemForm={(item) => (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Section 1: Peneliti */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Peneliti</label>
                                <input type="text" value={item.nama} onChange={e => setItemField(item.id, 'nama', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">NIDN</label>
                                <input type="text" value={item.nidn} onChange={e => setItemField(item.id, 'nidn', e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">NUPTK</label>
                                <input type="text" value={item.nuptk} onChange={e => setItemField(item.id, 'nuptk', e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                            </div>
                        </div>

                        {/* Section 2: Institusi & Akademik */}
                        <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <CampusSelect
                                        label="Institusi"
                                        value={item.institusi}
                                        onChange={val => setItemField(item.id, 'institusi', val)}
                                        errors={{}}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kode PT</label>
                                    <input type="text" value={item.kode_pt} onChange={e => setItemField(item.id, 'kode_pt', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Jenis PT</label>
                                    <select value={item.jenis_pt} onChange={e => setItemField(item.id, 'jenis_pt', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400">
                                        <option value="">-- Pilih --</option>
                                        {['Akademi', 'Institut', 'Universitas', 'Politeknik', 'Sekolah Tinggi'].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kategori PT</label>
                                    <select value={item.kategori_pt} onChange={e => setItemField(item.id, 'kategori_pt', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                                        <option value="">-- Pilih --</option>
                                        {['PTN', 'PTS', 'PTNBH'].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Klaster</label>
                                    <select value={item.klaster} onChange={e => setItemField(item.id, 'klaster', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                                        <option value="">-- Pilih --</option>
                                        {['Kelompok PT Binaan', 'Kelompok PT Madya', 'Kelompok PT Mandiri', 'Kelompok PT Pratama', 'Kelompok PT Utama'].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Institusi Pilihan (Target)</label>
                                    <input type="text" value={item.institusi_pilihan} onChange={e => setItemField(item.id, 'institusi_pilihan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Lokasi & Koordinat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <LocationSelect
                                    selectedProvince={item.provinsi}
                                    selectedRegency={item.kota}
                                    onProvinceChange={val => setItemField(item.id, 'provinsi', val)}
                                    onRegencyChange={val => setItemField(item.id, 'kota', val)}
                                    errors={{}}
                                    isRegencyOptional={true}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Latitude</label>
                                <input type="text" value={item.pt_latitude} onChange={e => setItemField(item.id, 'pt_latitude', e.target.value.replace(',', '.'))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="-6.2000" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Longitude</label>
                                <input type="text" value={item.pt_longitude} onChange={e => setItemField(item.id, 'pt_longitude', e.target.value.replace(',', '.'))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="106.8166" />
                            </div>
                        </div>

                        {/* Section 4: Data Penelitian */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Judul Penelitian</label>
                                <textarea value={item.judul} onChange={e => setItemField(item.id, 'judul', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-24 resize-none leading-relaxed" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Skema</label>
                                    <input type="text" value={item.skema} onChange={e => setItemField(item.id, 'skema', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tahun Pelaksanaan</label>
                                    <input type="number" value={item.thn_pelaksanaan} onChange={e => setItemField(item.id, 'thn_pelaksanaan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" min="2000" max="2099" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bidang Fokus</label>
                                    <select value={item.bidang_fokus} onChange={e => setItemField(item.id, 'bidang_fokus', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                                        <option value="">-- Pilih --</option>
                                        {['Energi', 'Kesehatan', 'Pangan', 'TIK', 'Sosial Humaniora', 'Maritim', 'Transportasi', 'Pertahanan', 'Lingkungan'].map(v => <option key={v} value={v}>{v}</option>)}
                                        {item.bidang_fokus && !['Energi', 'Kesehatan', 'Pangan', 'TIK', 'Sosial Humaniora', 'Maritim', 'Transportasi', 'Pertahanan', 'Lingkungan'].includes(item.bidang_fokus) && (
                                            <option value={item.bidang_fokus}>{item.bidang_fokus}</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tema Prioritas</label>
                                    <select value={item.tema_prioritas} onChange={e => setItemField(item.id, 'tema_prioritas', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                                        <option value="">-- Pilih --</option>
                                        {['Digitalisasi', 'Ekonomi Biru', 'Ekonomi Hijau', 'Hilirisasi', 'Kemandirian Kesehatan', 'Ketahanan Pangan', 'Mineral'].map(v => <option key={v} value={v}>{v}</option>)}
                                        {item.tema_prioritas && !['Digitalisasi', 'Ekonomi Biru', 'Ekonomi Hijau', 'Hilirisasi', 'Kemandirian Kesehatan', 'Ketahanan Pangan', 'Mineral'].includes(item.tema_prioritas) && (
                                            <option value={item.tema_prioritas}>{item.tema_prioritas}</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
            {/* Import Modal Component */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onDownloadTemplate={handleDownloadTemplate}
                onImport={handleImport}
                isImporting={isImporting}
                title="Import Data Penelitian"
                moduleName="penelitian"
            />
        </AdminLayout>
    );
}
