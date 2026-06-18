import { useState, useEffect } from 'react';
import axios from 'axios';
import CustomSelect from './CustomSelect';

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
        // Menangani awalan "kab." secara case-insensitive
        let x = t.replace(/^kab\.\s*/i, 'Kabupaten ')
            .replace(/^kab\s+/i, 'Kabupaten ');

        // Hapus spasi berlebih
        x = x.replace(/\s+/g, ' ');

        // Terapkan Title Case
        return toTitleCase(x);
    };

    // Ambil data Provinsi
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            try {
                const response = await axios.get('/api/provinces');
                const rawData = response.data;
                
                // Validasi keamanan: pastikan rawData adalah array
                const dataArray = Array.isArray(rawData) ? rawData : Object.values(rawData || {});
                
                const titleCasedData = dataArray.map(p => ({ 
                    ...p, 
                    name: toTitleCase(p.name || '') 
                }));
                setProvinces(titleCasedData);
            } catch (error) {
                console.error('Error fetching provinces:', error);
            } finally {
                setLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // Ambil data Kabupaten/Kota berdasarkan provinsi yang dipilih
    useEffect(() => {
        const fetchRegencies = async () => {
            if (!selectedProvince) {
                setRegencies([]);
                return;
            }

            // Cari ID provinsi - pencocokan case insensitive
            const provinceObj = provinces.find(p =>
                p.name.toLowerCase() === selectedProvince.toLowerCase()
            );
            if (!provinceObj) return;

            setLoadingRegencies(true);
            try {
                const response = await axios.get(`/api/regencies/${provinceObj.id}`);
                const rawData = response.data;
                
                // Validasi keamanan: pastikan rawData adalah array
                const dataArray = Array.isArray(rawData) ? rawData : Object.values(rawData || {});
                
                const titleCasedData = dataArray.map(r => ({ 
                    ...r, 
                    name: normalizeRegencyName(r.name || '') 
                }));
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
                    <CustomSelect
                        value={selectedProvince}
                        onChange={(val) => {
                            onProvinceChange(val);
                            onRegencyChange('');
                        }}
                        options={provinces.map(p => ({ value: p.name, label: p.name }))}
                        placeholder={loadingProvinces ? "Memuat..." : "-- Pilih Provinsi --"}
                        error={!!errors[provinceErrorKey]}
                        required={true}
                    />
                </div>
                {errors[provinceErrorKey] && <p className="mt-1 text-sm text-red-600">{errors[provinceErrorKey]}</p>}
            </div>

            {!hideRegency && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kota/Kabupaten {!isRegencyOptional && showRequiredIndicator && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                        <CustomSelect
                            value={selectedRegency}
                            onChange={(val) => onRegencyChange(normalizeRegencyName(val))}
                            options={regencies.map(r => ({ value: r.name, label: r.name }))}
                            placeholder={loadingRegencies ? "Memuat..." : "-- Pilih Kota/Kabupaten --"}
                            disabled={!selectedProvince || loadingRegencies}
                            error={!!(errors[regencyErrorKey] || errors.kabupaten_kota)}
                            required={!isRegencyOptional}
                        />
                    </div>
                    {errors[regencyErrorKey] && <p className="mt-1 text-sm text-red-600">{errors[regencyErrorKey]}</p>}
                    {errors.kabupaten_kota && <p className="mt-1 text-sm text-red-600">{errors.kabupaten_kota}</p>}
                </div>
            )}
        </div>
    );
};

export default LocationSelect;
