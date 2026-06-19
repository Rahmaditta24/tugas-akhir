import React from 'react';
import PageHeader from '@/Components/PageHeader';
import HeaderActions from '@/Components/Admin/HeaderActions';

export default function PengabdianHeader({ context }) {
    const { handleExport, setShowImportModal, selectedIds } = context;

    return (
        <PageHeader
            title="Data Pengabdian"
            subtitle="Kelola data pengabdian masyarakat"
            icon={<span className="text-xl">🤝</span>}
            actions={(
                <HeaderActions
                    onExport={handleExport}
                    onImport={() => setShowImportModal(true)}
                    linkCreate={route('admin.pengabdian.create')}
                    selectedCount={selectedIds.length}
                />
            )}
        />
    );
}
