import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import useProdukForm from '../../Hooks/useProdukForm';
import ProdukForm from '../../Components/ProdukForm';

export default function Create() {
    const form = useProdukForm();

    return (
        <AdminLayout title="Tambah Produk">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Tambah Data Produk</h2>
                        <p className="text-sm text-slate-600 mt-1">Inputkan informasi produk inovasi</p>
                    </div>
                    <ProdukForm form={form} isEdit={false} />
                </div>
            </div>
        </AdminLayout>
    );
}
