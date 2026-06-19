import React from 'react';
import { Link } from '@inertiajs/react';
import { colorClasses } from '../Constants/dashboardConstants';

export default function StatsGrid({ statsCards, loading }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card, index) => (
                <Link
                    key={index}
                    href={card.href}
                    className="glass-card rounded-xl hover:shadow-lg transition-all p-6 block group"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600 mb-2">
                                {card.title}
                            </p>
                            {loading ? (
                                <div className="h-8 w-32 rounded bg-slate-200 animate-pulse" />
                            ) : (
                                <p className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {card.value.toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>
                        <div className={`p-3 rounded-lg ${colorClasses[card.color]} group-hover:scale-110 transition-transform`}>
                            <span className="text-2xl">{card.icon}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
