import React, { Suspense, lazy } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import { Toaster } from 'react-hot-toast';
import NavigationTabs from '../../Components/NavigationTabs';
import MapControls from '../../Components/MapControls';
import ResearchList from '../../Components/ResearchList';
import StatisticsCards from '../../Components/StatisticsCards';
import useHilirisasi from './Hooks/useHilirisasi';

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
    } = useHilirisasi({ mapData, researches, stats, filters: initialFilters, filterOptions: serverFilterOptions });

    return (
        <MainLayout title={title || "Peta Persebaran Penelitian BIMA Indonesia - Hilirisasi"}>
            <Toaster />
            <NavigationTabs activePage="hilirisasi" />

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
                />
            </div>
            <div className="w-full lg:max-w-[90%] mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={{ ...currentStats, totalFields: 0 }} />
                        <ResearchList
                            researches={currentResearches}
                            onAdvancedSearch={handleAdvancedSearch}
                            onFilteredResults={setCurrentResearches}
                            onItemClick={handleItemClick}
                            title="Daftar Hilirisasi"
                            isFiltered={isFiltered}
                            isHilirisasiPage={true}
                            customFieldOptions={[
                                { value: 'all', label: 'Semua' },
                                { value: 'title', label: 'Judul Hilirisasi' },
                                { value: 'university', label: 'Universitas' },
                                { value: 'researcher', label: 'Peneliti' },
                                { value: 'directorate', label: 'Direktorat' },
                                { value: 'skema', label: 'Skema' },
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
