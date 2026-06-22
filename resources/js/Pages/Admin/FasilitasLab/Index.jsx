import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Toaster } from 'react-hot-toast';
import useFasilitasLab from './Hooks/useFasilitasLab';

import FasilitasLabHeader from './Components/FasilitasLabHeader';
import FasilitasLabStats from './Components/FasilitasLabStats';
import FasilitasLabContent from './Components/FasilitasLabContent';
import FasilitasLabModals from './Components/FasilitasLabModals';

export default function Index({ fasilitasLab, stats = {}, filters = {} }) {
    const context = useFasilitasLab(fasilitasLab, filters);

    return (
        <AdminLayout title="Fasilitas Lab" showHeaderTitle={false}>
            <Toaster position="top-right" />
            <div className="space-y-6 max-w-full">
                <FasilitasLabHeader context={context} />
                <FasilitasLabStats stats={stats} fasilitasLab={fasilitasLab} />
                <FasilitasLabContent context={context} fasilitasLab={fasilitasLab} />
            </div>
            
            <FasilitasLabModals context={context} fasilitasLab={fasilitasLab} />
        </AdminLayout>
    );
}
