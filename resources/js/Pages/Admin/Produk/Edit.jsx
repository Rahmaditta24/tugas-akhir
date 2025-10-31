import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/PageHeader';

export default function Edit({ produk }) {
    const [values, setValues] = useState({
        nama_produk: produk?.nama_produk || '',
        institusi: produk?.institusi || '',
        bidang: produk?.bidang || '',
        tkt: produk?.tkt || '',
    });
    const [processing, setProcessing] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(route('admin.produk.update', produk.id), values, { onFinish: () => setProcessing(false) });
    };

    const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

    return (
        <AdminLayout title="">
            <PageHeader
                title="Edit Produk"
                subtitle={produk?.nama_produk}
                icon={<span className="text-xl">📦</span>}
                actions={<Link href={route('admin.produk.index')} className="px-3 py-2 text-slate-700 bg-slate-100 rounded-md">Kembali</Link>}
            />

            <form onSubmit={submit} className="glass-card rounded-xl p-6 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm text-slate-600 mb-1">Nama Produk</label>
                        <input name="nama_produk" value={values.nama_produk} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Institusi</label>
                        <input name="institusi" value={values.institusi} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Bidang</label>
                        <input name="bidang" value={values.bidang} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">TKT</label>
                        <input name="tkt" value={values.tkt} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">Simpan</button>
                    <Link href={route('admin.produk.index')} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md">Batal</Link>
                </div>
            </form>
        </AdminLayout>
    );
}


