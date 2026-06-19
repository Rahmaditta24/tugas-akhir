import React from 'react';
import { Link } from '@inertiajs/react';
import { colorClasses } from '../Constants/dashboardConstants';

export default function SecondaryStats({ statsCards, loading }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card, index) => (
                <Link
                    key={index}
                    href={card.href}
                    className="glass-card rounded-xl hover:shadow-lg transition-all p-5 block group"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${colorClasses[card.color]} group-hover:scale-110 transition-transform shrink-0`}>
                            <span className="text-xl">{card.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-600 mb-1 truncate">
                                {card.title}
                            </p>
                            {card.subtitle && (
                                <p className="text-[10px] text-slate-400 mb-1 truncate">
                                    {card.subtitle}
                                </p>
                            )}
                            {loading ? (
                                <div className="h-6 w-20 rounded bg-slate-200 animate-pulse" />
                            ) : (
                                <p className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {card.value.toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
