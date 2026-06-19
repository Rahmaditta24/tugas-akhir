import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import useHilirisasiForm from '../../Hooks/useHilirisasiForm';
import HilirisasiForm from '../../Components/HilirisasiForm';

export default function Create() {
    const context = useHilirisasiForm(null);

    return (
        <AdminLayout title="Tambah Data Hilirisasi">
            <HilirisasiForm context={context} />
        </AdminLayout>
    );
}
