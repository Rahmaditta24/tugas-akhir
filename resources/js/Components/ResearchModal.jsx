import React from 'react';
import { getFieldColor } from '../utils/fieldColors';

export default function ResearchModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    const isInstitusi = !!data.isInstitusi;
    const path = window.location.pathname.toLowerCase();
    const isProdukPage = data.currentDataType === 'produk' || path.includes('produk');
    const isPengabdianPage = data.currentDataType === 'pengabdian' || path.includes('pengabdian');
    const isHilirisasiPage = data.currentDataType === 'hilirisasi' || path.includes('hilirisasi');
    const isFasilitasLabPage = data.currentDataType === 'fasilitas-lab' || path.includes('fasilitas-lab');
    const isPenelitianPage = !isProdukPage && !isPengabdianPage && !isHilirisasiPage && !isFasilitasLabPage;

    const isProduk = isProdukPage && !isInstitusi;
    const isHilirisasi = isHilirisasiPage && !isInstitusi;
    const isPengabdian = isPengabdianPage && !isInstitusi;
    const isFasilitasLab = (isFasilitasLabPage || !!data.isFasilitasLab) && !isInstitusi;
    const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
    const formatNum = (n) => (n && !isNaN(n)) ? Number(n).toLocaleString('id-ID') : n;
    const titleCase = (str) => {
        if (!str || typeof str !== 'string') return str;
        const s = str.trim();
        if (!s || s === '-') return '-';
        return s.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Helper to get unique items or counts from pipe-separated strings
    const getSummary = (str, type = 'list') => {
        if (!str || typeof str !== 'string') return [];
        const parts = str.split('|').map(s => s.trim()).filter(s => s && s !== '-');

        const counts = {};
        const uniqueItems = new Set();

        parts.forEach(part => {
            const [val, countStr] = part.includes(':::') ? part.split(':::') : [part, '1'];
            const trimmedVal = val.trim();
            if (!trimmedVal || trimmedVal === '-' || trimmedVal === 'undefined') return;

            const count = parseInt(countStr) || 1;
            counts[trimmedVal] = (counts[trimmedVal] || 0) + count;
            uniqueItems.add(trimmedVal);
        });

        if (type === 'counts') {
            return Object.entries(counts).sort((a, b) => b[1] - a[1]);
        }

        return Array.from(uniqueItems).sort();
    };

    const skemaBrief = getSummary(data.skema_list || '', isInstitusi ? 'counts' : 'list');
    const tahunBrief = getSummary(data.tahun_list || '', isInstitusi ? 'counts' : 'list');
    const bidangBrief = getSummary(data.bidang_fokus || '', isInstitusi ? 'counts' : 'list');
    const temaBrief = getSummary(data.tema_list || '', isInstitusi ? 'counts' : 'list');

    // Shared Jenis PT logic
    const ptType = safeValue(data.ptn_pts || data.jenis_pt || data.kategori_pt || (data.jenis_pt_list ? getSummary(data.jenis_pt_list)[0] : '-'));

    const currentFocus = !isInstitusi ? (data.bidang_fokus || data.bidang || '-') : '';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8">
                    {/* Title */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 leading-snug">
                            {isInstitusi ? (data.institusi || data.nama_institusi) : safeValue(data.nama_laboratorium || data.judul || data.judul_kegiatan)}
                        </h2>
                    </div>

                    {/* Content Box */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-6 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                        {isProduk ? (
                            <>
                                <div>
                                    <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                        Informasi Produk
                                    </h3>
                                    <div className="space-y-5 font-semibold text-sm text-gray-900">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 mb-1">Nama Produk:</p>
                                            <p className="text-sm font-semibold">{safeValue(data.nama_produk || data.judul)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 mb-1">Deskripsi Produk:</p>
                                            <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                                <p className="text-sm font-normal text-gray-700 leading-relaxed whitespace-pre-line">
                                                    {safeValue(data.deskripsi_produk)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-bold text-gray-800">TKT:</span>
                                            <span>{safeValue(data.tkt)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-bold text-gray-800">Bidang:</span>
                                            <span>{safeValue(data.bidang || data.bidang_fokus)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                        Informasi Inventor & Institusi
                                    </h3>
                                    <div className="space-y-4 font-semibold text-sm text-gray-900">
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-bold text-gray-800">Nama Inventor:</span>
                                            <span>{safeValue(data.nama_inventor || data.nama || data.nama_ketua)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-bold text-gray-800">Email Inventor:</span>
                                            <span>{safeValue(data.email_inventor)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-bold text-gray-800">Institusi:</span>
                                            <span>{safeValue(data.institusi || data.nama_institusi || data.perguruan_tinggi)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-bold text-gray-800">Provinsi:</span>
                                            <span>{safeValue(data.provinsi || data.prov_pt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                        Informasi Paten
                                    </h3>
                                    <div className="space-y-4 font-semibold text-sm text-gray-900">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 mb-1">Nomor dan Deskripsi Paten:</p>
                                            <p className="text-sm font-normal text-gray-700 leading-relaxed whitespace-pre-line">
                                                {safeValue(data.nomor_paten || data.deskripsi_paten)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : isHilirisasi ? (
                            <>
                                <div>
                                    <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                        Informasi Institusi
                                    </h3>
                                    <div className="space-y-3 font-semibold text-sm text-gray-900">
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-700">Peneliti:</span>
                                            <span>{safeValue(data.nama_peneliti || data.nama || data.nama_ketua || data.nama_pengusul)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-700">Institusi:</span>
                                            <span>{safeValue(data.institusi || data.nama_institusi || data.perguruan_tinggi)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-700">Provinsi:</span>
                                            <span>{titleCase(safeValue(data.provinsi || data.prov_pt || data.prov_mitra))}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                        Informasi Penelitian
                                    </h3>
                                    <div className="space-y-3 font-semibold text-sm text-gray-900">
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-700">Skema:</span>
                                            <span>{safeValue(data.skema_hilirisasi || data.skema || data.nama_skema)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-700">Tahun:</span>
                                            <span>{safeValue(data.tahun_hilirisasi || data.tahun || data.thn_pelaksanaan || data.thn_pelaksanaan_kegiatan)}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : isPengabdian ? (
                            <>
                                {(() => {
                                    const isKosabangsa = data.pengabdian_skema?.toLowerCase().includes('kosabangsa') || data.skema?.toLowerCase().includes('kosabangsa');
                                    
                                    return (
                                        <>
                                            <div>
                                                <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                                    Informasi Pelaksana
                                                </h3>
                                                <div className="space-y-3 font-semibold text-sm text-gray-900">
                                                    <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                        <span className="text-sm font-medium text-gray-700">Nama Pelaksana:</span>
                                                        <span>{safeValue(data.pengabdian_nama)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                        <span className="text-sm font-medium text-gray-700">Institusi:</span>
                                                        <span>{safeValue(data.pengabdian_institusi)}</span>
                                                    </div>
                                                    {isKosabangsa && (
                                                        <>
                                                            <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Nama Pendamping:</span>
                                                                <span>{safeValue(data.pengabdian_nama_pendamping)}</span>
                                                            </div>
                                                            <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Institusi Pendamping:</span>
                                                                <span>{safeValue(data.pengabdian_institusi_pendamping)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {!isKosabangsa && (
                                                        <>
                                                            <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Status PT:</span>
                                                                <span>{safeValue(data.pengabdian_status_pt)}</span>
                                                            </div>
                                                            <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Kabupaten:</span>
                                                                <span>{titleCase(data.pengabdian_kabupaten)}</span>
                                                            </div>
                                                            <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Provinsi:</span>
                                                                <span>{titleCase(data.pengabdian_provinsi)}</span>
                                                            </div>
                                                            <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Klaster:</span>
                                                                <span>{safeValue(data.pengabdian_klaster)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                                    Informasi Program
                                                </h3>
                                                <div className="space-y-3 font-semibold text-sm text-gray-900">
                                                    <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                        <span className="text-sm font-medium text-gray-700">Skema:</span>
                                                        <span>{safeValue(data.pengabdian_skema)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                        <span className="text-sm font-medium text-gray-700">Tahun:</span>
                                                        <span>{safeValue(data.pengabdian_tahun)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                        <span className="text-sm font-medium text-gray-700">Bidang Fokus:</span>
                                                        <span>{safeValue(data.pengabdian_bidang_fokus)}</span>
                                                    </div>
                                                    {isKosabangsa && (
                                                        <>
                                                            <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Bidang Teknologi:</span>
                                                                <span>{safeValue(data.pengabdian_bidang_teknologi)}</span>
                                                            </div>
                                                            <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Jenis Wilayah:</span>
                                                                <span>{safeValue(data.pengabdian_jenis_wilayah)}</span>
                                                            </div>
                                                            <div className="grid grid-cols-[135px_1fr] items-baseline">
                                                                <span className="text-sm font-medium text-gray-700">Provinsi Mitra:</span>
                                                                <span>{titleCase(data.pengabdian_provinsi_mitra)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </>
                        ) : isFasilitasLab ? (
                            <>
                                <div>
                                    <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight border-b border-slate-100 pb-2">
                                        Informasi Umum
                                    </h3>
                                    <div className="space-y-4 font-semibold text-sm text-gray-900">
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-600">Institusi:</span>
                                            <span className="font-bold">{safeValue(data.institusi || data.nama_institusi)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-600">Kategori PT:</span>
                                            <span>{safeValue(data.kategori_pt || data.jenis_pt || data.ptn_pts || (data.kampus_ptnbh ? 'PTNBH' : null))}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline border-t border-dashed border-slate-200 pt-3">
                                            <span className="text-sm font-bold text-gray-800">Total Alat:</span>
                                            <span className="text-gray-800 font-bold">{(() => {
                                                const total = data.total_jumlah_alat || data.total_alat;
                                                if (total > 0) return total;
                                                if (data.nama_alat && typeof data.nama_alat === 'string') {
                                                    return data.nama_alat.split('|').filter(Boolean).length;
                                                }
                                                return 0;
                                            })()} Alat</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight border-b border-slate-100 pb-2">
                                        Lokasi
                                    </h3>
                                    <div className="space-y-3 font-semibold text-sm text-gray-900">
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-600">Provinsi:</span>
                                            <span>{safeValue(data.provinsi)}</span>
                                        </div>
                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                            <span className="text-sm font-medium text-gray-600">Kota/Kab:</span>
                                            <span>{safeValue(data.kota || data.kabupaten)}</span>
                                        </div>
                                    </div>
                                </div>

                                {data.nama_alat && (
                                    <div>
                                        <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight border-b border-slate-100 pb-2">
                                            Daftar Alat yang Tersedia
                                        </h3>
                                        <div className="max-h-56 overflow-y-auto pr-2 custom-scrollbar pr-2 mt-2">
                                            <div className="flex flex-wrap gap-2">
                                                {data.nama_alat.split('|').filter(Boolean).map((tool, i) => (
                                                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200 uppercase tracking-tight">
                                                        {tool.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Section: Informasi Institusi */}
                                <div>
                                    <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                        {isProdukPage ? 'Informasi Kampus' : 'Informasi Institusi'}
                                    </h3>
                                    <div className="space-y-3 font-semibold text-sm text-gray-900">
                                        {isInstitusi && (
                                            <>
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {isProdukPage ? 'Jumlah Produk:' :
                                                            (data.isFasilitasLab ? 'Total Fasilitas:' : 'Total Penelitian:')}
                                                    </span>
                                                    <span className="text-blue-600 font-bold">{formatNum(data.total_produk || data.total_penelitian || data.total_pengabdian || data.total_hilirisasi || data._count || 1)}</span>
                                                </div>
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {isProdukPage ? 'Nama Kampus:' : 'Institusi:'}
                                                    </span>
                                                    <span>{safeValue(data.institusi || data.nama_institusi || data.perguruan_tinggi)}</span>
                                                </div>
                                                {data.isFasilitasLab && (
                                                    <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                        <span className="text-sm font-medium text-gray-700">Jenis PT:</span>
                                                        <span>{ptType}</span>
                                                    </div>
                                                )}
                                                {isProdukPage && (
                                                    <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                        <span className="text-sm font-medium text-gray-700">Jumlah Inventor:</span>
                                                        <span>{safeValue(data.total_inventor || data.jumlah_inventor || '-')}</span>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">Provinsi:</span>
                                                    <span>{safeValue(data.provinsi || data.prov_pt)}</span>
                                                </div>
                                            </>
                                        )}
                                        {!isInstitusi && (
                                            <>
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">Peneliti:</span>
                                                    <span>{safeValue(data.nama || data.nama_ketua || data.nama_pengusul)}</span>
                                                </div>
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">Institusi:</span>
                                                    <span>{safeValue(data.nama_institusi || data.institusi || data.perguruan_tinggi)}</span>
                                                </div>
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">Jenis PT:</span>
                                                    <span>{ptType}</span>
                                                </div>
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">Provinsi:</span>
                                                    <span>{safeValue(data.provinsi || data.prov_pt)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Section: Informasi Penelitian / Laboratorium */}
                                {data.isFasilitasLab ? (
                                    <div>
                                        <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                            Informasi Laboratorium
                                        </h3>
                                        {data.isFasilitasLab && (data.lab_list || data.nama_laboratorium) && (
                                            <>
                                                <span className="text-sm font-medium text-gray-700 block mb-2">Nama Lab:</span>
                                                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-slate-50 rounded-lg p-2 bg-slate-50/30 mb-4">
                                                    <ul className="list-disc list-outside ml-5 space-y-2">
                                                        {data.isInstitusi ? (
                                                            (data.lab_list || '').split('|').filter(Boolean).map((lab, i) => (
                                                                <li key={i} className="text-sm text-gray-800 leading-relaxed">
                                                                    {lab}
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className="text-sm text-gray-800 leading-relaxed">
                                                                {data.nama_laboratorium || data.judul}
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </>
                                        )}

                                        {(data.tool_list || data.nama_alat) && (
                                            <>
                                                <span className="text-sm font-medium text-gray-700 block mb-2">Alat yang Tersedia:</span>
                                                <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar border border-slate-50 rounded-lg p-2 bg-slate-50/30">
                                                    <ul className="list-disc list-outside ml-5 space-y-2">
                                                        {(data.tool_list || data.nama_alat || '').split('|').filter(Boolean).map((tool, i) => (
                                                            <li key={i} className="text-sm text-gray-800 leading-relaxed">
                                                                {tool}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                            {isProdukPage ? 'Bidang:' : 'Informasi Penelitian'}
                                        </h3>
                                        <div className="space-y-3 font-semibold text-sm text-gray-900">
                                            {!isProdukPage && (
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">Skema:</span>
                                                    <div>
                                                        {isInstitusi && skemaBrief.length > 0 ? (
                                                            <ul className="list-disc list-outside ml-4 space-y-1">
                                                                {skemaBrief.map(([s, c], i) => (
                                                                    <li key={i}>{s}</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            skemaBrief.length > 1 ? (
                                                                <ul className="list-disc list-outside ml-4 space-y-1">
                                                                    {skemaBrief.map((s, i) => <li key={i}>{s}</li>)}
                                                                </ul>
                                                            ) : (
                                                                skemaBrief.length === 1 ? skemaBrief[0] : safeValue(data.skema || data.nama_skema || data.pengabdian_skema || data.skema_hilirisasi)
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {!isProdukPage && (
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">Tahun:</span>
                                                    <div>
                                                        {isInstitusi && tahunBrief.length > 0 ? (
                                                            isPenelitianPage ? (
                                                                <span className="text-sm text-gray-800 font-semibold">{tahunBrief.map(([y, c]) => y).sort((a,b) => b-a).join(', ')}</span>
                                                            ) : (
                                                                <ul className="list-disc list-outside ml-4 space-y-1">
                                                                    {tahunBrief.map(([y, c], i) => (
                                                                        <li key={i}>{y}</li>
                                                                    ))}
                                                                </ul>
                                                            )
                                                        ) : (
                                                            tahunBrief.length > 0 ? tahunBrief.join(', ') : safeValue(data.thn_pelaksanaan || data.tahun || data.thn_pelaksanaan_kegiatan)
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {isProdukPage ? (
                                                <div className="grid grid-cols-1 items-baseline">
                                                    <div className="mt-1">
                                                        {bidangBrief.length > 0 ? (
                                                            <ul className="list-disc list-outside ml-4 space-y-1.5 font-normal text-gray-700">
                                                                {bidangBrief.map(([b, c], i) => (
                                                                    <li key={i}>{b}</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm font-normal text-gray-600">{safeValue(data.bidang_fokus || data.bidang)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                !isPengabdianPage && !isHilirisasiPage && (
                                                        <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                            <span className="text-sm font-medium text-gray-700">Bidang Fokus:</span>
                                                            <div>
                                                                {isInstitusi && bidangBrief.length > 0 ? (
                                                                    <ul className="list-disc list-outside ml-4 space-y-1">
                                                                        {bidangBrief.map(([b, c], i) => (
                                                                            <li key={i}>{isPenelitianPage ? `${c} ${b}` : b}</li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    bidangBrief.length > 0 ? bidangBrief.join(', ') : safeValue(data.bidang_fokus || data.bidang)
                                                                )}
                                                            </div>
                                                        </div>
                                                )
                                            )}

                                            {!isProdukPage && !isPengabdianPage && !isHilirisasiPage && (
                                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                                    <span className="text-sm font-medium text-gray-700">Tema Prioritas:</span>
                                                    <div>
                                                        {isInstitusi && temaBrief.length > 0 ? (
                                                            <ul className="list-disc list-outside ml-4 space-y-1">
                                                                {temaBrief.map(([t, c], i) => (
                                                                    <li key={i}>{isPenelitianPage ? `${c} ${t}` : t}</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            temaBrief.length > 0 ? temaBrief.join(', ') : safeValue(data.tema_prioritas || data.luaran || data.tema)
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Bottom Pill (Only for Researcher Mode) */}
                    {!isInstitusi && currentFocus !== '-' && !isHilirisasiPage && (
                        <div className="mt-6 flex">
                            <span
                                className="px-5 py-1.5 rounded-full text-white text-xs font-bold shadow-sm"
                                style={{ backgroundColor: getFieldColor(currentFocus) }}
                            >
                                {currentFocus}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div >
    );
}