import React, { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import MainLayout from '../../Layouts/MainLayout';
import NavigationTabs from '../../Components/NavigationTabs';
import MapControls from '../../Components/MapControls';
import StatisticsCards from '../../Components/StatisticsCards';

import usePenelitian from './Hooks/usePenelitian';
import { MapLoading, ListLoading } from './Components/Loaders';

// Komponen lazy-loaded 
const MapContainer = lazy(() => import('../../Components/MapContainer'));
const ResearchList = lazy(() => import('../../Components/ResearchList'));
const ResearchModal = lazy(() => import('../../Components/ResearchModal'));

export default function Home(props) {
    const {
        displayMode, setDisplayMode,
        filters,
        searchTerm,
        isLoading,
        currentStats,
        selectedResearch,
        isModalOpen, setIsModalOpen,
        currentMapData,
        currentResearches, setCurrentResearches,
        handleFilteredResults,

        handleSearch,
        handleFilterChange,
        handleReset,
        handleDownload,
        handleAdvancedSearch,
        handleStatsChange,
        handleItemClick
    } = usePenelitian(props);

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
                    filterOptions={props.filterOptions}
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
                                onFilteredResults={handleFilteredResults}
                                isFiltered={props.isFiltered}
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
