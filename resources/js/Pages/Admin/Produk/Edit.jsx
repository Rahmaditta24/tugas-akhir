import { useState, useEffect } from 'react';
import CustomSelect from '../../../Components/CustomSelect';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CampusSelect from '../../../Components/CampusSelect';
import MapLocationPicker from '../../../Components/MapLocationPicker';
import { BIDANG_OPTIONS, TKT_OPTIONS } from '../../../Constants/options';

export default function Edit({ item }) {
    const [provinces, setProvinces] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);

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
        detail_paten: item.detail_paten || '',
        latitude: item.latitude || '',
        longitude: item.longitude || '',
    });

    useEffect(() => {
        // Ambil data provinsi dari API
        fetch('/admin/produk/provinces')
            .then(res => res.json())
            .then(data => {
                setProvinces(data);
                setLoadingProvinces(false);
            })
            .catch(err => {
                console.error('Error loading provinces:', err);
                setLoadingProvinces(false);
            });
    }, []);

    const [localErrors, setLocalErrors] = useState({});

    const validateLatLng = (field, value) => {
        const num = parseFloat(value);
        let error = '';
        if (value === '' || value === '-') {
            error = 'Field ini wajib diisi.';
        } else if (isNaN(num)) {
            error = 'Harus berupa angka desimal. Contoh: -6.200000';
        } else if (field === 'latitude' && (num < -90 || num > 90)) {
            error = 'Latitude harus antara -90 dan 90.';
        } else if (field === 'longitude' && (num < -180 || num > 180)) {
            error = 'Longitude harus antara -180 dan 180.';
        }
        setLocalErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const latOk = validateLatLng('latitude', data.latitude);
        const lngOk = validateLatLng('longitude', data.longitude);
        if (!latOk || !lngOk) return;
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
                        {/* Informasi Produk */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Produk</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nama <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_produk}
                                        onChange={e => setData('nama_produk', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama_produk ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Nama produk"
                                        required
                                    />
                                    {errors.nama_produk && <p className="mt-1 text-sm text-red-600">{errors.nama_produk}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Deskripsi Produk <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows="6"
                                        value={data.deskripsi_produk}
                                        onChange={e => setData('deskripsi_produk', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.deskripsi_produk ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Deskripsi lengkap produk"
                                        required
                                    ></textarea>
                                    {errors.deskripsi_produk && <p className="mt-1 text-sm text-red-600">{errors.deskripsi_produk}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Bidang <span className="text-red-500">*</span>
                                        </label>
                                        <CustomSelect
    value={data.bidang}
    onChange={val => setData('bidang', val)}
    options={BIDANG_OPTIONS}
    placeholder="-- Pilih Bidang --"
    error={false}
    
/>
                                        {errors.bidang && <p className="mt-1 text-sm text-red-600">{errors.bidang}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            TKT (Tingkat Kesiapterapan Teknologi) <span className="text-red-500">*</span>
                                        </label>
                                        <CustomSelect
    value={data.tkt}
    onChange={val => setData('tkt', val)}
    options={TKT_OPTIONS}
    placeholder="-- Pilih TKT --"
    error={false}
    
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
                                        Nama Inventor <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_inventor}
                                        onChange={e => setData('nama_inventor', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama_inventor ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Nama lengkap inventor"
                                        required
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email_inventor ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="email@example.com"
                                    />
                                    {errors.email_inventor && <p className="mt-1 text-sm text-red-600">{errors.email_inventor}</p>}
                                </div>

                                <div>
                                    <CampusSelect
                                        value={data.institusi}
                                        onChange={val => setData('institusi', val)}
                                        errors={errors}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nomor Paten
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nomor_paten}
                                        onChange={e => setData('nomor_paten', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nomor_paten ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Nomor paten"
                                    />
                                    {errors.nomor_paten && <p className="mt-1 text-sm text-red-600">{errors.nomor_paten}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Deskripsi Paten
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={data.detail_paten}
                                        onChange={e => setData('detail_paten', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.detail_paten ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Detail atau deskripsi paten"
                                    ></textarea>
                                    {errors.detail_paten && <p className="mt-1 text-sm text-red-600">{errors.detail_paten}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Lokasi */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Lokasi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Provinsi <span className="text-red-500">*</span>
                                    </label>
                                    <CustomSelect
    value={data.provinsi}
    onChange={val => setData('provinsi', val)}
    options={provinces}
    placeholder="-- Pilih Provinsi --"
    error={false}
    disabled={false}
    
/>
                                    {errors.provinsi && <p className="mt-1 text-sm text-red-600">{errors.provinsi}</p>}
                                </div>

                                <div className="md:col-span-3 mt-2">
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
