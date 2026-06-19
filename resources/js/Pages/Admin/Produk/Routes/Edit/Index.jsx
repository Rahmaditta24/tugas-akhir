import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import useProdukForm from '../../Hooks/useProdukForm';
import ProdukForm from '../../Components/ProdukForm';

export default function Edit({ item }) {
    const form = useProdukForm({
        nama_produk: item.nama_produk || '',
        institusi: item.institusi || '',
        deskripsi_produk: item.deskripsi_produk || '',
        bidang: item.bidang || '',
        tkt: item.tkt || '',
        provinsi: item.provinsi || '',
        nama_inventor: item.nama_inventor || '',
        email_inventor: item.email_inventor || '',
        nomor_paten: item.nomor_paten || '',
        deskripsi_paten: item.deskripsi_paten || '',
        latitude: item.latitude || '',
        longitude: item.longitude || '',
    }, true);

    return (
        <AdminLayout title="Edit Produk">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Edit Data Produk</h2>
                        <p className="text-sm text-slate-600 mt-1">Update informasi produk inovasi</p>
                    </div>
                    <ProdukForm form={form} isEdit={true} itemData={item} />
                </div>
            </div>
        </AdminLayout>
    );
}
