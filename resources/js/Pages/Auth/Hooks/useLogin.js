import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function useLogin(errors) {
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false,
        location: null,
        latitude: null,
        longitude: null,
        public_ip: null,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        if (errors?.retry_after) {
            setCountdown(parseInt(errors.retry_after));
        }
    }, [errors?.retry_after]);

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCountdown(null);
        }
    }, [countdown]);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        setData(prev => ({ ...prev, latitude, longitude }));
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const result = await response.json();
                        const city = result.address?.city || result.address?.town || result.address?.village || result.address?.county || result.address?.state || 'Lokasi ditemukan';
                        setData(prev => ({ ...prev, location: city }));
                    } catch (error) {
                        console.error('Failed to get location from API');
                    }
                },
                (error) => {
                    console.error('Geolocation permission denied');
                }
            );
        }

        // Fetch public IP
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(resData => {
                setData(prevData => ({ ...prevData, public_ip: resData.ip }));
            })
            .catch(err => console.error('Failed to fetch public IP'));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return {
        data, setData,
        processing,
        showPassword, setShowPassword,
        countdown,
        handleSubmit
    };
}
