import React, { useEffect, useState } from 'react';
import MainLayout from '../../Layouts/MainLayout';
import NavigationTabs from '../../Components/NavigationTabs';
import { Head, Link } from '@inertiajs/react';

export default function Panduan({ categories }) {
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Data dari data-aliran.js - Renamed to chartCategories to avoid conflict with Prop
    const chartCategories = [
        "Ketahanan Pangan", "Kesehatan", "Energi", "Maritim",
        "Pertahanan", "AI & Semikonduktor", "Material & Manufaktur",
        "Hilirisasi & Industrialisasi"
    ];

    const data_matrix = {
        "Swasembada Pangan": { 0: ["1.1", "1.5", "1.6"], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
        "Swasembada Energi": { 0: [], 1: [], 2: ["3.1", "3.6", "3.9"], 3: [], 4: [], 5: [], 6: [], 7: [] },
        "Swasembada Air": { 0: ["1.3", "1.6"], 1: ["2.4", "2.9", "2.11"], 2: [], 3: ["4.4", "4.5", "4.7", "4.11"], 4: [], 5: [], 6: [], 7: [] },
        "Kesehatan": { 0: ["1.4", "1.8"], 1: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10"], 2: [], 3: [], 4: [], 5: ["6.1", "6.5"], 6: [], 7: [] },
        "Ekonomi & SDM": { 0: ["1.2", "1.10"], 1: ["2.8", "2.9", "2.10"], 2: ["3.4", "3.7", "3.11"], 3: ["4.1", "4.9", "4.10", "4.11"], 4: ["5.2", "5.7", "5.11"], 5: ["6.7", "6.8", "6.9"], 6: ["7.3", "7.10", "7.11"], 7: ["8.8", "8.9", "8.10"] },
        "Pendidikan": { 0: ["1.8", "1.10"], 1: ["2.1", "2.2", "2.8"], 2: ["3.6"], 3: ["4.9"], 4: [], 5: ["6.7", "6.8", "6.9"], 6: ["7.3"], 7: ["8.8"] },
        "Digitalisasi": { 0: ["1.2"], 1: ["2.1", "2.6", "2.7"], 2: ["3.8"], 3: ["4.2", "4.4", "4.10"], 4: [], 5: ["6.1", "6.2", "6.5", "6.6"], 6: [], 7: ["8.5", "8.9", "8.10"] },
        "AI": { 0: [], 1: ["2.6"], 2: [], 3: [], 4: ["5.5", "5.6", "5.11"], 5: ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10"], 6: [], 7: ["8.5"] },
        "Semikonduktor": { 0: [], 1: [], 2: [], 3: [], 4: ["5.1", "5.4", "5.11"], 5: ["6.1", "6.2", "6.3", "6.4", "6.5"], 6: [], 7: [] },
        "Material Maju": { 0: [], 1: [], 2: ["3.9"], 3: [], 4: [], 5: [], 6: ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"], 7: ["8.1", "8.7"] },
        "Mineral": { 0: [], 1: [], 2: ["3.9"], 3: [], 4: [], 5: [], 6: ["7.4", "7.8"], 7: ["8.1", "8.7", "8.9"] },
        "Industri Manufaktur": { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: ["7.1", "7.2", "7.6"], 7: ["8.1", "8.2", "8.8"] },
        "Ekonomi Hijau": { 0: ["1.3", "1.7"], 1: [], 2: ["3.1", "3.5", "3.7"], 3: [], 4: [], 5: [], 6: ["7.9", "7.10"], 7: ["8.4", "8.7", "8.10"] },
        "Ekonomi Biru": { 0: [], 1: [], 2: [], 3: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "4.10"], 4: [], 5: [], 6: [], 7: [] },
        "Ekonomi Kreatif": { 0: ["1.11"], 1: [], 2: [], 3: [], 4: [], 5: ["6.5", "6.6", "6.11"], 6: [], 7: ["8.5", "8.9", "8.10"] },
        "Lingkungan Hidup": { 0: ["1.3"], 1: [], 2: ["3.1", "3.3", "3.5"], 3: ["4.6"], 4: [], 5: [], 6: ["7.9"], 7: ["8.4", "8.7", "8.10"] },
        "Elektrifikasi Transportasi": { 0: [], 1: [], 2: ["3.6", "3.9"], 3: [], 4: [], 5: [], 6: ["7.4", "7.7", "7.11"], 7: [] },
        "Pengelolaan Sampah": { 0: ["1.6"], 1: [], 2: ["3.3", "3.11"], 3: ["4.6", "4.11"], 4: [], 5: [], 6: ["7.8", "7.9", "7.11"], 7: ["8.4", "8.7", "8.10"] },
        "Kebencanaan": { 0: ["1.11"], 1: ["2.11"], 2: [], 3: ["4.3", "4.11"], 4: [], 5: [], 6: [], 7: [] },
        "Sosiologi & Antropologi": { 0: ["1.8", "1.10"], 1: [], 2: [], 3: ["4.9"], 4: [], 5: [], 6: [], 7: [] },
        "Psikologi": { 0: ["1.8"], 1: ["2.2", "2.8"], 2: [], 3: [], 4: [], 5: ["6.8", "6.9"], 6: ["7.3"], 7: [] },
        "Komunikasi": { 0: ["1.8"], 1: ["2.2"], 2: [], 3: [], 4: [], 5: [], 6: [], 7: ["8.9"] },
        "Hukum": { 0: [], 1: [], 2: [], 3: [], 4: [], 5: ["6.3"], 6: ["7.5"], 7: ["8.2"] },
        "Ilmu Politik": { 0: [], 1: [], 2: ["3.10"], 3: [], 4: ["5.10", "5.11"], 5: [], 6: [], 7: ["8.2", "8.9"] },
        "Filsafat & Etika": { 0: [], 1: ["2.8"], 2: [], 3: [], 4: ["5.5"], 5: ["6.4"], 6: [], 7: [] },
        "Geografi": { 0: ["1.3"], 1: [], 2: ["3.6", "3.10"], 3: ["4.2"], 4: [], 5: [], 6: ["7.10"], 7: [] },
        "Demografi": { 0: ["1.1", "1.10"], 1: ["2.3", "2.4"], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
        "Bahasa & Sastra": { 0: ["1.4", "1.8"], 1: [], 2: [], 3: [], 4: [], 5: ["6.6"], 6: [], 7: [] },
        "Sejarah": { 0: ["1.4"], 1: [], 2: [], 3: ["4.11"], 4: [], 5: [], 6: [], 7: ["8.10"] },
        "Seni & Budaya": { 0: ["1.4", "1.8", "1.11"], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: ["8.6", "8.10"] },
        "Studi Agama": { 0: ["1.4", "1.8"], 1: ["2.8"], 2: [], 3: [], 4: [], 5: [], 6: [], 7: ["8.10"] },
        "Studi Area": { 0: [], 1: [], 2: ["3.10"], 3: [], 4: ["5.8"], 5: [], 6: [], 7: ["8.9"] },
        "Kearifan Lokal": { 0: ["1.4"], 1: [], 2: [], 3: ["4.4", "4.9", "4.11"], 4: [], 5: [], 6: [], 7: [] },
        "Pariwisata": { 0: ["1.4", "1.11"], 1: [], 2: [], 3: ["4.8", "4.9", "4.11"], 4: [], 5: [], 6: [], 7: ["8.6", "8.9", "8.10"] },
        "Sustainable Mobility": { 0: [], 1: [], 2: ["3.6", "3.8"], 3: [], 4: [], 5: [], 6: [], 7: [] },
        "Pembangunan Sosial": { 0: ["1.10", "1.11"], 1: [], 2: ["3.6", "3.11"], 3: [], 4: [], 5: [], 6: [], 7: ["8.8", "8.9", "8.10"] },
        "Modal Sosial": { 0: ["1.10", "1.11"], 1: [], 2: [], 3: ["4.4", "4.9", "4.11"], 4: [], 5: [], 6: [], 7: ["8.9", "8.10"] },
        "Perempuan & Gender": { 0: ["1.8", "1.10", "1.11"], 1: ["2.2", "2.8", "2.11"], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }
    };

    const dataTopik = [
        {
            "topik": "Kebencanaan",
            "contoh": [
                {
                    "judul": "Pembangunan Sistem Pemantauan Dini Bencana Degradasi Danau Berdasarkan Distribusi Suhu Permukaan pada Citra Satelit Penginderaan Jauh",
                    "bidang": ["Hilirisasi & Industrialisasi", "Digitalisasi: AI & Semikonduktor"],
                    "paragraf": [
                        "Riset ini berfokus pada pengembangan sistem pemantauan dini yang memanfaatkan analisis citra satelit yang dapat menjadi informasi praktis bagi pemangku kepentingan (pemerintah daerah, pengelola danau, dan lembaga lingkungan) sebagai alat bantu pengambilan keputusan untuk pengelolaan sumber daya air. Teknologi hasil riset juga dapat menjadi produk layanan informasi yang berpotensi dimanfaatkan secara berkelanjutan, sehingga dapat dipetakan kepada bidang hilirisasi.",
                        "Selain itu, riset ini juga berkaitan erat dengan bidang digitalisasi karena seluruh proses pemantauan berbasis pada data digital citra satelit yang diolah dengan algoritma komputasi dan disajikan melalui sistem atau platform digital. Transformasi dari survei manual menjadi pemantauan digital yang lebih otomatis, berkelanjutan, dan luas cakupannya menjadikan riset ini bagian dari upaya penguatan sistem informasi berbasis data digital dalam manajemen risiko bencana degradasi danau."
                    ]
                },
                {
                    "judul": "Studi Pengaruh Reklamasi Teluk Jakarta Terhadap Perubahan Tinggi Muka Laut yang Dibangkitkan Gelombang Badai Pasang sebagai Upaya Mitigasi Bencana Rob",
                    "bidang": ["Maritim", "Pertahanan"],
                    "paragraf": [
                        "Riset ini secara langsung berkaitan dengan dinamika laut dan pesisir di Teluk Jakarta yang kemudian mempengaruhi tinggi muka laut saat badai pasang. Analisis perubahan tinggi muka laut akibat kombinasi faktor oseanografi (gelombang, pasang, arus) adalah inti dari ilmu kelautan dan teknik pantai, yang jelas masuk dalam ruang lingkup bidang maritim.",
                        "Kajian perubahan tinggi muka laut akibat badai pasang dapat digunakan untuk perencanaan mitigasi yang mendukung ketahanan nasional terhadap bencana hidrometeorologi di kawasan strategis seperti Jakarta. Penelitian ini memperkuat pertahanan sipil dan resiliensi kota pesisir terhadap risiko naiknya muka air laut dan banjir rob."
                    ]
                }
            ]
        },
        {
            "topik": "Seni & Budaya",
            "contoh": [
                {
                    "judul": "Optimalisasi dan Implementasi Buku Taktil 3D Printing untuk Pendidikan Inklusif Tunanetra SLB: Motif Batik, Narasi Rempah, dan Peningkatan Literasi Taktil Warisan Budaya",
                    "bidang": ["Manufaktur & Material Maju", "Hilirisasi & Industrialisasi"],
                    "paragraf": [
                        "Riset ini menitikberatkan pengembangan dan evaluasi penggunaan Buku Taktil 3D Printing sebagai upaya hilirisasi untuk menilai kesiapan suatu produk sehingga dapat dilakukan optimalisasi menuju tingkat kesiapan komersil. Kegiatan ini juga sebuah upaya hilirisasi hasil riset manufaktur ke produk konkret alat bantu pendidikan inklusif. Secara sosial-budaya, penelitian ini mendukung penguatan identitas dan literasi warisan budaya (motif batik dan narasi rempah) bagi peserta didik tunanetra, yang menjadi bagian dari penguatan modal sosial dan karakter bangsa."
                    ]
                },
                {
                    "judul": "Tradisi Sakeco Tau Samawa: Preservation and Innovation dalam Kolaborasi Pertunjukan Musik dan Tari sebagai Pengembangan Pariwisata Berbasis Kesenian Masyarakat",
                    "bidang": ["Hilirisasi & Industrialisasi"],
                    "paragraf": [
                        "Penelitian ini terkait dengan pengembangan pariwisata berbasis kesenian masyarakat, yang pada dasarnya merupakan bagian dari hilirisasi sektor budaya dan ekonomi kreatif. Tradisi Sakeco Tau Samawa yang dikemas dalam kolaborasi pertunjukan musik dan tari diposisikan sebagai produk wisata budaya yang bernilai jual, mendorong terbentuknya rantai nilai ekonomi mulai dari pelaku seni, pengelola pertunjukan, UMKM lokal, hingga sektor jasa penunjang (kuliner, penginapan, transportasi). Dengan demikian, riset ini mendukung agenda Hilirisasi & Industrialisasi karena mengarahkan kekayaan budaya lokal menjadi aktivitas ekonomi di hilir (pariwisata dan industri kreatif), bukan sekadar objek pelestarian pasif."
                    ]
                }
            ]
        },
        {
            "topik": "Hukum",
            "contoh": [
                {
                    "judul": "Identifikasi Hukum Terhadap Pelestarian dan Pemanfaatan Laut oleh Suku Laut di Kabupaten Lingga",
                    "bidang": ["Maritim"],
                    "paragraf": [
                        "Riset ini berhubungan langsung dengan tata kelola ruang laut, keberlanjutan pemanfaatan sumber daya pesisir, serta pengakuan praktik hukum adat dalam pengelolaan wilayah laut. Suku Laut memiliki pengetahuan dan aturan tradisional terkait wilayah tangkap, pelestarian ekosistem, dan cara pemanfaatan laut yang berkelanjutan. Dengan mengidentifikasi dan menganalisis aspek hukum (negara dan adat) yang mengatur pelestarian dan pemanfaatan laut oleh komunitas ini, riset ini mendukung bidang Maritim melalui penguatan dasar hukum dan kebijakan yang lebih inklusif dan berkeadilan. Selain itu, riset ini juga menjadi fondasi sosial bagi pengembangan ekonomi biru yang berkelanjutan."
                    ]
                },
                {
                    "judul": "Membangun Sinergi Hukum Adat Gorontalo dan Bolaang Mongondow: Studi Komparatif terhadap Nilai, Struktur, dan Mekanisme Penyelesaian Sengketa",
                    "bidang": ["Pertahanan", "Hilirisasi & Industrialisasi"],
                    "paragraf": [
                        "Penelitian tentang sinergi hukum adat dan mekanisme penyelesaian sengketa sangat relevan dengan ketahanan nasional dalam dimensi sosial, hukum, and budaya. Hukum adat yang kuat dan disinergikan antarwilayah (Gorontalo dan Bolaang Mongondow) berkontribusi pada pencegahan konflik horizontal, penguatan kohesi sosial, serta peningkatan legitimasi mekanisme penyelesaian sengketa di tingkat lokal. Ketika masyarakat memiliki saluran penyelesaian konflik yang diakui dan efektif, potensi eskalasi sengketa menjadi konflik yang lebih luas yang bisa mengganggu stabilitas dan keamanan dapat ditekan. Dengan demikian, riset ini mendukung bidang pertahanan dalam arti ketahanan sosial dan keamanan internal, melalui penguatan tata kelola lokal berbasis nilai-nilai kearifan hukum adat.",
                        "Riset ini juga dapat dipetakan ke bidang hilirisasi & industrialisasi karena sinergi hukum adat berpotensi menjadi fondasi tata kelola sengketa atas sumber daya dan ruang yang sering kali menjadi prasyarat utama keberhasilan proyek hilirisasi di daerah. Mekanisme penyelesaian sengketa yang jelas, legitimasi, dan diterima masyarakat adat akan mengurangi konflik lahan, konflik pemanfaatan sumber daya alam, serta resistensi sosial terhadap implementasi kebijakan pembangunan dan investasi di sektor hilir (misalnya industri pengolahan, infrastruktur, atau pemanfaatan kawasan tertentu). Penguatan sekaligus penyelarasan nilai, struktur, serta mekanisme hukum adat ini dapat mendukung kepastian sosial dan kepastian “aturan main” yang dibutuhkan agar kebijakan hilirisasi berjalan lebih lancar dan berkelanjutan di tingkat lokal."
                    ]
                }
            ]
        },
        {
            "topik": "Bisnis dan Ekonomi",
            "contoh": [
                {
                    "judul": "Menciptakan Model Bisnis Dinamis Berpengetahuan untuk Keberlanjutan Industri Bioetanol Fuel Grade Berbahan Baku Molases di Indonesia",
                    "bidang": ["Energi", "Hilirisasi & Industrialisasi"],
                    "paragraf": [
                        "Riset ini dapat dipetakan pada Bidang Energi terutama pada 3.4 Pengembangan Inovasi dan Transformasi dalam Bisnis dalam Transisi Energi. Fokus pada “Model Bisnis Dinamis Berpengetahuan” untuk industri bioetanol fuel grade secara langsung menjawab kebutuhan transisi dari energi fosil ke bioenergi berkelanjutan, sekaligus meningkatkan pemanfaatan limbah pengolahan tebu atau molases sebagai bahan baku bernilai tambah. Dengan merancang model bisnis yang adaptif terhadap perubahan pasar, regulasi, dan ketersediaan bahan baku, penelitian ini berkontribusi pada keberlanjutan rantai nilai bioetanol dari hulu (agroindustri tebu) hingga hilir (industri energi dan pengguna akhir). Selain itu, riset ini sejalan dengan agenda hilirisasi karena mendorong lahirnya skema komersialisasi dan tata kelola industri bioetanol yang lebih matang, terintegrasi, dan menarik bagi pelaku usaha maupun investor."
                    ]
                },
                {
                    "judul": "Desain Keberlanjutan Supply Chain Kopi Banyuwangi menggunakan Business Model Canvas",
                    "bidang": ["Pangan", "Hilirisasi & Industrialisasi"],
                    "paragraf": [
                        "Riset ini dapat dipetakan pada dua bidang, yaitu Pangan dan Hilirisasi & Industrialisasi. Dari sisi Pangan, desain keberlanjutan supply chain kopi Banyuwangi menjawab persoalan efisiensi rantai pasok dan penguatan model bisnis yang berorientasi pasar dan keberlanjutan di tingkat petani hingga pelaku hilir. Dari sisi Hilirisasi & Industrialisasi, penggunaan Business Model Canvas untuk merancang rantai nilai kopi yang terintegrasi mendukung agenda hilirisasi komoditas perkebunan menjadi produk bernilai tambah (green bean terstandar, roasted coffee, produk turunan, wisata kopi, dsb.) serta memperkuat keterhubungan antara pelaku usaha kecil dengan industri pengolahan dan pasar ekspor."
                    ]
                }
            ]
        },
        {
            "topik": "Pendidikan",
            "contoh": [
                {
                    "judul": "Pengaruh Model Pembelajaran Berbasis Aktivitas Fisik Terhadap Kesejahteraan Psikologis Siswa Difabel",
                    "bidang": ["Kesehatan"],
                    "paragraf": [
                        "Riset “Pengaruh Model Pembelajaran Berbasis Aktivitas Fisik Terhadap Kesejahteraan Psikologis Siswa Difabel” paling tepat dipetakan ke Bidang Kesehatan. Penelitian ini menguji sebuah model pembelajaran berbasis aktivitas fisik sebagai bentuk intervensi promotif–preventif untuk meningkatkan kesejahteraan psikologis kelompok rentan (siswa difabel), yang sejalan dengan agenda peningkatan kesehatan mental, kualitas hidup, dan layanan inklusif bagi populasi khusus. Pada saat yang sama, riset ini juga berkontribusi pada pengembangan praktik pendidikan inklusif, sehingga dapat dinyatakan mendukung penguatan SDM melalui inovasi di bidang pendidikan khusus."
                    ]
                },
                {
                    "judul": "Penerapan Model Pembelajaran Advance Organizer berbantuan Artificial Intelligence (AI) terhadap Peningkatan Pemahaman Konsep Mahasiswa Pendidikan Fisika Universitas Sulawesi Barat",
                    "bidang": ["Digitalisasi: AI & Semikonduktor"],
                },
                {
                    "judul": "Penguatan Model Pembelajaran Berbasis Proyek untuk Meningkatkan Kemampuan Mahasiswa Vokasi Administrasi Bisnis Politeknik Kota Medan",
                    "bidang": ["Hilirisasi & Industrialisasi"],
                    "paragraf": [
                        "Riset ini berfokus pada peningkatan kualitas SDM vokasi di bidang administrasi bisnis. Lulusan vokasi administrasi bisnis merupakan salah satu pendukung kunci proses hilirisasi dan industrialisasi, karena mereka dapat berperan dalam manajemen operasional, tata kelola bisnis, administrasi produksi, logistik, serta layanan pelanggan di berbagai sektor industri. Penguatan model pembelajaran berbasis proyek akan membuat mahasiswa lebih siap menghadapi dunia kerja nyata, memahami alur bisnis dari hulu ke hilir, dan mampu mengelola proses bisnis secara efisien. Dengan demikian, riset ini mendukung hilirisasi & industrialisasi melalui penguatan kapasitas tenaga kerja terampil yang akan mengisi ekosistem industri dan rantai nilai."
                    ]
                }
            ]
        }
    ];

    useEffect(() => {
        // Load Plotly from CDN if not available
        if (!window.Plotly) {
            const script = document.createElement('script');
            script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
            script.async = true;
            script.onload = () => {
                renderCharts();
                setLoading(false);
            };
            document.head.appendChild(script);
        } else {
            renderCharts();
            setLoading(false);
        }

        function renderCharts() {
            if (!window.Plotly) return;

            // 1. SANKEY LOGIC
            const topics = Object.keys(data_matrix);
            const matrix = topics.map(topic =>
                chartCategories.map((_, catIndex) => (data_matrix[topic][catIndex] || []).length)
            );

            const topicScores = matrix.map(row => row.filter(x => x > 0).length);
            const top15Indices = [...Array(topics.length).keys()]
                .sort((a, b) => topicScores[b] - topicScores[a])
                .slice(0, 15);

            const topTopics = top15Indices.map(i => topics[i]);

            let source = [], target = [], value = [];
            let labels = [...topTopics, ...chartCategories];

            for (let ti = 0; ti < topTopics.length; ti++) {
                const topicName = topTopics[ti];
                for (let ci = 0; ci < chartCategories.length; ci++) {
                    const count = data_matrix[topicName][ci].length;
                    if (count > 0) {
                        source.push(ti);
                        target.push(topTopics.length + ci);
                        value.push(count);
                    }
                }
            }

            let hoverText = source.map((s, i) =>
                `Topic: <b>${labels[s]}</b><br>Kategori: <b>${labels[target[i]]}</b><br>Jumlah: <b>${value[i]}</b>`
            );

            const nodeColors = [
                ...Array(topTopics.length).fill("lightblue"),
                "coral", "lightgreen", "gold", "plum", "pink", "lightcyan", "peachpuff", "lavender"
            ];

            const sankeyData = {
                type: "sankey", orientation: "h",
                node: { pad: 15, thickness: 20, line: { color: "black", width: 0.5 }, label: labels, color: nodeColors },
                link: { source, target, value, hovertemplate: "%{customdata}<extra></extra>", customdata: hoverText }
            };

            const sankeyLayoutDesktop = { height: 700, font: { size: 10, family: 'Inter, sans-serif' }, margin: { t: 40, b: 40, l: 10, r: 10 } };
            const sankeyLayoutMobile = { height: 500, font: { size: 8, family: 'Inter, sans-serif' }, margin: { t: 40, b: 40, l: 10, r: 10 } };

            if (document.getElementById("sankey-desktop")) window.Plotly.newPlot("sankey-desktop", [sankeyData], sankeyLayoutDesktop);
            if (document.getElementById("sankey-mobile")) window.Plotly.newPlot("sankey-mobile", [sankeyData], sankeyLayoutMobile);

            // 2. HEATMAP LOGIC
            const intensityMatrix = topics.map(topic => chartCategories.map((_, j) => (data_matrix[topic][j] || []).length));
            const heatmapHoverText = topics.map(topic => chartCategories.map(cat => {
                const codes = data_matrix[topic][chartCategories.indexOf(cat)] || [];
                return codes.length > 0
                    ? `<b>${topic}</b><br>${cat}<br>Jumlah: <b>${codes.length}</b><br>Kode: ${codes.join(", ")}`
                    : `<b>${topic}</b><br>${cat}<br><i>Tidak relevan</i>`;
            }));

            const heatmapData = [{
                z: intensityMatrix, x: chartCategories, y: topics, type: 'heatmap',
                colorscale: [[0, '#ffffff'], [0.1, '#e0f2fe'], [0.3, '#bae6fd'], [0.5, '#7dd3fc'], [0.7, '#38bdf8'], [1.0, '#0ea5e9']],
                text: heatmapHoverText, hovertemplate: '%{text}<extra></extra>',
                colorbar: { title: 'Jumlah Kode', titleside: 'right', thickness: 15 }
            }];

            const heatmapLayoutDesktop = {
                xaxis: { title: '<b>8 Bidang Strategis</b>', tickangle: -45, tickfont: { size: 10 } },
                yaxis: { title: '<b>Topik Riset</b>', automargin: true, tickfont: { size: 9 } },
                margin: { l: 200, r: 50, t: 50, b: 120 },
                hoverlabel: { bgcolor: "#1e293b", font: { color: "#fff" } }
            };

            const heatmapLayoutMobile = {
                xaxis: { title: '<b>Bidang</b>', tickangle: -60, tickfont: { size: 8 } },
                yaxis: { title: '<b>Topik</b>', automargin: true, tickfont: { size: 8 } },
                margin: { l: 150, r: 30, t: 40, b: 100 },
                height: 600
            };

            if (document.getElementById("heatmap-desktop")) window.Plotly.newPlot('heatmap-desktop', heatmapData, heatmapLayoutDesktop);
            if (document.getElementById("heatmap-mobile")) window.Plotly.newPlot('heatmap-mobile', heatmapData, heatmapLayoutMobile);
        }
    }, [data_matrix]);

    return (
        <MainLayout
            title="Panduan Rumusan Masalah 8 Industri Strategis (Beta)"
            headerTitle={<>Rumusan Masalah 8 Industri Strategis <span className="font-normal text-gray-800">(Beta)</span></>}
        >
            <NavigationTabs activePage="rumusan-masalah" />

            {/* Tombol Floating Mobile - Muncul di kanan tengah */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#3374cd] text-white p-3 rounded-l-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            {/* Mobile Drawer Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Drawer Content */}
            <div className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-800">Navigasi Bidang</h2>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:text-gray-900">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <Link
                        href="/rumusan-masalah"
                        className="p-3 bg-[#4285f4] text-white font-bold text-center rounded-lg mb-6 shadow-md hover:bg-blue-600 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        Lihat Panduan
                    </Link>

                    <div className="space-y-1">
                        {categories && categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/rumusan-masalah#${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2"
                            >
                                <img
                                    src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/storage/${category.image}`}
                                    alt={category.name}
                                    className="w-8 h-8 object-contain"
                                />
                                <span className="text-[14px] text-gray-700 font-medium">{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:max-w-[90%] mx-auto mb-10 mt-6 lg:px-0 px-4">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Sidebar Kiri (Desktop Only) */}
                    <div className="hidden lg:block w-full lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                            <Link
                                href="/rumusan-masalah"
                                className="p-3 bg-[#3374cd] text-white font-bold text-center text-lg block hover:bg-blue-700 transition-colors"
                            >
                                Lihat Panduan
                            </Link>
                            <div className="flex flex-col py-1">
                                {categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/rumusan-masalah#${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 rounded-md mx-2 mb-1 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-transparent"
                                        >
                                            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                                                {category.image ? (
                                                    <img
                                                        src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/storage/${category.image}`}
                                                        alt={category.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>'; }}
                                                    />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                )}
                                            </div>
                                            <span className="text-[14px] text-gray-700 font-medium">{category.name}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-4 bg-blue-50/50">
                                        <ul className="space-y-4">
                                            {/* (Fallback hardcoded list if categories prop is missing) */}
                                            {['Kesehatan', 'Pangan', 'Energi', 'Maritim', 'Pertahanan', 'Digitalisasi: AI & Semikonduktor', 'Manufaktur & Material Maju', 'Hilirisasi & Industrialisasi'].map((f, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">{i + 1}</div>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Konten Kanan */}
                    <div className="w-full lg:w-3/4 space-y-12">

                        {/* Section 1: Intro */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-500/10 p-8 animate-fade-in">
                            <h1 className="lg:text-2xl text-xl font-bold mb-6 text-gray-900">
                                Panduan Pemilihan Rumusan Masalah
                            </h1>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6 space-y-4">
                                <p className="text-gray-700 leading-relaxed text-justify">
                                    Daftar rumusan masalah pada laman ini menjadi <strong>acuan utama</strong> dalam penyusunan rumusan masalah dalam proposal program riset dan pengembangan Ditjen Risbang. Penggunaan daftar ini sebagai acuan dimaksudkan untuk menjaga keselarasan antara usulan dengan arah kebijakan inovasi nasional berbasis program dan prioritas, sehingga luaran program riset lebih terkonsolidasi dan terarah, serta memudahkan proses seleksi dan evaluasi karena setiap usulan dapat pada kerangka masalah yang sama tanpa membatasi kreativitas peneliti dalam mengembangkan pendekatan, metode, maupun solusi yang diusulkan.
                                </p>

                                <p className="text-gray-700 leading-relaxed text-justify">
                                    Bidang yang tercakup meliputi <strong>STEM dan Sosial Humaniora</strong> (antara lain seni, pendidikan, budaya, bisnis, ekonomi, kebijakan publik, hukum, dan bidang terkait lainnya) yang seluruhnya diarahkan untuk mendukung delapan (8) bidang strategis berikut:
                                </p>

                                <div className="space-y-1 pl-4 py-2">
                                    {[
                                        '1. Kesehatan',
                                        '2. Pangan',
                                        '3. Energi',
                                        '4. Maritim',
                                        '5. Pertahanan',
                                        '6. Digitalisasi (termasuk AI & Semikonduktor)',
                                        '7. Hilirisasi & Industrialisasi',
                                        '8. Manufaktur & Material Maju'
                                    ].map((item, i) => (
                                        <div key={i} className="text-[15px] text-gray-800">
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <p className="text-gray-700 leading-relaxed text-justify">
                                    Pendekatan ini dipilih karena tantangan di bidang industri strategis tidak hanya bersifat teknis, tetapi juga terkait dengan dimensi sosial, ekonomi, budaya, regulasi, dan perilaku, sehingga kolaborasi antara STEM dan Sosial Humaniora diharapkan menghasilkan solusi yang komprehensif, aplikatif, dan berkelanjutan. Selain itu, keterlibatan berbagai disiplin ilmu akan memperkaya sudut pandang dan memicu peluang inovasi yang lebih luas dalam mendukung transformasi delapan (8) bidang strategis.
                                </p>

                                <p className="text-gray-700 leading-relaxed text-justify">
                                    Program riset dan pengembangan Ditjen Risbang dirancang untuk mengakomodasi berbagai bidang ilmu dan mendorong partisipasi seluas-luasnya dari berbagai disiplin. Namun demikian, untuk menjaga fokus dan arah program berdasarkan <b>8 bidang strategis</b>, setiap usulan penelitian diharapkan dapat <b>menunjukkan keterkaitan, kontribusi, atau relevansinya</b> dengan salah satu atau beberapa bidang strategis dimaksud.
                                </p>

                                <p className="text-gray-700 leading-relaxed text-justify">
                                    Peneliti dari berbagai disiplin ilmu, termasuk sains, teknik, sosial-humaniora, ekonomi, maupun bidang lainnya, didorong untuk menjelaskan secara eksplisit hubungan antara usulan penelitian dengan bidang strategis yang dituju. Dalam proposal, mohon disampaikan secara ringkas dan jelas bagaimana penelitian yang diusulkan mendukung atau berkontribusi terhadap salah satu atau beberapa bidang strategis dimaksud.
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Sankey Charts */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-500/10 p-8">
                            <h2 className="lg:text-2xl text-xl font-bold mb-4 flex items-center gap-3">
                                Aliran Keterhubungan
                            </h2>
                            <p className="text-gray-600 mb-8">Visualisasi keterkaitan antara Topik Riset dengan 8 Bidang Strategis.</p>

                            {loading ? (
                                <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-xl animate-pulse">
                                    <p className="text-gray-400">Memuat Visualisasi...</p>
                                </div>
                            ) : (
                                <div id="sankey-wrapper" className="overflow-x-auto">
                                    <div id="sankey-desktop" className="hidden lg:block w-full"></div>
                                    <div id="sankey-mobile" className="block lg:hidden w-full"></div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Heatmap */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-500/10 p-8">
                            <h2 className="lg:text-2xl text-xl font-bold mb-4 flex items-center gap-3">
                                Pemetaan Kepadatan Riset
                            </h2>
                            <p className="text-gray-600 mb-8">Heatmap yang menunjukkan konsentrasi rumusan masalah per bidang.</p>

                            {loading ? (
                                <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-xl animate-pulse">
                                    <p className="text-gray-400">Memuat Heatmap...</p>
                                </div>
                            ) : (
                                <div id="heatmap-wrapper" className="overflow-x-auto">
                                    <div id="heatmap-desktop" className="hidden lg:block w-full min-h-[800px]"></div>
                                    <div id="heatmap-mobile" className="block lg:hidden w-full min-h-[600px]"></div>
                                </div>
                            )}
                        </div>

                        {/* Section 4: Contoh Topik */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-500/10 p-8">
                            <h2 className="lg:text-2xl text-xl font-bold mb-8 flex items-center gap-3">
                                Berikut Beberapa Contoh
                            </h2>
                            <div className="space-y-12">
                                {dataTopik.map((t, idx) => (
                                    <div key={idx} className="space-y-6">
                                        <p className="text-lg font-bold w-fit px-4 py-1.5 rounded-lg text-white bg-[#3E7DCA] shadow-md">
                                            Topik: {t.topik}
                                        </p>
                                        <div className="grid grid-cols-1 gap-6">
                                            {t.contoh.map((c, cidx) => (
                                                <div key={cidx} className="bg-gray-50 p-6 rounded-2xl space-y-4">
                                                    <p className="text-[#3374cd] font-bold text-xs uppercase tracking-widest">Contoh {cidx + 1}</p>
                                                    <div className="bg-white/50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                                                        <blockquote className="italic font-bold text-gray-900 text-lg leading-relaxed">
                                                            “{c.judul}”
                                                        </blockquote>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-sm font-bold text-gray-700">Teknologi maupun implementasi kebijakan riset ini dapat dipetakan ke:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {c.bidang.map((b, bidx) => (
                                                                <span key={bidx} className="px-4 py-1.5 bg-[#FFD700] text-gray-900 rounded-lg text-xs font-bold uppercase shadow-sm">
                                                                    {b}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4 text-gray-700 leading-relaxed text-sm text-justify pt-2">
                                                        {c.paragraf && c.paragraf.map((p, pidx) => (
                                                            <p key={pidx}>{p}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 5: Langkah Praktis */}
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

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
