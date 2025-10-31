import React from 'react';

export default function Sparkline({ points = [], width = 100, height = 28, color = '#3b82f6' }) {
    if (!points || points.length === 0) {
        return <div style={{ width, height }} />;
    }
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = Math.max(1, max - min);
    const stepX = width / Math.max(1, points.length - 1);
    const d = points
        .map((p, i) => {
            const x = i * stepX;
            const y = height - ((p - min) / range) * height;
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        })
        .join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}


