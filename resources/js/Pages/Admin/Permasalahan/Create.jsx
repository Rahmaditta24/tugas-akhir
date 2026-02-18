import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';
import LocationSelect from '../../../Components/LocationSelect';

export default function Create() {
    const [values, setValues] = useState({
        type: 'provinsi',
        provinsi: '',
        kabupaten_kota: '',
        jenis_permasalahan: '',
        nilai: '',
        satuan: '',
        metrik: '',
        tahun: new Date().getFullYear(),
    });
    const [processing, setProcessing] = useState(false);

    const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.permasalahan.store'), values, { onFinish: () => setProcessing(false) });
    };

    return (
        <AdminLayout title="">
            <PageHeader
                title="Tambah Permasalahan"
                subtitle="Input per sektor dan wilayah"
                icon={<span className="text-xl">⚠️</span>}
                actions={<Link href={route('admin.permasalahan.index')} className="px-3 py-2 text-slate-700 bg-slate-100 rounded-md">Kembali</Link>}
            />

            <form onSubmit={submit} className="glass-card rounded-xl p-6 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Tipe</label>
                        <select name="type" value={values.type} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="provinsi">Provinsi</option>
                            <option value="kabupaten">Kabupaten/Kota</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <LocationSelect
                            selectedProvince={values.provinsi}
                            selectedRegency={values.kabupaten_kota}
                            onProvinceChange={val => setValues(v => ({ ...v, provinsi: val }))}
                            onRegencyChange={val => setValues(v => ({ ...v, kabupaten_kota: val }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Jenis Permasalahan</label>
                        <input name="jenis_permasalahan" value={values.jenis_permasalahan} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="sampah/stunting/gizi_buruk/..." />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Nilai</label>
                        <input
                            name="nilai"
                            inputMode="decimal"
                            value={values.nilai}
                            onChange={e => setValues(v => ({ ...v, nilai: e.target.value.replace(/[^0-9.]/g, '') }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Satuan</label>
                        <input name="satuan" value={values.satuan} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    {values.type === 'provinsi' && (
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">Metrik</label>
                            <input name="metrik" value={values.metrik} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="opsional (mis. saidi/saifi)" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Tahun</label>
                        <input
                            name="tahun"
                            inputMode="numeric"
                            value={values.tahun}
                            onChange={e => setValues(v => ({ ...v, tahun: e.target.value.replace(/\D/g, '').substring(0, 4) }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">Simpan</button>
                    <Link href={route('admin.permasalahan.index')} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md">Batal</Link>
                </div>
            </form>
        </AdminLayout>
    );
}


