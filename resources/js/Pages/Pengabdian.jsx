import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';

export default function Pengabdian({ mapData = [], researches = [], stats = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');

    const handleSearch = () => {};
    const handleReset = () => {};
    const handleDownload = () => {};

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Pengabdian">
            <NavigationTabs activePage="pengabdian" />

            <div className="relative">
                <MapContainer mapData={mapData} displayMode={displayMode} />
                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onAdvancedSearchToggle={() => {}}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    displayMode={displayMode}
                    showAdvancedSearch={false}
                />
            </div>
            <div className="w-full lg:max-w-[90%] w-full mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={stats} />
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}


