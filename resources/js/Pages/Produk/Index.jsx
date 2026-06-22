import React, { Suspense, lazy } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { Toaster } from 'react-hot-toast';
import NavigationTabs from '../../Components/NavigationTabs';
import MapControls from '../../Components/MapControls';
import ResearchList from '../../Components/ResearchList';
import StatisticsCards from '../../Components/StatisticsCards';
import useProduk from './Hooks/useProduk';

const MapContainer = lazy(() => import('../../Components/MapContainer'));
const ResearchModal = lazy(() => import('../../Components/ResearchModal'));

const MapLoading = () => (
    <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
        <div className="text-gray-400 font-medium">Memuat peta...</div>
    </div>
);

export default function Index({ mapData = [], researches = [], stats = {}, title, isFiltered = false, filters: initialFilters = {}, filterOptions: serverFilterOptions = {} }) {
    const {
        displayMode, setDisplayMode,
        filters, searchTerm,
        currentStats, currentMapData, currentResearches, setCurrentResearches,
        selectedResearch, isModalOpen, setIsModalOpen,
        isLoading, filterOptions, filterFields,
        handleSearch, handleAdvancedSearch, handleFilterChange,
        handleStatsChange, handleReset, handleItemClick, handleDownload
    } = useProduk({ mapData, researches, stats, filters: initialFilters, filterOptions: serverFilterOptions });

    return (
        <MainLayout title={title || "Peta Persebaran Penelitian BIMA Indonesia - Produk"}>
            <Toaster />
            <NavigationTabs activePage="produk" />

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
                    filterFields={filterFields}
                    searchTerm={searchTerm}
                    gridClass="grid-cols-1 md:grid-cols-2"
                    widthClass="w-[95%] lg:w-1/2"
                />
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={currentStats} labels={{ totalResearch: 'Total Produk' }} />
                        <ResearchList
                            researches={currentResearches}
                            onAdvancedSearch={handleAdvancedSearch}
                            onFilteredResults={setCurrentResearches}
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
