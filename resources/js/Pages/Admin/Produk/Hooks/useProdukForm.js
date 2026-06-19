import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function useProdukForm(initialData = null, isEdit = false) {
    const [provinces, setProvinces] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);

    const { data, setData, post, put, processing, errors } = useForm(initialData || {
        nama_produk: '',
        institusi: '',
        deskripsi_produk: '',
        bidang: '',
        tkt: '',
        provinsi: '',
        nama_inventor: '',
        email_inventor: '',
        nomor_paten: '',
        deskripsi_paten: '', // Form Create previously mapped deskripsi_paten to detail_paten, let's stick to deskripsi_paten since edit uses it
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        // Ambil data provinsi dari API
        fetch(route('admin.produk.provinces'))
            .then(res => res.json())
            .then(data => {
                setProvinces(data);
                setLoadingProvinces(false);
            })
            .catch(err => {
                console.error('Error loading provinces:', err);
                setLoadingProvinces(false);
            });
    }, []);

    const [localErrors, setLocalErrors] = useState({});

    const validateLatLng = (field, value) => {
        const num = parseFloat(value);
        let error = '';
        if (value === '' || value === '-' || value === null) {
            error = 'Field ini wajib diisi.';
        } else if (isNaN(num)) {
            error = 'Harus berupa angka desimal. Contoh: -6.200000';
        } else if (field === 'latitude' && (num < -90 || num > 90)) {
            error = 'Latitude harus antara -90 dan 90.';
        } else if (field === 'longitude' && (num < -180 || num > 180)) {
            error = 'Longitude harus antara -180 dan 180.';
        }
        setLocalErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleSubmit = (e, itemData = null) => {
        e.preventDefault();
        const latOk = validateLatLng('latitude', data.latitude);
        const lngOk = validateLatLng('longitude', data.longitude);
        if (!latOk || !lngOk) return;

        if (isEdit && itemData) {
            put(route('admin.produk.update', itemData.id));
        } else {
            post(route('admin.produk.store'));
        }
    };

    return {
        data, setData, processing, errors, localErrors,
        provinces, loadingProvinces,
        validateLatLng, handleSubmit
    };
}
