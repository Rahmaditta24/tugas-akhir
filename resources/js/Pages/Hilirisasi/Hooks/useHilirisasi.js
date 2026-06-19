import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { exportToExcel } from '@/Utils/exportExcel';

export default function useHilirisasi({ mapData, researches, stats, filters: initialFilters, filterOptions: serverFilterOptions }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(initialFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [currentStats, setCurrentStats] = useState(stats);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMapData, setCurrentMapData] = useState(mapData);
    const [currentResearches, setCurrentResearches] = useState(researches);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCurrentMapData(mapData);
        setCurrentResearches(researches);
        setCurrentStats(stats);
        setFilters(initialFilters);
        setSearchTerm(initialFilters.search || '');
    }, [mapData, researches, stats, initialFilters]);

    const filterOptions = {
        direktorat: serverFilterOptions.direktorat || ['Direktorat A', 'Direktorat B'],
        skema: serverFilterOptions.skema || ['Skema A', 'Skema B'],
        provinsi: serverFilterOptions.provinsi || [],
        tahun: (serverFilterOptions.tahun || ['2020', '2021', '2022', '2023', '2024']).map(String),
    };

    const filterFields = [
        { label: 'Direktorat', requestKey: 'direktorat', optionKey: 'direktorat' },
        { label: 'Skema', requestKey: 'skema', optionKey: 'skema' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('hilirisasi.index'), { ...filters, search: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered'],
            showProgress: false,
        });
    };

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        if (queries.every(q => !q.term)) delete params.queries;

        router.get(route('hilirisasi.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered']
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('hilirisasi.index'), { ...newFilters, search: searchTerm }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered'],
            showProgress: false,
        });
    };

    const handleStatsChange = (newStats) => {
        if (!newStats) {
            setCurrentStats(stats);
        } else {
            setCurrentStats(newStats);
        }
    };

    const handleReset = () => {
        setFilters({});
        setSearchTerm('');
        router.get(route('hilirisasi.index'));
    };

    const toTitleCase = (str) => {
        if (!str || str === '-') return str;
        return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    };

    const handleItemClick = async (research) => {
        if (!research?.id) {
            setSelectedResearch({
                ...research,
                isHilirisasi: true,
                currentDataType: 'hilirisasi',
                judul: research.judul || '-',
                nama_peneliti: research.nama_pengusul || research.nama || '-',
                institusi: research.perguruan_tinggi || research.institusi || '-',
                provinsi: toTitleCase(research.provinsi) || '-',
                skema_hilirisasi: research.skema || '-',
                tahun_hilirisasi: research.tahun || '-',
            });
            setIsModalOpen(true);
            return;
        }

        try {
            const response = await fetch(`/api/research/hilirisasi/${research.id}`);
            if (response.ok) {
                const detail = await response.json();
                setSelectedResearch({
                    ...detail,
                    isHilirisasi: true,
                    currentDataType: 'hilirisasi',
                    judul: detail.judul || '-',
                    nama_peneliti: detail.nama_pengusul || detail.nama || '-',
                    institusi: detail.perguruan_tinggi || detail.institusi || '-',
                    provinsi: toTitleCase(detail.provinsi) || '-',
                    skema_hilirisasi: detail.skema || '-',
                    tahun_hilirisasi: detail.tahun || '-',
                });
            } else {
                setSelectedResearch({ ...research, isHilirisasi: true, currentDataType: 'hilirisasi' });
            }
        } catch {
            setSelectedResearch({ ...research, isHilirisasi: true, currentDataType: 'hilirisasi' });
        }
        setIsModalOpen(true);
    };

    const handleDownload = async () => {
        setIsLoading(true);
        const loadingToast = toast.loading('Sedang menyiapkan data Excel, mohon tunggu...', {
            position: 'top-right'
        });

        const queryString = new URLSearchParams(window.location.search).toString();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filterInfo = Object.keys(filters).length > 0 ? '_filtered' : '';

        await exportToExcel({
            apiUrl: `/api/hilirisasi/export?${queryString}`,
            mapRow: (item) => ({
                'Tahun': item.tahun || '-',
                'ID Proposal': item.id_proposal || '-',
                'Judul': item.judul || '-',
                'Nama Pengusul': item.nama_pengusul || '-',
                'Direktorat': item.direktorat || '-',
                'Perguruan Tinggi': item.perguruan_tinggi || '-',
                'Provinsi': item.provinsi || '-',
                'Mitra': item.mitra || '-',
                'Skema': item.skema || '-',
                'Luaran': item.luaran || '-',
            }),
            sheetName: 'Hilirisasi',
            fileName: `data-hilirisasi${filterInfo}_${timestamp}.xlsx`,
            colWidths: [
                { wch: 8 }, { wch: 12 }, { wch: 60 }, { wch: 30 }, { wch: 25 },
                { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 30 },
            ],
            onSuccess: (count) => {
                toast.success(`Berhasil export ${count} data hilirisasi!`, {
                    duration: 4000, position: 'top-right',
                    style: { background: '#16a34a', color: '#fff', fontWeight: '500' },
                });
            },
            onEmpty: () => toast.error('Tidak ada data untuk diexport.'),
            onError: () => toast.error('Gagal mengexport data. Silakan coba lagi.', { duration: 4000, position: 'top-right' }),
            onFinally: () => {
                toast.dismiss(loadingToast);
                setIsLoading(false);
            },
        });
    };

    return {
        displayMode, setDisplayMode,
        filters, searchTerm,
        currentStats, currentMapData, currentResearches, setCurrentResearches,
        selectedResearch, isModalOpen, setIsModalOpen,
        isLoading, filterOptions, filterFields,
        handleSearch, handleAdvancedSearch, handleFilterChange,
        handleStatsChange, handleReset, handleItemClick, handleDownload
    };
}
