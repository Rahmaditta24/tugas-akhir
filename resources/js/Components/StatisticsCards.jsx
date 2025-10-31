import React from 'react';

export default function StatisticsCards({ stats }) {
    const cards = [
        {
            title: 'Total Penelitian',
            value: stats?.totalResearch || 0,
            bgStyle: {
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), url('/assets/images/card/bg-total-penelitian.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
        },
        {
            title: 'Total Perguruan Tinggi',
            value: stats?.totalUniversities || 0,
            bgStyle: {
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), url('/assets/images/card/bg-total-pt.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
        },
        {
            title: 'Total Provinsi',
            value: stats?.totalProvinces || 0,
            bgStyle: {
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), url('/assets/images/card/bg-total-provinsi.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
        },
        {
            title: 'Bidang Fokus',
            value: stats?.totalFields || 0,
            bgStyle: {
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), url('/assets/images/card/bg-total-bidang-fokus.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
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
                            <p className="text-3xl font-bold drop-shadow-sm">{card.value.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
