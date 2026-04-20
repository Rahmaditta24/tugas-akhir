import React, { useState, useEffect, Suspense, lazy } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import NavigationTabs from '../Components/NavigationTabs';
import MapControls from '../Components/MapControls';
import ResearchList from '../Components/ResearchList';
import StatisticsCards from '../Components/StatisticsCards';

// Lazy-loaded components
const MapContainer = lazy(() => import('../Components/MapContainer'));
const ResearchModal = lazy(() => import('../Components/ResearchModal'));

// Loading fallback
const MapLoading = () => (
    <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
        <div className="text-gray-400 font-medium">Memuat peta...</div>
    </div>
);

export default function Produk({ mapData = [], researches = [], stats = {}, title, isFiltered = false, filters: initialFilters = {}, filterOptions: serverFilterOptions = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(initialFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [currentStats, setCurrentStats] = useState(stats);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Update currentStats when global stats from props change
    useEffect(() => {
        setCurrentStats(stats);
    }, [stats]);

    // Sync state with props when they change
    useEffect(() => {
        setFilters(initialFilters);
        setSearchTerm(initialFilters.search || '');
    }, [initialFilters]);

    // Filter options from server (provinces come from backend via DB/API)
    const filterOptions = {
        bidang: serverFilterOptions.bidang || ['Pangan', 'Energi', 'Kesehatan', 'Transportasi', 'Teknologi Informasi'],
        tkt: serverFilterOptions.tkt || ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        provinsi: serverFilterOptions.provinsi || [],
        tahun: ['2020', '2021', '2022', '2023', '2024'], // Keep year hardcoded as it's not in DB
    };

    const filterFields = [
        { label: 'Bidang', requestKey: 'bidang', optionKey: 'bidang' },
        { label: 'Tingkat Kesiapterapan Teknologi', requestKey: 'tkt', optionKey: 'tkt' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('produk.index'), { ...filters, search: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats']
        });
    };

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        if (queries.every(q => !q.term)) delete params.queries;

        router.get(route('produk.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats']
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('produk.index'), { ...newFilters, search: searchTerm }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats']
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
        router.get(route('produk.index'));
    };

    const handleItemClick = async (research) => {
        if (!research?.id) {
            setSelectedResearch({
                ...research,
                isProduk: true,
                currentDataType: 'produk',
                tkt: research.tkt ?? '-',
                nama_inventor: research.nama_inventor || research.nama || research.researcher || '-',
                judul: research.judul || research.nama_produk || '-',
                institusi: research.institusi || research.perguruan_tinggi || '-',
                provinsi: research.provinsi || '-',
                bidang_fokus: research.bidang_fokus || research.bidang || '-',
                deskripsi_produk: research.deskripsi_produk || research.deskripsi || '-'
            });
            setIsModalOpen(true);
            return;
        }

        try {
            const response = await fetch(`/api/research/produk/${research.id}`);
            if (response.ok) {
                const detail = await response.json();
                setSelectedResearch({
                    ...detail,
                    isProduk: true,
                    currentDataType: 'produk',
                    deskripsi_produk: detail.deskripsi_produk || detail.deskripsi || research.deskripsi_produk || '-',
                    tkt: detail.tkt ?? research.tkt ?? '-',
                    nama_inventor: detail.nama_inventor || detail.nama || research.nama_inventor || '-',
                    judul: detail.judul || detail.nama_produk || research.judul || '-',
                    institusi: detail.institusi || detail.perguruan_tinggi || research.institusi || '-',
                    provinsi: detail.provinsi || research.provinsi || '-',
                    bidang_fokus: detail.bidang_fokus || detail.bidang || research.bidang_fokus || '-'
                });
            } else {
                setSelectedResearch({ 
                    ...research, 
                    isProduk: true, 
                    currentDataType: 'produk',
                    deskripsi_produk: research.deskripsi_produk || research.deskripsi || '-' 
                });
            }
        } catch {
            setSelectedResearch({ 
                ...research, 
                isProduk: true, 
                currentDataType: 'produk',
                deskripsi_produk: research.deskripsi_produk || research.deskripsi || '-' 
            });
        }
        setIsModalOpen(true);
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        const loadingToast = toast.loading('Sedang menyiapkan data Excel, mohon tunggu...', {
            position: 'top-right'
        });
        try {
            const queryString = new URLSearchParams(window.location.search).toString();

            const response = await fetch(`/api/produk/export?${queryString}`);
            if (!response.ok) throw new Error('Gagal mengambil data');

            const allData = await response.json();
            if (!allData || allData.length === 0) {
                toast.error('Tidak ada data untuk diexport.');
                setIsLoading(false);
                return;
            }

            const exportData = allData.map(item => ({
                'ID': item.id,
                'Nama Produk': item.nama_produk || '-',
                'Institusi': item.institusi || '-',
                'Bidang': item.bidang || '-',
                'TKT': item.tkt || '-',
                'Provinsi': item.provinsi || '-',
                'Nama Inventor': item.nama_inventor || '-',
                'Email Inventor': item.email_inventor || '-',
                'Nomor Paten': item.nomor_paten ? item.nomor_paten.split(/[;.\(\,\s ]/)[0].trim() : '-',
                'Latitude': item.latitude,
                'Longitude': item.longitude,
                'Deskripsi': item.deskripsi_produk || '-',
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Produk');
            
            // Set standard column widths
            ws['!cols'] = [
                { wch: 8 }, { wch: 40 }, { wch: 40 }, { wch: 20 },
                { wch: 8 }, { wch: 20 }, { wch: 30 }, { wch: 30 }, 
                { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 60 }
            ];

            const timestamp = new Date().toISOString().slice(0, 10);
            const filterInfo = Object.keys(filters).length > 0 ? '_filtered' : '';
            XLSX.writeFile(wb, `data-produk${filterInfo}_${timestamp}.xlsx`);

            toast.dismiss(loadingToast);
            toast.success(`Berhasil export ${exportData.length} data produk!`, {
                duration: 4000, position: 'top-right',
                style: { background: '#16a34a', color: '#fff', fontWeight: '500' },
            });
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.dismiss(loadingToast);
            toast.error('Gagal mengexport data. Silakan coba lagi.', { duration: 4000, position: 'top-right' });
        } finally {
            setIsLoading(false);
        }
    };

    const [filteredResearchesForMap, setFilteredResearchesForMap] = useState(researches);

    useEffect(() => {
        setFilteredResearchesForMap(researches);
    }, [researches]);

    return (
        <MainLayout title={title || "Peta Persebaran Penelitian BIMA Indonesia - Produk"}>
            <Toaster />
            <NavigationTabs activePage="produk" />

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
                    filterFields={filterFields}
                    searchTerm={searchTerm}
                    gridClass="grid-cols-1 md:grid-cols-2"
                    widthClass="w-[95%] lg:w-1/2"
                />
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={currentStats} />
                        <ResearchList
                            researches={researches}
                            onAdvancedSearch={handleAdvancedSearch}
                            onFilteredResults={setFilteredResearchesForMap}
                            onItemClick={handleItemClick}
                            title="Daftar Produk"
                            isFiltered={isFiltered}
                            isProdukPage={true}
                            customFieldOptions={[
                                { value: 'all', label: 'Semua' },
                                { value: 'title', label: 'Judul Produk' },
                                { value: 'university', label: 'Universitas' },
                                { value: 'researcher', label: 'Inventor' },
                                { value: 'bidang', label: 'Bidang' },
                            ]}
                        />
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


