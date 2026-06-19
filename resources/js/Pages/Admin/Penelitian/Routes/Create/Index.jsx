import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import usePenelitianForm from '../../Hooks/usePenelitianForm';
import PenelitianForm from '../../Components/PenelitianForm';

export default function Create() {
    const context = usePenelitianForm(null);

    return (
        <AdminLayout title="Tambah Data Penelitian">
            <PenelitianForm context={context} />
        </AdminLayout>
    );
}
