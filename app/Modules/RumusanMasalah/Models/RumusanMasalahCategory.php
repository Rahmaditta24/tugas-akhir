<?php

namespace App\Modules\RumusanMasalah\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUserOwnership;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class RumusanMasalahCategory extends Model
{
    protected $table = 'rumusan_masalah_categories';

    protected $fillable = [
        'user_id',
        'order_number',
        'name',
        'slug',
        'image',
    ];

    protected $casts = [
        'order_number' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        // Generate slug otomatis saat create
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        // Update slug otomatis jika name berubah
        static::updating(function ($category) {
            if ($category->isDirty('name')) {
                $category->slug = Str::slug($category->name);
            }
        });

        // Hapus image saat model dihapus
        static::deleting(function ($category) {
            if ($category->image && Storage::disk('public')->exists($category->image)) {
                Storage::disk('public')->delete($category->image);
            }
        });
    }

    /**
     * Relasi ke RumusanMasalahStatement
     */
    public function statements(): HasMany
    {
        return $this->hasMany(RumusanMasalahStatement::class, 'category_id');
    }

    /**
     * Mendapatkan URL gambar lengkap
     */
    public function getImageUrlAttribute(): ?string
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    /**
     * Scope untuk ordering
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order_number');
    }

    /**
     * Scope untuk dengan jumlah statements
     */
    public function scopeWithStatementsCount($query)
    {
        return $query->withCount('statements');
    }
}