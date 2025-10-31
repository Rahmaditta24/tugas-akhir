import React, { useState } from 'react';

export default function MapControls({
    onSearch,
    onDisplayModeChange,
    onReset,
    onDownload,
    displayMode = 'peneliti'
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <>
            {/* Search Box - Positioned over map */}
            <div className="absolute z-20 top-5 left-1/2 -translate-x-1/2 lg:w-1/2 w-full">
                <div className="relative w-full pl-12 pr-3">
                    <svg
                        className="absolute left-14 top-2 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 11.5a7.5 7.5 0 1 1-15 0a7.5 7.5 0 0 1 15 0m-2.107 5.42l3.08 3.08"
                        />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Cari penelitian, universitas, atau peneliti..."
                        className="w-full pl-9 lg:w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Control Buttons - Positioned at bottom of map */}
            <div className="absolute z-20 bottom-5 left-1/2 -translate-x-1/2 lg:w-1/2 w-full px-3 lg:px-0">
                <div className="flex flex-wrap items-center gap-1 lg:gap-3">
                    {/* Peneliti Button */}
                    <button
                        onClick={() => onDisplayModeChange('peneliti')}
                        className={`flex items-center justify-center gap-1 text-xs px-2 py-1 lg:px-3 lg:py-2 rounded-full font-semibold transition-colors ${
                            displayMode === 'peneliti'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
                            <path fill="currentColor" fillRule="evenodd"
                                d="M16.432 15C14.387 9.893 12 8.547 12 6V3h.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5H8v3c0 2.547-2.387 3.893-4.432 9c-.651 1.625-2.323 4 6.432 4s7.083-2.375 6.432-4m-1.617 1.751c-.702.21-2.099.449-4.815.449s-4.113-.239-4.815-.449c-.249-.074-.346-.363-.258-.628c.22-.67.635-1.828 1.411-3.121c1.896-3.159 3.863.497 5.5.497s1.188-1.561 1.824-.497a15.4 15.4 0 0 1 1.411 3.121c.088.265-.009.553-.258.628"
                                clipRule="evenodd" />
                        </svg>
                        Peneliti
                    </button>

                    {/* Institusi Button */}
                    <button
                        onClick={() => onDisplayModeChange('institusi')}
                        className={`flex items-center justify-center gap-1 text-xs px-2 py-1 lg:px-3 lg:py-2 rounded-full font-semibold transition-colors ${
                            displayMode === 'institusi'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" fillRule="evenodd"
                                d="M11.612 3.302c.243-.07.5-.07.743 0c.518.147 1.04.283 1.564.42c2.461.641 4.96 1.293 7.184 3.104l1.024.834c.415.338.623.84.623 1.34v7a.75.75 0 0 1-1.5 0v-4.943l-.163.133a12 12 0 0 1-2.398 1.513q.06.137.061.297v4.294a2.75 2.75 0 0 1-1.751 2.562l-4 1.56a2.75 2.75 0 0 1-1.998 0l-4-1.56a2.75 2.75 0 0 1-1.751-2.562V13q.001-.163.064-.304c-.83-.399-1.64-.89-2.417-1.522l-1.024-.834c-.83-.677-.83-2.003 0-2.68l1.04-.85c2.207-1.8 4.689-2.449 7.132-3.087a74 74 0 0 0 1.567-.421m9.638 5.699c0-.09-.036-.15-.07-.178l-1.024-.834C18 6.5 16.078 5.843 13.64 5.202a91 91 0 0 1-1.656-.446c-.57.161-1.124.307-1.662.449c-2.42.636-4.529 1.191-6.46 2.768l-1.041.849c-.035.028-.071.087-.071.177s.036.15.07.178l1.025.834c1.948 1.587 4.076 2.146 6.515 2.787q.805.208 1.656.446c.57-.161 1.124-.307 1.662-.449c2.42-.636 4.529-1.191 6.46-2.767l1.041-.85c.035-.028.071-.087.071-.177m-7.294 5.276c1.1-.287 2.207-.577 3.294-.972v3.989c0 .515-.316.977-.796 1.165l-4 1.559a1.25 1.25 0 0 1-.908 0l-4-1.56a1.25 1.25 0 0 1-.796-1.164v-3.998c1.099.4 2.219.692 3.33.982c.525.137 1.047.273 1.565.42c.243.07.5.07.743 0c.519-.148 1.042-.284 1.568-.421"
                                clipRule="evenodd" />
                        </svg>
                        Institusi
                    </button>

            {/* Advanced Search removed for simpler UX */}

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center gap-2 lg:text-sm text-xs bg-gray-100 text-black p-2 lg:px-4 lg:py-2 rounded-full font-semibold transition-colors hover:bg-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
                            <path fill="currentColor" fillRule="evenodd"
                                d="M5.905.28A8 8 0 0 1 14.5 3.335V1.75a.75.75 0 0 1 1.5 0V6h-4.25a.75.75 0 0 1 0-1.5h1.727a6.5 6.5 0 1 0 .526 5.994a.75.75 0 1 1 1.385.575A8 8 0 1 1 5.905.279Z"
                                clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Download Excel Button */}
                    <button
                        onClick={onDownload}
                        className="flex items-center justify-center gap-2 lg:text-sm text-xs bg-green-600 text-white px-4 py-2 rounded-full font-semibold transition-colors hover:bg-green-700"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                            </path>
                        </svg>
                        Excel
                    </button>
                </div>
            </div>
        </>
    );
}
