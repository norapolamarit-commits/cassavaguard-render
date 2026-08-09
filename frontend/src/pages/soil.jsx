/* Soil dashboard: real lab/sensor samples only in live mode. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, Badge, Icon, Skeleton } = window.CG.UI;
  const { LineChart, RadarChart, BarChart } = window.CG.Charts;

  const METRIC_META = {
    ph: { en: 'Soil pH', th: 'ค่า pH', unit: '', max: 9 },
    om_pct: { en: 'Organic Matter', th: 'อินทรียวัตถุ', unit: '%', max: 5 },
    n_ppm: { en: 'Nitrogen (N)', th: 'ไนโตรเจน', unit: 'ppm', max: 50 },
    p_ppm: { en: 'Phosphorus (P)', th: 'ฟอสฟอรัส', unit: 'ppm', max: 40 },
    k_ppm: { en: 'Potassium (K)', th: 'โพแทสเซียม', unit: 'ppm', max: 200 },
    cec: { en: 'CEC', th: 'ความจุแลกเปลี่ยนไอออน', unit: 'meq', max: 25 },
    moisture_pct: { en: 'Soil Moisture', th: 'ความชื้นดิน', unit: '%', max: 50 },
  };
  const EMPTY_FORM = {
    sampled_at: '',
    source: 'lab',
    lab_name: '',
    texture: '',
    ph: '',
    om_pct: '',
    n_ppm: '',
    p_ppm: '',
    k_ppm: '',
    cec: '',
    moisture_pct: '',
    notes: '',
  };

  function SoilPage({ initialField }) {
    const { t, lang, toast } = window.CG.Store.useStore();
    const [fields, setFields] = useState([]);
    const [fid, setFid] = useState(initialField || null);
    const [profile, setProfile] = useState(null);
    const [moisture, setMoisture] = useState(null);
    const [all, setAll] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const refreshAll = () => window.CG.API_CLIENT.soilAll().then(setAll).catch(() => {});
    const refreshField = (fieldId) => {
      if (!fieldId) return;
      setProfile(null); setMoisture(null);
      window.CG.API_CLIENT.soil(fieldId).then(setProfile).catch((e) => toast(e.message, 'error'));
      window.CG.API_CLIENT.soilMoisture(fieldId, 30).then((r) => setMoisture(r.series)).catch(() => setMoisture([]));
    };

    useEffect(() => {
      window.CG.API_CLIENT.fields().then((rows) => {
        setFields(rows);
        if (!fid && rows.length) setFid(rows[0].id);
      });
    }, []);
    useEffect(() => {
      refreshAll();
    }, []);
    useEffect(() => refreshField(fid), [fid]);

    const radarScore = (key, value) => {
      if (value === null || value === undefined) return 0;
      const opt = profile.optima ? profile.optima[key] : null;
      if (!opt) return 0;
      const [low, high] = opt;
      const mid = (low + high) / 2;
      const distance = Math.abs(value - mid) / (high - low + 0.001);
      return Math.max(10, 100 - distance * 70);
    };

    const submit = async (event) => {
      event.preventDefault();
      if (!fid || !form.sampled_at) {
        toast(lang === 'th' ? 'กรุณาระบุวันเวลาเก็บตัวอย่าง' : 'Sample date/time is required', 'error');
        return;
      }
      const payload = { ...form, sampled_at: new Date(form.sampled_at).toISOString() };
      Object.keys(METRIC_META).forEach((key) => {
        payload[key] = form[key] === '' ? null : Number(form[key]);
      });
      setSaving(true);
      try {
        await window.CG.API_CLIENT.createSoilSample(fid, payload);
        toast(lang === 'th' ? 'บันทึกผลตรวจดินจริงแล้ว' : 'Measured soil sample saved', 'success');
        setForm(EMPTY_FORM);
        setShowForm(false);
        refreshField(fid);
        refreshAll();
      } catch (error) {
        toast(error.message, 'error');
      } finally {
        setSaving(false);
      }
    };

    const isMeasured = profile?.data_source?.kind === 'measured_soil_sample';
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {window.CG.FieldPicker && <window.CG.FieldPicker fields={fields} fid={fid} setFid={setFid} />}
          <div className="flex items-center gap-2">
            {profile && <Badge tone={isMeasured ? 'online' : 'medium'} dot>
              {isMeasured
                ? (lang === 'th' ? 'ผลตรวจจริง' : 'Measured sample')
                : (lang === 'th' ? 'ยังไม่มีผลตรวจ' : 'No measurement')}
            </Badge>}
            <button onClick={() => setShowForm(!showForm)}
              className="grad-brand text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2">
              <Icon name="plus" className="w-4 h-4" />
              {lang === 'th' ? 'เพิ่มผลตรวจดิน' : 'Add soil sample'}
            </button>
          </div>
        </div>

        {showForm && (
          <Card className="animate-fadeup">
            <SectionTitle icon="soil"
              title={lang === 'th' ? 'บันทึกค่าที่วัดจริง' : 'Record measured values'}
              sub={lang === 'th' ? 'เว้นช่องที่ไม่ได้ตรวจ ห้ามใส่ค่าประมาณ' : 'Leave untested values blank; do not estimate'} />
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-3">
                <label className="text-xs txt-soft">
                  {lang === 'th' ? 'วันเวลาเก็บตัวอย่าง' : 'Sampled at'}
                  <input type="datetime-local" required value={form.sampled_at}
                    onChange={(e) => setForm({ ...form, sampled_at: e.target.value })}
                    className="mt-1 w-full glass rounded-lg px-3 py-2 txt bg-transparent" />
                </label>
                <label className="text-xs txt-soft">
                  {lang === 'th' ? 'วิธีตรวจ' : 'Source'}
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="mt-1 w-full glass rounded-lg px-3 py-2 txt bg-ink-800">
                    <option value="lab">Lab</option>
                    <option value="sensor">Sensor</option>
                    <option value="field_kit">Field kit</option>
                  </select>
                </label>
                <label className="text-xs txt-soft">
                  {lang === 'th' ? 'ห้องแล็บ/อุปกรณ์' : 'Lab / device'}
                  <input value={form.lab_name} onChange={(e) => setForm({ ...form, lab_name: e.target.value })}
                    className="mt-1 w-full glass rounded-lg px-3 py-2 txt bg-transparent" />
                </label>
                <label className="text-xs txt-soft">
                  {lang === 'th' ? 'เนื้อดิน' : 'Texture'}
                  <input value={form.texture} onChange={(e) => setForm({ ...form, texture: e.target.value })}
                    className="mt-1 w-full glass rounded-lg px-3 py-2 txt bg-transparent" />
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(METRIC_META).map(([key, meta]) => (
                  <label key={key} className="text-xs txt-soft">
                    {lang === 'th' ? meta.th : meta.en} {meta.unit && `(${meta.unit})`}
                    <input type="number" min="0" step="any" value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="mt-1 w-full glass rounded-lg px-3 py-2 txt bg-transparent" />
                  </label>
                ))}
              </div>
              <label className="text-xs txt-soft block">
                {lang === 'th' ? 'หมายเหตุ' : 'Notes'}
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full glass rounded-lg px-3 py-2 txt bg-transparent" />
              </label>
              <div className="flex justify-end">
                <button disabled={saving} className="grad-brand text-white rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
                  {saving ? (lang === 'th' ? 'กำลังบันทึก…' : 'Saving…') : (lang === 'th' ? 'บันทึกผลตรวจจริง' : 'Save measurement')}
                </button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {profile ? Object.entries(METRIC_META).map(([key, meta], index) => {
            const value = profile.metrics[key];
            const status = profile.statuses[key];
            const available = value !== null && value !== undefined;
            const color = status === 'optimal' ? '#10b981' : status === 'warning' ? '#f59e0b' : status === 'critical' ? '#f43f5e' : '#64748b';
            return (
              <Card key={key} hover className="animate-fadeup" style={{ animationDelay: index * 40 + 'ms' }}>
                <div className="flex items-center justify-between">
                  <span className="txt-dim text-[10px] font-semibold leading-tight">{lang === 'th' ? meta.th : meta.en}</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                </div>
                <div className="txt text-xl font-bold mt-2 tabular-nums">{available ? value : '—'}<span className="text-[10px] txt-soft ml-0.5">{available ? meta.unit : ''}</span></div>
                <div className="h-1.5 rounded-full mt-2 bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: available ? Math.min(100, value / meta.max * 100) + '%' : 0, background: color }} />
                </div>
              </Card>
            );
          }) : [...Array(7)].map((_, index) => <Card key={index}><Skeleton className="h-16" /></Card>)}
        </div>

        {profile && !isMeasured && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm">
            {lang === 'th'
              ? 'ระบบจะไม่สร้างค่า pH, N, P, K หรือความชื้นดินแทนค่าที่ขาด กรุณาเพิ่มผลตรวจจากแล็บ เซนเซอร์ หรือชุดตรวจภาคสนาม'
              : 'Missing pH, N, P, K, and moisture values are not generated. Add a lab, sensor, or field-kit result.'}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="animate-fadeup">
            <SectionTitle icon="soil" title={t('soil_profile')}
              sub={profile?.sampled_at ? `${lang === 'th' ? 'เก็บตัวอย่าง' : 'sampled'} ${profile.sampled_at.slice(0, 16).replace('T', ' ')}` : ''} />
            {profile ? (
              <RadarChart height={260}
                labels={Object.keys(METRIC_META).map((key) => (lang === 'th' ? METRIC_META[key].th : METRIC_META[key].en).split(' ')[0])}
                series={[{ label: lang === 'th' ? 'คะแนนความเหมาะสม' : 'Suitability', data: Object.keys(METRIC_META).map((key) => Math.round(radarScore(key, profile.metrics[key]))), color: '#10b981' }]} />
            ) : <Skeleton className="h-60" />}
          </Card>

          <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}>
            <SectionTitle icon="drop" title={t('moisture')} sub={lang === 'th' ? 'เฉพาะจุดที่เซนเซอร์/ตัวอย่างวัดจริง' : 'Measured samples only'} />
            {moisture && moisture.length ? (
              <LineChart height={260} labels={moisture.map((row) => row.date.slice(5))}
                series={[
                  { label: 'Moisture %', data: moisture.map((row) => row.moisture_pct), color: '#06b6d4' },
                  { label: 'Rain mm', data: moisture.map((row) => row.rainfall_mm), color: '#8b5cf6' },
                ]} />
            ) : moisture ? (
              <div className="h-60 grid place-items-center txt-dim text-sm">
                {lang === 'th' ? 'ยังไม่มีค่าความชื้นที่วัดจริงใน 30 วัน' : 'No measured moisture values in 30 days'}
              </div>
            ) : <Skeleton className="h-60" />}
          </Card>
        </div>

        <Card className="animate-fadeup">
          <SectionTitle icon="grid" title={lang === 'th' ? 'เปรียบเทียบธาตุอาหารรายแปลง' : 'Nutrient Comparison Across Fields'} sub="N · P · K (ppm)" />
          {all ? (
            <BarChart height={240} labels={all.map((field) => lang === 'th' ? field.name_th || field.name : field.name)}
              series={[
                { label: 'N', data: all.map((field) => field.metrics.n_ppm), color: '#10b981' },
                { label: 'P', data: all.map((field) => field.metrics.p_ppm), color: '#06b6d4' },
                { label: 'K/2', data: all.map((field) => field.metrics.k_ppm === null ? null : Math.round(field.metrics.k_ppm / 2)), color: '#f59e0b' },
              ]} />
          ) : <Skeleton className="h-52" />}
        </Card>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Soil = SoilPage;
})();
