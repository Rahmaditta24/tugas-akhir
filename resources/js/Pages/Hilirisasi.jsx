import React, { useState, useEffect } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import ResearchList from '../Components/ResearchList';
import StatisticsCards from '../Components/StatisticsCards';

export default function Hilirisasi({ mapData = [], researches = [], stats = {}, title, isFiltered = false, filters: initialFilters = {}, filterOptions: serverFilterOptions = {} }) {
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

    // Mock options for Hilirisasi
    const filterOptions = {
        direktorat: serverFilterOptions.direktorat || ['Direktorat A', 'Direktorat B'],
        skema: serverFilterOptions.skema || ['Skema A', 'Skema B'],
        provinsi: serverFilterOptions.provinsi || ['Jawa Barat', 'Jawa Timur', 'DKI Jakarta'],
        tahun: serverFilterOptions.tahun || ['2020', '2021', '2022', '2023', '2024'],
    };

    const filterFields = [
        { label: 'Direktorat', requestKey: 'direktorat', optionKey: 'direktorat' },
        { label: 'Skema', requestKey: 'skema', optionKey: 'skema' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('hilirisasi.index'), { ...filters, search: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        if (queries.every(q => !q.term)) delete params.queries;

        router.get(route('hilirisasi.index'), params, {
            preserveState: true,
            preserveScroll: true,
            only: ['researches', 'stats'],
            replace: true,
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('hilirisasi.index'), { ...newFilters }, {
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
        router.get(route('hilirisasi.index'));
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        const loadingToast = toast.loading('Sedang menyiapkan data Excel, mohon tunggu...', {
            position: 'top-right'
        });
        try {
            const queryParts = [];
            Object.keys(filters).forEach(key => {
                const value = filters[key];
                if (Array.isArray(value)) {
                    value.forEach(v => queryParts.push(`${key}[]=${encodeURIComponent(v)}`));
                } else if (value) {
                    queryParts.push(`${key}=${encodeURIComponent(value)}`);
                }
            });
            const queryString = queryParts.join('&');

            const response = await fetch(`/api/hilirisasi/export?${queryString}`);
            if (!response.ok) throw new Error('Gagal mengambil data');

            const allData = await response.json();
            if (!allData || allData.length === 0) {
                toast.error('Tidak ada data untuk diexport.');
                setIsLoading(false);
                return;
            }

            const exportData = allData.map(item => ({
                'Tahun': item.tahun || '-',
                'ID Proposal': item.id_proposal || '-',
                'Judul': item.judul || '-',
                'Nama Pengusul': item.nama_pengusul || '-',
                'Direktorat': item.direktorat || '-',
                'Perguruan Tinggi': item.perguruan_tinggi || '-',
                'Provinsi': item.provinsi || '-',
                'Mitra': item.mitra || '-',
                'Skema': item.skema || '-',
                'Luaran': item.luaran || '-',
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Hilirisasi');
            ws['!cols'] = [
                { wch: 8 }, { wch: 12 }, { wch: 60 }, { wch: 30 }, { wch: 25 },
                { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 30 },
            ];

            const timestamp = new Date().toISOString().slice(0, 10);
            const filterInfo = Object.keys(filters).length > 0 ? '_filtered' : '';
            XLSX.writeFile(wb, `data-hilirisasi${filterInfo}_${timestamp}.xlsx`);

            toast.dismiss(loadingToast);
            toast.success(`Berhasil export ${exportData.length} data hilirisasi!`, {
                duration: 4000, position: 'top-right',
                style: { background: '#16a34a', color: '#fff', fontWeight: '500' },
            });
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.dismiss(loadingToast);
            toast.error('Gagal mengexport data. Silakan coba lagi.', { duration: 4000, position: 'top-right' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout title={title || "Peta Persebaran Penelitian BIMA Indonesia - Hilirisasi"}>
            <Toaster />
            <NavigationTabs activePage="hilirisasi" />

            <div className="relative">
                <MapContainer mapData={mapData} displayMode={displayMode} onStatsChange={handleStatsChange} />
                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    isLoading={isLoading}
                    displayMode={displayMode}
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    filterFields={filterFields}
                    searchTerm={searchTerm}
                />
            </div>
            <div className="w-full lg:max-w-[90%] mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={{ ...currentStats, totalFields: 0 }} />
                        <ResearchList
                            researches={researches}
                            onAdvancedSearch={handleAdvancedSearch}
                            title="Daftar Hilirisasi"
                            isFiltered={isFiltered}
                            customFieldOptions={[
                                { value: 'all', label: 'Semua' },
                                { value: 'title', label: 'Judul Hilirisasi' },
                                { value: 'university', label: 'Universitas' },
                                { value: 'researcher', label: 'Peneliti' },
                                { value: 'directorate', label: 'Direktorat' },
                                { value: 'skema', label: 'Skema' },
                            ]}
                        />
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}


