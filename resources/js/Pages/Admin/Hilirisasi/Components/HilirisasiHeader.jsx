import React from 'react';
import PageHeader from '@/Components/PageHeader';
import HeaderActions from '@/Components/Admin/HeaderActions';

export default function HilirisasiHeader({ context }) {
    const { handleExport, setShowImportModal, isImporting, selectedIds } = context;

    return (
        <PageHeader
            title="Data Hilirisasi"
            subtitle="Kelola data hilirisasi riset"
            icon={<span className="text-xl">🏭</span>}
            actions={(
                <HeaderActions
                    onExport={handleExport}
                    onImport={() => setShowImportModal(true)}
                    isImporting={isImporting}
                    linkCreate={route('admin.hilirisasi.create')}
                    selectedCount={selectedIds.length}
                />
            )}
        />
    );
}
