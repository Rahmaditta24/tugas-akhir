import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CampusSelect = ({
    value,
    onChange,
    label = "Institusi",
    placeholder = "Ketik nama kampus...",
    name = "institusi",
    errors = {},
    required = false
}) => {
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const id = `campus-list-${name}`;

    const normalizeCampusName = (s) => {
        const t = String(s || '').trim();
        if (t.toLowerCase() === 'bogor agricultural university') return 'Institut Pertanian Bogor';
        return t;
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (value && value.length >= 2) {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/campuses/search`, {
                        params: { query: value }
                    });
                    setCampuses((response.data || []).map(normalizeCampusName));
                } catch (error) {
                    console.error('Error fetching campuses:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setCampuses([]);
            }
        }, 200); // 200ms debounce

        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    list={id}
                    type="text"
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={loading ? "Memuat daftar kampus..." : placeholder}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                        }`}
                    required={required}
                    autoComplete="off"
                />
                <datalist id={id}>
                    {campuses.map((campus, index) => (
                        <option key={index} value={campus} />
                    ))}
                </datalist>
                {loading && (
                    <div className="absolute right-3 top-2.5">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>
            {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
        </div>
    );
};

export default CampusSelect;
