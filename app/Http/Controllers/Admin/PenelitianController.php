<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Penelitian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenelitianController extends Controller
{
    public function index(Request $request)
    {
        $query = Penelitian::query();
        if ($request->filled('search')) {
            $query->search($request->search);
        }
        $data = $query->orderByDesc('id')->paginate(20)->withQueryString();
        return Inertia::render('Admin/Penelitian/Index', [
            'penelitian' => $data,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Penelitian/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['nullable','string','max:255'],
            'institusi' => ['required','string','max:255'],
            'judul' => ['required','string'],
            'bidang_fokus' => ['nullable','string','max:255'],
            'thn_pelaksanaan' => ['nullable','integer'],
            'pt_latitude' => ['nullable','numeric'],
            'pt_longitude' => ['nullable','numeric'],
        ]);
        Penelitian::create($validated);
        return redirect()->route('admin.penelitian.index')->with('success', 'Data berhasil ditambahkan');
    }

    public function edit(Penelitian $penelitian)
    {
        return Inertia::render('Admin/Penelitian/Edit', [
            'item' => $penelitian,
        ]);
    }

    public function update(Request $request, Penelitian $penelitian)
    {
        $validated = $request->validate([
            'nama' => ['nullable','string','max:255'],
            'institusi' => ['required','string','max:255'],
            'judul' => ['required','string'],
            'bidang_fokus' => ['nullable','string','max:255'],
            'thn_pelaksanaan' => ['nullable','integer'],
            'pt_latitude' => ['nullable','numeric'],
            'pt_longitude' => ['nullable','numeric'],
        ]);
        $penelitian->update($validated);
        return redirect()->route('admin.penelitian.index')->with('success', 'Data diperbarui');
    }

    public function destroy(Penelitian $penelitian)
    {
        $penelitian->delete();
        return back()->with('success', 'Data dihapus');
    }
}


