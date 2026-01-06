import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';

export default function Pengabdian({ mapData = [], researches = [], stats = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState({});

    // Mock options for Pengabdian
    const filterOptions = {
        dataType: ['Multitahun', 'Batch I', 'Batch II'],
        skema: ['Pemberdayaan Kemitraan', 'Pemberdayaan Masyarakat'],
        provinsi: ['Jawa Barat', 'Jawa Timur', 'DKI Jakarta'],
        tahun: ['2020', '2021', '2022', '2023', '2024'],
    };

    const filterFields = [
        { label: 'Pilih Data', requestKey: 'dataType', optionKey: 'dataType', type: 'single' },
        { label: 'Skema', requestKey: 'skema', optionKey: 'skema' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    const handleSearch = (value) => {
        router.get(route('pengabdian.index'), { search: value }, {
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
        <MainLayout title="Dashboard Pemetaan Riset - Pengabdian">
            <NavigationTabs activePage="pengabdian" />

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


