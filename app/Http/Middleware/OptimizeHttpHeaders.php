<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class OptimizeHttpHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Add cache headers for static assets
        if ($request->path() !== '/' && (str_contains($request->path(), '/build/') || str_contains($request->path(), '/storage/'))) {
            $response->header('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for versioned assets
        }
        
        // Add cache headers for API responses (24 hours for permasalahan data)
        if (str_contains($request->path(), '/permasalahan') || str_contains($request->path(), '/api/')) {
            $response->header('Cache-Control', 'public, max-age=86400'); // 24 hours
        }

        // Enable gzip compression
        $response->header('Content-Encoding', 'gzip');

        // Security and performance headers
        $response->header('X-Content-Type-Options', 'nosniff');
        $response->header('X-Frame-Options', 'SAMEORIGIN');
        $response->header('X-XSS-Protection', '1; mode=block');
        
        return $response;
    }
}
