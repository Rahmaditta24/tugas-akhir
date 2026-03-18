import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
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
    const [isLoading, setIsLoading] = useState(false);

    const filterOptions = {
        dataType: jenisPermasalahan.length ? jenisPermasalahan : ['Sampah', 'Air', 'Udara', 'Tanah'],
        bubbleType: ['Penelitian', 'Pengabdian', 'Hilirisasi'],
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
        setIsLoading(true);
        const loadingToast = toast.loading('Sedang menyiapkan data Excel, mohon tunggu...', {
            position: 'top-right'
        });
        try {
            const activeType = filters.dataType || 'Sampah';
            const provinsiRows = permasalahanStats[activeType] || [];
            const kabupatenRows = mapData.filter(
                (r) => r.kabupaten_kota && r.jenis_permasalahan === activeType
            );

            if (provinsiRows.length === 0 && kabupatenRows.length === 0) {
                toast.error('Tidak ada data untuk diexport.');
                return;
            }

            const wb = XLSX.utils.book_new();

            // Sheet 1: Data Provinsi
            if (provinsiRows.length > 0) {
                const provinsiData = provinsiRows.map(row => ({
                    'Provinsi': row.provinsi || '-',
                    'Jenis Permasalahan': activeType,
                    'Nilai/Jumlah': row.nilai ?? row.jumlah ?? row.total ?? '-',
                    'Satuan': legendData.satuan || '-',
                }));
                const ws1 = XLSX.utils.json_to_sheet(provinsiData);
                ws1['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 12 }];
                XLSX.utils.book_append_sheet(wb, ws1, 'Data Provinsi');
            }

            // Sheet 2: Data Kabupaten/Kota
            if (kabupatenRows.length > 0) {
                const kabupatenData = kabupatenRows.map(row => ({
                    'Kabupaten/Kota': row.kabupaten_kota || '-',
                    'Provinsi': row.provinsi || '-',
                    'Jenis Permasalahan': row.jenis_permasalahan || activeType,
                    'Nilai/Jumlah': row.nilai ?? row.jumlah ?? row.total ?? '-',
                    'Satuan': row.satuan || legendData.satuan || '-',
                }));
                const ws2 = XLSX.utils.json_to_sheet(kabupatenData);
                ws2['!cols'] = [{ wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 12 }];
                XLSX.utils.book_append_sheet(wb, ws2, 'Data Kabupaten-Kota');
            }

            const timestamp = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `permasalahan_${activeType}_${timestamp}.xlsx`);

            toast.dismiss(loadingToast);
            toast.success(`Berhasil export data permasalahan ${activeType}!`, {
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
            <Toaster />
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
                    onDisplayModeChange={() => { }}
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
                    isLoading={isLoading}
                    hideDownload={true}
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


