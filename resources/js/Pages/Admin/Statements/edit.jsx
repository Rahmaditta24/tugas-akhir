// resources/js/Pages/Admin/RumusanMasalahStatement/Edit.jsx
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';

export default function Edit({ item, categories }) {
    const [form, setForm] = useState({
        category_id: item.category_id || '',
        order_number: item.order_number || 1,
        full_number: item.full_number || '',
        title: item.title || '',
        description: item.description || '',
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        
        router.put(route('admin.rumusan-masalah-statement.update', item.id), form, {
            onError: (errors) => setErrors(errors),
        });
    };

    return (
        <AdminLayout title="">
            <PageHeader
                title="Edit Statement"
                subtitle={`Edit: ${item.title}`}
                icon={<span className="text-xl">✏️</span>}
            />

            <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Kategori *
                        </label>
                        <select
                            value={form.category_id}
                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            {categories && categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.order_number}. {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>
                        )}
                    </div>

                    {/* Order Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Urutan dalam Kategori *
                        </label>
                        <input
                            type="number"
                            value={form.order_number}
                            onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            required
                        />
                        {errors.order_number && (
                            <p className="text-red-600 text-sm mt-1">{errors.order_number}</p>
                        )}
                    </div>

                    {/* Full Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nomor Lengkap *
                        </label>
                        <input
                            type="text"
                            value={form.full_number}
                            onChange={(e) => setForm({ ...form, full_number: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {errors.full_number && (
                            <p className="text-red-600 text-sm mt-1">{errors.full_number}</p>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Judul Statement *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {errors.title && (
                            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}