import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import PageHeader from '../../Components/PageHeader';

const PasswordInput = ({ label, value, onChange, show, toggleShow, error, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
            {label}
        </label>
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={toggleShow}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
                {show ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                )}
            </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export default function Profile({ user }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const profileForm = useForm({
        name: user?.name || 'Administrator',
        email: user?.email || 'admin@example.com',
    });

    const passwordForm = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.put('/admin/profile', {
            preserveScroll: true,
            onSuccess: () => {
                // Flash message handled by layout
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put('/admin/change-password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                <Link href="/admin" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </Link>
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-slate-900 font-medium">Profil</span>
            </div>

            <PageHeader
                title="Profil Saya"
                subtitle="Kelola informasi profil dan keamanan akun Anda"
                icon={<span className="text-xl">👤</span>}
            />

            <div className="max-w-3xl">
                {/* Tab Navigation */}
                <div className="bg-white rounded-t-lg border-b border-slate-200">
                    <div className="flex gap-1 px-6">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Informasi Profil
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'password'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Ubah Password
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-b-lg shadow-sm p-6">
                    {activeTab === 'profile' ? (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={e => profileForm.setData('name', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${profileForm.errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="Nama lengkap Anda"
                                />
                                {profileForm.errors.name && <p className="mt-1 text-sm text-red-600">{profileForm.errors.name}</p>}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={e => profileForm.setData('email', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${profileForm.errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="email@example.com"
                                />
                                {profileForm.errors.email && <p className="mt-1 text-sm text-red-600">{profileForm.errors.email}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <Link
                                    href="/admin"
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            {/* Security Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900 mb-1">Tips Keamanan Password</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Gunakan minimal 8 karakter</li>
                                            <li>• Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                                            <li>• Jangan gunakan password yang sama dengan akun lain</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Current Password */}
                            <PasswordInput
                                label="Password Saat Ini"
                                value={passwordForm.data.current_password}
                                onChange={e => passwordForm.setData('current_password', e.target.value)}
                                show={showCurrentPassword}
                                toggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                                error={passwordForm.errors.current_password}
                                placeholder="Masukkan password saat ini"
                            />

                            {/* New Password */}
                            <PasswordInput
                                label="Password Baru"
                                value={passwordForm.data.new_password}
                                onChange={e => passwordForm.setData('new_password', e.target.value)}
                                show={showNewPassword}
                                toggleShow={() => setShowNewPassword(!showNewPassword)}
                                error={passwordForm.errors.new_password}
                                placeholder="Masukkan password baru"
                            />

                            {/* Confirm New Password */}
                            <PasswordInput
                                label="Konfirmasi Password Baru"
                                value={passwordForm.data.new_password_confirmation}
                                onChange={e => passwordForm.setData('new_password_confirmation', e.target.value)}
                                show={showConfirmPassword}
                                toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                                error={passwordForm.errors.new_password_confirmation}
                                placeholder="Ulangi password baru"
                            />

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <Link
                                    href="/admin"
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {passwordForm.processing ? 'Menyimpan...' : 'Ubah Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
