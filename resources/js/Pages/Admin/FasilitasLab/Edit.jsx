import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Edit({ item }) {
    const { data, setData, put, processing, errors } = useForm({
        kode_universitas: item?.kode_universitas || '',
        institusi: item?.institusi || '',
        kategori_pt: item?.kategori_pt || '',
        nama_laboratorium: item?.nama_laboratorium || '',
        provinsi: item?.provinsi || '',
        kota: item?.kota || '',
        latitude: item?.latitude || '',
        longitude: item?.longitude || '',
        total_jumlah_alat: item?.total_jumlah_alat || '',
        nama_alat: item?.nama_alat || '',
        deskripsi_alat: item?.deskripsi_alat || '',
        kontak: item?.kontak || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.fasilitas-lab.update', item.id));
    };

    return (
        <AdminLayout title="Edit Data Fasilitas Lab">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Edit Data Fasilitas Lab</h2>
                        <p className="text-sm text-slate-600 mt-1">Update informasi fasilitas laboratorium</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Informasi Dasar */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Dasar</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kode Universitas
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kode_universitas}
                                        onChange={e => setData('kode_universitas', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kategori PT
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kategori_pt}
                                        onChange={e => setData('kategori_pt', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
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

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Laboratorium <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_laboratorium}
                                        onChange={e => setData('nama_laboratorium', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama_laboratorium ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                            }`}
                                        required
                                    />
                                    {errors.nama_laboratorium && <p className="mt-1 text-sm text-red-600">{errors.nama_laboratorium}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Total Jumlah Alat
                                    </label>
                                    <input
                                        type="number"
                                        value={data.total_jumlah_alat}
                                        onChange={e => setData('total_jumlah_alat', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kontak
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kontak}
                                        onChange={e => setData('kontak', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lokasi */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Lokasi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kota/Kabupaten
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kota}
                                        onChange={e => setData('kota', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

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

                        {/* Detail Alat */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Detail Alat</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Alat
                                    </label>
                                    <textarea
                                        value={data.nama_alat}
                                        onChange={e => setData('nama_alat', e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="1. Alat 1&#10;2. Alat 2&#10;3. Alat 3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Deskripsi Alat
                                    </label>
                                    <textarea
                                        value={data.deskripsi_alat}
                                        onChange={e => setData('deskripsi_alat', e.target.value)}
                                        rows="6"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Deskripsi lengkap untuk setiap alat..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Link
                                href={route('admin.fasilitas-lab.index')}
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

