<?php

namespace App\Traits;

use App\Models\User;

trait HasUserOwnership
{
    /**
     * Boot the trait and register model events.
     */
    protected static function bootHasUserOwnership()
    {
        static::creating(function ($model) {
            // Only set user_id if the user is logged in and the field isn't already set
            if (auth()->check() && empty($model->user_id)) {
                $model->user_id = auth()->id();
            }
        });
    }

    /**
     * Relationship to the user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
