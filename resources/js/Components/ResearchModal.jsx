import React from 'react';

const FIELD_COLORS = {
    "Energi": "#FF5716",
    "Kebencanaan": "#ECCEAA",
    "Kemaritiman": "#00D0FF",
    "Kesehatan": "#FF2A64",
    "Material Maju": "#FFCC00",
    "Pangan": "#10B374",
    "Pertahanan dan Keamanan": "#1C4570",
    "Produk rekayasa keteknikan": "#FE272F",
    "Sosial Humaniora": "#A72184",
    "Teknologi Informasi dan Komunikasi": "#B39B77",
    "Transportasi": "#A578AE",
    "Riset Dasar Teoritis": "#96CEB4"
};

export default function ResearchModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    const isInstitusi = data.isInstitusi;
    const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
    const formatNum = (n) => (n && !isNaN(n)) ? Number(n).toLocaleString('id-ID') : n;

    // Helper to get unique items or counts from pipe-separated strings
    const getSummary = (str, type = 'list') => {
        if (!str) return [];
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
    const bidangBrief = getSummary(data.bidang_fokus || '', 'counts');

    // Determine field color for Researcher Mode
    let fieldColor = '#3E7DCA';
    if (!isInstitusi) {
        for (const [key, color] of Object.entries(FIELD_COLORS)) {
            if (data.bidang_fokus && data.bidang_fokus.includes(key)) {
                fieldColor = color;
                break;
            }
        }
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header with Title */}
                <div className="px-6 pt-8 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">
                        {isInstitusi ? (data.institusi || data.nama_institusi) : safeValue(data.judul || data.judul_kegiatan)}
                    </h2>
                </div>

                {/* Content Area */}
                <div className="px-6 pb-8 space-y-6 max-h-[75vh] overflow-y-auto">

                    {/* Section: Informasi Institusi */}
                    <div>
                        <h3 className="text-[#3E7DCA] font-bold text-base mb-3 tracking-tight">Informasi Institusi</h3>
                        <div className="space-y-2 pl-1">
                            {isInstitusi && (
                                <div className="grid grid-cols-[130px_1fr] items-baseline border-b border-gray-50 pb-1">
                                    <span className="text-sm font-semibold text-gray-800">Total Penelitian:</span>
                                    <span className="text-sm text-gray-600 pl-2 font-bold">{formatNum(data.total_penelitian)}</span>
                                </div>
                            )}
                            {!isInstitusi && (
                                <div className="grid grid-cols-[130px_1fr] items-baseline border-b border-gray-50 pb-1">
                                    <span className="text-sm font-semibold text-gray-800">Nama:</span>
                                    <span className="text-sm text-gray-600 pl-2">{safeValue(data.nama || data.nama_ketua || data.nama_pengusul)}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-[130px_1fr] items-baseline border-b border-gray-50 pb-1">
                                <span className="text-sm font-semibold text-gray-800">Institusi:</span>
                                <span className="text-sm text-gray-600 pl-2">{safeValue(data.nama_institusi || data.institusi || data.perguruan_tinggi)}</span>
                            </div>
                            <div className="grid grid-cols-[130px_1fr] items-baseline border-b border-gray-50 pb-1">
                                <span className="text-sm font-semibold text-gray-800">Status PT:</span>
                                <span className="text-sm text-gray-600 pl-2">{safeValue(data.ptn_pts || data.jenis_pt || data.kategori_pt)}</span>
                            </div>
                            <div className="grid grid-cols-[130px_1fr] items-baseline border-b border-gray-50 pb-1">
                                <span className="text-sm font-semibold text-gray-800">Kabupaten:</span>
                                <span className="text-sm text-gray-600 pl-2">{safeValue(data.kab_pt || data.kota || data.kabupaten_kota)}</span>
                            </div>
                            <div className="grid grid-cols-[130px_1fr] items-baseline">
                                <span className="text-sm font-semibold text-gray-800">Provinsi:</span>
                                <span className="text-sm text-gray-600 pl-2">{safeValue(data.provinsi || data.prov_pt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Informasi Kegiatan */}
                    <div>
                        <h3 className="text-[#3E7DCA] font-bold text-base mb-3 tracking-tight">
                            {isInstitusi || window.location.pathname === '/' ? 'Informasi Penelitian' : 'Informasi Program'}
                        </h3>
                        <div className="space-y-3 pl-1">
                            {/* Skema */}
                            <div className="grid grid-cols-[130px_1fr] items-baseline">
                                <span className="text-sm font-semibold text-gray-800">Skema:</span>
                                <div className="pl-2">
                                    {isInstitusi ? (
                                        <ul className="list-disc list-outside ml-4 space-y-1">
                                            {skemaBrief.map((s, i) => <li key={i} className="text-sm text-gray-600">{s}</li>)}
                                        </ul>
                                    ) : (
                                        <span className="text-sm text-gray-600">{safeValue(data.skema || data.nama_skema)}</span>
                                    )}
                                </div>
                            </div>

                            {/* Tahun */}
                            <div className="grid grid-cols-[130px_1fr] items-baseline">
                                <span className="text-sm font-semibold text-gray-800">Tahun:</span>
                                <span className="text-sm text-gray-600 pl-2">
                                    {isInstitusi ? tahunBrief.join(', ') : safeValue(data.tahun || data.thn_pelaksanaan || data.thn_pelaksanaan_kegiatan)}
                                </span>
                            </div>

                            {/* Bidang Fokus */}
                            {(data.bidang_fokus || isInstitusi) && (
                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                    <span className="text-sm font-semibold text-gray-800">Bidang Fokus:</span>
                                    <div className="pl-2">
                                        {isInstitusi ? (
                                            <ul className="list-disc list-outside ml-4 space-y-1">
                                                {bidangBrief.map(([f, c], i) => <li key={i} className="text-sm text-gray-600"><span className="font-bold text-gray-700">{formatNum(c)}</span> {f}</li>)}
                                            </ul>
                                        ) : (
                                            <span className="text-sm text-gray-600">{safeValue(data.bidang_fokus)}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tema / Luaran */}
                            {(data.tema_prioritas || data.luaran) && !isInstitusi && (
                                <div className="grid grid-cols-[130px_1fr] items-baseline">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {window.location.pathname.includes('hilirisasi') ? 'Luaran:' : 'Tema:'}
                                    </span>
                                    <span className="text-sm text-gray-600 pl-2">{safeValue(data.tema_prioritas || data.luaran)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colored Badge */}
                    {!isInstitusi && (
                        <div className="pt-2">
                            <span
                                className="inline-block px-4 py-1.5 rounded-full text-white text-[10px] font-bold shadow-sm uppercase"
                                style={{ backgroundColor: fieldColor }}
                            >
                                {safeValue(data.bidang_fokus || data.skema)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
