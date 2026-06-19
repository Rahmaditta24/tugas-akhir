import React from 'react';
import CustomSelect from '@/Components/CustomSelect';
import { TIPE_PERMASALAHAN_OPTIONS, PER_PAGE_OPTIONS } from '@/Constants/options';

export default function PermasalahanFilter({ context, filters }) {
    const {
        search, setSearch,
        baseData, handleBaseDataChange,
        jenis, handleJenisChange,
        batchType, setBatchType,
        perPage, handlePerPageChange,
        handleSearch, resetFilters,
        columnFilters
    } = context;

    return (
        <div className="p-4 sm:p-6 border-b border-slate-200/60 bg-white">
            <form onSubmit={handleSearch} className="space-y-4">
                {/* Row 1: Search and Main Actions */}
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="w-full flex-1">
                        <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            {baseData === 'statistik' ? 'Cari Provinsi / Jenis' : 'Cari Riset'}
                        </label>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={baseData === 'statistik' ? 'Cari provinsi atau jenis...' : 'Cari judul, peneliti / pengusul...'}
                            className="w-full px-4 py-1.5 sm:py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button type="submit" className="flex-1 sm:flex-none px-5 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-all active:scale-95 shadow-sm shadow-blue-100">
                            Cari
                        </button>
                        {(filters.search || filters.batch_type || Object.values(columnFilters).some(v => v)) && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="flex-1 sm:flex-none px-5 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold transition-colors text-sm text-center"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Row 2: Secondary Filters */}
                <div className="flex gap-4 items-end flex-wrap border-t border-slate-100 pt-4">
                    <div className="w-fit min-w-[140px] sm:min-w-[200px]">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Base Data</label>
                        <CustomSelect
                            value={baseData}
                            onChange={(val) => handleBaseDataChange({ target: { value: val } })}
                            options={[
                                { value: "statistik", label: "Data Statistik (Raw)" },
                                { value: "penelitian", label: "Data Penelitian" },
                                { value: "pengabdian", label: "Data Pengabdian" },
                                { value: "hilirisasi", label: "Data Hilirisasi" }
                            ]}
                            placeholder={"-- Pilih --"}
                            error={false}
                        />
                    </div>

                    {baseData === 'pengabdian' && (
                        <div className="w-fit min-w-[140px] sm:min-w-[200px]">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jenis Pengabdian</label>
                            <CustomSelect
                                value={batchType}
                                onChange={val => setBatchType(val)}
                                options={["Multitahun Lanjutan, Batch I & Batch II", "Kosabangsa"]}
                                placeholder={"-- Pilih --"}
                                error={false}
                            />
                        </div>
                    )}

                    <div className="w-fit min-w-[140px] sm:min-w-[180px]">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipe Permasalahan</label>
                        <CustomSelect
                            value={jenis}
                            onChange={(val) => handleJenisChange({ target: { value: val } })}
                            options={TIPE_PERMASALAHAN_OPTIONS}
                            placeholder={"-- Pilih --"}
                            error={false}
                        />
                    </div>

                    <div className="w-fit sm:ml-auto flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Per halaman</span>
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="w-fit px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                        >
                            {PER_PAGE_OPTIONS.map(val => (<option key={val} value={val}>{val}</option>))}
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
}
