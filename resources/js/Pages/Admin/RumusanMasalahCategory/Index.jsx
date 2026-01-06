import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';

export default function Index({ categories, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.rumusan-masalah.category.destroy', deleteId), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeleteId(null);
            },
        });
    };

    const handleEdit = (category) => {
        setEditForm({
            id: category.id,
            order_number: category.order_number,
            name: category.name,
            image: null,
            currentImage: category.image_url,
        });
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditForm({ ...editForm, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('order_number', editForm.order_number);
        formData.append('name', editForm.name);
        if (editForm.image) {
            formData.append('image', editForm.image);
        }
        formData.append('_method', 'PUT');

        router.post(route('admin.rumusan-masalah.category.update', editForm.id), formData, {
            onSuccess: () => {
                setEditForm(null);
                setErrors({});
                setImagePreview(null);
            },
            onError: (errors) => setErrors(errors),
        });
    };

    return (
        <AdminLayout title="Kategori Rumusan Masalah">
            <PageHeader
                title="Kategori Rumusan Masalah"
                subtitle="Kelola kategori rumusan masalah"
                icon={<span className="text-xl">📋</span>}
            />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                    {flash.error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Urutan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Icon
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Nama
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Jumlah Statement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {category.order_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {category.image_url ? (
                                            <img 
                                                src={category.image_url} 
                                                alt={category.name}
                                                className="w-10 h-10 object-contain"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                                                📋
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        <div>
                                            <div className="font-medium">{category.name}</div>
                                            <div className="text-slate-500 text-xs">{category.slug}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                            {category.statements_count || 0} statement
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.get(route('admin.rumusan-masalah.category.statements.index', category.slug))}
                                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
                                            >
                                                Lihat Statement
                                            </button>
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Belum ada kategori.
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Edit Kategori</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Urutan *
                                </label>
                                <input
                                    type="number"
                                    value={editForm.order_number}
                                    onChange={(e) => setEditForm({ ...editForm, order_number: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.order_number && (
                                    <p className="text-red-600 text-sm mt-1">{errors.order_number}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nama *
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Icon/Gambar
                                </label>
                                {(imagePreview || editForm.currentImage) && (
                                    <div className="mb-2">
                                        <img 
                                            src={imagePreview || editForm.currentImage} 
                                            alt="Preview" 
                                            className="w-20 h-20 object-contain border rounded p-1"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Biarkan kosong jika tidak ingin mengubah gambar
                                </p>
                                {errors.image && (
                                    <p className="text-red-600 text-sm mt-1">{errors.image}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditForm(null);
                                        setErrors({});
                                        setImagePreview(null);
                                    }}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
                        <p className="text-slate-600 mb-6">
                            Apakah Anda yakin ingin menghapus kategori ini? 
                            Semua statement dalam kategori ini juga akan terhapus.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}