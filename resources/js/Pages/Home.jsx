import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import MainLayout from '../Layouts/MainLayout';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import AdvancedSearch from '../Components/AdvancedSearch';
import StatisticsCards from '../Components/StatisticsCards';
import ResearchList from '../Components/ResearchList';

export default function Home({ mapData = [], researches = [], stats = {}, filterOptions = {}, filters: initialFilters = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(initialFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [isLoading, setIsLoading] = useState(false);

    // Sync state with props when they change (e.g. navigation)
    useEffect(() => {
        setFilters(initialFilters);
        setSearchTerm(initialFilters.search || '');
    }, [initialFilters]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        const params = { ...filters, search: term };
        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) delete params[key];
        });

        router.get(route('penelitian.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Use replace to avoid cluttered history for typing
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        const params = { ...newFilters, search: searchTerm };
        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) delete params[key];
        });

        router.get(route('penelitian.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Don't add to history for faster navigation
            only: ['mapData', 'researches', 'stats'], // Only fetch data, not layout
        });
    };

    const handleReset = () => {
        setFilters({});
        setSearchTerm('');
        router.get(route('penelitian.index'));
    };

    const handleDownload = async () => {
        // Show loading state
        setIsLoading(true);

        try {
            // Build query string that supports arrays
            const queryParts = [];
            Object.keys(filters).forEach(key => {
                const value = filters[key];
                if (Array.isArray(value)) {
                    // For arrays, add each value with the same key
                    value.forEach(v => queryParts.push(`${key}[]=${encodeURIComponent(v)}`));
                } else if (value) {
                    queryParts.push(`${key}=${encodeURIComponent(value)}`);
                }
            });
            const queryString = queryParts.join('&');

            const response = await fetch(`/api/penelitian/export?${queryString}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Export error:', errorText);
                throw new Error('Failed to fetch data');
            }

            const allData = await response.json();

            if (!allData || allData.length === 0) {
                toast.error('Tidak ada data untuk diexport.');
                setIsLoading(false);
                return;
            }

            // Prepare data for Excel export
            const exportData = allData.map(research => ({
                'Nama Peneliti': research.nama || '-',
                'NIDN': research.nidn || '-',
                'Institusi': research.institusi || '-',
                'Jenis PT': research.jenis_pt || '-',
                'Kategori PT': research.kategori_pt || '-',
                'Klaster': research.klaster || '-',
                'Provinsi': research.provinsi || '-',
                'Kota': research.kota || '-',
                'Judul Penelitian': research.judul || '-',
                'Skema': research.skema || '-',
                'Tahun': research.thn_pelaksanaan || '-',
                'Bidang Fokus': research.bidang_fokus || '-',
                'Tema Prioritas': research.tema_prioritas || '-',
            }));

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Penelitian');

            // Auto-size columns
            const cols = [
                { wch: 30 }, // Nama Peneliti
                { wch: 15 }, // NIDN
                { wch: 40 }, // Institusi
                { wch: 15 }, // Jenis PT
                { wch: 12 }, // Kategori PT
                { wch: 25 }, // Klaster
                { wch: 20 }, // Provinsi
                { wch: 20 }, // Kota
                { wch: 60 }, // Judul
                { wch: 30 }, // Skema
                { wch: 10 }, // Tahun
                { wch: 25 }, // Bidang Fokus
                { wch: 30 }, // Tema Prioritas
            ];
            ws['!cols'] = cols;

            // Generate filename with timestamp and filter info
            const timestamp = new Date().toISOString().slice(0, 10);
            const filterInfo = Object.keys(filters).length > 0 ? '_filtered' : '';
            const filename = `penelitian${filterInfo}_${timestamp}.xlsx`;

            // Download file
            XLSX.writeFile(wb, filename);

            // Show success toast
            toast.success(`Berhasil export ${exportData.length} data penelitian!`, {
                duration: 4000,
                position: 'top-right',
                style: {
                    background: '#16a34a',
                    color: '#fff',
                    fontWeight: '500',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#16a34a',
                },
            });
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error('Gagal mengexport data. Silakan coba lagi.', {
                duration: 4000,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Penelitian">
            <Toaster />

            <NavigationTabs activePage="penelitian" />

            <div className="relative">
                <MapContainer
                    mapData={mapData}
                    data={researches}
                    displayMode={displayMode}
                />

                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    displayMode={displayMode}
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    searchTerm={searchTerm}
                />
            </div>

            <div className="w-full lg:max-w-[90%] w-full mx-auto mb-5">
                <section className="bg-white/80 backdrop-blur-sm">
                    <div className="container mx-auto sm:px-6 lg:px-0">
                        <StatisticsCards stats={stats} />
                        <ResearchList researches={researches} />
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
