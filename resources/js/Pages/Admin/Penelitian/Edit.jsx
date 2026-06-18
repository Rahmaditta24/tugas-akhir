import { useState } from 'react';
import CustomSelect from '../../../Components/CustomSelect';
import { BIDANG_FOKUS_OPTIONS, TEMA_PRIORITAS_OPTIONS } from '../../../Constants/options';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CampusSelect from '../../../Components/CampusSelect';
import LocationSelect from '../../../Components/LocationSelect';
import MapLocationPicker from '../../../Components/MapLocationPicker';

// Helper untuk Title Case
const toTitleCase = (str) => {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
};

export default function Edit({ item, filters }) {
    const { data, setData, put, processing, errors } = useForm({
        nama: toTitleCase(item.nama || ''),
        nidn: item.nidn ?? 0,
        nuptk: item.nuptk ?? 0,
        institusi: item.institusi || '',
        pt_latitude: item.pt_latitude ?? 0,
        pt_longitude: item.pt_longitude ?? 0,
        kode_pt: item.kode_pt || '',
        jenis_pt: item.jenis_pt || '',
        kategori_pt: item.kategori_pt || '',
        institusi_pilihan: item.institusi_pilihan || '',
        klaster: item.klaster || '',
        provinsi: toTitleCase(item.provinsi || ''),
        kota: toTitleCase(String(item.kota || '').trim().replace(/^kab\.\s*/i, 'Kabupaten ').replace(/^kab\s+/i, 'Kabupaten ').replace(/\s+/g, ' ')),
        judul: item.judul || '',
        skema: item.skema || '',
        thn_pelaksanaan: item.thn_pelaksanaan ?? 0,
        bidang_fokus: item.bidang_fokus || '',
        tema_prioritas: (!item.tema_prioritas || String(item.tema_prioritas).toLowerCase() === 'nan' || item.tema_prioritas === 'null') ? 'Tidak Memilih' : item.tema_prioritas,
    });

    // State untuk validasi lokal lat/lng
    const [localErrors, setLocalErrors] = useState({});

    const validateLatLng = (field, value) => {
        const num = parseFloat(value);
        let error = '';
        if (value === '' || value === '-') {
            error = 'Field ini wajib diisi.';
        } else if (isNaN(num)) {
            error = 'Harus berupa angka desimal. Contoh: -6.200000';
        } else if (field === 'pt_latitude' && (num < -90 || num > 90)) {
            error = 'Latitude harus antara -90 dan 90.';
        } else if (field === 'pt_longitude' && (num < -180 || num > 180)) {
            error = 'Longitude harus antara -180 dan 180.';
        }
        setLocalErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validasi lat/lng sebelum submit
        const latOk = validateLatLng('pt_latitude', data.pt_latitude);
        const lngOk = validateLatLng('pt_longitude', data.pt_longitude);
        if (!latOk || !lngOk) return;
        put(route('admin.penelitian.update', { penelitian: item.id, ...filters }));
    };

    return (
        <AdminLayout title="Edit Data Penelitian">
            <div className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-slate-800">Edit Data Penelitian</h2>
                        <p className="text-sm text-slate-600 mt-1">Update informasi penelitian</p>
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
                                        placeholder="-"
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
                                        placeholder="-"
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
                                        required
                                    />
                                    {errors.kode_pt && <p className="mt-1 text-sm text-red-600">{errors.kode_pt}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Jenis PT <span className="text-red-500">*</span>
                                    </label>
                                    <CustomSelect
    value={data.jenis_pt}
    onChange={val => setData('jenis_pt', val)}
    options={["Akademi", "Institut", "Universitas", "Politeknik", "Sekolah Tinggi", { value: data.jenis_pt, label: "{data.jenis_pt} (Data Lama)" }]}
    placeholder={"-- null --"}
    error={false}
    disabled={false}
    
/>
                                    {errors.jenis_pt && <p className="mt-1 text-sm text-red-600">{errors.jenis_pt}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Kategori PT <span className="text-red-500">*</span>
                                    </label>
                                    <CustomSelect
    value={data.kategori_pt}
    onChange={val => setData('kategori_pt', val)}
    options={["PTN", "PTS", "PTNBH", { value: data.kategori_pt, label: "{data.kategori_pt}" }]}
    placeholder={"-- null --"}
    error={false}
    disabled={false}
    
/>
                                    {errors.kategori_pt && <p className="mt-1 text-sm text-red-600">{errors.kategori_pt}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Institusi Pilihan <span className="text-red-500">*</span>
                                    </label>
                                    <CustomSelect
    value={data.institusi_pilihan}
    onChange={val => setData('institusi_pilihan', val)}
    options={[
                                            'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 
                                            'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'
                                        ]}
    placeholder="Pilih Institusi"
    error={false}
    
/>
                                    {errors.institusi_pilihan && <p className="mt-1 text-sm text-red-600">{errors.institusi_pilihan}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Klaster <span className="text-red-500">*</span>
                                    </label>
                                    <CustomSelect
    value={data.klaster}
    onChange={val => setData('klaster', val)}
    options={["Kelompok PT Binaan", "Kelompok PT Madya", "Kelompok PT Mandiri", "Kelompok PT Pratama", "Kelompok PT Utama"]}
    placeholder={"-- null --"}
    error={false}
    disabled={false}
    
/>
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

                                <MapLocationPicker 
                                    latitude={data.pt_latitude}
                                    longitude={data.pt_longitude}
                                    onLatitudeChange={val => {
                                        setData('pt_latitude', val);
                                        if (localErrors.pt_latitude) validateLatLng('pt_latitude', val);
                                    }}
                                    onLongitudeChange={val => {
                                        setData('pt_longitude', val);
                                        if (localErrors.pt_longitude) validateLatLng('pt_longitude', val);
                                    }}
                                    latError={errors.pt_latitude || localErrors.pt_latitude}
                                    lngError={errors.pt_longitude || localErrors.pt_longitude}
                                    onLatBlur={e => validateLatLng('pt_latitude', e.target.value)}
                                    onLngBlur={e => validateLatLng('pt_longitude', e.target.value)}
                                />
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
                                            required
                                        />
                                        {errors.thn_pelaksanaan && <p className="mt-1 text-sm text-red-600">{errors.thn_pelaksanaan}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Bidang Fokus <span className="text-red-500">*</span>
                                        </label>
                                        <CustomSelect
    value={data.bidang_fokus}
    onChange={val => setData('bidang_fokus', val)}
    options={BIDANG_FOKUS_OPTIONS}
    placeholder="-- null --"
    error={false}
    
/>
                                        {errors.bidang_fokus && <p className="mt-1 text-sm text-red-600">{errors.bidang_fokus}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Tema Prioritas <span className="text-red-500">*</span>
                                        </label>
                                        <CustomSelect
    value={data.tema_prioritas}
    onChange={val => setData('tema_prioritas', val)}
    options={TEMA_PRIORITAS_OPTIONS}
    placeholder="-- Pilih Tema Prioritas --"
    error={false}
    
/>
                                        {errors.tema_prioritas && <p className="mt-1 text-sm text-red-600">{errors.tema_prioritas}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t">
                            <Link
                                href={route('admin.penelitian.index', filters)}
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
