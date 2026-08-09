/* Dashboard: animated KPIs, risk distribution, field health, weather & satellite. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, KPICard, Badge, ProgressRing, SkelCard, Skeleton, Icon, Empty } = window.CG.UI;
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
    return (
      <div className="space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon="map"   label={t('kpi_fields')}  value={kpi.total_fields}  tone="brand"  delay={0} />
          <KPICard icon="leaf"  label={t('kpi_plants')}  value={kpi.total_plants}  tone="cyan"   delay={60}
                   spark={<div className="txt-dim text-[11px] mt-2">{kpi.total_area_rai.toLocaleString()} {t('rai')}</div>} />
          <KPICard icon="check" label={t('kpi_healthy')} value={kpi.healthy_pct} suffix="%" decimals={1} tone="brand" delay={120} />
          <KPICard icon="alert" label={t('kpi_risk')}    value={kpi.high_risk_pct} suffix="%" decimals={1} tone="rose" delay={180} />
        </div>

        {/* alert row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon="brain" label={t('kpi_disease')}  value={kpi.disease_alerts}  tone="rose"   delay={0} />
          <KPICard icon="soil"  label={t('kpi_nutrient')} value={kpi.nutrient_alerts} tone="amber"  delay={60} />
          <KPICard icon="drop"  label={t('kpi_water')}    value={kpi.water_alerts}    tone="cyan"   delay={120} />
          <KPICard icon="cpu"   label={t('kpi_health')}   value={kpi.avg_health} suffix="%" decimals={1} tone="violet" delay={180} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* risk distribution */}
          <Card className="animate-fadeup">
            <SectionTitle icon="grid" title={t('risk_dist')} sub={`${kpi.total_fields} ${t('kpi_fields')}`} />
            <DoughnutChart height={210}
              labels={[t('low'), t('medium'), t('high')]}
              values={[riskData.low, riskData.medium, riskData.high]}
              colors={['#10b981', '#f59e0b', '#f43f5e']} />
          </Card>

          {/* health by field */}
          <Card className="animate-fadeup lg:col-span-2" style={{ animationDelay: '80ms' }}>
            <SectionTitle icon="map" title={t('field_health')} sub={t('dash_sub')}
              right={<Badge tone="online" dot>{t('online')}</Badge>} />
            <BarChart height={210} horizontal
              labels={(health || []).map((h) => lang === 'th' ? h.name_th : h.name)}
              series={[{ label: 'Health', data: (health || []).map((h) => h.health),
                colors: (health || []).map((h) => window.CG.RISK_COLOR[h.risk] + 'cc') }]}
              opts={{ scales: { x: { max: 100, grid: { color: 'rgba(148,163,184,.12)' }, ticks: { color: '#93a4bd', callback: (v)=>v+'%' } }, y: { grid: { display: false }, ticks: { color: '#93a4bd', font: { size: 10 } } } } }} />
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* weather now */}
          <Card className="animate-fadeup relative overflow-hidden">
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
            {kpi.weather.warnings.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {kpi.weather.warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 rounded-lg px-2.5 py-1.5">
                    <Icon name="alert" className="w-3.5 h-3.5 shrink-0" />{lang === 'th' ? w.th : w.en}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 14-day temp/rain trend */}
          <Card className="animate-fadeup lg:col-span-2" style={{ animationDelay: '80ms' }}>
            <SectionTitle icon="cloud" title={t('trend')} sub="14 days · temp & rainfall"
              right={<button onClick={() => go('weather')} className="txt-soft hover:txt text-xs flex items-center gap-1">{t('view')}<Icon name="chevron" className="w-3.5 h-3.5" /></button>} />
            <LineChart height={210} fill labels={wLabels}
              series={[
                { label: 'Temp °C', data: (wx?.series || []).map((d) => d.temp_c), color: '#f59e0b' },
                { label: 'Rain mm', data: (wx?.series || []).map((d) => d.rainfall_mm), color: '#06b6d4' },
              ]} />
          </Card>
        </div>

        {/* satellite constellation */}
        <Card className="animate-fadeup">
          <SectionTitle icon="satellite" title={t('sat_status')}
            sub={`${kpi.satellite.online}/${kpi.satellite.constellation.length} ${t('online')}`}
            right={<button onClick={() => go('satellite')} className="txt-soft hover:txt text-xs flex items-center gap-1">{t('view')}<Icon name="chevron" className="w-3.5 h-3.5" /></button>} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpi.satellite.constellation.map((s, i) => (
              <div key={i} className="glass rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between">
                  <Icon name="satellite" className="w-5 h-5 text-cyan2-light" />
                  <span className={`relative flex h-2.5 w-2.5`}>
                    {s.status === 'online' && <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 animate-pulsering" />}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${s.status === 'online' ? 'bg-brand-400' : 'bg-amber-400'}`} />
                  </span>
                </div>
                <div className="txt font-semibold text-sm mt-2">{s.name}</div>
                <div className="txt-dim text-[11px] mt-0.5">{s.resolution_m}m · {s.revisit_days}d revisit</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Dashboard = Dashboard;
})();
