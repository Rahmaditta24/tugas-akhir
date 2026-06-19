<?php

namespace App\Modules\Produk\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Modules\Produk\Services\ProdukService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProdukPageController extends Controller
{
    protected $produkService;

    public function __construct(ProdukService $produkService)
    {
        $this->produkService = $produkService;
    }

    public function index(Request $request)
    {
        $data = $this->produkService->getIndexData($request);
        return Inertia::render('Produk/Index', $data);
    }
}
