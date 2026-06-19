import React from 'react';
import { Link } from '@inertiajs/react';
import CampusSelect from '@/Components/CampusSelect';
import LocationSelect from '@/Components/LocationSelect';
import MapLocationPicker from '@/Components/MapLocationPicker';
import CustomSelect from '@/Components/CustomSelect';

export default function HilirisasiForm({ context }) {
    const {
        data, setData,
        processing, errors,
        localErrors, validateLatLng,
        handleSubmit,
        isEdit
    } = context;

    return (
        <div className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {isEdit ? 'Edit Data Hilirisasi' : 'Form Data Hilirisasi'}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        {isEdit ? 'Perbarui informasi data hilirisasi' : 'Isi form di bawah untuk menambah data hilirisasi baru'}
                    </p>
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
                                    placeholder="Judul lengkap hilirisasi"
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
                                    onChange={e => setData('id_proposal', e.target.value.replace(/\\D/g, ''))}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.id_proposal ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                    placeholder="ID Proposal"
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
                                    onChange={e => setData('tahun', e.target.value.replace(/\\D/g, '').substring(0, 4))}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.tahun ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                    placeholder="2025"
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
                                    placeholder="Nama pengusul"
                                    required
                                />
                                {errors.nama_pengusul && <p className="mt-1 text-sm text-red-600">{errors.nama_pengusul}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Direktorat <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={data.direktorat}
                                    onChange={val => setData('direktorat', val)}
                                    options={["DIKSI", "DIKTI", "Direktorat Hilirisasi dan Kemitraan"]}
                                    placeholder={"-- Pilih Direktorat --"}
                                    error={false}
                                    disabled={false}
                                />
                                {errors.direktorat && <p className="mt-1 text-sm text-red-600">{errors.direktorat}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Skema <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={data.skema}
                                    onChange={val => setData('skema', val)}
                                    options={["A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi", "A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI", "A3: Pengembangan produk inovasi bersama DUDI", "A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering", "B1: Penyelesaian persoalan yang ada di masyarakat", "B2: Penyelesaian persoalan yang ada di Institusi Pemerintah", { value: "Penyelesaian persoalan yang ada di masyarakat atau Institusi Pemerintah (termasuk kegiatan pengabdian masyarakat, penyusunan naskah akademik, kebijakan, rekomendasi, dan bentuk penyelesaian lainnya)", label: "Penyelesaian persoalan yang ada di masyarakat atau Institusi Pemerintah" }, { value: "Penyediaan jasa, tenaga ahli, dan produk kepakaran perguruan tinggi untuk Dunia Usaha Dunia Industri (DUDI) / masyarakat (termasuk bentuk kegiatan pelatihan, pembinaan, dan bentuk jasa/produk lainnya)", label: "Penyediaan jasa, tenaga ahli, dan produk kepakaran perguruan tinggi" }, { value: "Adopsi atau difusi, hilirisasi, komersialisasi produk, purwarupa, teknologi, kebijakan (termasuk mini-plant, teaching factory, teaching industry) untuk memenuhi kebutuhan mitra", label: "Adopsi atau difusi, hilirisasi, komersialisasi produk" }, { value: "Pembentukan atau penguatan research and innovation center atau pusat unggulan teknologi (Centre of Excellence/CoE) bersama DUDI untuk menjadi pusat kajian atau riset untuk pengembangan DUDI atau untuk penyelesaian permasalahan DUDI", label: "Pembentukan atau penguatan research and innovation center" }, { value: "Penerapan rencana bisnis dan business model canvas (BMC) untuk Startup (termasuk UMKM) yang dibangun oleh perguruan tinggi bekerja sama dengan DUDI maupun oleh mahasiswa bekerja sama dengan alumni dan/atau DUDI dibawah supervisi dosen", label: "Penerapan rencana bisnis dan BMC Startup" }, "Dorongan Teknologi - Tim Pakar/Pengkaji", "Ajakan Industri PT - 1 Tahun", "Ajakan Industri PT - 2 Tahun", "Ajakan Industri PT - 3 Tahun", "Hilirisasi Inovasi Komersial", "Hilirisasi Inovasi Sosial"]}
                                    placeholder={"-- Pilih Skema --"}
                                    error={false}
                                    disabled={false}
                                />
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
                                    placeholder="Luaran hilirisasi"
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
                                    placeholder="Nama mitra"
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
                            className={`px-6 py-2 rounded-lg text-white transition-colors ${processing
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Data')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
