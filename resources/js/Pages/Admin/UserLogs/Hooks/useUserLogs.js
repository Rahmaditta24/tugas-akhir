import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function useUserLogs() {
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleKillSession = (id) => {
        if (confirm('Apakah Anda yakin ingin memutus sesi ini secara paksa? Pengguna akan langsung di-logout.')) {
            router.delete(`/admin/user-logs/${id}/kill-session`);
        }
    };

    return {
        selectedLocation,
        setSelectedLocation,
        handleKillSession
    };
}
