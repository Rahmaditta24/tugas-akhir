import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import NavigationTabs from '../Components/NavigationTabs';
import PermasalahanMap from '../Components/PermasalahanMap';
import MapControls from '../Components/MapControls';
import StatisticsCards from '../Components/StatisticsCards';
import PermasalahanLegend from '../Components/PermasalahanLegend';
import ResearchList from '../Components/ResearchList';
import PermasalahanDataTable from '../Components/PermasalahanDataTable';

export default function Permasalahan({
    mapData = [],
    permasalahanStats = {},
    jenisPermasalahan = [],
    researches = [],
    stats = {},
}) {
    const [showBubbles, setShowBubbles] = useState(true);
    const [viewMode, setViewMode] = useState('provinsi');
    const [filters, setFilters] = useState({
        dataType: jenisPermasalahan[0] || 'Sampah',
        bubbleType: 'Penelitian',
    });
    const [minPct, setMinPct] = useState(0);
    const [maxPct, setMaxPct] = useState(100);
    const [legendData, setLegendData] = useState({ min: 0, max: 1, satuan: '', activeDataType: filters.dataType });

    const filterOptions = {
        dataType: jenisPermasalahan.length ? jenisPermasalahan : ['Sampah', 'Air', 'Udara', 'Tanah'],
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
                <PermasalahanMap
                    mapData={mapData}
                    permasalahanStats={permasalahanStats}
                    activeDataType={filters.dataType}
                    showBubbles={showBubbles}
                    viewMode={viewMode}
                    minPct={minPct}
                    maxPct={maxPct}
                    onLegendDataChange={setLegendData}
                />
                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={() => {}}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    displayMode="peneliti"
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

            <div className="w-full lg:max-w-[90%] mx-auto mb-5 mt-6">
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

                <section className="bg-white/80 backdrop-blur-sm mt-6">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={stats} />
                    </div>
                </section>

                {/* Research list */}
                <div className="mt-6">
                    <ResearchList
                        researches={researches}
                        isFiltered={researches.length > 0}
                    />
                </div>

                {/* Data table: province & kabupaten */}
                <div className="mt-6">
                    <PermasalahanDataTable
                        rows={permasalahanStats[filters.dataType] || []}
                        kabupatenRows={mapData.filter(
                            (r) => r.kabupaten_kota && r.jenis_permasalahan === filters.dataType
                        )}
                        activeDataType={filters.dataType || 'Sampah'}
                        satuan={legendData.satuan}
                    />
                </div>
            </div>
        </MainLayout>
    );
}


