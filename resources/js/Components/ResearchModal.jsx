import React from 'react';

export default function ResearchModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    const isInstitusi = data.isInstitusi;
    const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
    const formatNum = (n) => (n && !isNaN(n)) ? Number(n).toLocaleString('id-ID') : n;

    // Helper to get unique items or counts from pipe-separated strings
    const getSummary = (str, type = 'list') => {
        if (!str || typeof str !== 'string') return [];
        const items = str.split('|').map(s => s.trim()).filter(s => s && s !== '-');

        if (type === 'counts') {
            const counts = {};
            items.forEach(item => { counts[item] = (counts[item] || 0) + 1; });
            return Object.entries(counts).sort((a, b) => b[1] - a[1]);
        }

        return [...new Set(items)].sort();
    };

    const skemaBrief = getSummary(data.skema_list || '');
    const tahunBrief = getSummary(data.tahun_list || '');
    const bidangBrief = getSummary(data.bidang_fokus || '', isInstitusi ? 'counts' : 'list');
    const temaBrief = getSummary(data.tema_list || '', isInstitusi ? 'counts' : 'list');

    // Field Colors for the pill at the bottom
    const FIELD_COLORS = {
        'Pangan': '#EF4444',
        'Energi': '#F59E0B',
        'Kesehatan': '#3B82F6',
        'Transportasi': '#10B981',
        'Rekayasa Keteknikan': '#8B5CF6',
        'Pertahanan': '#475569',
        'Kemaritiman': '#06B6D4',
        'Sosial Humaniora': '#BE185D',
        'Seni Budaya': '#D946EF',
        'Pendidikan': '#0EA5E9',
        'Kebencanaan': '#F97316',
        'Kehutanan': '#059669',
        'Lingkungan': '#84CC16'
    };


    const getFieldColor = (focus) => {
        if (!focus) return '#64748b';
        for (const [key, color] of Object.entries(FIELD_COLORS)) {
            if (focus.toLowerCase().includes(key.toLowerCase())) return color;
        }
        return '#64748b';
    };

    // Shared Jenis PT logic
    const ptType = safeValue(data.ptn_pts || data.jenis_pt || data.kategori_pt || (data.jenis_pt_list ? getSummary(data.jenis_pt_list)[0] : '-'));

    const currentFocus = !isInstitusi ? (data.bidang_fokus || data.bidang || '-') : '';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
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
                            {isInstitusi ? (data.institusi || data.nama_institusi) : safeValue(data.judul || data.judul_kegiatan)}
                        </h2>
                    </div>

                    {/* Content Box */}
                    <div className="bg-[#F8FAFC] rounded-2xl p-6 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                        {/* Section: Informasi Institusi */}
                        <div>
                            <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                Informasi Institusi
                            </h3>
                            <div className="space-y-3 font-semibold text-sm text-gray-900">
                                {isInstitusi && (
                                    <div className="grid grid-cols-[130px_1fr] items-baseline">
                                        <span className="text-sm font-medium text-gray-700">Total Penelitian:</span>
                                        <span className="text-blue-600 font-bold">{formatNum(data.total_penelitian)}</span>
                                    </div>
                                )}
                                {!isInstitusi && (
                                    <div className="grid grid-cols-[130px_1fr] items-baseline">
                                        <span className="text-sm font-medium text-gray-700">Peneliti:</span>
                                        <span>{safeValue(data.nama || data.nama_ketua || data.nama_pengusul)}</span>
                                    </div>
                                )}
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
                            </div>
                        </div>

                        {/* Section: Informasi Penelitian */}
                        <div>
                            <h3 className="text-[#3B82F6] font-bold text-base mb-4 tracking-tight">
                                Informasi Penelitian
                            </h3>
                            <div className="space-y-3 font-semibold text-sm text-gray-900">
                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                    <span className="text-sm font-medium text-gray-700">Skema:</span>
                                    <div>
                                        {skemaBrief.length > 1 ? (
                                            <ul className="list-disc list-outside ml-4 space-y-1">
                                                {skemaBrief.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        ) : (
                                            skemaBrief.length === 1 ? skemaBrief[0] : safeValue(data.skema || data.nama_skema)
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                    <span className="text-sm font-medium text-gray-700">Tahun:</span>
                                    <div>{tahunBrief.length > 0 ? tahunBrief.join(', ') : safeValue(data.thn_pelaksanaan || data.tahun || data.thn_pelaksanaan_kegiatan)}</div>
                                </div>

                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                    <span className="text-sm font-medium text-gray-700">Bidang Fokus:</span>
                                    <div>
                                        {isInstitusi && bidangBrief.length > 0 ? (
                                            <ul className="list-disc list-outside ml-4 space-y-1">
                                                {bidangBrief.map(([b, c], i) => (
                                                    <li key={i}>{formatNum(c)} {b}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            bidangBrief.length > 0 ? bidangBrief.join(', ') : safeValue(data.bidang_fokus || data.bidang)
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                    <span className="text-sm font-medium text-gray-700">Tema Prioritas:</span>
                                    <div>
                                        {isInstitusi && temaBrief.length > 0 ? (
                                            <ul className="list-disc list-outside ml-4 space-y-1">
                                                {temaBrief.map(([t, c], i) => (
                                                    <li key={i}>{formatNum(c)} {t}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            temaBrief.length > 0 ? temaBrief.join(', ') : safeValue(data.tema_prioritas || data.luaran || data.tema)
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Pill (Only for Researcher Mode) */}
                    {!isInstitusi && currentFocus !== '-' && (
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
        </div>
    );
}
