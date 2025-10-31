import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';

export default function Permasalahan({ mapData = [], stats = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');

    const handleSearch = () => {};
    const handleReset = () => {};
    const handleDownload = () => {};

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Permasalahan">
            <NavigationTabs activePage="permasalahan" />

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
        </MainLayout>
    );
}


