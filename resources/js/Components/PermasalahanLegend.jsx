import React, { useState } from 'react';

export default function PermasalahanLegend({
    activeData = 'Sampah',
    source = 'Kementerian Lingkungan Hidup 2024',
    minValue = '26.823,56',
    maxValue = '6.333.185,65',
    unit = 'ton/tahun'
}) {
    const [minRange, setMinRange] = useState(0);
    const [maxRange, setMaxRange] = useState(100);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Header Info Bar */}
            <div className="bg-[#EBF5FF] px-6 py-3 flex flex-col md:flex-row justify-between items-start md:items-center text-sm border-b border-blue-100">
                <div className="font-medium text-gray-800">
                    <span className="font-bold">Data Dipilih:</span> {activeData}
                    <br className="md:hidden" />
                    <span className="hidden md:inline mx-4 text-gray-400">|</span>
                    <span className="font-bold">Jenis Bubble Dipilih:</span> Penelitian
                </div>
                <div className="text-gray-600 mt-1 md:mt-0">
                    <span className="font-bold text-gray-800">Sumber Data:</span> {source}
                </div>
            </div>

            {/* Legend Content */}
            <div className="p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">
                    Timbulan {activeData} ({unit})
                </h3>

                {/* Gradient Bar */}
                <div className="relative mb-2">
                    <div
                        className="h-4 w-full rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, #4ade80 0%, #facc15 50%, #f87171 100%)'
                        }}
                    ></div>
                    <div className="flex justify-between text-xs font-bold mt-1 text-gray-700">
                        <span>Rendah</span>
                        <span>Tinggi</span>
                    </div>
                </div>

                {/* Min/Max Values Display */}
                <div className="flex justify-between text-xs text-gray-500 mb-6">
                    <div>
                        <div>Min: {minValue}</div>
                    </div>
                    <div>
                        <div>Maksimum: {maxValue}</div>
                    </div>
                </div>

                {/* Sliders Area */}
                <div className="space-y-6">
                    {/* Min Slider */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <label className="font-medium text-gray-700">Atur skala minimum</label>
                            <span className="text-gray-500">Minimum: {parseFloat(minValue.replace(/\./g, '').replace(',', '.')).toLocaleString('id-ID')}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={minRange}
                            onChange={(e) => setMinRange(e.target.value)}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="text-xs text-gray-400 mt-1">0%</div>
                    </div>

                    {/* Max Slider */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <label className="font-medium text-gray-700">Atur skala maksimum</label>
                            <span className="text-gray-500">Maksimum: {parseFloat(maxValue.replace(/\./g, '').replace(',', '.')).toLocaleString('id-ID')}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={maxRange}
                            onChange={(e) => setMaxRange(e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            style={{ height: '4px' }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>10%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* Reset Buttons */}
                <div className="mt-6 flex gap-3 text-xs">
                    <button
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        onClick={() => setMinRange(0)}
                    >
                        Reset minimum
                    </button>
                    <button
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        onClick={() => setMaxRange(100)}
                    >
                        Reset maksimum
                    </button>

                    <label className="flex items-center gap-2 ml-auto cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span className="text-gray-600">Tidak ada data</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
