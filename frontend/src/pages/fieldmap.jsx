/* Interactive GIS map page + field detail panel with fused analysis. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, Badge, ProgressRing, Icon, Segmented, Spinner, Skeleton, Modal } = window.CG.UI;
  const { LineChart } = window.CG.Charts;

  const BASES = [
    { value: 'satellite', label: 'Satellite' }, { value: 'street', label: 'Street' },
    { value: 'topo', label: 'Topo' }, { value: 'dark', label: 'Dark' },
  ];
  const OVERLAYS = [
    { value: 'risk', label: 'Risk' }, { value: 'ndvi', label: 'NDVI' },
    { value: 'ndwi', label: 'NDMI' }, { value: 'savi', label: 'SAVI' },
  ];

  function FieldMapPage({ go }) {
    const { t, lang, toast, user } = window.CG.Store.useStore();
    const [geo, setGeo] = useState(null);
    const [fields, setFields] = useState([]);
    const [sel, setSel] = useState(null);
    const [detail, setDetail] = useState(null);
    const [base, setBase] = useState('satellite');
    const [overlay, setOverlay] = useState('risk');
    const [grid, setGrid] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);

    const loadFields = (preferredId = null) => {
      const API = window.CG.API_CLIENT;
      return Promise.all([API.fieldsGeo(), API.fields()])
        .then(([g, f]) => {
          setGeo(g); setFields(f);
          if (preferredId) setSel(preferredId);
          else if (f.length) setSel((current) => current || f[0].id);
        })
        .catch((e) => toast(e.message, 'error'));
    };

    useEffect(() => {
      loadFields();
    }, []);

    useEffect(() => {
      if (!sel) return;
      setDetail(null);
      window.CG.API_CLIENT.field(sel).then(setDetail).catch((e) => toast(e.message, 'error'));
    }, [sel]);

    // fetch grid overlay when overlay != risk
    useEffect(() => {
      if (!sel || overlay === 'risk') { setGrid(null); return; }
      window.CG.API_CLIENT.satGrid(sel, overlay).then((g) => setGrid({ field: detail, grid: g, index: overlay }))
        .catch(() => {});
    }, [sel, overlay, detail]);

    const MapView = window.CG.MapView;
    return (
      <>
      <div className="grid lg:grid-cols-3 gap-4 h-full">
        {/* map */}
        <Card pad="p-0" className="lg:col-span-2 overflow-hidden relative min-h-[520px] animate-fadeup">
          <div className="absolute top-3 left-3 right-3 z-[500] flex flex-wrap gap-2 justify-between pointer-events-none">
            <div className="pointer-events-auto"><Segmented options={BASES} value={base} onChange={setBase} /></div>
            <div className="pointer-events-auto flex gap-2">
              {user.role !== 'researcher' && <button onClick={() => setCreateOpen(true)}
                className="glass-strong rounded-xl px-3 py-2 txt-soft hover:txt flex items-center gap-1.5 text-xs font-semibold">
                <Icon name="plus" className="w-4 h-4" />{lang === 'th' ? 'เพิ่มแปลง' : 'Add field'}
              </button>}
              <Segmented options={OVERLAYS} value={overlay} onChange={setOverlay} />
            </div>
          </div>
          {/* legend */}
          <div className="absolute bottom-3 left-3 z-[500] glass-strong rounded-xl px-3 py-2 text-[11px] txt-soft">
            {overlay === 'risk' ? (
              <div className="flex items-center gap-3">
                {[['low', t('low')], ['medium', t('medium')], ['high', t('high')]].map(([k, l]) => (
                  <span key={k} className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: window.CG.RISK_COLOR[k] }} />{l}</span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2"><span className="font-semibold txt">{overlay.toUpperCase()}</span>
                <span className="w-24 h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg,#dc2626,#fbbf24,#10b981,#065f46)' }} />
                <span>low → high</span></div>
            )}
          </div>
          {geo ? <MapView fields={fields} geojson={geo} onSelect={setSel} selectedId={sel} base={base} overlay={overlay} gridData={grid} />
               : <div className="h-full grid place-items-center"><Spinner className="w-8 h-8 text-brand-400" /></div>}
        </Card>

        {/* detail panel */}
        <div className="space-y-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)] pr-1">
          {!detail ? (
            <Card><div className="space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-24 w-full" /><Skeleton className="h-16 w-full" /></div></Card>
          ) : <FieldDetail d={detail} go={go} />}
        </div>
      </div>
      <CreateFieldModal open={createOpen} onClose={() => setCreateOpen(false)}
        onCreated={async (field) => { await loadFields(field.id); setCreateOpen(false); }} />
      </>
    );
  }

  function CreateFieldModal({ open, onClose, onCreated }) {
    const { lang, toast } = window.CG.Store.useStore();
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({
      name: '', name_th: '', province: '', variety: 'KU50',
      area_rai: '10', lat: '15', lon: '102',
    });
    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const submit = async (event) => {
      event.preventDefault(); setBusy(true);
      try {
        const field = await window.CG.API_CLIENT.createField({
          ...form, area_rai: Number(form.area_rai), lat: Number(form.lat), lon: Number(form.lon),
        });
        toast(lang === 'th' ? 'เพิ่มแปลงแล้ว' : 'Field created', 'success');
        await onCreated(field);
      } catch (error) {
        toast(error.message, 'error');
      } finally {
        setBusy(false);
      }
    };
    return (
      <Modal open={open} onClose={onClose} title={lang === 'th' ? 'เพิ่มแปลงเพาะปลูก' : 'Add field'}>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
          <FieldInput label={lang === 'th' ? 'ชื่อแปลง (อังกฤษ)' : 'Field name'} value={form.name} onChange={(value) => set('name', value)} required />
          <FieldInput label={lang === 'th' ? 'ชื่อแปลง (ไทย)' : 'Thai name'} value={form.name_th} onChange={(value) => set('name_th', value)} />
          <FieldInput label={lang === 'th' ? 'จังหวัด' : 'Province'} value={form.province} onChange={(value) => set('province', value)} />
          <FieldInput label={lang === 'th' ? 'พันธุ์' : 'Variety'} value={form.variety} onChange={(value) => set('variety', value)} required />
          <FieldInput label={lang === 'th' ? 'พื้นที่ (ไร่)' : 'Area (rai)'} type="number" min="0.1" step="0.1" value={form.area_rai} onChange={(value) => set('area_rai', value)} required />
          <div />
          <FieldInput label="Latitude" type="number" min="-90" max="90" step="0.000001" value={form.lat} onChange={(value) => set('lat', value)} required />
          <FieldInput label="Longitude" type="number" min="-180" max="180" step="0.000001" value={form.lon} onChange={(value) => set('lon', value)} required />
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="glass rounded-xl px-4 py-2 txt-soft text-sm">{lang === 'th' ? 'ยกเลิก' : 'Cancel'}</button>
            <button disabled={busy} className="grad-brand rounded-xl px-4 py-2 text-white text-sm font-semibold disabled:opacity-50">
              {busy ? (lang === 'th' ? 'กำลังบันทึก…' : 'Saving…') : (lang === 'th' ? 'บันทึกแปลง' : 'Save field')}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  function FieldInput({ label, value, onChange, type = 'text', ...props }) {
    return (
      <label className="txt-dim text-xs">{label}
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)}
          className="w-full mt-1 glass rounded-xl px-3 py-2.5 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40" {...props} />
      </label>
    );
  }

  function FieldDetail({ d, go }) {
    const { t, lang } = window.CG.Store.useStore();
    const nm = lang === 'th' ? d.name_th || d.name : d.name;
    return (
      <>
        <Card className="animate-fadeup">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="txt font-bold text-lg leading-tight">{nm}</h3>
              <p className="txt-soft text-xs mt-0.5">{d.province} · {d.variety}</p>
            </div>
            <Badge tone={d.risk_level}>{t(d.risk_level)}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <ProgressRing value={d.health_score} label={t('kpi_health')} />
            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
              <Stat label={t('rai')} value={d.area_rai} />
              <Stat label={t('age')} value={`${d.age_days} ${t('days')}`} />
              <Stat label="Plants" value={d.plant_count.toLocaleString()} />
              <Stat label="NDVI" value={d.current_indices.ndvi ?? '–'} />
            </div>
          </div>
        </Card>

        {/* weather mini */}
        <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}>
          <SectionTitle icon="cloud" title={t('weather_now')} />
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <MiniW icon="temp" v={`${d.weather.today.temp_c}°`} l="Temp" />
            <MiniW icon="drop" v={`${d.weather.today.humidity_pct}%`} l="Humidity" />
            <MiniW icon="cloud" v={`${d.weather.rain_7d_mm}`} l="Rain 7d mm" />
          </div>
        </Card>

        {/* NDVI trend */}
        <Card className="animate-fadeup" style={{ animationDelay: '120ms' }}>
          <SectionTitle icon="satellite" title="NDVI" sub="8 months"
            right={<button onClick={() => go('satellite', d.id)} className="txt-soft hover:txt text-xs">{t('view')}</button>} />
          <LineChart height={140} fill labels={d.ndvi_series.map((s) => s.date.slice(2, 7))}
            series={[{ label: 'NDVI', data: d.ndvi_series.map((s) => s.ndvi), color: '#10b981' }]}
            opts={{ scales: { y: { min: 0, max: 1, grid: { color: 'rgba(148,163,184,.12)' }, ticks: { color: '#93a4bd', font: { size: 9 } } }, x: { grid: { display: false }, ticks: { color: '#93a4bd', font: { size: 9 } } } } }} />
        </Card>

        {/* predicted risks */}
        {d.predicted_risks.length > 0 && (
          <Card className="animate-fadeup" style={{ animationDelay: '160ms' }}>
            <SectionTitle icon="alert" title={t('kpi_risk')} />
            <div className="space-y-2">
              {d.predicted_risks.map((r, i) => (
                <div key={i} className="flex items-center justify-between glass rounded-xl px-3 py-2">
                  <span className="txt text-sm">{lang === 'th' ? r.th : r.en}</span>
                  <Badge tone={r.severity} className="shrink-0">{Math.round(r.confidence * 100)}%</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* top recommendation */}
        {d.recommendations.length > 0 && (
          <Card className="animate-fadeup" style={{ animationDelay: '200ms' }}>
            <SectionTitle icon="bulb" title={t('recommendation')}
              right={<button onClick={() => go('recommendations', d.id)} className="txt-soft hover:txt text-xs">{t('view')}</button>} />
            <RecoMini r={d.recommendations[0]} />
          </Card>
        )}
      </>
    );
  }

  const Stat = ({ label, value }) => (
    <div className="glass rounded-lg px-2.5 py-1.5"><div className="txt-dim text-[10px]">{label}</div><div className="txt font-semibold text-sm">{value}</div></div>
  );
  const MiniW = ({ icon, v, l }) => (
    <div className="glass rounded-xl py-3"><Icon name={icon} className="w-4 h-4 mx-auto text-cyan2-light" /><div className="txt font-bold mt-1">{v}</div><div className="txt-dim text-[10px]">{l}</div></div>
  );
  function RecoMini({ r }) {
    const { lang } = window.CG.Store.useStore();
    const { Badge, Icon } = window.CG.UI;
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="txt font-semibold text-sm">{lang === 'th' ? r.title_th : r.title_en}</span>
          <Badge tone={r.severity}>{Math.round(r.confidence * 100)}%</Badge>
        </div>
        <ul className="space-y-1">
          {(lang === 'th' ? r.actions_th : r.actions_en).slice(0, 2).map((a, i) => (
            <li key={i} className="flex items-start gap-2 txt-soft text-xs"><Icon name="check" className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />{a}</li>
          ))}
        </ul>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.FieldMap = FieldMapPage;
})();
