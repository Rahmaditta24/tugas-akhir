<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RumusanMasalahCategory;
use App\Models\RumusanMasalahStatement;
use Illuminate\Http\Request;

class RumusanMasalahStatementController extends Controller
{
    /**
     * Display statements for a specific category
     */
    public function index(RumusanMasalahCategory $category)
    {
        $statements = $category->statements()
            ->orderByRaw('CAST(order_number AS DECIMAL(10,2)) ASC')
            ->get()
            ->map(function($statement) {
                // Format order_number untuk tampilan
                $num = (float) $statement->order_number;
                $formattedOrderNumber = ($num == floor($num)) 
                    ? (string) intval($num) 
                    : rtrim(rtrim(number_format($num, 1, '.', ''), '0'), '.');
                
                return [
                    'id' => $statement->id,
                    'order_number' => $formattedOrderNumber,
                    'full_number' => $statement->full_number,
                    'title' => $statement->title,
                    'description' => $statement->description,
                ];
            });

        return view('admin.problem-statement.statement.index', compact('category', 'statements'));
    }

    /**
     * Store a newly created statement
     */
    public function store(Request $request, RumusanMasalahCategory $category)
    {
        $validated = $request->validate([
            'order_number' => 'required|numeric|min:0.1',
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
        ], [
            'order_number.required' => 'Nomor statement wajib diisi.',
            'order_number.numeric'  => 'Nomor statement harus berupa angka.',
            'order_number.min'      => 'Nomor statement minimal 0.1.',
            'title.required'        => 'Judul wajib diisi.',
            'title.max'             => 'Judul maksimal 255 karakter.',
        ]);

        // Format order_number: hilangkan .0 jika bilangan bulat
        $orderNumber = (float) $validated['order_number'];
        $formattedOrderNumber = ($orderNumber == floor($orderNumber)) 
            ? (string) intval($orderNumber) 
            : rtrim(rtrim(number_format($orderNumber, 1, '.', ''), '0'), '.');

        // Generate full_number: category.order_number + user input
        $fullNumber = $category->order_number . '.' . $formattedOrderNumber;

        // Check if full_number already exists in this category
        $exists = $category->statements()
            ->where('full_number', $fullNumber)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'order_number' => 'Nomor statement ' . $fullNumber . ' sudah digunakan dalam kategori ini.'
            ])->withInput();
        }

        $category->statements()->create([
            'order_number' => $formattedOrderNumber,
            'full_number'  => $fullNumber,
            'title'        => $validated['title'],
            'description'  => $validated['description'] ?? null,
        ]);

        return redirect()
            ->route('admin.problem-statement.category.statements.index', $category->slug)
            ->with('success', 'Statement berhasil ditambahkan.');
    }

    /**
     * Update the specified statement
     */
    public function update(Request $request, $categorySlug, $statementId)
    {
        $category = RumusanMasalahCategory::where('slug', $categorySlug)->firstOrFail();
        $statement = RumusanMasalahStatement::where('id', $statementId)
            ->where('category_id', $category->id)
            ->firstOrFail();

        $validated = $request->validate([
            'order_number' => 'required|numeric|min:0.1',
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
        ], [
            'order_number.required' => 'Nomor statement wajib diisi.',
            'order_number.numeric'  => 'Nomor statement harus berupa angka.',
            'order_number.min'      => 'Nomor statement minimal 0.1.',
            'title.required'        => 'Judul wajib diisi.',
            'title.max'             => 'Judul maksimal 255 karakter.',
        ]);

        // Format order_number: hilangkan .0 jika bilangan bulat
        $orderNumber = (float) $validated['order_number'];
        $formattedOrderNumber = ($orderNumber == floor($orderNumber)) 
            ? (string) intval($orderNumber) 
            : rtrim(rtrim(number_format($orderNumber, 1, '.', ''), '0'), '.');

        // Regenerate full_number with category order_number
        $fullNumber = $category->order_number . '.' . $formattedOrderNumber;

        // Check if full_number already exists in this category (excluding current statement)
        $exists = $category->statements()
            ->where('full_number', $fullNumber)
            ->where('id', '!=', $statement->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'order_number' => 'Nomor statement ' . $fullNumber . ' sudah digunakan dalam kategori ini.'
            ])->withInput();
        }

        $statement->update([
            'order_number' => $formattedOrderNumber,
            'full_number'  => $fullNumber,
            'title'        => $validated['title'],
            'description'  => $validated['description'] ?? null,
        ]);

        return redirect()
            ->route('admin.problem-statement.category.statements.index', $category->slug)
            ->with('success', 'Statement berhasil diperbarui.');
    }

    /**
     * Remove the specified statement
     */
    public function destroy($categorySlug, $statementId)
    {
        $category = RumusanMasalahCategory::where('slug', $categorySlug)->firstOrFail();
        $statement = RumusanMasalahStatement::where('id', $statementId)
            ->where('category_id', $category->id)
            ->firstOrFail();

        $statement->delete();

        return redirect()
            ->route('admin.problem-statement.category.statements.index', $category->slug)
            ->with('success', 'Statement berhasil dihapus.');
    }
}