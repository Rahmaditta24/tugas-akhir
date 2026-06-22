import React from 'react';
import { usePage } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';

import AdminLayout from '@/Layouts/AdminLayout';
import useProduk from './Hooks/useProduk';
import ProdukHeader from './Components/ProdukHeader';
import ProdukStats from './Components/ProdukStats';
import ProdukContent from './Components/ProdukContent';
import ProdukModals from './Components/ProdukModals';

export default function Index({ produk, stats = {}, filters = {} }) {
    const context = useProduk(produk, filters);

    return (
        <AdminLayout title="Produk" showHeaderTitle={false}>
            <Toaster position="top-right" />
            <div className="space-y-6">
                <ProdukHeader context={context} />
                <ProdukStats stats={stats} />
                <ProdukContent context={context} produk={produk} />
            </div>
            
            <ProdukModals context={context} produk={produk} />
        </AdminLayout>
    );
}
