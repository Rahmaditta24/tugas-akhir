import { useState, useEffect, useMemo } from 'react';

export default function useDashboard(stats) {
    const [liveStats, setLiveStats] = useState(stats || {});
    const [lastUpdated, setLastUpdated] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trend, setTrend] = useState([]); // titik in-memory sederhana untuk sparkline
    const [breakdown, setBreakdown] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchStats() {
            try {
                const res = await fetch('/admin/stats', { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted) {
                    setLiveStats(data);
                    setLastUpdated(data.timestamp || new Date().toISOString());
                    setLoading(false);
                    setTrend((prev) => {
                        const next = [...prev, (data.penelitian || 0) + (data.pengabdian || 0) + (data.hilirisasi || 0)];
                        return next.slice(-12); // keep last 12 points
                    });
                }
            } catch (_) { }
        }
        async function fetchBreakdown() {
            try {
                const res = await fetch('/admin/permasalahan-breakdown', { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted) setBreakdown(data.data || {});
            } catch (_) { }
        }
        fetchStats();
        fetchBreakdown();
        const id = setInterval(fetchStats, 30000); // 30s polling, no worker
        const id2 = setInterval(fetchBreakdown, 60000);
        return () => { isMounted = false; clearInterval(id); clearInterval(id2); };
    }, []);

    const chartData = useMemo(() => ([
        { name: 'Penelitian', value: liveStats.penelitian || 0 },
        { name: 'Pengabdian', value: liveStats.pengabdian || 0 },
        { name: 'Hilirisasi', value: liveStats.hilirisasi || 0 },
        { name: 'Produk', value: liveStats.produk || 0 },
        { name: 'Fasilitas', value: liveStats.fasilitas || 0 },
    ]), [liveStats]);

    const permasalahanData = useMemo(() => ([
        { name: 'Provinsi', value: liveStats.permasalahan_prov || 0 },
        { name: 'Kabupaten', value: liveStats.permasalahan_kab || 0 },
    ]), [liveStats]);

    return {
        liveStats,
        lastUpdated,
        loading,
        trend,
        breakdown,
        chartData,
        permasalahanData
    };
}
