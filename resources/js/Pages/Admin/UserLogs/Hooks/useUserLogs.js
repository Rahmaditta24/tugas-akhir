import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function useUserLogs() {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showKillModal, setShowKillModal] = useState(false);
    const [killTarget, setKillTarget] = useState(null);

    const handleKillSession = (id) => {
        setKillTarget(id);
        setShowKillModal(true);
    };

    const confirmKillSession = () => {
        if (!killTarget) return;
        router.delete(`/admin/user-logs/${killTarget}/kill-session`, {
            onFinish: () => {
                setShowKillModal(false);
                setKillTarget(null);
            }
        });
    };

    return {
        selectedLocation,
        setSelectedLocation,
        handleKillSession,
        confirmKillSession,
        showKillModal,
        setShowKillModal,
    };
}
