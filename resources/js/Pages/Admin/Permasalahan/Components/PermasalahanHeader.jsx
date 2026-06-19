import React from 'react';
import PageHeader from '@/Components/PageHeader';
import HeaderActions from '@/Components/Admin/HeaderActions';

export default function PermasalahanHeader({ baseData, onExport }) {
    return (
        <PageHeader
            title="Data Permasalahan"
            subtitle={baseData === 'statistik' ? "Daftar data statistik per wilayah" : "Daftar riset terkait kategori permasalahan"}
            icon={<span className="text-xl">⚠️</span>}
            actions={(
                <HeaderActions
                    onExport={onExport}
                    exportLabel="Export CSV"
                    // No create/import buttons for Permasalahan currently
                />
            )}
        />
    );
}
