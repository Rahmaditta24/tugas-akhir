import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CampusSelect from '../../../Components/CampusSelect';
import LocationSelect from '../../../Components/LocationSelect';

// Helper for Title Case
const toTitleCase = (str) => {
    if (!str || str === 'null') return '';
    return String(str).replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
};

export default function Edit({ item, filters }) {
    const { data, setData, put, processing, errors } = useForm({
        tahun: String(item.tahun || ''),
        id_proposal: String(item.id_proposal || ''),
        judul: item.judul || '',
        nama_pengusul: toTitleCase(item.nama_pengusul),
        direktorat: item.direktorat || '',
        perguruan_tinggi: item.perguruan_tinggi || '',
        pt_latitude: item.pt_latitude ?? 0,
        pt_longitude: item.pt_longitude ?? 0,
        provinsi: item.provinsi || '',
        mitra: toTitleCase(item.mitra),
        skema: item.skema || '',
        luaran: item.luaran || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.hilirisasi.update', { hilirisasi: item.id, ...filters }));
    };

    return (
        <AdminLayout title="Edit Data Hilirisasi">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Edit Data Hilirisasi</h2>
                        <p className="text-sm text-slate-600 mt-1">Update informasi hilirisasi</p>
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 normal-case ${errors.judul ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                            }`}
                                        required
                                    />
                                    {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ID Proposal <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.id_proposal}
                                        onChange={e => setData('id_proposal', e.target.value.replace(/\D/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.id_proposal ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.id_proposal && <p className="mt-1 text-sm text-red-600">{errors.id_proposal}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tahun <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.tahun}
                                        onChange={e => setData('tahun', e.target.value.replace(/\D/g, '').substring(0, 4))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.tahun ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.tahun && <p className="mt-1 text-sm text-red-600">{errors.tahun}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Pengusul <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_pengusul}
                                        onChange={e => setData('nama_pengusul', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama_pengusul ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.nama_pengusul && <p className="mt-1 text-sm text-red-600">{errors.nama_pengusul}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Direktorat <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.direktorat}
                                        onChange={e => setData('direktorat', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.direktorat ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    >
                                        <option value="">-- null --</option>
                                        <option value="DIKSI">DIKSI</option>
                                        <option value="DIKTI">DIKTI</option>
                                    </select>
                                    {errors.direktorat && <p className="mt-1 text-sm text-red-600">{errors.direktorat}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Skema <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.skema}
                                        onChange={e => setData('skema', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.skema ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    >
                                        <option value="">-- Pilih Skema --</option>
                                        <option value="A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi">A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi</option>
                                        <option value="A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI">A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI</option>
                                        <option value="A3: Pengembangan produk inovasi bersama DUDI">A3: Pengembangan produk inovasi bersama DUDI</option>
                                        <option value="A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering">A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering</option>
                                        <option value="B1: Penyelesaian persoalan yang ada di masyarakat">B1: Penyelesaian persoalan yang ada di masyarakat</option>
                                        <option value="B2: Penyelesaian persoalan yang ada di Institusi Pemerintah">B2: Penyelesaian persoalan yang ada di Institusi Pemerintah</option>
                                        {data.skema && ![
                                            "A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi",
                                            "A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI",
                                            "A3: Pengembangan produk inovasi bersama DUDI",
                                            "A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering",
                                            "B1: Penyelesaian persoalan yang ada di masyarakat",
                                            "B2: Penyelesaian persoalan yang ada di Institusi Pemerintah"
                                        ].includes(data.skema) && (
                                                <option value={data.skema}>{data.skema}</option>
                                            )}
                                    </select>
                                    {errors.skema && <p className="mt-1 text-sm text-red-600">{errors.skema}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Luaran <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.luaran}
                                        onChange={e => setData('luaran', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.luaran ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.luaran && <p className="mt-1 text-sm text-red-600">{errors.luaran}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Informasi Institusi */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Institusi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <CampusSelect
                                        label="Perguruan Tinggi"
                                        name="perguruan_tinggi"
                                        value={data.perguruan_tinggi}
                                        onChange={val => setData('perguruan_tinggi', val)}
                                        errors={errors}
                                        required
                                    />
                                </div>

                                <div>
                                    <LocationSelect
                                        selectedProvince={data.provinsi}
                                        selectedRegency=""
                                        onProvinceChange={val => setData('provinsi', val)}
                                        onRegencyChange={() => { }}
                                        errors={errors}
                                        required
                                        hideRegency={true}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Mitra <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mitra}
                                        onChange={e => setData('mitra', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.mitra ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.mitra && <p className="mt-1 text-sm text-red-600">{errors.mitra}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Koordinat */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Koordinat Lokasi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Latitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={data.pt_latitude}
                                        onChange={e => setData('pt_latitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.pt_latitude ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.pt_latitude && <p className="mt-1 text-sm text-red-600">{errors.pt_latitude}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Longitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={data.pt_longitude}
                                        onChange={e => setData('pt_longitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.pt_longitude ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.pt_longitude && <p className="mt-1 text-sm text-red-600">{errors.pt_longitude}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Link
                                href={route('admin.hilirisasi.index', filters)}
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
