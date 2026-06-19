import React, { Suspense, lazy } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import NavigationTabs from '../../Components/NavigationTabs';
import MapControls from '../../Components/MapControls';
import StatisticsCards from '../../Components/StatisticsCards';
import PermasalahanLegend from '../../Components/PermasalahanLegend';
import ResearchList from '../../Components/ResearchList';
import PermasalahanDataTable from '../../Components/PermasalahanDataTable';
import DataInfoBar from './Components/DataInfoBar';
import usePermasalahan from './Hooks/usePermasalahan';

const PermasalahanMap = lazy(() => import('../../Components/PermasalahanMap'));
const PermasalahanDetailModal = lazy(() => import('../../Components/PermasalahanDetailModal'));

const MapLoading = () => (
    <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
        <div className="text-gray-400 font-medium">Memuat peta...</div>
    </div>
);

export default function Index({
    mapData = [],
    permasalahanStats = {},
    permasalahanKabupatenStats = {},
    jenisPermasalahan = [],
    researches = [],
    stats = {},
    allFilterOptions = {},
    filters: initialFilters = {},
    isFiltered = false,
}) {
    const {
        showBubbles, viewMode, filters, searchTerm,
        minPct, setMinPct, maxPct, setMaxPct,
        legendData, setLegendData,
        selectedMetrik, setSelectedMetrik,
        selectedResearch, setSelectedResearch,
        filterOptions, filterFields,
        handleSearch, handleReset, handleDownload,
        handleFilterChange, handleToggleBubbles, 
        handleItemClick, handleViewModeChange
    } = usePermasalahan({ jenisPermasalahan, allFilterOptions, filters: initialFilters });

    return (
        <MainLayout title="Peta Persebaran Penelitian BIMA Indonesia - Permasalahan">
            <NavigationTabs activePage="permasalahan" />

            <div className="relative">
                <Suspense fallback={<MapLoading />}>
                    <PermasalahanMap
                        mapData={mapData}
                        permasalahanStats={permasalahanStats}
                        permasalahanKabupatenStats={permasalahanKabupatenStats}
                        activeDataType={Array.isArray(filters.dataType) ? filters.dataType[0] : (filters.dataType || 'Sampah')}
                        bubbleType={filters.bubbleType}
                        showBubbles={showBubbles}
                        viewMode={viewMode}
                        minPct={minPct}
                        maxPct={maxPct}
                        onLegendUpdate={setLegendData}
                        selectedMetrik={selectedMetrik}
                        onMetrikChange={setSelectedMetrik}
                        stats={stats}
                        onItemClick={handleItemClick}
                    />
                </Suspense>

                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={() => { }}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    displayMode="peneliti"
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    filterFields={filterFields}
                    searchTerm={searchTerm}
                    hideDisplayMode={true}
                    hideSearch={true}
                    hideDownload={true}
                    showPermasalahanControls={true}
                    showBubbles={showBubbles}
                    onToggleBubbles={handleToggleBubbles}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    selectedMetrik={selectedMetrik}
                    onMetrikChange={setSelectedMetrik}
                    widthClass="w-[95%] lg:w-[48%]"
                />
            </div>

            <DataInfoBar filters={filters} />

            <div className="w-full lg:max-w-[90%] mx-auto mb-4 mt-2">
                <PermasalahanLegend
                    activeData={filters.dataType || 'Sampah'}
                    minValue={legendData.min}
                    maxValue={legendData.max}
                    unit={legendData.satuan}
                    minPct={minPct}
                    maxPct={maxPct}
                    onMinPctChange={setMinPct}
                    onMaxPctChange={setMaxPct}
                />

                <section className="bg-white/80 backdrop-blur-sm mt-8">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards
                            stats={stats}
                            labels={
                                filters.bubbleType === 'Hilirisasi' ? {
                                    totalResearch: 'Total Hilirisasi',
                                    totalUniversities: 'Total Perguruan Tinggi',
                                    totalProvinces: 'Total Provinsi',
                                    totalFields: 'Total Bidang Fokus',
                                } : filters.bubbleType === 'Pengabdian' ? {
                                    totalResearch: 'Total Pengabdian',
                                    totalUniversities: 'Total Perguruan Tinggi',
                                    totalProvinces: 'Total Provinsi',
                                    totalFields: 'Total Bidang Fokus',
                                } : {
                                    totalResearch: 'Total Penelitian',
                                    totalUniversities: 'Total Perguruan Tinggi',
                                    totalProvinces: 'Total Provinsi',
                                    totalFields: 'Total Bidang Fokus',
                                }
                            }
                        />
                    </div>
                </section>

                <div className="mt-4">
                    <ResearchList
                        researches={researches}
                        totalCount={stats?.totalResearch || 0}
                        isFiltered={isFiltered}
                        isPermasalahanPage={true}
                        onItemClick={handleItemClick}
                    />
                </div>

                <div className="mt-4">
                    <PermasalahanDataTable
                        rows={permasalahanStats[filters.dataType] || []}
                        kabupatenRows={permasalahanKabupatenStats[filters.dataType] || []}
                        activeDataType={filters.dataType || 'Sampah'}
                        satuan={legendData.satuan}
                    />
                </div>
            </div>

            {selectedResearch && (
                <Suspense fallback={null}>
                    <PermasalahanDetailModal
                        isOpen={!!selectedResearch}
                        data={selectedResearch}
                        onClose={() => setSelectedResearch(null)}
                    />
                </Suspense>
            )}
        </MainLayout>
    );
}
