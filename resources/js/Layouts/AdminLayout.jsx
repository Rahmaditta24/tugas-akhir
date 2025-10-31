import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ title = 'Admin', children }) {
    const { url } = usePage();
    return (
        <div className="min-h-screen bg-blue-50 text-slate-900">
            <header className="bg-blue-700 text-white">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <h1 className="font-semibold">{title}</h1>
                    <form method="post" action="/admin/logout">
                        <input type="hidden" name="_token" value={document.querySelector('meta[name=csrf-token]')?.content} />
                        <button className="text-sm px-3 py-1 rounded bg-yellow-400 text-black hover:bg-yellow-500">Logout</button>
                    </form>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
                <aside className="col-span-3 lg:col-span-2">
                    <nav className="space-y-1">
                        <Link className="block px-3 py-2 rounded hover:bg-blue-100" href={route('admin.dashboard')}>Dashboard</Link>
                        <Link className="block px-3 py-2 rounded hover:bg-blue-100" href={route('admin.dashboard') + '#penelitian'}>Penelitian</Link>
                        <Link className="block px-3 py-2 rounded hover:bg-blue-100" href={route('admin.dashboard') + '#hilirisasi'}>Hilirisasi</Link>
                        <Link className="block px-3 py-2 rounded hover:bg-blue-100" href={route('admin.dashboard') + '#pengabdian'}>Pengabdian</Link>
                        <Link className="block px-3 py-2 rounded hover:bg-blue-100" href={route('admin.dashboard') + '#produk'}>Produk</Link>
                        <Link className="block px-3 py-2 rounded hover:bg-blue-100" href={route('admin.dashboard') + '#fasilitas'}>Fasilitas Lab</Link>
                        <Link className="block px-3 py-2 rounded hover:bg-blue-100" href={route('admin.dashboard') + '#permasalahan'}>Permasalahan</Link>
                    </nav>
                </aside>
                <main className="col-span-9 lg:col-span-10">
                    {children}
                </main>
            </div>
        </div>
    );
}


