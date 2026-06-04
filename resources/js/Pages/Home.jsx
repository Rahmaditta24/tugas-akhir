import { useState, useEffect, Suspense, lazy } from 'react';
import { router } from '@inertiajs/react';

import toast, { Toaster } from 'react-hot-toast';
import { exportToExcel } from '../Utils/exportExcel';
import MainLayout from '../Layouts/MainLayout';
import NavigationTabs from '../Components/NavigationTabs';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';

// Komponen lazy-loaded 
const MapContainer = lazy(() => import('../Components/MapContainer'));
const ResearchList = lazy(() => import('../Components/ResearchList'));
const ResearchModal = lazy(() => import('../Components/ResearchModal'));

// Tampilan loading fallback
const MapLoading = () => (
    <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
        <div className="text-gray-400 font-medium">Memuat peta...</div>
    </div>
);

const ListLoading = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
        ))}
    </div>
);

export default function Home({ mapData = [], researches = [], stats = {}, filterOptions = {}, filters: initialFilters = {}, isFiltered = false }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(initialFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStats, setCurrentStats] = useState(stats);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currentMapData, setCurrentMapData] = useState(mapData);
    const [currentResearches, setCurrentResearches] = useState(researches);

    // Sinkronisasi state saat props berubah dari navigasi atau filter eksplisit
    useEffect(() => {
        setCurrentMapData(mapData);
        setCurrentResearches(researches);
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
        // Hapus filter yang kosong
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
        // Hapus query kosong agar URL tetap bersih
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
            setCurrentStats(stats); // Kembalikan ke stats global
        } else {
            setCurrentStats(newStats);
        }
    };

    const handleItemClick = async (research) => {
        if (!research?.id) {
            // Jika tidak ada ID, tampilkan data yang ada secara langsung
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
                // Fallback ke data list
                setSelectedResearch({ ...research, isInstitusi: false });
            }
        } catch {
            setSelectedResearch({ ...research, isInstitusi: false });
        }
        setIsModalOpen(true);
    };

    const [filteredResearchesForMap, setFilteredResearchesForMap] = useState(researches);

    // Sinkronisasi hasil filter saat prop researches berubah dari server
    useEffect(() => {
        setFilteredResearchesForMap(researches);
    }, [researches]);

    return (
        <MainLayout title="Peta Persebaran Penelitian BIMA Indonesia - Penelitian">
            <Toaster />

            <NavigationTabs activePage="penelitian" />

            <div className="relative">
                <Suspense fallback={<MapLoading />}>
                    <MapContainer
                        mapData={currentMapData}
                        data={currentResearches}
                        displayMode={displayMode}
                        onStatsChange={handleStatsChange}
                        filters={filters}
                    />
                </Suspense>

                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    isLoading={isLoading}
                    displayMode={displayMode}
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    searchTerm={searchTerm}
                    gridClass="grid-cols-1 md:grid-cols-3"
                    widthClass="w-[95%] lg:w-[60%]"
                />
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={currentStats} />
                        <Suspense fallback={<ListLoading />}>
                            <ResearchList
                                researches={currentResearches}
                                onAdvancedSearch={handleAdvancedSearch}
                                onFilteredResults={setCurrentResearches}
                                isFiltered={isFiltered}
                                isPenelitianPage={true}
                                onItemClick={handleItemClick}
                            />
                        </Suspense>
                    </div>
                </section>
            </div>

            <Suspense fallback={null}>
                <ResearchModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={selectedResearch}
                />
            </Suspense>
        </MainLayout>
    );
}
