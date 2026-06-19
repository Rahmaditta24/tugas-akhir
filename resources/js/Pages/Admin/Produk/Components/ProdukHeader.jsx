import React from 'react';
import PageHeader from '@/Components/PageHeader';
import HeaderActions from '@/Components/Admin/HeaderActions';

export default function ProdukHeader({ context }) {
    const { handleExport, setShowImportModal, selectedIds, isImporting } = context;

    return (
        <PageHeader
            title="Data Produk"
            subtitle="Kelola data produk dan paten"
            icon={<span className="text-xl">📦</span>}
            actions={(
                <HeaderActions
                    onExport={handleExport}
                    onImport={() => setShowImportModal(true)}
                    linkCreate={route('admin.produk.create')}
                    isImporting={isImporting}
                    selectedCount={selectedIds.length}
                    exportLabel="Export Semua Data"
                    exportSelectedLabel="Export Terpilih"
                    createLabel="Tambah"
                />
            )}
        />
    );
}
