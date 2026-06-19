import React from 'react';
import { Link } from '@inertiajs/react';
import AdminTable from '@/Components/AdminTable';

export default function UserLogsTable({ logs, context }) {
    const { setSelectedLocation, handleKillSession } = context;

    const columns = [
        {
            key: 'user',
            title: 'Pengguna',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-slate-900">{row.user?.name || 'Unknown User'}</div>
                    <div className="text-xs text-slate-500">{row.user?.email || '-'}</div>
                </div>
            )
        },
        {
            key: 'ip_address',
            title: 'IP Address',
            render: (val) => (
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-mono">
                    {val || '-'}
                </span>
            )
        },
        {
            key: 'location',
            title: 'Lokasi',
            render: (val, row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{val || '-'}</span>
                    </div>
                    {row.latitude && row.longitude && (
                        <button
                            onClick={() => setSelectedLocation({ lat: row.latitude, lng: row.longitude, name: row.user?.name, loc: val })}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-0.5"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat di Peta
                        </button>
                    )}
                </div>
            )
        },
        {
            key: 'user_agent',
            title: 'Perangkat (Browser)',
            render: (val) => (
                <div className="max-w-xs truncate text-xs text-slate-500" title={val}>
                    {val || '-'}
                </div>
            )
        },
        {
            key: 'created_at',
            title: 'Waktu Login',
            render: (val) => new Date(val).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
        {
            key: 'status',
            title: 'Status',
            render: (_, row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {row.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
            )
        },
        {
            key: 'action',
            title: 'Aksi',
            render: (_, row) => (
                row.is_active ? (
                    <button
                        onClick={() => handleKillSession(row.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-100 whitespace-nowrap"
                        title="Logout paksa sesi ini"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                ) : (
                    <span className="text-xs text-slate-400 italic whitespace-nowrap">-</span>
                )
            )
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Riwayat Login Pengguna</h3>
            </div>

            <AdminTable 
                columns={columns}
                data={logs.data}
                striped={true}
                emptyText="Belum ada data log login."
            />

            {/* Pagination */}
            {logs.links && logs.links.length > 3 && (
                <div className="p-4 border-t border-slate-200 flex justify-center">
                    <div className="flex flex-wrap gap-1">
                        {logs.links.map((link, k) => (
                            link.url ? (
                                <Link
                                    key={k}
                                    href={link.url}
                                    className={`px-3 py-1.5 text-sm rounded-md border ${link.active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ) : (
                                <span
                                    key={k}
                                    className="px-3 py-1.5 text-sm rounded-md border bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
