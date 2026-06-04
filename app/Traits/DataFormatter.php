<?php

namespace App\Traits;

trait DataFormatter
{
    /**
     * Mengecek apakah institusi adalah PTN
     */
    protected function isPTN($name)
    {
        if (empty($name))
            return false;
            
        $name = strtolower($name);
        
        if (strpos($name, 'negeri') !== false)
            return true;
        if (strpos($name, 'politeknik') !== false && strpos($name, 'negeri') !== false)
            return true;
        if (strpos($name, 'uin ') !== false || strpos($name, 'universitas islam negeri') !== false)
            return true;
        if (strpos($name, 'iain ') !== false || strpos($name, 'institut agama islam negeri') !== false)
            return true;
        if (strpos($name, 'stain ') !== false || strpos($name, 'sekolah tinggi agama islam negeri') !== false)
            return true;
            
        $bigPTNs = [
            'universitas indonesia', 'institut teknologi bandung', 'universitas gadjah mada',
            'institut pertanian bogor', 'ipb university', 'universitas padjadjaran',
            'universitas airlangga', 'universitas diponegoro', 'universitas brawijaya',
            'universitas hasanuddin', 'universitas sebelas maret', 'institut teknologi sepuluh nopember',
            'universitas sumatera utara', 'universitas lampung', 'universitas andalas',
            'universitas sriwijaya', 'universitas syiah kuala', 'universitas riau',
            'universitas udayana', 'universitas jember', 'universitas jenderal soedirman',
            'universitas lambung mangkurat', 'universitas sam ratulangi', 'universitas tanjungpura',
            'universitas nusa cendana', 'universitas palangka raya', 'universitas tadulako',
            'universitas pattimura', 'universitas cenderawasih', 'universitas mulawarman',
            'universitas pendidikan indonesia', 'universitas pendidikan ganesha',
            'universitas sultan ageng tirtayasa', 'upn "veteran"', 'universitas tidar',
            'universitas teuku umar', 'universitas borneo tarakan', 'universitas bangka belitung',
            'universitas musamus', 'universitas malikussaleh', 'universitas samudra',
            'universitas siliwangi', 'universitas sembilanbelas november',
            'universitas singaperbangsa', 'universitas sulawesi barat', 'universitas papua',
            'institut seni indonesia', 'institut seni budaya indonesia'
        ];
        
        foreach ($bigPTNs as $ptn) {
            if (strpos($name, $ptn) !== false)
                return true;
        }
        
        return false;
    }

    /**
     * Memformat nama dengan gelar agar rapi dan standar
     */
    protected function formatName($name)
    {
        if (empty($name))
            return $name;
            
        $name = trim($name);
        
        // Jika sudah uppercase/lowercase semua, mungkin tidak perlu? 
        // Lebih baik di-format saja. Kita hapus kondisi mb_strtoupper exception.
        // Tapi mengikuti fungsi asli:
        if ($name !== mb_strtoupper($name) && $name !== mb_strtolower($name)) {
            // Wait, di fungsi asli ada return $name di kondisi ini jika mixed case.
            // Biar aman dengan kode asli, saya sertakan:
            return $name;
        }
        
        $formatted = mb_convert_case($name, MB_CASE_TITLE, "UTF-8");
        $replacements = [
            'S.pd' => 'S.Pd', 'M.pd' => 'M.Pd', 'S.t' => 'S.T', 'M.t' => 'M.T',
            'S.h' => 'S.H', 'M.h' => 'M.H', 'S.e' => 'S.E', 'M.m' => 'M.M',
            'S.si' => 'S.Si', 'M.si' => 'M.Si', 'S.sos' => 'S.Sos', 'M.sos' => 'M.Sos',
            'S.kom' => 'S.Kom', 'M.kom' => 'M.Kom', 'S.p' => 'S.P', 'M.p' => 'M.P',
            'S.pt' => 'S.Pt', 'M.pt' => 'M.Pt', 'S.hut' => 'S.Hut', 'M.hut' => 'M.Hut',
            'S.km' => 'S.KM', 'M.kes' => 'M.Kes', 'S.kep' => 'S.Kep', 'M.kep' => 'M.Kep',
            'Ph.d' => 'Ph.D', 'M.hum' => 'M.Hum', 'S.hum' => 'S.Hum', 'M.ag' => 'M.Ag',
            'S.ag' => 'S.Ag', 'M.fil' => 'M.Fil', 'S.fil' => 'S.Fil', 'M.ak' => 'M.Ak',
            'S.ak' => 'S.Ak', 'M.psi' => 'M.Psi', 'S.psi' => 'S.Psi', 'M.ti' => 'M.TI',
            'S.ti' => 'S.TI', 'M.eng' => 'M.Eng', 'S.eng' => 'S.Eng', 'M.sc' => 'M.Sc',
            'B.sc' => 'B.Sc', 'Msi' => 'MSi', 'Spd' => 'SPd',
        ];
        
        foreach ($replacements as $search => $replace) {
            $formatted = preg_replace('/\b' . preg_quote($search, '/') . '\b/u', $replace, $formatted);
            $formatted = str_replace($search, $replace, $formatted);
        }
        
        return $formatted;
    }

    /**
     * Memformat nama provinsi
     */
    protected function formatProvinsi($name)
    {
        if (empty($name) || strtolower($name) === 'tidak tersedia') 
            return 'tidak tersedia';
            
        $name = trim($name);
        if ($name === '') 
            return 'tidak tersedia';

        $formatted = mb_convert_case($name, MB_CASE_TITLE, "UTF-8");
        $fixes = [
            'Dki Jakarta' => 'DKI Jakarta',
            'Di Yogyakarta' => 'DI Yogyakarta',
        ];

        return $fixes[$formatted] ?? $formatted;
    }
}
