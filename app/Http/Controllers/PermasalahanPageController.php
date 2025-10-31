<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PermasalahanPageController extends Controller
{
    public function index()
    {
        // Initial render without heavy data; frontend will fetch via API as needed
        return Inertia::render('Permasalahan', [
            'mapData' => [],
            'stats' => [
                'totalResearch' => 0,
                'totalUniversities' => 0,
                'totalProvinces' => 0,
                'totalFields' => 0,
            ],
        ]);
    }
}


