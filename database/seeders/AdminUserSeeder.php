<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\Auth\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@petabima.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('PetaBima!2026'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✓ Admin user created:');
        $this->command->info('  Email: admin@petabima.com');
        $this->command->info('  Password: PetaBima!2026');
    }
}


