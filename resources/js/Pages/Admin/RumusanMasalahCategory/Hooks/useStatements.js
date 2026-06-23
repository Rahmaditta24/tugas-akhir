import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function useStatements(category) {
    // --- State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [editingStatement, setEditingStatement] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // --- Actions ---
    const { delete: destroy } = useForm();
    const handleDelete = (id) => {
        setDeleteTarget(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        destroy(route('admin.rumusan-masalah.category.statements.destroy', [category.slug, deleteTarget]), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeleteTarget(null);
            }
        });
    };

    // --- Form Handling ---
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        order_number: '',
        title: '',
        description: ''
    });

    const openCreateModal = () => {
        setModalMode('create');
        setEditingStatement(null);
        clearErrors();
        reset();
        setData({
            order_number: '',
            title: '',
            description: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (statement) => {
        setModalMode('edit');
        setEditingStatement(statement);
        clearErrors();
        setData({
            order_number: statement.order_number,
            title: statement.title,
            description: statement.description || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalMode === 'create') {
            post(route('admin.rumusan-masalah.category.statements.store', category.slug), {
                onSuccess: () => closeModal()
            });
        } else {
            put(route('admin.rumusan-masalah.category.statements.update', [category.slug, editingStatement.id]), {
                onSuccess: () => closeModal()
            });
        }
    };

    return {
        isModalOpen, setIsModalOpen,
        modalMode, setModalMode,
        editingStatement, setEditingStatement,
        showDeleteModal, setShowDeleteModal,
        data, setData, processing, errors,
        openCreateModal, openEditModal, closeModal,
        handleSubmit, handleDelete, confirmDelete
    };
}
