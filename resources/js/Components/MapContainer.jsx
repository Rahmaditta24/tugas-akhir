import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import ResearchModal from './ResearchModal';
import { FIELD_COLORS, getFieldColor } from '../utils/fieldColors';

const CONFIG = {
    DEFAULT_CENTER: [-2.5, 118],
    DEFAULT_ZOOM: 5,
    MIN_ZOOM: 4,
    MAX_ZOOM: 18,
    INDONESIA_BOUNDS: [[-11.0, 94.0], [6.5, 141.0]],

    ZOOM_THRESHOLDS: {
        national: { min: 4, max: 6 },
        island: { min: 4, max: 8 },
        province: { min: 8, max: 11 },
        city: { min: 11, max: 18 }
    }
};

export default function MapContainer({
    mapData = [],
    data = [],
    displayMode = 'peneliti',
    showBubbles = true,
    viewMode = 'provinsi',
    onStatsChange,
    onCampusClick
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const processingRef = useRef(null);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const lastDataRef = useRef(null);
    const lastModeRef = useRef(null);

    const getCurrentDataType = React.useCallback(() => {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('hilirisasi')) return 'hilirisasi';
        if (path.includes('pengabdian')) return 'pengabdian';
        if (path.includes('produk')) return 'produk';
        if (path.includes('fasilitas')) return 'fasilitas-lab';
        if (path.includes('permasalahan')) return 'permasalahan';
        return 'penelitian';
    }, []);

    const fetchDetail = React.useCallback(async (id, field) => {
        if (!id || id === 'undefined' || id === '-') return;
        try {
            const type = getCurrentDataType();

            const response = await fetch(`/api/research/${type}/${id}`);
            if (response.ok) {
                const detailData = await response.json();
                if (detailData) {
                    const isProduk = type === 'produk';
                    const isHilirisasi = type === 'hilirisasi';
                    const isPengabdian = type === 'pengabdian';
                    // Create normalized data structure for the modal
                    const normalized = {
                        ...detailData,
                        isInstitusi: false,
                        // Ensure common field names are available
                        judul: detailData.judul || detailData.judul_kegiatan || detailData.nama_produk || '-',
                        nama: detailData.nama || detailData.nama_ketua || detailData.nama_pengusul || detailData.nama_inventor || '-',
                        institusi: detailData.institusi || detailData.nama_institusi || detailData.perguruan_tinggi || '-',
                        provinsi: detailData.provinsi || detailData.prov_pt || detailData.prov_mitra || '-',
                        skema: detailData.skema || detailData.nama_skema || '-',
                        tahun: detailData.tahun || detailData.thn_pelaksanaan || detailData.thn_pelaksanaan_kegiatan || '-',
                        bidang_fokus: field || detailData.bidang_fokus || detailData.bidang || detailData.skema || detailData.nama_skema || '-',
                        // Produk-specific aliases for modal rendering
                        isProduk,
                        isHilirisasi,
                        nama_produk: detailData.nama_produk || '-',
                        deskripsi_produk: detailData.deskripsi_produk || '-',
                        tkt: detailData.tkt ?? '-',
                        bidang: detailData.bidang || detailData.bidang_fokus || '-',
                        nama_inventor: detailData.nama_inventor || detailData.nama || '-',
                        email_inventor: detailData.email_inventor || '-',
                        nomor_paten: detailData.nomor_paten || '-',
                        // Hilirisasi-specific aliases for modal rendering
                        nama_peneliti: detailData.nama || detailData.nama_ketua || detailData.nama_pengusul || '-',
                        skema_hilirisasi: detailData.skema || detailData.nama_skema || '-',
                        tahun_hilirisasi: detailData.tahun || detailData.thn_pelaksanaan || detailData.thn_pelaksanaan_kegiatan || '-',
                        // Pengabdian-specific aliases for modal rendering
                        isPengabdian,
                        pengabdian_nama: detailData.nama || '-',
                        pengabdian_institusi: detailData.nama_institusi || detailData.institusi || '-',
                        pengabdian_status_pt: detailData.ptn_pts || '-',
                        pengabdian_kabupaten: detailData.kab_pt || '-',
                        pengabdian_provinsi: detailData.prov_pt || detailData.provinsi || '-',
                        pengabdian_klaster: detailData.klaster || '-',
                        pengabdian_skema: detailData.nama_skema || detailData.nama_singkat_skema || detailData.skema || '-',
                        pengabdian_tahun: detailData.thn_pelaksanaan_kegiatan || detailData.tahun || '-',
                        pengabdian_bidang_fokus: detailData.bidang_fokus || field || '-',
                        pengabdian_nama_pendamping: detailData.nama_pendamping || '-',
                        pengabdian_institusi_pendamping: detailData.institusi_pendamping || '-',
                        pengabdian_bidang_teknologi: detailData.bidang_teknologi_inovasi || '-',
                        pengabdian_jenis_wilayah: detailData.jenis_wilayah_provinsi_mitra || '-',
                        pengabdian_provinsi_mitra: detailData.prov_mitra || '-',
                        currentDataType: type,
                    };
                    setSelectedResearch(normalized);
                    setIsModalOpen(true);
                }
            }
        } catch (error) {
            console.error('Error fetching research detail:', error);
        }
    }, [getCurrentDataType, setSelectedResearch, setIsModalOpen]);

    useEffect(() => {
        window.openResearchDetail = (id, field) => {
            const currentId = id || window._lastClickedId;
            if (currentId && currentId !== 'undefined' && currentId !== '-') {
                fetchDetail(currentId, field);
            } else {
                console.warn('Attempted to open research detail with invalid ID:', id);
            }
        };

        window.openInstitusiDetail = (dataString) => {
            try {
                let data;
                try {
                    data = JSON.parse(dataString);
                } catch {
                    data = JSON.parse(decodeURIComponent(dataString));
                }
                const currentDataType = typeof getCurrentDataType === 'function' ? getCurrentDataType() : null;
                setSelectedResearch({ ...data, isInstitusi: true, currentDataType });
                setIsModalOpen(true);

                // Trigger parent callback if provided
                if (onCampusClick && data.institusi) {
                    onCampusClick(data.institusi);
                }
            } catch (e) {
                console.error("Error parsing institusi data", e);
            }
        };

        return () => {
            // Keep globals for Leaflet popups unless unmounting completely
            // Actually, usually safe to keep them or just re-assign.
        };
    }, [fetchDetail]);

    const normalizeItem = React.useCallback((item) => {
        if (!item) return null;

        // ID Detection (Priority: Specific IDs, then generic ID, then split IDS)
        const id = item._id || item.hilirisasi_id || item.pengabdian_id || item.produk_id || item.id || (item.ids ? item.ids.split('|')[0] : null);

        // Institution Detection
        const institusi = (item._institusi && item._institusi !== 'undefined' && item._institusi !== '-') ? item._institusi : (item.institusi || item.nama_institusi || item.perguruan_tinggi || item.pt || '-');

        // Province Detection
        const provinsi = (item._provinsi && item._provinsi !== 'undefined' && item._provinsi !== '-') ? item._provinsi : (item.provinsi || item.prov_pt || item.prov_mitra || '-');

        // Count Detection
        const count = item._count || item.total_produk || item.total_penelitian || item.total_hilirisasi || item.total_pengabdian || 1;

        // Field/Bidang Detection
        const field = item._field || item.bidang_fokus || item.skema || item.bidang || '-';

        // Title Detection
        const judul = item._judul || item.judul || item.judul_kegiatan || item.nama_produk || item.title || 'Detail';

        return {
            ...item,
            _id: (id && id !== 'undefined') ? String(id) : null,
            _institusi: String(institusi),
            _provinsi: String(provinsi),
            _count: Number(count),
            _field: String(field),
            _judul: String(judul),
            _tkt: item.tkt || item.tingkat_tkt || item.id_tkt || item.tkt_aplikasi || item.perkiraan_tkt || '-',
            total_produk: item.total_produk || item.total_penelitian || count,
            total_inventor: (() => {
                if (item.all_researchers && typeof item.all_researchers === 'string') {
                    const unique = new Set(item.all_researchers.split('|').map(s => s.trim()).filter(s => s && s !== '-'));
                    return unique.size || '-';
                }
                return item.total_inventor || item.total_nama || item.jumlah_inventor || item.nama_inventor || item.nama || '-';
            })()
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: CONFIG.DEFAULT_CENTER,
            zoom: CONFIG.DEFAULT_ZOOM,
            minZoom: CONFIG.MIN_ZOOM,
            maxZoom: 18,
            zoomControl: true,
            preferCanvas: true,
            maxBounds: CONFIG.INDONESIA_BOUNDS,
            maxBoundsViscosity: 0.8,
            // ── Smooth zoom & pan ──────────────────────────────────────
            zoomAnimation: true,
            zoomAnimationThreshold: 4,
            markerZoomAnimation: true,
            fadeAnimation: true,
            inertia: true,
            inertiaDeceleration: 2500,
            inertiaMaxSpeed: 1200,
            easeLinearity: 0.15,
            wheelPxPerZoomLevel: 80,
            zoomSnap: 1,
            zoomDelta: 1,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
            keepBuffer: 6,
            updateWhenIdle: false,
        }).addTo(map);

        map.on('click', (e) => {
            // If click is on map background (not on a marker/cluster), reset stats
            if (onStatsChange) onStatsChange(null);
        });

        const handleZoomClass = () => {
            if (!mapRef.current) return;
            const currentZoom = map.getZoom();
            if (currentZoom >= 6) {
                mapRef.current.classList.add('zoom-level-detail');
                mapRef.current.classList.remove('zoom-level-overview');
            } else {
                mapRef.current.classList.add('zoom-level-overview');
                mapRef.current.classList.remove('zoom-level-detail');
            }
        };

        map.on('zoomend', () => {
            handleZoomClass();
            const currentZoom = map.getZoom();
            if (onStatsChange && clusterGroupRef.current) {
                if (currentZoom <= CONFIG.DEFAULT_ZOOM) {
                    onStatsChange(null);
                    return;
                }

                const markers = [];
                clusterGroupRef.current.eachLayer((layer) => {
                    if (map.getBounds().contains(layer.getLatLng())) {
                        markers.push(layer);
                    }
                });

                if (markers.length > 0) {
                    calculateStatsFromMarkers(markers);
                } else {
                    onStatsChange(null);
                }
            }
        });

        handleZoomClass();
        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const generatePopupContent = (itemArg) => {
        const item = normalizeItem(itemArg);
        const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
        const formatNum = (n) => (n && !isNaN(n)) ? Number(n).toLocaleString('id-ID') : '0';

        if (item.isFasilitasLab) {
            const modalData = {
                isInstitusi: true,
                isFasilitasLab: true,
                institusi: item._institusi,
                total_penelitian: item._count,
                ptn_pts: item.kategori_pt,
                kategori_pt: item.kategori_pt,
                provinsi: item._provinsi,
                lab_list: item.lab_list || '',
                tool_list: item.tool_list || '',
            };
            const encoded = encodeURIComponent(JSON.stringify(modalData));
            return `
                <div style="padding: 12px; min-width: 200px; font-family: 'Inter', sans-serif;">
                    <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1e40af;">${safeValue(item._institusi)}</h3>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${formatNum(item._count)} laboratorium</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                        <div style="width: 25px; height: 8px; background: #3E7DCA; border-radius: 4px;"></div>
                        <span onclick="window.openInstitusiDetail('${encoded}')" 
                             style="color: #64748b; font-size: 11px; font-style: italic; cursor: pointer; hover: color: #3E7DCA;">
                             Klik untuk detail
                        </span>
                    </div>
                </div>
            `;
        }

        if (item.jenis_permasalahan) {
            const region = item.kabupaten_kota || item._provinsi || 'Wilayah';
            return `
                <div style="padding: 8px 12px; min-width: 180px; font-family: sans-serif;">
                    <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 4px;">${safeValue(region)}</div>
                    <div style="font-size: 13px; color: #4b5563; line-height: 1.4;">
                        <span style="font-weight: 500;">${safeValue(item.jenis_permasalahan)}:</span> 
                        ${formatNum(item.nilai)} ${safeValue(item.satuan)}
                    </div>
                </div>
            `;
        } else {
            let popupContent = '<div class="p-3" style="max-width: 320px; font-family: sans-serif;">';
            if (item._count > 1 || !item._id) {
                popupContent += `<div class="mb-2 p-2 bg-blue-50 rounded"><p class="text-sm font-bold text-[#3E7DCA]">Total: ${formatNum(item._count)}</p></div>`;
            }
            if (item._institusi && item._institusi !== '-') {
                const arr = item._institusi.split(' | ');
                const str = arr.length > 3 ? arr.slice(0, 3).join(', ') + ` (+${arr.length - 3})` : item._institusi.replace(/ \| /g, ', ');
                popupContent += `<p class="text-xs mb-1"><strong>Institusi:</strong> ${safeValue(str)}</p>`;
            }
            if (item._provinsi && item._provinsi !== '-') popupContent += `<p class="text-xs"><strong>Provinsi:</strong> ${safeValue(item._provinsi)}</p>`;

            if (item._id && item._id !== 'undefined') {
                const escField = item._field.replace(/'/g, "\\'");
                popupContent += `
                    <div class="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                        <span onclick="window.openResearchDetail('${item._id}', '${escField}')" 
                            style="color: #64748b; font-size: 11px; font-style: italic; cursor: pointer;">
                            Klik untuk detail
                        </span>
                    </div>
                `;
            }

            popupContent += '</div>';
            return popupContent;
        }
    };

    const generateDetailPopup = (title, field, institusi, provinsi, tahun, id, color, tkt = null) => {
        const safeValue = (val) => (val === null || val === undefined || val === '') ? '-' : val;
        const escField = safeValue(field).replace(/'/g, "\\'");
        const type = getCurrentDataType();
        const isProdukMode = type === 'produk';
        const isHilirisasiMode = type === 'hilirisasi';

        return `
            <div style="padding: 10px; min-width: 280px; max-width: 350px; font-family: 'Inter', sans-serif; background: #ffffff;">
                <div style="font-weight: 800; font-size: 15px; color: #3E7DCA; margin-bottom: 12px; line-height: 1.3; letter-spacing: -0.01em;">
                    ${safeValue(title)}
                </div>
                <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 12px;"></div>
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: #2d3748; width: 85px; flex-shrink: 0;">Institusi:</span>
                    <span style="font-size: 12px; color: #4a5568;">${safeValue(institusi)}</span>
                  </div>
                  <div style="display: flex; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: #2d3748; width: 85px; flex-shrink: 0;">Provinsi:</span>
                    <span style="font-size: 12px; color: #4a5568;">${safeValue(provinsi)}</span>
                  </div>
                  ${isProdukMode ? `
                  <div style="display: flex; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: #2d3748; width: 85px; flex-shrink: 0;">TKT:</span>
                    <span style="font-size: 12px; color: #4a5568;">${safeValue(tkt)}</span>
                  </div>
                  ` : `
                  <div style="display: flex; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: #2d3748; width: 85px; flex-shrink: 0;">Tahun:</span>
                    <span style="font-size: 12px; color: #4a5568;">${safeValue(tahun)}</span>
                  </div>
                  `}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    ${!isHilirisasiMode ? `
                    <div style="background-color: ${color || '#f43f5e'}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                        ${safeValue(field)}
                    </div>
                    ` : `
                    <div style="width: 25px; height: 8px; background: #3E7DCA; border-radius: 4px;"></div>
                    `}
                    <span onclick="window.openResearchDetail('${id}', '${escField}')" 
                         style="color: #64748b; font-size: 11px; font-style: italic; cursor: pointer; hover: color: #3E7DCA;">
                         Klik untuk detail
                    </span>
                </div>
            </div>
        `;
    };

    const calculateStatsFromMarkers = (markers) => {
        if (!onStatsChange) return;

        // Use setTimeout to allow the popup to open before a potential re-render triggers
        setTimeout(() => {
            let totalResearch = 0;
            const institutions = new Set();
            const provinces = new Set();
            const fields = new Set();

            markers.forEach(marker => {
                const count = marker.options.penelitianCount || 0;
                totalResearch += count;

                const data = marker.options.statsData;
                if (data) {
                    if (data.institusi) {
                        data.institusi.split('|').forEach(i => {
                            const trimmed = i.trim();
                            if (trimmed && trimmed !== '-') institutions.add(trimmed);
                        });
                    }
                    if (data.provinsi) {
                        data.provinsi.split('|').forEach(p => {
                            const trimmed = p.trim();
                            if (trimmed && trimmed !== '-') provinces.add(trimmed);
                        });
                    }
                    if (data.bidang) {
                        data.bidang.split('|').forEach(f => {
                            const trimmed = f.trim();
                            if (trimmed && trimmed !== '-') fields.add(trimmed);
                        });
                    }
                }
            });

            onStatsChange({
                totalResearch,
                totalUniversities: institutions.size,
                totalProvinces: provinces.size,
                totalFields: fields.size || 13
            });
        }, 50);
    };

    useEffect(() => {
        const fullSource = (mapData && mapData.length) ? mapData : data;
        if (!mapInstanceRef.current) return;

        // PREVENT UNNECESSARY REDRAWS: 
        // Only clear and redraw if the displayMode has changed OR the data content has changed
        const dataKey = JSON.stringify({
            len: fullSource.length,
            mode: displayMode,
            bubbles: showBubbles,
            firstId: fullSource[0]?.id || fullSource[0]?._id
        });

        if (lastDataRef.current === dataKey) {
            return;
        }

        lastDataRef.current = dataKey;

        if (processingRef.current) {
            cancelAnimationFrame(processingRef.current);
            processingRef.current = null;
        }

        if (clusterGroupRef.current) {
            mapInstanceRef.current.removeLayer(clusterGroupRef.current);
            clusterGroupRef.current = null;
        }

        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.GeoJSON) {
                if (!layer.options?.permanent) { // Protection for base layers if any
                    mapInstanceRef.current.removeLayer(layer);
                }
            }
        });

        const isPermasalahan = fullSource.length > 0 && fullSource[0].jenis_permasalahan !== undefined;

        if (showBubbles) {
            const clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 50,
                iconCreateFunction: function (cluster) {
                    const total = cluster.getAllChildMarkers().reduce((sum, m) => sum + (m.options.penelitianCount || 0), 0);

                    // Set constant size for all bubbles (Matching original: 50px)
                    const radius = 25;
                    const fontSize = 14;
                    return L.divIcon({
                        html: `<div style="background-color: rgba(62, 125, 202, 0.7); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 0 10px rgba(0,0,0,0.2); cursor: pointer;">${total.toLocaleString('id-ID')}</div>`,
                        className: 'custom-cluster-icon',
                        iconSize: L.point(radius * 2, radius * 2, true),
                        iconAnchor: L.point(radius, radius)
                    });
                },
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                spiderLegPolylineOptions: { weight: 0, color: 'transparent', opacity: 0 }
            });

            // Intercept cluster click: zoom in first, spiderfy only at high zoom
            clusterGroup.on('clusterclick', function (event) {
                const cluster = event.layer;
                const map = mapInstanceRef.current;
                if (!map) return;
                const currentZoom = map.getZoom();
                const maxZoom = map.getMaxZoom();

                // For clusters that contain same-point markers (hilirisasi/produk):
                // force zoom-in until high enough, then let spiderfy happen
                const childMarkers = cluster.getAllChildMarkers();
                const hasSamePointMarkers = childMarkers.length > 0 &&
                    childMarkers[0].options?.icon?.options?.className?.includes('custom-marker-individu');

                if (hasSamePointMarkers && currentZoom < 14) {
                    L.DomEvent.stopPropagation(event);
                    map.flyTo(cluster.getLatLng(), 14, { duration: 0.6 });
                }
                // At zoom >= 14 → default spiderfy behavior
            });

            clusterGroupRef.current = clusterGroup;
            mapInstanceRef.current.addLayer(clusterGroup);

            const markersToAdd = [];
            let processedSource = fullSource;

            if (displayMode === 'institusi' && !isPermasalahan && fullSource.length > 0 && !fullSource[0].isFasilitasLab) {
                const campusMap = {};
                for (let x = 0; x < fullSource.length; x++) {
                    const raw = fullSource[x];
                    const ni = normalizeItem(raw);
                    const campusName = ni._institusi;
                    if (!campusMap[campusName]) {
                        campusMap[campusName] = {
                            ...raw,
                            _isAggregated: true,
                            _totalCount: 0,
                            _bidangCounts: {},
                            _skemaCounts: {},
                            _temaCounts: {},
                            _tahunCounts: {},
                            _inventors: new Set()
                        };
                    }
                    const g = campusMap[campusName];
                    const c = ni._count || 1;
                    g._totalCount += c;

                    const updateCounts = (sourceStr, countMap) => {
                        if (sourceStr && typeof sourceStr === 'string' && sourceStr !== '-') {
                            sourceStr.split('|').forEach(val => {
                                const trimmed = val.trim();
                                if (trimmed && trimmed !== '-' && trimmed !== 'undefined') {
                                    if (trimmed.includes(':::')) {
                                        const [item, count] = trimmed.split(':::');
                                        countMap[item] = (countMap[item] || 0) + parseInt(count || 1);
                                    } else {
                                        countMap[trimmed] = (countMap[trimmed] || 0) + 1;
                                    }
                                }
                            });
                        }
                    };

                    const bf = raw.pengabdian_bidang_fokus || raw.bidang_fokus || raw.bidang || ni._field || '-';
                    if (bf !== '-' && bf !== 'undefined' && !bf.includes('|')) g._bidangCounts[bf] = (g._bidangCounts[bf] || 0) + 1;
                    else updateCounts(bf, g._bidangCounts);

                    const sk = raw.pengabdian_skema || raw.nama_skema || raw.skema || raw.skema_hilirisasi || raw.skema_list || '-';
                    if (sk !== '-' && sk !== 'undefined' && !sk.includes('|')) g._skemaCounts[sk] = (g._skemaCounts[sk] || 0) + 1;
                    else updateCounts(sk, g._skemaCounts);

                    const tm = raw.tema_prioritas || raw.tema || raw.luaran || raw.tema_list || '-';
                    if (tm !== '-' && tm !== 'undefined' && !tm.includes('|')) g._temaCounts[tm] = (g._temaCounts[tm] || 0) + 1;
                    else updateCounts(tm, g._temaCounts);

                    const th = raw.pengabdian_tahun || raw.tahun || raw.thn_pelaksanaan || raw.thn_pelaksanaan_kegiatan || raw.tahun_list || '-';
                    if (th !== '-' && th !== 'undefined' && !th.includes('|')) g._tahunCounts[th] = (g._tahunCounts[th] || 0) + 1;
                    else updateCounts(th, g._tahunCounts);

                    const inv = raw.nama_inventor || raw.nama_ketua || raw.nama_pengusul || raw.nama || '-';
                    if (inv !== '-') g._inventors.add(inv);
                }
                processedSource = Object.values(campusMap).map(g => ({
                    ...g,
                    _count: g._totalCount,
                    total_produk: g._totalCount,
                    total_penelitian: g._totalCount,
                    total_pengabdian: g._totalCount,
                    total_hilirisasi: g._totalCount,
                    bidang_fokus: Object.entries(g._bidangCounts).map(([k, v]) => `${k}:::${v}`).join('|'),
                    skema_list: Object.entries(g._skemaCounts).map(([k, v]) => `${k}:::${v}`).join('|'),
                    tema_list: Object.entries(g._temaCounts).map(([k, v]) => `${k}:::${v}`).join('|'),
                    tahun_list: Object.entries(g._tahunCounts).map(([k, v]) => `${k}:::${v}`).join('|'),
                    total_nama: g._inventors.size,
                    total_inventor: g._inventors.size,
                }));
            }

            for (let i = 0; i < processedSource.length; i++) {
                const rawItem = processedSource[i];
                const item = normalizeItem(rawItem);
                const lat = parseFloat(rawItem.pt_latitude ?? rawItem.latitude);
                const lng = parseFloat(rawItem.pt_longitude ?? rawItem.longitude);
                if (isNaN(lat) || isNaN(lng)) continue;

                // ── FasilitasLab: grouped per institusi ──────────────────
                if (rawItem.isFasilitasLab) {
                    const count = item._count;
                    // Logo file named exactly as institusi name, stored in public/assets/logos/
                    const logoUrl = item._institusi
                        ? `/assets/logos/${encodeURIComponent(item._institusi)}.webp`
                        : null;
                    const initials = (item._institusi || '?').split(/\s+/).map(w => w[0]).slice(0, 3).join('');
                    const size = 52;
                    const radius = 25;
                    const fontSize = 14;

                    const iconHtml = `
                    <div class="fasilitas-institusi-marker" style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
                        <div class="produk-bubble" style="position:absolute; inset:0; margin:auto; background-color: rgba(62, 125, 202, 0.7); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 0 10px rgba(0,0,0,0.2); pointer-events: none; transition: all 0.2s;">
                            ${count.toLocaleString('id-ID')}
                        </div>
                        <div class="produk-logo" style="position:absolute; inset:0; border-radius:50%; border:2.5px solid #3E7DCA; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.25); overflow:hidden; pointer-events: none; transition: all 0.2s;">
                            <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#3E7DCA;">${initials}</span>
                            ${logoUrl ? `<img src="${logoUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#fff;" onerror="this.style.display='none'"/>` : ''}
                        </div>
                    </div>`;

                    const marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            html: iconHtml,
                            className: 'fasilitas-marker',
                            iconSize: L.point(size, size),
                            iconAnchor: L.point(size / 2, size / 2)
                        }),
                        penelitianCount: count,
                        statsData: { institusi: item._institusi, provinsi: item._provinsi },
                    });

                    marker.on('click', () => {
                        if (onCampusClick && item._institusi) {
                            onCampusClick(item._institusi);
                        }
                    });

                    const fasilitasRawItem = { ...rawItem, isInstitusi: true, isFasilitasLab: true };
                    marker._fasilitasData = fasilitasRawItem;

                    marker.bindPopup(`
                        <div style="padding: 8px 4px; min-width: 220px; font-family: 'Inter', sans-serif;">
                            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #3E7DCA; cursor: pointer;" onclick="window.openInstitusiDetail('${encodeURIComponent(JSON.stringify(fasilitasRawItem))}')">
                                ${item._institusi}
                            </h3>
                            <div style="font-size: 14px; color: #334155; margin-bottom: 12px;">
                                ${count.toLocaleString('id-ID')} fasilitas laboratorium
                            </div>
                            <div onclick="window.openInstitusiDetail('${encodeURIComponent(JSON.stringify(fasilitasRawItem))}')" style="color: #64748b; font-size: 12px; font-style: italic; cursor: pointer;">
                                Klik untuk melihat detail kampus
                            </div>
                        </div>
                    `, { maxWidth: 320, autoPanPadding: [50, 100] });
                    marker.on('click', (e) => {
                        L.DomEvent.stopPropagation(e);

                        if (mapInstanceRef.current && mapInstanceRef.current.getZoom() < 7) {
                            mapInstanceRef.current.flyTo([lat, lng], 8, { duration: 0.4 });
                        } else {
                            calculateStatsFromMarkers([marker]);
                            marker.openPopup();
                        }
                    });
                    markersToAdd.push(marker);
                    continue;
                }

                if (displayMode === 'institusi' && !isPermasalahan) {
                    const count = item._count;
                    const radius = 25;
                    const fontSize = 14;
                    const dataType = getCurrentDataType();

                    let iconHtml = '';
                    let iconSizeParams;
                    let iconAnchorParams;

                    if (dataType === 'produk') {
                        const logoUrl = item._institusi
                            ? `/assets/logos/${encodeURIComponent(item._institusi)}.webp`
                            : null;
                        const initials = (item._institusi || '?').split(/\s+/).map(w => w[0]).slice(0, 3).join('');
                        const size = 52;

                        iconHtml = `
                        <div class="produk-institusi-marker" style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
                            <div class="produk-bubble" style="position:absolute; inset:0; margin:auto; background-color: rgba(62, 125, 202, 0.7); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 0 10px rgba(0,0,0,0.2); pointer-events: none; transition: all 0.2s;">
                                ${count.toLocaleString('id-ID')}
                            </div>
                            <div class="produk-logo" style="position:absolute; inset:0; border-radius:50%; border:2.5px solid #3E7DCA; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.25); overflow:hidden; pointer-events: none; transition: all 0.2s;">
                                <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#3E7DCA;">${initials}</span>
                                ${logoUrl ? `<img src="${logoUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#fff;" onerror="this.style.display='none'"/>` : ''}
                            </div>
                        </div>`;
                        iconSizeParams = L.point(size, size);
                        iconAnchorParams = L.point(size / 2, size / 2);
                    } else {
                        iconHtml = `<div style="background-color: rgba(62, 125, 202, 0.7); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 0 10px rgba(0,0,0,0.2); cursor: pointer;">${count.toLocaleString('id-ID')}</div>`;
                        iconSizeParams = L.point(radius * 2, radius * 2, true);
                        iconAnchorParams = L.point(radius, radius);
                    }

                    const marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            html: iconHtml,
                            className: 'custom-marker-institusi',
                            iconSize: iconSizeParams,
                            iconAnchor: iconAnchorParams
                        }),
                        penelitianCount: count,
                        statsData: {
                            institusi: item._institusi,
                            provinsi: item._provinsi
                        }
                    });
                    const labelName = dataType === 'produk' ? 'produk' : dataType === 'hilirisasi' ? 'hilirisasi' : dataType === 'pengabdian' ? 'pengabdian' : 'penelitian';
                    marker.bindPopup(`
                        <div style="padding: 8px 4px; min-width: 220px; font-family: 'Inter', sans-serif;">
                            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #3E7DCA; cursor: pointer;" onclick="window.openInstitusiDetail('${encodeURIComponent(JSON.stringify(rawItem))}')">
                                ${item._institusi}
                            </h3>
                            <div style="font-size: 14px; color: #334155; margin-bottom: 12px;">
                                ${count.toLocaleString('id-ID')} ${labelName}
                            </div>
                            <div onclick="window.openInstitusiDetail('${encodeURIComponent(JSON.stringify(rawItem))}')" style="color: #64748b; font-size: 12px; font-style: italic; cursor: pointer;">
                                Klik untuk melihat detail kampus
                            </div>
                        </div>
                    `, { maxWidth: 320, autoPanPadding: [50, 100] });


                    marker.on('click', (e) => {
                        L.DomEvent.stopPropagation(e);

                        if (dataType === 'produk' && mapInstanceRef.current && mapInstanceRef.current.getZoom() < 7) {
                            mapInstanceRef.current.flyTo([lat, lng], 8, { duration: 0.4 });
                        } else {
                            calculateStatsFromMarkers([marker]);
                            marker.openPopup();
                        }
                    });

                    markersToAdd.push(marker);
                }
                else if (displayMode === 'peneliti' && !isPermasalahan) {
                    const hasGroupedDetails = !!rawItem.ids;
                    const hasSingleDetail = !!item._id;
                    const hasDetails = hasGroupedDetails || hasSingleDetail;

                    const fields = hasGroupedDetails
                        ? (rawItem.bidang_fokus ? rawItem.bidang_fokus.split('|') : [])
                        : [item._field];
                    const ids = hasGroupedDetails
                        ? rawItem.ids.split('|').filter(id => id && id !== 'undefined')
                        : (item._id ? [item._id] : []);
                    const titles = hasGroupedDetails
                        ? (rawItem.titles ? rawItem.titles.split('|') : [])
                        : [item._judul];
                    const years = hasGroupedDetails
                        ? (rawItem.tahun_list ? rawItem.tahun_list.split('|') : [])
                        : [rawItem.tahun || '-'];
                    const tkts = hasGroupedDetails
                        ? (rawItem.tkt_list ? rawItem.tkt_list.split('|') : [])
                        : [item._tkt || '-'];
                    const count = hasDetails ? ids.length : (item._count || 1);

                    if (!hasDetails && count > 30) {
                        const radius = 25;
                        const fontSize = 14;
                        const marker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                html: `<div style="background-color: rgba(62, 125, 202, 0.7); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 0 10px rgba(0,0,0,0.2); cursor: pointer;">${count.toLocaleString('id-ID')}</div>`,
                                className: 'custom-marker-default',
                                iconSize: L.point(radius * 2, radius * 2, true),
                                iconAnchor: L.point(radius, radius)
                            }),
                            penelitianCount: count,
                            statsData: {
                                institusi: item._institusi,
                                provinsi: item._provinsi,
                                bidang: item._field
                            }
                        });
                        marker.bindPopup(generatePopupContent(rawItem), { maxWidth: 320, autoPanPadding: [50, 100] });

                        marker.on('click', (e) => {
                            L.DomEvent.stopPropagation(e);
                            calculateStatsFromMarkers([marker]);
                            marker.openPopup();
                        });

                        markersToAdd.push(marker);
                    } else {
                        for (let idx = 0; idx < count; idx++) {
                            let matchedColor = '#3E7DCA';
                            const dataType = getCurrentDataType();
                            if (dataType === 'hilirisasi' || dataType === 'produk') {
                                matchedColor = '#3E7DCA';
                            } else if (hasDetails) {
                                const field = fields[idx];
                                for (const [key, color] of Object.entries(FIELD_COLORS)) {
                                    if (field && field.includes(key)) { matchedColor = color; break; }
                                }
                            }

                            let coords;
                            if (dataType === 'hilirisasi' || dataType === 'produk') {
                                // Always place at same point → let spiderfy create flower pattern
                                coords = [lat, lng];
                            } else if (idx === 0) {
                                coords = [lat, lng];
                            } else {
                                const radiusKm = 0.6;
                                const radiusDegrees = radiusKm / 111;
                                const angle = ((idx - 1) * (2 * Math.PI / (count - 1)));

                                coords = [
                                    lat + radiusDegrees * Math.cos(angle),
                                    lng + radiusDegrees * Math.sin(angle)
                                ];
                            }

                            let marker;
                            if (dataType === 'pengabdian') {
                                marker = L.marker(coords, {
                                    icon: L.divIcon({
                                        className: 'research-circle-marker-premium custom-marker-individu',
                                        html: `
                                            <div class="individu-wrapper" style="width: 50px; height: 50px; position: relative;">
                                                <div class="individu-dot" style="position: absolute; top: 17px; left: 17px; width: 16px; height: 16px; border-radius: 50%; background-color: ${matchedColor}; opacity: 0.8; border: 2px solid ${matchedColor};"></div>
                                                <div class="individu-bubble" style="position: absolute; inset: 0; background-color: rgba(62, 125, 202, 0.7); width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 0 10px rgba(0,0,0,0.2);">1</div>
                                            </div>
                                        `,
                                        iconSize: L.point(50, 50),
                                        iconAnchor: L.point(25, 25)
                                    }),
                                    penelitianCount: 1,
                                    statsData: {
                                        institusi: item._institusi,
                                        provinsi: item._provinsi,
                                        bidang: fields[idx]
                                    }
                                });
                            } else if (dataType === 'hilirisasi' || dataType === 'produk') {
                                marker = L.marker(coords, {
                                    icon: L.divIcon({
                                        className: 'research-circle-marker-premium custom-marker-individu',
                                        html: `
                                            <div class="individu-wrapper" style="width: 50px; height: 50px; position: relative;">
                                                <div class="individu-dot" style="position: absolute; top: 17px; left: 17px; width: 16px; height: 16px; border-radius: 50%; background-color: #3E7DCA; opacity: 0.85;"></div>
                                                <div class="individu-bubble" style="position: absolute; inset: 0; background-color: rgba(62, 125, 202, 0.7); width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 0 10px rgba(0,0,0,0.2);">1</div>
                                            </div>
                                        `,
                                        iconSize: L.point(50, 50),
                                        iconAnchor: L.point(25, 25)
                                    }),
                                    penelitianCount: 1,
                                    statsData: {
                                        institusi: item._institusi,
                                        provinsi: item._provinsi,
                                        bidang: fields[idx]
                                    }
                                });
                            } else {
                                marker = L.circleMarker(coords, {
                                    radius: 8,
                                    fillColor: matchedColor,
                                    fillOpacity: 0.8,
                                    stroke: false,
                                    className: 'research-circle-marker-premium',
                                    penelitianCount: 1,
                                    statsData: {
                                        institusi: item._institusi,
                                        provinsi: item._provinsi,
                                        bidang: fields[idx]
                                    }
                                });
                            }
                            const popup = hasDetails ?
                                generateDetailPopup(
                                    titles[idx] || 'Detail',
                                    fields[idx],
                                    item._institusi,
                                    item._provinsi,
                                    years[idx],
                                    ids[idx],
                                    matchedColor,
                                    tkts[idx]
                                ) :
                                generatePopupContent(rawItem);

                            marker.bindPopup(popup, { maxWidth: 400, autoPanPadding: [50, 100] });

                            marker.on('click', async (e) => {
                                L.DomEvent.stopPropagation(e);
                                calculateStatsFromMarkers([marker]);

                                // AUTO-FETCH: Get TKT from API if missing in summary data
                                const type = getCurrentDataType();
                                const currentTkt = tkts[idx];
                                if ((type === 'produk' || type === 'hilirisasi') && (currentTkt === '-' || currentTkt === 'undefined')) {
                                    try {
                                        const resp = await fetch(`/api/research/${type}/${ids[idx]}`);
                                        if (resp.ok) {
                                            const det = await resp.json();
                                            const realTkt = det.tkt || det.id_tkt || det.tingkat_tkt || '-';
                                            const updatedPopup = generateDetailPopup(
                                                titles[idx] || 'Detail',
                                                fields[idx],
                                                item._institusi,
                                                item._provinsi,
                                                years[idx],
                                                ids[idx],
                                                matchedColor,
                                                realTkt
                                            );
                                            marker.setPopupContent(updatedPopup);
                                        }
                                    } catch (err) { console.error("Error fetching popup TKT:", err); }
                                }

                                marker.openPopup();
                            });

                            markersToAdd.push(marker);
                        }
                    }
                }
                else {
                    const count = item._count;
                    const radius = 25;
                    const fontSize = 14;
                    const marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            html: `<div style="background-color: rgba(62, 125, 202, 0.7); width: ${radius * 2}px; height: ${radius * 2}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${fontSize}px; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">${count.toLocaleString('id-ID')}</div>`,
                            className: 'custom-marker-default',
                            iconSize: [radius * 2, radius * 2],
                            iconAnchor: [radius, radius]
                        }),
                        penelitianCount: count,
                        statsData: {
                            institusi: item._institusi,
                            provinsi: item._provinsi
                        }
                    });
                    marker.bindPopup(generatePopupContent(rawItem), { autoPanPadding: [50, 100] });

                    marker.on('click', (e) => {
                        L.DomEvent.stopPropagation(e);
                        calculateStatsFromMarkers([marker]);
                        marker.openPopup();
                    });

                    markersToAdd.push(marker);
                }
            }

            clusterGroup.addLayers(markersToAdd);
        }

        return () => {
            if (processingRef.current) cancelAnimationFrame(processingRef.current);
        };
    }, [mapData, data, showBubbles, displayMode, viewMode, fetchDetail, normalizeItem]);

    return (
        <>
            <style>{`
                .zoom-level-overview .produk-logo { opacity: 0; pointer-events: none; transform: scale(0.5); }
                .zoom-level-overview .produk-bubble { opacity: 1; pointer-events: none; transform: scale(1); }
                .zoom-level-detail .produk-logo { opacity: 1; pointer-events: none; transform: scale(1); }
                .zoom-level-detail .produk-bubble { opacity: 0; pointer-events: none; transform: scale(0.5); }
                .produk-logo, .produk-bubble { transition: all 0.3s ease-in-out; }
                
                .zoom-level-overview .individu-dot { opacity: 0; pointer-events: none; transform: scale(0.5); }
                .zoom-level-overview .individu-bubble { opacity: 1; pointer-events: none; transform: scale(1); }
                .zoom-level-detail .individu-dot { opacity: 1; pointer-events: auto; transform: scale(1); }
                .zoom-level-detail .individu-bubble { opacity: 0; pointer-events: none; transform: scale(0.5); }
                .individu-dot, .individu-bubble { transition: all 0.3s ease-in-out; }
                .leaflet-marker-icon.custom-marker-individu { background: transparent !important; border: none !important; }
                .leaflet-cluster-spider-leg { display: none !important; }
            `}</style>
            <section className="relative bg-white flex justify-center mb-2">
                <div id="map" ref={mapRef} className="lg:w-[90%] w-full h-[65vh] border relative z-0 rounded-lg shadow-inner overflow-hidden" />
            </section>
            <ResearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedResearch} />
        </>
    );
}