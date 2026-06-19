import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import usePengabdianForm from '../../Hooks/usePengabdianForm';
import PengabdianForm from '../../Components/PengabdianForm';

export default function Edit({ item, filters }) {
    const context = usePengabdianForm(item);

    return (
        <AdminLayout title="Edit Data Pengabdian">
            <PengabdianForm context={context} />
        </AdminLayout>
    );
}
