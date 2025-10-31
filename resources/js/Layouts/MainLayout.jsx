import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '../Components/Navbar';

export default function MainLayout({ children, title = 'Dashboard Pemetaan Riset Berdampak' }) {
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <div className="min-h-screen">
                <Navbar />
                <main className="min-h-screen lg:pt-24 pt-10 lg:px-0 px-4">
                    {children}
                </main>
            </div>
        </>
    );
}
