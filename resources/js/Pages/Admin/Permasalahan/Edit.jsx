import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';

export default function Edit({ permasalahan }) {
    const [values, setValues] = useState({
        type: permasalahan?.type || (permasalahan?.kabupaten_kota ? 'kabupaten' : 'provinsi'),
        provinsi: permasalahan?.provinsi || '',
        kabupaten_kota: permasalahan?.kabupaten_kota || '',
        jenis_permasalahan: permasalahan?.jenis_permasalahan || '',
        nilai: permasalahan?.nilai || '',
        satuan: permasalahan?.satuan || '',
        metrik: permasalahan?.metrik || '',
        tahun: permasalahan?.tahun || new Date().getFullYear(),
    });
    const [processing, setProcessing] = useState(false);

    const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(route('admin.permasalahan.update', permasalahan.id), values, { onFinish: () => setProcessing(false) });
    };

    return (
        <AdminLayout title="">
            <PageHeader
                title="Edit Permasalahan"
                subtitle={`${values.jenis_permasalahan} - ${values.provinsi}`}
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
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Provinsi</label>
                        <input name="provinsi" value={values.provinsi} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    {values.type === 'kabupaten' && (
                        <div className="sm:col-span-2">
                            <label className="block text-sm text-slate-600 mb-1">Kabupaten/Kota</label>
                            <input name="kabupaten_kota" value={values.kabupaten_kota} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Jenis Permasalahan</label>
                        <input name="jenis_permasalahan" value={values.jenis_permasalahan} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Nilai</label>
                        <input name="nilai" value={values.nilai} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
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
                        <input name="tahun" value={values.tahun} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
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


