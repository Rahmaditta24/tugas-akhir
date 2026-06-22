import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Toaster } from 'react-hot-toast';
import useHilirisasi from './Hooks/useHilirisasi';

import HilirisasiHeader from './Components/HilirisasiHeader';
import HilirisasiStats from './Components/HilirisasiStats';
import HilirisasiContent from './Components/HilirisasiContent';
import HilirisasiModals from './Components/HilirisasiModals';

export default function Index({ hilirisasi, stats = {}, filters = {} }) {
    const context = useHilirisasi(hilirisasi, filters);

    return (
        <AdminLayout title="Hilirisasi" showHeaderTitle={false}>
            <Toaster position="top-right" />
            <div className="space-y-6">
                <HilirisasiHeader context={context} />
                <HilirisasiStats stats={stats} />
                <HilirisasiContent context={context} hilirisasi={hilirisasi} />
            </div>
            
            <HilirisasiModals context={context} hilirisasi={hilirisasi} />
        </AdminLayout>
    );
}
