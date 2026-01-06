import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Breadcrumb from '../../../Components/Breadcrumb';

export default function RumusanMasalahStatementIndex({ category, statements }) {
    // --- State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingStatement, setEditingStatement] = useState(null);

    // --- Actions ---
    const { delete: destroy } = useForm();
    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus statement ini?')) {
            destroy(route('admin.rumusan-masalah.category.statements.destroy', [category.slug, id]));
        }
    };

    // --- Form Handling ---
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        order_number: '',
        title: '',
        description: ''
    });

    const openCreateModal = () => {
        setModalMode('create');
        setEditingStatement(null);
        clearErrors();
        reset();
        // Auto-suggest next order number? Maybe later.
        setData({
            order_number: '',
            title: '',
            description: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (statement) => {
        setModalMode('edit');
        setEditingStatement(statement);
        clearErrors();
        setData({
            order_number: statement.order_number,
            title: statement.title,
            description: statement.description || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalMode === 'create') {
            post(route('admin.rumusan-masalah.category.statements.store', category.slug), {
                onSuccess: () => closeModal()
            });
        } else {
            put(route('admin.rumusan-masalah.category.statements.update', [category.slug, editingStatement.id]), {
                onSuccess: () => closeModal()
            });
        }
    };

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
                                    onClick={openCreateModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-sm transition-colors text-sm"
                                >
                                    Tambah Statement
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm whitespace-nowrap">
                                    <thead className="uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Nomor</th>
                                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Judul</th>
                                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Deskripsi</th>
                                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Dibuat</th>
                                            {/* <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Diupdate</th> */}
                                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {statements.map((statement) => (
                                            <tr key={statement.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {statement.full_number}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={statement.title}>
                                                    {statement.title}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 max-w-md truncate" title={statement.description}>
                                                    {statement.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {statement.created_at}
                                                </td>
                                                {/* <td className="px-6 py-4 text-gray-500">
                                                    {statement.updated_at}
                                                </td> */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            className="text-amber-500 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded text-xs font-semibold"
                                                            onClick={() => openEditModal(statement)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(statement.id)}
                                                            className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-xs font-semibold"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {statements.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    Belum ada statement untuk kategori ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL Form --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 md:p-0">
                    <div className="relative w-full max-w-2xl max-h-full">
                        <div className="relative bg-white rounded-xl shadow-2xl">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'create' ? 'Tambah Statement' : 'Edit Statement'}
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
                                        <label htmlFor="order_number" className="block mb-2 text-sm font-medium text-gray-900">Nomor Statement (Desimal)</label>
                                        <div className="flex items-center">
                                            <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2.5 text-gray-500 font-bold">
                                                {category.order_number}.
                                            </span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="order_number"
                                                id="order_number"
                                                value={data.order_number}
                                                onChange={(e) => setData('order_number', e.target.value)}
                                                className="bg-white border border-gray-300 text-gray-900 text-base rounded-r-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                placeholder="Contoh: 1"
                                                required
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Nomor urut sub-poin (misal 1 untuk {category.order_number}.1)</p>
                                        {errors.order_number && <p className="mt-1 text-sm text-red-600">{errors.order_number}</p>}
                                    </div>

                                    {/* Judul */}
                                    <div className="col-span-1">
                                        <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">Judul Statement</label>
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            placeholder="Judul permasalahan..."
                                            required
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                    </div>

                                    {/* Deskripsi */}
                                    <div className="col-span-1">
                                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Deskripsi</label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            rows="4"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            placeholder="Penjelasan detail permasalahan..."
                                        ></textarea>
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
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