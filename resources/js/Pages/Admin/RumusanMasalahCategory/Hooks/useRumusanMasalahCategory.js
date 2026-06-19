import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function useRumusanMasalahCategory() {
    // Manajemen State
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingCategory, setEditingCategory] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Penanganan Form
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: 'POST',
        name: '',
        order_number: '',
        image: null,
    });

    // Menangani Penghapusan Kategori
    const { delete: destroy } = useForm();

    // Buka Modal untuk Tambah
    const openCreateModal = () => {
        setModalMode('create');
        setEditingCategory(null);
        setImagePreview(null);
        reset(); // Kosongkan form
        clearErrors();
        setData({
            _method: 'POST',
            name: '',
            order_number: '',
            image: null
        });
        setIsModalOpen(true);
    };

    // Buka Modal untuk Edit
    const openEditModal = (category) => {
        setModalMode('edit');
        setEditingCategory(category);
        setOpenMenuId(null); // Tutup menu kebab
        clearErrors();

        // Atur data form
        setData({
            _method: 'PUT', // Penting untuk spoofing upload file
            name: category.name,
            order_number: category.order_number,
            image: null // Reset input berkas
        });

        // Atur pratinjau
        setImagePreview(category.image ? `/storage/${category.image}` : null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    // Menangani Pengiriman Form
    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalMode === 'create') {
            post(route('admin.rumusan-masalah.categories.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            // Mode Edit
            post(route('admin.rumusan-masalah.categories.update', editingCategory.id), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
        setOpenMenuId(null);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            destroy(route('admin.rumusan-masalah.categories.destroy', categoryToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setCategoryToDelete(null);
                }
            });
        }
    };

    // Beralih Menu Kebab
    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Menangani Pemilihan Gambar
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return {
        openMenuId, setOpenMenuId,
        isModalOpen, setIsModalOpen,
        modalMode, setModalMode,
        editingCategory, setEditingCategory,
        imagePreview, setImagePreview,
        showDeleteModal, setShowDeleteModal,
        categoryToDelete, setCategoryToDelete,
        data, setData, processing, errors,
        openCreateModal, openEditModal, closeModal,
        handleSubmit, handleDelete, confirmDelete,
        toggleMenu, handleImageChange
    };
}
