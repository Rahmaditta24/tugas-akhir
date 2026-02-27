import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/forgot-password');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <Head title="Lupa Password" />
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6 opacity-90">
                    <img src="/assets/images/logo/Ditjen%20Risbang.png" alt="Ditjen Risbang" className="h-16 object-contain max-w-[640px]" />
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Lupa Password</h1>
                    <p className="text-slate-600 text-sm">
                        Masukkan email kamu dan kami akan mengirimkan link untuk mereset password.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">

                    {/* Status sukses */}
                    {status && (
                        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{status}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Alamat Email
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

                        {/* Submit */}
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
                                    Mengirim...
                                </span>
                            ) : (
                                'Kirim Link Reset Password'
                            )}
                        </button>
                    </form>

                    {/* Kembali ke login */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/admin/login"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                            Kembali ke halaman login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
