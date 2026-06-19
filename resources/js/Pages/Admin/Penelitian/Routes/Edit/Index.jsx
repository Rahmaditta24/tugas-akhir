import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import usePenelitianForm from '../../Hooks/usePenelitianForm';
import PenelitianForm from '../../Components/PenelitianForm';

export default function Edit({ item, filters }) {
    const context = usePenelitianForm(item);

    return (
        <AdminLayout title="Edit Data Penelitian">
            <PenelitianForm context={context} />
        </AdminLayout>
    );
}
