import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';

import useStatements from '../../Hooks/useStatements';
import StatementTable from '../../Components/StatementTable';
import StatementModal from '../../Components/StatementModal';

export default function StatementIndex({ category, statements }) {
    const context = useStatements(category);

    const breadcrumbs = [
        { label: 'Kategori', url: route('admin.rumusan-masalah.categories.index') },
        { label: category.name }
    ];

    return (
        <AdminLayout title="Rumusan Masalah">
            <Head title={`Statement: ${category.name}`} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Breadcrumb items={breadcrumbs} />

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{category.order_number}. {category.name}</h2>
                                    <p className="text-gray-500 text-sm mt-1">Daftar statement pada kategori ini.</p>
                                </div>
                                <button
                                    onClick={context.openCreateModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-sm transition-colors text-sm"
                                >
                                    Tambah Statement
                                </button>
                            </div>

                            <StatementTable statements={statements} context={context} />
                        </div>
                    </div>
                </div>
            </div>

            <StatementModal category={category} context={context} />
        </AdminLayout>
    );
}
