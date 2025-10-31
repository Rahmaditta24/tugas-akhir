import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MinimalLineChart({
    data = [],
    xKey = 'name',
    series = [{ key: 'value', name: 'Jumlah', color: '#3b82f6' }],
    height = 240,
}) {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey={xKey} tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString('id-ID') : v)} />
                    {series.length > 1 && <Legend />}
                    {series.map((s) => (
                        <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}


