/* Recommendation system: evidence-based agronomy cards fused from all sources. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, Badge, Icon, Skeleton, Empty, Segmented } = window.CG.UI;

  const KIND_ICON = { nutrient: 'soil', water: 'drop', disease: 'brain', weather: 'cloud', info: 'check' };

  function RecommendationsPage({ initialField }) {
    const { t, lang, toast } = window.CG.Store.useStore();
    const [fields, setFields] = useState([]);
    const [fid, setFid] = useState(initialField || 'all');
    const [cards, setCards] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => { window.CG.API_CLIENT.fields().then(setFields); }, []);

    useEffect(() => {
      setCards(null);
      const API = window.CG.API_CLIENT;
      const load = async () => {
        try {
          if (fid === 'all') {
            const fs = await API.fields();
            const details = await Promise.all(fs.map((f) => API.field(f.id)));
            const merged = [];
            details.forEach((d) => d.recommendations.forEach((r) => merged.push({ ...r, field: d.name, field_th: d.name_th, field_id: d.id })));
            merged.sort((a, b) => ({ high: 0, medium: 1, info: 2 }[a.severity] - { high: 0, medium: 1, info: 2 }[b.severity]) || b.confidence - a.confidence);
            setCards(merged);
          } else {
            const d = await API.field(fid);
            setCards(d.recommendations.map((r) => ({ ...r, field: d.name, field_th: d.name_th, field_id: d.id })));
          }
        } catch (e) { toast(e.message, 'error'); }
      };
      load();
    }, [fid]);

    const shown = cards ? cards.filter((c) => filter === 'all' || c.kind === filter) : null;
    const counts = cards ? {
      high: cards.filter((c) => c.severity === 'high').length,
      medium: cards.filter((c) => c.severity === 'medium').length,
      total: cards.length,
    } : { high: 0, medium: 0, total: 0 };

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select value={fid} onChange={(e) => setFid(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40">
              <option value="all" className="bg-ink-800">{t('all_fields')}</option>
              {fields.map((f) => <option key={f.id} value={f.id} className="bg-ink-800">{lang === 'th' ? f.name_th || f.name : f.name}</option>)}
            </select>
          </div>
          <Segmented value={filter} onChange={setFilter} options={[
            { value: 'all', label: lang === 'th' ? 'ทั้งหมด' : 'All' },
            { value: 'nutrient', label: lang === 'th' ? 'ธาตุอาหาร' : 'Nutrient' },
            { value: 'water', label: lang === 'th' ? 'น้ำ' : 'Water' },
            { value: 'disease', label: lang === 'th' ? 'โรค' : 'Disease' },
          ]} />
        </div>

        {/* summary strip */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="animate-fadeup"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-300 grid place-items-center"><Icon name="alert" /></div><div><div className="txt text-2xl font-bold">{counts.high}</div><div className="txt-dim text-xs">{t('high')}</div></div></div></Card>
          <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 grid place-items-center"><Icon name="bell" /></div><div><div className="txt text-2xl font-bold">{counts.medium}</div><div className="txt-dim text-xs">{t('medium')}</div></div></div></Card>
          <Card className="animate-fadeup" style={{ animationDelay: '120ms' }}><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300 grid place-items-center"><Icon name="bulb" /></div><div><div className="txt text-2xl font-bold">{counts.total}</div><div className="txt-dim text-xs">{t('recommendation')}</div></div></div></Card>
        </div>

        {/* cards */}
        {!shown ? (
          <div className="grid md:grid-cols-2 gap-4">{[0, 1, 2, 3].map((i) => <Card key={i}><Skeleton className="h-40" /></Card>)}</div>
        ) : shown.length === 0 ? (
          <Card><Empty icon="check" text={lang === 'th' ? 'ไม่มีคำแนะนำในหมวดนี้' : 'No recommendations in this category'} /></Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {shown.map((r, i) => <RecoCard key={i} r={r} delay={i * 50} />)}
          </div>
        )}
      </div>
    );
  }

  function RecoCard({ r, delay }) {
    const { lang } = window.CG.Store.useStore();
    const actions = lang === 'th' ? r.actions_th : r.actions_en;
    return (
      <Card hover className="animate-fadeup relative overflow-hidden" style={{ animationDelay: delay + 'ms' }}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${r.severity === 'high' ? 'bg-rose-500' : r.severity === 'medium' ? 'bg-amber-500' : 'bg-brand-500'}`} />
        <div className="flex items-start justify-between gap-2 mb-3 pl-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl grid place-items-center ${r.severity === 'high' ? 'bg-rose-500/15 text-rose-300' : r.severity === 'medium' ? 'bg-amber-500/15 text-amber-300' : 'bg-brand-500/15 text-brand-300'}`}>
              <Icon name={KIND_ICON[r.kind] || 'bulb'} className="w-5 h-5" />
            </div>
            <div>
              <h4 className="txt font-semibold text-sm leading-tight">{lang === 'th' ? r.title_th : r.title_en}</h4>
              {r.field && <div className="txt-dim text-[11px] mt-0.5">{lang === 'th' ? r.field_th || r.field : r.field}</div>}
            </div>
          </div>
          <Badge tone={r.severity}>{Math.round(r.confidence * 100)}%</Badge>
        </div>

        <div className="pl-2">
          <div className="txt-dim text-[11px] font-semibold uppercase mb-1.5">{lang === 'th' ? 'หลักฐาน' : 'Evidence'}</div>
          <ul className="space-y-1 mb-3">
            {r.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 txt-soft text-xs"><span className="w-1.5 h-1.5 rounded-full bg-cyan2 mt-1.5 shrink-0" />{lang === 'th' ? e.th : e.en}</li>
            ))}
          </ul>
          <div className="txt-dim text-[11px] font-semibold uppercase mb-1.5">{lang === 'th' ? 'คำแนะนำ' : 'Actions'}</div>
          <ul className="space-y-1">
            {actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 txt text-xs"><Icon name="check" className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />{a}</li>
            ))}
          </ul>
          {/* confidence bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full grad-brand rounded-full" style={{ width: r.confidence * 100 + '%', transition: 'width 1s' }} />
            </div>
            <span className="txt-dim text-[10px]">{lang === 'th' ? 'ความเชื่อมั่น' : 'confidence'}</span>
          </div>
        </div>
      </Card>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Recommendations = RecommendationsPage;
})();
