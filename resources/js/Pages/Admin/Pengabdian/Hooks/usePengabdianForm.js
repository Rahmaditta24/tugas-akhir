import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function usePengabdianForm(item = null) {
    const isEdit = !!item;

    const { data, setData, post, put, processing, errors } = useForm({
        batch_type: item?.batch_type || 'batch',
        nama: item?.nama === 'null' ? '' : (item?.nama || ''),
        nidn: item?.nidn === 'null' ? '' : (item?.nidn || ''),
        nama_institusi: item?.nama_institusi === 'null' ? '' : (item?.nama_institusi || ''),
        kd_perguruan_tinggi: item?.kd_perguruan_tinggi === 'null' ? '' : (item?.kd_perguruan_tinggi || ''),
        wilayah_lldikti: item?.wilayah_lldikti === 'null' ? '' : (item?.wilayah_lldikti || ''),
        ptn_pts: item?.ptn_pts === 'null' ? '' : (item?.ptn_pts || ''),
        klaster: item?.klaster === 'null' ? '' : (item?.klaster || ''),
        prov_pt: item?.prov_pt === 'null' ? '' : (item?.prov_pt || ''),
        kab_pt: item?.kab_pt === 'null' ? '' : (item?.kab_pt || ''),
        judul: item?.judul === 'null' ? '' : (item?.judul || ''),
        nama_skema: item?.nama_skema === 'null' ? '' : (item?.nama_skema || ''),
        nama_singkat_skema: item?.nama_singkat_skema === 'null' ? '' : (item?.nama_singkat_skema || ''),
        thn_pelaksanaan_kegiatan: item?.thn_pelaksanaan_kegiatan === 'null' ? '' : (item?.thn_pelaksanaan_kegiatan || ''),
        urutan_thn_kegitan: item?.urutan_thn_kegitan === 'null' ? '' : (item?.urutan_thn_kegitan || ''),
        bidang_fokus: item?.bidang_fokus === 'null' ? '' : (item?.bidang_fokus || ''),
        prov_mitra: item?.prov_mitra === 'null' ? '' : (item?.prov_mitra || ''),
        kab_mitra: item?.kab_mitra === 'null' ? '' : (item?.kab_mitra || ''),
        pt_latitude: item?.pt_latitude === 'null' ? '' : (item?.pt_latitude || ''),
        pt_longitude: item?.pt_longitude === 'null' ? '' : (item?.pt_longitude || ''),
        // Kosabangsa specific fields
        nama_pendamping: item?.nama_pendamping === 'null' ? '' : (item?.nama_pendamping || ''),
        nidn_pendamping: item?.nidn_pendamping === 'null' ? '' : (item?.nidn_pendamping || ''),
        kd_perguruan_tinggi_pendamping: item?.kd_perguruan_tinggi_pendamping === 'null' ? '' : (item?.kd_perguruan_tinggi_pendamping || ''),
        institusi_pendamping: item?.institusi_pendamping === 'null' ? '' : (item?.institusi_pendamping || ''),
        lldikti_wilayah_pendamping: item?.lldikti_wilayah_pendamping === 'null' ? '' : (item?.lldikti_wilayah_pendamping || ''),
        jenis_wilayah_provinsi_mitra: item?.jenis_wilayah_provinsi_mitra === 'null' ? '' : (item?.jenis_wilayah_provinsi_mitra || ''),
        bidang_teknologi_inovasi: item?.bidang_teknologi_inovasi === 'null' ? '' : (item?.bidang_teknologi_inovasi || ''),
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
            put(route('admin.pengabdian.update', item.id));
        } else {
            post(route('admin.pengabdian.store'));
        }
    };

    useEffect(() => {
        if (data.nama_singkat_skema === 'PDB') {
            setData('nama_skema', 'Pemberdayaan Desa Binaan');
        }
    }, [data.nama_singkat_skema]);

    return {
        data, setData,
        processing, errors,
        localErrors, validateLatLng,
        handleSubmit,
        isEdit
    };
}
