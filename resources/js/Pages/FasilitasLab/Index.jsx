import React, { Suspense, lazy } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import NavigationTabs from '../../Components/NavigationTabs';
import MapControls from '../../Components/MapControls';
import ResearchList from '../../Components/ResearchList';
import StatisticsCards from '../../Components/StatisticsCards';
import useFasilitasLab from './Hooks/useFasilitasLab';

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
        currentStats, currentMapData, currentResearches,
        selectedLab, setSelectedLab,
        filterOptions, filterFields,
        handleSearch, handleAdvancedSearch, handleFilterChange,
        handleReset, handleDownload, handleCampusClick
    } = useFasilitasLab({ mapData, researches, stats, filters: initialFilters, filterOptions: serverFilterOptions });

    return (
        <MainLayout title={title || "Peta Persebaran Penelitian BIMA Indonesia - Fasilitas Lab"}>
            <NavigationTabs activePage="fasilitas-lab" />

            <div className="relative">
                <Suspense fallback={<MapLoading />}>
                    <MapContainer
                        mapData={currentMapData}
                        displayMode={displayMode}
                        onCampusClick={handleCampusClick}
                        filters={filters}
                    />
                </Suspense>
                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    displayMode={displayMode}
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    filterFields={filterFields}
                    searchTerm={searchTerm}
                    hideDisplayMode={true}
                    hideDownload={true}
                    gridClass="grid-cols-1 md:grid-cols-2"
                    widthClass="w-[95%] lg:w-1/2"
                />
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards
                            stats={currentStats}
                            labels={{
                                totalResearch: 'Total Laboratorium',
                                totalUniversities: 'Total Institusi',
                                totalProvinces: 'Total Provinsi',
                            }}
                        />

                        <ResearchList
                            researches={currentResearches}
                            onAdvancedSearch={handleAdvancedSearch}
                            onItemClick={setSelectedLab}
                            title="Daftar Fasilitas Lab"
                            isFiltered={isFiltered}
                            isFasilitasLab={true}
                            customFieldOptions={[
                                { value: 'all', label: 'Semua' },
                                { value: 'title', label: 'Nama Laboratorium' },
                                { value: 'university', label: 'Institusi' },
                            ]}
                            placeholderAll="Cari laboratorium, institusi, atau jenis lab..."
                        />
                    </div>
                </section>
            </div>

            {selectedLab && (
                <Suspense fallback={null}>
                    <ResearchModal
                        isOpen={!!selectedLab}
                        data={{
                            ...selectedLab,
                            isFasilitasLab: true,
                            currentDataType: 'fasilitas-lab',
                            kampus_ptnbh: selectedLab.kampus_ptnbh || (filters.kampus_ptnbh ? 'PTNBH' : null),
                            kategori_pt: selectedLab.kategori_pt || selectedLab.jenis_pt || selectedLab.ptn_pts || (filters.kampus_ptnbh ? 'PTNBH' : null),
                        }}
                        onClose={() => setSelectedLab(null)}
                    />
                </Suspense>
            )}
        </MainLayout>
    );
}
