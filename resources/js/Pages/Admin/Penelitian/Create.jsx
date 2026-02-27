import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CampusSelect from '../../../Components/CampusSelect';
import LocationSelect from '../../../Components/LocationSelect';

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
                                        Nama Peneliti <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama}
                                        onChange={e => setData('nama', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nama ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Nama lengkap peneliti"
                                        required
                                    />
                                    {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        NIDN
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.nidn}
                                        onChange={e => setData('nidn', e.target.value.replace(/\D/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nidn ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Nomor Induk Dosen Nasional"
                                    />
                                    {errors.nidn && <p className="mt-1 text-sm text-red-600">{errors.nidn}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        NUPTK
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.nuptk}
                                        onChange={e => setData('nuptk', e.target.value.replace(/\D/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.nuptk ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
                                    />
                                    {errors.nuptk && <p className="mt-1 text-sm text-red-600">{errors.nuptk}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Informasi Institusi */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Institusi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <CampusSelect
                                        value={data.institusi}
                                        onChange={val => setData('institusi', val)}
                                        errors={errors}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kode PT <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={data.kode_pt}
                                        onChange={e => setData('kode_pt', e.target.value.replace(/\D/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.kode_pt ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Contoh: 041012"
                                        required
                                    />
                                    {errors.kode_pt && <p className="mt-1 text-sm text-red-600">{errors.kode_pt}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Jenis PT <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.jenis_pt}
                                        onChange={e => setData('jenis_pt', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.jenis_pt ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    >
                                        <option value="">Pilih Jenis PT</option>
                                        <option value="Akademi">Akademi</option>
                                        <option value="Institut">Institut</option>
                                        <option value="Universitas">Universitas</option>
                                        <option value="Politeknik">Politeknik</option>
                                        <option value="Sekolah Tinggi">Sekolah Tinggi</option>
                                    </select>
                                    {errors.jenis_pt && <p className="mt-1 text-sm text-red-600">{errors.jenis_pt}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kategori PT <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.kategori_pt}
                                        onChange={e => setData('kategori_pt', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.kategori_pt ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    >
                                        <option value="">Pilih Kategori PT</option>
                                        <option value="PTN">PTN</option>
                                        <option value="PTS">PTS</option>
                                        <option value="PTNBH">PTNBH</option>
                                    </select>
                                    {errors.kategori_pt && <p className="mt-1 text-sm text-red-600">{errors.kategori_pt}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Institusi Pilihan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.institusi_pilihan}
                                        onChange={e => setData('institusi_pilihan', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.institusi_pilihan ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        placeholder="Contoh: LLDIKTI Wilayah IV"
                                        required
                                    />
                                    {errors.institusi_pilihan && <p className="mt-1 text-sm text-red-600">{errors.institusi_pilihan}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Klaster <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.klaster}
                                        onChange={e => setData('klaster', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.klaster ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                        required
                                    >
                                        <option value="">Pilih Klaster</option>
                                        <option value="Kelompok PT Binaan">Kelompok PT Binaan</option>
                                        <option value="Kelompok PT Madya">Kelompok PT Madya</option>
                                        <option value="Kelompok PT Mandiri">Kelompok PT Mandiri</option>
                                        <option value="Kelompok PT Pratama">Kelompok PT Pratama</option>
                                        <option value="Kelompok PT Utama">Kelompok PT Utama</option>
                                    </select>
                                    {errors.klaster && <p className="mt-1 text-sm text-red-600">{errors.klaster}</p>}
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
                                        required
                                        isRegencyOptional={true}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Latitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={data.pt_latitude}
                                        onChange={e => setData('pt_latitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.pt_latitude ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                            }`}
                                        placeholder="-6.200000"
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.pt_longitude ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                            }`}
                                        placeholder="106.816666"
                                        required
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.judul ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
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
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.skema ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            placeholder="Contoh: Penelitian Kerja Sama Luar Negeri - Nusantara"
                                        />
                                        {errors.skema && <p className="mt-1 text-sm text-red-600">{errors.skema}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tahun Pelaksanaan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.thn_pelaksanaan}
                                            onChange={e => setData('thn_pelaksanaan', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.thn_pelaksanaan ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                                }`}
                                            placeholder="2025"
                                            required
                                        />
                                        {errors.thn_pelaksanaan && <p className="mt-1 text-sm text-red-600">{errors.thn_pelaksanaan}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Bidang Fokus <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.bidang_fokus}
                                            onChange={e => setData('bidang_fokus', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.kategori_pt ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            required
                                        >
                                            <option value="">-- Pilih Bidang Fokus --</option>
                                            {[
                                                'Energi',
                                                'Kesehatan',
                                                'Pangan',
                                                'Material Maju',
                                                'Maritim',
                                                'Teknologi Informasi dan Komunikasi',
                                                'Sosial Humaniora',
                                                'Kemaritiman',
                                                'Teknologi Transportasi',
                                                'Produk Rekayasa Keteknikan',
                                                'Pertahanan dan Keamanan',
                                                'Lingkungan',
                                                'Ekonomi',
                                            ].map((val) => {
                                                const label = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                                                return <option key={val} value={val}>{label}</option>;
                                            })}
                                        </select>
                                        {errors.bidang_fokus && <p className="mt-1 text-sm text-red-600">{errors.bidang_fokus}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tema Prioritas <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.tema_prioritas}
                                            onChange={e => setData('tema_prioritas', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.tema_prioritas ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            required
                                        >
                                            <option value="">-- Pilih Tema Prioritas --</option>
                                            {[
                                                'Digital Economy',
                                                'Digitalisasi',
                                                'Ekonomi Biru',
                                                'Ekonomi Hijau',
                                                'Ekonomi Kreatif',
                                                'Elektrifikasi Transportasi',
                                                'Hilirisasi dan Industrialisasi',
                                                'Industri Manufaktur',
                                                'Kecerdasan Buatan',
                                                'Kemandirian Kesehatan',
                                                'Kesehatan',
                                                'Lainnya',
                                                'Lingkungan Hidup',
                                                'Material Maju',
                                                'Mineral',
                                                'Pariwisata',
                                                'Pengelolaan Sampah',
                                                'Semikonduktor',
                                                'Swasembada Air',
                                                'Swasembada Energi',
                                                'Swasembada Pangan',
                                                'Tidak Memilih',
                                            ].map((val) => {
                                                const label = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                                                return <option key={val} value={val}>{label}</option>;
                                            })}
                                        </select>
                                        {errors.tema_prioritas && <p className="mt-1 text-sm text-red-600">{errors.tema_prioritas}</p>}
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
                                className={`px-6 py-2 rounded-lg text-white transition-colors ${processing
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
