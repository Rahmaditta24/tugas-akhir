export const barColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#14b8a6'];
export const pieColors = ['#ef4444', '#f59e0b'];

export const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
    teal: 'bg-teal-50 text-teal-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
};

export function getStatsCards(liveStats) {
    return [
        {
            title: 'Total Penelitian',
            value: liveStats?.penelitian || 0,
            icon: '🔬',
            color: 'blue',
            href: '/admin/penelitian'
        },
        {
            title: 'Total Pengabdian',
            value: liveStats?.pengabdian || 0,
            icon: '🤝',
            color: 'green',
            href: '/admin/pengabdian'
        },
        {
            title: 'Total Hilirisasi',
            value: liveStats?.hilirisasi || 0,
            icon: '🏭',
            color: 'purple',
            href: '/admin/hilirisasi'
        },
        {
            title: 'Total Produk',
            value: liveStats?.produk || 0,
            icon: '📦',
            color: 'orange',
            href: '/admin/produk'
        },
        {
            title: 'Fasilitas Lab',
            value: liveStats?.fasilitas || 0,
            icon: '🧪',
            color: 'teal',
            href: '/admin/fasilitas-lab'
        },
        {
            title: 'Permasalahan (Prov)',
            value: liveStats?.permasalahan_prov || 0,
            icon: '⚠️',
            color: 'red',
            href: '/admin/permasalahan',
            subtitle: 'Jumlah record permasalahan'
        },
        {
            title: 'Permasalahan (Kab)',
            value: liveStats?.permasalahan_kab || 0,
            icon: '⚠️',
            color: 'yellow',
            href: '/admin/permasalahan',
            subtitle: 'Jumlah record permasalahan'
        },
        {
            title: 'Rumusan Masalah Kategori',
            value: liveStats?.rumusan_masalah_category || 0,
            icon: '🗂️',
            color: 'blue',
            href: '/admin/rumusan-masalah/categories'
        },
    ];
}

export function labelJenis(key) {
    const map = {
        sampah: 'Sampah',
        stunting: 'Stunting',
        gizi_buruk: 'Gizi Buruk',
        krisis_listrik: 'Krisis Listrik',
        ketahanan_pangan: 'Ketahanan Pangan',
    };
    return map[key] || key;
}
