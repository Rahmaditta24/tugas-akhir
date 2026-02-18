import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function RumusanMasalahCategoryIndex({ categories }) {
    // --- State Management ---
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingCategory, setEditingCategory] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Form Handling using Inertia useForm
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'POST',
        name: '',
        order_number: '',
        image: null,
    });

    // --- Handlers ---

    // Open Modal for Create
    const openCreateModal = () => {
        setModalMode('create');
        setEditingCategory(null);
        setImagePreview(null);
        reset(); // Clear form
        clearErrors();
        setData({
            _method: 'POST',
            name: '',
            order_number: '',
            image: null
        });
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const openEditModal = (category) => {
        setModalMode('edit');
        setEditingCategory(category);
        setOpenMenuId(null); // Close kebab menu
        clearErrors();

        // Set form data
        setData({
            _method: 'PUT', // Important for file upload spoofing
            name: category.name,
            order_number: category.order_number,
            image: null // Reset file input
        });

        // Set preview
        setImagePreview(category.image ? `/storage/${category.image}` : null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    // Handle Form Submit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalMode === 'create') {
            post(route('admin.rumusan-masalah.categories.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            // Edit Mode
            post(route('admin.rumusan-masalah.categories.update', editingCategory.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    // Handle Delete Category
    const { delete: destroy } = useForm();
    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            destroy(route('admin.rumusan-masalah.categories.destroy', id), {
                preserveScroll: true,
                onSuccess: () => setOpenMenuId(null)
            });
        } else {
            setOpenMenuId(null);
        }
    };

    // Toggle Kebab Menu
    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <AdminLayout title="Rumusan Masalah">
            <Head title="Manajemen Kategori Rumusan Masalah" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Page */}
                    <div className="flex justify-between items-center mb-6 px-1">
                        <h2 className="text-xl font-bold text-gray-900">Kategori</h2>
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-sm transition-colors duration-200 text-sm"
                        >
                            Tambah Kategori
                        </button>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center group">

                                {/* Kebab Menu (Options) */}
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleMenu(category.id); }}
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 focus:outline-none"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>

                                    {openMenuId === category.id && (
                                        <>
                                            <div className="fixed inset-0 z-10 cursor-default" onClick={() => setOpenMenuId(null)}></div>
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100 animate-fade-in-down">
                                                <button
                                                    onClick={() => openEditModal(category)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Edit Kategori
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    Hapus Kategori
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Icon Image */}
                                <div className="mb-4 w-24 h-24 flex items-center justify-center">
                                    {category.image ? (
                                        <img
                                            key={category.image}
                                            src={`/storage/${category.image}`}
                                            alt={category.name}
                                            className="max-w-full max-h-full object-contain drop-shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Content Info */}
                                <div className="w-full text-left mt-2">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {category.order_number}. {category.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 font-medium">
                                        {category.statements_count?.toLocaleString('id-ID')} Statements
                                    </p>

                                    <Link
                                        href={route('admin.rumusan-masalah.category.statements.index', category.slug)}
                                        className="inline-flex items-center text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200"
                                    >
                                        View Detail <span className="ml-1">→</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MODAL Form --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 md:p-0">
                    <div className="relative w-full max-w-lg max-h-full">
                        <div className="relative bg-white rounded-xl shadow-2xl">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                >
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-4 md:p-5">
                                <div className="grid gap-4 mb-4 grid-cols-1">
                                    {/* Nomor Urut */}
                                    <div className="col-span-1">
                                        <label htmlFor="order_number" className="block mb-2 text-sm font-medium text-gray-900">Nomor Urutan</label>
                                        <input
                                            type="number"
                                            name="order_number"
                                            id="order_number"
                                            value={data.order_number}
                                            onChange={(e) => setData('order_number', e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            placeholder="Contoh: 1"
                                            required
                                        />
                                        {errors.order_number && <p className="mt-1 text-sm text-red-600">{errors.order_number}</p>}
                                    </div>

                                    {/* Nama Kategori */}
                                    <div className="col-span-1">
                                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Nama Kategori</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            placeholder="Contoh: Pangan"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="col-span-1">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Logo</label>

                                        <div className="flex items-start gap-4">
                                            {/* Preview Box */}
                                            {imagePreview ? (
                                                <div className="relative group">
                                                    <div className="w-24 h-24 rounded-lg border border-gray-200 p-2 flex items-center justify-center bg-gray-50">
                                                        <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                            )}

                                            {/* Upload Button */}
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="image_upload"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="image_upload"
                                                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                                                >
                                                    {imagePreview ? 'Ganti Logo' : 'Upload Logo'}
                                                </label>
                                                {/* <button type="button" className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">Hapus</button> */}
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Format: png, jpg, webp. Maksimal 2MB.
                                                </p>
                                                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : (modalMode === 'create' ? 'Simpan' : 'Update')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
