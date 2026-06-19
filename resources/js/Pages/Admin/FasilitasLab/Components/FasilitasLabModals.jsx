import React from 'react';
import ImportModal from '../../../../Components/ImportModal';
import BulkUpdateModal from '../../../../Components/BulkUpdateModal';
import CampusSelect from '../../../../Components/CampusSelect';
import LocationSelect from '../../../../Components/LocationSelect';
import CustomSelect from '../../../../Components/CustomSelect';

export default function FasilitasLabModals({ context, fasilitasLab }) {
    const {
        toolsModal, setToolsModal,
        showDeleteModal, setShowDeleteModal,
        itemToDelete, confirmDelete,
        showBulkDeleteModal, setShowBulkDeleteModal,
        selectedIds, confirmBulkDelete,
        showImportModal, setShowImportModal,
        isImporting, handleImport, handleDownloadTemplate,
        showBulkUpdateModal, setShowBulkUpdateModal,
        itemsEdit, confirmBulkUpdate, isBulkUpdating, setItemField
    } = context;

    return (
        <>
            {/* Tools Modal */}
            {toolsModal.show && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Daftar Alat</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{toolsModal.title}</p>
                            </div>
                            <button
                                onClick={() => setToolsModal({ show: false, title: '', items: [] })}
                                className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                {toolsModal.items.map((item, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-slate-700 py-1.5 border-b border-slate-50 last:border-0 group">
                                        {toolsModal.items.length > 1 && (
                                            <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                {i + 1}
                                            </span>
                                        )}
                                        <span className="leading-relaxed pt-0.5">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-center items-center">
                            <span className="text-xs text-slate-500 font-medium">Total: {toolsModal.items.length} Alat</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Individual Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Hapus Fasilitas Lab?</h3>
                        <p className="text-slate-600 mb-6 text-center leading-relaxed text-sm">
                            Apakah Anda yakin ingin menghapus data <span className="font-bold text-slate-800">{itemToDelete?.nama_laboratorium}</span>? Data yang dihapus tidak dapat dikembalikan.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                            <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Hapus {selectedIds.length} Data?</h3>
                        <p className="text-slate-600 mb-6 text-center leading-relaxed text-sm">Seluruh data fasilitas terpilih ({selectedIds.length} item) akan dihapus secara permanen.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                            <button onClick={confirmBulkDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95">Ya, Hapus Semua</button>
                        </div>
                    </div>
                </div>
            )}

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                onDownloadTemplate={handleDownloadTemplate}
                isImporting={isImporting}
                title="Import Data Fasilitas Lab"
            />

            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title="Bulk Update Data Fasilitas Lab"
                renderItemForm={(item) => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kode Universitas</label>
                                <input type="text" value={item.kode_universitas || ''} onChange={e => setItemField(item.id, 'kode_universitas', e.target.value.replace(/\\D/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div className="md:col-span-2">
                                <CampusSelect
                                    value={item.institusi}
                                    onChange={val => setItemField(item.id, 'institusi', val)}
                                    errors={{}}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kategori PT</label>
                                <CustomSelect
                                    value={item.kategori_pt || ''}
                                    onChange={val => setItemField(item.id, 'kategori_pt', val)}
                                    options={["PTNBH", "Non-PTNBH"]}
                                    placeholder={"Pilih Kategori PT"}
                                    error={false}
                                    disabled={false}

                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Laboratorium</label>
                                <input type="text" value={item.nama_laboratorium || ''} onChange={e => setItemField(item.id, 'nama_laboratorium', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Total Jumlah Alat</label>
                                <input type="text" inputMode="numeric" value={item.total_jumlah_alat || ''} onChange={e => setItemField(item.id, 'total_jumlah_alat', e.target.value.replace(/\\D/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kontak</label>
                                <input type="text" inputMode="numeric" value={item.kontak || ''} onChange={e => setItemField(item.id, 'kontak', e.target.value.replace(/\\D/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <LocationSelect
                                    selectedProvince={item.provinsi || ''}
                                    selectedRegency={item.kota || ''}
                                    onProvinceChange={val => setItemField(item.id, 'provinsi', val)}
                                    onRegencyChange={val => setItemField(item.id, 'kota', val)}
                                    errors={{}}
                                    showRequiredIndicator={false}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Latitude</label>
                                <input type="text" inputMode="decimal" value={item.latitude || ''} onChange={e => setItemField(item.id, 'latitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Longitude</label>
                                <input type="text" inputMode="decimal" value={item.longitude || ''} onChange={e => setItemField(item.id, 'longitude', e.target.value.replace(',', '.').replace(/[^0-9.-]/g, ''))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Alat</label>
                                <textarea value={item.nama_alat || ''} onChange={e => setItemField(item.id, 'nama_alat', e.target.value)} rows="4" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi Alat</label>
                                <textarea value={item.deskripsi_alat || ''} placeholder="Tidak ada deskripsinya" onChange={e => setItemField(item.id, 'deskripsi_alat', e.target.value)} rows="6" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                            </div>
                        </div>
                    </div>
                )}
            />
        </>
    );
}
