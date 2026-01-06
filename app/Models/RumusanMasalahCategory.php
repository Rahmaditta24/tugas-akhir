<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class RumusanMasalahCategory extends Model
{
    protected $table = 'rumusan_masalah_categories';

    protected $fillable = [
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
     * Get full URL image
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