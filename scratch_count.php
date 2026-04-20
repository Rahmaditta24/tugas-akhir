<?php
$path = 'database/data/data-pengabdian.json';
$json = file_get_contents($path);
// Clean up NaN or other non-JSON values
$json = str_replace(['NaN', 'Infinity', '-Infinity'], 'null', $json);
$data = json_decode($json, true);
if ($data === null) {
    echo "Error parsing JSON: " . json_last_error_msg() . "\n";
} else {
    echo "Jumlah Kosabangsa di JSON: " . count($data['Kosabangsa'] ?? []) . "\n";
}
