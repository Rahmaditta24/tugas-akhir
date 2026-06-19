import React from 'react';
import ImportModal from '@/Components/ImportModal';
import BulkUpdateModal from '@/Components/BulkUpdateModal';
import CustomSelect from '@/Components/CustomSelect';
import CampusSelect from '@/Components/CampusSelect';
import { BIDANG_OPTIONS, TKT_OPTIONS } from '@/Constants/options';

export default function ProdukModals({ context, produk }) {
    const {
        showDeleteModal, setShowDeleteModal, confirmDelete,
        showBulkDeleteModal, setShowBulkDeleteModal, confirmBulkDelete,
        isAllSelectedGlobal, selectedIds,
        showImportModal, setShowImportModal, handleImport, handleDownloadTemplate, isImporting,
        showBulkUpdateModal, setShowBulkUpdateModal,
        itemsEdit, setItemField, confirmBulkUpdate, isBulkUpdating,
        provinces
    } = context;

    return (
        <>
            {/* Individual Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed text-sm">
                            Data produk ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">
                            Hapus {isAllSelectedGlobal ? produk.total : selectedIds.length} Data?
                        </h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed text-sm">
                            Seluruh data produk terpilih ({isAllSelectedGlobal ? produk.total : selectedIds.length} item) akan dihapus secara permanen.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95"
                            >
                                Ya, Hapus Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Components */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onDownloadTemplate={handleDownloadTemplate}
                onImport={handleImport}
                isImporting={isImporting}
                title="Import Data Produk"
                moduleName="produk"
            />

            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title="Bulk Update Data Produk"
                renderItemForm={(item) => (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Section: Inventor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Inventor</label>
                                <input type="text" value={item.nama_inventor} onChange={e => setItemField(item.id, 'nama_inventor', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Inventor</label>
                                <input type="email" value={item.email_inventor} onChange={e => setItemField(item.id, 'email_inventor', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        </div>

                        {/* Section: Produk */}
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <h5 className="text-sm font-semibold text-blue-800 mb-3">Informasi Produk</h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Produk</label>
                                    <textarea value={item.nama_produk} onChange={e => setItemField(item.id, 'nama_produk', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-20" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi Produk</label>
                                    <textarea value={item.deskripsi_produk} onChange={e => setItemField(item.id, 'deskripsi_produk', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-32" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bidang</label>
                                        <CustomSelect
                                            value={item.bidang}
                                            onChange={val => setItemField(item.id, 'bidang', val)}
                                            options={BIDANG_OPTIONS}
                                            placeholder="-- Pilih Bidang --"
                                            error={false}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">TKT (6-9)</label>
                                        <CustomSelect
                                            value={item.tkt}
                                            onChange={val => setItemField(item.id, 'tkt', val)}
                                            options={TKT_OPTIONS}
                                            placeholder="-- Pilih TKT --"
                                            error={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Institusi & Lokasi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <CampusSelect
                                    value={item.institusi}
                                    onChange={val => setItemField(item.id, 'institusi', val)}
                                    errors={{}}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Provinsi</label>
                                <CustomSelect
                                    value={item.provinsi}
                                    onChange={val => setItemField(item.id, 'provinsi', val)}
                                    options={provinces}
                                    placeholder="-- Pilih Provinsi --"
                                    error={false}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lat</label>
                                    <input type="text" value={item.latitude} onChange={e => setItemField(item.id, 'latitude', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lng</label>
                                    <input type="text" value={item.longitude} onChange={e => setItemField(item.id, 'longitude', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Paten */}
                        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
                            <h5 className="text-sm font-semibold text-amber-800 mb-3">Informasi Paten</h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nomor Paten</label>
                                    <input type="text" value={item.nomor_paten} onChange={e => setItemField(item.id, 'nomor_paten', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Deskripsi Paten</label>
                                    <textarea value={item.deskripsi_paten} onChange={e => setItemField(item.id, 'deskripsi_paten', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        </>
    );
}
