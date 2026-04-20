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
import LocationSelect from '../../../Components/LocationSelect';
import HeaderActions from '../../../Components/Admin/HeaderActions';

export default function Index({ fasilitasLab, stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [toolsModal, setToolsModal] = useState({ show: false, title: '', items: [] });



    // --- Bulk selection ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [itemsEdit, setItemsEdit] = useState([]);

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        router.post(route('admin.fasilitas-lab.bulk-destroy'), { ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteModal(false);
            },
            onError: () => {
                setShowBulkDeleteModal(false);
            }
        });
    };
    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);

        router.get(route('admin.fasilitas-lab.index'), {
            search,
            filters: newFilters,
            perPage,
            sort,
            direction
        }, {
            only: ['fasilitasLab'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSort = (field) => {
        const nextDirection = sort === field && direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.fasilitas-lab.index'), {
            search,
            filters: columnFilters,
            perPage,
            sort: field,
            direction: nextDirection,
        }, {
            only: ['fasilitasLab'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.fasilitas-lab.index'), {
            search,
            filters: columnFilters,
            perPage,
            sort,
            direction
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.fasilitas-lab.index'), {
            search,
            filters: columnFilters,
            perPage: next
        }, {
            only: ['fasilitasLab'],
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
        if (!itemToDelete) return;
        router.delete(route('admin.fasilitas-lab.destroy', itemToDelete.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setItemToDelete(null);
            },
        });
    };

    // --- Import / Export ---
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

                // Fasilitas Lab has strict column validation in frontend
                const requiredColumns = [
                    'kodeuniversitas', 'institusi', 'kategoript', 'namalaboratorium',
                    'provinsi', 'kota', 'latitude', 'longitude', 'totaljumlahalat',
                    'namaalat', 'deskripsialat', 'kontak'
                ];
                
                const uploadedColumns = Object.keys(data[0]).map(k => k.toLowerCase().trim().replace(/[\s_\-]+/g, ''));
                const missingColumns = requiredColumns.filter(col => !uploadedColumns.includes(col));

                if (missingColumns.length > 0) {
                    toast.error(`Gagal: Kolom tidak lengkap. Kurang kolom: ${missingColumns.join(', ')}`, { duration: 5000 });
                    setIsImporting(false);
                    if (onComplete) onComplete();
                    return;
                }

                router.post(route('admin.fasilitas-lab.import-excel'), { data }, {
                    onSuccess: () => {
                        setIsImporting(false);
                        setShowImportModal(false);
                        toast.success('Data fasilitas lab berhasil diimport.');
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

    const openBulkUpdateModal = () => {
        if (selectedIds.length === 0) return;
        const raw = fasilitasLab?.data || [];
        const prefilled = selectedIds.map(id => {
            const found = raw.find(r => r.id === id);
            return {
                id,
                kode_universitas: found?.kode_universitas === 'null' ? '' : (found?.kode_universitas || ''),
                institusi: found?.institusi === 'null' ? '' : (found?.institusi || ''),
                kategori_pt: found?.kategori_pt === 'null' ? '' : (found?.kategori_pt || ''),
                nama_laboratorium: found?.nama_laboratorium === 'null' ? '' : (found?.nama_laboratorium || ''),
                provinsi: found?.provinsi === 'null' ? '' : (found?.provinsi || ''),
                kota: found?.kota === 'null' ? '' : (found?.kota || ''),
                total_jumlah_alat: found?.total_jumlah_alat === 'null' ? '' : (found?.total_jumlah_alat || ''),
                nama_alat: found?.nama_alat === 'null' ? '' : (found?.nama_alat || ''),
                deskripsi_alat: found?.deskripsi_alat === 'null' ? '' : (found?.deskripsi_alat || ''),
                kontak: found?.kontak === 'null' ? '' : (found?.kontak || ''),
                latitude: found?.latitude === 'null' ? '' : (found?.latitude || ''),
                longitude: found?.longitude === 'null' ? '' : (found?.longitude || '')
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
        router.post(route('admin.fasilitas-lab.bulk-update'), { items: itemsEdit }, {
            onSuccess: () => {
                setShowBulkUpdateModal(false);
                setSelectedIds([]);
                setIsBulkUpdating(false);
                toast.success(`${itemsEdit.length} data fasilitas lab berhasil diperbarui.`);
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
            "Kode Universitas": "002001",
            "Institusi": "Institut Teknologi Bandung",
            "Kategori PT": "PTNBH",
            "Nama Laboratorium": "Laboratorium Kimia Terpadu",
            "Provinsi": "Jawa Barat",
            "Kota": "Bandung",
            "Latitude": -6.8903617,
            "Longitude": 107.6101912,
            "Total Jumlah Alat": 11,
            "Nama Alat": "Circular Dichroism (Cd)|Ft-Ir Spectrometer",
            "Deskripsi Alat": "1. Teknologi untuk mengukur dan menganalisis spektrum inframerah dari sampel.\n2. Alat yang digunakan untuk mengukur absorbansi suatu sampel.",
            "Kontak": "081357944698"
        }];
        const ws = XLSX.utils.json_to_sheet(dummyData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_FasilitasLab");
        XLSX.writeFile(wb, "Template_Import_FasilitasLab.xlsx");
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        Object.entries(columnFilters).forEach(([k, v]) => v && params.append(`filters[${k}]`, v));
        if (selectedIds.length > 0) {
            params.append('ids', selectedIds.join(','));
        }

        window.location.href = `/admin/fasilitas-lab/export-csv?${params.toString()}`;
    };

    const tableData = useMemo(() => {
        if (!fasilitasLab?.data || !Array.isArray(fasilitasLab.data)) {
            return [];
        }

        return fasilitasLab.data.map((item, index) => ({
            ...item,
            no: (fasilitasLab.from || 0) + index,
            aksi: (
                <div className="flex gap-2 justify-center">
                    <Link
                        href={route('admin.fasilitas-lab.edit', item.id)}
                        data={{
                            page: fasilitasLab.current_page,
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
        }));
    }, [fasilitasLab, search, columnFilters, perPage, sort, direction]);

    return (
        <AdminLayout title="">
            <Toaster position="top-right" />
            <div className="space-y-6 max-w-full">
                {/* Header */}
                <PageHeader
                    title="Data Fasilitas Lab"
                    subtitle="Kelola data fasilitas laboratorium"
                    icon={<span className="text-xl">🧪</span>}
                    actions={(
                        <HeaderActions
                            onExport={handleExport}
                            onImport={() => setShowImportModal(true)}
                            linkCreate={route('admin.fasilitas-lab.create')}
                            isImporting={isImporting}
                            selectedCount={selectedIds.length}
                            exportLabel="Export Data"
                            exportSelectedLabel="Export Terpilih"
                            createLabel="Tambah Data"
                        />
                    )}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total Fasilitas</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-800">{(stats.total || fasilitasLab.total || 0).toLocaleString('id-ID')}</p>
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
                                <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Dengan Koordinat</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-800">{(stats.withCoordinates || 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white text-blue-600 text-xs sm:text-sm font-black h-8 sm:h-10 px-3 sm:px-4 flex items-center justify-center rounded-xl shadow-sm border-2 border-blue-100">
                                        {selectedIds.length}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs sm:text-sm font-black text-white leading-tight uppercase tracking-wider">
                                            Data Terpilih
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="h-8 w-px bg-blue-500/50 hidden md:block"></div>
                                
                                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                    <button
                                        onClick={openBulkUpdateModal}
                                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 sm:px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/20 shadow-sm active:scale-95"
                                        title="Update massal"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="hidden sm:inline">Update</span>
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-3 sm:px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-all shadow-sm border border-red-400/30 active:scale-95"
                                        title="Hapus massal"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="hidden sm:inline">Hapus</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setSelectedIds([])}
                                className="w-full sm:w-auto text-xs font-bold text-blue-100 hover:text-white transition-colors bg-blue-700/40 py-2.5 px-4 rounded-xl border border-blue-500/50 hover:bg-blue-700/60 active:scale-95"
                            >
                                Batal Seleksi
                            </button>
                        </div>
                    )}
                    <div className="p-6 border-b">
                        <form onSubmit={handleSearch} className="flex gap-3 items-center flex-wrap">
                            <input
                                type="text"
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Cari nama lab, nama alat, institusi, provinsi..."
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
                                    href={route('admin.fasilitas-lab.index')}
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
                            columnFilterEnabled={true}
                            selectionEnabled
                            selectedItemIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            emptyText="Tidak ada data fasilitas laboratorium"
                            columns={[
                                { key: 'no', title: 'No', className: 'w-16 text-center' },
                                { key: 'nama_laboratorium', title: 'Nama Lab', className: 'min-w-[200px]', sortable: true, render: (v) => <div className="whitespace-normal leading-relaxed text-sm font-medium text-slate-700" title={fmt(v)}>{display(v)}</div> },
                                { key: 'institusi', title: 'Institusi', className: 'min-w-[180px] max-w-[250px]', sortable: true, render: (v) => <div className="whitespace-normal leading-relaxed text-sm font-medium text-slate-700" title={fmt(v)}>{display(v)}</div> },
                                {
                                    key: 'nama_alat',
                                    title: 'Nama Alat',
                                    className: 'min-w-[300px] max-w-[350px] y-2',
                                    render: (v, row) => {
                                        const cleaned = fmt(v);
                                        if (!cleaned) return display(v);
                                        const items = cleaned.split(/\r?\n|;\s*|\|\s*/).map(i => i.replace(/^\d+\.\s*/, '').trim()).filter(i => i !== '');
                                        if (items.length === 0) return display(v);

                                        return (
                                            <div className="space-y-1">
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    {items.slice(0, 4).map((item, i) => (
                                                        <li key={i} className="leading-tight" title={item}>
                                                            <span className="font-medium text-slate-400 mr-1.5">{items.length > 1 ? `${i + 1}.` : ''}</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {items.length > 4 && (
                                                    <button
                                                        onClick={() => setToolsModal({ show: true, title: row.nama_laboratorium, items })}
                                                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1 group transition-colors"
                                                    >
                                                        <span>Lihat semua {items.length} alat</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }
                                },
                                { 
                                    key: 'kontak', 
                                    title: 'Kontak', 
                                    className: 'min-w-[150px]', 
                                    sortable: true, 
                                    render: (v) => {
                                        const val = fmt(v);
                                        if (!val || val.toLowerCase() === 'null') return <span className="text-slate-400 italic text-sm">Kontak tidak tersedia</span>;
                                        return <span className="text-slate-700 text-sm font-medium">{val}</span>;
                                    } 
                                },
                                { key: 'total_jumlah_alat', title: 'Total Jumlah Alat', className: 'w-30 text-center', sortable: true, filterable: false, render: (v) => <Badge color="blue">{display(v === 0 ? '0' : v)}</Badge> },
                                { key: 'aksi', title: 'Aksi', className: 'w-24 sticky right-0 bg-white/95 backdrop-blur-sm' },
                            ]}
                            data={tableData}
                            filters={columnFilters}
                            onFilterChange={handleColumnFilterChange}
                            sort={{ key: sort, direction }}
                            onSort={({ key }) => handleSort(key)}
                        />
                    </div>

                    {/* Pagination */}
                    {fasilitasLab.last_page > 1 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-slate-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-slate-600 text-center sm:text-left">
                                    Menampilkan {fasilitasLab.from?.toLocaleString('id-ID')} - {fasilitasLab.to?.toLocaleString('id-ID')} dari {fasilitasLab.total?.toLocaleString('id-ID')} data
                                </p>
                                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                    {fasilitasLab.links.map((link, index) => {
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

            {/* Tools Modal */}
            {toolsModal.show && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Daftar Alat</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{toolsModal.title}</p>
                            </div>
                            <button
                                onClick={() => setToolsModal({ show: false, title: '', items: [] })}
                                className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                {toolsModal.items.map((item, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-slate-700 py-1.5 border-b border-slate-50 last:border-0 group">
                                        {toolsModal.items.length > 1 && (
                                            <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                {i + 1}
                                            </span>
                                        )}
                                        <span className="leading-relaxed pt-0.5">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-medium">Total: {toolsModal.items.length} Alat</span>
                            <button
                                onClick={() => setToolsModal({ show: false, title: '', items: [] })}
                                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Individual Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Data?</h3>
                        <p className="text-slate-600 mb-6 leading-relaxed text-sm">Apakah Anda yakin ingin menghapus data fasilitas ini? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">Batal</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Hapus Data</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Hapus {selectedIds.length} Data?</h3>
                        <p className="text-slate-600 mb-6 text-center leading-relaxed text-sm">Seluruh data fasilitas terpilih ({selectedIds.length} item) akan dihapus secara permanen.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                            <button onClick={confirmBulkDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95">Ya, Hapus Semua</button>
                        </div>
                    </div>
                </div>
            )}

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                onDownloadTemplate={handleDownloadTemplate}
                isImporting={isImporting}
                title="Import Data Fasilitas Lab"
            />

            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title="Bulk Update Data Fasilitas Lab"
                renderItemForm={(item) => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kode Universitas</label>
                                <input type="text" value={item.kode_universitas || ''} onChange={e => setItemField(item.id, 'kode_universitas', e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kategori PT</label>
                                <input type="text" value={item.kategori_pt || ''} onChange={e => setItemField(item.id, 'kategori_pt', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div className="md:col-span-2">
                                <CampusSelect
                                    value={item.institusi}
                                    onChange={val => setItemField(item.id, 'institusi', val)}
                                    errors={{}}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Laboratorium</label>
                                <input type="text" value={item.nama_laboratorium || ''} onChange={e => setItemField(item.id, 'nama_laboratorium', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Total Jumlah Alat</label>
                                <input type="text" inputMode="numeric" value={item.total_jumlah_alat || ''} onChange={e => setItemField(item.id, 'total_jumlah_alat', e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kontak</label>
                                <input type="text" inputMode="numeric" value={item.kontak || ''} onChange={e => setItemField(item.id, 'kontak', e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <LocationSelect
                                    selectedProvince={item.provinsi || ''}
                                    selectedRegency={item.kota || ''}
                                    onProvinceChange={val => setItemField(item.id, 'provinsi', val)}
                                    onRegencyChange={val => setItemField(item.id, 'kota', val)}
                                    errors={{}}
                                    showRequiredIndicator={false}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Latitude</label>
                                <input type="text" inputMode="decimal" value={item.latitude || ''} onChange={e => setItemField(item.id, 'latitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Longitude</label>
                                <input type="text" inputMode="decimal" value={item.longitude || ''} onChange={e => setItemField(item.id, 'longitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Alat</label>
                                <textarea value={item.nama_alat || ''} onChange={e => setItemField(item.id, 'nama_alat', e.target.value)} rows="4" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi Alat</label>
                                <textarea value={item.deskripsi_alat || ''} placeholder="Tidak ada deskripsinya" onChange={e => setItemField(item.id, 'deskripsi_alat', e.target.value)} rows="6" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                        </div>
                    </div>
                )}
            />
        </AdminLayout>
    );
}


