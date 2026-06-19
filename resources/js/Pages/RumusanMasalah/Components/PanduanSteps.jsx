import React from 'react';

export default function PanduanSteps() {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-500/10 p-8">
            <h2 className="lg:text-2xl text-xl font-bold mb-8 text-gray-900">
                Langkah Praktis Penyelarasan
            </h2>
            <div className="space-y-10">
                {/* Langkah 1 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#3374cd] text-white px-3 py-1 rounded font-bold text-sm leading-none flex items-center h-8">Langkah 1</span>
                        <h3 className="text-lg font-bold text-gray-900">Pilih Bidang dan Rumusan Masalah Terkait</h3>
                    </div>
                    <div className="bg-gray-100/80 p-5 rounded-lg text-[14px] text-gray-700 space-y-2">
                        <p>1. Tentukan terlebih dahulu bidang yang paling dekat dengan topik riset.</p>
                        <p>2. Pilih 1-3 Rumusan Masalah yang:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Paling relevan,</li>
                            <li>Bisa kamu dukung dengan kompetensimu.</li>
                        </ul>
                    </div>
                </div>

                {/* Langkah 2 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#3374cd] text-white px-3 py-1 rounded font-bold text-sm leading-none flex items-center h-8">Langkah 2</span>
                        <h3 className="text-lg font-bold text-gray-900">Turunkan ke Konteks Penelitian</h3>
                    </div>
                    <div className="bg-gray-100/80 p-5 rounded-lg text-[14px] text-gray-700 space-y-2">
                        <p>1. Lokasi (desa/kota/provinsi/instansi).</p>
                        <p>2. Subjek (UMKM, guru, siswa, petani, komunitas, dsb).</p>
                        <p>3. Fokus (perilaku, kebijakan, teknologi, model bisnis, media pembelajaran, dll.).</p>
                        <p>4. Ubah kalimat Rumusan Masalah nasional menjadi kalimat konteks lokal.</p>
                    </div>
                </div>

                {/* Langkah 3 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#3374cd] text-white px-3 py-1 rounded font-bold text-sm leading-none flex items-center h-8">Langkah 3</span>
                        <h3 className="text-lg font-bold text-gray-900">Tentukan Fokus Riset dan Variabel Utama</h3>
                    </div>
                    <div className="bg-gray-100/80 p-5 rounded-lg text-[14px] text-gray-700 space-y-2">
                        <p>1. Apa yang mau dikaji?</p>
                        <p className="ml-4 text-gray-500 italic">(misal: efektivitas model, faktor penghambat, dampak sosial)</p>
                        <p className="pt-2">2. Dari Rumusan Masalah nasional, pilih:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Aspek mana yang sesuai dengan bidang keahlian atau riset,</li>
                            <li>Aspek mana yang ingin diuji/ukur lanjutan risetmu (boleh disebut sebagai batasan).</li>
                        </ul>
                    </div>
                </div>

                {/* Langkah 4 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#3374cd] text-white px-3 py-1 rounded font-bold text-sm leading-none flex items-center h-8">Langkah 4</span>
                        <h3 className="text-lg font-bold text-gray-900">Susun Rumusan Masalah Penelitian (Research Questions)</h3>
                    </div>
                    <div className="bg-gray-100/80 p-5 rounded-lg text-[14px] text-gray-700 space-y-2">
                        <p>1. Kembangkan dari konteks dan fokus:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Pertanyaan tentang kondisi saat ini.</li>
                            <li>Pertanyaan tentang faktor/penyebab/penghambat.</li>
                            <li>Pertanyaan tentang rancangan model/solusi atau efektivitasnya.</li>
                            <li>Jelas keterkaitannya dengan Rumusan Masalah yang dipilih.</li>
                        </ul>
                    </div>
                </div>

                {/* Langkah 5 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#3374cd] text-white px-3 py-1 rounded font-bold text-sm leading-none flex items-center h-8">Langkah 5</span>
                        <h3 className="text-lg font-bold text-gray-900">Cek Keterkaitan dengan Rumusan Masalah Nasional</h3>
                    </div>
                    <div className="bg-gray-100/80 p-5 rounded-lg text-[14px] text-gray-700 space-y-2">
                        <p>1. Tersedia pilihan "Lainnya", apabila penelitian tidak sepenuhnya dengan variabel yang telah diberikan.</p>
                        <p>2. Tambahkan bagian <span className="italic font-semibold">"Uraian Rumusan Masalah Lainnya"</span>:</p>
                        <p className="ml-4 font-medium">"Penelitian ini merespons permasalahan yang terjadi di (Lokasi) pada bidang ..."</p>
                        <p className="pt-2">3. Pada bagian akhir kegiatan jelaskan kontribusinya:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Mengisi data lapangan,</li>
                            <li>Menguji model,</li>
                            <li>Menawarkan rancangan baru, dsb.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
