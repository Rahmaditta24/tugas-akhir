import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Login({ errors }) {
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-full max-w-md">
                {/* Logos */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6 opacity-90">
                    <img src="/assets/images/logo/Ditjen%20Risbang.png" alt="Ditjen Risbang" className="h-16 object-contain max-w-[640px]" />
                </div>
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Admin</h1>
                    <p className="text-slate-600">Pemetaan Riset Berdampak</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
                   {/* <h2 className="text-xl font-semibold text-slate-800 mb-6">Masuk ke Admin Panel</h2> *}

                    {/* Email Field */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors?.email
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-slate-300 focus:ring-blue-500'
                            }`}
                            placeholder="admin@example.com"
                            required
                            autoFocus
                        />
                        {errors?.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors?.password
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-slate-300 focus:ring-blue-500'
                            }`}
                            placeholder="••••••••"
                            required
                        />
                        {errors?.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">Ingat saya</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-colors ${
                            processing
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {processing ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </span>
                        ) : (
                            'Masuk'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}


