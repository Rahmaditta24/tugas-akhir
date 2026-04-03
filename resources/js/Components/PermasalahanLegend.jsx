import React from 'react';
import { titleCase } from '../Utils/format';

export default function PermasalahanLegend({
    activeData = 'Sampah',
    source = 'Kementerian Lingkungan Hidup 2024',
    minValue = 0,
    maxValue = 0,
    unit = '',
    minPct = 0,
    maxPct = 100,
    onMinPctChange,
    onMaxPctChange,
}) {
    const fmtNum = (n) => (n !== null && n !== undefined && !isNaN(n)) ? Number(n).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';

    const currentMinValue = minValue + (maxValue - minValue) * (minPct / 100);
    const currentMaxValue = minValue + (maxValue - minValue) * (maxPct / 100);

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-2">
            {/* Legend Content */}
            <div className="p-4 space-y-4">
                {/* Title */}
                <h3 className="font-bold text-gray-900 text-sm">
                    {(() => {
                        const lower = activeData.toLowerCase();
                        const baseTitle = titleCase(activeData);
                        
                        if (lower === 'sampah') return "Timbulan Sampah";
                        if (lower === 'stunting' || lower === 'gizi buruk') return `Persentase ${baseTitle}`;
                        if (lower === 'ketahanan pangan') return `IKP ${baseTitle}`;
                        
                        return baseTitle;
                    })()} {unit ? `(${unit})` : ''}
                </h3>

                {/* Gradient Bar with Labels */}
                <div className="space-y-1">
                    <div
                        className="h-6 w-full rounded-md border border-gray-400"
                        style={{
                            background: (() => {
                                const isPangan = activeData.toLowerCase() === 'ketahanan pangan';
                                const GRAY = '#d1d5db';
                                
                                // Hex colors from legacy script-permasalahan.js
                                const GREEN_400 = '#4ade80';
                                const YELLOW_400 = '#fbbf24';
                                const RED_400 = '#f87171';
                                
                                const startColor = isPangan ? RED_400 : GREEN_400;
                                const midColor = YELLOW_400;
                                const endColor = isPangan ? GREEN_400 : RED_400;
                                
                                return `linear-gradient(90deg, 
                                    ${GRAY} 0%, 
                                    ${GRAY} ${minPct}%, 
                                    ${startColor} ${minPct}%, 
                                    ${midColor} ${(minPct + maxPct) / 2}%, 
                                    ${endColor} ${maxPct}%, 
                                    ${GRAY} ${maxPct}%, 
                                    ${GRAY} 100%)`;
                            })()
                        }}
                    ></div>
                    <div className="flex justify-between items-center text-xs font-bold text-black px-1">
                        <span>Rendah</span>
                        <span>Tinggi</span>
                    </div>
                </div>

                {/* Range Labels Row */}
                <div className="flex flex-col text-[11px] font-bold text-gray-700 leading-tight">
                    <p>Min: <span className="text-gray-900">{fmtNum(minValue)}</span></p>
                    <p>Max: <span className="text-gray-900">{fmtNum(maxValue)}</span></p>
                </div>

                {/* Sliders Area */}
                <div className="space-y-5 pt-1">
                    {/* Min Slider */}
                    <div className="relative">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-gray-800">Atur skala minimum</label>
                            <span className="text-xs font-medium text-gray-900">Minimum: <span className="font-bold">{fmtNum(currentMinValue)}</span></span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="90"
                            step="1"
                            value={minPct}
                            onChange={(e) => onMinPctChange && onMinPctChange(Number(e.target.value))}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all"
                            style={{ 
                                background: `linear-gradient(to right, #3E7DCA 0%, #3E7DCA ${(minPct / 90) * 100}%, #e5e7eb ${(minPct / 90) * 100}%, #e5e7eb 100%)`,
                                accentColor: '#3E7DCA' 
                            }}
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 leading-none">
                            <span>0%</span>
                            <span>90%</span>
                        </div>
                    </div>

                    {/* Max Slider */}
                    <div className="relative">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-gray-800">Atur skala maksimum</label>
                            <span className="text-xs font-medium text-gray-900">Maksimum: <span className="font-bold">{fmtNum(currentMaxValue)}</span></span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={maxPct}
                            onChange={(e) => onMaxPctChange && onMaxPctChange(Number(e.target.value))}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all"
                            style={{ 
                                background: `linear-gradient(to right, #3E7DCA 0%, #3E7DCA ${((maxPct - 10) / 90) * 100}%, #e5e7eb ${((maxPct - 10) / 90) * 100}%, #e5e7eb 100%)`,
                                accentColor: '#3E7DCA' 
                            }}
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 leading-none">
                            <span>10%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons Row */}
                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onMinPctChange && onMinPctChange(0)}
                            className="px-3 py-1.5 bg-[#E5E7EB] hover:bg-gray-300 text-gray-900 text-[10px] font-bold rounded transition-colors"
                        >
                            Reset Minimum
                        </button>
                        <button
                            onClick={() => onMaxPctChange && onMaxPctChange(100)}
                            className="px-3 py-1.5 bg-[#E5E7EB] hover:bg-gray-300 text-gray-900 text-[10px] font-bold rounded transition-colors"
                        >
                            Reset Maksimum
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-4 bg-[#e5e7eb] border border-gray-400 shadow-sm"></div>
                        <span className="text-xs font-bold text-gray-700">Tidak ada data</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
