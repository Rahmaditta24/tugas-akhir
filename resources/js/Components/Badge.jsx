import React from 'react';

const colorMap = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
    green: 'bg-green-50 text-green-700 border-green-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    red: 'bg-red-50 text-red-700 border-red-200/60',
    teal: 'bg-teal-50 text-teal-700 border-teal-200/60',
};

export default function Badge({ children, color = 'slate', className = '' }) {
    const classes = colorMap[color] || colorMap.slate;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${classes} ${className}`}>
            {children}
        </span>
    );
}


