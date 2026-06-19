import React from 'react';

export default function StatementTable({ statements, context }) {
    const { openEditModal, handleDelete } = context;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                    <tr>
                        <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Nomor</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Judul</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Deskripsi</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Dibuat</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {statements.map((statement) => (
                        <tr key={statement.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {statement.full_number}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={statement.title}>
                                {statement.title}
                            </td>
                            <td className="px-6 py-4 text-gray-500 max-w-md truncate" title={statement.description}>
                                {statement.description || '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {statement.created_at}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                    <button
                                        className="text-amber-500 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded text-xs font-semibold"
                                        onClick={() => openEditModal(statement)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(statement.id)}
                                        className="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-xs font-semibold"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {statements.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                Belum ada statement untuk kategori ini.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
