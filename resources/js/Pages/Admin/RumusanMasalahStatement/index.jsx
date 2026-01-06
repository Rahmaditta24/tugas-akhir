import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';

export default function Index({ category, statements, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [addForm, setAddForm] = useState({
        order_number: '',
        title: '',
        description: '',
    });
    const [errors, setErrors] = useState({});

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.rumusan-masalah.category.statements.destroy', {
            categorySlug: category.slug,
            statementId: deleteId
        }), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeleteId(null);
            },
        });
    };

    const handleEdit = (statement) => {
        setEditForm({
            id: statement.id,
            order_number: statement.order_number,
            title: statement.title,
            description: statement.description || '',
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        
        router.put(route('admin.rumusan-masalah.category.statements.update', {
            categorySlug: category.slug,
            statementId: editForm.id
        }), {
            order_number: editForm.order_number,
            title: editForm.title,
            description: editForm.description,
        }, {
            onSuccess: () => {
                setEditForm(null);
                setErrors({});
            },
            onError: (errors) => setErrors(errors),
        });
    };

    const handleStore = (e) => {
        e.preventDefault();
        
        router.post(route('admin.rumusan-masalah.category.statements.store', category.slug), addForm, {
            onSuccess: () => {
                setShowAddModal(false);
                setAddForm({
                    order_number: '',
                    title: '',
                    description: '',
                });
                setErrors({});
            },
            onError: (errors) => setErrors(errors),
        });
    };

    return (
        <AdminLayout title={`Statement - ${category.name}`}>
            <PageHeader
                title={`Statement Kategori: ${category.name}`}
                subtitle={`Kelola statement untuk kategori ${category.name}`}
                icon={<span className="text-xl">📝</span>}
            />

            {/* Breadcrumb */}
            <div className="mb-6">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <button
                                onClick={() => router.get(route('admin.rumusan-masalah.category.index'))}
                                className="text-slate-600 hover:text-blue-600"
                            >
                                Kategori
                            </button>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2 text-slate-400">/</span>
                                <span className="text-slate-900 font-medium">{category.name}</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

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
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Daftar Statement ({statements.length})
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            Nomor kategori: {category.order_number}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <span>➕</span>
                        Tambah Statement
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Nomor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Full Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Judul
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Deskripsi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {statements.map((statement) => (
                                <tr key={statement.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {statement.order_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-xs">
                                            {statement.full_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        <div className="font-medium">{statement.title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="max-w-xs truncate">
                                            {statement.description || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(statement)}
                                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(statement.id)}
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

                {statements.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Belum ada statement. Klik "Tambah Statement" untuk memulai.
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Tambah Statement</h3>
                        <form onSubmit={handleStore} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nomor Statement *
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-mono">
                                        {category.order_number}.
                                    </span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={addForm.order_number}
                                        onChange={(e) => setAddForm({ ...addForm, order_number: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: 1 atau 1.1"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Full number akan menjadi: {category.order_number}.{addForm.order_number || 'X'}
                                </p>
                                {errors.order_number && (
                                    <p className="text-red-600 text-sm mt-1">{errors.order_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Judul *
                                </label>
                                <input
                                    type="text"
                                    value={addForm.title}
                                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Judul statement"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={addForm.description}
                                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Deskripsi statement (opsional)"
                                    rows="4"
                                />
                                {errors.description && (
                                    <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setAddForm({
                                            order_number: '',
                                            title: '',
                                            description: '',
                                        });
                                        setErrors({});
                                    }}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Edit Statement</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nomor Statement *
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-mono">
                                        {category.order_number}.
                                    </span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editForm.order_number}
                                        onChange={(e) => setEditForm({ ...editForm, order_number: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Full number akan menjadi: {category.order_number}.{editForm.order_number || 'X'}
                                </p>
                                {errors.order_number && (
                                    <p className="text-red-600 text-sm mt-1">{errors.order_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Judul *
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4"
                                />
                                {errors.description && (
                                    <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditForm(null);
                                        setErrors({});
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
                            Apakah Anda yakin ingin menghapus statement ini?
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