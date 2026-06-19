import React from 'react';
import { Head } from '@inertiajs/react';
import AuthHeader from '../../../Components/AuthHeader';
import AuthFooter from '../../../Components/AuthFooter';
import ForgotPasswordForm from './Components/ForgotPasswordForm';

export default function Index({ status }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-0">
            <Head title="Lupa Password - BIMA Indonesia" />
            <div className="w-full max-w-md">
                <AuthHeader 
                    title="Lupa Password?" 
                    description="Tidak masalah. Cukup beritahu kami alamat email Anda dan kami akan mengirimkan tautan pengaturan ulang kata sandi." 
                />
                <ForgotPasswordForm status={status} />
                <AuthFooter />
            </div>
        </div>
    );
}
