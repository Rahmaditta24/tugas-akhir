import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';

export default function Edit({ fasilitas }) {
    const [values, setValues] = useState({
        nama_laboratorium: fasilitas?.nama_laboratorium || '',
        institusi: fasilitas?.institusi || '',
        provinsi: fasilitas?.provinsi || '',
        jenis_laboratorium: fasilitas?.jenis_laboratorium || '',
        alamat: fasilitas?.alamat || '',
        kontak: fasilitas?.kontak || '',
    });
    const [processing, setProcessing] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(route('admin.fasilitas-lab.update', fasilitas.id), values, {
            onFinish: () => setProcessing(false),
        });
    };

    const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

    return (
        <AdminLayout title="">
            <PageHeader
                title="Edit Fasilitas Lab"
                subtitle={fasilitas?.nama_laboratorium}
                icon={<span className="text-xl">🧪</span>}
                actions={<Link href={route('admin.fasilitas-lab.index')} className="px-3 py-2 text-slate-700 bg-slate-100 rounded-md">Kembali</Link>}
            />

            <form onSubmit={submit} className="glass-card rounded-xl p-6 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Nama Laboratorium</label>
                        <input name="nama_laboratorium" value={values.nama_laboratorium} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Institusi</label>
                        <input name="institusi" value={values.institusi} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Provinsi</label>
                        <input name="provinsi" value={values.provinsi} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Jenis Laboratorium</label>
                        <input name="jenis_laboratorium" value={values.jenis_laboratorium} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm text-slate-600 mb-1">Alamat</label>
                        <input name="alamat" value={values.alamat} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm text-slate-600 mb-1">Kontak</label>
                        <input name="kontak" value={values.kontak} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">Simpan Perubahan</button>
                    <Link href={route('admin.fasilitas-lab.index')} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md">Batal</Link>
                </div>
            </form>
        </AdminLayout>
    );
}


