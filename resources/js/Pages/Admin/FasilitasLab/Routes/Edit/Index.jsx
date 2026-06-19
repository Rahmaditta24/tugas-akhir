import React from 'react';
import AdminLayout from '../../../../../Layouts/AdminLayout';
import useFasilitasLabForm from '../../Hooks/useFasilitasLabForm';
import FasilitasLabForm from '../../Components/FasilitasLabForm';

export default function Edit({ item, filters }) {
    const context = useFasilitasLabForm(item);

    return (
        <AdminLayout title="Edit Fasilitas Lab">
            <FasilitasLabForm context={context} />
        </AdminLayout>
    );
}
