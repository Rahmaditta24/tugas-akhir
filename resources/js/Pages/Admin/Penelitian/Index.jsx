import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Toaster } from 'react-hot-toast';
import usePenelitian from './Hooks/usePenelitian';

import PenelitianHeader from './Components/PenelitianHeader';
import PenelitianStats from './Components/PenelitianStats';
import PenelitianContent from './Components/PenelitianContent';
import PenelitianModals from './Components/PenelitianModals';

export default function Index({ penelitian, stats = {}, filters = {} }) {
    const context = usePenelitian(penelitian, filters);

    return (
        <AdminLayout title="Data Penelitian">
            <Toaster position="top-right" />
            <div className="space-y-6">
                <PenelitianHeader context={context} />
                <PenelitianStats stats={stats} />
                <PenelitianContent context={context} penelitian={penelitian} />
            </div>
            
            <PenelitianModals context={context} penelitian={penelitian} />
        </AdminLayout>
    );
}
