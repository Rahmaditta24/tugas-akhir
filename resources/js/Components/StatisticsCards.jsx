import React, { useEffect, useState } from 'react';

function AnimatedCounter({ value, duration = 300 }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const start = displayValue;
        const end = value;
        const startTime = Date.now();
        const range = end - start;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutQuad)
            const easeProgress = 1 - (1 - progress) * (1 - progress);

            const current = Math.floor(start + range * easeProgress);
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayValue(end);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return <span>{displayValue.toLocaleString('id-ID')}</span>;
}

export default function StatisticsCards({ stats, labels = {} }) {
    const defaultLabels = {
        totalResearch: 'Total Penelitian',
        totalUniversities: 'Total Perguruan Tinggi',
        totalProvinces: 'Total Provinsi',
        totalFields: 'Bidang Fokus',
    };

    const finalLabels = { ...defaultLabels, ...labels };

    const cardConfigs = [
        {
            key: 'totalResearch',
            title: finalLabels.totalResearch,
            value: stats?.totalResearch || 0,
            bgStyle: {
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), url('/assets/images/card/bg-total-penelitian.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
        },
        {
            key: 'totalUniversities',
            title: finalLabels.totalUniversities,
            value: stats?.totalUniversities || 0,
            bgStyle: {
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), url('/assets/images/card/bg-total-pt.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
        },
        {
            key: 'totalProvinces',
            title: finalLabels.totalProvinces,
            value: stats?.totalProvinces || 0,
            bgStyle: {
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), url('/assets/images/card/bg-total-provinsi.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
        },
        {
            key: 'totalFields',
            title: finalLabels.totalFields,
            value: stats?.totalFields || 0,
            bgStyle: {
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), url('/assets/images/card/bg-total-bidang-fokus.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
        },
    ];

    // Filter out cards that have been explicitly disabled (set to null or false in labels)
    const activeCards = cardConfigs.filter(card => labels[card.key] !== null && labels[card.key] !== false);

    const gridCols = activeCards.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6 mb-12`}>
            {activeCards.map((card, index) => (
                <div
                    key={index}
                    className="text-white rounded-lg shadow-lg h-24 bg-no-repeat bg-cover"
                    style={card.bgStyle}
                >
                    <div className="flex h-full rounded-lg">
                        <div className="py-5 px-5 flex flex-col gap-1">
                            <p className="text-md font-medium">{card.title}</p>
                            <p className="text-3xl font-bold drop-shadow-sm">
                                <AnimatedCounter value={card.value} duration={300} />
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
