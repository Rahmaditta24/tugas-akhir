import React from 'react';
import { Link } from '@inertiajs/react';
import useLogin from '../Hooks/useLogin';

export default function LoginForm({ errors, status }) {
    const {
        data, setData,
        processing,
        showPassword, setShowPassword,
        countdown,
        handleSubmit
    } = useLogin(errors);

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
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
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    className={`w-full px-4 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 ${errors?.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500'
                        }`}
                    placeholder="Email admin"
                    required
                    autoFocus
                />
                {errors?.email && !countdown && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
                {countdown !== null && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-700 font-medium">
                            Terlalu banyak percobaan. Coba lagi dalam <span className="font-bold text-red-600 text-base">{countdown}</span> detik.
                        </p>
                    </div>
                )}
            </div>

            <div className="mb-4 text-left">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className={`w-full px-4 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 pr-10 ${errors?.password
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-300 focus:ring-blue-500'
                            }`}
                        placeholder="Password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors?.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
            </div>

            <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={e => setData('remember', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Ingat Saya</span>
                </label>
                <Link
                    href={route('password.request')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    Lupa Password?
                </Link>
            </div>

            <button
                type="submit"
                disabled={processing || countdown !== null}
                className={`w-full py-2.5 rounded-lg text-white font-semibold transition-colors mt-6 sm:mt-8 
                    ${processing || countdown !== null
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
            >
                {processing ? (
                    <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Memproses...</span>
                    </div>
                ) : (countdown !== null ? 'Harap Tunggu...' : 'Masuk Dashboard')}
            </button>
        </form>
    );
}
