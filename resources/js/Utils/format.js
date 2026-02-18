/**
 * Utilitas pemformatan data terpusat
 */

/**
 * Membersihkan nilai dari null, undefined, string "NaN", atau simbol kosong lainnya.
 * @param {any} v Nilai yang akan dibersihkan
 * @returns {string} Nilai yang dibersihkan atau string kosong
 */
export const fmt = (v) => {
    if (v === null || v === undefined) return '';
    let s = String(v).trim();

    // Hapus tanda kutip tunggal di awal (biasanya dari Excel untuk memaksa string)
    if (s.startsWith("'")) {
        s = s.substring(1);
    }

    if (
        s === '' ||
        s.toLowerCase() === 'nan' ||
        s === '-' ||
        s === '—' ||
        s === '?' ||
        s.toLowerCase() === 'null' ||
        s.toLowerCase() === 'undefined'
    ) return '';

    // Deteksi notasi ilmiah (misal: 6.2577E+15) dan format
    if (/^[0-9.]+[eE]\+[0-9]+$/.test(s)) {
        try {
            return Number(s).toLocaleString('fullwide', { useGrouping: false });
        } catch (e) {
            return s;
        }
    }

    return s;
};

/**
 * Menampilkan nilai dengan fallback jika kosong.
 * @param {any} v Nilai yang akan ditampilkan
 * @param {string} fallback Nilai cadangan jika v kosong (default: '-')
 * @returns {string}
 */
export const display = (v, fallback = 'null') => {
    const cleaned = fmt(v);
    return cleaned || fallback;
};

/**
 * Mengonversi string ke Title Case dengan dukungan akronim.
 * @param {any} v 
 * @returns {string}
 */
export const titleCase = (v) => {
    const s = fmt(v).toLowerCase();
    if (!s) return 'null';

    const acronyms = ['pt', 'cv', 'pens', 'ui', 'ugm', 'itb', 'ipb', 'ptn', 'pts'];
    return s.split(/\s+/).map(word => {
        if (acronyms.includes(word)) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

/**
 * Mengonversi string ke Sentence Case.
 * @param {any} v 
 * @returns {string}
 */
export const sentenceCase = (v) => {
    const s = fmt(v);
    if (!s) return 'null';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};
