import { useState, useEffect } from 'react';

export default function useRumusanMasalah({ categories }) {
    const [selectedCategory, setSelectedCategory] = useState(
        categories.length > 0 ? categories[0] : null
    );
    const [currentCategories, setCurrentCategories] = useState(categories);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Sinkronisasi state saat props berubah dari navigasi atau filter eksplisit
    useEffect(() => {
        setCurrentCategories(categories);
        // Jika data update dan belum ada kategori yang dipilih, pilih yang pertama
        if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSidebarOpen(false); // Tutup sidebar di mobile setelah memilih
    };

    return {
        selectedCategory,
        currentCategories,
        sidebarOpen, setSidebarOpen,
        handleCategoryClick
    };
}
