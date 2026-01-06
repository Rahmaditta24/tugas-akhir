<?php

namespace App\Http\Controllers;

use App\Models\RumusanMasalahCategory;
use Inertia\Inertia;

class RumusanMasalahPageController extends Controller
{
    public function index()
    {
        $categories = RumusanMasalahCategory::with(['statements' => function ($query) {
            $query->ordered();
        }])
            ->ordered()
            ->get();

        return Inertia::render('RumusanMasalah/Index', [
            'categories' => $categories,
        ]);
    }
}