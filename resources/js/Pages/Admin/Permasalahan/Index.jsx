import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ permasalahanProvinsi = [], permasalahanKabupaten = [], stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.permasalahan.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Permasalahan">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Data Permasalahan</h1>
                        <p className="text-slate-600 mt-1">Ringkasan per provinsi dan kabupaten</p>
                    </div>
                    <Link href={route('admin.permasalahan.create')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">+ Tambah Data</Link>
                </div>

                {/* Stats (with icons, consistent style) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h18M3 12h18M3 19h18" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Provinsi</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalProvinsi || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Kabupaten</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.totalKabupaten || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Semua</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.total || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari provinsi/kabupaten..." className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Cari</button>
                            {filters.search && (<Link href={route('admin.permasalahan.index')} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">Reset</Link>)}
                        </form>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        <div className="p-6">
                            <h3 className="font-semibold mb-3">Provinsi</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b"><tr><th className="px-4 py-2 text-left text-xs text-slate-500">Provinsi</th><th className="px-4 py-2 text-left text-xs text-slate-500">Jenis</th><th className="px-4 py-2 text-left text-xs text-slate-500">Nilai</th></tr></thead>
                                    <tbody className="divide-y">
                                        {permasalahanProvinsi.map((row, i)=> (
                                            <tr key={i} className="hover:bg-slate-50"><td className="px-4 py-2">{row.provinsi}</td><td className="px-4 py-2">{row.jenis_permasalahan}</td><td className="px-4 py-2">{row.nilai}</td></tr>
                                        ))}
                                        {permasalahanProvinsi.length === 0 && (<tr><td className="px-4 py-6 text-center text-slate-500" colSpan="3">Tidak ada data</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-6 border-t lg:border-t-0 lg:border-l">
                            <h3 className="font-semibold mb-3">Kabupaten/Kota</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b"><tr><th className="px-4 py-2 text-left text-xs text-slate-500">Kabupaten/Kota</th><th className="px-4 py-2 text-left text-xs text-slate-500">Provinsi</th><th className="px-4 py-2 text-left text-xs text-slate-500">Jenis</th><th className="px-4 py-2 text-left text-xs text-slate-500">Nilai</th></tr></thead>
                                    <tbody className="divide-y">
                                        {permasalahanKabupaten.map((row, i)=> (
                                            <tr key={i} className="hover:bg-slate-50"><td className="px-4 py-2">{row.kabupaten_kota}</td><td className="px-4 py-2">{row.provinsi}</td><td className="px-4 py-2">{row.jenis_permasalahan}</td><td className="px-4 py-2">{row.nilai}</td></tr>
                                        ))}
                                        {permasalahanKabupaten.length === 0 && (<tr><td className="px-4 py-6 text-center text-slate-500" colSpan="4">Tidak ada data</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}


