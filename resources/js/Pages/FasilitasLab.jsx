import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';

export default function FasilitasLab({ mapData = [], researches = [], stats = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState({});

    // Mock options for Fasilitas Lab
    const filterOptions = {
        kampus_ptnbh: ['UI', 'ITB', 'UGM', 'IPB', 'ITS', 'UNAIR', 'UNHAS', 'USU', 'UNDIP', 'UNPAD'],
        provinsi: ['Jawa Barat', 'Jawa Timur', 'DKI Jakarta'],
    };

    const filterFields = [
        { label: 'Kampus PTNBH', requestKey: 'kampus_ptnbh', optionKey: 'kampus_ptnbh' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
    ];

    const handleSearch = (value) => {
        router.get(route('fasilitas.index'), { search: value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleReset = () => {
        setFilters({});
    };

    const handleDownload = () => { };

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Fasilitas Lab">
            <NavigationTabs activePage="fasilitas-lab" />

            <div className="relative">
                <MapContainer mapData={mapData} displayMode={displayMode} />
                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onAdvancedSearchToggle={() => { }}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    displayMode={displayMode}
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    filterFields={filterFields}
                />
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={stats} />
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}


