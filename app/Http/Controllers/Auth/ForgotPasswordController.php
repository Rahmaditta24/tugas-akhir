<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    /**
     * Tampilkan form lupa password.
     */
    public function showForm()
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Kirim link reset password ke email.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email'    => 'Format email tidak valid.',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with('status', 'Link reset password telah dikirim ke email kamu.');
        }

        return back()->withErrors([
            'email' => $status === Password::INVALID_USER
                ? 'Email tidak ditemukan dalam sistem.'
                : 'Gagal mengirim link reset password. Coba lagi nanti.',
        ]);
    }
}
