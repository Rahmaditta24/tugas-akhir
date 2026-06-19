import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function usePermasalahan({
    jenisPermasalahan = [],
    allFilterOptions = {},
    filters: initialFilters = {},
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
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [provinces, setProvinces] = useState([]);

    useEffect(() => {
        axios.get('/api/provinces')
            .then(res => setProvinces(res.data.map(p => p.name)))
            .catch(() => {});
    }, []);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            ...initialFilters,
            dataType: initialFilters.dataType || prev.dataType,
            bubbleType: initialFilters.bubbleType || prev.bubbleType,
        }));
        setSearchTerm(initialFilters.search || '');
    }, [initialFilters]);

    const filterOptions = {
        dataType: jenisPermasalahan.length ? jenisPermasalahan : ['Sampah', 'Stunting', 'Gizi Buruk', 'Krisis Listrik', 'Ketahanan Pangan'],
        bubbleType: ['Penelitian', 'Pengabdian', 'Hilirisasi'],
        ...(allFilterOptions[filters.bubbleType] || {})
    };

    if (!filterOptions.provinsi || filterOptions.provinsi.length === 0) {
        filterOptions.provinsi = provinces;
    }

    const filterFields = [
        { label: 'Pilih Data', requestKey: 'dataType', optionKey: 'dataType', type: 'single', hideAllOption: true },
        { label: 'Pilih Jenis Bubble', requestKey: 'bubbleType', optionKey: 'bubbleType', type: 'single', hideAllOption: true },
    ];

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
        if (newFilters.bubbleType === 'Pengabdian' && filters.bubbleType !== 'Pengabdian') {
            newFilters.batch_type = 'Multitahun, Batch I & Batch II';
        }

        if (newFilters.bubbleType !== filters.bubbleType) {
            if (newFilters.bubbleType !== 'Pengabdian') {
                delete newFilters.batch_type;
            }

            const commonKeys = ['dataType', 'bubbleType', 'search'];
            Object.keys(newFilters).forEach(key => {
                if (!commonKeys.includes(key) && key !== 'batch_type') {
                    delete newFilters[key];
                }
            });
        }

        setFilters(newFilters);
        const params = { ...newFilters, search: searchTerm };
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) delete params[key];
        });

        const researchFilterKeys = ['bidang_fokus', 'tema_prioritas', 'provinsi', 'tahun', 'kategori_pt', 'klaster', 'skema', 'direktorat', 'batch_type'];
        const bubbleTypeChanged = newFilters.bubbleType !== filters.bubbleType;
        const researchFilterChanged = researchFilterKeys.some(k => (newFilters[k] || '') !== (filters[k] || ''));
        const mapDataAffected = bubbleTypeChanged || researchFilterChanged;

        router.get(window.location.pathname, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: mapDataAffected
                ? ['mapData', 'researches', 'stats', 'permasalahanStats', 'permasalahanKabupatenStats']
                : ['researches', 'stats', 'permasalahanStats', 'permasalahanKabupatenStats'],
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

    const handleItemClick = async (research) => {
        if (!research) return;
        if (research.judul || research.judul_kegiatan || research.nama_produk) {
            setSelectedResearch({ ...research, bubbleType: research.bubbleType || filters.bubbleType || 'Penelitian' });
            return;
        }
        const id = research.id || research._id;
        const type = String(research.bubbleType || filters.bubbleType || 'Penelitian').toLowerCase();
        try {
            const response = await fetch(`/api/research/${type}/${id}`);
            if (response.ok) {
                const detail = await response.json();
                setSelectedResearch({ ...detail, bubbleType: research.bubbleType || filters.bubbleType || 'Penelitian' });
            }
        } catch (error) {
            console.error('Error fetching research detail:', error);
        }
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    return {
        showBubbles, viewMode, filters, searchTerm,
        minPct, setMinPct, maxPct, setMaxPct,
        legendData, setLegendData,
        selectedMetrik, setSelectedMetrik,
        selectedResearch, setSelectedResearch,
        filterOptions, filterFields,
        handleSearch, handleReset, handleDownload,
        handleFilterChange, handleAdvancedSearch,
        handleToggleBubbles, handleItemClick, handleViewModeChange
    };
}
