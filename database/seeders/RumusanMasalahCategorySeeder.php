<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RumusanMasalahCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'id' => 1,
                'order_number' => 1,
                'name' => 'Pangan',
                'slug' => 'pangan',
                'image' => 'rumusan-masalah/categories/Jh04jBzQ3seMJDQ09fmgrULoLIgmND6fwCsiiezx.png',
                'created_at' => '2025-01-05 20:18:56',
                'updated_at' => '2025-01-05 20:18:56',
            ],
            [
                'id' => 2,
                'order_number' => 2,
                'name' => 'Kesehatan',
                'slug' => 'kesehatan',
                'image' => 'rumusan-masalah/categories/IlZYjcd0GI1KyWMTHx6N4DtFIOHhizI7fSGf3gla.png',
                'created_at' => '2025-01-05 20:28:13',
                'updated_at' => '2025-01-05 20:28:13',
            ],
            [
                'id' => 3,
                'order_number' => 3,
                'name' => 'Energi',
                'slug' => 'energi',
                'image' => 'rumusan-masalah/categories/thEFt3LAwzVOga9wo5re9eKQw2sbR4BdUDOpTPhP.png',
                'created_at' => '2025-01-05 21:05:56',
                'updated_at' => '2025-01-05 21:05:56',
            ],
            [
                'id' => 4,
                'order_number' => 4,
                'name' => 'Maritim',
                'slug' => 'maritim',
                'image' => 'rumusan-masalah/categories/id8W5ApfXuuB0vBW34jXR7et1HAw5BOV7tIZcvEy.png',
                'created_at' => '2025-01-05 21:11:10',
                'updated_at' => '2025-01-05 21:11:10',
            ],
            [
                'id' => 5,
                'order_number' => 5,
                'name' => 'Pertahanan',
                'slug' => 'pertahanan',
                'image' => 'rumusan-masalah/categories/t6TnaO3Jd32J17jss5UFFru1DpORQSlAsemPkyjb.png',
                'created_at' => '2025-01-05 21:19:12',
                'updated_at' => '2025-01-05 21:19:12',
            ],
            [
                'id' => 6,
                'order_number' => 6,
                'name' => 'Digitalisasi: AI & Semikonduktor',
                'slug' => 'digitalisasi-ai-semikonduktor',
                'image' => 'rumusan-masalah/categories/C1wZhusZ7TKSLMhwfticDP2F1TZfKmtCvzu3aRFR.png',
                'created_at' => '2025-01-05 21:31:43',
                'updated_at' => '2025-01-05 21:31:43',
            ],
            [
                'id' => 7,
                'order_number' => 7,
                'name' => 'Manufaktur & Material Maju',
                'slug' => 'manufaktur-material-maju',
                'image' => 'rumusan-masalah/categories/ygaaTRkzh6v7gBmxQSWG7b0afjf28qfIlQZzI0xB.png',
                'created_at' => '2025-01-05 22:32:24',
                'updated_at' => '2025-01-05 22:32:24',
            ],
            [
                'id' => 8,
                'order_number' => 8,
                'name' => 'Hilirisasi & Industrialisasi',
                'slug' => 'hilirisasi-industrialisasi',
                'image' => 'rumusan-masalah/categories/bY73Ti8RPNYukEBJShXJp2XlbN2gBBs14NkQHF8L.png',
                'created_at' => '2025-01-05 22:33:04',
                'updated_at' => '2025-01-05 22:33:04',
            ],
        ];

        DB::table('rumusan_masalah_categories')->insert($categories);
    }
}