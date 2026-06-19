<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\FasilitasLabService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class FasilitasLabPageController extends Controller
{
    protected $fasilitasLabService;

    public function __construct(FasilitasLabService $fasilitasLabService)
    {
        $this->fasilitasLabService = $fasilitasLabService;
    }

    public function index(Request $request)
    {
        $data = $this->fasilitasLabService->getIndexData($request);
        return Inertia::render('FasilitasLab/Index', $data);
    }
}
