<?php

namespace App\Services;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\LoginLog;

class AuthService
{
    public function attemptLogin(LoginRequest $request): bool
    {
        $request->ensureIsNotRateLimited();

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $request->session()->regenerate();
            RateLimiter::clear($request->throttleKey());

            $this->recordLoginLog($request);

            return true;
        }

        RateLimiter::hit($request->throttleKey(), 60);

        return false;
    }

    protected function recordLoginLog(LoginRequest $request): void
    {
        $ipAddress = $request->input('public_ip') ?: $request->ip();

        LoginLog::create([
            'user_id' => Auth::id(),
            'session_id' => $request->session()->getId(),
            'ip_address' => $ipAddress,
            'location' => $request->input('location'),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'user_agent' => $request->userAgent(),
        ]);
    }

    public function logout($request): void
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
