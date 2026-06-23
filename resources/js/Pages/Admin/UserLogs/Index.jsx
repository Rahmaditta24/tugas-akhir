import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

import useUserLogs from './Hooks/useUserLogs';
import UserLogsTable from './Components/UserLogsTable';
import UserLogsMapModal from './Components/UserLogsMapModal';

export default function UserLogsIndex() {
    const { logs } = usePage().props;
    const context = useUserLogs();

    return (
        <AdminLayout title="User Management Logs">
            <Head title="User Management Logs" />

            <UserLogsTable logs={logs} context={context} />
            <UserLogsMapModal context={context} />

            {/* Kill Session Confirmation Modal */}
            {context.showKillModal && (
                <div className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Putus Sesi Ini?</h3>
                        <p className="text-slate-600 mb-8 text-center leading-relaxed">
                            Sesi ini akan diputus secara paksa dan pengguna akan langsung di-logout. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => context.setShowKillModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={context.confirmKillSession}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95"
                            >
                                Ya, Putus Sesi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

