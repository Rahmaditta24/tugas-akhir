import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Toaster } from 'react-hot-toast';
import usePengabdian from './Hooks/usePengabdian';

import PengabdianHeader from './Components/PengabdianHeader';
import PengabdianStats from './Components/PengabdianStats';
import PengabdianContent from './Components/PengabdianContent';
import PengabdianModals from './Components/PengabdianModals';

export default function Index({ pengabdian, stats = {}, filters = {} }) {
    const context = usePengabdian(pengabdian, filters);

    return (
        <AdminLayout title="Pengabdian" showHeaderTitle={false}>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <div className="space-y-6 max-w-full">
                <PengabdianHeader context={context} />
                <PengabdianStats stats={stats} />
                <PengabdianContent context={context} pengabdian={pengabdian} />
            </div>

            <PengabdianModals context={context} pengabdian={pengabdian} />
        </AdminLayout>
    );
}
