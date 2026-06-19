import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { exportToExcel } from '../../../Utils/exportExcel';

export default function usePenelitian({ mapData = [], researches = [], stats = {}, filterOptions = {}, filters: initialFilters = {}, isFiltered = false }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(initialFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStats, setCurrentStats] = useState(stats);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currentMapData, setCurrentMapData] = useState(mapData);
    const [currentResearches, setCurrentResearches] = useState(researches);
    const [filteredResearchesForMap, setFilteredResearchesForMap] = useState(researches);

    useEffect(() => {
        setCurrentMapData(mapData);
        setCurrentResearches(researches);
        setFilteredResearchesForMap(researches);
        setCurrentStats(stats);
        setFilters(initialFilters);
        setSearchTerm(initialFilters.search || '');
    }, [mapData, researches, stats, initialFilters]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        const params = { ...filters, search: term };
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) delete params[key];
        });

        router.get(route('penelitian.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true, 
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered'],
            showProgress: false,
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        const params = { ...newFilters, search: searchTerm };
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) delete params[key];
        });

        router.get(route('penelitian.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true, 
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered'],
            showProgress: false,
        });
    };

    const handleReset = () => {
        setFilters({});
        setSearchTerm('');
        router.get(route('penelitian.index'));
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
            apiUrl: `/api/penelitian/export?${queryString}`,
            mapRow: (research) => ({
                'Peneliti': research.nama || '-',
                'Judul': research.judul || '-',
                'Institusi': research.institusi || '-',
                'Kategori PT': research.kategori_pt || '-',
                'Jenis PT': research.jenis_pt || '-',
                'Provinsi': research.provinsi || '-',
                'Skema': research.skema || '-',
                'Tahun': research.thn_pelaksanaan || '-',
                'Bidang Fokus': research.bidang_fokus || '-',
                'Tema Prioritas': research.tema_prioritas || '-',
            }),
            sheetName: 'Penelitian',
            fileName: `data-penelitian${filterInfo}_${timestamp}.xlsx`,
            colWidths: [
                { wch: 30 }, { wch: 60 }, { wch: 40 }, { wch: 12 }, { wch: 15 },
                { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 25 }, { wch: 30 },
            ],
            onSuccess: (count) => {
                toast.success(`Berhasil export ${count} data penelitian!`, {
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

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        if (queries.every(q => !q.term)) {
            delete params.queries;
        }

        router.get(route('penelitian.index'), params, {
            preserveState: true,
            preserveScroll: true,
            only: ['researches', 'stats', 'filters', 'isFiltered'],
            replace: true,
        });
    };

    const handleStatsChange = (newStats) => {
        if (!newStats) {
            setCurrentStats(stats);
        } else {
            setCurrentStats(newStats);
        }
    };

    const handleItemClick = async (research) => {
        if (!research?.id) {
            setSelectedResearch({
                ...research,
                judul: research.judul || '-',
                nama: research.nama || '-',
                institusi: research.institusi || '-',
                provinsi: research.provinsi || '-',
                skema: research.skema || '-',
                tahun: research.thn_pelaksanaan || '-',
                bidang_fokus: research.bidang_fokus || '-',
                tema_prioritas: research.tema_prioritas || '-',
                isInstitusi: false,
            });
            setIsModalOpen(true);
            return;
        }

        try {
            const response = await fetch(`/api/research/penelitian/${research.id}`);
            if (response.ok) {
                const detail = await response.json();
                setSelectedResearch({
                    ...detail,
                    judul: detail.judul || '-',
                    nama: detail.nama || '-',
                    institusi: detail.institusi || detail.nama_institusi || '-',
                    provinsi: detail.provinsi || detail.prov_pt || '-',
                    skema: detail.skema || detail.nama_skema || '-',
                    tahun: detail.tahun || detail.thn_pelaksanaan || '-',
                    bidang_fokus: detail.bidang_fokus || detail.bidang || '-',
                    tema_prioritas: detail.tema_prioritas || '-',
                    jenis_pt: detail.jenis_pt || '-',
                    kategori_pt: detail.kategori_pt || '-',
                    klaster: detail.klaster || '-',
                    kota: detail.kota || '-',
                    isInstitusi: false,
                });
            } else {
                setSelectedResearch({ ...research, isInstitusi: false });
            }
        } catch {
            setSelectedResearch({ ...research, isInstitusi: false });
        }
        setIsModalOpen(true);
    };

    return {
        displayMode, setDisplayMode,
        filters,
        searchTerm,
        isLoading,
        currentStats,
        selectedResearch,
        isModalOpen, setIsModalOpen,
        currentMapData,
        currentResearches, setCurrentResearches,
        
        handleSearch,
        handleFilterChange,
        handleReset,
        handleDownload,
        handleAdvancedSearch,
        handleStatsChange,
        handleItemClick
    };
}
