import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import LocationSelect from '../../../Components/LocationSelect';
import CampusSelect from '../../../Components/CampusSelect';

// Helper for Title Case
const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
};

export default function Edit({ item, filters }) {
    const { data, setData, put, processing, errors } = useForm({
        batch_type: (['batch_i', 'batch_ii', 'batch'].includes(item.batch_type) ? 'batch' : (['multitahun', 'multitahun_lanjutan'].includes(item.batch_type) ? 'multitahun' : (item.batch_type || 'multitahun'))),
        nama: toTitleCase(item.nama || ''),
        nidn: item.nidn ?? 0,
        nama_institusi: item.nama_institusi || '',
        kd_perguruan_tinggi: item.kd_perguruan_tinggi || '',
        wilayah_lldikti: item.wilayah_lldikti || '',
        ptn_pts: item.ptn_pts || '',
        klaster: item.klaster || '',
        prov_pt: item.prov_pt || '',
        kab_pt: item.kab_pt || '',
        judul: item.judul || '',
        nama_skema: item.nama_skema || '',
        nama_singkat_skema: item.nama_singkat_skema || '',
        thn_pelaksanaan_kegiatan: item.thn_pelaksanaan_kegiatan ?? 0,
        urutan_thn_kegitan: item.urutan_thn_kegitan || '',
        bidang_fokus: item.bidang_fokus || '',
        prov_mitra: item.prov_mitra || '',
        kab_mitra: item.kab_mitra || '',
        pt_latitude: item.pt_latitude ?? 0,
        pt_longitude: item.pt_longitude ?? 0,
        // Kosabangsa specific fields
        nama_pendamping: item.nama_pendamping || '',
        nidn_pendamping: item.nidn_pendamping ?? 0,
        kd_perguruan_tinggi_pendamping: item.kd_perguruan_tinggi_pendamping || '',
        institusi_pendamping: item.institusi_pendamping || '',
        lldikti_wilayah_pendamping: item.lldikti_wilayah_pendamping || '',
        jenis_wilayah_provinsi_mitra: item.jenis_wilayah_provinsi_mitra || '',
        bidang_teknologi_inovasi: item.bidang_teknologi_inovasi || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.pengabdian.update', { pengabdian: item.id, ...filters }));
    };

    React.useEffect(() => {
        if (data.nama_singkat_skema === 'PDB') {
            setData('nama_skema', 'Pemberdayaan Desa Binaan');
        }
    }, [data.nama_singkat_skema]);

    return (
        <AdminLayout title="Edit Data Pengabdian">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Edit Data Pengabdian</h2>
                        <p className="text-sm text-slate-600 mt-1">Update informasi pengabdian</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Ada beberapa kesalahan validasi. Silakan periksa kolom yang ditandai merah.
                                </p>
                                <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Kategori Data */}
                        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Klasifikasi Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Jenis Batch / Program <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.batch_type}
                                        onChange={e => setData('batch_type', e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        required
                                    >
                                        <option value="multitahun">Multitahun Lanjutan</option>
                                        <option value="batch">Batch I & II</option>
                                        <option value="kosabangsa">Kosabangsa</option>
                                    </select>
                                    {errors.batch_type && <p className="mt-1 text-sm text-red-600">{errors.batch_type}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Informasi Pengusul & Institusi */}
                        <div className="mb-8 overflow-hidden bg-white border border-slate-200 rounded-xl">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                                <span className="text-lg">🏫</span>
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Informasi Institusi & Pengusul</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Nama Ketua Pengusul <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nama}
                                            onChange={e => setData('nama', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.nama ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            required
                                        />
                                        {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">NIDN</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={data.nidn === 0 ? '' : data.nidn}
                                            onChange={e => setData('nidn', e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="Nomor NIDN"
                                        />
                                        {errors.nidn && <p className="mt-1 text-sm text-red-600">{errors.nidn}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Kode PT <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={data.kd_perguruan_tinggi}
                                            onChange={e => setData('kd_perguruan_tinggi', e.target.value.replace(/\D/g, ''))}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.kd_perguruan_tinggi ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            required
                                        />
                                        {errors.kd_perguruan_tinggi && <p className="mt-1 text-sm text-red-600">{errors.kd_perguruan_tinggi}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <CampusSelect
                                            value={data.nama_institusi}
                                            onChange={(val) => setData('nama_institusi', val)}
                                            label="Nama Institusi"
                                            name="nama_institusi"
                                            required
                                            errors={errors}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <LocationSelect
                                            selectedProvince={data.prov_pt}
                                            selectedRegency={data.kab_pt}
                                            onProvinceChange={val => setData('prov_pt', val)}
                                            onRegencyChange={val => setData('kab_pt', val)}
                                            errors={errors}
                                            required
                                            isRegencyOptional={true}
                                            showRequiredIndicator={true}
                                            provinceErrorKey="prov_pt"
                                            regencyErrorKey="kab_pt"
                                            label="Lokasi Perguruan Tinggi"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">LLDIKTI</label>
                                            <input
                                                type="text"
                                                value={data.wilayah_lldikti}
                                                onChange={e => setData('wilayah_lldikti', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PTN / PTS</label>
                                            <select
                                                value={data.ptn_pts}
                                                onChange={e => setData('ptn_pts', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                            >
                                                <option value="">-ilih-</option>
                                                <option value="PTN">PTN</option>
                                                <option value="PTS">PTS</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Klaster</label>
                                            <input
                                                type="text"
                                                value={data.klaster}
                                                onChange={e => setData('klaster', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Pengabdian */}
                        <div className="mb-8 overflow-hidden bg-white border border-slate-200 rounded-xl">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                                <span className="text-lg">📜</span>
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Detail Pelaksanaan Pengabdian</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Judul Pengabdian <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.judul}
                                            onChange={e => setData('judul', e.target.value)}
                                            rows="3"
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.judul ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            placeholder="Judul lengkap pengabdian"
                                            required
                                        />
                                        {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {data.batch_type !== 'kosabangsa' && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Nama Skema <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={data.nama_skema}
                                                        onChange={e => setData('nama_skema', e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        required
                                                    >
                                                        <option value="">-- Pilih Skema --</option>
                                                        {[
                                                            'KBM', 'PDB', 'PKM', 'PM-UPUD', 'PMM', 'PMP', 'PUK', 'PW',
                                                            'Pemberdayaan Desa Binaan',
                                                            'Pemberdayaan Kemitraan Masyarakat',
                                                            'Pemberdayaan Masyarakat oleh Mahasiswa',
                                                            'Pengabdian Masyarakat Pemula',
                                                            'Program Kemitraan Masyarakat Stimulusi'
                                                        ].map((val) => (
                                                            <option key={val} value={val}>{val}</option>
                                                        ))}
                                                        {data.nama_skema && ![
                                                            'KBM', 'PDB', 'PKM', 'PM-UPUD', 'PMM', 'PMP', 'PUK', 'PW',
                                                            'Pemberdayaan Desa Binaan',
                                                            'Pemberdayaan Kemitraan Masyarakat',
                                                            'Pemberdayaan Masyarakat oleh Mahasiswa',
                                                            'Pengabdian Masyarakat Pemula',
                                                            'Program Kemitraan Masyarakat Stimulusi',
                                                            'Kosabangsa'
                                                        ].includes(data.nama_skema) && (
                                                                <option value={data.nama_skema}>{data.nama_skema}</option>
                                                            )}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Singkatan Skema <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={data.nama_singkat_skema}
                                                        onChange={e => setData('nama_singkat_skema', e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                        required
                                                    >
                                                        <option value="">-- Pilih Singkatan --</option>
                                                        {[
                                                            'KBM', 'PDB', 'PKM', 'PM-UPUD', 'PMM', 'PMP', 'PUK', 'PW'
                                                        ].map((val) => (
                                                            <option key={val} value={val}>{val}</option>
                                                        ))}
                                                        {data.nama_singkat_skema && ![
                                                            'KBM', 'PDB', 'PKM', 'PM-UPUD', 'PMM', 'PMP', 'PUK', 'PW'
                                                        ].includes(data.nama_singkat_skema) && (
                                                                <option value={data.nama_singkat_skema}>{data.nama_singkat_skema}</option>
                                                            )}
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Tahun Pelaksanaan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={data.thn_pelaksanaan_kegiatan === 0 ? '' : data.thn_pelaksanaan_kegiatan}
                                                onChange={e => setData('thn_pelaksanaan_kegiatan', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.thn_pelaksanaan_kegiatan ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                                required
                                                placeholder="Contoh: 2025"
                                            />
                                        </div>

                                        {data.batch_type === 'multitahun' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Urutan Tahun</label>
                                                <input
                                                    type="text"
                                                    value={data.urutan_thn_kegitan}
                                                    onChange={e => setData('urutan_thn_kegitan', e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                    placeholder="Contoh: Tahun ke-1"
                                                />
                                            </div>
                                        )}

                                        <div className={data.batch_type !== 'multitahun' ? '' : 'md:col-span-2'}>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Bidang Fokus <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.bidang_fokus}
                                                onChange={e => setData('bidang_fokus', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.bidang_fokus ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                                required
                                                placeholder="Bidang fokus pengabdian"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.nama_skema === 'Kosabangsa' && (
                            <div className="mb-6 p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <span className="text-xl">🎓</span> Informasi Pendamping & Inovasi (Kosabangsa)
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Pendamping</label>
                                            <input
                                                type="text"
                                                value={data.nama_pendamping}
                                                onChange={e => setData('nama_pendamping', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                placeholder="Nama lengkap pendamping"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">NIDN Pendamping</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={data.nidn_pendamping}
                                                onChange={e => setData('nidn_pendamping', e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                placeholder="Nomor NIDN"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Institusi Pendamping</label>
                                            <input
                                                type="text"
                                                value={data.institusi_pendamping}
                                                onChange={e => setData('institusi_pendamping', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                placeholder="Nama perguruan tinggi pendamping"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Kode PT Pendamping</label>
                                                <input
                                                    type="text"
                                                    value={data.kd_perguruan_tinggi_pendamping}
                                                    onChange={e => setData('kd_perguruan_tinggi_pendamping', e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">LLDIKTI Pendamping</label>
                                                <input
                                                    type="text"
                                                    value={data.lldikti_wilayah_pendamping}
                                                    onChange={e => setData('lldikti_wilayah_pendamping', e.target.value)}
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Bidang Teknologi Inovasi</label>
                                            <input
                                                type="text"
                                                value={data.bidang_teknologi_inovasi}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setData(prev => ({
                                                        ...prev,
                                                        bidang_teknologi_inovasi: val,
                                                        bidang_fokus: val // Sync with bidang_fokus for Kosabangsa
                                                    }));
                                                }}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                placeholder="Contoh: Ekonomi Kreatif"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Wilayah Mitra</label>
                                            <input
                                                type="text"
                                                value={data.jenis_wilayah_provinsi_mitra}
                                                onChange={e => setData('jenis_wilayah_provinsi_mitra', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                placeholder="Contoh: Wilayah Rawan Bencana"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mitra & Lokasi */}
                        <div className="mb-10 overflow-hidden bg-white border border-slate-200 rounded-xl">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                                <span className="text-lg">📍</span>
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Informasi Mitra & Koordinat</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <LocationSelect
                                            selectedProvince={data.prov_mitra}
                                            selectedRegency={data.kab_mitra}
                                            onProvinceChange={val => setData('prov_mitra', val)}
                                            onRegencyChange={val => setData('kab_mitra', val)}
                                            errors={errors}
                                            isRegencyOptional={true}
                                            showRequiredIndicator={true}
                                            provinceErrorKey="prov_mitra"
                                            regencyErrorKey="kab_mitra"
                                            label="Lokasi Mitra"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Latitude <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={data.pt_latitude === 0 ? '' : data.pt_latitude}
                                            onChange={e => setData('pt_latitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.pt_latitude ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            required
                                            placeholder="-6.1234..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Longitude <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={data.pt_longitude === 0 ? '' : data.pt_longitude}
                                            onChange={e => setData('pt_longitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.pt_longitude ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            required
                                            placeholder="106.1234..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Link
                                href={route('admin.pengabdian.index', { ...filters, type: filters?.type || data.batch_type })}
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
