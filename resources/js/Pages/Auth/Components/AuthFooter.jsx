import React from 'react';

export default function AuthFooter() {
    return (
        <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500">
            &copy; {new Date().getFullYear()} BIMA Indonesia - Ditjen Risbang.
        </p>
    );
}
