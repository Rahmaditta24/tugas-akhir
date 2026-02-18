import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CampusSelect from '../../../Components/CampusSelect';

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
        latitude: item.latitude || '',
        longitude: item.longitude || '',
    });

    useEffect(() => {
        // Fetch provinces from API
        fetch('/api/admin/produk/provinces')
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
                                        <select
                                            value={data.bidang}
                                            onChange={e => setData('bidang', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.bidang ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            required
                                        >
                                            <option value="">-- Pilih Bidang --</option>
                                            <option value="Agritech">Agritech</option>
                                            <option value="Bangunan Hemat Energi">Bangunan Hemat Energi</option>
                                            <option value="Biodekomposer">Biodekomposer</option>
                                            <option value="Desain / Industri Kreatif / Ekonomi Kreatif">Desain / Industri Kreatif / Ekonomi Kreatif</option>
                                            <option value="Digitalisasi">Digitalisasi</option>
                                            <option value="Digitalisasi: Ai dan Semikonduktor">Digitalisasi: Ai dan Semikonduktor</option>
                                            <option value="Education">Education</option>
                                            <option value="Edukasi Wisata Berbasis Riset">Edukasi Wisata Berbasis Riset</option>
                                            <option value="Edutech">Edutech</option>
                                            <option value="Ekonomi Hijau">Ekonomi Hijau</option>
                                            <option value="Ekonomi Kreatif">Ekonomi Kreatif</option>
                                            <option value="Elektronik dan Digital (Rekayasa Keteknikan)">Elektronik dan Digital (Rekayasa Keteknikan)</option>
                                            <option value="Energi">Energi</option>
                                            <option value="Farmasi">Farmasi</option>
                                            <option value="Fashion & Health Innovation">Fashion & Health Innovation</option>
                                            <option value="Health Tech">Health Tech</option>
                                            <option value="Hilirisasi dan Industrialisasi">Hilirisasi dan Industrialisasi</option>
                                            <option value="Ilmu Tekstik dan Mode">Ilmu Tekstik dan Mode</option>
                                            <option value="Idustri Kecantikan">Idustri Kecantikan</option>
                                            <option value="Idustri Kreatif">Idustri Kreatif</option>
                                            <option value="Inovasi Produk Kosmetik">Inovasi Produk Kosmetik</option>
                                            <option value="IT dengan Hardware">IT dengan Hardware</option>
                                            <option value="Kebijakan">Kebijakan</option>
                                            <option value="Kemandirian Sosial dan Budaya">Kemandirian Sosial dan Budaya</option>
                                            <option value="Kesehatan">Kesehatan</option>
                                            <option value="Kit Realtime Pcr Deteksi Babi untuk Uji Halal">Kit Realtime Pcr Deteksi Babi untuk Uji Halal</option>
                                            <option value="Komunikasi">Komunikasi</option>
                                            <option value="Kosmetik">Kosmetik</option>
                                            <option value="Lainnya">Lainnya</option>
                                            <option value="Limbah">Limbah</option>
                                            <option value="Lingkungan">Lingkungan</option>
                                            <option value="Makanan dan Minuman">Makanan dan Minuman</option>
                                            <option value="Maritim">Maritim</option>
                                            <option value="Marketplace Jasa">Marketplace Jasa</option>
                                            <option value="Material dan Manufaktur Maju">Material dan Manufaktur Maju</option>
                                            <option value="Material Ramah Lingkungan">Material Ramah Lingkungan</option>
                                            <option value="Mitigasi Bencana">Mitigasi Bencana</option>
                                            <option value="Oht Fitofarmaka">Oht Fitofarmaka</option>
                                            <option value="Pangan">Pangan</option>
                                            <option value="Pangan dan Obat2An">Pangan dan Obat2An</option>
                                            <option value="Pendidikan">Pendidikan</option>
                                            <option value="Pendidikan Abad-21">Pendidikan Abad-21</option>
                                            <option value="Pendidikan Berkualitas">Pendidikan Berkualitas</option>
                                            <option value="Pendidikan dan Lingkungan">Pendidikan dan Lingkungan</option>
                                            <option value="Pendidikan Inklusi">Pendidikan Inklusi</option>
                                            <option value="Pendidikan Karakter">Pendidikan Karakter</option>
                                            <option value="Pendidikan Lingkunan">Pendidikan Lingkunan</option>
                                            <option value="Pendidikan Masyarakat">Pendidikan Masyarakat</option>
                                            <option value="Peraturan">Peraturan</option>
                                            <option value="Perikanan">Perikanan</option>
                                            <option value="Pertahanan">Pertahanan</option>
                                            <option value="Pertanian">Pertanian</option>
                                            <option value="Produk Furniture Keperluan Manusia dalam Rumah">Produk Furniture Keperluan Manusia dalam Rumah</option>
                                            <option value="Psikologi">Psikologi</option>
                                            <option value="Publisher">Publisher</option>
                                            <option value="Rekayasa Keteknikan">Rekayasa Keteknikan</option>
                                            <option value="Sektor yang Mendukung Agenda Keberlanjutan">Sektor yang Mendukung Agenda Keberlanjutan</option>
                                            <option value="Seni Budaya">Seni Budaya</option>
                                            <option value="Startup">Startup</option>
                                            <option value="Teknik">Teknik</option>
                                            <option value="Teknik dan Rekayasa">Teknik dan Rekayasa</option>
                                            <option value="Teknologi">Teknologi</option>
                                            <option value="Teknologi dan Media">Teknologi dan Media</option>
                                            <option value="Teknologi Hijau">Teknologi Hijau</option>
                                            <option value="Teknologi Informasi">Teknologi Informasi</option>
                                            <option value="Teknologi Kesehatan">Teknologi Kesehatan</option>
                                            <option value="Teknologi Pendidikan">Teknologi Pendidikan</option>
                                            <option value="Textile Tourism">Textile Tourism</option>
                                            <option value="Transportasi">Transportasi</option>
                                            <option value="Virtual Reality">Virtual Reality</option>
                                            <option value="Yang Lain">Yang Lain</option>
                                        </select>
                                        {errors.bidang && <p className="mt-1 text-sm text-red-600">{errors.bidang}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            TKT (Tingkat Kesiapterapan Teknologi) <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.tkt}
                                            onChange={e => setData('tkt', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.tkt ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            required
                                        >
                                            <option value="">-- Pilih TKT --</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                        </select>
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
                                    <select
                                        value={data.provinsi}
                                        onChange={e => setData('provinsi', e.target.value)}
                                        disabled={loadingProvinces}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.provinsi ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    >
                                        <option value="">-- Pilih Provinsi --</option>
                                        {provinces.map((prov) => (
                                            <option key={prov} value={prov}>
                                                {prov}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.provinsi && <p className="mt-1 text-sm text-red-600">{errors.provinsi}</p>}
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
                                        placeholder="-6.200000"
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
                                        placeholder="106.816666"
                                        required
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
