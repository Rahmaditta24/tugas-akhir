import React from 'react';
import { Link } from '@inertiajs/react';

export default function HeaderActions({
    onExport,
    onImport,
    linkCreate,
    onCreate,
    exportLabel = 'Export Semua',
    exportSelectedLabel = 'Export Terpilih',
    importLabel = 'Import Data',
    createLabel = 'Tambah Data',
    selectedCount = 0,
    isImporting = false,
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {onExport && (
                <button
                    onClick={onExport}
                    className="px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm active:scale-95"
                >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="hidden xs:inline">
                        {selectedCount > 0 ? `${exportSelectedLabel} (${selectedCount})` : exportLabel}
                    </span>
                    <span className="xs:hidden">
                        {selectedCount > 0 ? `(${selectedCount})` : 'Export'}
                    </span>
                </button>
            )}

            {onImport && (
                <button
                    onClick={onImport}
                    disabled={isImporting}
                    className="px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm active:scale-95 disabled:opacity-50"
                >
                    {isImporting ? (
                        <span className="h-4 w-4 mr-1.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    ) : (
                        <svg className="w-5 h-5 sm:w-4 sm:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    )}
                    <span className="hidden xs:inline">{isImporting ? 'Proses...' : importLabel}</span>
                    <span className="xs:hidden">{isImporting ? '...' : 'Import'}</span>
                </button>
            )}

            {linkCreate ? (
                <Link
                    href={linkCreate}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm active:scale-95"
                >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">{createLabel}</span>
                </Link>
            ) : onCreate ? (
                <button
                    onClick={onCreate}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm active:scale-95"
                >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">{createLabel}</span>
                </button>
            ) : null}
        </div>
    );
}
