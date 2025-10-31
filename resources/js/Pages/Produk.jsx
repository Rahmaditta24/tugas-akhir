import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';

export default function Produk({ mapData = [], researches = [], stats = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Produk">
            <NavigationTabs activePage="produk" />

            <div className="relative">
                <MapContainer mapData={mapData} displayMode={displayMode} />
                <MapControls
                    onSearch={(value) => {
                        router.get(route('produk.index'), { search: value }, {
                            preserveState: true,
                            preserveScroll: true,
                        });
                    }}
                    onDisplayModeChange={setDisplayMode}
                    onAdvancedSearchToggle={() => {}}
                    onReset={() => {}}
                    onDownload={() => {}}
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


