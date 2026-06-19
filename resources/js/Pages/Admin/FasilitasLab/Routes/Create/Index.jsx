import React from 'react';
import AdminLayout from '../../../../../Layouts/AdminLayout';
import useFasilitasLabForm from '../../Hooks/useFasilitasLabForm';
import FasilitasLabForm from '../../Components/FasilitasLabForm';

export default function Create() {
    const context = useFasilitasLabForm(null);

    return (
        <AdminLayout title="Tambah Fasilitas Lab">
            <FasilitasLabForm context={context} />
        </AdminLayout>
    );
}
