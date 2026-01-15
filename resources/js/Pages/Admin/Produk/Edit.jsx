import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ item }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_produk: item.nama_produk || '',
        institusi: item.institusi || '',
        deskripsi_produk: item.deskripsi_produk || '',
        bidang: item.bidang || '',
        tkt: item.tkt || '',
        provinsi: item.provinsi || '',
        nama_inventor: item.nama_inventor || '',
        email_inventor: item.email_inventor || '',
        nomor_paten: item.nomor_paten || '',
        latitude: item.latitude || '',
        longitude: item.longitude || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.produk.update', item.id));
    };

    return (
        <AdminLayout title="Edit Produk">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Edit Data Produk</h2>
                        <p className="text-sm text-slate-600 mt-1">Update informasi produk inovasi</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Informasi Dasar */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Produk</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Produk <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_produk}
                                        onChange={e => setData('nama_produk', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama_produk ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                            }`}
                                        required
                                    />
                                    {errors.nama_produk && <p className="mt-1 text-sm text-red-600">{errors.nama_produk}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Deskripsi Produk
                                    </label>
                                    <textarea
                                        rows="6"
                                        value={data.deskripsi_produk}
                                        onChange={e => setData('deskripsi_produk', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    ></textarea>
                                    {errors.deskripsi_produk && <p className="mt-1 text-sm text-red-600">{errors.deskripsi_produk}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Bidang
                                        </label>
                                        <input
                                            type="text"
                                            value={data.bidang}
                                            onChange={e => setData('bidang', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.bidang && <p className="mt-1 text-sm text-red-600">{errors.bidang}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            TKT (Tingkat Kesiapterapan Teknologi)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.tkt}
                                            onChange={e => setData('tkt', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.tkt && <p className="mt-1 text-sm text-red-600">{errors.tkt}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informasi Inventor & Institusi */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Inventor & Institusi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Inventor
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_inventor}
                                        onChange={e => setData('nama_inventor', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.nama_inventor && <p className="mt-1 text-sm text-red-600">{errors.nama_inventor}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Inventor
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email_inventor}
                                        onChange={e => setData('email_inventor', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.email_inventor && <p className="mt-1 text-sm text-red-600">{errors.email_inventor}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Institusi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.institusi}
                                        onChange={e => setData('institusi', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.institusi ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                            }`}
                                        required
                                    />
                                    {errors.institusi && <p className="mt-1 text-sm text-red-600">{errors.institusi}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Provinsi
                                    </label>
                                    <input
                                        type="text"
                                        value={data.provinsi}
                                        onChange={e => setData('provinsi', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.provinsi && <p className="mt-1 text-sm text-red-600">{errors.provinsi}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nomor & Deskripsi Paten
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={data.nomor_paten}
                                        onChange={e => setData('nomor_paten', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    ></textarea>
                                    {errors.nomor_paten && <p className="mt-1 text-sm text-red-600">{errors.nomor_paten}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Koordinat */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Koordinat Lokasi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={e => setData('latitude', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={e => setData('longitude', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Link
                                href={route('admin.produk.index')}
                                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-6 py-2 rounded-lg text-white transition-colors ${processing
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {processing ? 'Menyimpan...' : 'Update Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
