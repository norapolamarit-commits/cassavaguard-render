/* AI Diagnosis: upload leaf/plant/canopy/CSV, attribution map, explainability. */
(function () {
  const { useState, useEffect, useRef } = React;
  const { Card, SectionTitle, Badge, Icon, Segmented, Spinner, Empty, ProgressRing, Modal } = window.CG.UI;
  const { ProbBars, BarChart } = window.CG.Charts;

  function PredictPage() {
    const { t, lang, toast, user } = window.CG.Store.useStore();
    const [source, setSource] = useState('leaf');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [fields, setFields] = useState([]);
    const [fieldId, setFieldId] = useState('');
    const [drag, setDrag] = useState(false);
    const [camOpen, setCamOpen] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => { window.CG.API_CLIENT.fields().then(setFields).catch(() => {}); }, []);

    const pick = (f) => {
      if (!f) return;
      setFile(f); setResult(null);
      if (f.type.startsWith('image/')) { const url = URL.createObjectURL(f); setPreview(url); }
      else setPreview(null);
    };

    const run = async () => {
      if (!file) { toast(lang === 'th' ? 'กรุณาเลือกไฟล์' : 'Please choose a file', 'warn'); return; }
      setBusy(true); setResult(null);
      try {
        const isCsv = source === 'csv' || file.name.toLowerCase().endsWith('.csv');
        const r = isCsv ? await window.CG.API_CLIENT.predictCsv(file, fieldId || null)
                        : await window.CG.API_CLIENT.predictImage(file, source, fieldId || null);
        setResult(r);
        toast(lang === 'th' ? 'วิเคราะห์สำเร็จ' : 'Analysis complete', 'success');
      } catch (e) { toast(e.message, 'error'); }
      finally { setBusy(false); }
    };

    const SRC = [
      { value: 'leaf', label: t('src_leaf') }, { value: 'plant', label: t('src_plant') },
      { value: 'canopy', label: t('src_canopy') }, { value: 'csv', label: t('src_csv') },
    ];

    return (
      <div className="space-y-5">
        <div className="grid lg:grid-cols-5 gap-4">
          {/* uploader */}
          <Card className="lg:col-span-2 animate-fadeup">
            <SectionTitle icon="brain" title={t('predict_title')} sub={t('predict_sub')} />
            <div className="mb-3"><Segmented options={SRC} value={source} onChange={(v) => { setSource(v); setResult(null); }} /></div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current.click()}
              className={`rounded-2xl border-2 border-dashed cursor-pointer transition grid place-items-center text-center p-6 min-h-[220px] ${drag ? 'border-brand-400 bg-brand-500/10' : 'hair hover:border-brand-500/40 hover:bg-white/[.02]'}`}>
              {preview ? (
                <img src={preview} alt="preview" className="max-h-[200px] rounded-xl object-contain" />
              ) : file ? (
                <div className="txt-soft"><Icon name="soil" className="w-10 h-10 mx-auto mb-2 text-brand-400" /><div className="txt font-medium text-sm">{file.name}</div></div>
              ) : (
                <div className="txt-dim">
                  <div className="w-14 h-14 rounded-2xl grad-brand grid place-items-center text-white mx-auto mb-3 animate-floaty"><Icon name="upload" className="w-6 h-6" /></div>
                  <div className="txt-soft text-sm font-medium">{t('drop_here')}</div>
                  <div className="text-xs mt-1">{source === 'csv' ? 'CSV' : 'JPG · PNG'}</div>
                </div>
              )}
              <input ref={inputRef} type="file" className="hidden"
                     accept={source === 'csv' ? '.csv' : 'image/*'}
                     onChange={(e) => pick(e.target.files[0])} />
            </div>

            {source !== 'csv' && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={() => inputRef.current.click()}
                  className="glass rounded-xl py-2.5 flex items-center justify-center gap-2 txt-soft hover:txt transition text-sm font-medium">
                  <Icon name="upload" className="w-4 h-4" />{t('upload_file')}
                </button>
                <button onClick={() => setCamOpen(true)}
                  className="glass rounded-xl py-2.5 flex items-center justify-center gap-2 txt-soft hover:txt transition text-sm font-medium">
                  <Icon name="camera" className="w-4 h-4" />{t('take_photo')}
                </button>
              </div>
            )}

            <div className="mt-3">
              <label className="txt-dim text-xs">{t('select_field')}</label>
              <select value={fieldId} onChange={(e) => setFieldId(e.target.value)}
                      className="w-full mt-1 glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40">
                <option value="" className="bg-ink-800">— {t('all_fields')} —</option>
                {fields.map((f) => <option key={f.id} value={f.id} className="bg-ink-800">{lang === 'th' ? f.name_th || f.name : f.name}</option>)}
              </select>
            </div>

            <button onClick={run} disabled={busy || !file}
              className="w-full mt-4 grad-brand text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110 transition shadow-lg shadow-brand-500/20">
              {busy ? <><Spinner className="w-5 h-5" />{t('analyzing')}</> : <><Icon name="brain" className="w-5 h-5" />{t('analyze')}</>}
            </button>

            {source !== 'csv' && <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl border border-brand-500/25 bg-brand-500/10 p-3">
                <div className="font-semibold text-brand-300 flex items-center gap-1"><Icon name="check" className="w-3.5 h-3.5" />{lang === 'th' ? 'ภาพที่เหมาะ' : 'Good photo'}</div>
                <div className="txt-soft mt-1 leading-relaxed">{lang === 'th' ? 'แสงธรรมชาติ ภาพคม ใบกินพื้นที่ส่วนใหญ่ และถ่ายหลายมุม' : 'Natural light, sharp focus, leaf fills the frame, multiple angles.'}</div>
              </div>
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3">
                <div className="font-semibold text-rose-300 flex items-center gap-1"><Icon name="close" className="w-3.5 h-3.5" />{lang === 'th' ? 'ควรถ่ายใหม่' : 'Retake'}</div>
                <div className="txt-soft mt-1 leading-relaxed">{lang === 'th' ? 'ภาพสั่น ย้อนแสง ใบเล็ก พื้นหลังรก เปียกน้ำ หรือผ่านฟิลเตอร์สี' : 'Blur, backlight, tiny leaf, clutter, wet leaf, or color filters.'}</div>
              </div>
              {source === 'leaf' && <div className="col-span-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-100 leading-relaxed">
                {lang === 'th' ? 'ตรวจ Whitefly: ถ่ายใต้ใบระยะใกล้ ให้เห็นตัวแมลง และใช้ภาพความละเอียดเต็ม' : 'Whitefly check: photograph the underside closely, keep insects visible, and use full resolution.'}
              </div>}
            </div>}
          </Card>

          {/* results */}
          <div className="lg:col-span-3 space-y-4">
            {busy && <AnalyzingSkeleton />}
            {!busy && !result && <Card className="min-h-[300px] grid place-items-center animate-fadeup"><Empty icon="brain" text={lang === 'th' ? 'อัปโหลดไฟล์เพื่อเริ่มการวิเคราะห์' : 'Upload a file to begin analysis'} /></Card>}
            {!busy && result && (result.source === 'csv' ? <CsvResult r={result} /> : <ImageResult r={result} preview={preview} />)}
          </div>
        </div>

        <CameraModal open={camOpen} onClose={() => setCamOpen(false)}
          onCapture={(f) => { pick(f); setCamOpen(false); }} />
      </div>
    );
  }

  function CameraModal({ open, onClose, onCapture }) {
    const { t, lang, toast } = window.CG.Store.useStore();
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [shot, setShot] = useState(null);        // captured data URL preview
    const [facing, setFacing] = useState('environment');

    const stop = () => {
      if (streamRef.current) { streamRef.current.getTracks().forEach((tr) => tr.stop()); streamRef.current = null; }
    };

    const start = async (mode) => {
      stop(); setReady(false); setShot(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); setReady(true); }
      } catch (e) { toast(t('cam_error'), 'error'); onClose(); }
    };

    useEffect(() => {
      if (open) start(facing); else stop();
      return stop;
    }, [open]);

    const capture = () => {
      const v = videoRef.current; if (!v) return;
      const c = document.createElement('canvas');
      c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      setShot(c.toDataURL('image/jpeg', 0.92));
    };

    const usePhoto = () => {
      if (!shot) return;
      const bin = atob(shot.split(',')[1]);
      const buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      const file = new File([buf], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      stop(); onCapture(file);
    };

    const flip = () => { const m = facing === 'environment' ? 'user' : 'environment'; setFacing(m); start(m); };

    return (
      <Modal open={open} onClose={() => { stop(); onClose(); }} title={t('take_photo')}>
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] grid place-items-center">
          <video ref={videoRef} playsInline muted
                 className={`w-full h-full object-cover ${shot ? 'hidden' : ''}`} style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }} />
          {shot && <img src={shot} alt="capture" className="w-full h-full object-cover" />}
          {!ready && !shot && (
            <div className="absolute inset-0 grid place-items-center bg-black/40">
              <div className="flex flex-col items-center gap-2 text-white/80">
                <Spinner className="w-6 h-6" /><span className="text-sm">{t('cam_starting')}</span>
              </div>
            </div>
          )}
          {/* framing guide */}
          {ready && !shot && <div className="absolute inset-6 border-2 border-white/40 rounded-2xl pointer-events-none" />}
        </div>

        <div className="flex items-center justify-center gap-3 mt-4">
          {!shot ? (
            <>
              <button onClick={flip} title={t('switch_cam')}
                className="glass rounded-xl w-12 h-12 grid place-items-center txt-soft hover:txt">
                <Icon name="history" className="w-5 h-5" />
              </button>
              <button onClick={capture} disabled={!ready}
                className="grad-brand text-white font-semibold rounded-xl px-6 py-3 flex items-center gap-2 disabled:opacity-50 hover:brightness-110 transition shadow-lg shadow-brand-500/20">
                <Icon name="camera" className="w-5 h-5" />{t('capture')}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => start(facing)}
                className="glass rounded-xl px-5 py-3 flex items-center gap-2 txt-soft hover:txt font-medium">
                <Icon name="history" className="w-4 h-4" />{t('retake')}
              </button>
              <button onClick={usePhoto}
                className="grad-brand text-white font-semibold rounded-xl px-6 py-3 flex items-center gap-2 hover:brightness-110 transition shadow-lg shadow-brand-500/20">
                <Icon name="check" className="w-5 h-5" />{t('use_photo')}
              </button>
            </>
          )}
        </div>
      </Modal>
    );
  }

  function AnalyzingSkeleton() {
    const { Skeleton, Card } = window.CG.UI;
    return (
      <Card className="animate-fadeup">
        <div className="flex items-center gap-3 mb-4"><Spinner className="w-5 h-5 text-brand-400" /><span className="txt-soft text-sm">Running CassavaNet inference…</span></div>
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-48" /><div className="space-y-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-20" /></div></div>
      </Card>
    );
  }

  function ImageResult({ r, preview }) {
    const { t, lang } = window.CG.Store.useStore();
    const top = r.top3[0];
    const [visualMode, setVisualMode] = useState('heat');
    const whiteflyFinding = r.auxiliary_findings?.find((item) => item.key === 'whitefly');
    const probItems = r.top3.map((x) => ({ key: x.key, label: lang === 'th' ? x.th : x.en, value: x.confidence }));
    return (
      <>
        {/* verdict + attribution map */}
        <Card className="animate-fadeup">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge tone={top.key} dot>{lang === 'th' ? top.th : top.en}</Badge>
                {r.model_basis && (
                  <Badge tone={r.model_basis[top.key] === 'trained_ml' ? 'low' : 'info'}>
                    {r.model_basis[top.key] === 'trained_ml'
                      ? (lang === 'th' ? 'โมเดลที่เทรนจริง' : 'Trained model')
                      : (lang === 'th' ? 'กฎการประเมิน (ยังไม่มีข้อมูลจริง)' : 'Heuristic (no dataset yet)')}
                  </Badge>
                )}
                <span className="txt-dim text-xs font-mono">{r.model.name} v{r.model.version}</span>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black/20 grid place-items-center min-h-[220px]">
                <img src={visualMode === 'heat' ? r.heatmap : preview} alt="analysis" className="w-full object-contain max-h-[260px]" />
                {visualMode === 'whitefly' && whiteflyFinding?.image_size && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox={`0 0 ${whiteflyFinding.image_size[0]} ${whiteflyFinding.image_size[1]}`}
                    preserveAspectRatio="xMidYMid meet"
                    aria-label="Whitefly detection boxes">
                    {whiteflyFinding.detections.map((detection, index) => {
                      const [x1, y1, x2, y2] = detection.box_xyxy;
                      return (
                        <g key={index}>
                          <rect
                            x={x1} y={y1} width={x2 - x1} height={y2 - y1}
                            fill="rgba(245,158,11,.12)"
                            stroke="#f59e0b"
                            strokeWidth={Math.max(2, whiteflyFinding.image_size[0] / 700)}
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button onClick={() => setVisualMode('original')} className={`text-[11px] px-2 py-1 rounded-lg ${visualMode === 'original' ? 'grad-brand text-white' : 'glass-strong txt-soft'}`}>Original</button>
                  <button onClick={() => setVisualMode('heat')} className={`text-[11px] px-2 py-1 rounded-lg ${visualMode === 'heat' ? 'grad-brand text-white' : 'glass-strong txt-soft'}`}>{lang === 'th' ? 'จุดสำคัญ' : 'Attribution'}</button>
                  {whiteflyFinding && (
                    <button onClick={() => setVisualMode('whitefly')} className={`text-[11px] px-2 py-1 rounded-lg ${visualMode === 'whitefly' ? 'bg-amber-500 text-white' : 'glass-strong txt-soft'}`}>
                      {lang === 'th' ? `กรอบแมลง ${whiteflyFinding.count}` : `Whitefly boxes ${whiteflyFinding.count}`}
                    </button>
                  )}
                </div>
              </div>
              <p className="txt-dim text-[11px] mt-2 flex items-center gap-1.5"><Icon name="brain" className="w-3.5 h-3.5" />{t('attention')} · {r.inference_ms} ms</p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-3">
                <ProgressRing value={top.confidence * 100} size={84} label={t('confidence')} />
                <div>
                  <div className="txt-soft text-xs">{t('top3')}</div>
                  {r.top3.map((x, i) => (
                    <div key={x.key} className="flex items-center gap-2 mt-1.5">
                      <span className={`w-5 text-center text-[11px] font-bold ${i === 0 ? 'text-brand-400' : 'txt-dim'}`}>#{i + 1}</span>
                      <span className="txt text-xs flex-1 truncate">{lang === 'th' ? x.th : x.en}</span>
                      <span className="txt-soft text-xs font-mono tabular-nums">{(x.confidence * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-xl p-3 mt-auto">
                <div className="txt-soft text-xs font-semibold mb-1.5 flex items-center gap-1.5"><Icon name="bulb" className="w-3.5 h-3.5 text-amber-400" />{t('explain')}</div>
                <p className="txt-soft text-xs leading-relaxed">{lang === 'th' ? r.explanation_th : r.explanation_en}</p>
              </div>
              {r.requires_review && (
                <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-xs leading-relaxed">
                  {lang === 'th'
                    ? `ผลนี้ต้องตรวจทานโดยผู้เชี่ยวชาญก่อนดำเนินการกับแปลง (${(r.review_reasons || []).join(', ')})`
                    : `Expert review is required before field action (${(r.review_reasons || []).join(', ')})`}
                </div>
              )}
            </div>
          </div>
        </Card>

        {r.auxiliary_findings?.length > 0 && <Card className="animate-fadeup">
          <SectionTitle icon="check"
            title={lang === 'th' ? 'ผลจากหัวโมเดลเสริม' : 'Auxiliary model findings'}
            sub={lang === 'th'
              ? 'ผลอิสระ ไม่ถูกนำไปรวมกับ softmax 5 คลาส'
              : 'Independent findings; not mixed into the five-class softmax'} />
          <div className="space-y-3">
            {r.auxiliary_findings.map((finding) => (
              <div key={finding.key} className={`rounded-xl border p-3 ${
                finding.detected
                  ? 'border-amber-500/35 bg-amber-500/10'
                  : 'hair glass'
              }`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone={finding.detected ? 'medium' : 'slate'} dot={finding.detected}>
                        {finding.detected
                          ? (lang === 'th' ? 'ตรวจพบเหนือ threshold' : 'detected above threshold')
                          : (lang === 'th' ? 'ไม่ถึง threshold' : 'below threshold')}
                      </Badge>
                      <span className="txt text-sm font-semibold">
                        {lang === 'th' ? finding.th : finding.en}
                      </span>
                    </div>
                    <div className="txt-dim text-[10px] font-mono mt-1">
                      {finding.model.id}
                      {finding.model.test_macro_f1 != null
                        ? ` · test macro-F1 ${(finding.model.test_macro_f1 * 100).toFixed(1)}%`
                        : finding.model.test_map50 != null
                          ? ` · test mAP50 ${(finding.model.test_map50 * 100).toFixed(1)}%`
                          : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="txt text-xl font-bold tabular-nums">
                      {finding.count != null
                        ? `${finding.count} ${lang === 'th' ? 'ตัว' : 'objects'}`
                        : `${(finding.probability * 100).toFixed(1)}%`}
                    </div>
                    <div className="txt-dim text-[10px]">
                      {finding.count != null
                        ? `${lang === 'th' ? 'ความมั่นใจสูงสุด' : 'max confidence'} ${(finding.probability * 100).toFixed(1)}%`
                        : `threshold ${(finding.threshold * 100).toFixed(1)}%`}
                    </div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden mt-3">
                  <div className={`h-full rounded-full ${finding.detected ? 'bg-amber-400' : 'bg-slate-400'}`}
                    style={{ width: `${finding.probability * 100}%` }} />
                </div>
                <div className="txt-dim text-[11px] mt-2">
                  {lang === 'th'
                    ? 'ต้องให้ผู้เชี่ยวชาญตรวจยืนยันก่อนจัดการแปลง และยังไม่ผ่านการทดสอบอิสระกับภาพแปลงไทย'
                    : 'Requires expert confirmation before field action and is not independently validated on Thai field photos.'}
                </div>
                {finding.model.evaluation_warning && (
                  <div className="mt-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                    {lang === 'th'
                      ? 'คำเตือนคุณภาพ: ค่า mAP/recall เดิมอาจสูงเกินจริงจากการแบ่งข้อมูลแบบเก่า ต้องฝึกใหม่โดยแยกทั้ง acquisition run ก่อนใช้ภาคสนาม'
                      : 'Quality warning: legacy splitting may overstate mAP/recall. Retraining with whole acquisition-run groups is required before field use.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>}

        {/* symptoms + feature importance + prob dist */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="animate-fadeup">
            <SectionTitle icon="leaf" title={t('symptoms')} />
            <div className="space-y-2">
              {r.symptoms.map((s, i) => (
                <div key={i} className="flex items-center justify-between glass rounded-xl px-3 py-2">
                  <span className="txt text-sm">{lang === 'th' ? s.th : s.en}</span>
                  <Badge tone={s.severity === 'info' ? 'info' : s.severity}>{s.severity === 'info' ? '—' : Math.round(s.score * 100) + '%'}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}>
            <SectionTitle icon="cpu" title={t('feat_imp')} />
            <div className="space-y-2.5">
              {r.feature_importance.map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1"><span className="txt-soft">{f.feature}</span><span className="txt-dim font-mono">{(f.importance * 100).toFixed(0)}%</span></div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full grad-brand rounded-full" style={{ width: (f.importance * 100) + '%', transition: 'width 1s cubic-bezier(.2,.7,.2,1)' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="animate-fadeup">
          <SectionTitle icon="grid" title={t('prob_dist')} sub={lang === 'th' ? 'หัวโมเดลหลัก 5 คลาสเท่านั้น' : 'Primary five-class model head only'} />
          <ProbBars items={Object.entries(r.probs).map(([k, v]) => {
            const c = (window.CG._classMap && window.CG._classMap[k]) || { th: k, en: k };
            return { key: k, label: lang === 'th' ? c.th : c.en, value: v };
          }).sort((a, b) => b.value - a.value)} />
        </Card>
        <p className="txt-dim text-[11px] text-center">
          {lang === 'th' ? 'CassavaGuard เป็นเครื่องมือสนับสนุนการตัดสินใจ ไม่ใช่การวินิจฉัยที่ยืนยันโดยห้องปฏิบัติการ' : 'CassavaGuard is decision support, not a laboratory-confirmed diagnosis.'}
        </p>
      </>
    );
  }

  function CsvResult({ r }) {
    const { t, lang } = window.CG.Store.useStore();
    const top = r.top3[0];
    return (
      <Card className="animate-fadeup">
        <SectionTitle icon="grid" title={lang === 'th' ? 'ผลวิเคราะห์จากเซนเซอร์' : 'Sensor CSV Analysis'} sub={`${r.rows} rows`} />
        <div className="flex items-center gap-4 mb-4">
          <ProgressRing value={top.confidence * 100} label={t('confidence')} />
          <div>
            <Badge tone={top.key} dot>{lang === 'th' ? top.th : top.en}</Badge>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              {Object.entries(r.aggregates).map(([k, v]) => (
                <div key={k} className="glass rounded-lg px-2.5 py-1.5"><div className="txt-dim text-[10px] uppercase">{k.replace('_', ' ')}</div><div className="txt font-semibold">{v}</div></div>
              ))}
            </div>
          </div>
        </div>
        <ProbBars items={r.top3.map((x) => ({ key: x.key, label: lang === 'th' ? x.th : x.en, value: x.confidence }))} />
      </Card>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Predict = PredictPage;
})();
