/* Satellite analysis: indices, time slider, risk zones, pass timeline, comparison. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, Badge, Icon, Segmented, Spinner, Skeleton } = window.CG.UI;
  const { LineChart } = window.CG.Charts;

  const INDICES = [
    { value: 'ndvi', label: 'NDVI' }, { value: 'ndwi', label: 'NDMI' },
    { value: 'savi', label: 'SAVI' }, { value: 'evi', label: 'EVI' },
  ];
  const INDEX_LABELS = { ndvi: 'NDVI', ndwi: 'NDMI', savi: 'SAVI', evi: 'EVI' };
  const cellColor = (index, v) => {
    if (v === null || v === undefined) return '#334155';
    if (index === 'ndwi') return v > 0.2 ? '#0369a1' : v > 0 ? '#38bdf8' : v > -0.2 ? '#fcd34d' : '#b45309';
    return v > 0.6 ? '#065f46' : v > 0.45 ? '#10b981' : v > 0.3 ? '#fbbf24' : '#dc2626';
  };

  function SatellitePage({ initialField }) {
    const { t, lang, toast } = window.CG.Store.useStore();
    const [fields, setFields] = useState([]);
    const [fid, setFid] = useState(initialField || null);
    const [index, setIndex] = useState('ndvi');
    const [timeline, setTimeline] = useState(null);
    const [passes, setPasses] = useState(null);
    const [grid, setGrid] = useState(null);
    const [tIdx, setTIdx] = useState(0);
    const [compare, setCompare] = useState(null);

    useEffect(() => {
      window.CG.API_CLIENT.fields().then((f) => { setFields(f); if (!fid && f.length) setFid(f[0].id); });
    }, []);

    useEffect(() => {
      if (!fid) return;
      setTimeline(null); setPasses(null); setCompare(null);
      const API = window.CG.API_CLIENT;
      API.satTimeline(fid, 12).then((r) => { setTimeline(r.series); setTIdx(r.series.length - 1); }).catch((e) => toast(e.message, 'error'));
      API.satPasses(fid).then((r) => setPasses(r.passes)).catch(() => {});
    }, [fid]);

    useEffect(() => {
      if (!fid || !timeline) return;
      const date = timeline[tIdx]?.date;
      window.CG.API_CLIENT.satGrid(fid, index, date).then(setGrid).catch(() => {});
    }, [fid, index, tIdx, timeline]);

    useEffect(() => {
      if (!fid) return;
      window.CG.API_CLIENT.satCompare(fid, index, '', '').then(setCompare).catch(() => {});
    }, [index, fid]);

    const cur = timeline ? timeline[tIdx] : null;
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FieldPicker fields={fields} fid={fid} setFid={setFid} />
          <div className="flex items-center gap-2">
            {cur?.data_source && <Badge tone={cur.data_source.mode === 'live' ? 'online' : 'medium'} dot>
              {cur.data_source.mode === 'live'
                ? (lang === 'th' ? 'Sentinel-2 L2A · ภาพจริง' : 'Sentinel-2 L2A · observed')
                : (lang === 'th' ? 'ข้อมูลจำลอง' : 'Synthetic')}
            </Badge>}
            <Segmented options={INDICES} value={index} onChange={setIndex} />
          </div>
        </div>

        {/* current index values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['ndvi', 'ndwi', 'savi', 'evi'].map((k, i) => (
            <Card key={k} hover className="animate-fadeup" style={{ animationDelay: i * 50 + 'ms' }}>
              <div className="flex items-center justify-between">
                <span className="txt-soft text-xs font-semibold">{INDEX_LABELS[k]}</span>
                <Icon name="satellite" className="w-4 h-4 text-cyan2-light" />
              </div>
              <div className="txt text-2xl font-bold mt-2 tabular-nums">{cur ? cur[k] : <Skeleton className="h-7 w-16" />}</div>
              <div className="h-1.5 rounded-full mt-2 overflow-hidden bg-white/5">
                <div className="h-full rounded-full" style={{ width: cur ? Math.min(100, Math.max(0, (cur[k] + (k === 'ndwi' ? 1 : 0)) / (k === 'ndwi' ? 2 : 1) * 100)) + '%' : 0, background: cellColor(k, cur ? cur[k] : 0) }} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* spatial grid + time slider */}
          <Card className="animate-fadeup">
            <SectionTitle icon="grid" title={`${index.toUpperCase()} ${t('risk_zones')}`}
              sub={cur ? `${cur.date} · valid ${cur.valid_pct ?? 100}%` : ''} right={grid && <Badge tone="info">μ {grid.mean}</Badge>} />
            {grid ? (
              <>
                <div className="grid gap-0.5 rounded-xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${grid.grid_size},1fr)` }}>
                  {grid.cells.flat().map((v, i) => (
                    <div key={i} className="aspect-square relative group" style={{ background: cellColor(index, v) }}
                         title={v === null ? 'nodata/cloud' : v}>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] txt-dim">
                  <span>low</span>
                  <div className="h-2 flex-1 mx-2 rounded-full" style={{ background: 'linear-gradient(90deg,#dc2626,#fbbf24,#10b981,#065f46)' }} />
                  <span>high</span>
                </div>
                {grid.risk_zones.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <Icon name="alert" className="w-4 h-4 text-rose-400" />
                    <span className="txt-soft">{grid.risk_zones.length} {t('risk_zones')} · {lang === 'th' ? 'ตรวจพบความผิดปกติเชิงพื้นที่' : 'spatial anomalies detected'}</span>
                  </div>
                )}
              </>
            ) : <Skeleton className="h-48" />}

            {timeline && (
              <div className="mt-4">
                <div className="flex justify-between text-[11px] txt-dim mb-1">
                  <span>{t('time_slider')}</span><span className="txt-soft font-mono">{cur?.date}</span>
                </div>
                <input type="range" min="0" max={timeline.length - 1} value={tIdx}
                       onChange={(e) => setTIdx(Number(e.target.value))} className="w-full" />
              </div>
            )}
          </Card>

          {/* trend */}
          <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}>
            <SectionTitle icon="satellite" title={t('trend')} sub="12 months · all indices" />
            {timeline ? (
              <LineChart height={220} labels={timeline.map((s) => s.date.slice(2, 7))}
                series={[
                  { label: 'NDVI', data: timeline.map((s) => s.ndvi), color: '#10b981' },
                  { label: 'NDMI', data: timeline.map((s) => s.ndwi), color: '#06b6d4' },
                  { label: 'SAVI', data: timeline.map((s) => s.savi), color: '#f59e0b' },
                  { label: 'EVI', data: timeline.map((s) => s.evi), color: '#8b5cf6' },
                ]} opts={{ scales: { y: { min: -0.5, max: 1, grid: { color: 'rgba(148,163,184,.12)' }, ticks: { color: '#93a4bd', font: { size: 9 } } }, x: { grid: { display: false }, ticks: { color: '#93a4bd', font: { size: 9 } } } } }} />
            ) : <Skeleton className="h-52" />}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* comparison */}
          <Card className="animate-fadeup">
            <SectionTitle icon="grid" title={t('compare')} sub={compare ? `Δμ ${compare.delta_mean > 0 ? '+' : ''}${compare.delta_mean}` : ''} />
            {compare ? (
              <div className="grid grid-cols-2 gap-3">
                {[['a', lang === 'th' ? 'ก่อนหน้า' : 'Earlier'], ['b', lang === 'th' ? 'ปัจจุบัน' : 'Latest']].map(([k, lbl]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1.5"><span className="txt-soft">{lbl}</span><span className="txt-dim font-mono">{compare[k].date}</span></div>
                    <div className="grid gap-px rounded-lg overflow-hidden" style={{ gridTemplateColumns: `repeat(${compare[k].grid_size},1fr)` }}>
                      {compare[k].cells.flat().map((v, i) => <div key={i} className="aspect-square" style={{ background: cellColor(index, v) }} />)}
                    </div>
                    <div className="text-center txt-dim text-[11px] mt-1">μ {compare[k].mean}</div>
                  </div>
                ))}
              </div>
            ) : <Skeleton className="h-40" />}
          </Card>

          {/* pass timeline */}
          <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}>
            <SectionTitle icon="satellite" title={t('sat_timeline')} sub={lang === 'th' ? 'รายการภาพที่รับจริงล่าสุด' : 'Actual recent acquisitions'} />
            {passes ? (
              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {passes.slice().reverse().map((p, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${p.future ? 'border border-dashed hair' : 'glass'}`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${p.usable ? 'bg-brand-400' : 'bg-amber-400'}`} />
                    <span className="txt text-sm font-mono">{p.date}</span>
                    <span className="txt-soft text-xs">{p.satellite}</span>
                    <div className="flex-1" />
                    {p.future ? <Badge tone="info">{lang === 'th' ? 'กำหนดการ' : 'scheduled'}</Badge>
                              : <Badge tone={p.usable ? 'low' : 'medium'}>{p.cloud_pct}% cloud</Badge>}
                  </div>
                ))}
              </div>
            ) : <Skeleton className="h-40" />}
          </Card>
        </div>
      </div>
    );
  }

  function FieldPicker({ fields, fid, setFid }) {
    const { lang } = window.CG.Store.useStore();
    return (
      <select value={fid || ''} onChange={(e) => setFid(Number(e.target.value))}
              className="glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40">
        {fields.map((f) => <option key={f.id} value={f.id} className="bg-ink-800">{lang === 'th' ? f.name_th || f.name : f.name}</option>)}
      </select>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Satellite = SatellitePage;
  window.CG.FieldPicker = FieldPicker;
})();
