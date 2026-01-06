<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RumusanMasalahCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RumusanMasalahCategoryController extends Controller
{
    public function index()
    {
        $categories = RumusanMasalahCategory::withCount('statements')
            ->orderBy('order_number')
            ->get();

        return view('admin.problem-statement.category.index', compact('categories'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_number' => 'required|integer|min:1|unique:rumusan_masalah_categories,order_number',
            'name'         => 'required|string|max:255',
            'image'        => 'required|image|mimes:png,jpg,jpeg,webp|max:2048',
        ], [
            'order_number.required' => 'Nomor urutan wajib diisi.',
            'order_number.integer'  => 'Nomor urutan harus berupa angka.',
            'order_number.min'      => 'Nomor urutan minimal 1.',
            'order_number.unique'   => 'Nomor urutan sudah digunakan.',
            'name.required'         => 'Nama kategori wajib diisi.',
            'name.max'              => 'Nama kategori maksimal 255 karakter.',
            'image.required'        => 'Logo wajib diupload.',
            'image.image'           => 'File harus berupa gambar.',
            'image.mimes'           => 'Format gambar harus: png, jpg, jpeg, atau webp.',
            'image.max'             => 'Ukuran gambar maksimal 2MB.',
        ]);

        // Upload image
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('rumusan-masalah/categories', 'public');
        }

        RumusanMasalahCategory::create($validated);

        return redirect()->route('admin.problem-statement.category.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $category = RumusanMasalahCategory::findOrFail($id);

        $validated = $request->validate([
            'order_number' => 'required|integer|min:1|unique:rumusan_masalah_categories,order_number,' . $category->id,
            'name'         => 'required|string|max:255',
            'image'        => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
        ], [
            'order_number.required' => 'Nomor urutan wajib diisi.',
            'order_number.integer'  => 'Nomor urutan harus berupa angka.',
            'order_number.min'      => 'Nomor urutan minimal 1.',
            'order_number.unique'   => 'Nomor urutan sudah digunakan.',
            'name.required'         => 'Nama kategori wajib diisi.',
            'name.max'              => 'Nama kategori maksimal 255 karakter.',
            'image.image'           => 'File harus berupa gambar.',
            'image.mimes'           => 'Format gambar harus: png, jpg, jpeg, atau webp.',
            'image.max'             => 'Ukuran gambar maksimal 2MB.',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Hapus image lama jika ada
            if ($category->image && Storage::disk('public')->exists($category->image)) {
                Storage::disk('public')->delete($category->image);
            }
            $validated['image'] = $request->file('image')->store('rumusan-masalah/categories', 'public');
        }

        $category->update($validated);

        return redirect()->route('admin.problem-statement.category.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $category = RumusanMasalahCategory::findOrFail($id);

        // Cek apakah kategori memiliki statements
        if ($category->statements()->count() > 0) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki pernyataan masalah.');
        }

        // Hapus image jika ada
        if ($category->image && Storage::disk('public')->exists($category->image)) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}