import React from 'react';

export default function PanduanIntro() {
    return (
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
    );
}
