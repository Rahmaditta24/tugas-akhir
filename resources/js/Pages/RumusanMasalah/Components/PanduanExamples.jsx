import React from 'react';
import { dataTopik } from '../Constants/panduanData';

export default function PanduanExamples() {
    return (
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
    );
}
