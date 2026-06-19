import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function useResetPassword(token, email) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return {
        data, setData,
        processing,
        errors,
        showPassword, setShowPassword,
        showConfirmPassword, setShowConfirmPassword,
        submit
    };
}
