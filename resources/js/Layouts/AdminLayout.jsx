import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function AdminLayout({ title = 'Admin', children }) {
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

                        {/* Right: User & Logout */}
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Administrator
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
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
        </div>
    );
}


