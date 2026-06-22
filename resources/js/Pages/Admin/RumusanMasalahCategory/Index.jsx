import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/PageHeader';
import HeaderActions from '@/Components/Admin/HeaderActions';

import useRumusanMasalahCategory from './Hooks/useRumusanMasalahCategory';
import CategoryCard from './Components/CategoryCard';
import CategoryModals from './Components/CategoryModals';

export default function RumusanMasalahCategoryIndex({ categories }) {
    const context = useRumusanMasalahCategory();

    return (
        <AdminLayout title="Manajemen Kategori Rumusan Masalah" showHeaderTitle={false}>

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Halaman */}
                    <PageHeader
                        title="Kategori"
                        subtitle="Manajemen kategori rumusan masalah"
                        icon={<span className="text-xl">🏷️</span>}
                        actions={(
                            <HeaderActions
                                onCreate={context.openCreateModal}
                                createLabel="Tambah Kategori"
                            />
                        )}
                    />

                    {/* Layout Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {categories.map((category) => (
                            <CategoryCard 
                                key={category.id} 
                                category={category} 
                                context={context} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            <CategoryModals context={context} />
        </AdminLayout>
    );
}
