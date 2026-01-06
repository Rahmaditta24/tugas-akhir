<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RumusanMasalahStatement extends Model
{
    protected $table = 'rumusan_masalah_statements';

    protected $fillable = [
        'category_id',
        'order_number',
        'full_number',
        'title',
        'description',
    ];

    protected $casts = [
        'category_id' => 'integer', 
    ];

    /**
     * Relasi ke RumusanMasalahCategory
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(RumusanMasalahCategory::class, 'category_id');
    }

    /**
     * Scope untuk ordering berdasarkan order_number
     */
    public function scopeOrdered($query)
    {
        // Cast ke decimal untuk sorting yang benar
        return $query->orderByRaw('CAST(order_number AS DECIMAL(10,2)) ASC');
    }

    /**
     * Scope untuk filter berdasarkan category
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Get formatted full number untuk display
     */
    public function getFormattedNumberAttribute(): string
    {
        return $this->full_number ?? ($this->category->order_number . '.' . $this->order_number);
    }

    /**
     * Accessor untuk format order_number tanpa .0
     */
    public function getOrderNumberFormattedAttribute(): string
    {
        $num = (float) $this->order_number;
        // Jika bilangan bulat (1.0, 2.0), tampilkan tanpa desimal
        if ($num == floor($num)) {
            return (string) intval($num);
        }
        // Jika ada desimal (1.1, 1.2), tampilkan dengan desimal
        return rtrim(rtrim(number_format($num, 1, '.', ''), '0'), '.');
    }
}