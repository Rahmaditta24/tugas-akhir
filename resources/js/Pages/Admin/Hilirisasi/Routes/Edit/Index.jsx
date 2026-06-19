import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import useHilirisasiForm from '../../Hooks/useHilirisasiForm';
import HilirisasiForm from '../../Components/HilirisasiForm';

export default function Edit({ item, filters }) {
    const context = useHilirisasiForm(item);

    return (
        <AdminLayout title="Edit Data Hilirisasi">
            <HilirisasiForm context={context} />
        </AdminLayout>
    );
}
