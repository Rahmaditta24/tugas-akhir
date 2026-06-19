<?php
$models = [
    'Pengabdian',
    'Hilirisasi',
    'Produk',
    'FasilitasLab',
    'RumusanMasalahCategory',
    'RumusanMasalahStatement'
];

foreach ($models as $model) {
    $path = __DIR__ . "/app/Models/{$model}.php";
    if (file_exists($path)) {
        $content = file_get_contents($path);

        // Add trait import
        if (strpos($content, 'use App\Traits\HasUserOwnership;') === false) {
            $content = str_replace(
                "use Illuminate\Database\Eloquent\Model;",
                "use Illuminate\Database\Eloquent\Model;\nuse App\Traits\HasUserOwnership;",
                $content
            );
        }

        // Add trait to class
        if (strpos($content, 'use HasFactory;') !== false) {
            $content = str_replace(
                "use HasFactory;",
                "use HasFactory, HasUserOwnership;",
                $content
            );
        } elseif (strpos($content, 'HasUserOwnership') === false) {
            $content = preg_replace('/class\s+'.$model.'\s+extends\s+Model\s*\{/', "class $model extends Model\n{\n    use HasUserOwnership;", $content);
        }

        // Add user_id to fillable
        if (strpos($content, "'user_id'") === false && strpos($content, '"user_id"') === false) {
            $content = preg_replace('/protected\s+\$fillable\s*=\s*\[/', "protected \$fillable = [\n        'user_id',", $content);
        }

        file_put_contents($path, $content);
        echo "Updated $model\n";
    }
}
