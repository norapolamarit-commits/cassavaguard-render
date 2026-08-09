/* Weather dashboard: current, forecast, historical trends. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, Badge, Icon, Skeleton } = window.CG.UI;
  const { LineChart, BarChart } = window.CG.Charts;

  const COND_ICON = { sunny: 'sun', partly_cloudy: 'cloud', cloudy: 'cloud', rain: 'drop', storm: 'drop' };

  function WeatherPage({ initialField }) {
    const { t, lang, toast } = window.CG.Store.useStore();
    const [fields, setFields] = useState([]);
    const [fid, setFid] = useState(initialField || null);
    const [cur, setCur] = useState(null);
    const [hist, setHist] = useState(null);
    const [fc, setFc] = useState(null);

    useEffect(() => { window.CG.API_CLIENT.fields().then((f) => { setFields(f); if (!fid && f.length) setFid(f[0].id); }); }, []);
    useEffect(() => {
      const API = window.CG.API_CLIENT;
      setCur(null); setHist(null); setFc(null);
      API.weatherCurrent(fid).then(setCur).catch((e) => toast(e.message, 'error'));
      API.weatherHistory(fid, 30).then((r) => setHist(r.series)).catch(() => {});
      API.weatherForecast(fid, 7).then((r) => setFc(r.series)).catch(() => {});
    }, [fid]);

    const metrics = cur ? [
      { icon: 'temp', label: lang === 'th' ? 'อุณหภูมิ' : 'Temperature', v: cur.temp_c, u: '°C', tone: 'amber' },
      { icon: 'drop', label: lang === 'th' ? 'ความชื้น' : 'Humidity', v: cur.humidity_pct, u: '%', tone: 'cyan' },
      { icon: 'cloud', label: lang === 'th' ? 'ฝน' : 'Rainfall', v: cur.rainfall_mm, u: 'mm', tone: 'cyan' },
      { icon: 'wind', label: lang === 'th' ? 'ลม' : 'Wind', v: cur.wind_kmh, u: 'km/h', tone: 'brand' },
      { icon: 'sun', label: lang === 'th' ? 'รังสีดวงอาทิตย์' : 'Solar', v: cur.solar_mj, u: 'MJ', tone: 'amber' },
    ] : [];

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          {window.CG.FieldPicker && <window.CG.FieldPicker fields={fields} fid={fid} setFid={setFid} />}
          <div className="flex items-center gap-2">
            {cur?.data_source && <Badge tone={cur.data_source.mode === 'live' ? 'online' : 'medium'} dot>
              {cur.data_source.mode === 'live'
                ? (lang === 'th' ? 'Open-Meteo · ข้อมูลสด' : 'Open-Meteo · live')
                : (lang === 'th' ? 'ข้อมูลจำลอง' : 'Synthetic')}
            </Badge>}
            {cur && <Badge tone="info">{lang === 'th' ? cur.condition_th : cur.condition.replace('_', ' ')}</Badge>}
          </div>
        </div>

        {/* current hero */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="animate-fadeup relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full grad-brand opacity-10 blur-2xl" />
            {cur ? (
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl grad-brand grid place-items-center text-white animate-floaty"><Icon name={COND_ICON[cur.condition] || 'cloud'} className="w-10 h-10" /></div>
                <div>
                  <div className="txt text-5xl font-bold tabular-nums">{cur.temp_c}°</div>
                  <div className="txt-soft text-sm mt-1">{cur.temp_min}° / {cur.temp_max}°</div>
                </div>
              </div>
            ) : <Skeleton className="h-20" />}
          </Card>
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3">
            {metrics.map((m, i) => (
              <Card key={i} hover className="animate-fadeup" style={{ animationDelay: i * 40 + 'ms' }}>
                <Icon name={m.icon} className="w-5 h-5 text-cyan2-light" />
                <div className="txt text-xl font-bold mt-2 tabular-nums">{m.v}<span className="text-xs txt-soft ml-0.5">{m.u}</span></div>
                <div className="txt-dim text-[11px] mt-0.5">{m.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* forecast */}
        <Card className="animate-fadeup">
          <SectionTitle icon="cloud" title={t('forecast')} />
          {fc ? (
            <div className="grid grid-cols-7 gap-2">
              {fc.map((d, i) => (
                <div key={i} className="glass rounded-xl p-3 text-center card-hover">
                  <div className="txt-dim text-[11px]">{new Date(d.date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en', { weekday: 'short' })}</div>
                  <Icon name={COND_ICON[d.condition] || 'cloud'} className="w-6 h-6 mx-auto my-2 text-cyan2-light" />
                  <div className="txt font-bold text-sm">{d.temp_max}°</div>
                  <div className="txt-dim text-[11px]">{d.temp_min}°</div>
                  <div className="text-[11px] text-cyan2-light mt-1">{d.rainfall_mm}mm</div>
                </div>
              ))}
            </div>
          ) : <Skeleton className="h-28" />}
        </Card>

        {/* trends */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="animate-fadeup">
            <SectionTitle icon="temp" title={`${t('trend')} · ${lang === 'th' ? 'อุณหภูมิ & ความชื้น' : 'Temp & Humidity'}`} sub="30 days" />
            {hist ? (
              <LineChart height={220} labels={hist.map((d) => d.date.slice(5))}
                series={[{ label: 'Temp °C', data: hist.map((d) => d.temp_c), color: '#f59e0b' },
                         { label: 'Humidity %', data: hist.map((d) => d.humidity_pct), color: '#06b6d4' }]} />
            ) : <Skeleton className="h-52" />}
          </Card>
          <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}>
            <SectionTitle icon="cloud" title={`${t('trend')} · ${lang === 'th' ? 'ปริมาณฝน' : 'Rainfall'}`} sub="30 days" />
            {hist ? (
              <BarChart height={220} labels={hist.map((d) => d.date.slice(5))}
                series={[{ label: 'Rain mm', data: hist.map((d) => d.rainfall_mm), color: '#06b6d4' }]} />
            ) : <Skeleton className="h-52" />}
          </Card>
        </div>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Weather = WeatherPage;
})();
