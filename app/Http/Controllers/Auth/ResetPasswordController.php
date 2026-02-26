<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ResetPasswordController extends Controller
{
    /**
     * Tampilkan form reset password.
     */
    public function showForm(Request $request, string $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    /**
     * Proses reset password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => ['required'],
            'email'                 => ['required', 'email'],
            'password'              => ['required', 'confirmed', 'min:8'],
            'password_confirmation' => ['required'],
        ], [
            'token.required'                 => 'Token tidak valid.',
            'email.required'                 => 'Email wajib diisi.',
            'email.email'                    => 'Format email tidak valid.',
            'password.required'              => 'Password baru wajib diisi.',
            'password.confirmed'             => 'Konfirmasi password tidak cocok.',
            'password.min'                   => 'Password minimal 8 karakter.',
            'password_confirmation.required' => 'Konfirmasi password wajib diisi.',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', 'Password berhasil direset. Silakan login dengan password baru.');
        }

        return back()->withErrors([
            'email' => $status === Password::INVALID_TOKEN
                ? 'Token reset password tidak valid atau sudah kadaluarsa.'
                : 'Gagal mereset password. Coba kirim link reset lagi.',
        ]);
    }
}
