import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

export default function MinimalDonutChart({ data = [], valueKey = 'value', nameKey = 'name', colors = ['#3b82f6', '#f59e0b'], height = 280 }) {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <PieChart>
                    <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString('id-ID') : v)} />
                    <Legend />
                    <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={60} outerRadius={100} paddingAngle={3}>
                        {data.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}


