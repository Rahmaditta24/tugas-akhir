import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
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
    permasalahanKabupatenStats = {},
    jenisPermasalahan = [],
    researches = [],
    stats = {},
    allFilterOptions = {},
    filters: initialFilters = {},
    isFiltered = false,
}) {
    const [showBubbles, setShowBubbles] = useState(true);
    const [viewMode, setViewMode] = useState('provinsi');
    const [filters, setFilters] = useState({
        dataType: initialFilters.dataType || 'Sampah',
        bubbleType: initialFilters.bubbleType || 'Penelitian',
        ...initialFilters
    });
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [minPct, setMinPct] = useState(0);
    const [maxPct, setMaxPct] = useState(100);
    const [legendData, setLegendData] = useState({ min: 0, max: 1, satuan: '', activeDataType: filters.dataType });
    const [selectedMetrik, setSelectedMetrik] = useState('saidi');

    // Sync state with props
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            ...initialFilters,
            dataType: initialFilters.dataType || prev.dataType,
            bubbleType: initialFilters.bubbleType || prev.bubbleType,
        }));
        setSearchTerm(initialFilters.search || '');
    }, [initialFilters]);

    // Dynamic filter options based on bubbleType
    const filterOptions = {
        dataType: jenisPermasalahan.length ? jenisPermasalahan : ['Sampah', 'Air', 'Udara', 'Tanah'],
        bubbleType: ['Penelitian', 'Pengabdian', 'Hilirisasi'],
        ...(allFilterOptions[filters.bubbleType] || {})
    };

    // Dynamic filter fields based on bubbleType
    const filterFields = [
        { label: 'Pilih Data', requestKey: 'dataType', optionKey: 'dataType', type: 'single', hideAllOption: true },
        { label: 'Pilih Jenis Bubble', requestKey: 'bubbleType', optionKey: 'bubbleType', type: 'single', hideAllOption: true },
    ];

    // Add specific fields based on bubbleType
    if (filters.bubbleType === 'Penelitian') {
        filterFields.push(
            { label: 'Bidang Fokus', requestKey: 'bidang_fokus', optionKey: 'bidangFokus' },
            { label: 'Tema Prioritas', requestKey: 'tema_prioritas', optionKey: 'temaPrioritas' },
            { label: 'Kategori PT', requestKey: 'kategori_pt', optionKey: 'kategoriPT' },
            { label: 'Klaster', requestKey: 'klaster', optionKey: 'klaster' },
            { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
            { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' }
        );
    } else if (filters.bubbleType === 'Pengabdian') {
        filterFields.push(
            { label: 'Jenis Pengabdian', requestKey: 'batch_type', optionKey: 'batchType', type: 'single', hideAllOption: true, colSpan: 'md:col-span-3' },
            { label: 'Skema', requestKey: 'skema', optionKey: 'skema' },
            { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
            { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' }
        );
    } else if (filters.bubbleType === 'Hilirisasi') {
        filterFields.push(
            { label: 'Direktorat', requestKey: 'direktorat', optionKey: 'direktorat' },
            { label: 'Skema', requestKey: 'skema', optionKey: 'skema' },
            { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
            { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' }
        );
    }

    const handleSearch = (term) => {
        setSearchTerm(term);
        const params = { ...filters, search: term };
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) delete params[key];
        });

        router.get(window.location.pathname, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleReset = () => {
        const defaultFilters = {
            dataType: 'Sampah',
            bubbleType: filters.bubbleType || 'Penelitian'
        };
        setFilters(defaultFilters);
        setSearchTerm('');
        router.get(window.location.pathname, defaultFilters);
    };

    const handleDownload = () => {
        console.log('Download with filters:', filters);
    };

    const handleFilterChange = (newFilters) => {
        // Automatically set default batch_type if switched to Pengabdian and it's not set
        if (newFilters.bubbleType === 'Pengabdian' && filters.bubbleType !== 'Pengabdian') {
                newFilters.batch_type = 'Multitahun, Batch I & Batch II';
        }
        
        setFilters(newFilters);
        const params = { ...newFilters, search: searchTerm };
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) delete params[key];
        });

        router.get(window.location.pathname, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'permasalahanStats', 'permasalahanKabupatenStats'],
        });
    };

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        if (queries.every(q => !q.term)) delete params.queries;

        router.get(window.location.pathname, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'permasalahanStats', 'permasalahanKabupatenStats'],
        });
    };

    const handleToggleBubbles = () => {
        setShowBubbles(!showBubbles);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    return (
        <MainLayout title="Peta Persebaran Penelitian BIMA Indonesia - Permasalahan">
            <NavigationTabs activePage="permasalahan" />

            <div className="relative">
                <PermasalahanMap
                    mapData={mapData}
                    permasalahanStats={permasalahanStats}
                    permasalahanKabupatenStats={permasalahanKabupatenStats}
                    activeDataType={Array.isArray(filters.dataType) ? filters.dataType[0] : (filters.dataType || 'Sampah')}
                    bubbleType={filters.bubbleType}
                    showBubbles={showBubbles}
                    viewMode={viewMode}
                    minPct={minPct}
                    maxPct={maxPct}
                    onLegendUpdate={setLegendData}
                    selectedMetrik={selectedMetrik}
                    onMetrikChange={setSelectedMetrik}
                    stats={stats}
                />
                
                {/* Metric selector for Krisis Listrik */}
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
                    searchTerm={searchTerm}
                    hideDisplayMode={true}
                    hideSearch={true}
                    hideDownload={true}
                    showPermasalahanControls={true}
                    showBubbles={showBubbles}
                    onToggleBubbles={handleToggleBubbles}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    selectedMetrik={selectedMetrik}
                    onMetrikChange={setSelectedMetrik}
                    widthClass="w-[95%] lg:w-[48%]"
                />
            </div>

            {/* Data Info Bar */}
            <div className="w-full lg:max-w-[90%] mx-auto mt-4 px-4 py-3 bg-[#f8fbff] border border-blue-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-2 shadow-sm text-sm">
                <div className="space-y-1">
                    <p className="text-gray-700">
                        <span className="font-bold text-gray-900">Data Dipilih:</span> {filters.dataType}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-bold text-gray-900">Jenis Bubble Dipilih:</span> {filters.bubbleType}
                        {filters.bubbleType === 'Pengabdian' && (
                            <>
                                {filters.skema && ` (${Array.isArray(filters.skema) ? filters.skema.join(', ') : filters.skema})`}
                                {filters.batch_type && ` (${Array.isArray(filters.batch_type) ? filters.batch_type.join(', ') : filters.batch_type})`}
                            </>
                        )}
                        {filters.bubbleType === 'Hilirisasi' && filters.skema && ` (${Array.isArray(filters.skema) ? filters.skema.join(', ') : filters.skema})`}
                    </p>
                </div>
                <div className="text-gray-700">
                    <span className="font-bold text-gray-900">Sumber Data:</span> {
                        filters.dataType === 'Sampah' ? 'Kementerian Lingkungan Hidup 2024' :
                        filters.dataType === 'Stunting' ? 'SSGI 2024 Kementerian Kesehatan' :
                        filters.dataType === 'Gizi Buruk' ? 'SSGI 2024 Kementerian Kesehatan' :
                        filters.dataType === 'Krisis Listrik' ? 'Statistik PLN 2024' :
                        filters.dataType === 'Ketahanan Pangan' ? 'Peta Ketahanan & Kerentanan Pangan Indonesai (FSVA) 2024' :
                        'Kementerian Terkait'
                    }
                </div>
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-4 mt-2">
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

                <section className="bg-white/80 backdrop-blur-sm mt-2">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards
                            stats={stats}
                            labels={
                                filters.bubbleType === 'Hilirisasi' ? {
                                    totalResearch: 'Total Hilirisasi',
                                    totalUniversities: 'Total Perguruan Tinggi',
                                    totalProvinces: 'Total Provinsi',
                                    totalFields: 'Total Bidang Fokus',
                                } : filters.bubbleType === 'Pengabdian' ? {
                                    totalResearch: 'Total Pengabdian',
                                    totalUniversities: 'Total Perguruan Tinggi',
                                    totalProvinces: 'Total Provinsi',
                                    totalFields: 'Total Bidang Fokus',
                                } : {
                                    totalResearch: 'Total Penelitian',
                                    totalUniversities: 'Total Perguruan Tinggi',
                                    totalProvinces: 'Total Provinsi',
                                    totalFields: 'Total Bidang Fokus',
                                }
                            }
                        />
                    </div>
                </section>

                {/* Research list */}
                <div className="mt-4">
                    <ResearchList
                        researches={researches}
                        totalCount={stats?.totalResearch || 0}
                        isFiltered={researches.length > 0}
                    />
                </div>

                {/* Data table: province & kabupaten */}
                <div className="mt-4">
                    <PermasalahanDataTable
                        rows={permasalahanStats[filters.dataType] || []}
                        kabupatenRows={permasalahanKabupatenStats[filters.dataType] || []}
                        activeDataType={filters.dataType || 'Sampah'}
                        satuan={legendData.satuan}
                    />
                </div>
            </div>
        </MainLayout>
    );
}


