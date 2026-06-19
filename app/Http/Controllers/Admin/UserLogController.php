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

        // Get active session IDs and their corresponding user_ids
        $activeSessions = \Illuminate\Support\Facades\DB::table('sessions')
            ->whereIn('id', $logs->pluck('session_id')->filter())
            ->pluck('user_id', 'id')
            ->toArray();

        // Append is_active attribute
        $logs->getCollection()->transform(function ($log) use ($activeSessions) {
            // Sesi dianggap aktif jika ID sesi ada di tabel sessions DAN user_id-nya masih cocok (belum null akibat logout)
            $log->is_active = $log->session_id && 
                              isset($activeSessions[$log->session_id]) && 
                              $activeSessions[$log->session_id] == $log->user_id;
            return $log;
        });

        return Inertia::render('Admin/UserLogs/Index', [
            'logs' => $logs
        ]);
    }

    public function killSession($id)
    {
        $log = LoginLog::findOrFail($id);
        
        // Cek apakah sesi yang akan dihapus adalah sesi pengguna saat ini
        if ($log->session_id && $log->session_id === request()->session()->getId()) {
            \Illuminate\Support\Facades\Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
            
            return redirect('/admin/login')->with('success', 'Sesi Anda telah diakhiri.');
        }

        $query = \Illuminate\Support\Facades\DB::table('sessions');

        if ($log->session_id) {
            // Jika ada session_id (lebih presisi), hapus berdasarkan id session-nya
            $query->where('id', $log->session_id);
        } else {
            // Fallback untuk log lama yang belum punya session_id
            $query->where('user_id', $log->user_id)
                  ->where('ip_address', $log->ip_address)
                  ->where('user_agent', $log->user_agent);
        }

        $query->delete();

        return back()->with('success', 'Sesi pengguna yang dipilih berhasil diputuskan (logout paksa).');
    }
}
