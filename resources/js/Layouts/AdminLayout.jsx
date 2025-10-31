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
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/admin/logout');
    };

    const isActive = (href) => url.startsWith(href);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navbar */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
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
                            <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
                        </div>

                        {/* Right: User & Logout */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 hidden sm:block">Administrator</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 fixed left-0 top-16 bottom-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out`}>
                    <div className="h-full flex flex-col pt-5 pb-4 overflow-y-auto">
                        <nav className="flex-1 px-4 space-y-1">
                            {navigation.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                            active
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="px-4 py-4 border-t">
                            <Link
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
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
                        {/* Page Title */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                        </div>

                        {/* Content */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}


