import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function usePengabdian(pengabdian, filters = {}) {
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
    const [isImporting, setIsImporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const type = filters.type || 'batch';

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        const payload = isAllSelectedGlobal
            ? { ids: 'all', search, filters: columnFilters, type }
            : { ids: selectedIds };

        router.post(route('admin.pengabdian.bulk-destroy'), payload, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsAllSelectedGlobal(false);
                setShowBulkDeleteModal(false);
                toast.success('Data pengabdian berhasil dihapus.');
            },
            onError: () => {
                setShowBulkDeleteModal(false);
                toast.error('Gagal menghapus data.');
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
            type,
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
            type,
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
            type,
            perPage: next,
            filters: columnFilters,
            sort: filters.sort,
            direction: filters.direction
        }, {
            only: ['pengabdian'],
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTypeChange = (newType) => {
        router.get(route('admin.pengabdian.index'), {
            type: newType,
            search
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

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
                batch_type: found?.batch_type || type,
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

        if (type === 'kosabangsa') {
            dummyData = [{
                "batch_type": "kosabangsa",
                "nama": "HARIS",
                "nidn": "1208038902",
                "kd_perguruan_tinggi": "1036",
                "nama_institusi": "Universitas Negeri Makassar",
                "wilayah_lldikti": "9",
                "ptn_pts": "PTN",
                "prov_pt": "Sulawesi Selatan",
                "kab_pt": "Kota Makassar",
                "judul": "Pemberdayaan Masyarakat Desa Melalui Inovasi Teknologi Pertanian di Kabupaten Pinrang",
                "thn_pelaksanaan_kegiatan": 2025,
                "bidang_fokus": "Pertanian dan Pangan",
                "prov_mitra": "Sulawesi Selatan",
                "kab_mitra": "Kab. Pinrang",
                "pt_latitude": -5.168843,
                "pt_longitude": 119.4360638,
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
            dummyData = [{
                "batch_type": "multitahun",
                "nama": "HARIS",
                "nidn": "1208038902",
                "kd_perguruan_tinggi": "1036",
                "nama_institusi": "Universitas Negeri Makassar",
                "wilayah_lldikti": "9",
                "ptn_pts": "PTN",
                "prov_pt": "Sulawesi Selatan",
                "kab_pt": "Kota Makassar",
                "klaster": "Kelompok PT Mandiri",
                "judul": "Peningkatan Softskill Literasi Digital dan Budidaya Toga masyarakat Desa Mallongi-longi Melalui PMM di Kabupaten Pinrang",
                "nama_skema": "Pemberdayaan Masyarakat oleh Mahasiswa",
                "nama_singkat_skema": "PMM",
                "thn_pelaksanaan_kegiatan": 2025,
                "urutan_thn_kegitan": "Tahun ke-1",
                "bidang_fokus": "Sosial Humaniora",
                "prov_mitra": "Sulawesi Selatan",
                "kab_mitra": "Kab. Pinrang",
                "pt_latitude": -5.168843,
                "pt_longitude": 119.4360638,
            }];
            fileName = "Template_Import_Batch.xlsx";
        }

        const ws = XLSX.utils.json_to_sheet(dummyData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_Pengabdian");
        XLSX.writeFile(wb, fileName);
    };

    const handleExport = () => {
        const params = new URLSearchParams({ type });
        if (search) params.set('search', search);
        Object.entries(columnFilters).forEach(([k, v]) => v && params.append(`filters[${k}]`, v));

        if (isAllSelectedGlobal) {
            params.append('ids', 'all');
        } else if (selectedIds.length > 0) {
            params.append('ids', selectedIds.join(','));
        }

        window.location.href = `/admin/pengabdian/export-csv?${params.toString()}`;
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
        type,
        handleBulkDelete, confirmBulkDelete,
        handleDelete, confirmDelete,
        handleColumnFilterChange, handleSearch,
        handlePerPageChange, handleTypeChange,
        setItemField, openBulkUpdateModal,
        confirmBulkUpdate, handleImport,
        handleDownloadTemplate, handleExport
    };
}
