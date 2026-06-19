<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\PengabdianService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PengabdianPageController extends Controller
{
    protected $pengabdianService;

    public function __construct(PengabdianService $pengabdianService)
    {
        $this->pengabdianService = $pengabdianService;
    }

    public function index(Request $request)
    {
        $data = $this->pengabdianService->getIndexData($request);
        return Inertia::render('Pengabdian/Index', $data);
    }
}
