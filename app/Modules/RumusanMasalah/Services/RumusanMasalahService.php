<?php

namespace App\Modules\RumusanMasalah\Services;

use App\Modules\RumusanMasalah\Models\RumusanMasalahCategory;

class RumusanMasalahService
{
    /**
     * Get all categories with their ordered statements
     */
    public function getCategoriesWithStatements()
    {
        return RumusanMasalahCategory::with([
            'statements' => function ($query) {
                $query->ordered();
            }
        ])
        ->ordered()
        ->get();
    }

    /**
     * Get all categories without statements
     */
    public function getCategories()
    {
        return RumusanMasalahCategory::ordered()->get();
    }
}
