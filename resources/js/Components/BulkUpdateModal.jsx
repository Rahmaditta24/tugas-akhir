import React from 'react';

export default function BulkUpdateModal({ 
    isOpen, 
    onClose, 
    items, 
    onSave, 
    isSaving, 
    title = "Bulk Update Data",
    renderItemForm
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 opacity-100 transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-slate-200">
                {/* Modal Header */}
                <div className="flex-none px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{title}</h3>
                        <p className="text-sm text-slate-600 font-medium mt-1">Mengedit {items.length} data sekaligus</p>
                    </div>
                    
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative transition-all hover:shadow-md hover:border-blue-200">
                            {/* Item Header */}
                            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-inner">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.nama_pengusul || item.nama}</h4>
                                        <p className="text-xs text-slate-500 font-medium">DATA ID: #{item.id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Item Form Body */}
                            <div className="p-5 space-y-6">
                                {renderItemForm(item)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Footer */}
                <div className="flex-none px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <p className="text-xs text-slate-500 italic hidden sm:block">* Pastikan semua data sudah benar sebelum menyimpan.</p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 border border-slate-300 transition-colors shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all shadow-sm shadow-amber-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Menyimpan...</>
                            ) : (
                                `Simpan ${items.length} Data`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
