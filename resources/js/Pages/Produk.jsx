import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';

export default function Produk({ mapData = [], researches = [], stats = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState({});

    // Mock options for Produk
    const filterOptions = {
        bidang: ['Pangan', 'Energi', 'Kesehatan', 'Transportasi', 'Teknologi Informasi'],
        tkt: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        provinsi: ['Jawa Barat', 'Jawa Timur', 'DKI Jakarta'],
        tahun: ['2020', '2021', '2022', '2023', '2024'],
    };

    const filterFields = [
        { label: 'Bidang', requestKey: 'bidang', optionKey: 'bidang' },
        { label: 'Tingkat Kesiapterapan Teknologi', requestKey: 'tkt', optionKey: 'tkt' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    const handleSearch = (value) => {
        router.get(route('produk.index'), { search: value }, {
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
        <MainLayout title="Dashboard Pemetaan Riset - Produk">
            <NavigationTabs activePage="produk" />

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


