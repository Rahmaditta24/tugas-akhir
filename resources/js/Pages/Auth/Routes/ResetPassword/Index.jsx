import React from 'react';
import { Head } from '@inertiajs/react';
import AuthHeader from '../../Components/AuthHeader';
import AuthFooter from '../../Components/AuthFooter';
import ResetPasswordForm from './Components/ResetPasswordForm';

export default function Index({ token, email }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-0">
            <Head title="Reset Password - BIMA Indonesia" />
            <div className="w-full max-w-md">
                <AuthHeader 
                    title="Buat Password Baru" 
                    description="Pastikan password baru Anda aman dan memenuhi kriteria." 
                />
                <ResetPasswordForm token={token} email={email} />
                <AuthFooter />
            </div>
        </div>
    );
}
