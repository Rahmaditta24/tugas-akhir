import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import NavigationTabs from '../../Components/NavigationTabs';
import useRumusanMasalah from './Hooks/useRumusanMasalah';
import { FloatingButton, MobileSidebar, DesktopSidebar } from './Components/Sidebars';
import CategoryDetail from './Components/CategoryDetail';

export default function RumusanMasalahIndex({ categories }) {
    const {
        selectedCategory,
        currentCategories,
        sidebarOpen, setSidebarOpen,
        handleCategoryClick
    } = useRumusanMasalah({ categories });

    return (
        <MainLayout
            title="Rumusan Masalah 8 Industri Strategis (Beta)"
            headerTitle={<>Rumusan Masalah 8 Industri Strategis <span className="font-normal text-gray-800">(Beta)</span></>}
        >
            <Head title="Rumusan Masalah 8 Industri Strategis" />

            <NavigationTabs activePage="rumusan-masalah" />

            <FloatingButton onClick={() => setSidebarOpen(true)} />

            <MobileSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                categories={currentCategories}
                selectedCategory={selectedCategory}
                onCategoryClick={handleCategoryClick}
            />

            <div className="w-full lg:max-w-[90%] mx-auto mb-10 mt-6 lg:px-0 px-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    <DesktopSidebar 
                        categories={currentCategories}
                        selectedCategory={selectedCategory}
                        onCategoryClick={handleCategoryClick}
                    />

                    <CategoryDetail selectedCategory={selectedCategory} />
                </div>
            </div>
        </MainLayout>
    );
}
