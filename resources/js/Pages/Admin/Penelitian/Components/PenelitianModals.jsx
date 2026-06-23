import React from 'react';
import ImportModal from '@/Components/ImportModal';
import BulkUpdateModal from '@/Components/BulkUpdateModal';
import CampusSelect from '@/Components/CampusSelect';
import LocationSelect from '@/Components/LocationSelect';
import CustomSelect from '@/Components/CustomSelect';
import MapLocationPicker from '@/Components/MapLocationPicker';
import { BIDANG_FOKUS_OPTIONS, TEMA_PRIORITAS_OPTIONS } from '@/Constants/options';

export default function PenelitianModals({ context, penelitian }) {
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
            {/* Single Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Konfirmasi Hapus</h3>
                        <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus data penelitian ini?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >Batal</button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 text-center">
                                Hapus {isAllSelectedGlobal ? penelitian.total?.toLocaleString('id-ID') : selectedIds.length} Data?
                            </h3>
                        </div>
                        <p className="text-slate-600 mb-6 text-center">
                            Tindakan ini akan menghapus <strong>{isAllSelectedGlobal ? penelitian.total?.toLocaleString('id-ID') : selectedIds.length} data penelitian</strong> secara permanen dan tidak dapat dikembalikan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >Batal</button>
                            <button
                                onClick={confirmBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >Ya, Hapus Semuanya</button>
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
                title="Import Data Penelitian"
                moduleName="penelitian"
            />

            {/* Bulk Update Modal Component */}
            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                items={itemsEdit}
                onSave={confirmBulkUpdate}
                isSaving={isBulkUpdating}
                title="Bulk Update Data Penelitian"
                renderItemForm={(item) => (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Section 1: Peneliti */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Peneliti</label>
                                <input type="text" value={item.nama} onChange={e => setItemField(item.id, 'nama', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">NIDN</label>
                                <input type="text" value={item.nidn} onChange={e => { const val = e.target.value.replace(/\D/g, ''); e.target.value = val; setItemField(item.id, 'nidn', val); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">NUPTK</label>
                                <input type="text" value={item.nuptk} onChange={e => { const val = e.target.value.replace(/\D/g, ''); e.target.value = val; setItemField(item.id, 'nuptk', val); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                            </div>
                        </div>

                        {/* Section 2: Institusi & Akademik */}
                        <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <CampusSelect
                                        label="Institusi"
                                        value={item.institusi}
                                        onChange={val => setItemField(item.id, 'institusi', val)}
                                        errors={{}}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kode PT</label>
                                    <input type="text" value={item.kode_pt} onChange={e => { const val = e.target.value.replace(/\D/g, ''); e.target.value = val; setItemField(item.id, 'kode_pt', val); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Jenis PT</label>
                                    <CustomSelect
                                        value={item.jenis_pt}
                                        onChange={val => setItemField(item.id, 'jenis_pt', val)}
                                        options={['Akademi', 'Institut', 'Universitas', 'Politeknik', 'Sekolah Tinggi']}
                                        placeholder="-- Pilih --"
                                        error={false}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kategori PT</label>
                                    <CustomSelect
                                        value={item.kategori_pt}
                                        onChange={val => setItemField(item.id, 'kategori_pt', val)}
                                        options={['PTN', 'PTS', 'PTNBH']}
                                        placeholder="-- Pilih --"
                                        error={false}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Klaster</label>
                                    <CustomSelect
                                        value={item.klaster}
                                        onChange={val => setItemField(item.id, 'klaster', val)}
                                        options={['Kelompok PT Binaan', 'Kelompok PT Madya', 'Kelompok PT Mandiri', 'Kelompok PT Pratama', 'Kelompok PT Utama']}
                                        placeholder="-- Pilih --"
                                        error={false}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Institusi Pilihan (Target)</label>
                                    <CustomSelect
                                        value={item.institusi_pilihan}
                                        onChange={val => setItemField(item.id, 'institusi_pilihan', val)}
                                        options={[
                                            'LLDIKTI Wilayah I', 'LLDIKTI Wilayah II', 'LLDIKTI Wilayah III', 'LLDIKTI Wilayah IV', 'LLDIKTI Wilayah V', 'LLDIKTI Wilayah VI', 'LLDIKTI Wilayah VII', 'LLDIKTI Wilayah VIII', 'LLDIKTI Wilayah IX', 'LLDIKTI Wilayah X',
                                            'LLDIKTI Wilayah XI', 'LLDIKTI Wilayah XII', 'LLDIKTI Wilayah XIII', 'LLDIKTI Wilayah XIV', 'LLDIKTI Wilayah XV', 'LLDIKTI Wilayah XVI'
                                        ]}
                                        placeholder="-- Pilih --"
                                        error={false}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Lokasi & Koordinat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <LocationSelect
                                    selectedProvince={item.provinsi}
                                    selectedRegency={item.kota}
                                    onProvinceChange={val => setItemField(item.id, 'provinsi', val)}
                                    onRegencyChange={val => setItemField(item.id, 'kota', val)}
                                    errors={{}}
                                    isRegencyOptional={true}
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

                        {/* Section 4: Data Penelitian */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Judul Penelitian</label>
                                <textarea value={item.judul} onChange={e => setItemField(item.id, 'judul', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-24 resize-none leading-relaxed" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Skema</label>
                                    <input type="text" value={item.skema} onChange={e => setItemField(item.id, 'skema', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tahun Pelaksanaan</label>
                                    <input type="number" value={item.thn_pelaksanaan} onChange={e => setItemField(item.id, 'thn_pelaksanaan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" min="2000" max="2099" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bidang Fokus</label>
                                    <CustomSelect
                                        value={item.bidang_fokus}
                                        onChange={val => setItemField(item.id, 'bidang_fokus', val)}
                                        options={BIDANG_FOKUS_OPTIONS}
                                        placeholder="-- Pilih --"
                                        error={false}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tema Prioritas</label>
                                    <CustomSelect
                                        value={item.tema_prioritas}
                                        onChange={val => setItemField(item.id, 'tema_prioritas', val)}
                                        options={TEMA_PRIORITAS_OPTIONS}
                                        placeholder="-- Pilih --"
                                        error={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        </>
    );
}
