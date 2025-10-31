import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        nidn: '',
        nuptk: '',
        institusi: '',
        pt_latitude: '',
        pt_longitude: '',
        kode_pt: '',
        jenis_pt: '',
        kategori_pt: '',
        institusi_pilihan: '',
        klaster: '',
        provinsi: '',
        kota: '',
        judul: '',
        skema: '',
        thn_pelaksanaan: '',
        bidang_fokus: '',
        tema_prioritas: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.penelitian.store'));
    };

    return (
        <AdminLayout title="Tambah Data Penelitian">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Form Data Penelitian</h2>
                        <p className="text-sm text-slate-600 mt-1">Isi form di bawah untuk menambah data penelitian baru</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Informasi Peneliti */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Peneliti</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Peneliti
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama}
                                        onChange={e => setData('nama', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.nama ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Nama lengkap peneliti"
                                    />
                                    {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        NIDN
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nidn}
                                        onChange={e => setData('nidn', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nomor NIDN"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        NUPTK
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nuptk}
                                        onChange={e => setData('nuptk', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nomor NUPTK"
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
                                        Institusi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.institusi}
                                        onChange={e => setData('institusi', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.institusi ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Nama institusi/universitas"
                                        required
                                    />
                                    {errors.institusi && <p className="mt-1 text-sm text-red-600">{errors.institusi}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kode PT
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kode_pt}
                                        onChange={e => setData('kode_pt', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Kode Perguruan Tinggi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Jenis PT
                                    </label>
                                    <input
                                        type="text"
                                        value={data.jenis_pt}
                                        onChange={e => setData('jenis_pt', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Universitas/Institut/Sekolah Tinggi"
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
                                        placeholder="PTN/PTS"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Klaster
                                    </label>
                                    <input
                                        type="text"
                                        value={data.klaster}
                                        onChange={e => setData('klaster', e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Klaster perguruan tinggi"
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
                                        placeholder="Nama provinsi"
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
                                        placeholder="Nama kota/kabupaten"
                                    />
                                </div>

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

                        {/* Informasi Penelitian */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Penelitian</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Judul Penelitian <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.judul}
                                        onChange={e => setData('judul', e.target.value)}
                                        rows="3"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            errors.judul ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Judul lengkap penelitian"
                                        required
                                    />
                                    {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Skema
                                        </label>
                                        <input
                                            type="text"
                                            value={data.skema}
                                            onChange={e => setData('skema', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Skema penelitian"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tahun Pelaksanaan
                                        </label>
                                        <input
                                            type="number"
                                            value={data.thn_pelaksanaan}
                                            onChange={e => setData('thn_pelaksanaan', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="2025"
                                        />
                                        {errors.thn_pelaksanaan && <p className="mt-1 text-sm text-red-600">{errors.thn_pelaksanaan}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Bidang Fokus
                                        </label>
                                        <input
                                            type="text"
                                            value={data.bidang_fokus}
                                            onChange={e => setData('bidang_fokus', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Bidang fokus penelitian"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tema Prioritas
                                        </label>
                                        <input
                                            type="text"
                                            value={data.tema_prioritas}
                                            onChange={e => setData('tema_prioritas', e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tema prioritas penelitian"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Link
                                href={route('admin.penelitian.index')}
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
