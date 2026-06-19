import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function useHilirisasiForm(item = null) {
    const isEdit = !!item;
    
    const { data, setData, post, put, processing, errors } = useForm({
        tahun: item?.tahun === 'null' ? '' : (item?.tahun || ''),
        id_proposal: item?.id_proposal === 'null' ? '' : (item?.id_proposal || ''),
        judul: item?.judul === 'null' ? '' : (item?.judul || ''),
        nama_pengusul: item?.nama_pengusul === 'null' ? '' : (item?.nama_pengusul || ''),
        direktorat: item?.direktorat === 'null' ? '' : (item?.direktorat || ''),
        perguruan_tinggi: item?.perguruan_tinggi === 'null' ? '' : (item?.perguruan_tinggi || ''),
        pt_latitude: item?.pt_latitude === 'null' ? '' : (item?.pt_latitude || ''),
        pt_longitude: item?.pt_longitude === 'null' ? '' : (item?.pt_longitude || ''),
        provinsi: item?.provinsi === 'null' ? '' : (item?.provinsi || ''),
        mitra: item?.mitra === 'null' ? '' : (item?.mitra || ''),
        skema: item?.skema === 'null' ? '' : (item?.skema || ''),
        luaran: item?.luaran === 'null' ? '' : (item?.luaran || ''),
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
            put(route('admin.hilirisasi.update', item.id));
        } else {
            post(route('admin.hilirisasi.store'));
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
