import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LocationSelect = ({
    selectedProvince,
    selectedRegency,
    onProvinceChange,
    onRegencyChange,
    errors = {},
    isRegencyOptional = false,
    showRequiredIndicator = true,
    hideRegency = false,
    provinceErrorKey = 'provinsi',
    regencyErrorKey = 'kota'
}) => {
    // ... (lines 11-114 remain unchanged, but we are skipping them in replacement content if possible, but replace_file_content needs contiguous block. 
    // Actually, I should probably replace the function signature and the JSX part separately or the whole file content? No, whole file is too big.
    // I will replace the signature first.

    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingRegencies, setLoadingRegencies] = useState(false);

    const toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    };

    const normalizeRegencyName = (s) => {
        const t = String(s || '').trim();
        if (!t) return '';
        // Handle "kab." prefix case-insensitively first
        let x = t.replace(/^kab\.\s*/i, 'Kabupaten ')
            .replace(/^kab\s+/i, 'Kabupaten ');

        // Remove extra spaces
        x = x.replace(/\s+/g, ' ');

        // Apply Title Case
        return toTitleCase(x);
    };

    // Fetch Provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            try {
                const response = await axios.get('/api/provinces');
                const titleCasedData = response.data.map(p => ({ ...p, name: toTitleCase(p.name) }));
                setProvinces(titleCasedData);
            } catch (error) {
                console.error('Error fetching provinces:', error);
            } finally {
                setLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch Regencies based on selected province
    useEffect(() => {
        const fetchRegencies = async () => {
            if (!selectedProvince) {
                setRegencies([]);
                return;
            }

            // Find province ID
            // Find province ID - case insensitive match
            const provinceObj = provinces.find(p =>
                p.name.toLowerCase() === selectedProvince.toLowerCase()
            );
            if (!provinceObj) return;

            setLoadingRegencies(true);
            try {
                const response = await axios.get(`/api/regencies/${provinceObj.id}`);
                const titleCasedData = response.data.map(r => ({ ...r, name: normalizeRegencyName(r.name) }));
                setRegencies(titleCasedData);
            } catch (error) {
                console.error('Error fetching regencies:', error);
            } finally {
                setLoadingRegencies(false);
            }
        };

        if (provinces.length > 0) {
            fetchRegencies();
        }
    }, [selectedProvince, provinces]);

    return (
        <div className={`grid grid-cols-1 ${hideRegency ? '' : 'md:grid-cols-2'} gap-4`}>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Provinsi {showRequiredIndicator && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <select
                        value={selectedProvince}
                        onChange={(e) => {
                            onProvinceChange(e.target.value);
                            onRegencyChange(''); // Reset regency when province changes
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 appearance-none bg-white ${errors[provinceErrorKey] ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                            }`}
                        required
                    >
                        <option value="">-- Pilih Provinsi --</option>
                        {loadingProvinces ? (
                            <option disabled>Memuat...</option>
                        ) : (
                            provinces.map((p) => (
                                <option key={p.id} value={p.name}>
                                    {p.name}
                                </option>
                            ))
                        )}
                        {selectedProvince && !provinces.find(p => p.name === selectedProvince) && (
                            <option value={selectedProvince}>{selectedProvince}</option>
                        )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
                {errors[provinceErrorKey] && <p className="mt-1 text-sm text-red-600">{errors[provinceErrorKey]}</p>}
            </div>

            {!hideRegency && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kota/Kabupaten {!isRegencyOptional && showRequiredIndicator && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                        <select
                            value={selectedRegency}
                            onChange={(e) => onRegencyChange(normalizeRegencyName(e.target.value))}
                            disabled={!selectedProvince || loadingRegencies}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 appearance-none bg-white ${!selectedProvince ? 'bg-slate-50 cursor-not-allowed' : ''
                                } ${errors[regencyErrorKey] || errors.kabupaten_kota ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            required={!isRegencyOptional}
                        >
                            <option value="">-- Pilih Kota/Kabupaten --</option>
                            {loadingRegencies ? (
                                <option disabled>Memuat...</option>
                            ) : (
                                regencies.map((r) => (
                                    <option key={r.id} value={r.name}>
                                        {r.name}
                                    </option>
                                ))
                            )}
                            {/* Fallback for existing data that might not match exactly */}
                            {selectedRegency && !regencies.find(r => r.name === normalizeRegencyName(selectedRegency)) && (
                                <option value={normalizeRegencyName(selectedRegency)}>{normalizeRegencyName(selectedRegency)}</option>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                    {errors[regencyErrorKey] && <p className="mt-1 text-sm text-red-600">{errors[regencyErrorKey]}</p>}
                    {errors.kabupaten_kota && <p className="mt-1 text-sm text-red-600">{errors.kabupaten_kota}</p>}
                </div>
            )}
        </div>
    );
};

export default LocationSelect;
