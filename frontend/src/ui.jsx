/* Reusable UI primitives: cards, KPI, badges, rings, skeletons, toasts, icons, modal. */
(function () {
  const { useState, useEffect, useRef } = React;

  /* ---- Icons (inline SVG, stroke=currentColor) ---- */
  const Icon = ({ name, className = 'w-5 h-5', ...p }) => {
    const paths = {
      grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      map: 'M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2zM9 3v16M15 5v16',
      brain: 'M12 5a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 4 3 3 0 0 0 5 0 3 3 0 0 0 2-4 3 3 0 0 0-1-5 3 3 0 0 0-3-3zM12 5v14',
      satellite: 'M5 13l-2 2 4 4 2-2M13 5l2-2 4 4-2 2M9 9l6 6M7 11l-4 4 2 2 4-4M17 13l4-4-2-2-4 4',
      cloud: 'M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 17 18H7z',
      soil: 'M3 7h18M3 12h18M3 17h18M6 7v10M12 7v10M18 7v10',
      bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z',
      history: 'M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 8v4l3 2',
      book: 'M4 5a3 3 0 0 1 3-2h5v18H7a3 3 0 0 0-3 2V5zM20 5a3 3 0 0 0-3-2h-5v18h5a3 3 0 0 1 3 2V5z',
      cpu: 'M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3M6 6h12v12H6zM10 10h4v4h-4z',
      bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0',
      sun: 'M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
      globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 4 5.6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.6-4-9s1.5-6.5 4-9z',
      logout: 'M15 12H3M11 8l-4 4 4 4M9 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9',
      upload: 'M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
      download: 'M12 4v12M8 12l4 4 4-4M4 18v2h16v-2',
      search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3',
      close: 'M6 6l12 12M18 6 6 18',
      check: 'M5 13l4 4L19 7',
      alert: 'M12 3 2 20h20L12 3zM12 9v5M12 17v.5',
      drop: 'M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z',
      leaf: 'M4 20s0-8 6-12 10-4 10-4 0 8-6 12S4 20 4 20zM10 14s2-4 6-6',
      chevron: 'M9 6l6 6-6 6', temp: 'M12 3a2 2 0 0 0-2 2v9a4 4 0 1 0 4 0V5a2 2 0 0 0-2-2z',
      wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h9',
      plus: 'M12 5v14M5 12h14', menu: 'M4 7h16M4 12h16M4 17h16',
      camera: 'M4 8a2 2 0 0 1 2-2h1.5l1-1.5h5l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    };
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
           strokeLinecap="round" strokeLinejoin="round" className={className} {...p}>
        <path d={paths[name] || paths.grid} />
      </svg>
    );
  };

  /* ---- Glass card ---- */
  const Card = ({ className = '', children, hover = false, pad = 'p-5', ...p }) => (
    <div className={`glass rounded-2xl ${pad} ${hover ? 'card-hover' : ''} ${className}`} {...p}>{children}</div>
  );

  const SectionTitle = ({ icon, title, sub, right }) => (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className="w-10 h-10 rounded-xl grad-brand grid place-items-center text-white shrink-0 shadow-lg shadow-brand-500/20"><Icon name={icon} /></div>}
        <div className="min-w-0">
          <h3 className="txt font-semibold text-[15px] leading-tight truncate">{title}</h3>
          {sub && <p className="txt-soft text-xs mt-0.5 truncate">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );

  /* ---- KPI card with animated count-up ---- */
  function useCountUp(target, dur = 900) {
    const [val, setVal] = useState(0);
    const raf = useRef();
    useEffect(() => {
      const start = performance.now(); const from = 0;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(from + (target - from) * e);
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf.current);
    }, [target]);
    return val;
  }

  const KPICard = ({ icon, label, value, suffix = '', decimals = 0, tone = 'brand', spark, delta, delay = 0 }) => {
    const v = useCountUp(Number(value) || 0);
    const tones = {
      brand: 'from-brand-500/20 to-cyan2/10 text-brand-300',
      cyan:  'from-cyan2/20 to-brand-500/10 text-cyan2-light',
      amber: 'from-amber-500/20 to-orange-500/10 text-amber-300',
      rose:  'from-rose-500/20 to-red-500/10 text-rose-300',
      violet:'from-violet-500/20 to-fuchsia-500/10 text-violet-300',
    };
    const fmt = (n) => decimals ? n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
                                : Math.round(n).toLocaleString();
    return (
      <Card hover className="animate-fadeup relative overflow-hidden" style={{ animationDelay: delay + 'ms' }}>
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${tones[tone]} blur-2xl opacity-60`} />
        <div className="flex items-start justify-between relative">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tones[tone]} grid place-items-center`}>
            <Icon name={icon} className="w-5 h-5" />
          </div>
          {delta != null && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${delta >= 0 ? 'text-brand-300 bg-brand-500/10' : 'text-rose-300 bg-rose-500/10'}`}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
            </span>
          )}
        </div>
        <div className="mt-4 relative">
          <div className="txt text-3xl font-bold tracking-tight tabular-nums">{fmt(v)}<span className="text-lg txt-soft font-semibold">{suffix}</span></div>
          <div className="txt-soft text-xs mt-1 font-medium">{label}</div>
        </div>
        {spark}
      </Card>
    );
  };

  /* ---- Status badge ---- */
  const Badge = ({ tone = 'brand', children, dot = false, className = '' }) => {
    const map = {
      brand:'text-brand-300 bg-brand-500/12 border-brand-500/25',
      low:  'text-brand-300 bg-brand-500/12 border-brand-500/25',
      optimal:'text-brand-300 bg-brand-500/12 border-brand-500/25',
      online:'text-brand-300 bg-brand-500/12 border-brand-500/25',
      medium:'text-amber-300 bg-amber-500/12 border-amber-500/25',
      warning:'text-amber-300 bg-amber-500/12 border-amber-500/25',
      high: 'text-rose-300 bg-rose-500/12 border-rose-500/25',
      critical:'text-rose-300 bg-rose-500/12 border-rose-500/25',
      info: 'text-cyan2-light bg-cyan2/12 border-cyan2/25',
      slate:'txt-soft bg-slate-500/10 border-slate-500/20',
      // Per-disease-class tones — one distinct hue per class key (13 total incl. healthy)
      // so classes no longer collapse onto the same 4 severity colors. Confusable pairs
      // per ai_engine.py's own docstrings (cad<->cbb, whitefly<->cmd) are placed far apart
      // on the hue wheel on purpose, not adjacent shades.
      healthy:'text-brand-300 bg-brand-500/12 border-brand-500/25',
      cmd:'text-red-300 bg-red-500/12 border-red-500/25',
      cbsd:'text-orange-300 bg-orange-500/12 border-orange-500/25',
      cbb:'text-amber-300 bg-amber-500/12 border-amber-500/25',
      cgm:'text-violet-300 bg-violet-500/12 border-violet-500/25',
      cad:'text-teal-300 bg-teal-500/12 border-teal-500/25',
      brown_leaf_spot:'text-yellow-300 bg-yellow-500/12 border-yellow-500/25',
      white_leaf_spot:'text-lime-300 bg-lime-500/12 border-lime-500/25',
      sed:'text-cyan-300 bg-cyan-500/12 border-cyan-500/25',
      mealybug:'text-fuchsia-300 bg-fuchsia-500/12 border-fuchsia-500/25',
      whitefly:'text-pink-300 bg-pink-500/12 border-pink-500/25',
      water_stress:'text-sky-300 bg-sky-500/12 border-sky-500/25',
      nutrient_def:'text-indigo-300 bg-indigo-500/12 border-indigo-500/25',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${map[tone] || map.slate} ${className}`}>
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
        {children}
      </span>
    );
  };

  /* ---- Progress ring ---- */
  const ProgressRing = ({ value = 0, size = 92, stroke = 8, label, sub, tone }) => {
    const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, value));
    const color = tone || (pct >= 78 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#f43f5e');
    const [dash, setDash] = useState(c);
    useEffect(() => { const t = setTimeout(() => setDash(c - (pct / 100) * c), 60); return () => clearTimeout(t); }, [pct, c]);
    return (
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} className="hair" stroke="currentColor" fill="none" opacity="0.25" />
          <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} stroke={color} fill="none"
                  strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)' }} />
        </svg>
        <div className="absolute text-center">
          <div className="txt font-bold text-lg tabular-nums">{Math.round(pct)}<span className="text-xs">{sub || '%'}</span></div>
          {label && <div className="txt-dim text-[10px] mt-0.5">{label}</div>}
        </div>
      </div>
    );
  };

  /* ---- Skeleton ---- */
  const Skeleton = ({ className = 'h-4 w-full', rounded = 'rounded-lg' }) => <div className={`skeleton ${rounded} ${className}`} />;
  const SkelCard = ({ h = 'h-28' }) => (
    <Card><div className="space-y-3"><Skeleton className="h-9 w-9" rounded="rounded-xl" /><Skeleton className={`${h} w-full`} /><Skeleton className="h-3 w-2/3" /></div></Card>
  );

  /* ---- Toast container ---- */
  const ToastHost = () => {
    const { toasts, dismissToast } = window.CG.Store.useStore();
    const tone = { info:'info', success:'low', error:'high', warn:'medium' };
    const ic = { info:'bell', success:'check', error:'alert', warn:'alert' };
    return (
      <div className="fixed z-[9999] bottom-5 right-5 flex flex-col gap-2 w-[min(92vw,360px)]">
        {toasts.map((t) => (
          <div key={t.id} className="glass-strong rounded-xl p-3.5 flex items-start gap-3 animate-slidein shadow-xl">
            <div className={`shrink-0 mt-0.5 ${t.kind==='error'?'text-rose-400':t.kind==='success'?'text-brand-400':t.kind==='warn'?'text-amber-400':'text-cyan2-light'}`}>
              <Icon name={ic[t.kind] || 'bell'} className="w-4 h-4" />
            </div>
            <div className="txt text-sm flex-1 leading-snug">{t.msg}</div>
            <button onClick={() => dismissToast(t.id)} className="txt-dim hover:txt"><Icon name="close" className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    );
  };

  /* ---- Modal ---- */
  const Modal = ({ open, onClose, title, children, wide = false }) => {
    useEffect(() => {
      if (!open) return;
      const h = (e) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
    }, [open, onClose]);
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-[9000] grid place-items-center p-4 animate-fadein" onMouseDown={onClose}>
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
        <div onMouseDown={(e) => e.stopPropagation()}
             className={`glass-strong rounded-2xl relative w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} max-h-[88vh] overflow-y-auto no-scrollbar animate-fadeup shadow-2xl`}>
          <div className="flex items-center justify-between p-5 border-b hair sticky top-0 glass-strong z-10">
            <h3 className="txt font-semibold">{title}</h3>
            <button onClick={onClose} className="txt-dim hover:txt w-8 h-8 grid place-items-center rounded-lg hover:bg-white/5"><Icon name="close" /></button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    );
  };

  /* ---- Segmented control ---- */
  const Segmented = ({ options, value, onChange, size = 'text-xs' }) => (
    <div className="inline-flex p-1 rounded-xl glass gap-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${size} ${value === o.value ? 'grad-brand text-white shadow' : 'txt-soft hover:txt'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );

  const Spinner = ({ className = 'w-5 h-5' }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  const Empty = ({ icon = 'grid', text }) => (
    <div className="flex flex-col items-center justify-center py-12 txt-dim gap-2">
      <Icon name={icon} className="w-9 h-9 opacity-50" /><p className="text-sm">{text}</p>
    </div>
  );

  window.CG.UI = { Icon, Card, SectionTitle, KPICard, Badge, ProgressRing, Skeleton, SkelCard,
                   ToastHost, Modal, Segmented, Spinner, Empty, useCountUp };
})();
