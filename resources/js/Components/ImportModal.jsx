import React, { useRef } from 'react';

export default function ImportModal({ 
    isOpen, 
    onClose, 
    onDownloadTemplate, 
    onImport, 
    isImporting, 
    title = "Import Data"
}) {
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImport(file, () => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
                    <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <h3 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px]">1</span>
                            Download Template
                        </h3>
                        <p className="text-[11px] text-blue-600 mb-3 ml-7">Gunakan format kolom yang sesuai agar data terbaca sistem.</p>
                        <button
                            onClick={onDownloadTemplate}
                            className="ml-7 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-xs font-semibold flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Excel
                        </button>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-500 text-white flex items-center justify-center text-[11px]">2</span>
                            Upload File
                        </h3>
                        <div
                            className="ml-7 border-2 border-dashed border-slate-200 rounded-lg p-8 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer text-center group"
                            onClick={() => !isImporting && fileInputRef.current?.click()}
                        >
                            {isImporting ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                                    <p className="text-xs font-medium text-slate-600 font-bold">Sedang memproses data...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mb-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600">Klik untuk memilih file</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Excel (.xlsx, .xls) atau CSV</p>
                                    <p className="text-[10px] text-red-500 mt-1 font-bold italic">Maksimal ukuran file: 1 MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}
