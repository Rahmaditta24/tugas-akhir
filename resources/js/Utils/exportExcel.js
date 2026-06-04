/**
 * Utility export Excel non-blocking.
 *
 * Alur:
 * 1. Fetch data dari API endpoint (streaming)
 * 2. Parse JSON
 * 3. Jalankan pembuatan & penulisan file XLSX di dalam setTimeout(0)
 *    agar event loop browser sempat merender UI sebelum CPU-intensive task dimulai
 */

import * as XLSX from 'xlsx';

/**
 * @param {object} options
 * @param {string}   options.apiUrl         - URL endpoint export (sudah termasuk query string)
 * @param {Function} options.mapRow         - Fungsi transformasi: (item) => object kolom Excel
 * @param {string}   options.sheetName      - Nama sheet di workbook
 * @param {string}   options.fileName       - Nama file .xlsx yang akan diunduh
 * @param {Array}    [options.colWidths]    - Array {wch: number} untuk lebar kolom (opsional)
 * @param {Function} [options.onStart]      - Dipanggil sebelum fetch dimulai
 * @param {Function} [options.onSuccess]    - Dipanggil setelah file berhasil diunduh (count)
 * @param {Function} [options.onEmpty]      - Dipanggil jika data kosong
 * @param {Function} [options.onError]      - Dipanggil jika terjadi error
 * @param {Function} [options.onFinally]    - Dipanggil di akhir (setelah success/error/empty)
 */
export async function exportToExcel({
    apiUrl,
    mapRow,
    sheetName = 'Sheet1',
    fileName = 'export.xlsx',
    colWidths = [],
    onStart,
    onSuccess,
    onEmpty,
    onError,
    onFinally,
}) {
    if (onStart) onStart();

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allData = await response.json();

        if (!allData || allData.length === 0) {
            if (onEmpty) onEmpty();
            return;
        }

        const exportData = allData.map(mapRow);

        // Jalankan di setTimeout(0) agar browser sempat flush UI
        // sebelum proses sinkron XLSX dimulai
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);

                    if (colWidths.length > 0) {
                        ws['!cols'] = colWidths;
                    }

                    XLSX.writeFile(wb, fileName);
                    resolve(exportData.length);
                } catch (err) {
                    reject(err);
                }
            }, 0);
        }).then((count) => {
            if (onSuccess) onSuccess(count);
        });

    } catch (error) {
        console.error('Export Excel error:', error);
        if (onError) onError(error);
    } finally {
        if (onFinally) onFinally();
    }
}
