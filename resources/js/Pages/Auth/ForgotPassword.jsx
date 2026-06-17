import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-0">
            <Head title="Lupa Password - BIMA Indonesia" />
            <div className="w-full max-w-md">
                <div className="flex flex-wrap items-center justify-center gap-4 mb-4 sm:mb-6 opacity-90">
                    <img src="/assets/images/logo/Ditjen%20Risbang.png" alt="Ditjen Risbang" className="h-12 sm:h-16 object-contain max-w-full" />
                </div>
                
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Lupa Password?</h1>
                    <p className="text-sm sm:text-base text-slate-600">
                        Tidak masalah. Cukup beritahu kami alamat email Anda dan kami akan mengirimkan tautan pengaturan ulang kata sandi.
                    </p>
                </div>

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
            </div>
        </div>
    );
}
