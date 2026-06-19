import React from 'react';
import { Link } from '@inertiajs/react';
import useForgotPassword from '../Hooks/useForgotPassword';

export default function ForgotPasswordForm({ status }) {
    const { data, setData, processing, errors, submit } = useForgotPassword();

    return (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            {status && (
                <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{status}</span>
                </div>
            )}

            <div className="mb-4 text-left">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className={`w-full px-4 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 ${errors?.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500'
                        }`}
                    required
                    autoFocus
                />
                {errors?.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full py-2.5 rounded-lg text-white font-semibold transition-colors
                        ${processing
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                        }`}
                >
                    {processing ? 'Mengirim...' : 'Kirim Link Reset Password'}
                </button>

                <Link
                    href={route('login')}
                    className="text-center text-sm font-medium text-slate-600 hover:text-blue-600 mt-2"
                >
                    Kembali ke halaman login
                </Link>
            </div>
        </form>
    );
}
