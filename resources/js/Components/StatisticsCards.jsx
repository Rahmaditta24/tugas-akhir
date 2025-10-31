import React from 'react';

export default function StatisticsCards({ stats }) {
    const cards = [
        {
            title: 'Total Penelitian',
            value: stats?.totalResearch || 0,
            bgStyle: { background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' },
        },
        {
            title: 'Total Perguruan Tinggi',
            value: stats?.totalUniversities || 0,
            bgStyle: { background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
        },
        {
            title: 'Total Provinsi',
            value: stats?.totalProvinces || 0,
            bgStyle: { background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
        },
        {
            title: 'Bidang Fokus',
            value: stats?.totalFields || 0,
            bgStyle: { background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="text-white rounded-lg shadow-lg h-24 bg-no-repeat bg-cover"
                    style={card.bgStyle}
                >
                    <div className="flex h-full rounded-lg">
                        <div className="py-5 px-5 flex flex-col gap-1">
                            <p className="text-md font-medium">{card.title}</p>
                            <p className="text-3xl font-bold">{card.value.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
