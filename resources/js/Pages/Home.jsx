import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import AdvancedSearch from '../Components/AdvancedSearch';
import StatisticsCards from '../Components/StatisticsCards';
import ResearchList from '../Components/ResearchList';

export default function Home({ mapData = [], researches = [], stats = {}, filterOptions = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [filters, setFilters] = useState({});

    const handleSearch = (searchTerm) => {
        router.get(route('penelitian.index'), { search: searchTerm }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('penelitian.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setFilters({});
        router.get(route('penelitian.index'));
    };

    const handleDownload = () => {
        // For now, just alert. You can implement actual Excel download later
        alert('Download Excel feature will be implemented with XLSX library');
    };

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Penelitian">
            <NavigationTabs activePage="penelitian" />

            <div className="relative">
                <MapContainer
                    mapData={mapData}
                    data={researches}
                    displayMode={displayMode}
                />

                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onAdvancedSearchToggle={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    displayMode={displayMode}
                    showAdvancedSearch={showAdvancedSearch}
                />

                {showAdvancedSearch && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 lg:w-1/2 w-full px-3 lg:px-0 z-10">
                        <AdvancedSearch
                            filterOptions={filterOptions}
                            onFilterChange={handleFilterChange}
                            show={showAdvancedSearch}
                        />
                    </div>
                )}
            </div>

            <div className="w-full lg:max-w-[90%] w-full mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={stats} />
                        <ResearchList researches={researches} />
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
