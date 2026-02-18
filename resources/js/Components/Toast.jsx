import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: (
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    };

    const styles = {
        success: 'border-green-100 bg-green-50 text-green-800',
        error: 'border-red-100 bg-red-50 text-red-800',
        info: 'border-blue-100 bg-blue-50 text-blue-800'
    };

    return (
        <div className={`fixed top-5 right-5 z-[100] transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
            }`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${styles[type]}`}>
                <div className="flex-shrink-0 bg-white p-1 rounded-full shadow-sm">
                    {icons[type]}
                </div>
                <p className="text-sm font-medium pr-2">{message}</p>
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
