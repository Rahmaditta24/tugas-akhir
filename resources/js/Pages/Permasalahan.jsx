import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';
import PermasalahanLegend from '../Components/PermasalahanLegend';

export default function Permasalahan({ mapData = [], stats = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');

    const [showBubbles, setShowBubbles] = useState(true);
    const [viewMode, setViewMode] = useState('provinsi');
    const [filters, setFilters] = useState({
        dataType: 'Sampah',
        bubbleType: 'Penelitian'
    });

    // Mock filter options for Permasalahan page
    const filterOptions = {
        dataType: ['Sampah', 'Air', 'Udara', 'Tanah'],
        bubbleType: ['Penelitian', 'Pengabdian'],
        bidangFokus: ['Energi', 'Kesehatan', 'Pangan', 'Sosial Humaniora'],
        temaPrioritas: ['Tema A', 'Tema B'],
        kategoriPT: ['PTNBH', 'BLU', 'Satker'],
        klaster: ['Mandiri', 'Utama', 'Madya', 'Binaan'],
        provinsi: ['Jawa Barat', 'Jawa Timur', 'DKI Jakarta'],
        tahun: ['2020', '2021', '2022', '2023', '2024'],
    };

    const filterFields = [
        { label: 'Pilih Data', requestKey: 'dataType', optionKey: 'dataType', type: 'single' },
        { label: 'Pilih Jenis Bubble', requestKey: 'bubbleType', optionKey: 'bubbleType', type: 'single' },
        { label: 'Bidang Fokus', requestKey: 'bidang_fokus', optionKey: 'bidangFokus' },
        { label: 'Tema Prioritas', requestKey: 'tema_prioritas', optionKey: 'temaPrioritas' },
        { label: 'Kategori PT', requestKey: 'kategori_pt', optionKey: 'kategoriPT' },
        { label: 'Klaster', requestKey: 'klaster', optionKey: 'klaster' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    const handleSearch = (term) => {
        console.log('Search:', term);
    };

    const handleReset = () => {
        setFilters({
            dataType: 'Sampah',
            bubbleType: 'Penelitian'
        });
    };

    const handleDownload = () => {
        console.log('Download with filters:', filters);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleToggleBubbles = () => {
        setShowBubbles(!showBubbles);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Permasalahan">
            <NavigationTabs activePage="permasalahan" />

            <div className="relative">
                <MapContainer
                    mapData={mapData}
                    displayMode={displayMode}
                    showBubbles={showBubbles}
                    viewMode={viewMode}
                />
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
                    hideDisplayMode={true}
                    showPermasalahanControls={true}
                    showBubbles={showBubbles}
                    onToggleBubbles={handleToggleBubbles}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                />
            </div>

            <div className="w-full lg:max-w-[90%] w-full mx-auto mb-5 mt-6">
                <PermasalahanLegend
                    activeData={filters.dataType || 'Sampah'}
                />

                <section className="bg-white/80 backdrop-blur-sm mt-6">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={stats} />
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}


