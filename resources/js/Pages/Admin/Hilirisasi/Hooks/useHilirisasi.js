import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function useHilirisasi(hilirisasi, filters = {}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    // State untuk filter
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

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

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
                const cell = ws[col + (R + 1)]; // id_proposal sebagai string biasanya lebih baik
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

                const firstRowKeys = Object.keys(data[0]).map(k => k.toLowerCase().replace(/\\s+/g, '_').trim());
                const missingColumns = requiredColumns.filter(col => {
                    const normalizedCol = col.toLowerCase().replace(/\\s+/g, '_');
                    return !firstRowKeys.includes(normalizedCol) &&
                        !firstRowKeys.includes(normalizedCol.replace('_', ''));
                });

                if (missingColumns.length > 0) {
                    toast.error(`Gagal: Kolom tidak lengkap. Kurang kolom: ${missingColumns.join(', ')}`, { duration: 5000 });
                    setIsImporting(false);
                    if (onComplete) onComplete();
                    return;
                }

                router.post(route('admin.hilirisasi.import-excel'), { data }, {
                    onSuccess: (page) => {
                        setIsImporting(false);
                        setShowImportModal(false);
                        if (page.props.flash?.error) {
                            toast.error(page.props.flash.error);
                        } else {
                            toast.success(page.props.flash?.success || 'Data hilirisasi berhasil diimport.');
                        }
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

    return {
        showDeleteModal, setShowDeleteModal,
        itemToDelete, setItemToDelete,
        search, setSearch,
        perPage, setPerPage,
        columnFilters, setColumnFilters,
        selectedIds, setSelectedIds,
        isAllSelectedGlobal, setIsAllSelectedGlobal,
        showBulkDeleteModal, setShowBulkDeleteModal,
        showBulkUpdateModal, setShowBulkUpdateModal,
        itemsEdit, setItemsEdit,
        isBulkUpdating, setIsBulkUpdating,
        isImporting, setIsImporting,
        showImportModal, setShowImportModal,
        sort, direction,
        fileInputRef,
        handleBulkDelete, confirmBulkDelete,
        handleSearch, confirmDelete,
        handleSearchChange, handleColumnFilterChange,
        handlePerPageChange, handleDelete,
        handleDownloadTemplate, handleImport,
        openBulkUpdateModal, setItemField,
        confirmBulkUpdate, handleExport
    };
}
