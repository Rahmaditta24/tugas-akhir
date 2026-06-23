import React from 'react';
import ImportModal from '@/Components/ImportModal';
import BulkUpdateModal from '@/Components/BulkUpdateModal';
import CampusSelect from '@/Components/CampusSelect';
import LocationSelect from '@/Components/LocationSelect';
import CustomSelect from '@/Components/CustomSelect';
import MapLocationPicker from '@/Components/MapLocationPicker';

export default function HilirisasiModals({ context, hilirisasi }) {
    const {
        showDeleteModal, setShowDeleteModal,
        confirmDelete,
        showBulkDeleteModal, setShowBulkDeleteModal,
        confirmBulkDelete,
        isAllSelectedGlobal, selectedIds,
        showImportModal, setShowImportModal,
        handleDownloadTemplate, handleImport,
        isImporting,
        showBulkUpdateModal, setShowBulkUpdateModal,
        itemsEdit, setItemField,
        confirmBulkUpdate, isBulkUpdating
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
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Data hilirisasi ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus {isAllSelectedGlobal ? hilirisasi.total.toLocaleString('id-ID') : selectedIds.length} Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Seluruh data hilirisasi terpilih ({isAllSelectedGlobal ? hilirisasi.total.toLocaleString('id-ID') : selectedIds.length} item) akan dihapus secara permanen.
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

            {/* Import Modal Component */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onDownloadTemplate={handleDownloadTemplate}
                onImport={handleImport}
                isImporting={isImporting}
                title="Import Data Hilirisasi"
                moduleName="hilirisasi"
            />

            {/* Bulk Update Modal Component */}
            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title="Bulk Update Data Hilirisasi"
                renderItemForm={(item) => (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Section 1: Profil */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Pengusul</label>
                                <input type="text" value={item.nama_pengusul} onChange={e => setItemField(item.id, 'nama_pengusul', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">ID Proposal</label>
                                <input type="text" value={item.id_proposal} onChange={e => setItemField(item.id, 'id_proposal', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        </div>

                        {/* Section 2: Institusi */}
                        <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100/50">
                            <h5 className="text-sm font-semibold text-sky-800 mb-3">Institusi</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <CampusSelect
                                        label="Perguruan Tinggi"
                                        name="perguruan_tinggi"
                                        value={item.perguruan_tinggi}
                                        onChange={val => setItemField(item.id, 'perguruan_tinggi', val)}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Lokasi & Koordinat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <LocationSelect
                                    selectedProvince={item.provinsi}
                                    selectedRegency=""
                                    onProvinceChange={val => setItemField(item.id, 'provinsi', val)}
                                    onRegencyChange={() => { }}
                                    hideRegency={true}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <MapLocationPicker 
                                    latitude={item.pt_latitude || ''}
                                    longitude={item.pt_longitude || ''}
                                    onLatitudeChange={val => setItemField(item.id, 'pt_latitude', val)}
                                    onLongitudeChange={val => setItemField(item.id, 'pt_longitude', val)}
                                />
                            </div>
                        </div>

                        {/* Section 4: Data Hilirisasi */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Judul Hilirisasi</label>
                                <textarea value={item.judul} onChange={e => setItemField(item.id, 'judul', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-24 resize-none leading-relaxed" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tahun</label>
                                    <input type="number" value={item.tahun} onChange={e => setItemField(item.id, 'tahun', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" min="2000" max="2099" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Skema</label>
                                    <CustomSelect
                                        value={item.skema}
                                        onChange={val => setItemField(item.id, 'skema', val)}
                                        options={["A1: Hilirisasi inovasi hasil riset untuk tujuan komersialisasi", "A2: Hilirisasi kepakaran untuk menjawab kebutuhan DUDI", "A3: Pengembangan produk inovasi bersama DUDI", "A4: Peningkatan TKDN atau produk substitusi import melalui proses reverse engineering", "B1: Penyelesaian persoalan yang ada di masyarakat", "B2: Penyelesaian persoalan yang ada di Institusi Pemerintah", { value: "Penyelesaian persoalan yang ada di masyarakat atau Institusi Pemerintah (termasuk kegiatan pengabdian masyarakat, penyusunan naskah akademik, kebijakan, rekomendasi, dan bentuk penyelesaian lainnya)", label: "Penyelesaian persoalan yang ada di masyarakat atau Institusi Pemerintah" }, { value: "Penyediaan jasa, tenaga ahli, dan produk kepakaran perguruan tinggi untuk Dunia Usaha Dunia Industri (DUDI) / masyarakat (termasuk bentuk kegiatan pelatihan, pembinaan, dan bentuk jasa/produk lainnya)", label: "Penyediaan jasa, tenaga ahli, dan produk kepakaran perguruan tinggi" }, { value: "Adopsi atau difusi, hilirisasi, komersialisasi produk, purwarupa, teknologi, kebijakan (termasuk mini-plant, teaching factory, teaching industry) untuk memenuhi kebutuhan mitra", label: "Adopsi atau difusi, hilirisasi, komersialisasi produk" }, { value: "Pembentukan atau penguatan research and innovation center atau pusat unggulan teknologi (Centre of Excellence/CoE) bersama DUDI untuk menjadi pusat kajian atau riset untuk pengembangan DUDI atau untuk penyelesaian permasalahan DUDI", label: "Pembentukan atau penguatan research and innovation center" }, { value: "Penerapan rencana bisnis and business model canvas (BMC) untuk Startup (termasuk UMKM) yang dibangun oleh perguruan tinggi bekerja sama dengan DUDI maupun oleh mahasiswa bekerja sama dengan alumni dan/atau DUDI dibawah supervisi dosen", label: "Penerapan rencana bisnis dan BMC Startup" }, "Dorongan Teknologi - Tim Pakar/Pengkaji", "Ajakan Industri PT - 1 Tahun", "Ajakan Industri PT - 2 Tahun", "Ajakan Industri PT - 3 Tahun", "Hilirisasi Inovasi Komersial", "Hilirisasi Inovasi Sosial", { value: item.skema, label: item.skema }]}
                                        placeholder={"-- Pilih Skema --"}
                                        error={false}
                                        disabled={false}

                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Direktorat</label>
                                    <CustomSelect
                                        value={item.direktorat}
                                        onChange={val => setItemField(item.id, 'direktorat', val)}
                                        options={["DIKSI", "DIKTI", "Direktorat Hilirisasi dan Kemitraan"]}
                                        placeholder={"-- Pilih Direktorat --"}
                                        error={false}
                                        disabled={false}

                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Luaran</label>
                                    <input type="text" value={item.luaran} onChange={e => setItemField(item.id, 'luaran', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Mitra</label>
                                    <input type="text" value={item.mitra} onChange={e => setItemField(item.id, 'mitra', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        </>
    );
}
