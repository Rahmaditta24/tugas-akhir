import React from 'react';
import { Head } from '@inertiajs/react';
import AuthHeader from './Components/AuthHeader';
import LoginForm from './Components/LoginForm';
import AuthFooter from './Components/AuthFooter';

export default function Index({ errors, status }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-0">
            <Head title="Admin Login - BIMA Indonesia" />
            <div className="w-full max-w-md">
                <AuthHeader />
                <LoginForm errors={errors} status={status} />
                <AuthFooter />
            </div>
        </div>
    );
}
