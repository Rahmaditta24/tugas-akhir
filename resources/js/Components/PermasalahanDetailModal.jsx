import React from 'react';
import { titleCase } from '../Utils/format';

export default function PermasalahanDetailModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    const safe = (v) => {
        if (v === null || v === undefined || v === '' || v === '-') return 'Tidak tersedia';
        return v;
    };
    
    // Determine data type
    const bubbleType = data.bubbleType || (data.skema_hilirisasi ? 'Hilirisasi' : (data.pengabdian_nama ? 'Pengabdian' : 'Penelitian'));
    const isHilirisasi = bubbleType === 'Hilirisasi';
    const isPengabdian = bubbleType === 'Pengabdian';

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-[99999] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 relative overflow-hidden w-full max-w-[500px]"
                style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-5 sm:p-7 flex flex-col h-full">
                    {/* Header: Judul */}
                    <div className="mb-4 pr-6">
                        <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                            Detail {bubbleType}
                        </div>
                        <h2 className="font-bold text-base sm:text-lg text-gray-900 leading-snug">
                            {safe(data.judul || data.judul_kegiatan || data.nama_produk)}
                        </h2>
                    </div>

                    {/* Content Area with background */}
                    <div className="bg-slate-50 rounded-xl p-4 overflow-y-auto max-h-[55vh] custom-scrollbar">
                        {isHilirisasi ? (
                            <div className="space-y-4 text-xs sm:text-sm">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Pengusul</p>
                                        <p className="font-semibold text-slate-800">{safe(data.nama || data.nama_ketua || data.nama_pengusul)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Institusi</p>
                                        <p className="font-semibold text-slate-800">{safe(data.institusi || data.perguruan_tinggi)}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tahun</p>
                                            <p className="font-semibold text-slate-800">{safe(data.tahun || data.thn_pelaksanaan)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Skema</p>
                                            <p className="font-semibold text-slate-800">{safe(data.skema || data.nama_skema || data.skema_hilirisasi)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Mitra</p>
                                        <p className="font-semibold text-slate-800">{safe(data.mitra || (data.kab_mitra ? `${data.kab_mitra}, ${data.prov_mitra}` : data.prov_mitra))}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Luaran</p>
                                        <p className="text-slate-700 leading-relaxed text-justify">{safe(data.luaran)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : isPengabdian ? (
                            <div className="space-y-4 text-xs sm:text-sm">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Pelaksana</p>
                                        <p className="font-semibold text-slate-800">{safe(data.nama || data.nama_ketua || data.pengabdian_nama)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Institusi</p>
                                        <p className="font-semibold text-slate-800">{safe(data.institusi || data.perguruan_tinggi || data.pengabdian_institusi)}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tahun</p>
                                            <p className="font-semibold text-slate-800">{safe(data.tahun || data.thn_pelaksanaan || data.pengabdian_tahun)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Skema</p>
                                            <p className="font-semibold text-slate-800">{safe(data.skema || data.nama_skema || data.pengabdian_skema)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Bidang Fokus</p>
                                        <p className="font-semibold text-slate-800">{safe(data.bidang_fokus || data.bidang || data.pengabdian_bidang_fokus)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Lokasi Mitra</p>
                                        <p className="font-semibold text-slate-800">{safe(data.mitra || (data.kab_mitra ? `${data.kab_mitra}, ${data.prov_mitra}` : (data.pengabdian_kabupaten ? `${data.pengabdian_kabupaten}, ${data.pengabdian_provinsi}` : '-')))}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-xs sm:text-sm">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Peneliti</p>
                                            <p className="font-semibold text-slate-800">{safe(data.nama || data.nama_ketua)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">NIDN</p>
                                            <p className="font-semibold text-slate-800">{safe(data.nidn)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Institusi</p>
                                        <p className="font-semibold text-slate-800">{safe(data.institusi || data.nama_institusi || data.perguruan_tinggi)}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tahun</p>
                                            <p className="font-semibold text-slate-800">{safe(data.tahun || data.thn_pelaksanaan)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Skema</p>
                                            <p className="font-semibold text-slate-800">{safe(data.skema || data.nama_skema)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Bidang Fokus</p>
                                        <p className="font-semibold text-slate-800">{safe(data.bidang_fokus || data.bidang)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tema Prioritas</p>
                                        <p className="font-semibold text-slate-800">{safe(data.tema_prioritas)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
