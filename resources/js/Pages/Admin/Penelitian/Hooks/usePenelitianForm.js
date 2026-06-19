import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function usePenelitianForm(item = null) {
    const isEdit = !!item;
    
    const { data, setData, post, put, processing, errors } = useForm({
        nama: item?.nama === 'null' ? '' : (item?.nama || ''),
        nidn: item?.nidn === 'null' ? '' : (item?.nidn || ''),
        nuptk: item?.nuptk === 'null' ? '' : (item?.nuptk || ''),
        institusi: item?.institusi === 'null' ? '' : (item?.institusi || ''),
        pt_latitude: item?.pt_latitude === 'null' ? '' : (item?.pt_latitude || ''),
        pt_longitude: item?.pt_longitude === 'null' ? '' : (item?.pt_longitude || ''),
        kode_pt: item?.kode_pt === 'null' ? '' : (item?.kode_pt || ''),
        jenis_pt: item?.jenis_pt === 'null' ? '' : (item?.jenis_pt || ''),
        kategori_pt: item?.kategori_pt === 'null' ? '' : (item?.kategori_pt || ''),
        institusi_pilihan: item?.institusi_pilihan === 'null' ? '' : (item?.institusi_pilihan || ''),
        klaster: item?.klaster === 'null' ? '' : (item?.klaster || ''),
        provinsi: item?.provinsi === 'null' ? '' : (item?.provinsi || ''),
        kota: item?.kota === 'null' ? '' : (item?.kota || ''),
        judul: item?.judul === 'null' ? '' : (item?.judul || ''),
        skema: item?.skema === 'null' ? '' : (item?.skema || ''),
        thn_pelaksanaan: item?.thn_pelaksanaan === 'null' ? '' : (item?.thn_pelaksanaan || ''),
        bidang_fokus: item?.bidang_fokus === 'null' ? '' : (item?.bidang_fokus || ''),
        tema_prioritas: item?.tema_prioritas === 'null' ? '' : (item?.tema_prioritas || ''),
    });

    const [localErrors, setLocalErrors] = useState({});

    const validateLatLng = (field, value) => {
        const num = parseFloat(value);
        let error = '';
        if (value === '' || value === '-') {
            error = 'Field ini wajib diisi.';
        } else if (isNaN(num)) {
            error = 'Harus berupa angka desimal. Contoh: -6.200000';
        } else if (field === 'pt_latitude' && (num < -90 || num > 90)) {
            error = 'Latitude harus antara -90 dan 90.';
        } else if (field === 'pt_longitude' && (num < -180 || num > 180)) {
            error = 'Longitude harus antara -180 dan 180.';
        }
        setLocalErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const latOk = validateLatLng('pt_latitude', data.pt_latitude);
        const lngOk = validateLatLng('pt_longitude', data.pt_longitude);
        if (!latOk || !lngOk) return;
        
        if (isEdit) {
            put(route('admin.penelitian.update', item.id));
        } else {
            post(route('admin.penelitian.store'));
        }
    };

    return {
        data, setData,
        processing, errors,
        localErrors, validateLatLng,
        handleSubmit,
        isEdit
    };
}
