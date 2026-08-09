/* Chart.js React wrappers, theme-aware. */
(function () {
  const { useRef, useEffect } = React;

  function themeColors() {
    const light = document.documentElement.classList.contains('light');
    return {
      grid: light ? 'rgba(15,23,42,.08)' : 'rgba(148,163,184,.12)',
      tick: light ? '#5b6b82' : '#93a4bd',
      brand: '#10b981', cyan: '#06b6d4', amber: '#f59e0b', rose: '#f43f5e',
      violet: '#8b5cf6', blue: '#3b82f6',
    };
  }

  // One distinct hex per disease-class key, matching ui.jsx's Badge tone palette 1:1 so a
  // class always reads as the same color in both the badge and the chart. Confusable pairs
  // per ai_engine.py's own docstrings (cad<->cbb, whitefly<->cmd) are kept far apart on the
  // hue wheel on purpose, not adjacent shades. Falls back to rose (generic "not healthy") for
  // any class key not in this map, so a future new class never crashes the chart, just looks
  // generic until added here.
  const CLASS_COLORS = {
    healthy: '#10b981', cmd: '#ef4444', cbsd: '#f97316', cbb: '#f59e0b', cgm: '#8b5cf6',
    cad: '#14b8a6', brown_leaf_spot: '#eab308', white_leaf_spot: '#84cc16', sed: '#06b6d4',
    mealybug: '#d946ef', whitefly: '#ec4899', water_stress: '#0ea5e9', nutrient_def: '#6366f1',
  };

  function baseOpts(extra = {}) {
    const c = themeColors();
    return {
      responsive: true, maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false, labels: { color: c.tick, boxWidth: 10, usePointStyle: true } },
        tooltip: {
          backgroundColor: 'rgba(9,14,26,.94)', borderColor: 'rgba(148,163,184,.2)', borderWidth: 1,
          titleColor: '#e5edf7', bodyColor: '#cbd5e1', padding: 10, cornerRadius: 10, displayColors: true,
          boxPadding: 4,
        },
      },
      scales: {
        x: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.tick, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
        y: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.tick, font: { size: 10 } } },
      },
      ...extra,
    };
  }

  function Chart({ type, data, options, height = 240, plugins }) {
    const ref = useRef(null); const inst = useRef(null);
    useEffect(() => {
      if (!ref.current) return;
      const ctx = ref.current.getContext('2d');
      inst.current = new window.Chart(ctx, { type, data, options, plugins });
      return () => inst.current && inst.current.destroy();
    }, [JSON.stringify(data), JSON.stringify(options), type]);
    return <div style={{ height }}><canvas ref={ref} /></div>;
  }

  function grad(ctx, area, from, to) {
    if (!area) return from;
    const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, from); g.addColorStop(1, to); return g;
  }

  /* Line/area chart */
  const LineChart = ({ labels, series, height = 240, fill = true, opts = {} }) => {
    const c = themeColors();
    const palette = [c.brand, c.cyan, c.amber, c.violet, c.rose];
    const data = {
      labels,
      datasets: series.map((s, i) => ({
        label: s.label, data: s.data, borderColor: s.color || palette[i % palette.length],
        borderWidth: 2, tension: 0.38, pointRadius: 0, pointHoverRadius: 4, fill: fill && series.length === 1,
        backgroundColor: (ctx) => grad(ctx.chart.ctx, ctx.chart.chartArea,
          (s.color || palette[i % palette.length]) + '44', (s.color || palette[i % palette.length]) + '02'),
      })),
    };
    return <Chart type="line" data={data} height={height}
      options={baseOpts({ plugins: { legend: { display: series.length > 1, labels: { color: c.tick, boxWidth: 10, usePointStyle: true } } }, ...opts })} />;
  };

  const BarChart = ({ labels, series, height = 240, horizontal = false, stacked = false, opts = {} }) => {
    const c = themeColors();
    const palette = [c.brand, c.cyan, c.amber, c.violet, c.rose, c.blue];
    const data = {
      labels,
      datasets: series.map((s, i) => ({
        label: s.label, data: s.data,
        backgroundColor: s.colors || (s.color || palette[i % palette.length]) + 'cc',
        borderRadius: 7, borderSkipped: false, barPercentage: 0.72, categoryPercentage: 0.78,
      })),
    };
    const o = baseOpts({
      indexAxis: horizontal ? 'y' : 'x',
      plugins: { legend: { display: series.length > 1, labels: { color: c.tick, boxWidth: 10, usePointStyle: true } } },
      scales: { x: { stacked, grid: { color: c.grid }, ticks: { color: c.tick, font: { size: 10 } } },
                y: { stacked, grid: { color: c.grid }, ticks: { color: c.tick, font: { size: 10 } } } },
      ...opts,
    });
    return <Chart type="bar" data={data} height={height} options={o} />;
  };

  const DoughnutChart = ({ labels, values, colors, height = 220, cutout = '68%', centerText }) => {
    const c = themeColors();
    const data = { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] };
    const opts = baseOpts({ cutout, scales: {}, plugins: { legend: { display: true, position: 'bottom', labels: { color: c.tick, boxWidth: 10, usePointStyle: true, padding: 12 } } } });
    return <Chart type="doughnut" data={data} height={height} options={opts} />;
  };

  const RadarChart = ({ labels, series, height = 260 }) => {
    const c = themeColors();
    const palette = [c.brand, c.cyan, c.amber];
    const data = {
      labels,
      datasets: series.map((s, i) => ({
        label: s.label, data: s.data,
        borderColor: s.color || palette[i % palette.length], borderWidth: 2,
        backgroundColor: (s.color || palette[i % palette.length]) + '22',
        pointBackgroundColor: s.color || palette[i % palette.length], pointRadius: 3,
      })),
    };
    const opts = baseOpts({
      scales: { r: { angleLines: { color: c.grid }, grid: { color: c.grid },
        pointLabels: { color: c.tick, font: { size: 10 } }, ticks: { display: false, backdropColor: 'transparent' },
        suggestedMin: 0, suggestedMax: 100 } },
      plugins: { legend: { display: series.length > 1, position: 'bottom', labels: { color: c.tick, boxWidth: 10, usePointStyle: true } } },
    });
    return <Chart type="radar" data={data} height={height} options={opts} />;
  };

  const ScatterChart = ({ points, height = 240, xLabel, yLabel }) => {
    const c = themeColors();
    const data = { datasets: [{ data: points, backgroundColor: c.cyan + 'cc', pointRadius: 5, pointHoverRadius: 7 }] };
    const opts = baseOpts({ scales: {
      x: { title: { display: !!xLabel, text: xLabel, color: c.tick }, grid: { color: c.grid }, ticks: { color: c.tick, font: { size: 10 } } },
      y: { title: { display: !!yLabel, text: yLabel, color: c.tick }, grid: { color: c.grid }, ticks: { color: c.tick, font: { size: 10 } } },
    } });
    return <Chart type="scatter" data={data} height={height} options={opts} />;
  };

  /* Bars for probability distribution with per-bar colors */
  const ProbBars = ({ items, height = 200 }) => {
    const c = themeColors();
    const colors = items.map((it) => CLASS_COLORS[it.key] || c.rose);
    return <BarChart labels={items.map((i) => i.label)} height={height}
      series={[{ label: 'Probability', data: items.map((i) => Math.round(i.value * 1000) / 10), colors: colors.map((x) => x + 'cc') }]}
      opts={{ scales: { y: { max: 100, grid: { color: c.grid }, ticks: { color: c.tick, callback: (v) => v + '%' } }, x: { grid: { display: false }, ticks: { color: c.tick, font: { size: 9 } } } } }} />;
  };

  window.CG.Charts = { LineChart, BarChart, DoughnutChart, RadarChart, ScatterChart, ProbBars, themeColors };
})();
