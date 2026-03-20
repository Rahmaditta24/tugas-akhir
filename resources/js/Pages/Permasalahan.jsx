import React, { useState } from 'react';
import { router } from '@inertiajs/react';
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
    filters: initialFilters = {},
}) {
    const [showBubbles, setShowBubbles] = useState(true);
    const [viewMode, setViewMode] = useState('provinsi');
    const [filters, setFilters] = useState({
        dataType: initialFilters.dataType || jenisPermasalahan[0] || 'Sampah',
        bubbleType: initialFilters.bubbleType || 'Penelitian',
        ...initialFilters
    });
    const [minPct, setMinPct] = useState(0);
    const [maxPct, setMaxPct] = useState(100);
    const [legendData, setLegendData] = useState({ min: 0, max: 1, satuan: '', activeDataType: filters.dataType });
    const [isLoading, setIsLoading] = useState(false);

    const filterOptions = {
        dataType: jenisPermasalahan.length ? jenisPermasalahan : ['Sampah', 'Air', 'Udara', 'Tanah'],
        bubbleType: ['Penelitian', 'Pengabdian', 'Hilirisasi'],
        bidangFokus: [
            "Energi", "Kebencanaan", "Kemaritiman", "Kesehatan", "Material Maju",
            "Pangan", "Pertahanan dan Keamanan", "Produk rekayasa keteknikan",
            "Sosial Humaniora", "Teknologi Informasi dan Komunikasi", "Transportasi",
            "Riset Dasar Teoritis"
        ],
        temaPrioritas: [
            "Digital Economy", "Digitalisasi", "Ekonomi Biru", "Ekonomi Hijau",
            "Ekonomi Kreatif", "Elektrifikasi Transportasi", "Hilirisasi Dan Industrialisasi",
            "Industri Manufaktur", "Kecerdasan Buatan", "Kemandirian Kesehatan",
            "Kesehatan", "Lainnya", "Lingkungan Hidup", "Material Maju", "Mineral",
            "Pariwisata", "Pengelolaan Sampah", "Semikonduktor", "Swasembada Air",
            "Swasembada Energi", "Swasembada Pangan", "Tidak Memilih"
        ],
        kategoriPT: ['PTN', 'PTNBH', 'PTS'],
        klaster: ['Kelompok PT Binaan', 'Kelompok PT Madya', 'Kelompok PT Mandiri', 'Kelompok PT Pratama', 'Kelompok PT Utama'],
        provinsi: [
            "Aceh", "Bali", "Bangka Belitung", "Banten", "Bengkulu", "Di Yogyakarta", "Dki Jakarta",
            "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat",
            "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara",
            "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat",
            "Nusa Tenggara Timur", "Papua", "Papua Barat", "Papua Barat Daya", "Papua Pegunungan",
            "Papua Selatan", "Papua Tengah", "Riau", "Sulawesi Barat", "Sulawesi Selatan",
            "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat",
            "Sumatera Selatan", "Sumatera Utara"
        ],
        tahun: ["2025", "2024", "2023", "2022", "2021"],
        skema: ['KBM', 'PMP', 'PKM', 'Kosabangsa', 'PMM', 'Pemberdayaan Masyarakat'],
        direktorat: ['Direktorat Riset', 'Direktorat Pengabdian', 'Direktorat Vokasi'],
    };

    // Dinamis: Filter di bawah mengikuti bubbleType yang dipilih
    const getDynamicFilterFields = () => {
        const baseFields = [
            { label: 'Pilih Data Permasalahan', requestKey: 'dataType', optionKey: 'dataType', type: 'single', hideIcon: true },
            { label: 'Pilih Jenis Bubble', requestKey: 'bubbleType', optionKey: 'bubbleType', type: 'single', hideIcon: true },
        ];

        const bubbleType = filters.bubbleType || 'Data Permasalahan';
        if (bubbleType === 'Data Permasalahan') {
            return baseFields; // No extra filters for problem data
        }

        let adaptiveFields = [];
        if (bubbleType === 'Penelitian') {
            adaptiveFields = [
                { label: 'Bidang Fokus', requestKey: 'bidang_fokus', optionKey: 'bidangFokus' },
                { label: 'Tema Prioritas', requestKey: 'tema_prioritas', optionKey: 'temaPrioritas' },
                { label: 'Kategori PT', requestKey: 'kategori_pt', optionKey: 'kategoriPT' },
                { label: 'Klaster', requestKey: 'klaster', optionKey: 'klaster' },
                { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
                { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
            ];
        } else if (bubbleType === 'Pengabdian') {
            adaptiveFields = [
                { label: 'Skema', requestKey: 'skema', optionKey: 'skema' },
                { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
                { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
            ];
        } else if (bubbleType === 'Hilirisasi') {
            adaptiveFields = [
                { label: 'Direktorat', requestKey: 'direktorat', optionKey: 'direktorat' },
                { label: 'Skema', requestKey: 'skema', optionKey: 'skema' },
                { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
                { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
            ];
        }

        return [...baseFields, ...adaptiveFields];
    };


    const filterFields = getDynamicFilterFields();

    const handleSearch = (term) => {
        const newFilters = { ...filters, search: term };
        handleFilterChange(newFilters);
    };

    const handleReset = () => {
        router.get(route('permasalahan.index'));
    };

    const handleDownload = () => {
        setIsLoading(true);
        const loadingToast = toast.loading('Sedang menyiapkan data Excel, mohon tunggu...', {
            position: 'top-right'
        });
        try {
            const activeType = filters.dataType || 'Sampah';
            const rows = researches || [];

            if (rows.length === 0) {
                toast.error('Tidak ada data untuk diexport.');
                return;
            }

            const wb = XLSX.utils.book_new();
            const exportData = rows.map(r => ({
                'Judul': r.judul || '-',
                'Universitas': r.institusi || '-',
                'Provinsi': r.provinsi || '-',
                'Bidang/Skema': r.bidang_fokus || '-',
                'Tahun': r.tahun || '-',
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(wb, ws, 'Daftar Penelitian');

            const timestamp = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `penelitian_${activeType}_${timestamp}.xlsx`);

            toast.dismiss(loadingToast);
            toast.success(`Berhasil export data penelitian!`, {
                duration: 4000, position: 'top-right',
                style: { background: '#16a34a', color: '#fff' },
            });
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Gagal mengexport data.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('permasalahan.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters'],
        });
    };

    const handleToggleBubbles = () => {
        setShowBubbles(!showBubbles);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        // Also update backend if needed, but polygons are currently all-at-once
    };

    return (
        <MainLayout title="Dashboard Pemetaan Riset - Permasalahan">
            <Toaster />
            <NavigationTabs activePage="permasalahan" />

            <div className="relative">
                <PermasalahanMap
                    mapData={mapData}
                    researches={researches}
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
                    filterOptions={{...filterOptions, dataType: jenisPermasalahan}}
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
                    widthClass="w-[95%] lg:w-[60%]"
                    gridClass="grid-cols-1 md:grid-cols-3"
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
                        <StatisticsCards 
                            stats={stats[filters.bubbleType] || {}} 
                            labels={{
                                totalResearch: `Total ${filters.bubbleType}`,
                                totalFields: filters.bubbleType === 'Pengabdian' ? 'Total Skema' : 
                                             filters.bubbleType === 'Hilirisasi' ? 'Total Bidang' : 'Bidang Fokus'
                            }}
                        />
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


