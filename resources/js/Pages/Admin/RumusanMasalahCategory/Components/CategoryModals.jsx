import React from 'react';

export default function CategoryModals({ context }) {
    const {
        isModalOpen, modalMode, closeModal, handleSubmit, data, setData, errors, processing,
        imagePreview, handleImageChange,
        showDeleteModal, setShowDeleteModal, confirmDelete, categoryToDelete
    } = context;

    return (
        <>
            {/* --- Form MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 md:p-0">
                    <div className="relative w-full max-w-lg max-h-full">
                        <div className="relative bg-white rounded-xl shadow-2xl">
                            {/* Header Modal */}
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

                            {/* Bodi Modal */}
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

                                    {/* Upload Logo */}
                                    <div className="col-span-1">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Logo</label>

                                        <div className="flex items-start gap-4">
                                            {/* Kotak Pratinjau */}
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

                                            {/* Tombol Upload */}
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
            
            {/* --- MODAL KONFIRMASI HAPUS --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Konfirmasi Hapus
                            </h3>
                            <p className="text-gray-600 mb-8">
                                Apakah Anda yakin ingin menghapus kategori <span className="font-semibold text-gray-800">{categoryToDelete?.name}</span> ini?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                    }}
                                    className="px-6 py-2 bg-[#e2e8f0] text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-2 bg-[#c53030] text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
