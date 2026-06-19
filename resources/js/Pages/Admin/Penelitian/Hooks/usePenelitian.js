import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function usePenelitian(penelitian, filters = {}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

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
        const payload = {
            ids: isAllSelectedGlobal ? 'all' : selectedIds,
            search: isAllSelectedGlobal ? search : undefined,
            filters: isAllSelectedGlobal ? columnFilters : undefined
        };

        router.post(route('admin.penelitian.bulk-destroy'), payload, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsAllSelectedGlobal(false);
                setShowBulkDeleteModal(false);
                toast.success('Data penelitian berhasil dihapus.');
            },
            onError: () => {
                setShowBulkDeleteModal(false);
                toast.error('Gagal menghapus data.');
            }
        });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.penelitian.index'), {
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

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);

        router.get(route('admin.penelitian.index'), {
            search,
            filters: newFilters,
            sort,
            direction,
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
            sort,
            direction,
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
                    toast.success('Data berhasil dihapus.');
                }
            });
        }
    };

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
                toast.success(`${itemsEdit.length} data penelitian berhasil diperbarui.`);
            },
            onError: (errors) => {
                setIsBulkUpdating(false);
                const msg = Object.values(errors)[0] || 'Terjadi kesalahan.';
                toast.error(msg);
            }
        });
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams();

        if (selectedIds.length > 0 && !isAllSelectedGlobal) {
            params.append('ids', selectedIds.join(','));
        } else if (isAllSelectedGlobal) {
            params.append('ids', 'all');
        }

        if (search) params.append('search', search);

        Object.entries(columnFilters).forEach(([key, value]) => {
            if (value) params.append(`filters[${key}]`, value);
        });

        window.open(route('admin.penelitian.export-csv') + '?' + params.toString());
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
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            ['B', 'C', 'G'].forEach(col => {
                const cell = ws[col + (R + 1)];
                if (cell) {
                    cell.t = 's';
                    cell.z = '@';
                }
            });
        }
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_Penelitian");
        XLSX.writeFile(wb, "Template_Import_Penelitian.xlsx");
    };

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
        confirmBulkUpdate, handleExportExcel
    };
}
