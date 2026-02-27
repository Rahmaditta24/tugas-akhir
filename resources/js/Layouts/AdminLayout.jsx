import React, { useState, useEffect } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import Toast from '../Components/Toast';

export default function AdminLayout({ title = 'Admin', children }) {
    const { url, props } = usePage();
    const user = props?.auth?.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [toast, setToast] = useState(null);

    // Watch for flash messages
    useEffect(() => {
        if (props.flash?.success) {
            setToast({ message: props.flash.success, type: 'success' });
        } else if (props.flash?.error) {
            setToast({ message: props.flash.error, type: 'error' });
        }
    }, [props.flash]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById('user-dropdown');
            const button = event.target.closest('button');

            if (dropdown && !dropdown.contains(event.target) && (!button || !button.onclick)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: '📊' },
        { name: 'Penelitian', href: '/admin/penelitian', icon: '🔬' },
        { name: 'Pengabdian', href: '/admin/pengabdian', icon: '🤝' },
        { name: 'Hilirisasi', href: '/admin/hilirisasi', icon: '🏭' },
        { name: 'Produk', href: '/admin/produk', icon: '📦' },
        { name: 'Fasilitas Lab', href: '/admin/fasilitas-lab', icon: '🧪' },
        { name: 'Permasalahan', href: '/admin/permasalahan', icon: '⚠️' },
        { name: 'Rumusan Masalah', href: '/admin/rumusan-masalah/categories', icon: '📋' },
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/admin/logout', {}, {
            onSuccess: () => {
                window.location.href = '/admin';
            }
        });
    };

    const isActive = (href) => {
        if (href === '/admin') {
            return url === '/admin';
        }
        return url.startsWith(href);
    };

    return (
        <div className="admin-ui min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Head>
                <title>{title}</title>
            </Head>
            {/* Top Navbar */}
            <header className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200/60 sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Logo & Menu Toggle */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 mr-2"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <a href="/" className="flex items-center gap-2">
                                <img src="/assets/icon/favicon.svg" alt="Logo" className="h-6 w-6" />
                                <h1 className="text-[15px] sm:text-base font-semibold tracking-tight text-slate-800">Admin Panel</h1>
                            </a>
                        </div>

                        {/* Right: User Menu */}
                        <div className="flex items-center gap-2">
                            {/* User Dropdown */}
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <span className="font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
                                    </div>
                                    <span className="hidden sm:inline text-sm font-medium text-slate-700 group-hover:text-slate-900">{user?.name || 'Administrator'}</span>
                                    <svg className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div
                                        id="user-dropdown"
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-sm font-medium text-slate-900">{user?.name || 'Administrator'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'admin@example.com'}</p>
                                        </div>

                                        <div className="border-t border-slate-100 mt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 fixed left-0 top-16 bottom-0 z-30 w-64 bg-white/95 backdrop-blur border-r border-slate-200/60 transform transition-transform duration-300 ease-in-out`}>
                    <div className="h-full flex flex-col pt-4 pb-4 overflow-y-auto">
                        <nav className="flex-1 px-3 space-y-1">
                            {navigation.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-md transition-colors border ${active
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'text-slate-700 border-transparent hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200'
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="px-3 py-3 border-t border-slate-200/60">
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Website
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 w-full max-w-full overflow-x-hidden p-6 lg:p-8 lg:ml-64">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Title (optional) */}
                        {title ? (
                            <div className="mb-6">
                                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
                            </div>
                        ) : null}

                        {/* Content */}
                        {children}
                    </div>
                </main>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
