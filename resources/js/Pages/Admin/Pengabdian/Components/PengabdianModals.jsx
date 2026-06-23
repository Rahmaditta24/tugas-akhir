import React from 'react';
import ImportModal from '@/Components/ImportModal';
import BulkUpdateModal from '@/Components/BulkUpdateModal';
import LocationSelect from '@/Components/LocationSelect';
import CustomSelect from '@/Components/CustomSelect';
import MapLocationPicker from '@/Components/MapLocationPicker';
import { NAMA_SINGKAT_SKEMA_PENGABDIAN_OPTIONS, NAMA_SKEMA_PENGABDIAN_OPTIONS } from '@/Constants/options';

export default function PengabdianModals({ context, pengabdian }) {
    const {
        showDeleteModal, setShowDeleteModal, confirmDelete,
        showBulkDeleteModal, setShowBulkDeleteModal, confirmBulkDelete,
        isAllSelectedGlobal, selectedIds,
        showImportModal, setShowImportModal, handleImport, handleDownloadTemplate, isImporting,
        showBulkUpdateModal, setShowBulkUpdateModal,
        itemsEdit, setItemField, confirmBulkUpdate, isBulkUpdating, type
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
                            Data pengabdian ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Hapus {isAllSelectedGlobal ? pengabdian.total?.toLocaleString('id-ID') : selectedIds.length} Data?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Seluruh data pengabdian terpilih ({isAllSelectedGlobal ? pengabdian.total?.toLocaleString('id-ID') : selectedIds.length} item) akan dihapus secara permanen.
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

            {/* Import Modal */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                isImporting={isImporting}
                onDownloadTemplate={handleDownloadTemplate}
                title={`Import Data Pengabdian (${type === 'kosabangsa' ? 'Kosabangsa' : 'Batch/Multitahun'})`}
                moduleName="pengabdian"
            />

            {/* Bulk Update Modal */}
            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title={`Update ${itemsEdit.length} Data Pengabdian`}
                renderItemForm={(item) => {
                    const isKosabangsa = item.batch_type === 'kosabangsa' || type === 'kosabangsa';
                    const f = (key) => item[key] || '';
                    const inp = (key, opts = {}) => (
                        <input
                            type={opts.type || 'text'}
                            value={f(key)}
                            onChange={e => {
                                const val = opts.numeric ? e.target.value.replace(/\D/g, '') : e.target.value;
                                e.target.value = val;
                                setItemField(item.id, key, val);
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={opts.placeholder || ''}
                        />
                    );
                    return (
                        <div className="space-y-5">
                            {/* Section: Jenis Batch */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Klasifikasi Data</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jenis Batch / Program</label>
                                        <CustomSelect
                                            value={f('batch_type')}
                                            onChange={val => setItemField(item.id, 'batch_type', val)}
                                            options={[{ value: "batch", label: "Multitahun, Batch I & Batch II" }, { value: "kosabangsa", label: "Kosabangsa" }]}
                                            placeholder={"-- Pilih --"}
                                            error={false}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">NIDN</label>
                                        {inp('nidn', { numeric: true, placeholder: 'Nomor NIDN' })}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Institusi & Pengusul */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <span>🏫</span><p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Institusi & Pengusul</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Ketua Pengusul</label>
                                        {inp('nama')}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Institusi</label>
                                        {inp('nama_institusi')}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Kode PT</label>
                                            {inp('kd_perguruan_tinggi', { numeric: true })}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">LLDIKTI</label>
                                            {inp('wilayah_lldikti')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">PTN/PTS</label>
                                            <CustomSelect
                                                value={f('ptn_pts')}
                                                onChange={val => setItemField(item.id, 'ptn_pts', val)}
                                                options={["PTN", "PTS"]}
                                                placeholder={"-- Pilih --"}
                                                error={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <LocationSelect
                                                selectedProvince={f('prov_pt')}
                                                selectedRegency={f('kab_pt')}
                                                onProvinceChange={val => setItemField(item.id, 'prov_pt', val)}
                                                onRegencyChange={val => setItemField(item.id, 'kab_pt', val)}
                                                provinceErrorKey="prov_pt"
                                                regencyErrorKey="kab_pt"
                                                showRequiredIndicator={false}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Klaster</label>
                                        {inp('klaster')}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Detail Pelaksanaan */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <span>📜</span><p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Detail Pelaksanaan</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Judul Pengabdian</label>
                                        <textarea value={f('judul')} onChange={e => setItemField(item.id, 'judul', e.target.value)} rows="3" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {!isKosabangsa && (
                                            <>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Skema</label>
                                                    <CustomSelect
                                                        value={f('nama_skema')}
                                                        onChange={val => setItemField(item.id, 'nama_skema', val)}
                                                        options={NAMA_SKEMA_PENGABDIAN_OPTIONS}
                                                        placeholder="-- Pilih --"
                                                        error={false}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Singkatan Skema</label>
                                                    <CustomSelect
                                                        value={f('nama_singkat_skema')}
                                                        onChange={val => setItemField(item.id, 'nama_singkat_skema', val)}
                                                        options={NAMA_SINGKAT_SKEMA_PENGABDIAN_OPTIONS}
                                                        placeholder="-- Pilih --"
                                                        error={false}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tahun Pelaksanaan</label>
                                            <input type="number" value={f('thn_pelaksanaan_kegiatan')} onChange={e => setItemField(item.id, 'thn_pelaksanaan_kegiatan', e.target.value)} placeholder="2025" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Urutan Tahun</label>
                                            {inp('urutan_thn_kegitan', { placeholder: 'Tahun ke-1' })}
                                        </div>
                                        <div className={isKosabangsa ? '' : 'col-span-2'}>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bidang Fokus</label>
                                            {inp('bidang_fokus', { placeholder: 'Bidang fokus pengabdian' })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Kosabangsa */}
                            {isKosabangsa && (
                                <div className="border border-blue-100 bg-blue-50/40 rounded-xl overflow-hidden">
                                    <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                                        <span>🎓</span><p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Informasi Pendamping (Kosabangsa)</p>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Pendamping</label>
                                            {inp('nama_pendamping')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">NIDN Pendamping</label>
                                            {inp('nidn_pendamping', { numeric: true })}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Institusi Pendamping</label>
                                            {inp('institusi_pendamping')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Kode PT Pendamping</label>
                                            {inp('kd_perguruan_tinggi_pendamping', { numeric: true })}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">LLDIKTI Pendamping</label>
                                            {inp('lldikti_wilayah_pendamping')}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Jenis Wilayah Mitra</label>
                                            {inp('jenis_wilayah_provinsi_mitra')}
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bidang Teknologi Inovasi</label>
                                            {inp('bidang_teknologi_inovasi')}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Mitra & Koordinat */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                    <span>📍</span><p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mitra & Koordinat</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <LocationSelect
                                                selectedProvince={f('prov_mitra')}
                                                selectedRegency={f('kab_mitra')}
                                                onProvinceChange={val => setItemField(item.id, 'prov_mitra', val)}
                                                onRegencyChange={val => setItemField(item.id, 'kab_mitra', val)}
                                                provinceErrorKey="prov_mitra"
                                                regencyErrorKey="kab_mitra"
                                                showRequiredIndicator={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <MapLocationPicker 
                                                latitude={f('pt_latitude')}
                                                longitude={f('pt_longitude')}
                                                onLatitudeChange={val => setItemField(item.id, 'pt_latitude', val)}
                                                onLongitudeChange={val => setItemField(item.id, 'pt_longitude', val)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }}
            />
        </>
    );
}
