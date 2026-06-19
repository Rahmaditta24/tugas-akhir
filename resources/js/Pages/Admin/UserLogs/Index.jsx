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
        </AdminLayout>
    );
}
