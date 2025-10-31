import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminTable from '../../../Components/AdminTable';
import PageHeader from '../../../Components/PageHeader';
import Badge from '../../../Components/Badge';

export default function Index({ permasalahanProvinsi = {}, permasalahanKabupaten = {}, stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const perPage = filters.perPage || 20;
    const sort = filters.sort || 'id';
    const direction = filters.direction || 'desc';
    const [activeTab, setActiveTab] = useState('provinsi');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.permasalahan.index'), { search, perPage, sort, direction }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="">
            <div className="space-y-6">
                <PageHeader
                    title="Data Permasalahan"
                    subtitle="Ringkasan per provinsi dan kabupaten"
                    icon={<span className="text-xl">⚠️</span>}
                    actions={<Link href={route('admin.permasalahan.create')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Tambah Data</Link>}
                />

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
                    <div className="p-6 border-b border-slate-200/60">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari provinsi/kabupaten..." className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Cari</button>
                            {filters.search && (<Link href={route('admin.permasalahan.index')} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">Reset</Link>)}
                        </form>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 pt-4">
                        <div className="inline-flex rounded-full border border-slate-200/60 bg-slate-50 p-1 mb-4">
                            <button onClick={() => setActiveTab('provinsi')} className={`px-4 py-1.5 text-sm rounded-full ${activeTab==='provinsi' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>Provinsi</button>
                            <button onClick={() => setActiveTab('kabupaten')} className={`px-4 py-1.5 text-sm rounded-full ${activeTab==='kabupaten' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>Kabupaten/Kota</button>
                        </div>

                        {/* Active table */}
                        {activeTab === 'provinsi' ? (
                            <>
                                <AdminTable
                                    striped
                                    columnFilterEnabled
                                    columns={[
                                        { key: 'provinsi', title: 'Provinsi' },
                                        { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{v}</Badge> },
                                        { key: 'nilai', title: 'Nilai' },
                                        { key: 'tahun', title: 'Tahun' },
                                    ]}
                                    data={permasalahanProvinsi.data || []}
                                />
                                {(permasalahanProvinsi?.last_page || 1) > 1 && (
                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="text-sm text-slate-600">Menampilkan {permasalahanProvinsi.from} - {permasalahanProvinsi.to} dari {permasalahanProvinsi.total} data</div>
                                        <div className="flex gap-2">
                                            {(permasalahanProvinsi.links || []).map((link, index) => (
                                                <Link key={index} href={link.url || '#'} className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <AdminTable
                                    striped
                                    columnFilterEnabled
                                    columns={[
                                        { key: 'kabupaten_kota', title: 'Kabupaten/Kota' },
                                        { key: 'provinsi', title: 'Provinsi', render: (v) => <Badge color="blue">{v}</Badge> },
                                        { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{v}</Badge> },
                                        { key: 'nilai', title: 'Nilai' },
                                        { key: 'tahun', title: 'Tahun' },
                                    ]}
                                    data={permasalahanKabupaten.data || []}
                                />
                                {(permasalahanKabupaten?.last_page || 1) > 1 && (
                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="text-sm text-slate-600">Menampilkan {permasalahanKabupaten.from} - {permasalahanKabupaten.to} dari {permasalahanKabupaten.total} data</div>
                                        <div className="flex gap-2">
                                            {(permasalahanKabupaten.links || []).map((link, index) => (
                                                <Link key={index} href={link.url || '#'} className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}


