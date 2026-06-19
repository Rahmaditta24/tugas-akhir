import React from 'react';

export default function CategoryDetail({ selectedCategory }) {
    if (!selectedCategory) {
        return (
            <div className="w-full lg:w-3/4">
                <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Pilih kategori untuk melihat rumusan masalah</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full lg:w-3/4">
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    {selectedCategory.order_number}. Rumusan Masalah {selectedCategory.name}
                </h2>

                <div className="space-y-6">
                    {selectedCategory.statements && selectedCategory.statements.length > 0 ? (
                        selectedCategory.statements.map((statement) => (
                            <div key={statement.id} className="relative pl-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-shrink-0 w-9 h-9 bg-[#3E7DCA] text-white rounded-md flex items-center justify-center font-bold text-sm shadow-sm">
                                        {statement.full_number}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                                            {statement.title}
                                        </h3>
                                    </div>
                                </div>

                                {statement.description && statement.description !== '-' && (
                                    <div className="lg:ml-12 bg-gray-50/80 rounded-lg p-5 border border-gray-100 text-gray-600 leading-relaxed text-[14px] text-justify shadow-sm">
                                        {statement.description}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500 italic">
                            Belum ada data rumusan masalah untuk kategori ini.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
