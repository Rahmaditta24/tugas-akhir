import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger show animation
        const showTimer = setTimeout(() => setVisible(true), 10);
        
        // Auto hide after 5 seconds for errors, 3 seconds for others
        const duration = type === 'error' ? 5000 : 3500;
        const hideTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 400); 
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [onClose, type]);

    const colors = {
        success: {
            bg: 'bg-emerald-50/95',
            border: 'border-emerald-100',
            text: 'text-emerald-900',
            icon: 'bg-emerald-500',
            iconText: 'text-white'
        },
        error: {
            bg: 'bg-rose-50/95',
            border: 'border-rose-100',
            text: 'text-rose-900',
            icon: 'bg-rose-500',
            iconText: 'text-white'
        },
        info: {
            bg: 'bg-sky-50/95',
            border: 'border-sky-100',
            text: 'text-sky-900',
            icon: 'bg-sky-500',
            iconText: 'text-white'
        }
    };

    const c = colors[type] || colors.success;

    return (
        <div className={`fixed top-6 right-6 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
            visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-90'
        }`}>
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md min-w-[320px] max-w-[450px] ${c.bg} ${c.border} ${c.text}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${c.icon} ${c.iconText}`}>
                    {type === 'success' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                    {type === 'error' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>}
                    {type === 'info' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </div>
                
                <div className="flex-1">
                    <p className="text-[15px] font-semibold leading-tight tracking-tight">
                        {type === 'success' ? 'Berhasil' : type === 'error' ? 'Peringatan' : 'Informasi'}
                    </p>
                    <p className="text-[13.5px] mt-0.5 opacity-90 leading-relaxed line-clamp-3">
                        {message}
                    </p>
                </div>

                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onClose, 400);
                    }}
                    className="p-1 hover:bg-black/5 rounded-lg transition-colors group"
                >
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
