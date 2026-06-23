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

            {/* Delete Confirmation Modal */}
            {context.showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus Statement?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Statement ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => context.setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={context.confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
