<?php

namespace App\Modules\Hilirisasi\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Modules\Hilirisasi\Services\HilirisasiService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class HilirisasiPageController extends Controller
{
    protected $hilirisasiService;

    public function __construct(HilirisasiService $hilirisasiService)
    {
        $this->hilirisasiService = $hilirisasiService;
    }

    public function index(Request $request)
    {
        $data = $this->hilirisasiService->getIndexData($request);
        return Inertia::render('Hilirisasi/Index', $data);
    }
}
