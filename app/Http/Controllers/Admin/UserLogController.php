<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserLogController extends Controller
{
    public function index()
    {
        $logs = LoginLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Get active session IDs
        $activeSessionIds = \Illuminate\Support\Facades\DB::table('sessions')
            ->whereIn('id', $logs->pluck('session_id')->filter())
            ->pluck('id')
            ->toArray();

        // Append is_active attribute
        $logs->getCollection()->transform(function ($log) use ($activeSessionIds) {
            // Jika ada session_id, cek eksistensi di DB sessions. 
            // Jika tidak ada session_id (data lama), anggap sudah tidak aktif untuk amannya, atau selalu tampilkan tidak aktif.
            $log->is_active = $log->session_id ? in_array($log->session_id, $activeSessionIds) : false;
            return $log;
        });

        return Inertia::render('Admin/UserLogs/Index', [
            'logs' => $logs
        ]);
    }

    public function killSession($id)
    {
        $log = LoginLog::findOrFail($id);
        
        $query = \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $log->user_id);

        if ($log->session_id) {
            // Jika ada session_id (lebih presisi), hapus berdasarkan id session-nya
            $query->where('id', $log->session_id);
        } else {
            // Fallback untuk log lama yang belum punya session_id
            $query->where('ip_address', $log->ip_address)
                  ->where('user_agent', $log->user_agent);
        }

        $query->delete();

        return back()->with('success', 'Sesi pengguna yang dipilih berhasil diputuskan (logout paksa).');
    }
}
