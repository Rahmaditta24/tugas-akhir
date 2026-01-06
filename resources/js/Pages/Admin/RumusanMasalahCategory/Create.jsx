import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function RumusanMasalahCategoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        order_number: '',
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.rumusan-masalah.categories.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Kategori Rumusan Masalah" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Tambah Kategori Baru</h2>
                                <Link
                                    href={route('admin.rumusan-masalah.category.index')}
                                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                    &larr; Kembali
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="max-w-xl">
                                {/* Order Number */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order_number">
                                        Nomor Urut
                                    </label>
                                    <input
                                        type="number"
                                        id="order_number"
                                        value={data.order_number}
                                        onChange={(e) => setData('order_number', e.target.value)}
                                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.order_number ? 'border-red-500' : ''
                                            }`}
                                        placeholder="Contoh: 1"
                                    />
                                    {errors.order_number && (
                                        <p className="text-red-500 text-xs italic mt-1">{errors.order_number}</p>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                        Nama Kategori
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : ''
                                            }`}
                                        placeholder="Contoh: Pangan"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Image */}
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                                        Icon / Gambar
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.image ? 'border-red-500' : ''
                                            }`}
                                    />
                                    <p className="text-gray-500 text-xs mt-1">Format: png, jpg, webp. Max: 2MB.</p>
                                    {errors.image && (
                                        <p className="text-red-500 text-xs italic mt-1">{errors.image}</p>
                                    )}

                                    {/* Preview */}
                                    {imagePreview && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 mb-1">Preview:</p>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-20 w-20 object-contain border border-gray-300 rounded p-1"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${processing ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}