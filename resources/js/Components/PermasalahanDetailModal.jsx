import React from 'react';

export default function PermasalahanDetailModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    const safe = (v) => (v === null || v === undefined || v === '' || v === '-') ? 'Tidak tersedia' : v;
    
    // Determine data type
    const bubbleType = data.bubbleType || (data.skema_hilirisasi ? 'Hilirisasi' : (data.pengabdian_nama ? 'Pengabdian' : 'Penelitian'));
    const isHilirisasi = bubbleType === 'Hilirisasi';
    const isPengabdian = bubbleType === 'Pengabdian';

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-[99999] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200"
                style={{ minWidth: 320, maxWidth: 650, width: '90vw', padding: '35px', position: 'relative', overflow: 'hidden', fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header: Judul */}
                <div style={{ fontWeight: 700, fontSize: 24, color: '#1f2937', marginBottom: 12, lineHeight: 1.2 }}>
                    Detail {bubbleType}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', marginBottom: 20, paddingRight: 20, lineHeight: 1.4, textTransform: 'uppercase' }}>
                    {safe(data.judul || data.judul_kegiatan || data.nama_produk)}
                </div>

                {isHilirisasi ? (
                    /* ─── Hilirisasi Layout ─────────────────────────────────── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: 13, color: '#374151' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pengusul:</div>
                                <div style={{ fontWeight: 500 }}>{safe(data.nama || data.nama_ketua || data.nama_pengusul)}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Perguruan Tinggi:</div>
                                <div style={{ fontWeight: 500 }}>{safe(data.institusi || data.perguruan_tinggi)}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tahun:</div>
                                <div style={{ fontWeight: 500 }}>{safe(data.tahun || data.thn_pelaksanaan)}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skema:</div>
                                <div style={{ fontWeight: 500 }}>{safe(data.skema || data.nama_skema || data.skema_hilirisasi)}</div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mitra:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.mitra || (data.kab_mitra ? `${data.kab_mitra}, ${data.prov_mitra}` : data.prov_mitra))}</div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Luaran:</div>
                            <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '12px', fontSize: '13px', lineHeight: '1.6', textAlign: 'justify', scrollbarWidth: 'thin' }}>
                                {safe(data.luaran)}
                            </div>
                        </div>
                    </div>
                ) : isPengabdian ? (
                    /* ─── Pengabdian Layout ────────────────── */
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 30px', fontSize: 13, color: '#374151' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pelaksana:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.nama || data.nama_ketua || data.pengabdian_nama)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Institusi:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.institusi || data.perguruan_tinggi || data.pengabdian_institusi)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tahun:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.tahun || data.thn_pelaksanaan || data.pengabdian_tahun)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skema:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.skema || data.nama_skema || data.pengabdian_skema)}</div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bidang Fokus:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.bidang_fokus || data.bidang || data.pengabdian_bidang_fokus)}</div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lokasi Mitra:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.mitra || (data.kab_mitra ? `${data.kab_mitra}, ${data.prov_mitra}` : (data.pengabdian_kabupaten ? `${data.pengabdian_kabupaten}, ${data.pengabdian_provinsi}` : '-')))}</div>
                        </div>
                    </div>
                ) : (
                    /* Grid Style for Research Detail (Penelitian) */
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 30px', fontSize: 13, color: '#374151' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Peneliti:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.nama || data.nama_ketua)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>NIDN:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.nidn)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>NUPTK:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.nuptk)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Institusi:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.institusi || data.nama_institusi || data.perguruan_tinggi)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Kategori PT:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.kategori_pt || data.ptn_pts || data.jenis_pt)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tahun:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.tahun || data.thn_pelaksanaan)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skema:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.skema || data.nama_skema)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Klaster:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.klaster)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bidang Fokus:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.bidang_fokus || data.bidang)}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tema Prioritas:</div>
                            <div style={{ fontWeight: 500 }}>{safe(data.tema_prioritas)}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
