/* Leaflet GIS map with field polygons, risk heatmap, and index overlays. */
(function () {
  const { useRef, useEffect, useState } = React;
  const L = window.L;

  const RISK_COLOR = { low: '#10b981', medium: '#f59e0b', high: '#f43f5e' };

  // fix default marker asset paths to the vendored images
  if (L && L.Icon && L.Icon.Default) {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: './vendor/leaflet/images/marker-icon-2x.png',
      iconUrl: './vendor/leaflet/images/marker-icon.png',
      shadowUrl: './vendor/leaflet/images/marker-shadow.png',
    });
  }

  const BASE_LAYERS = {
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Esri World Imagery', max: 19 },
    street:    { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap', max: 19 },
    topo:      { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr: '© OpenTopoMap', max: 17 },
    dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '© CARTO', max: 19 },
  };

  function FieldMap({ fields, geojson, onSelect, selectedId, height = '100%', base = 'satellite',
                     overlay = 'risk', gridData = null }) {
    const elRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);
    const baseRef = useRef(null);
    const overlayRef = useRef(null);

    // init map once
    useEffect(() => {
      if (mapRef.current || !elRef.current) return;
      const center = fields && fields.length ? [fields[0].lat, fields[0].lon] : [15.0, 101.7];
      const map = L.map(elRef.current, { center, zoom: 11, zoomControl: true, attributionControl: true });
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      overlayRef.current = L.layerGroup().addTo(map);
      setTimeout(() => map.invalidateSize(), 100);
      return () => { map.remove(); mapRef.current = null; };
    }, []);

    // base layer
    useEffect(() => {
      const map = mapRef.current; if (!map) return;
      if (baseRef.current) map.removeLayer(baseRef.current);
      const b = BASE_LAYERS[base] || BASE_LAYERS.satellite;
      baseRef.current = L.tileLayer(b.url, { attribution: b.attr, maxZoom: b.max, subdomains: 'abc' }).addTo(map);
      baseRef.current.bringToBack();
    }, [base]);

    // field polygons
    useEffect(() => {
      const map = mapRef.current; const grp = layerRef.current;
      if (!map || !grp || !geojson) return;
      grp.clearLayers();
      const bounds = [];
      geojson.features.forEach((f) => {
        const p = f.properties;
        const coords = f.geometry.coordinates[0].map((c) => [c[1], c[0]]);
        bounds.push(...coords);
        const color = RISK_COLOR[p.risk_level] || '#10b981';
        const active = p.id === selectedId;
        const poly = L.polygon(coords, {
          color, weight: active ? 3 : 1.6, fillColor: color,
          fillOpacity: overlay === 'risk' ? (active ? 0.5 : 0.32) : 0.12, opacity: 0.9,
        });
        poly.on('click', () => onSelect && onSelect(p.id));
        poly.on('mouseover', () => poly.setStyle({ fillOpacity: 0.5, weight: 3 }));
        poly.on('mouseout', () => poly.setStyle({ fillOpacity: overlay === 'risk' ? (active ? 0.5 : 0.32) : 0.12, weight: active ? 3 : 1.6 }));
        poly.bindTooltip(
          `<div style="font-weight:600">${p.name_th || p.name}</div>
           <div style="opacity:.8;font-size:11px">${p.province} · ${p.variety}</div>
           <div style="font-size:11px;margin-top:2px">Health ${p.health_score}% · ${p.risk_level.toUpperCase()}</div>`,
          { sticky: true, opacity: 0.95 });
        grp.addLayer(poly);
        // center dot
        L.circleMarker([p.lat, p.lon], { radius: 4, color: '#fff', weight: 1.5, fillColor: color, fillOpacity: 1 })
          .on('click', () => onSelect && onSelect(p.id)).addTo(grp);
      });
      if (bounds.length && !selectedId) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }, [JSON.stringify(geojson), selectedId, overlay]);

    // pan to selected
    useEffect(() => {
      const map = mapRef.current; if (!map || !selectedId || !fields) return;
      const f = fields.find((x) => x.id === selectedId);
      if (f) map.flyTo([f.lat, f.lon], 14, { duration: 0.8 });
    }, [selectedId]);

    // index overlay (NDVI etc. grid heat over the selected field)
    useEffect(() => {
      const grp = overlayRef.current; if (!grp) return;
      grp.clearLayers();
      if (!gridData || !gridData.field || overlay === 'risk') return;
      const { field, grid, index } = gridData;
      const coords = JSON.parse(field.boundary_json || '[]');
      if (!coords.length) return;
      const lons = coords.map((c) => c[0]), lats = coords.map((c) => c[1]);
      const minLon = Math.min(...lons), maxLon = Math.max(...lons);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);
      const n = grid.grid_size;
      const dLat = (maxLat - minLat) / n, dLon = (maxLon - minLon) / n;
      const palettes = {
        ndvi: (v) => v > 0.6 ? '#065f46' : v > 0.45 ? '#10b981' : v > 0.3 ? '#fbbf24' : '#dc2626',
        ndwi: (v) => v > 0.2 ? '#0369a1' : v > 0 ? '#38bdf8' : v > -0.2 ? '#fcd34d' : '#b45309',
        savi: (v) => v > 0.55 ? '#065f46' : v > 0.4 ? '#10b981' : v > 0.25 ? '#fbbf24' : '#dc2626',
        evi:  (v) => v > 0.55 ? '#065f46' : v > 0.4 ? '#10b981' : v > 0.25 ? '#fbbf24' : '#dc2626',
      };
      const pal = palettes[index] || palettes.ndvi;
      for (let r = 0; r < n; r++) {
        for (let cI = 0; cI < n; cI++) {
          const v = grid.cells[r][cI];
          const south = minLat + (n - 1 - r) * dLat, west = minLon + cI * dLon;
          L.rectangle([[south, west], [south + dLat, west + dLon]],
            { color: pal(v), weight: 0, fillColor: pal(v), fillOpacity: 0.6 })
            .bindTooltip(`${index.toUpperCase()}: ${v}`, { sticky: true }).addTo(grp);
        }
      }
    }, [JSON.stringify(gridData), overlay]);

    return <div ref={elRef} style={{ height, width: '100%', borderRadius: 16, zIndex: 0 }} />;
  }

  window.CG.MapView = FieldMap;
  window.CG.RISK_COLOR = RISK_COLOR;
})();
