import React, { useState, useMemo, useRef } from 'react';
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

export default function Index({ produk, stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});



    // --- Bulk selection & Update ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [isAllSelectedGlobal, setIsAllSelectedGlobal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [itemsEdit, setItemsEdit] = useState([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [provinces, setProvinces] = useState([]);

    React.useEffect(() => {
        fetch(route('admin.produk.provinces'))
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(err => console.error('Error fetching provinces:', err));
    }, []);

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);
        router.get(route('admin.produk.index'), {
            search,
            filters: newFilters,
            perPage,
            sort,
            direction
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleSort = (field) => {
        const nextDirection = sort === field && direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.produk.index'), {
            search,
            filters: columnFilters,
            perPage,
            sort: field,
            direction: nextDirection,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.produk.index'), {
            search,
            filters: columnFilters,
            perPage: next,
            sort,
            direction
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.produk.index'), {
            search,
            filters: columnFilters,
            perPage,
            sort,
            direction
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.produk.destroy', itemToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                    toast.success('Data produk berhasil dihapus.');
                }
            });
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        const payload = isAllSelectedGlobal 
            ? { ids: 'all', search, filters: columnFilters } 
            : { ids: selectedIds };

        router.post(route('admin.produk.bulk-destroy'), payload, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsAllSelectedGlobal(false);
                setShowBulkDeleteModal(false);
                toast.success('Data produk berhasil dihapus.');
            },
            onError: () => {
                setShowBulkDeleteModal(false);
                toast.error('Gagal menghapus data.');
            }
        });
    };

    const openBulkUpdateModal = () => {
        if (selectedIds.length === 0) return;
        const prefilled = selectedIds.map(id => {
            const found = produk.data.find(p => p.id === id);
            return {
                id: id,
                nama_produk: found?.nama_produk || '',
                institusi: found?.institusi || '',
                bidang: found?.bidang || '',
                tkt: found?.tkt ?? 1,
                provinsi: found?.provinsi || '',
                nama_inventor: found?.nama_inventor || '',
                email_inventor: found?.email_inventor || '',
                nomor_paten: found?.nomor_paten || '',
                detail_paten: found?.detail_paten || '',
                latitude: found?.latitude || '',
                longitude: found?.longitude || '',
                deskripsi_produk: found?.deskripsi_produk || '',
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
        if (e) e.preventDefault();
        setIsBulkUpdating(true);
        router.post(route('admin.produk.bulk-update'), { items: itemsEdit }, {
            onSuccess: () => {
                setShowBulkUpdateModal(false);
                setSelectedIds([]);
                setIsBulkUpdating(false);
                toast.success(`${itemsEdit.length} data produk berhasil diperbarui.`);
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
            "Institusi": "Universitas Brawijaya",
            "Latitude": "-7,952465",
            "Longitude": "112,613677",
            "Provinsi": "Jawa Timur",
            "Nama Produk Siap Investasi": "BioFerment Kakao Pro Mesin Fermentasi Kakao Otomatis Skala UMKM",
            "Deskripsi Produk": "BioFerment Kakao Pro adalah mesin fermentasi kakao berbasis mikrokontroler yang mampu mengontrol suhu dan kelembaban secara otomatis. Dirancang untuk petani dan UMKM kakao di Sulawesi, mesin ini menghasilkan biji kakao fermentasi berkualitas ekspor dengan konsistensi tinggi.",
            "Tingkat Kesiapterapan Teknologi (TKT)": 7,
            "Bidang": "Pangan",
            "Nama Inventor (Tanpa Gelar)": "Ahmad Fauzi Ramadhan",
            "Email Inventor": "a.fauzi@unhas.ac.id",
            "Nomor Paten": "S00202401023",
            "Deskripsi Paten": "Dalam invensi ini, diajukan mesin fermentasi kakao otomatis dengan sistem kontrol suhu berbasis mikrokontroler ATmega328, dilengkapi sensor DHT22."
        }];

        const ws = XLSX.utils.json_to_sheet(dummyData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_Produk");
        XLSX.writeFile(wb, "Template_Import_Produk.xlsx");
    };

    const [showImportModal, setShowImportModal] = useState(false);
    const handleImport = async (file, onComplete) => {
        // 1. Validasi Tipe Data
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExt = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
        if (!allowedExtensions.includes('.' + fileExt)) {
            toast.error('Gagal: Tipe data harus Excel (.xlsx, .xls) atau CSV.');
            if (onComplete) onComplete();
            return;
        }

        // 2. Validasi Ukuran (Max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Gagal: Ukuran file maksimal 2MB.');
            if (onComplete) onComplete();
            return;
        }

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const dataArray = new Uint8Array(evt.target.result);
                const wb = XLSX.read(dataArray, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    toast.error('Gagal: File tidak berisi data.');
                    setIsImporting(false);
                    if (onComplete) onComplete();
                    return;
                }

                router.post(route('admin.produk.import-excel'), { data }, {
                    onSuccess: () => {
                        setIsImporting(false);
                        setShowImportModal(false);
                        toast.success('Data produk berhasil diimport.');
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

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        Object.entries(columnFilters).forEach(([k, v]) => v && params.append(`filters[${k}]`, v));
        
        if (isAllSelectedGlobal) {
            params.append('ids', 'all');
        } else if (selectedIds.length > 0) {
            params.append('ids', selectedIds.join(','));
        }

        window.location.href = route('admin.produk.export-csv') + '?' + params.toString();
    };


    const tableData = useMemo(() => {
        return (produk.data || []).map((item, index) => ({
            ...item,
            no: (produk.from || 1) + index,
            aksi: (
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.produk.edit', item.id)}
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
    }, [produk, search, columnFilters, perPage]);

    return (
        <AdminLayout title="">
            <Toaster position="top-right" />
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Data Produk"
                    subtitle="Kelola data produk dan paten"
                    icon={<span className="text-xl">📦</span>}
                    actions={(
                        <div className="flex gap-2">
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm active:scale-95"
                            >
                                <svg className="w-5 h-5 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                {selectedIds.length > 0 ? `Export Terpilih (${selectedIds.length})` : 'Export Semua Data'}
                            </button>

                            <button
                                onClick={() => setShowImportModal(true)}
                                disabled={isImporting}
                                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center text-sm font-medium shadow-sm disabled:opacity-50 active:scale-95"
                            >
                                {isImporting ? (
                                    <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                ) : (
                                    <svg className="w-5 h-5 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                )}
                                {isImporting ? 'Proses...' : 'Import Data'}
                            </button>

                            <Link
                                href={route('admin.produk.create')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium shadow-sm active:scale-95"
                            >
                                <span className="text-lg sm:text-base mr-1">+</span> Tambah
                            </Link>
                        </div>
                    )}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="h-6 w-6 sm:h-5 sm:w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total Produk</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-800">{(stats.total || 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="h-6 w-6 sm:h-5 sm:w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Dengan Koordinat</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-800">{(stats.withCoordinates || 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-blue-600 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                <div className="flex items-center gap-3 self-start sm:self-center">
                                    <div className="bg-white text-blue-600 text-xs font-black h-8 px-3 flex items-center justify-center rounded-lg shadow-sm">
                                        {isAllSelectedGlobal ? produk.total : selectedIds.length}
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
                                    {!isAllSelectedGlobal && (
                                        <button
                                            onClick={openBulkUpdateModal}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500/50 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-all border border-blue-400/30 shadow-sm flex-1 sm:flex-none"
                                        >
                                            <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Update
                                        </button>
                                    )}
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
                    {/* Search Bar */}
                    <div className="p-6 border-b">
                        <form onSubmit={handleSearch} className="flex gap-3 items-center flex-wrap">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari berdasarkan nama produk, institusi, atau bidang..."
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
                                    href={route('admin.produk.index')}
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
                                    <option value={10}>10</option>
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
                        columnFilterEnabled
                        selectionEnabled={true}
                        selectedItemIds={selectedIds}
                        onSelectionChange={(ids) => {
                            setSelectedIds(ids);
                            if (ids.length === 0) setIsAllSelectedGlobal(false);
                        }}
                        totalItems={produk.total}
                        isAllSelectedGlobal={isAllSelectedGlobal}
                        onSelectAllGlobal={() => setIsAllSelectedGlobal(true)}
                        onClearSelection={() => {
                            setSelectedIds([]);
                            setIsAllSelectedGlobal(false);
                        }}
                        sort={sort}
                        direction={direction}
                        onSort={handleSort}
                        columnFilters={columnFilters}
                        onColumnFilterChange={handleColumnFilterChange}
                        data={tableData}
                        pagination={produk}
                        columns={[
                            { key: 'no', title: 'No', className: 'w-12 text-center' },
                            { key: 'nama_produk', title: 'Nama Produk', sortable: true, className: 'min-w-[400px]', render: (v) => <div className="line-clamp-4 text-sm leading-relaxed" title={fmt(v)}>{display(v)}</div> },
                            { key: 'institusi', title: 'Institusi', sortable: true, render: (v) => <div className="max-w-xs truncate" title={fmt(v)}>{display(v)}</div> },
                            { key: 'bidang', title: 'Bidang', sortable: true, className: 'min-w-[100px]', render: (v) => <Badge color="purple">{display(v)}</Badge> },
                            { key: 'tkt', title: 'TKT', sortable: true, className: 'min-w-[120px] text-center', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                            { key: 'aksi', title: 'Aksi', className: 'w-28 text-center sticky right-0 bg-white/95 backdrop-blur-sm' },
                        ]}
                    />

                    {/* Pagination */}
                    {produk.last_page > 1 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-slate-200/60">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-slate-600 text-center sm:text-left">
                                    Menampilkan {produk.from?.toLocaleString('id-ID')} - {produk.to?.toLocaleString('id-ID')} dari {produk.total?.toLocaleString('id-ID')} data
                                </div>
                                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                    {produk.links.map((link, index) => {
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
            </div>

            {/* Individual Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed text-sm">
                            Data produk ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">
                            Hapus {isAllSelectedGlobal ? produk.total : selectedIds.length} Data?
                        </h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed text-sm">
                            Seluruh data produk terpilih ({isAllSelectedGlobal ? produk.total : selectedIds.length} item) akan dihapus secara permanen.
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
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95"
                            >
                                Ya, Hapus Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Components */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onDownloadTemplate={handleDownloadTemplate}
                onImport={handleImport}
                isImporting={isImporting}
                title="Import Data Produk"
                moduleName="produk"
            />

            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title="Bulk Update Data Produk"
                renderItemForm={(item) => (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Section: Inventor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Inventor</label>
                                <input type="text" value={item.nama_inventor} onChange={e => setItemField(item.id, 'nama_inventor', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Inventor</label>
                                <input type="email" value={item.email_inventor} onChange={e => setItemField(item.id, 'email_inventor', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        </div>

                        {/* Section: Produk */}
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <h5 className="text-sm font-semibold text-blue-800 mb-3">Informasi Produk</h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Produk</label>
                                    <textarea value={item.nama_produk} onChange={e => setItemField(item.id, 'nama_produk', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-20" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi Produk</label>
                                    <textarea value={item.deskripsi_produk} onChange={e => setItemField(item.id, 'deskripsi_produk', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-32" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bidang</label>
                                        <select 
                                            value={item.bidang} 
                                            onChange={e => setItemField(item.id, 'bidang', e.target.value)} 
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                        >
                                            <option value="">-- Pilih Bidang --</option>
                                            <option value="Agritech">Agritech</option>
                                            <option value="Bangunan Hemat Energi">Bangunan Hemat Energi</option>
                                            <option value="Biodekomposer">Biodekomposer</option>
                                            <option value="Desain / Industri Kreatif / Ekonomi Kreatif">Desain / Industri Kreatif / Ekonomi Kreatif</option>
                                            <option value="Digitalisasi">Digitalisasi</option>
                                            <option value="Digitalisasi: Ai dan Semikonduktor">Digitalisasi: Ai dan Semikonduktor</option>
                                            <option value="Education">Education</option>
                                            <option value="Edukasi Wisata Berbasis Riset">Edukasi Wisata Berbasis Riset</option>
                                            <option value="Edutech">Edutech</option>
                                            <option value="Ekonomi Hijau">Ekonomi Hijau</option>
                                            <option value="Ekonomi Kreatif">Ekonomi Kreatif</option>
                                            <option value="Elektronik dan Digital (Rekayasa Keteknikan)">Elektronik dan Digital (Rekayasa Keteknikan)</option>
                                            <option value="Energi">Energi</option>
                                            <option value="Farmasi">Farmasi</option>
                                            <option value="Fashion & Health Innovation">Fashion & Health Innovation</option>
                                            <option value="Health Tech">Health Tech</option>
                                            <option value="Hilirisasi dan Industrialisasi">Hilirisasi dan Industrialisasi</option>
                                            <option value="Ilmu Tekstik dan Mode">Ilmu Tekstik dan Mode</option>
                                            <option value="Idustri Kecantikan">Idustri Kecantikan</option>
                                            <option value="Idustri Kreatif">Idustri Kreatif</option>
                                            <option value="Inovasi Produk Kosmetik">Inovasi Produk Kosmetik</option>
                                            <option value="IT dengan Hardware">IT dengan Hardware</option>
                                            <option value="Kebijakan">Kebijakan</option>
                                            <option value="Kemandirian Sosial dan Budaya">Kemandirian Sosial dan Budaya</option>
                                            <option value="Kesehatan">Kesehatan</option>
                                            <option value="Kit Realtime Pcr Deteksi Babi untuk Uji Halal">Kit Realtime Pcr Deteksi Babi untuk Uji Halal</option>
                                            <option value="Komunikasi">Komunikasi</option>
                                            <option value="Kosmetik">Kosmetik</option>
                                            <option value="Lainnya">Lainnya</option>
                                            <option value="Limbah">Limbah</option>
                                            <option value="Lingkungan">Lingkungan</option>
                                            <option value="Makanan dan Minuman">Makanan dan Minuman</option>
                                            <option value="Maritim">Maritim</option>
                                            <option value="Marketplace Jasa">Marketplace Jasa</option>
                                            <option value="Material dan Manufaktur Maju">Material dan Manufaktur Maju</option>
                                            <option value="Material Ramah Lingkungan">Material Ramah Lingkungan</option>
                                            <option value="Mitigasi Bencana">Mitigasi Bencana</option>
                                            <option value="Oht Fitofarmaka">Oht Fitofarmaka</option>
                                            <option value="Pangan">Pangan</option>
                                            <option value="Pangan dan Obat2An">Pangan dan Obat2An</option>
                                            <option value="Pendidikan">Pendidikan</option>
                                            <option value="Pendidikan Abad-21">Pendidikan Abad-21</option>
                                            <option value="Pendidikan Berkualitas">Pendidikan Berkualitas</option>
                                            <option value="Pendidikan dan Lingkungan">Pendidikan dan Lingkungan</option>
                                            <option value="Pendidikan Inklusi">Pendidikan Inklusi</option>
                                            <option value="Pendidikan Karakter">Pendidikan Karakter</option>
                                            <option value="Pendidikan Lingkunan">Pendidikan Lingkunan</option>
                                            <option value="Pendidikan Masyarakat">Pendidikan Masyarakat</option>
                                            <option value="Peraturan">Peraturan</option>
                                            <option value="Perikanan">Perikanan</option>
                                            <option value="Pertahanan">Pertahanan</option>
                                            <option value="Pertanian">Pertanian</option>
                                            <option value="Produk Furniture Keperluan Manusia dalam Rumah">Produk Furniture Keperluan Manusia dalam Rumah</option>
                                            <option value="Psikologi">Psikologi</option>
                                            <option value="Publisher">Publisher</option>
                                            <option value="Rekayasa Keteknikan">Rekayasa Keteknikan</option>
                                            <option value="Sektor yang Mendukung Agenda Keberlanjutan">Sektor yang Mendukung Agenda Keberlanjutan</option>
                                            <option value="Seni Budaya">Seni Budaya</option>
                                            <option value="Startup">Startup</option>
                                            <option value="Teknik">Teknik</option>
                                            <option value="Teknik dan Rekayasa">Teknik dan Rekayasa</option>
                                            <option value="Teknologi">Teknologi</option>
                                            <option value="Teknologi dan Media">Teknologi dan Media</option>
                                            <option value="Teknologi Hijau">Teknologi Hijau</option>
                                            <option value="Teknologi Informasi">Teknologi Informasi</option>
                                            <option value="Teknologi Kesehatan">Teknologi Kesehatan</option>
                                            <option value="Teknologi Pendidikan">Teknologi Pendidikan</option>
                                            <option value="Textile Tourism">Textile Tourism</option>
                                            <option value="Transportasi">Transportasi</option>
                                            <option value="Virtual Reality">Virtual Reality</option>
                                            <option value="Yang Lain">Yang Lain</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">TKT (6-9)</label>
                                        <select 
                                            value={item.tkt} 
                                            onChange={e => setItemField(item.id, 'tkt', e.target.value)} 
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                        >
                                            <option value="">-- Pilih TKT --</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Institusi & Lokasi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <CampusSelect
                                    value={item.institusi}
                                    onChange={val => setItemField(item.id, 'institusi', val)}
                                    errors={{}}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Provinsi</label>
                                <select 
                                    value={item.provinsi} 
                                    onChange={e => setItemField(item.id, 'provinsi', e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                >
                                    <option value="">-- Pilih Provinsi --</option>
                                    {provinces.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lat</label>
                                    <input type="text" value={item.latitude} onChange={e => setItemField(item.id, 'latitude', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lng</label>
                                    <input type="text" value={item.longitude} onChange={e => setItemField(item.id, 'longitude', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Paten */}
                        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
                            <h5 className="text-sm font-semibold text-amber-800 mb-3">Informasi Paten</h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nomor Paten</label>
                                    <input type="text" value={item.nomor_paten} onChange={e => setItemField(item.id, 'nomor_paten', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi Paten</label>
                                    <textarea value={item.detail_paten} onChange={e => setItemField(item.id, 'detail_paten', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
