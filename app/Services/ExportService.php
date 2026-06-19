<?php

namespace App\Services;

use Illuminate\Http\Request;

class ExportService
{
    /**
     * Stream data to JSON for download without running out of memory
     */
    public function streamJsonExport($query, array $columns)
    {
        try {
            return response()->stream(function () use ($query, $columns) {
                echo '[';
                $first = true;

                $query->select($columns)
                    ->cursor()
                    ->each(function ($item) use (&$first) {
                        if (!$first) {
                            echo ',';
                        }
                        echo json_encode($item);
                        $first = false;

                        if (ob_get_level() > 0) {
                            ob_flush();
                            flush();
                        }
                    });

                echo ']';
            }, 200, [
                'Content-Type' => 'application/json',
                'Cache-Control' => 'no-cache',
            ]);
        } catch (\Exception $e) {
            \Log::error('Export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
}
