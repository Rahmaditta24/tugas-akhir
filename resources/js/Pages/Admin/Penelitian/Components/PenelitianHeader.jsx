import React from 'react';
import PageHeader from '@/Components/PageHeader';
import HeaderActions from '@/Components/Admin/HeaderActions';

export default function PenelitianHeader({ context }) {
    const { handleExportExcel, setShowImportModal, isImporting, selectedIds } = context;

    return (
        <PageHeader
            title="Data Penelitian"
            subtitle="Kelola data penelitian"
            icon={<span className="text-xl">🔬</span>}
            actions={(
                <HeaderActions
                    onExport={handleExportExcel}
                    onImport={() => setShowImportModal(true)}
                    isImporting={isImporting}
                    linkCreate={route('admin.penelitian.create')}
                    selectedCount={selectedIds.length}
                />
            )}
        />
    );
}
