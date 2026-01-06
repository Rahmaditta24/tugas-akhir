<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RumusanMasalahCategoryResource;
use App\Models\RumusanMasalahCategory;
use Illuminate\Http\JsonResponse;

class RumusanMasalahApiController extends Controller
{
    /**
     * Get all categories with their statements
     */
    public function index(): JsonResponse
    {
        $categories = RumusanMasalahCategory::with('statements')
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => RumusanMasalahCategoryResource::collection($categories),
        ], 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    }
}