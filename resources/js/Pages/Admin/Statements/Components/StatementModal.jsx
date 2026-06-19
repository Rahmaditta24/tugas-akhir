import React from 'react';

export default function StatementModal({ category, context }) {
    const {
        isModalOpen, modalMode, closeModal, handleSubmit,
        data, setData, errors, processing
    } = context;

    if (!isModalOpen) return null;

    return (
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
    );
}
