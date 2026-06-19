<?php

namespace App\Modules\Auth\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Atribut yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Atribut yang harus disembunyikan untuk serialisasi.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Atribut yang harus di-cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function penelitian()
    {
        return $this->hasMany(Penelitian::class);
    }

    public function pengabdian()
    {
        return $this->hasMany(Pengabdian::class);
    }

    public function hilirisasi()
    {
        return $this->hasMany(Hilirisasi::class);
    }

    public function produk()
    {
        return $this->hasMany(Produk::class);
    }

    public function fasilitasLab()
    {
        return $this->hasMany(FasilitasLab::class);
    }

    public function rumusanMasalahCategories()
    {
        return $this->hasMany(RumusanMasalahCategory::class);
    }

    public function rumusanMasalahStatements()
    {
        return $this->hasMany(RumusanMasalahStatement::class);
    }
}
