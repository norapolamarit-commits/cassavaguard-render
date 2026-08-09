/* History: prediction records with search/filter, detail modal, CSV/PDF export. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, Badge, Icon, Skeleton, Empty, Modal, ProgressRing } = window.CG.UI;
  const { ProbBars } = window.CG.Charts;

  function HistoryPage() {
    const { t, lang, toast } = window.CG.Store.useStore();
    const [rows, setRows] = useState(null);
    const [q, setQ] = useState('');
    const [cls, setCls] = useState('');
    const [detail, setDetail] = useState(null);
    const [classes, setClasses] = useState([]);

    const load = () => {
      const params = {}; if (q) params.q = q; if (cls) params.top_class = cls;
      window.CG.API_CLIENT.history(params).then((r) => setRows(r.items)).catch((e) => toast(e.message, 'error'));
    };
    useEffect(() => { window.CG.API_CLIENT.classes().then(setClasses); }, []);
    useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [q, cls]);

    const openDetail = (id) => window.CG.API_CLIENT.historyDetail(id).then(setDetail).catch((e) => toast(e.message, 'error'));
    const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);

    const exportCsv = async () => {
      try {
        const response = await window.CG.API_CLIENT.exportCsv();
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = 'cassavaguard_predictions.csv'; anchor.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        toast(error.message, 'error');
      }
    };

    const exportPdf = () => {
      if (!rows || !rows.length) { toast(t('no_data'), 'warn'); return; }
      const w = window.open('', '_blank');
      const rowsHtml = rows.map((r) => `<tr><td>${r.id}</td><td>${escapeHtml(r.created_at.replace('T', ' ').slice(0, 16))}</td><td>${escapeHtml(r.source)}</td><td>${escapeHtml(r.top_class)}</td><td>${(r.confidence * 100).toFixed(1)}%</td><td>${escapeHtml(r.field_name || '-')}</td></tr>`).join('');
      w.document.write(`<html><head><title>CassavaGuard Prediction Report</title>
        <style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#0b1a2b}h1{color:#059669}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#ecfdf5}</style>
        </head><body><h1>🌿 CassavaGuard AI — Prediction Report</h1><p>Generated ${new Date().toLocaleString()} · ${rows.length} records</p>
        <table><thead><tr><th>ID</th><th>Date</th><th>Source</th><th>Class</th><th>Confidence</th><th>Field</th></tr></thead><tbody>${rowsHtml}</tbody></table>
        <script>setTimeout(()=>window.print(),400)</script></body></html>`);
      w.document.close();
    };

    return (
      <div className="space-y-5">
        <Card className="animate-fadeup">
          <SectionTitle icon="history" title={t('nav_history')} sub={rows ? `${rows.length} records` : ''}
            right={
              <div className="flex gap-2">
                <button onClick={exportCsv} className="glass rounded-xl px-3 py-1.5 text-xs txt-soft hover:txt flex items-center gap-1.5"><Icon name="download" className="w-3.5 h-3.5" />{t('export_csv')}</button>
                <button onClick={exportPdf} className="glass rounded-xl px-3 py-1.5 text-xs txt-soft hover:txt flex items-center gap-1.5"><Icon name="download" className="w-3.5 h-3.5" />{t('export_pdf')}</button>
              </div>
            } />
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 txt-dim" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')}
                     className="w-full glass rounded-xl pl-9 pr-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40" />
            </div>
            <select value={cls} onChange={(e) => setCls(e.target.value)}
                    className="glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40">
              <option value="" className="bg-ink-800">{t('all_fields')}</option>
              {classes.map((c) => <option key={c.key} value={c.key} className="bg-ink-800">{lang === 'th' ? c.th : c.en}</option>)}
            </select>
          </div>

          {!rows ? <Skeleton className="h-64" /> : rows.length === 0 ? <Empty icon="history" text={t('no_data')} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="txt-dim text-xs border-b hair">
                  {['ID', lang === 'th' ? 'วันที่' : 'Date', lang === 'th' ? 'แหล่ง' : 'Source', lang === 'th' ? 'ผล' : 'Result', t('confidence'), lang === 'th' ? 'แปลง' : 'Field', ''].map((h, i) => <th key={i} className="text-left font-medium py-2 px-2">{h}</th>)}
                </tr></thead>
                <tbody>
                  {rows.map((r) => {
                    const c = classes.find((x) => x.key === r.top_class) || { th: r.top_class, en: r.top_class };
                    return (
                      <tr key={r.id} className="border-b hair hover:bg-white/[.02] transition">
                        <td className="py-2.5 px-2 txt-dim font-mono text-xs">#{r.id}</td>
                        <td className="py-2.5 px-2 txt-soft text-xs">{r.created_at.replace('T', ' ').slice(0, 16)}</td>
                        <td className="py-2.5 px-2"><span className="txt-soft text-xs capitalize">{r.source}</span></td>
                        <td className="py-2.5 px-2"><Badge tone={r.top_class || 'slate'}>{lang === 'th' ? c.th : c.en}</Badge></td>
                        <td className="py-2.5 px-2 txt font-mono text-xs tabular-nums">{(r.confidence * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-2 txt-soft text-xs">{r.field_name || '—'}</td>
                        <td className="py-2.5 px-2"><button onClick={() => openDetail(r.id)} className="txt-soft hover:text-brand-400"><Icon name="chevron" className="w-4 h-4" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Prediction #${detail.id}` : ''} wide>
          {detail && <DetailBody d={detail} classes={classes} />}
        </Modal>
      </div>
    );
  }

  function DetailBody({ d, classes }) {
    const { lang, t } = window.CG.Store.useStore();
    const { useState } = React;
    const [showHeat, setShowHeat] = useState(true);
    const c = classes.find((x) => x.key === d.top_class) || { th: d.top_class, en: d.top_class };
    return (
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          {(d.image_url || d.heatmap_url) && (
            <div className="relative rounded-xl overflow-hidden bg-black/20 grid place-items-center min-h-[180px] mb-3">
              <img src={showHeat && d.heatmap_url ? d.heatmap_url : d.image_url} alt="prediction"
                   className="w-full object-contain max-h-[220px]" />
              {d.image_url && d.heatmap_url && (
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button onClick={() => setShowHeat(false)} className={`text-[11px] px-2 py-1 rounded-lg ${!showHeat ? 'grad-brand text-white' : 'glass-strong txt-soft'}`}>Original</button>
                  <button onClick={() => setShowHeat(true)} className={`text-[11px] px-2 py-1 rounded-lg ${showHeat ? 'grad-brand text-white' : 'glass-strong txt-soft'}`}>{lang === 'th' ? 'จุดสำคัญ' : 'Attribution'}</button>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            <ProgressRing value={d.confidence * 100} label={t('confidence')} />
            <div>
              <Badge tone={d.top_class || 'slate'} dot>{lang === 'th' ? c.th : c.en}</Badge>
              <div className="txt-dim text-xs mt-2 font-mono">{d.model_id}</div>
              <div className="txt-dim text-xs">{d.inference_ms} ms · {d.source}</div>
            </div>
          </div>
          {d.symptoms && d.symptoms.length > 0 && (
            <div className="mb-3">
              <div className="txt-dim text-xs font-semibold uppercase mb-1.5">{t('symptoms')}</div>
              {d.symptoms.map((s, i) => <div key={i} className="txt-soft text-xs flex items-center gap-2 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan2" />{lang === 'th' ? s.th : s.en}</div>)}
            </div>
          )}
          <div className="glass rounded-xl p-3">
            <div className="txt-dim text-xs font-semibold mb-1">{t('explain')}</div>
            <p className="txt-soft text-xs leading-relaxed">{lang === 'th' ? d.explanation_th : d.explanation}</p>
          </div>
        </div>
        <div>
          <div className="txt-dim text-xs font-semibold uppercase mb-2">{t('prob_dist')}</div>
          {d.probs && <ProbBars items={Object.entries(d.probs).map(([k, v]) => {
            const cc = classes.find((x) => x.key === k) || { th: k, en: k };
            return { key: k, label: lang === 'th' ? cc.th : cc.en, value: v };
          }).sort((a, b) => b.value - a.value)} height={220} />}
          {d.feature_importance && d.feature_importance.length > 0 && (
            <div className="mt-3 space-y-2">
              {d.feature_importance.map((f, i) => (
                <div key={i}><div className="flex justify-between text-[11px] mb-1"><span className="txt-soft">{f.feature}</span><span className="txt-dim">{(f.importance * 100).toFixed(0)}%</span></div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full grad-brand rounded-full" style={{ width: f.importance * 100 + '%' }} /></div></div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.History = HistoryPage;
})();
