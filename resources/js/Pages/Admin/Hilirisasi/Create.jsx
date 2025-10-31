import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        tahun: '',
        id_proposal: '',
        judul: '',
        nama_pengusul: '',
        direktorat: '',
        perguruan_tinggi: '',
        pt_latitude: '',
        pt_longitude: '',
        provinsi: '',
        mitra: '',
        skema: '',
        luaran: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.hilirisasi.store'));
    };

    return (
        <AdminLayout title="Tambah Data Hilirisasi">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Form Data Hilirisasi</h2>
                        <p className="text-sm text-slate-600 mt-1">Isi form di bawah untuk menambah data hilirisasi baru</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Informasi Dasar */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Dasar</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Judul <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.judul}
                                        onChange={e => setData('judul', e.target.value)}
                                        rows="3"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.judul ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Judul lengkap hilirisasi"
                                        required
                                    />
                                    {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ID Proposal
                                    </label>
                                    <input
                                        type="number"
                                        value={data.id_proposal}
                                        onChange={e => setData('id_proposal', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="ID Proposal"
                                    />
                                    {errors.id_proposal && <p className="mt-1 text-sm text-red-600">{errors.id_proposal}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tahun
                                    </label>
                                    <input
                                        type="number"
                                        value={data.tahun}
                                        onChange={e => setData('tahun', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="2025"
                                    />
                                    {errors.tahun && <p className="mt-1 text-sm text-red-600">{errors.tahun}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Pengusul
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_pengusul}
                                        onChange={e => setData('nama_pengusul', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nama pengusul"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Direktorat
                                    </label>
                                    <input
                                        type="text"
                                        value={data.direktorat}
                                        onChange={e => setData('direktorat', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Direktorat"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Skema
                                    </label>
                                    <input
                                        type="text"
                                        value={data.skema}
                                        onChange={e => setData('skema', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Skema hilirisasi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Luaran
                                    </label>
                                    <input
                                        type="text"
                                        value={data.luaran}
                                        onChange={e => setData('luaran', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Luaran hilirisasi"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Informasi Institusi */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Institusi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Perguruan Tinggi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.perguruan_tinggi}
                                        onChange={e => setData('perguruan_tinggi', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.perguruan_tinggi ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Nama perguruan tinggi"
                                        required
                                    />
                                    {errors.perguruan_tinggi && <p className="mt-1 text-sm text-red-600">{errors.perguruan_tinggi}</p>}
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
                                        placeholder="Nama provinsi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Mitra
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mitra}
                                        onChange={e => setData('mitra', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nama mitra"
                                    />
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
                                        value={data.pt_latitude}
                                        onChange={e => setData('pt_latitude', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="-6.200000"
                                    />
                                    {errors.pt_latitude && <p className="mt-1 text-sm text-red-600">{errors.pt_latitude}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.pt_longitude}
                                        onChange={e => setData('pt_longitude', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="106.816666"
                                    />
                                    {errors.pt_longitude && <p className="mt-1 text-sm text-red-600">{errors.pt_longitude}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Link
                                href={route('admin.hilirisasi.index')}
                                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-6 py-2 rounded-lg text-white transition-colors ${
                                    processing
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
