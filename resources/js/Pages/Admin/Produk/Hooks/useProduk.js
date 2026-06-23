import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function useProduk(produk, filters = {}) {
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
    const [showImportModal, setShowImportModal] = useState(false);
    const [provinces, setProvinces] = useState([]);

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    useEffect(() => {
        fetch(route('admin.produk.provinces'))
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(err => console.error('Error fetching provinces:', err));
    }, []);

    const handleColumnFilterChange = (key, value) => {
        const newFilters = { ...columnFilters, [key]: value };
        setColumnFilters(newFilters);
        router.get(route('admin.produk.index'), {
            search, filters: newFilters, perPage, sort, direction
        }, { only: ['produk'], preserveState: true, preserveScroll: true, replace: true });
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.produk.index'), {
            search, filters: columnFilters, perPage: next, sort, direction
        }, { only: ['produk'], preserveState: true, preserveScroll: true, replace: true });
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.produk.index'), {
            search, filters: columnFilters, perPage, sort, direction
        }, { only: ['produk'], preserveState: true, preserveScroll: true, replace: true });
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
                deskripsi_paten: found?.deskripsi_paten || '',
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
            "Deskripsi Produk": "BioFerment Kakao Pro adalah mesin fermentasi kakao berbasis mikrokontroler yang mampu mengontrol suhu dan kelembaban secara otomatis.",
            "Tingkat Kesiapterapan Teknologi (TKT)": 7,
            "Bidang": "Pangan",
            "Nama Inventor (Tanpa Gelar)": "Ahmad Fauzi Ramadhan",
            "Email Inventor": "a.fauzi@unhas.ac.id",
            "Nomor Paten": "S00202401023",
            "Deskripsi Paten": "Dalam invensi ini, diajukan mesin fermentasi kakao otomatis dengan sistem kontrol suhu berbasis mikrokontroler."
        }];

        const ws = XLSX.utils.json_to_sheet(dummyData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_Produk");
        XLSX.writeFile(wb, "Template_Import_Produk.xlsx");
    };

    const handleImport = async (file, onComplete) => {
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExt = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
        if (!allowedExtensions.includes('.' + fileExt)) {
            toast.error('Gagal: Tipe data harus Excel (.xlsx, .xls) atau CSV.');
            if (onComplete) onComplete();
            return;
        }

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

    return {
        perPage, search, setSearch, columnFilters,
        showDeleteModal, setShowDeleteModal,
        itemToDelete, setItemToDelete,
        selectedIds, setSelectedIds,
        isAllSelectedGlobal, setIsAllSelectedGlobal,
        showBulkDeleteModal, setShowBulkDeleteModal,
        showBulkUpdateModal, setShowBulkUpdateModal,
        itemsEdit, setItemsEdit, isBulkUpdating,
        isImporting, showImportModal, setShowImportModal,
        provinces,
        handleColumnFilterChange, handlePerPageChange, handleSearch,
        handleDelete, confirmDelete,
        handleBulkDelete, confirmBulkDelete,
        openBulkUpdateModal, setItemField, confirmBulkUpdate,
        handleDownloadTemplate, handleImport, handleExport
    };
}
