/**
 * Canonical bidang fokus → badge colour map.
 * Used by MapContainer, ResearchModal, and ResearchList.
 */
export const FIELD_COLORS = {
    'Energi': '#FF5716',
    'Kebencanaan': '#ECCEAA',
    'Kemaritiman': '#00D0FF',
    'Kesehatan': '#FF2A64',
    'Material Maju': '#FFCC00',
    'Pangan': '#10B374',
    'Pertahanan dan Keamanan': '#1C4570',
    'Produk rekayasa keteknikan': '#FE272F',
    'Sosial Humaniora': '#A72184',
    'Teknologi Informasi dan Komunikasi': '#B39B77',
    'Transportasi': '#A578AE',
    'Riset Dasar Teoritis': '#96CEB4',
    'Hilirisasi': '#8B5CF6',
    'Terapan': '#EC4899',
    'Pengembangan': '#F59E0B',
};

/** Returns the hex colour for a given bidang fokus string. */
export function getFieldColor(focus) {
    if (!focus) return '#64748b';
    for (const [key, color] of Object.entries(FIELD_COLORS)) {
        if (focus.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return '#64748b';
}
