import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CampusSelect from '../../../Components/CampusSelect';
import LocationSelect from '../../../Components/LocationSelect';
import MapLocationPicker from '../../../Components/MapLocationPicker';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        kode_universitas: '',
        institusi: '',
        kategori_pt: '',
        provinsi: '',
        kota: '',
        nama_laboratorium: '',
        latitude: '',
        longitude: '',
        total_jumlah_alat: '',
        nama_alat: '',
        deskripsi_alat: '',
        kontak: '',
    });

    const [localErrors, setLocalErrors] = useState({});

    const validateLatLng = (field, value) => {
        const num = parseFloat(value);
        let error = '';
        if (value && value !== '-') {
            if (isNaN(num)) {
                error = 'Harus berupa angka desimal. Contoh: -6.200000';
            } else if (field === 'latitude' && (num < -90 || num > 90)) {
                error = 'Latitude harus antara -90 dan 90.';
            } else if (field === 'longitude' && (num < -180 || num > 180)) {
                error = 'Longitude harus antara -180 dan 180.';
            }
        }
        setLocalErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const latOk = validateLatLng('latitude', data.latitude);
        const lngOk = validateLatLng('longitude', data.longitude);
        if (!latOk || !lngOk) return;
        post(route('admin.fasilitas-lab.store'));
    };

    return (
        <AdminLayout title="Tambah Fasilitas Lab">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Tambah Data Fasilitas Lab</h2>
                        <p className="text-sm text-slate-600 mt-1">Lengkapi informasi dasar fasilitas laboratorium baru</p>
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
                                        placeholder= "001034"
                                    />
                                    {errors.kode_universitas && <p className="mt-1 text-sm text-red-600">{errors.kode_universitas}</p>}
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
                                        Kategori PT
                                    </label>
                                    <select
                                        value={data.kategori_pt}
                                        onChange={e => setData('kategori_pt', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.kategori_pt ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                    >
                                        <option value="">Pilih Kategori PT</option>
                                        <option value="PTNBH">PTNBH</option>
                                        <option value="Non-PTNBH">Non-PTNBH</option>
                                    </select>
                                    {errors.kategori_pt && <p className="mt-1 text-sm text-red-600">{errors.kategori_pt}</p>}
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
                                        placeholder="Masukkan nama laboratorium..."
                                        required
                                    />
                                    {errors.nama_laboratorium && <p className="mt-1 text-sm text-red-600">{errors.nama_laboratorium}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Total Jumlah Alat
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.total_jumlah_alat}
                                        onChange={e => setData('total_jumlah_alat', e.target.value.replace(/\D/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.total_jumlah_alat ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Masukkan jumlah alat..."
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
                                        placeholder="08xxxxx"
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

                                <div className="md:col-span-2">
                                    <MapLocationPicker 
                                        latitude={data.latitude}
                                        longitude={data.longitude}
                                        onLatitudeChange={val => {
                                            setData('latitude', val);
                                            if (localErrors.latitude) validateLatLng('latitude', val);
                                        }}
                                        onLongitudeChange={val => {
                                            setData('longitude', val);
                                            if (localErrors.longitude) validateLatLng('longitude', val);
                                        }}
                                        latError={errors.latitude || localErrors.latitude}
                                        lngError={errors.longitude || localErrors.longitude}
                                        onLatBlur={e => validateLatLng('latitude', e.target.value)}
                                        onLngBlur={e => validateLatLng('longitude', e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-slate-400">Rentang valid: -90 hingga 90, -180 hingga 180 (Opsional)</p>
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama_alat ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="1. Alat 1&#10;2. Alat 2&#10;3. Alat 3"
                                    />
                                    {errors.nama_alat && <p className="mt-1 text-sm text-red-600">{errors.nama_alat}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Deskripsi Alat
                                    </label>
                                    <textarea
                                        value={data.deskripsi_alat}
                                        onChange={e => setData('deskripsi_alat', e.target.value)}
                                        rows="6"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.deskripsi_alat ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="1. Deskripsi 1&#10;2. Deskripsi 2&#10;3. Deskripsi 3"
                                    />
                                    {errors.deskripsi_alat && <p className="mt-1 text-sm text-red-600">{errors.deskripsi_alat}</p>}
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
                                {processing ? 'Menyimpan...' : 'Tambah Data'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
