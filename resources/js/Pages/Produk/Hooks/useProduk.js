import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { exportToExcel } from '@/Utils/exportExcel';

export default function useProduk({ mapData, researches, stats, filters: initialFilters, filterOptions: serverFilterOptions }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(initialFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [currentStats, setCurrentStats] = useState(stats);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMapData, setCurrentMapData] = useState(mapData);
    const [currentResearches, setCurrentResearches] = useState(researches);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCurrentMapData(mapData);
        setCurrentResearches(researches);
        setCurrentStats(stats);
        setFilters(initialFilters);
        setSearchTerm(initialFilters.search || '');
    }, [mapData, researches, stats, initialFilters]);

    const filterOptions = {
        bidang: serverFilterOptions.bidang || ['Pangan', 'Energi', 'Kesehatan', 'Transportasi', 'Teknologi Informasi'],
        tkt: (serverFilterOptions.tkt || ['1', '2', '3', '4', '5', '6', '7', '8', '9']).map(String),
        provinsi: serverFilterOptions.provinsi || [],
    };

    const filterFields = [
        { label: 'Bidang', requestKey: 'bidang', optionKey: 'bidang' },
        { label: 'Tingkat Kesiapterapan Teknologi', requestKey: 'tkt', optionKey: 'tkt' },
        { label: 'Provinsi', requestKey: 'provinsi', optionKey: 'provinsi' },
    ];

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('produk.index'), { ...filters, search: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered']
        });
    };

    const handleAdvancedSearch = (queries) => {
        const params = { ...filters, queries: JSON.stringify(queries) };
        if (queries.every(q => !q.term)) delete params.queries;

        router.get(route('produk.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered']
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('produk.index'), { ...newFilters, search: searchTerm }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['mapData', 'researches', 'stats', 'filters', 'isFiltered']
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
        router.get(route('produk.index'));
    };

    const handleItemClick = async (research) => {
        if (!research?.id) {
            setSelectedResearch({
                ...research,
                isProduk: true,
                currentDataType: 'produk',
                tkt: research.tkt ?? '-',
                nama_inventor: research.nama_inventor || research.nama || research.researcher || '-',
                judul: research.judul || research.nama_produk || '-',
                institusi: research.institusi || research.perguruan_tinggi || '-',
                provinsi: research.provinsi || '-',
                bidang_fokus: research.bidang_fokus || research.bidang || '-',
                deskripsi_produk: research.deskripsi_produk || research.deskripsi || '-'
            });
            setIsModalOpen(true);
            return;
        }

        try {
            const response = await fetch(`/api/research/produk/${research.id}`);
            if (response.ok) {
                const detail = await response.json();
                setSelectedResearch({
                    ...detail,
                    isProduk: true,
                    currentDataType: 'produk',
                    deskripsi_produk: detail.deskripsi_produk || detail.deskripsi || research.deskripsi_produk || '-',
                    tkt: detail.tkt ?? research.tkt ?? '-',
                    nama_inventor: detail.nama_inventor || detail.nama || research.nama_inventor || '-',
                    judul: detail.judul || detail.nama_produk || research.judul || '-',
                    institusi: detail.institusi || detail.perguruan_tinggi || research.institusi || '-',
                    provinsi: detail.provinsi || research.provinsi || '-',
                    bidang_fokus: detail.bidang_fokus || detail.bidang || research.bidang_fokus || '-'
                });
            } else {
                setSelectedResearch({ 
                    ...research, 
                    isProduk: true, 
                    currentDataType: 'produk',
                    deskripsi_produk: research.deskripsi_produk || research.deskripsi || '-' 
                });
            }
        } catch {
            setSelectedResearch({ 
                ...research, 
                isProduk: true, 
                currentDataType: 'produk',
                deskripsi_produk: research.deskripsi_produk || research.deskripsi || '-' 
            });
        }
        setIsModalOpen(true);
    };

    const handleDownload = async () => {
        setIsLoading(true);
        const loadingToast = toast.loading('Sedang menyiapkan data Excel, mohon tunggu...', {
            position: 'top-right'
        });

        const queryString = new URLSearchParams(window.location.search).toString();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filterInfo = Object.keys(filters).length > 0 ? '_filtered' : '';

        await exportToExcel({
            apiUrl: `/api/produk/export?${queryString}`,
            mapRow: (item) => ({
                'Nama Produk': item.nama_produk || '-',
                'Institusi': item.institusi || '-',
                'Bidang': item.bidang || '-',
                'TKT': item.tkt || '-',
                'Provinsi': item.provinsi || '-',
                'Nama Inventor': item.nama_inventor || '-',
                'Email Inventor': item.email_inventor || '-',
                'Nomor Paten': item.nomor_paten ? item.nomor_paten.split(/[;.(,\s ]/)[0].trim() : '-',
                'Deskripsi': item.deskripsi_produk || '-',
            }),
            sheetName: 'Produk',
            fileName: `data-produk${filterInfo}_${timestamp}.xlsx`,
            colWidths: [
                { wch: 40 }, { wch: 40 }, { wch: 20 },
                { wch: 8 }, { wch: 20 }, { wch: 30 }, { wch: 30 },
                { wch: 20 }, { wch: 60 }
            ],
            onSuccess: (count) => {
                toast.success(`Berhasil export ${count} data produk!`, {
                    duration: 4000, position: 'top-right',
                    style: { background: '#16a34a', color: '#fff', fontWeight: '500' },
                });
            },
            onEmpty: () => toast.error('Tidak ada data untuk diexport.'),
            onError: () => toast.error('Gagal mengexport data. Silakan coba lagi.', { duration: 4000, position: 'top-right' }),
            onFinally: () => {
                toast.dismiss(loadingToast);
                setIsLoading(false);
            },
        });
    };

    return {
        displayMode, setDisplayMode,
        filters, searchTerm,
        currentStats, currentMapData, currentResearches, setCurrentResearches,
        selectedResearch, isModalOpen, setIsModalOpen,
        isLoading, filterOptions, filterFields,
        handleSearch, handleAdvancedSearch, handleFilterChange,
        handleStatsChange, handleReset, handleItemClick, handleDownload
    };
}
