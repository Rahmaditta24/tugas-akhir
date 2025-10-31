import React from 'react';

export default function PageHeader({
    title,
    subtitle,
    actions = null,
    icon = null,
}) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">{title}</h2>
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="shrink-0 flex items-center gap-2">{actions}</div>
                )}
            </div>
        </div>
    );
}


