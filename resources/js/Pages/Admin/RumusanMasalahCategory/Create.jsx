import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';

export default function Create() {
    const [form, setForm] = useState({
        name: '',
        order_number: '',
        image: null,
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('order_number', form.order_number);
        if (form.image) {
            formData.append('image', form.image);
        }

        router.post(route('admin.rumusan-masalah.category.store'), formData, {
            onError: (errors) => setErrors(errors),
        });
    };

    return (
        <AdminLayout title="Tambah Kategori">
            <PageHeader
                title="Tambah Kategori"
                subtitle="Tambah kategori rumusan masalah baru"
                icon={<span className="text-xl">➕</span>}
            />

            <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nomor Urutan *
                        </label>
                        <input
                            type="number"
                            value={form.order_number}
                            onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: 1, 2, 3"
                            min="1"
                            required
                        />
                        {errors.order_number && (
                            <p className="text-red-600 text-sm mt-1">{errors.order_number}</p>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nama Kategori *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: Pangan, Kesehatan, Energi"
                            required
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            Slug akan dibuat otomatis dari nama kategori
                        </p>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Icon/Gambar *
                        </label>
                        <input
                            type="file"
                            accept="image/png,image/jpg,image/jpeg,image/webp"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Format: PNG, JPG, JPEG, WEBP. Maksimal 2MB
                        </p>
                        {errors.image && (
                            <p className="text-red-600 text-sm mt-1">{errors.image}</p>
                        )}
                        
                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm text-slate-600 mb-2">Preview:</p>
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-32 h-32 object-contain border border-slate-200 rounded-lg p-2 bg-slate-50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => router.get(route('admin.rumusan-masalah.category.index'))}
                            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}