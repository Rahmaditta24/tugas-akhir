import React from 'react';
import AdminTable from '@/Components/AdminTable';
import Badge from '@/Components/Badge';
import { display, titleCase } from '@/Utils/format';

export default function PermasalahanStatistikView({ 
    context, 
    permasalahanProvinsi, 
    permasalahanKabupaten, 
    Pagination 
}) {
    const { activeTab, handleTabChange, jenis } = context;

    const sumberDataMap = {
        sampah: 'Kementerian Lingkungan Hidup 2024',
        stunting: 'SSGI 2024 Kementerian Kesehatan',
        gizi_buruk: 'SSGI 2024 Kementerian Kesehatan',
        krisis_listrik: 'Statistik PLN 2024',
        ketahanan_pangan: 'Peta Ketahanan & Kerentanan Pangan Indonesai (FSVA) 2024',
    };
    const normalizedJenis = jenis.toLowerCase().replace(/ /g, '_');
    const sumberText = jenis === 'all'
        ? 'Sampah: Kementerian Lingkungan Hidup 2024 || Stunting: SSGI 2024 Kementerian Kesehatan || Gizi Buruk: SSGI 2024 Kementerian Kesehatan || Krisis Listrik: Statistik PLN 2024 || Ketahanan Pangan: Peta Ketahanan & Kerentanan Pangan Indonesai (FSVA) 2024'
        : sumberDataMap[normalizedJenis] || '';

    return (
        <div className="p-4 pt-1">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
                <button
                    onClick={() => handleTabChange('provinsi')}
                    className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'provinsi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Provinsi
                </button>
                <button
                    onClick={() => handleTabChange('kabupaten')}
                    className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === 'kabupaten' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Kabupaten/Kota
                </button>
            </div>

            {activeTab === 'provinsi' ? (
                <>
                    <AdminTable
                        striped
                        columns={
                            normalizedJenis === 'sampah' ? [
                                { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                { key: 'timbulan_tahunan_ton', title: 'Timbulan Sampah Tahunan (ton)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                            ] : normalizedJenis === 'krisis_listrik' ? [
                                { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                { key: 'satuan_pln_provinsi', title: 'Satuan PLN/Provinsi', render: (v) => display(v) },
                                { key: 'saidi', title: 'SAIDI (Jam/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                { key: 'saifi', title: 'SAIFI (Kali/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                            ] : normalizedJenis === 'ketahanan_pangan' ? [
                                { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                { key: 'ikp', title: 'IKP', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                            ] : [
                                { key: 'provinsi', title: 'Provinsi', render: (v) => titleCase(v) },
                                { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                { key: 'persentase', title: 'Persentase', render: (v) => display(v) },
                            ]
                        }
                        data={permasalahanProvinsi.data || []}
                    />
                    <div className="mt-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700">Sumber Data:</span> {sumberText}
                    </div>
                    <Pagination data={permasalahanProvinsi} />
                </>
            ) : (
                <>
                    <AdminTable
                        striped
                        columns={
                            normalizedJenis === 'sampah' ? [
                                { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                { key: 'timbulan_tahunan_ton', title: 'Timbulan Sampah Tahunan (ton)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                            ] : normalizedJenis === 'krisis_listrik' ? [
                                { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                { key: 'satuan_pln_provinsi', title: 'Satuan PLN/Provinsi', render: (v) => display(v) },
                                { key: 'saidi', title: 'SAIDI (Jam/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                                { key: 'saifi', title: 'SAIFI (Kali/Pelanggan)', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                            ] : normalizedJenis === 'ketahanan_pangan' ? [
                                { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                { key: 'ikp', title: 'IKP', render: (v) => display(v === 0 ? '0' : Number(v).toLocaleString('id-ID')) },
                            ] : [
                                { key: 'kabupaten_kota', title: 'Kabupaten/Kota', render: (v) => titleCase(v) },
                                { key: 'jenis_permasalahan', title: 'Jenis', render: (v) => <Badge color="yellow">{display(v)}</Badge> },
                                { key: 'persentase', title: 'Persentase', render: (v) => display(v) },
                            ]
                        }
                        data={permasalahanKabupaten.data || []}
                    />
                    <div className="mt-3 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700">Sumber Data:</span> {sumberText}
                    </div>
                    <Pagination data={permasalahanKabupaten} />
                </>
            )}
        </div>
    );
}
