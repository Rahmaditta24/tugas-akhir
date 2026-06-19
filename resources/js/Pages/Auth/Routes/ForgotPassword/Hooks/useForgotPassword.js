import { useForm } from '@inertiajs/react';

export default function useForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return {
        data, setData,
        processing,
        errors,
        submit
    };
}
