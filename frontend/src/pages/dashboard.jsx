/* Dashboard: animated KPIs, risk distribution, field health, weather & satellite. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, KPICard, Badge, ProgressRing, SkelCard, Skeleton, Icon, Empty, useCountUp } = window.CG.UI;
  const { DoughnutChart, BarChart, LineChart } = window.CG.Charts;

  const COND_ICON = { sunny: 'sun', partly_cloudy: 'cloud', cloudy: 'cloud', rain: 'drop', storm: 'drop' };

  function Dashboard({ go }) {
    const { t, lang, toast } = window.CG.Store.useStore();
    const [kpi, setKpi] = useState(null);
    const [risk, setRisk] = useState(null);
    const [health, setHealth] = useState(null);
    const [wx, setWx] = useState(null);

    useEffect(() => {
      const API = window.CG.API_CLIENT;
      Promise.all([API.kpis(), API.riskDist(), API.healthByField(), API.weatherHistory(null, 14)])
        .then(([k, r, h, w]) => { setKpi(k); setRisk(r); setHealth(h); setWx(w); })
        .catch((e) => toast(e.message, 'error'));
    }, []);

    if (!kpi) return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0,1,2,3].map(i => <SkelCard key={i} />)}</div>
        <div className="grid lg:grid-cols-3 gap-4">{[0,1,2].map(i => <SkelCard key={i} h="h-48" />)}</div>
      </div>
    );

    const riskData = risk || { low: 0, medium: 0, high: 0 };
    const wLabels = (wx?.series || []).map((d) => d.date.slice(5));
    const alerts = [
      ['brain', t('kpi_disease'), kpi.disease_alerts],
      ['soil', t('kpi_nutrient'), kpi.nutrient_alerts],
      ['drop', t('kpi_water'), kpi.water_alerts],
    ];
    // Calm, mostly-uniform layout: one full-width hero, then two equal-width
    // rows. Far fewer, larger cards than the old 8-tile KPI grid.
    return (
      <div className="space-y-5 animate-fadeup">
        <Card className="flex flex-col sm:flex-row items-center gap-8 cassava-model-card">
          <ProgressRing value={kpi.avg_health} size={132} stroke={12} label={t('kpi_health')} />
          <div className="flex-1 w-full">
            <SectionTitle icon="grid" title={lang === 'th' ? 'ภาพรวมสุขภาพแปลง' : 'Field health, at a glance'} sub={`${kpi.total_fields} ${t('kpi_fields')} · ${kpi.total_area_rai.toLocaleString()} ${t('rai')} · ${kpi.total_plants.toLocaleString()} ${t('kpi_plants')}`} />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-1">
              <BigStat value={kpi.healthy_pct} decimals={1} suffix="%" label={t('kpi_healthy')} tone="brand" />
              <BigStat value={kpi.high_risk_pct} decimals={1} suffix="%" label={t('kpi_risk')} tone="danger" />
              {alerts.map(([icon, l, v]) => <BigStat key={l} value={v} label={l} tone="warm" />)}
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card>
            <SectionTitle icon="alert" title={t('risk_dist')} />
            <DoughnutChart height={180}
              labels={[t('low'), t('medium'), t('high')]}
              values={[riskData.low, riskData.medium, riskData.high]}
              colors={['#3a8f4a', '#d9711f', '#c4432f']} />
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-cyan2/10 blur-2xl" />
            <SectionTitle icon="cloud" title={t('weather_now')} />
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl grad-brand grid place-items-center text-white shrink-0">
                <Icon name={COND_ICON[kpi.weather.condition] || 'cloud'} className="w-8 h-8" />
              </div>
              <div>
                <div className="txt text-4xl font-bold tabular-nums">{kpi.weather.temp_c}°</div>
                <div className="txt-soft text-sm">{lang === 'th' ? kpi.weather.condition_th : kpi.weather.condition.replace('_',' ')}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div className="glass rounded-xl p-3"><div className="txt-dim text-xs">Humidity</div><div className="txt font-semibold">{kpi.weather.humidity_pct}%</div></div>
              <div className="glass rounded-xl p-3"><div className="txt-dim text-xs">Rain 7d</div><div className="txt font-semibold">{kpi.weather.rain_7d_mm} mm</div></div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon="satellite" title={t('sat_status')} sub={`${kpi.satellite.online}/${kpi.satellite.constellation.length} ${t('online')}`}
              right={<button onClick={() => go('satellite')} className="txt-soft hover:txt text-xs flex items-center gap-1">{t('view')}<Icon name="chevron" className="w-3.5 h-3.5" /></button>} />
            <div className="space-y-2">
              {kpi.satellite.constellation.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 glass rounded-xl px-3 py-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.status === 'online' ? 'bg-brand-400' : 'bg-amber-400'}`} />
                  <span className="txt text-sm font-semibold flex-1 truncate">{s.name}</span>
                  <span className="txt-dim text-[11px]">{s.resolution_m}m</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <SectionTitle icon="map" title={t('field_health')} sub={t('dash_sub')} right={<Badge tone="online" dot>{t('online')}</Badge>} />
            <BarChart height={200} horizontal
              labels={(health || []).map((h) => lang === 'th' ? h.name_th : h.name)}
              series={[{ label: 'Health', data: (health || []).map((h) => h.health),
                colors: (health || []).map((h) => window.CG.RISK_COLOR[h.risk] + 'cc') }]}
              opts={{ scales: { x: { max: 100, grid: { color: 'rgba(90,60,20,.10)' }, ticks: { color: '#6b5c47', callback: (v)=>v+'%' } }, y: { grid: { display: false }, ticks: { color: '#6b5c47', font: { size: 10 } } } } }} />
          </Card>

          <Card>
            <SectionTitle icon="cloud" title={t('trend')} sub="14 days · temp & rainfall"
              right={<button onClick={() => go('weather')} className="txt-soft hover:txt text-xs flex items-center gap-1">{t('view')}<Icon name="chevron" className="w-3.5 h-3.5" /></button>} />
            <LineChart height={200} fill labels={wLabels}
              series={[
                { label: 'Temp °C', data: (wx?.series || []).map((d) => d.temp_c), color: '#d9711f' },
                { label: 'Rain mm', data: (wx?.series || []).map((d) => d.rainfall_mm), color: '#0ea5a0' },
              ]} />
          </Card>
        </div>
      </div>
    );
  }

  function BigStat({ value, decimals = 0, suffix = '', label, tone }) {
    const v = useCountUp(Number(value) || 0);
    const fmt = decimals ? v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : Math.round(v).toLocaleString();
    const colorVar = tone === 'danger' ? 'var(--cg-danger)' : tone === 'warm' ? 'var(--cg-warm-ink)' : 'var(--cg-brand-strong)';
    return (
      <div>
        <div className="text-2xl font-bold tabular-nums" style={{ color: colorVar }}>{fmt}{suffix}</div>
        <div className="txt-dim text-[11px] mt-0.5">{label}</div>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Dashboard = Dashboard;
})();
