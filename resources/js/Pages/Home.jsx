import React, { useState, useEffect, Suspense, lazy } from 'react';
import { router } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import MainLayout from '../Layouts/MainLayout';
import NavigationTabs from '../Components/NavigationTabs';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';

// Lazy-loaded components for better performance
const MapContainer = lazy(() => import('../Components/MapContainer'));
const ResearchList = lazy(() => import('../Components/ResearchList'));
const ResearchModal = lazy(() => import('../Components/ResearchModal'));

// Loading fallbacks
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

    // Update currentStats when global stats from props change
    useEffect(() => {
        setCurrentStats(stats);
    }, [stats]);

    // Sync state with props when they change (e.g. navigation)
    useEffect(() => {
        setFilters(initialFilters);
        setSearchTerm(initialFilters.search || '');
    }, [initialFilters]);

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
            only: ['mapData', 'researches', 'stats'] // CRITICAL for SPA feel: only update data, not full page
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        const params = { ...newFilters, search: searchTerm };
        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) delete params[key];
        });

        router.get(route('penelitian.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true, 
            only: ['mapData', 'researches', 'stats'], // Only fetch data, not layout
        });
    };

    const handleReset = () => {
        setFilters({});
        setSearchTerm('');
        router.get(route('penelitian.index'));
    };

    const handleDownload = async () => {
        // Show loading state
        setIsLoading(true);
        const loadingToast = toast.loading('Sedang menyiapkan data Excel, mohon tunggu...', {
            position: 'top-right'
        });

        try {
            console.log('Starting export with filters:', filters);
            // Get all current active search and filter parameters from URL
            const queryString = new URLSearchParams(window.location.search).toString();

            const response = await fetch(`/api/penelitian/export?${queryString}`);


            if (!response.ok) {
                const errorText = await response.text();
                console.error('Export error:', errorText);
                throw new Error('Failed to fetch data');
            }

            const allData = await response.json();

            if (!allData || allData.length === 0) {
                toast.error('Tidak ada data untuk diexport.');
                setIsLoading(false);
                return;
            }

            // Prepare data for Excel export
            const exportData = allData.map(research => ({
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
            }));

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Penelitian');

            // Auto-size columns
            const cols = [
                { wch: 30 }, // Peneliti
                { wch: 60 }, // Judul
                { wch: 40 }, // Institusi
                { wch: 12 }, // Kategori PT
                { wch: 15 }, // Jenis PT
                { wch: 20 }, // Provinsi
                { wch: 30 }, // Skema
                { wch: 10 }, // Tahun
                { wch: 25 }, // Bidang Fokus
                { wch: 30 }, // Tema Prioritas
            ];
            ws['!cols'] = cols;

            // Generate filename with timestamp and filter info
            const timestamp = new Date().toISOString().slice(0, 10);
            const filterInfo = Object.keys(filters).length > 0 ? '_filtered' : '';
            const filename = `data-penelitian${filterInfo}_${timestamp}.xlsx`;

            // Download file
            XLSX.writeFile(wb, filename);

            // Show success
            toast.success(`Berhasil export ${exportData.length} data penelitian!`, {
                duration: 4000,
                position: 'top-right',
                style: {
                    background: '#16a34a',
                    color: '#fff',
                    fontWeight: '500',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#16a34a',
                },
            });
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error('Gagal mengexport data. Silakan coba lagi.', {
                duration: 4000,
                position: 'top-right',
            });
        } finally {
            toast.dismiss(loadingToast);
            setIsLoading(false);
        }
    };

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        // Remove empty queries to keep URL clean
        if (queries.every(q => !q.term)) {
            delete params.queries;
        }

        router.get(route('penelitian.index'), params, {
            preserveState: true,
            preserveScroll: true,
            only: ['researches', 'stats'],
            replace: true,
        });
    };

    const handleStatsChange = (newStats) => {
        if (!newStats) {
            setCurrentStats(stats); // Reset to global stats
        } else {
            setCurrentStats(newStats);
        }
    };

    const handleItemClick = async (research) => {
        if (!research?.id) {
            // If no ID, show what we have directly
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
                // Fallback to list data
                setSelectedResearch({ ...research, isInstitusi: false });
            }
        } catch {
            setSelectedResearch({ ...research, isInstitusi: false });
        }
        setIsModalOpen(true);
    };

    const [filteredResearchesForMap, setFilteredResearchesForMap] = useState(researches);

    // Sync filtered results when researches prop changes from server
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
                        mapData={mapData}
                        data={filteredResearchesForMap}
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
                                researches={researches}
                                onAdvancedSearch={handleAdvancedSearch}
                                onFilteredResults={setFilteredResearchesForMap}
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
