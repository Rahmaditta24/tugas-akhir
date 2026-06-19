import { useState, useEffect } from 'react';
import { chartCategories, data_matrix } from '../Constants/panduanData';

export default function usePanduan({ categories }) {
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentCategories, setCurrentCategories] = useState(categories);

    useEffect(() => {
        setCurrentCategories(categories);
    }, [categories]);

    useEffect(() => {
        if (!window.Plotly) {
            const script = document.createElement('script');
            script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
            script.async = true;
            script.onload = () => {
                renderCharts();
                setLoading(false);
            };
            document.head.appendChild(script);
        } else {
            renderCharts();
            setLoading(false);
        }

        function renderCharts() {
            if (!window.Plotly) return;

            // 1. LOGIKA SANKEY
            const topics = Object.keys(data_matrix);
            const matrix = topics.map(topic =>
                chartCategories.map((_, catIndex) => (data_matrix[topic][catIndex] || []).length)
            );

            const topicScores = matrix.map(row => row.filter(x => x > 0).length);
            const top15Indices = [...Array(topics.length).keys()]
                .sort((a, b) => topicScores[b] - topicScores[a])
                .slice(0, 15);

            const topTopics = top15Indices.map(i => topics[i]);

            let source = [], target = [], value = [];
            let labels = [...topTopics, ...chartCategories];

            for (let ti = 0; ti < topTopics.length; ti++) {
                const topicName = topTopics[ti];
                for (let ci = 0; ci < chartCategories.length; ci++) {
                    const count = data_matrix[topicName][ci].length;
                    if (count > 0) {
                        source.push(ti);
                        target.push(topTopics.length + ci);
                        value.push(count);
                    }
                }
            }

            let hoverText = source.map((s, i) =>
                `Topic: <b>${labels[s]}</b><br>Kategori: <b>${labels[target[i]]}</b><br>Jumlah: <b>${value[i]}</b>`
            );

            const nodeColors = [
                ...Array(topTopics.length).fill("lightblue"),
                "coral", "lightgreen", "gold", "plum", "pink", "lightcyan", "peachpuff", "lavender"
            ];

            const sankeyData = {
                type: "sankey", orientation: "h",
                node: { pad: 15, thickness: 20, line: { color: "black", width: 0.5 }, label: labels, color: nodeColors },
                link: { source, target, value, hovertemplate: "%{customdata}<extra></extra>", customdata: hoverText }
            };

            const sankeyLayoutDesktop = { height: 700, font: { size: 10, family: 'Inter, sans-serif' }, margin: { t: 40, b: 40, l: 10, r: 10 } };
            const sankeyLayoutMobile = { height: 500, font: { size: 8, family: 'Inter, sans-serif' }, margin: { t: 40, b: 40, l: 10, r: 10 } };

            if (document.getElementById("sankey-desktop")) window.Plotly.newPlot("sankey-desktop", [sankeyData], sankeyLayoutDesktop);
            if (document.getElementById("sankey-mobile")) window.Plotly.newPlot("sankey-mobile", [sankeyData], sankeyLayoutMobile);

            // 2. LOGIKA HEATMAP
            const intensityMatrix = topics.map(topic => chartCategories.map((_, j) => (data_matrix[topic][j] || []).length));
            const heatmapHoverText = topics.map(topic => chartCategories.map(cat => {
                const codes = data_matrix[topic][chartCategories.indexOf(cat)] || [];
                return codes.length > 0
                    ? `<b>${topic}</b><br>${cat}<br>Jumlah: <b>${codes.length}</b><br>Kode: ${codes.join(", ")}`
                    : `<b>${topic}</b><br>${cat}<br><i>Tidak relevan</i>`;
            }));

            const heatmapData = [{
                z: intensityMatrix, x: chartCategories, y: topics, type: 'heatmap',
                colorscale: [[0, '#ffffff'], [0.1, '#e0f2fe'], [0.3, '#bae6fd'], [0.5, '#7dd3fc'], [0.7, '#38bdf8'], [1.0, '#0ea5e9']],
                text: heatmapHoverText, hovertemplate: '%{text}<extra></extra>',
                colorbar: { title: 'Jumlah Kode', titleside: 'right', thickness: 15 }
            }];

            const heatmapLayoutDesktop = {
                xaxis: { title: '<b>8 Bidang Strategis</b>', tickangle: -45, tickfont: { size: 10 } },
                yaxis: { title: '<b>Topik Riset</b>', automargin: true, tickfont: { size: 9 } },
                margin: { l: 200, r: 50, t: 50, b: 120 },
                hoverlabel: { bgcolor: "#1e293b", font: { color: "#fff" } }
            };

            const heatmapLayoutMobile = {
                xaxis: { title: '<b>Bidang</b>', tickangle: -60, tickfont: { size: 8 } },
                yaxis: { title: '<b>Topik</b>', automargin: true, tickfont: { size: 8 } },
                margin: { l: 150, r: 30, t: 40, b: 100 },
                height: 600
            };

            if (document.getElementById("heatmap-desktop")) window.Plotly.newPlot('heatmap-desktop', heatmapData, heatmapLayoutDesktop);
            if (document.getElementById("heatmap-mobile")) window.Plotly.newPlot('heatmap-mobile', heatmapData, heatmapLayoutMobile);
        }
    }, []);

    return {
        loading,
        sidebarOpen, setSidebarOpen,
        currentCategories
    };
}
