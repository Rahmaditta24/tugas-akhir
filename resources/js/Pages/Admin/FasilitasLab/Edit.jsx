import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CampusSelect from '../../../Components/CampusSelect';
import LocationSelect from '../../../Components/LocationSelect';

export default function Edit({ item, filters }) {
    const formatNumbered = (text) => {
        if (!text) return '';
        const items = text.split(/\r?\n|;/).map(i => i.replace(/^\d+[\.\)]\s*/, '').trim()).filter(i => i !== '');
        if (items.length <= 1) return items.join('');
        return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
    };

    const { data, setData, put, processing, errors } = useForm({
        kode_universitas: item?.kode_universitas || 'null',
        institusi: item?.institusi || 'null',
        kategori_pt: item?.kategori_pt || 'null',
        nama_laboratorium: item?.nama_laboratorium || 'null',
        provinsi: item?.provinsi || 'null',
        kota: item?.kota || 'null',
        latitude: item?.latitude || 'null',
        longitude: item?.longitude || 'null',
        total_jumlah_alat: item?.total_jumlah_alat || 'null',
        nama_alat: formatNumbered(item?.nama_alat || 'null'),
        deskripsi_alat: formatNumbered(item?.deskripsi_alat || 'null'),
        kontak: item?.kontak || 'null',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.fasilitas-lab.update', { fasilitas_lab: item.id, ...filters }));
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
                                        Kode Universitas <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.kode_universitas}
                                        onChange={e => setData('kode_universitas', e.target.value.replace(/\D/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.kode_universitas ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.kode_universitas && <p className="mt-1 text-sm text-red-600">{errors.kode_universitas}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kategori PT <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kategori_pt}
                                        onChange={e => setData('kategori_pt', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.kategori_pt ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.kategori_pt && <p className="mt-1 text-sm text-red-600">{errors.kategori_pt}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <CampusSelect
                                        value={data.institusi}
                                        onChange={val => setData('institusi', val)}
                                        errors={errors}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama Laboratorium <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_laboratorium}
                                        onChange={e => setData('nama_laboratorium', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama_laboratorium ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.nama_laboratorium && <p className="mt-1 text-sm text-red-600">{errors.nama_laboratorium}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Total Jumlah Alat <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.total_jumlah_alat}
                                        onChange={e => setData('total_jumlah_alat', e.target.value.replace(/\D/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.total_jumlah_alat ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.total_jumlah_alat && <p className="mt-1 text-sm text-red-600">{errors.total_jumlah_alat}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kontak
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.kontak}
                                        onChange={e => setData('kontak', e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lokasi */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Lokasi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <LocationSelect
                                        selectedProvince={data.provinsi}
                                        selectedRegency={data.kota}
                                        onProvinceChange={val => setData('provinsi', val)}
                                        onRegencyChange={val => setData('kota', val)}
                                        errors={errors}
                                        showRequiredIndicator={true}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Latitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={data.latitude}
                                        onChange={e => setData('latitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.latitude ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Longitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={data.longitude}
                                        onChange={e => setData('longitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.longitude ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
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
                                        Nama Alat <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.nama_alat}
                                        onChange={e => setData('nama_alat', e.target.value)}
                                        rows="4"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama_alat ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="1. Alat 1&#10;2. Alat 2&#10;3. Alat 3"
                                        required
                                    />
                                    {errors.nama_alat && <p className="mt-1 text-sm text-red-600">{errors.nama_alat}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Deskripsi Alat <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.deskripsi_alat}
                                        onChange={e => setData('deskripsi_alat', e.target.value)}
                                        rows="6"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.deskripsi_alat ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Deskripsi lengkap untuk setiap alat..."
                                        required
                                    />
                                    {errors.deskripsi_alat && <p className="mt-1 text-sm text-red-600">{errors.deskripsi_alat}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Link
                                href={route('admin.fasilitas-lab.index', filters)}
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
