import React, { useState } from 'react';

export default function ResearchList({ researches = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFilter, setSearchFilter] = useState('all');

    const filteredResearches = researches.filter((research) => {
        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase();
        switch (searchFilter) {
            case 'title':
                return research.judul?.toLowerCase().includes(term);
            case 'university':
                return research.institusi?.toLowerCase().includes(term);
            case 'researcher':
                return research.nama?.toLowerCase().includes(term);
            case 'field':
                return research.bidang_fokus?.toLowerCase().includes(term);
            case 'priorityTheme':
                return research.tema_prioritas?.toLowerCase().includes(term);
            case 'category':
                return research.kategori_pt?.toLowerCase().includes(term);
            case 'cluster':
                return research.klaster?.toLowerCase().includes(term);
            case 'all':
            default:
                return (
                    research.judul?.toLowerCase().includes(term) ||
                    research.institusi?.toLowerCase().includes(term) ||
                    research.nama?.toLowerCase().includes(term) ||
                    research.bidang_fokus?.toLowerCase().includes(term)
                );
        }
    });

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex lg:flex-row flex-col lg:gap-0 gap-2 justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Daftar Penelitian</h3>
            </div>

            <div className="mb-4 flex lg:items-center lg:gap-8 gap-4 justify-between">
                <div className="relative w-full">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari penelitian, universitas, atau peneliti..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoComplete="off"
                    />
                </div>
                <div className="relative inline-block">
                    <select
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="px-4 pr-10 py-3 text-white lg:w-fit w-full border bg-[#3E7DCA] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                        <option value="all">Semua</option>
                        <option value="title">Judul Penelitian</option>
                        <option value="university">Universitas</option>
                        <option value="researcher">Peneliti</option>
                        <option value="field">Bidang Fokus</option>
                        <option value="priorityTheme">Tema Prioritas</option>
                        <option value="category">Kategori PT</option>
                        <option value="cluster">Klaster</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
                        <svg className="rotate-180" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024">
                            <path fill="currentColor" d="M104.704 685.248a64 64 0 0 0 90.496 0l316.8-316.8l316.8 316.8a64 64 0 0 0 90.496-90.496L557.248 232.704a64 64 0 0 0-90.496 0L104.704 594.752a64 64 0 0 0 0 90.496"/>
                        </svg>
                    </span>
                </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredResearches.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Tidak ada data penelitian ditemukan</p>
                ) : (
                    filteredResearches.map((research, index) => (
                        <div
                            key={index}
                            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <h4 className="font-semibold text-slate-800 mb-2">{research.judul}</h4>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p><strong>Universitas:</strong> {research.institusi}</p>
                                <p><strong>Peneliti:</strong> {research.nama}</p>
                                <p><strong>Bidang Fokus:</strong> {research.bidang_fokus}</p>
                                {research.tema_prioritas && (
                                    <p><strong>Tema Prioritas:</strong> {research.tema_prioritas}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
