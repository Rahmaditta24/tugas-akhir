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
export const display = (v, fallback = '-') => {
    const cleaned = fmt(v);
    return cleaned || fallback;
};

/**
 * Mengonversi string ke Title Case dengan dukungan akronim.
 * @param {any} v 
 * @returns {string}
 */
export const titleCase = (v) => {
    const s = fmt(v).trim();
    if (!s) return '-';

    const conjunctions = ['dan', 'atau', 'tetapi', 'namun', 'melainkan', 'sedangkan', 'di', 'ke', 'dari', 'pada', 'dalam', 'yang', 'untuk', 'bagi', 'guna', 'buat', 'sebagai', 'dengan', 'secara', 'oleh', 'tentang', 'terhadap', 'daripada'];
    const acronyms = ['dki', 'diy', 'pt', 'cv', 'pens', 'ui', 'ugm', 'itb', 'ipb', 'ptn', 'pts', 'ptnbh', 'blu', 'satker', 'ii', 'iii', 'iv', 'vi', 'vii', 'viii', 'ix', 'kbm', 'pdb', 'pkm', 'pm-upud', 'pmm', 'pmp', 'puk', 'pw', 'diksi', 'dikti'];

    const words = s.split(/\s+/);
    return words.map((word, index) => {
        const lowerWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        const upperWord = word.toUpperCase();

        // Selalu kapital untuk kata pertama
        if (index === 0) {
            if (lowerWord === 'dki' || lowerWord === 'diy') return 'DKI';
            if (lowerWord === 'di') return 'DI';
            if (acronyms.includes(lowerWord)) return upperWord;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        // Penanganan khusus untuk singkatan wilayah
        if (lowerWord === 'dki') return 'DKI';
        if (lowerWord === 'diy') return 'DIY';
        
        // DI menjadi kapital jika diikuti Yogyakarta
        if (lowerWord === 'di' && words[index + 1]?.toLowerCase().includes('yogyakarta')) return 'DI';

        // Penanganan akronim lainnya
        if (acronyms.includes(lowerWord)) return upperWord;

        // Penanganan kata penghubung (tetap kecil)
        if (conjunctions.includes(lowerWord)) return lowerWord;

        // Default: Huruf kapital di awal
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).filter(Boolean).join(' ');
};

/**
 * Mengonversi string ke Sentence Case.
 * @param {any} v 
 * @returns {string}
 */
export const sentenceCase = (v) => {
    const s = fmt(v);
    if (!s) return '-';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};
