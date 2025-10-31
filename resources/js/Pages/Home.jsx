import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import MainLayout from '../Layouts/MainLayout';
import NavigationTabs from '../Components/NavigationTabs';
import MapContainer from '../Components/MapContainer';
import MapControls from '../Components/MapControls';
import AdvancedSearch from '../Components/AdvancedSearch';
import StatisticsCards from '../Components/StatisticsCards';
import ResearchList from '../Components/ResearchList';

export default function Home({ mapData = [], researches = [], stats = {}, filterOptions = {} }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (searchTerm) => {
        router.get(route('penelitian.index'), { search: searchTerm }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('penelitian.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setFilters({});
        router.get(route('penelitian.index'));
    };

    const handleDownload = async () => {
        // Show loading state
        setIsLoading(true);

        try {
            // Fetch ALL filtered data from server for export
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/penelitian/export?${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const allData = await response.json();

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
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Gagal mengexport data. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Penelitian">

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
