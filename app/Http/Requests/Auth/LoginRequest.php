<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'password.regex' => 'Password minimal 8 karakter serta harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
        ];
    }

    public function throttleKey(): string
    {
        return strtolower($this->input('email')) . '|' . $this->ip();
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw \Illuminate\Validation\ValidationException::withMessages([
            'email' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik.",
            'retry_after' => $seconds,
        ]);
    }
}
