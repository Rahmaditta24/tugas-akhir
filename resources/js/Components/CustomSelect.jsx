import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({
    value,
    onChange,
    options, // array of strings or {value, label} objects
    placeholder = "-- Pilih --",
    className = "",
    error = false,
    required = false,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Normalisasi opsi menjadi array object {value, label}
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'string' || typeof opt === 'number') {
            return { value: opt, label: opt };
        }
        return opt;
    });

    const selectedOption = normalizedOptions.find(
        opt => opt.value?.toString().toLowerCase() === value?.toString().toLowerCase()
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Hidden select for form submission & browser validation support if needed */}
            <select
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled}
                tabIndex={-1}
            >
                <option value="">{placeholder}</option>
                {normalizedOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-4 py-2 text-left bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'
                } ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                }`}
            >
                <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-700'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="flex items-center pointer-events-none ml-2">
                    <svg
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-1">
                    <ul className="py-1">
                        <li
                            className={`px-4 py-2 text-sm cursor-pointer transition-colors ${!value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            onClick={() => handleSelect('')}
                        >
                            {placeholder}
                        </li>
                        {normalizedOptions.map((opt, idx) => (
                            <li
                                key={idx}
                                className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                                    value === opt.value
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                <span className="block truncate">{opt.label}</span>
                                {value === opt.value && (
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
