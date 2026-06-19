import React from 'react';
import PageHeader from '@/Components/PageHeader';
import HeaderActions from '@/Components/Admin/HeaderActions';

export default function FasilitasLabHeader({ context }) {
    const { handleExport, setShowImportModal, isImporting, selectedIds } = context;
    
    return (
        <PageHeader
            title="Data Fasilitas Lab"
            subtitle="Kelola data fasilitas laboratorium"
            icon={<span className="text-xl">🧪</span>}
            actions={(
                <HeaderActions
                    onExport={handleExport}
                    onImport={() => setShowImportModal(true)}
                    linkCreate={route('admin.fasilitas-lab.create')}
                    isImporting={isImporting}
                    selectedCount={selectedIds.length}
                    exportLabel="Export Data"
                    exportSelectedLabel="Export Terpilih"
                    createLabel="Tambah Data"
                />
            )}
        />
    );
}
