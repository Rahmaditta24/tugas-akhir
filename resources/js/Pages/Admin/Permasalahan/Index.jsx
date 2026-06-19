import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ResearchModal from '@/Components/ResearchModal';

import usePermasalahan from './Hooks/usePermasalahan';
import PermasalahanHeader from './Components/PermasalahanHeader';
import PermasalahanStats from './Components/PermasalahanStats';
import PermasalahanFilter from './Components/PermasalahanFilter';
import PermasalahanStatistikView from './Components/PermasalahanStatistikView';
import PermasalahanDataView from './Components/PermasalahanDataView';

function Pagination({ data }) {
    if ((data.last_page || 1) <= 1) return null;
    return (
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 text-center sm:text-left">
                Menampilkan {data.from?.toLocaleString('id-ID')} - {data.to?.toLocaleString('id-ID')} dari {data.total?.toLocaleString('id-ID')} data
            </div>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {(data.links || []).map((link, index) => {
                    let label = link.label;
                    if (label.includes('Previous')) label = '&laquo;';
                    if (label.includes('Next')) label = '&raquo;';
                    return (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${link.active ? 'bg-blue-600 text-white font-semibold shadow-sm' : link.url ? 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-100' : 'bg-white text-slate-300 border border-slate-100 cursor-not-allowed pointer-events-none'}`}
                            dangerouslySetInnerHTML={{ __html: label }}
                            preserveScroll={true}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default function Index({
    data = {},
    permasalahanProvinsi = {},
    permasalahanKabupaten = {},
    stats = {},
    filters = {}
}) {
    const context = usePermasalahan(filters, stats);

    return (
        <AdminLayout title="">
            <div className="space-y-4">
                <PermasalahanHeader 
                    baseData={context.baseData} 
                    onExport={context.handleExportCSV} 
                />

                <PermasalahanStats 
                    baseData={context.baseData} 
                    stats={context.localStats} 
                    isStatsLoading={context.isStatsLoading} 
                />

                <div className="bg-white rounded-lg shadow-sm">
                    <PermasalahanFilter context={context} filters={filters} />

                    {context.baseData === 'statistik' ? (
                        <PermasalahanStatistikView 
                            context={context} 
                            permasalahanProvinsi={permasalahanProvinsi} 
                            permasalahanKabupaten={permasalahanKabupaten} 
                            Pagination={Pagination}
                        />
                    ) : (
                        <PermasalahanDataView 
                            context={context} 
                            data={data} 
                            Pagination={Pagination}
                        />
                    )}
                </div>
            </div>

            <ResearchModal
                isOpen={context.isModalOpen}
                onClose={() => context.setIsModalOpen(false)}
                data={context.selectedItem ? {
                    ...context.selectedItem,
                    currentDataType: context.baseData,
                    // Map common fields to specific fields expected by ResearchModal
                    pengabdian_nama: context.selectedItem.nama || context.selectedItem.nama_pengusul || context.selectedItem.pengabdian_nama,
                    pengabdian_institusi: context.selectedItem.nama_institusi || context.selectedItem.institusi || context.selectedItem.perguruan_tinggi || context.selectedItem.pengabdian_institusi,
                    pengabdian_status_pt: context.selectedItem.status_pt || context.selectedItem.ptn_pts || context.selectedItem.pengabdian_status_pt,
                    pengabdian_kabupaten: context.selectedItem.kab_pt || context.selectedItem.kota || context.selectedItem.kabupaten || context.selectedItem.pengabdian_kabupaten,
                    pengabdian_provinsi: context.selectedItem.prov_pt || context.selectedItem.provinsi || context.selectedItem.pengabdian_provinsi,
                    pengabdian_klaster: context.selectedItem.klaster || context.selectedItem.pengabdian_klaster,
                    pengabdian_skema: context.selectedItem.nama_skema || context.selectedItem.skema || context.selectedItem.pengabdian_skema,
                    pengabdian_tahun: context.selectedItem.thn_pelaksanaan_kegiatan || context.selectedItem.tahun || context.selectedItem.pengabdian_tahun,
                    pengabdian_bidang_fokus: context.selectedItem.bidang_fokus || context.selectedItem.pengabdian_bidang_fokus,
                    
                    // Hilirisasi Mapping
                    nama_peneliti: context.selectedItem.nama_peneliti || context.selectedItem.nama || context.selectedItem.nama_pengusul,
                    skema_hilirisasi: context.selectedItem.skema_hilirisasi || context.selectedItem.skema || context.selectedItem.nama_skema,
                    tahun_hilirisasi: context.selectedItem.tahun_hilirisasi || context.selectedItem.tahun || context.selectedItem.thn_pelaksanaan
                } : null}
            />
        </AdminLayout>
    );
}
