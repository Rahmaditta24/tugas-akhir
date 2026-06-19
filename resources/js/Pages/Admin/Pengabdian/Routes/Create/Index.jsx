import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import usePengabdianForm from '../../Hooks/usePengabdianForm';
import PengabdianForm from '../../Components/PengabdianForm';

export default function Create() {
    const context = usePengabdianForm(null);

    return (
        <AdminLayout title="Tambah Data Pengabdian">
            <PengabdianForm context={context} />
        </AdminLayout>
    );
}
