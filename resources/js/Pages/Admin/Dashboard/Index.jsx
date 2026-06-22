import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/PageHeader';
import useDashboard from './Hooks/useDashboard';
import { getStatsCards } from './Constants/dashboardConstants';
import StatsGrid from './Components/StatsGrid';
import SecondaryStats from './Components/SecondaryStats';
import InfoCards from './Components/InfoCards';
import ChartsSection from './Components/ChartsSection';

export default function Index({ stats = {} }) {
    const {
        liveStats,
        lastUpdated,
        loading,
        breakdown,
        chartData,
        permasalahanData
    } = useDashboard(stats);

    const statsCards = getStatsCards(liveStats);

    return (
        <AdminLayout title="Dashboard Admin" showHeaderTitle={false}>
            <PageHeader
                title="Dashboard"
                subtitle="Statistik terkini dan ringkasan aktivitas"
                icon={<span className="text-xl">📊</span>}
            />
            
            <StatsGrid statsCards={statsCards.slice(0, 4)} loading={loading} />
            <SecondaryStats statsCards={statsCards.slice(4)} loading={loading} />
            <InfoCards liveStats={liveStats} />
            <ChartsSection 
                loading={loading}
                lastUpdated={lastUpdated}
                chartData={chartData}
                permasalahanData={permasalahanData}
                liveStats={liveStats}
                breakdown={breakdown}
            />
        </AdminLayout>
    );
}
