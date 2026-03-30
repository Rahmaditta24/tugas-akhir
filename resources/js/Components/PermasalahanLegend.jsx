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
    const fmtNum = (n) => (n !== null && n !== undefined && !isNaN(n)) ? Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '-';

    const currentMinValue = minValue + (maxValue - minValue) * (minPct / 100);
    const currentMaxValue = minValue + (maxValue - minValue) * (maxPct / 100);

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
            {/* Legend Content */}
            <div className="p-6 space-y-6">
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
                                const GREEN = '#4ade80';
                                const YELLOW = '#facc15';
                                const RED = '#f87171';
                                
                                const startColor = isPangan ? RED : GREEN;
                                const endColor = isPangan ? GREEN : RED;
                                
                                const mid = (minPct + maxPct) / 2;
                                
                                return `linear-gradient(90deg, 
                                    ${GRAY} 0%, 
                                    ${GRAY} ${minPct}%, 
                                    ${startColor} ${minPct}%, 
                                    ${YELLOW} ${mid}%, 
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
                <div className="space-y-8 pt-2">
                    {/* Min Slider */}
                    <div className="relative">
                        <div className="flex justify-between items-end mb-1">
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
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all hover:accent-blue-700"
                            style={{
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(minPct / 90) * 100}%, #e5e7eb ${(minPct / 90) * 100}%, #e5e7eb 100%)`
                            }}
                        />
                        <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 leading-none">
                            <span>0%</span>
                            <span>90%</span>
                        </div>
                    </div>

                    {/* Max Slider */}
                    <div className="relative">
                        <div className="flex justify-between items-end mb-1">
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
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all hover:accent-blue-700"
                            style={{
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((maxPct - 10) / 90) * 100}%, #e5e7eb ${((maxPct - 10) / 90) * 100}%, #e5e7eb 100%)`
                            }}
                        />
                        <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 leading-none">
                            <span>10%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-2">
                    <button
                        onClick={() => onMinPctChange && onMinPctChange(0)}
                        className="px-4 py-1.5 bg-[#E5E7EB] hover:bg-gray-300 text-gray-900 text-[11px] font-bold rounded transition-colors"
                    >
                        Reset minimum
                    </button>
                    <button
                        onClick={() => onMaxPctChange && onMaxPctChange(100)}
                        className="px-4 py-1.5 bg-[#E5E7EB] hover:bg-gray-300 text-gray-900 text-[11px] font-bold rounded transition-colors"
                    >
                        Reset maksimum
                    </button>
                    
                    <label className="flex items-center gap-2 ml-4 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 border border-gray-400 rounded-sm text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-black transition-colors">Tidak ada data</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
