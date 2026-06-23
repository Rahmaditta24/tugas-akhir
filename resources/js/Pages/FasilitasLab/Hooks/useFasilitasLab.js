import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function useFasilitasLab({ mapData, researches, stats, filters: initialFilters, filterOptions: serverFilterOptions }) {
    const [displayMode, setDisplayMode] = useState('peneliti');
    const [filters, setFilters] = useState(initialFilters);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [currentStats, setCurrentStats] = useState(stats);
    const [selectedLab, setSelectedLab] = useState(null);
    const [currentMapData, setCurrentMapData] = useState(mapData);
    const [currentResearches, setCurrentResearches] = useState(researches);

    useEffect(() => {
        setCurrentMapData(mapData);
        setCurrentResearches(researches);
        setCurrentStats(stats);
        setFilters(initialFilters);
        setSearchTerm(initialFilters.search || '');
    }, [mapData, researches, stats, initialFilters]);

    const filterOptions = {
        kampus_ptnbh: serverFilterOptions.kampus_ptnbh || ['Universitas Indonesia', 'Institut Teknologi Bandung'],
        provinsi: serverFilterOptions.provinsi || [],
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
            only: ['researches', 'stats', 'filters', 'isFiltered'],
            replace: true,
        });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('fasilitas.index'), { ...newFilters }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setFilters({});
        setSearchTerm('');
        router.get(route('fasilitas.index'));
    };

    const handleDownload = () => { };

    const handleCampusClick = (campusName) => {
        router.get(route('fasilitas.index'), { ...filters, institusi: campusName }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['researches', 'stats', 'isFiltered', 'filters'],
        });
    };

    return {
        displayMode, setDisplayMode,
        filters, searchTerm,
        currentStats, currentMapData, currentResearches,
        selectedLab, setSelectedLab,
        filterOptions, filterFields,
        handleSearch, handleAdvancedSearch, handleFilterChange,
        handleReset, handleDownload, handleCampusClick
    };
}
