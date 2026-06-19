import React from 'react';

export default function AuthHeader({ title = "Dashboard Admin", description = "Pemetaan Riset Berdampak" }) {
    return (
        <>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4 sm:mb-6 opacity-90">
                <img src="/assets/images/logo/Ditjen%20Risbang.png" alt="Ditjen Risbang" className="h-12 sm:h-16 object-contain max-w-full" />
            </div>
            <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">{title}</h1>
                <p className="text-sm sm:text-base text-slate-600">{description}</p>
            </div>
        </>
    );
}
