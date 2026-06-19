import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function useFasilitasLabForm(item = null) {
    const isEdit = !!item;
    
    const { data, setData, post, put, processing, errors } = useForm({
        kode_universitas: item?.kode_universitas === 'null' ? '' : (item?.kode_universitas || ''),
        institusi: item?.institusi === 'null' ? '' : (item?.institusi || ''),
        kategori_pt: item?.kategori_pt === 'null' ? '' : (item?.kategori_pt || ''),
        provinsi: item?.provinsi === 'null' ? '' : (item?.provinsi || ''),
        kota: item?.kota === 'null' ? '' : (item?.kota || ''),
        nama_laboratorium: item?.nama_laboratorium === 'null' ? '' : (item?.nama_laboratorium || ''),
        latitude: item?.latitude === 'null' ? '' : (item?.latitude || ''),
        longitude: item?.longitude === 'null' ? '' : (item?.longitude || ''),
        total_jumlah_alat: item?.total_jumlah_alat === 'null' ? '' : (item?.total_jumlah_alat || ''),
        nama_alat: item?.nama_alat === 'null' ? '' : (item?.nama_alat || ''),
        deskripsi_alat: item?.deskripsi_alat === 'null' ? '' : (item?.deskripsi_alat || ''),
        kontak: item?.kontak === 'null' ? '' : (item?.kontak || ''),
    });

    const [localErrors, setLocalErrors] = useState({});

    // On edit, optionally format numbering initially (if required, though Edit.jsx originally did formatNumbered logic before setting it)
    // Actually, in the original Edit.jsx, formatNumbered was defined but not used to initialize useForm.
    // It was just defined. I'll leave it out if it wasn't used, or add it if the user wants it later.

    const validateLatLng = (field, value) => {
        const num = parseFloat(value);
        let error = '';
        if (value && value !== '-') {
            if (isNaN(num)) {
                error = 'Harus berupa angka desimal. Contoh: -6.200000';
            } else if (field === 'latitude' && (num < -90 || num > 90)) {
                error = 'Latitude harus antara -90 dan 90.';
            } else if (field === 'longitude' && (num < -180 || num > 180)) {
                error = 'Longitude harus antara -180 dan 180.';
            }
        }
        setLocalErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const latOk = validateLatLng('latitude', data.latitude);
        const lngOk = validateLatLng('longitude', data.longitude);
        if (!latOk || !lngOk) return;
        
        if (isEdit) {
            put(route('admin.fasilitas-lab.update', item.id));
        } else {
            post(route('admin.fasilitas-lab.store'));
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
