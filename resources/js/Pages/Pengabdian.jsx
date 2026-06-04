import { useState, useEffect, Suspense, lazy } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { router } from '@inertiajs/react';

import toast, { Toaster } from 'react-hot-toast';
import { exportToExcel } from '../Utils/exportExcel';
import NavigationTabs from '../Components/NavigationTabs';
import MapControls from '../Components/MapControls';
import ResearchList from '../Components/ResearchList';
import StatisticsCards from '../Components/StatisticsCards';

// Komponen lazy-loaded
const MapContainer = lazy(() => import('../Components/MapContainer'));
const ResearchModal = lazy(() => import('../Components/ResearchModal'));

// Tampilan loading fallback
const MapLoading = () => (
    <div className="w-full h-[600px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
        <div className="text-gray-400 font-medium">Memuat peta...</div>
    </div>
);

export default function Pengabdian({ mapData = [], researches = [], stats = {}, title, isFiltered = false, filters: initialFilters = {}, filterOptions: serverFilterOptions = {} }) {
    const DEFAULT_DATA_TYPE = 'Multitahun, Batch I & Batch II';

    // Jika server tidak mengembalikan dataType (akses /pengabdian tanpa filter),
    // set default di sisi React agar tampilan sesuai dengan data yang dimuat
    const normalizedFilters = initialFilters.dataType
        ? initialFilters
        : { ...initialFilters, dataType: DEFAULT_DATA_TYPE };

    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(normalizedFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [currentStats, setCurrentStats] = useState(stats);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMapData, setCurrentMapData] = useState(mapData);
    const [currentResearches, setCurrentResearches] = useState(researches);

    // Sinkronisasi state saat props berubah dari navigasi atau filter eksplisit
    useEffect(() => {
        setCurrentMapData(mapData);
        setCurrentResearches(researches);
        setCurrentStats(stats);
        const normalized = initialFilters.dataType
            ? initialFilters
            : { ...initialFilters, dataType: DEFAULT_DATA_TYPE };
        setFilters(normalized);
        setSearchTerm(initialFilters.search || '');
    }, [mapData, researches, stats, initialFilters]);


    // Opsi filter statis untuk Pengabdian
    const allSkemas = [
        'KBM', 'PDB', 'PKM', 'PM-UPUD', 'PMM', 'PMP', 'PUK', 'PW',
        'Pemberdayaan Desa Binaan',
        'Pemberdayaan Kemitraan Masyarakat',
        'Pemberdayaan Masyarakat oleh Mahasiswa',
        'Pengabdian Masyarakat Pemula',
        'Program Kemitraan Masyarakat Stimulus'
    ];

    const filterOptions = {
        dataType: ['Multitahun, Batch I & Batch II', 'Kosabangsa'],
        skema: filters.dataType === 'Kosabangsa' ? ['Kosabangsa'] : allSkemas,
        provinsi: serverFilterOptions.provinsi || [],
        // Pastikan tahun selalu string agar cocok dengan nilai URL params (string)
        tahun: (serverFilterOptions.tahun || ['2020', '2021', '2022', '2023', '2024', '2025', '2026']).map(String),
    };

    const filterFields = [
        { label: 'Pilih Data', requestKey: 'dataType', optionKey: 'dataType', type: 'single', hideIcon: true },
        { label: 'Skema', requestKey: 'skema', optionKey: 'skema' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
        { label: 'Tahun', requestKey: 'tahun', optionKey: 'tahun' },
    ];

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('pengabdian.index'), { ...filters, search: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered'],
            showProgress: false,
        });
    };

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        if (queries.every(q => !q.term)) delete params.queries;

        router.get(route('pengabdian.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered']
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('pengabdian.index'), { ...newFilters, search: searchTerm }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered'],
            showProgress: false,
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
        setFilters({ dataType: 'Multitahun, Batch I & Batch II' });
        setSearchTerm('');
        router.get(route('pengabdian.index'), { dataType: 'Multitahun, Batch I & Batch II' });
    };

    const handleItemClick = async (research) => {
        const buildData = (r) => ({
            ...r,
            isPengabdian: true,
            currentDataType: 'pengabdian',
            pengabdian_nama: r.pengabdian_nama || r.nama || r.nama_ketua || '-',
            pengabdian_institusi: r.pengabdian_institusi || r.institusi || r.nama_institusi || '-',
            pengabdian_tahun: r.pengabdian_tahun || r.tahun || r.thn_pelaksanaan_kegiatan || '-',
            pengabdian_skema: r.pengabdian_skema || r.skema || r.nama_skema || '-',
            pengabdian_bidang_fokus: r.pengabdian_bidang_fokus || r.bidang_fokus || r.bidang || '-',
            pengabdian_provinsi: r.pengabdian_provinsi || r.provinsi || r.prov_pt || '-',
            pengabdian_kabupaten: r.pengabdian_kabupaten || r.kabupaten_kota || r.kab_pt || '-',
            pengabdian_klaster: r.pengabdian_klaster || r.klaster || '-',
            pengabdian_status_pt: r.pengabdian_status_pt || r.ptn_pts || r.kategori_pt || '-',
            // Pemetaan field Kosabangsa
            pengabdian_nama_pendamping: r.pengabdian_nama_pendamping || r.nama_pendamping || '-',
            pengabdian_institusi_pendamping: r.pengabdian_institusi_pendamping || r.institusi_pendamping || '-',
            pengabdian_bidang_teknologi: r.pengabdian_bidang_teknologi || r.bidang_teknologi_inovasi || '-',
            pengabdian_jenis_wilayah: r.pengabdian_jenis_wilayah || r.jenis_wilayah_provinsi_mitra || '-',
            pengabdian_provinsi_mitra: r.pengabdian_provinsi_mitra || r.prov_mitra || '-',
        });

        if (!research?.id) {
            setSelectedResearch(buildData(research));
            setIsModalOpen(true);
            return;
        }

        try {
            const response = await fetch(`/api/research/pengabdian/${research.id}`);
            if (response.ok) {
                const detail = await response.json();
                setSelectedResearch(buildData(detail));
            } else {
                setSelectedResearch(buildData(research));
            }
        } catch {
            setSelectedResearch(buildData(research));
        }
        setIsModalOpen(true);
    };

    const [isLoading, setIsLoading] = useState(false);
    const handleDownload = async () => {
        setIsLoading(true);
        const label = filters.dataType || 'Pengabdian';
        const loadingToast = toast.loading(`Sedang menyiapkan data Excel ${label}, mohon tunggu...`, {
            position: 'top-right'
        });

        const queryString = new URLSearchParams(window.location.search).toString();
        const today = new Date().toISOString().slice(0, 10);

        // Tentukan slug jenis data (multitahun / kosabangsa)
        const dataTypeSlug = (filters.dataType || '').toLowerCase().includes('kosabangsa')
            ? 'kosabangsa'
            : 'multitahun';

        // Tentukan apakah ada filter aktif selain dataType
        const hasActiveFilter = Object.keys(filters).some(
            k => k !== 'dataType' && filters[k] && filters[k] !== ''
        );
        const fileName = hasActiveFilter
            ? `data-pengabdian-${dataTypeSlug}_filtered_${today}.xlsx`
            : `data-pengabdian-${dataTypeSlug}_${today}.xlsx`;

        await exportToExcel({
            apiUrl: `/api/pengabdian/export?${queryString}`,
            mapRow: (item) => ({
                'Tahun': item.thn_pelaksanaan_kegiatan || '-',
                'Judul': item.judul || '-',
                'Nama Pengusul': item.nama || '-',
                'Direktorat': 'Direktorat Riset, Teknologi, dan Pengabdian kepada Masyarakat',
                'Perguruan Tinggi': item.nama_institusi || '-',
                'Provinsi': item.prov_pt || '-',
                'Mitra': (item.kab_mitra && item.prov_mitra) ? `${item.kab_mitra}, ${item.prov_mitra}` : (item.kab_mitra || item.prov_mitra || '-'),
                'Skema': item.nama_skema || '-',
            }),
            sheetName: 'Pengabdian',
            fileName,
            colWidths: [
                { wch: 10 }, { wch: 60 }, { wch: 30 }, { wch: 45 }, { wch: 40 },
                { wch: 20 }, { wch: 35 }, { wch: 40 }
            ],
            onSuccess: (count) => {
                toast.success(`Berhasil export ${count} data ${label}!`, {
                    duration: 4000, position: 'top-right',
                    style: { background: '#16a34a', color: '#fff', fontWeight: '500' },
                });
            },
            onEmpty: () => toast.error(`Tidak ada data ${label} untuk diexport.`),
            onError: () => toast.error('Gagal mengexport data. Silakan coba lagi.', { duration: 4000, position: 'top-right' }),
            onFinally: () => {
                toast.dismiss(loadingToast);
                setIsLoading(false);
            },
        });
    };

    const [filteredResearchesForMap, setFilteredResearchesForMap] = useState(researches);

    useEffect(() => {
        setFilteredResearchesForMap(researches);
    }, [researches]);

    return (
        <MainLayout title={title || "Peta Persebaran Penelitian BIMA Indonesia - Pengabdian"}>
            <Toaster />
            <NavigationTabs activePage="pengabdian" />

            <div className="relative">
                <Suspense fallback={<MapLoading />}>
                    <MapContainer 
                        mapData={currentMapData} 
                        data={currentResearches}
                        displayMode={displayMode} 
                        onStatsChange={handleStatsChange}
                        filters={filters} 
                    />
                </Suspense>
                <MapControls
                    onSearch={handleSearch}
                    onDisplayModeChange={setDisplayMode}
                    onReset={handleReset}
                    onDownload={handleDownload}
                    downloadLabel="Excel"
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
                        <StatisticsCards stats={currentStats} />
                        <ResearchList
                            researches={currentResearches}
                            onAdvancedSearch={handleAdvancedSearch}
                            onFilteredResults={setCurrentResearches}
                            onItemClick={handleItemClick}
                            title="Daftar Pengabdian"
                            isFiltered={isFiltered}
                            isPenelitianPage={true}
                            customFieldOptions={[
                                { value: 'all', label: 'Semua' },
                                { value: 'title', label: 'Judul Pengabdian' },
                                { value: 'university', label: 'Universitas' },
                                { value: 'researcher', label: 'Peneliti' },
                                { value: 'field', label: 'Bidang Fokus' },
                                { value: 'skema', label: 'Skema' },
                            ]}
                        />
                    </div>
                </section>
            </div>
            <Suspense fallback={null}>
                <ResearchModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={selectedResearch}
                />
            </Suspense>
        </MainLayout>
    );
}


