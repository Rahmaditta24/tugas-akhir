import React from 'react';
import AdminTable from '@/Components/AdminTable';
import Badge from '@/Components/Badge';
import { display, titleCase } from '@/Utils/format';

export default function PermasalahanDataView({ context, data, Pagination }) {
    const { localColumnFilters, handleColumnFilterChange, setSelectedItem, setIsModalOpen } = context;

    const getVal = (item, key) => {
        if (key === 'judul') return display(item.judul);
        if (key === 'peneliti') return display(item.nama || item.nama_pengusul || item.peneliti);
        if (key === 'institusi') return display(item.nama_institusi || item.perguruan_tinggi || item.institusi);
        if (key === 'tahun') return display(item.thn_pelaksanaan_kegiatan || item.tahun || item.thn_pelaksanaan || item.tahun_hilirisasi);
        if (key === 'provinsi') return titleCase(item.provinsi || item.prov_pt);
        return display(item[key]);
    };

    return (
        <div className="p-4 pt-1">
            <AdminTable
                striped
                columnFilterEnabled={true}
                filters={localColumnFilters}
                onFilterChange={handleColumnFilterChange}
                columns={[
                    { key: 'no', title: 'No', className: 'w-12 text-center' },
                    {
                        key: 'judul', title: 'Judul Riset', className: 'min-w-[400px]', render: (v, item) => (
                            <div
                                className="line-clamp-2 text-xs sm:text-sm leading-relaxed cursor-pointer text-slate-700 hover:text-blue-600 hover:underline transition-colors font-medium"
                                title="Klik untuk lihat detail"
                                onClick={() => {
                                    setSelectedItem(item);
                                    setIsModalOpen(true);
                                }}
                            >
                                {getVal(item, 'judul')}
                            </div>
                        )
                    },
                    { key: 'peneliti', title: 'Peneliti / Pengusul', className: 'min-w-[180px]', render: (_, item) => <div className="text-xs sm:text-sm">{getVal(item, 'peneliti')}</div> },
                    { key: 'institusi', title: 'Institusi', className: 'min-w-[150px]', render: (_, item) => <div className="truncate text-xs sm:text-sm" title={getVal(item, 'institusi')}>{getVal(item, 'institusi')}</div> },
                    { key: 'provinsi', title: 'Provinsi', className: 'min-w-[150px]', render: (_, item) => <Badge color="blue">{getVal(item, 'provinsi')}</Badge> },
                    { key: 'tahun', title: 'Tahun', className: 'min-w-[100px] text-center', render: (_, item) => <Badge color="gray">{getVal(item, 'tahun')}</Badge> },
                ]}
                data={(data.data || []).map((item, index) => ({
                    ...item,
                    no: (data.from || 1) + index,
                }))}
            />
            <Pagination data={data} />
        </div>
    );
}
