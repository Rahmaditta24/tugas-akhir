import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <form method="post" action="/admin/login" className="bg-white border rounded-lg p-6 w-full max-w-md">
                <input type="hidden" name="_token" value={document.querySelector('meta[name=csrf-token]')?.content} />
                <h1 className="text-xl font-semibold mb-4">Masuk Admin</h1>
                <label className="block mb-3">
                    <span className="text-sm">Email</span>
                    <input name="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                </label>
                <label className="block mb-4">
                    <span className="text-sm">Password</span>
                    <input name="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
                </label>
                <label className="flex items-center gap-2 mb-4 text-sm">
                    <input name="remember" type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /> Ingat saya
                </label>
                <button className="w-full bg-blue-700 text-white rounded px-4 py-2 hover:bg-blue-800">Masuk</button>
            </form>
        </div>
    );
}


