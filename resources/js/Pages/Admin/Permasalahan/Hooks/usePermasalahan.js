import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function usePermasalahan(filters, stats) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.perPage || 20);
    const [baseData, setBaseData] = useState(filters.baseData || 'statistik');
    const [jenis, setJenis] = useState(filters.jenis || 'Sampah');
    const [batchType, setBatchType] = useState(filters.batch_type || (filters.baseData === 'pengabdian' ? 'Multitahun Lanjutan, Batch I & Batch II' : ''));
    const [listrikMode, setListrikMode] = useState(filters.listrikMode || 'SAIDI');
    const [activeTab, setActiveTab] = useState(filters.tab || 'provinsi');
    const [columnFilters, setColumnFilters] = useState(filters.columns || {});
    const [localColumnFilters, setLocalColumnFilters] = useState(filters.columns || {});
    const [localStats, setLocalStats] = useState(stats || {});
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';

    // Debounce Filter Kolom 
    useEffect(() => {
        const handler = setTimeout(() => {
            const hasChanged = JSON.stringify(localColumnFilters) !== JSON.stringify(columnFilters);

            if (hasChanged) {
                setColumnFilters(localColumnFilters);
                router.get(route('admin.permasalahan.index'), {
                    search, perPage, baseData, jenis, batch_type: batchType, sort, direction, tab: activeTab,
                    columns: localColumnFilters, listrikMode
                }, { preserveState: true, preserveScroll: true, replace: true });
            }
        }, 600);
        return () => clearTimeout(handler);
    }, [localColumnFilters]);

    useEffect(() => {
        setLocalStats(stats);
        setIsStatsLoading(false);
    }, [stats]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.permasalahan.index'), {
            search, perPage, baseData, jenis, batch_type: batchType, sort, direction, tab: activeTab, columns: columnFilters
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleColumnFilterChange = (key, value) => {
        setLocalColumnFilters(prev => ({ ...prev, [key]: value }));
    };

    const handlePerPageChange = (e) => {
        const next = Number(e.target.value);
        setPerPage(next);
        router.get(route('admin.permasalahan.index'), {
            search, perPage: next, baseData, jenis, batch_type: batchType, sort, direction, tab: activeTab
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleBaseDataChange = (e) => {
        const val = e.target.value;
        setBaseData(val);
        const nextJenis = val === 'statistik' ? 'Sampah' : jenis;
        const nextBatch = val === 'pengabdian' ? 'Multitahun Lanjutan, Batch I & Batch II' : '';
        if (val === 'statistik') setJenis('Sampah');
        if (val === 'pengabdian') setBatchType(nextBatch);
        router.get(route('admin.permasalahan.index'), {
            search, perPage, baseData: val, jenis: nextJenis,
            sort: val === 'statistik' ? 'id' : (val === 'penelitian' ? 'thn_pelaksanaan' : (val === 'pengabdian' ? 'thn_pelaksanaan_kegiatan' : 'tahun')),
            direction: 'desc', tab: activeTab, batch_type: nextBatch, columns: {}
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleJenisChange = (e) => {
        const val = e.target.value;
        setJenis(val);
        router.get(route('admin.permasalahan.index'), {
            search, perPage, baseData, jenis: val, batch_type: batchType, sort, direction, tab: activeTab
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        router.get(route('admin.permasalahan.index'), {
            search, perPage, baseData, jenis, batch_type: batchType, listrikMode, sort, direction, tab
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleListrikModeChange = (mode) => {
        setListrikMode(mode);
        router.get(route('admin.permasalahan.index'), {
            search, perPage, baseData, jenis, batch_type: batchType, listrikMode: mode, sort, direction, tab: activeTab
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleExportCSV = () => {
        const params = new URLSearchParams({ baseData, jenis, search, batch_type: batchType });
        if (Object.keys(columnFilters).length > 0) {
            Object.entries(columnFilters).forEach(([k, v]) => {
                if (v) params.append(`columns[${k}]`, v);
            });
        }
        window.location.href = route('admin.permasalahan.export-csv') + '?' + params.toString();
    };

    const handleDelete = (id, type) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        router.delete(route('admin.permasalahan.destroy', id), {
            data: { type },
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setBatchType('');
        router.get(route('admin.permasalahan.index', { baseData, jenis }));
    };

    return {
        search, setSearch,
        perPage, setPerPage,
        baseData, setBaseData,
        jenis, setJenis,
        batchType, setBatchType,
        listrikMode, setListrikMode,
        activeTab, setActiveTab,
        columnFilters, localColumnFilters,
        localStats, isStatsLoading,
        selectedItem, setSelectedItem,
        isModalOpen, setIsModalOpen,
        sort, direction,
        handleSearch, handleColumnFilterChange, handlePerPageChange,
        handleBaseDataChange, handleJenisChange, handleTabChange,
        handleListrikModeChange, handleExportCSV, handleDelete,
        resetFilters
    };
}
