import { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function useFasilitasLab(fasilitasLab, filters) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.perPage || 20);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [columnFilters, setColumnFilters] = useState(filters?.columns || {});
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
    
    const sort = filters?.sort || 'id';
    const direction = filters?.direction || 'desc';

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

                const requiredColumns = [
                    'kodeuniversitas', 'institusi', 'provinsi',
                    'namalaboratorium', 'latitude', 'longitude', 'totaljumlahalat',
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
                provinsi: found?.provinsi === 'null' ? '' : (found?.provinsi || ''),
                kota: found?.kota === 'null' ? '' : (found?.kota || ''),
                nama_laboratorium: found?.nama_laboratorium === 'null' ? '' : (found?.nama_laboratorium || ''),
                latitude: found?.latitude === 'null' ? '' : (found?.latitude || ''),
                longitude: found?.longitude === 'null' ? '' : (found?.longitude || ''),
                total_jumlah_alat: found?.total_jumlah_alat === 'null' ? '' : (found?.total_jumlah_alat || ''),
                nama_alat: found?.nama_alat === 'null' ? '' : (found?.nama_alat || ''),
                deskripsi_alat: found?.deskripsi_alat === 'null' ? '' : (found?.deskripsi_alat || ''),
                kontak: found?.kontak === 'null' ? '' : (found?.kontak || '')
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
            "Provinsi": "Jawa Barat",
            "Nama Laboratorium": "Laboratorium Kimia Terpadu",
            "Latitude": -6.8903617,
            "Longitude": 107.6101912,
            "Total Jumlah Alat": 11,
            "Nama Alat": "Circular Dichroism (Cd)|Ft-Ir Spectrometer",
            "Deskripsi Alat": "1. Teknologi untuk mengukur dan menganalisis spektrum inframerah dari sampel.\\n2. Alat yang digunakan untuk mengukur absorbansi suatu sampel.",
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

    return {
        search, setSearch,
        perPage, setPerPage,
        showDeleteModal, setShowDeleteModal,
        itemToDelete, setItemToDelete,
        columnFilters, setColumnFilters,
        toolsModal, setToolsModal,
        selectedIds, setSelectedIds,
        showBulkDeleteModal, setShowBulkDeleteModal,
        showBulkUpdateModal, setShowBulkUpdateModal,
        isBulkUpdating, setIsBulkUpdating,
        itemsEdit, setItemsEdit,
        showImportModal, setShowImportModal,
        isImporting, setIsImporting,
        handleBulkDelete, confirmBulkDelete,
        handleColumnFilterChange, handleSearch, handleSearchChange, handlePerPageChange,
        handleDelete, confirmDelete,
        handleImport, handleExport, handleDownloadTemplate,
        openBulkUpdateModal, setItemField, confirmBulkUpdate,
        sort, direction
    };
}
