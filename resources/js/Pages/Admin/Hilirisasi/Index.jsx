import React, { useState, useMemo, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';
import { fmt, display, titleCase } from '../../../Utils/format';
import * as XLSX from 'xlsx';
import ImportModal from '../../../Components/ImportModal';
import BulkUpdateModal from '../../../Components/BulkUpdateModal';
import CampusSelect from '../../../Components/CampusSelect';
import LocationSelect from '../../../Components/LocationSelect';
import HeaderActions from '../../../Components/Admin/HeaderActions';


export default function Index({ hilirisasi, stats = {}, filters = {} }) {
    const { flash } = usePage().props;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    // State for filters
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});

    // --- Bulk selection ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [isAllSelectedGlobal, setIsAllSelectedGlobal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    
    // --- Bulk Update ---
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [itemsEdit, setItemsEdit] = useState([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    
    // --- Import ---
    const fileInputRef = useRef(null);
    const [isImporting, setIsImporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        const payload = isAllSelectedGlobal 
            ? { ids: 'all', search, filters: columnFilters } 
            : { ids: selectedIds };

        router.post(route('admin.hilirisasi.bulk-destroy'), payload, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsAllSelectedGlobal(false);
                setShowBulkDeleteModal(false);
                toast.success('Data hilirisasi berhasil dihapus.');
            },
            onError: () => {
                setShowBulkDeleteModal(false);
                toast.error('Gagal menghapus data.');
            }
        });
    };

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
            only: ['hilirisasi'],
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
            only: ['hilirisasi'],
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

    const handleDownloadTemplate = () => {
        const dummyData = [{
            "Tahun": 2022,
            "ID Proposal": 2390,
            "Judul": "Pengembangan Industri Minyak Atsiri Melalui Proses Fraksinasi Untuk Peningkatan Nilai Tambah Nilam Berbasis Pemberdayaan Petani Secara Berkelanjutan",
            "Nama Pengusul": "SARIFAH NURJANAH",
            "Direktorat": "DIKTI",
            "Perguruan Tinggi": "Universitas Padjadjaran",
            "pt_latitude": -6.9361447,
            "pt_longitude": 107.7090265,
            "provinsi": "jawa barat",
            "Mitra": "Wakaf Lintang Nusawangi",
            "Skema": "Adopsi iptek dan kepakaran oleh perguruan tinggi untuk Dunia Usaha Dunia Industri (DUDI) / masyarakat (termasuk bentuk kegiatan pelatihan, pembinaan, dan bentuk jasa/produk lainnya)",
            "Luaran": "Mahasiswa melaksanakan program MBKM, Pendampingan Budidaya Nilam , Transfer teknologi fraksinasi dan kultur jaringan, Program Studi Berkerjasama dengan Mitra (PKS)"
        }];
        const ws = XLSX.utils.json_to_sheet(dummyData);

        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            ['B'].forEach(col => {
                const cell = ws[col + (R + 1)]; // id_proposal as string usually better
                if (cell) {
                    cell.t = 's';
                    cell.z = '@';
                }
            });
        }
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_Hilirisasi");
        XLSX.writeFile(wb, "Template_Import_Hilirisasi.xlsx");
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

        // 2. Validasi Ukuran (Max 2MB untuk Hilirisasi agar lebih lega)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Gagal: Ukuran file maksimal 2MB.');
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
                    if (onComplete) onComplete();
                    return;
                }

                // 3. Validasi Nama Kolom (Harus ada kolom utama)
                const requiredColumns = [
                    'tahun', 'id_proposal', 'judul', 'nama_pengusul', 'direktorat',
                    'perguruan_tinggi', 'pt_latitude', 'pt_longitude', 'provinsi',
                    'mitra', 'skema', 'luaran'
                ];

                const firstRowKeys = Object.keys(data[0]).map(k => k.toLowerCase().replace(/\s+/g, '_').trim());
                const missingColumns = requiredColumns.filter(col => {
                    const normalizedCol = col.toLowerCase().replace(/\s+/g, '_');
                    return !firstRowKeys.includes(normalizedCol) && 
                           !firstRowKeys.includes(normalizedCol.replace('_', '')); // tolerance for idproposal
                });

                if (missingColumns.length > 0) {
                    toast.error(`Gagal: Kolom tidak lengkap. Kurang kolom: ${missingColumns.join(', ')}`, { duration: 5000 });
                    setIsImporting(false);
                    if (onComplete) onComplete();
                    return;
                }

                router.post(route('admin.hilirisasi.import-excel'), { data }, {
                    onSuccess: () => {
                        setIsImporting(false);
                        setShowImportModal(false);
                        toast.success('Data hilirisasi berhasil diimport.');
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
        const raw = hilirisasi?.data || [];
        const prefilled = selectedIds.map(id => {
            const found = raw.find(r => r.id === id);
            return {
                id,
                tahun: found?.tahun ?? 0,
                id_proposal: found?.id_proposal ?? 0,
                judul: found?.judul || '',
                nama_pengusul: found?.nama_pengusul || '',
                direktorat: found?.direktorat || '',
                perguruan_tinggi: found?.perguruan_tinggi || '',
                pt_latitude: found?.pt_latitude ?? 0,
                pt_longitude: found?.pt_longitude ?? 0,
                provinsi: found?.provinsi || '',
                mitra: found?.mitra || '',
                skema: found?.skema || '',
                luaran: found?.luaran || '',
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
        router.post(route('admin.hilirisasi.bulk-update'), { items: itemsEdit }, {
            onSuccess: () => {
                setShowBulkUpdateModal(false);
                setSelectedIds([]);
                setIsBulkUpdating(false);
                toast.success(`${itemsEdit.length} data hilirisasi berhasil diperbarui.`);
            },
            onError: (errors) => {
                setIsBulkUpdating(false);
                const msg = Object.values(errors)[0] || 'Terjadi kesalahan.';
                toast.error(msg);
            }
        });
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

        window.location.href = `/admin/hilirisasi/export-csv?${params.toString()}`;
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

    const tableData = useMemo(() => {
        return (hilirisasi.data || []).map((item, index) => ({
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
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                        title="Edit"
                    >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                    <button
                        onClick={() => handleDelete(item)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                        title="Hapus"
                    >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
        }));
    }, [hilirisasi, search, columnFilters, perPage, sort, direction]);

    return (
        <AdminLayout title="">
            <Toaster position="top-right" />
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Data Hilirisasi"
                    subtitle="Kelola data hilirisasi riset"
                    icon={<span className="text-xl">🏭</span>}
                actions={(
                    <HeaderActions
                        onExport={handleExport}
                        onImport={() => setShowImportModal(true)}
                        isImporting={isImporting}
                        linkCreate={route('admin.hilirisasi.create')}
                        selectedCount={selectedIds.length}
                    />
                )}

                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total Hilirisasi</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-800">{(stats?.total ?? 0).toLocaleString('id-ID')}</p>
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
                                <p className="text-xl sm:text-2xl font-bold text-slate-800">{(stats?.withCoordinates ?? 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden relative">
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-blue-600/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-10 border-b border-white/10">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                <div className="flex items-center gap-3 self-start sm:self-center">
                                    <div className="bg-white text-blue-600 text-xs sm:text-sm font-black h-8 sm:h-10 px-3 sm:px-4 flex items-center justify-center rounded-xl shadow-lg border-2 border-white">
                                        {isAllSelectedGlobal ? hilirisasi.total : selectedIds.length}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs sm:text-sm font-black text-white leading-tight uppercase tracking-wider">
                                            Data Terpilih
                                        </span>
                                        <span className="text-[10px] text-blue-50 font-bold uppercase tracking-wider opacity-80">
                                            {isAllSelectedGlobal ? 'Seluruh Halaman' : 'Aksi massal tersedia'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="h-8 w-px bg-white/20 hidden md:block"></div>
                                
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    {!isAllSelectedGlobal && (
                                        <button
                                            onClick={openBulkUpdateModal}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/20 shadow-sm flex-1 sm:flex-none active:scale-95"
                                            title="Update massal"
                                        >
                                            <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span className="hidden sm:inline">Update</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={handleBulkDelete}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-all shadow-lg border border-red-400/30 flex-1 sm:flex-none active:scale-95"
                                        title="Hapus massal"
                                    >
                                        <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="hidden sm:inline">Hapus</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => {
                                    setSelectedIds([]);
                                    setIsAllSelectedGlobal(false);
                                }}
                                className="w-full sm:w-auto text-xs font-bold text-blue-50 hover:text-white transition-all bg-white/10 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/20 active:scale-95"
                            >
                                Batal Seleksi
                            </button>
                        </div>
                    )}
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
                                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Cari
                            </button>
                            {(search || Object.values(columnFilters).some(v => v)) && (
                                <Link
                                    href={route('admin.hilirisasi.index')}
                                    className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-200 text-slate-700 text-sm sm:text-base rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Reset
                                </Link>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-sm text-slate-600 hidden sm:inline">Per halaman</span>
                                <select value={perPage} onChange={handlePerPageChange} className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm">
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
                        localFilterEnabled={false}
                        columnFilterEnabled={true}
                        selectionEnabled
                        selectedItemIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        totalItems={hilirisasi.total}
                        isAllSelectedGlobal={isAllSelectedGlobal}
                        onSelectAllGlobal={() => setIsAllSelectedGlobal(true)}
                        onClearSelection={() => {
                            setSelectedIds([]);
                            setIsAllSelectedGlobal(false);
                        }}
                        filters={columnFilters}
                        onFilterChange={handleColumnFilterChange}
                        columns={[
                            { key: 'no', title: 'No', className: 'w-12 text-center' },
                            { key: 'judul', title: 'Judul', sortable: true, className: 'min-w-[320px]', render: (v) => (<div className="max-w-md line-clamp-4 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                            { key: 'nama_pengusul', title: 'Nama Pengusul', sortable: true, render: (v) => normalizeNameWithDegrees(v) },
                            {
                                key: 'direktorat',
                                title: 'Direktorat',
                                sortable: true,
                                className: 'min-w-[220px]',
                                render: (v) => (
                                    <Badge color="purple">{display(v)}</Badge>
                                )
                            },
                            { key: 'skema', title: 'Skema', sortable: true, className: 'min-w-[220px]', render: (v) => (<div className="max-w-md line-clamp-3 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                            { key: 'perguruan_tinggi', title: 'Perguruan Tinggi', sortable: true, className: 'min-w-[200px]', render: (v) => (<div className="max-w-md line-clamp-2 whitespace-normal leading-snug" title={fmt(v)}> {display(v)} </div>) },
                            {
                                key: 'tahun',
                                title: 'Tahun',
                                sortable: true,
                                className: 'min-w-[120px] text-center',
                                render: (v) => <Badge color="blue">{display(v)}</Badge>
                            },
                            { key: 'mitra', title: 'Mitra', className: 'min-w-[320px]', render: (v) => <div className="max-w-md line-clamp-4 whitespace-normal leading-snug" title={titleCase(v)}>{display(titleCase(v))}</div> },
                            { key: 'aksi', title: 'Aksi', className: 'w-28 sticky right-0 bg-white/95 backdrop-blur-sm' },
                        ]}
                        data={tableData}
                    />

                    {/* Pagination */}
                    {hilirisasi.last_page > 1 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-slate-200/60">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-slate-600 text-center sm:text-left">
                                    Menampilkan {hilirisasi.from?.toLocaleString('id-ID')} - {hilirisasi.to?.toLocaleString('id-ID')} dari {hilirisasi.total?.toLocaleString('id-ID')} data
                                </div>
                                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                    {hilirisasi.links.map((link, index) => {
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
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Data hilirisasi ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus {isAllSelectedGlobal ? hilirisasi.total.toLocaleString('id-ID') : selectedIds.length} Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Seluruh data hilirisasi terpilih ({isAllSelectedGlobal ? hilirisasi.total.toLocaleString('id-ID') : selectedIds.length} item) akan dihapus secara permanen.
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
            {/* Import Modal Component */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onDownloadTemplate={handleDownloadTemplate}
                onImport={handleImport}
                isImporting={isImporting}
                title="Import Data Hilirisasi"
                moduleName="hilirisasi"
            />

            {/* Bulk Update Modal Component */}
            <BulkUpdateModal 
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title="Bulk Update Data Hilirisasi"
                renderItemForm={(item) => (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Section 1: Profil */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Pengusul</label>
                                <input type="text" value={item.nama_pengusul} onChange={e => setItemField(item.id, 'nama_pengusul', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">ID Proposal</label>
                                <input type="text" value={item.id_proposal} onChange={e => setItemField(item.id, 'id_proposal', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        </div>

                        {/* Section 2: Institusi */}
                        <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100/50">
                            <h5 className="text-sm font-semibold text-sky-800 mb-3">Institusi</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <CampusSelect
                                        label="Perguruan Tinggi"
                                        name="perguruan_tinggi"
                                        value={item.perguruan_tinggi}
                                        onChange={val => setItemField(item.id, 'perguruan_tinggi', val)}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Lokasi & Koordinat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <LocationSelect
                                    selectedProvince={item.provinsi}
                                    selectedRegency=""
                                    onProvinceChange={val => setItemField(item.id, 'provinsi', val)}
                                    onRegencyChange={() => { }}
                                    hideRegency={true}
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

                        {/* Section 4: Data Hilirisasi */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Judul Hilirisasi</label>
                                <textarea value={item.judul} onChange={e => setItemField(item.id, 'judul', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-24 resize-none leading-relaxed" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tahun</label>
                                    <input type="number" value={item.tahun} onChange={e => setItemField(item.id, 'tahun', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" min="2000" max="2099" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Skema</label>
                                    <select
                                        value={item.skema}
                                        onChange={e => setItemField(item.id, 'skema', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">-- Pilih Skema --</option>
                                        <option value="A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi">A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi</option>
                                        <option value="A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI">A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI</option>
                                        <option value="A3: Pengembangan produk inovasi bersama DUDI">A3: Pengembangan produk inovasi bersama DUDI</option>
                                        <option value="A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering">A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering</option>
                                        <option value="B1: Penyelesaian persoalan yang ada di masyarakat">B1: Penyelesaian persoalan yang ada di masyarakat</option>
                                        <option value="B2: Penyelesaian persoalan yang ada di Institusi Pemerintah">B2: Penyelesaian persoalan yang ada di Institusi Pemerintah</option>
                                        <option value="Penyelesaian persoalan yang ada di masyarakat atau Institusi Pemerintah (termasuk kegiatan pengabdian masyarakat, penyusunan naskah akademik, kebijakan, rekomendasi, dan bentuk penyelesaian lainnya)">Penyelesaian persoalan yang ada di masyarakat atau Institusi Pemerintah</option>
                                        <option value="Penyediaan jasa, tenaga ahli, dan produk kepakaran perguruan tinggi untuk Dunia Usaha Dunia Industri (DUDI) / masyarakat (termasuk bentuk kegiatan pelatihan, pembinaan, dan bentuk jasa/produk lainnya)">Penyediaan jasa, tenaga ahli, dan produk kepakaran perguruan tinggi</option>
                                        <option value="Adopsi atau difusi, hilirisasi, komersialisasi produk, purwarupa, teknologi, kebijakan (termasuk mini-plant, teaching factory, teaching industry) untuk memenuhi kebutuhan mitra">Adopsi atau difusi, hilirisasi, komersialisasi produk</option>
                                        <option value="Pembentukan atau penguatan research and innovation center atau pusat unggulan teknologi (Centre of Excellence/CoE) bersama DUDI untuk menjadi pusat kajian atau riset untuk pengembangan DUDI atau untuk penyelesaian permasalahan DUDI">Pembentukan atau penguatan research and innovation center</option>
                                        <option value="Penerapan rencana bisnis and business model canvas (BMC) untuk Startup (termasuk UMKM) yang dibangun oleh perguruan tinggi bekerja sama dengan DUDI maupun oleh mahasiswa bekerja sama dengan alumni dan/atau DUDI dibawah supervisi dosen">Penerapan rencana bisnis dan BMC Startup</option>
                                        <option value="Dorongan Teknologi - Tim Pakar/Pengkaji">Dorongan Teknologi - Tim Pakar/Pengkaji</option>
                                        <option value="Ajakan Industri PT - 1 Tahun">Ajakan Industri PT - 1 Tahun</option>
                                        <option value="Ajakan Industri PT - 2 Tahun">Ajakan Industri PT - 2 Tahun</option>
                                        <option value="Ajakan Industri PT - 3 Tahun">Ajakan Industri PT - 3 Tahun</option>
                                        <option value="Hilirisasi Inovasi Komersial">Hilirisasi Inovasi Komersial</option>
                                        <option value="Hilirisasi Inovasi Sosial">Hilirisasi Inovasi Sosial</option>
                                        {item.skema && ![
                                            "A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi",
                                            "A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI",
                                            "A3: Pengembangan produk inovasi bersama DUDI",
                                            "A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering",
                                            "B1: Penyelesaian persoalan yang ada di masyarakat",
                                            "B2: Penyelesaian persoalan yang ada di Institusi Pemerintah",
                                            "Penyelesaian persoalan yang ada di masyarakat atau Institusi Pemerintah (termasuk kegiatan pengabdian masyarakat, penyusunan naskah akademik, kebijakan, rekomendasi, dan bentuk penyelesaian lainnya)",
                                            "Penyediaan jasa, tenaga ahli, dan produk kepakaran perguruan tinggi untuk Dunia Usaha Dunia Industri (DUDI) / masyarakat (termasuk bentuk kegiatan pelatihan, pembinaan, dan bentuk jasa/produk lainnya)",
                                            "Adopsi atau difusi, hilirisasi, komersialisasi produk, purwarupa, teknologi, kebijakan (termasuk mini-plant, teaching factory, teaching industry) untuk memenuhi kebutuhan mitra",
                                            "Pembentukan atau penguatan research and innovation center atau pusat unggulan teknologi (Centre of Excellence/CoE) bersama DUDI untuk menjadi pusat kajian atau riset untuk pengembangan DUDI atau untuk penyelesaian permasalahan DUDI",
                                            "Penerapan rencana bisnis and business model canvas (BMC) untuk Startup (termasuk UMKM) yang dibangun oleh perguruan tinggi bekerja sama dengan DUDI maupun oleh mahasiswa bekerja sama dengan alumni dan/atau DUDI dibawah supervisi dosen",
                                            "Dorongan Teknologi - Tim Pakar/Pengkaji",
                                            "Ajakan Industri PT - 1 Tahun",
                                            "Ajakan Industri PT - 2 Tahun",
                                            "Ajakan Industri PT - 3 Tahun",
                                            "Hilirisasi Inovasi Komersial",
                                            "Hilirisasi Inovasi Sosial"
                                        ].includes(item.skema) && (
                                                <option value={item.skema}>{item.skema}</option>
                                            )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Direktorat</label>
                                    <select
                                        value={item.direktorat}
                                        onChange={e => setItemField(item.id, 'direktorat', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">-- Pilih Direktorat --</option>
                                        <option value="DIKSI">DIKSI</option>
                                        <option value="DIKTI">DIKTI</option>
                                        <option value="Direktorat Hilirisasi dan Kemitraan">Direktorat Hilirisasi dan Kemitraan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Luaran</label>
                                    <input type="text" value={item.luaran} onChange={e => setItemField(item.id, 'luaran', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Mitra</label>
                                    <input type="text" value={item.mitra} onChange={e => setItemField(item.id, 'mitra', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        </AdminLayout>
    );
}
