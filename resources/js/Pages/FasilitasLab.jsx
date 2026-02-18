import React, { useState, useEffect } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import ResearchList from '../Components/ResearchList';
import StatisticsCards from '../Components/StatisticsCards';

export default function FasilitasLab({ mapData = [], researches = [], stats = {}, title, isFiltered = false, filters: initialFilters = {}, filterOptions: serverFilterOptions = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(initialFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [currentStats, setCurrentStats] = useState(stats);

    // Update currentStats when global stats from props change
    useEffect(() => {
        setCurrentStats(stats);
    }, [stats]);

    // Sync state with props when they change
    useEffect(() => {
        setFilters(initialFilters);
        setSearchTerm(initialFilters.search || '');
    }, [initialFilters]);

    // Options for Fasilitas Lab
    const filterOptions = {
        kampus_ptnbh: serverFilterOptions.kampus_ptnbh || ['Universitas Indonesia', 'Institut Teknologi Bandung'],
        provinsi: serverFilterOptions.provinsi || ['Jawa Barat', 'Jawa Timur', 'DKI Jakarta'],
    };

    const filterFields = [
        { label: 'Kampus PTNBH', requestKey: 'kampus_ptnbh', optionKey: 'kampus_ptnbh' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
    ];

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('fasilitas.index'), { ...filters, search: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        if (queries.every(q => !q.term)) delete params.queries;

        router.get(route('fasilitas.index'), params, {
            preserveState: true,
            preserveScroll: true,
            only: ['researches', 'stats', 'mapData'],
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('fasilitas.index'), { ...newFilters }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatsChange = (newStats) => {
        if (!newStats) {
            setCurrentStats(stats);
        } else {
            setCurrentStats(newStats);
        }
    };

    const handleReset = () => {
        setFilters({});
        setSearchTerm('');
        router.get(route('fasilitas.index'));
    };

    const handleDownload = () => { };

    return (
        <MainLayout title={title || "Peta Persebaran Penelitian BIMA Indonesia - Fasilitas Lab"}>
            <NavigationTabs activePage="fasilitas-lab" />

            <div className="relative">
                <MapContainer mapData={mapData} displayMode={displayMode} onStatsChange={handleStatsChange} />
                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    displayMode={displayMode}
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    filterFields={filterFields}
                    searchTerm={searchTerm}
                    hideDisplayMode={true}
                    hideDownload={true}
                    gridClass="grid-cols-1 md:grid-cols-2"
                    widthClass="w-[95%] lg:w-1/2"
                />
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards
                            stats={currentStats}
                            labels={{
                                totalResearch: 'Total Laboratorium',
                                totalFields: false
                            }}
                        />
                        <ResearchList
                            researches={researches}
                            onAdvancedSearch={handleAdvancedSearch}
                            title="Daftar Fasilitas Lab"
                            isFiltered={isFiltered}
                            customFieldOptions={[
                                { value: 'all', label: 'Semua' },
                                { value: 'title', label: 'Nama Laboratorium' },
                                { value: 'university', label: 'Institusi' },
                            ]}
                            placeholderAll="Cari laboratorium, institusi, atau jenis lab..."
                        />
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}


