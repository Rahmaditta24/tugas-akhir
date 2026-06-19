<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\PermasalahanService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PermasalahanPageController extends Controller
{
    protected $permasalahanService;

    public function __construct(PermasalahanService $permasalahanService)
    {
        $this->permasalahanService = $permasalahanService;
    }

    public function index(Request $request)
    {
        $data = $this->permasalahanService->getIndexData($request);
        return Inertia::render('Permasalahan/Index', $data);
    }

    public function lazyLoadMarkers(Request $request)
    {
        $data = $this->permasalahanService->lazyLoadMarkers($request);
        return response()->json($data);
    }
}
