<?php

namespace App\Modules\RumusanMasalah\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Modules\RumusanMasalah\Services\RumusanMasalahService;

class RumusanMasalahPageController extends Controller
{
    protected RumusanMasalahService $service;

    public function __construct(RumusanMasalahService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('RumusanMasalah/Index', [
            'categories' => $this->service->getCategoriesWithStatements(),
        ]);
    }

    public function panduan()
    {
        return Inertia::render('RumusanMasalah/Routes/Panduan', [
            'categories' => $this->service->getCategories()
        ]);
    }
}