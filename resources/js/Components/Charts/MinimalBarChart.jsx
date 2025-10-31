import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

export default function MinimalBarChart({
    data = [],
    xKey = 'name',
    series = [{ key: 'value', name: 'Jumlah', color: '#3b82f6' }],
    height = 280,
}) {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey={xKey} tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} formatter={(v) => (typeof v === 'number' ? v.toLocaleString('id-ID') : v)} />
                    {series.length > 1 && <Legend />}
                    {series.map((s, idx) => (
                        <Bar key={s.key} dataKey={s.key} name={s.name} barSize={28} radius={[6, 6, 0, 0]} fill={s.color} stackId={s.stackId}>
                            {data.map((_, i) => (
                                <Cell key={`cell-${idx}-${i}`} fill={s.color} />
                            ))}
                        </Bar>
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}


