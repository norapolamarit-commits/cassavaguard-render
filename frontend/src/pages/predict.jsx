/* AI Diagnosis: upload leaf/plant/canopy/CSV, attribution map, explainability. */
(function () {
  const { useState, useEffect, useRef } = React;
  const { Card, SectionTitle, Badge, Icon, Segmented, Spinner, Empty, ProgressRing, Modal } = window.CG.UI;
  const { ProbBars, BarChart } = window.CG.Charts;

  function PredictPage() {
    const { t, lang, toast, user } = window.CG.Store.useStore();
    const [source, setSource] = useState('plant');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [plantFile, setPlantFile] = useState(null);
    const [plantPreview, setPlantPreview] = useState(null);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [observedAt, setObservedAt] = useState(null);
    const [timestampKind, setTimestampKind] = useState('file_selected');
    const [drag, setDrag] = useState(false);
    const [camOpen, setCamOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const inputRef = useRef(null);
    const plantInputRef = useRef(null);
    const uploaderRef = useRef(null);

    const pick = (f, kind = 'file_selected') => {
      if (!f) return;
      setObservedAt(new Date().toISOString());
      setTimestampKind(kind);
      setFile(f); setResult(null);
      if (f.type.startsWith('image/')) { const url = URL.createObjectURL(f); setPreview(url); }
      else setPreview(null);
    };

    const retake = () => {
      setFile(null); setPreview(null); setPlantFile(null); setPlantPreview(null); setResult(null);
      uploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const run = async () => {
      if (!file) { toast(lang === 'th' ? 'กรุณาเลือกไฟล์' : 'Please choose a file', 'warn'); return; }
      const isCsv = source === 'csv' || file.name.toLowerCase().endsWith('.csv');
      setBusy(true); setResult(null);
      try {
        const r = isCsv ? await window.CG.API_CLIENT.predictCsv(file, null)
                        : plantFile
                          ? await window.CG.API_CLIENT.predictImages([
                              { file, source }, { file: plantFile, source: 'plant' },
                            ], null, observedAt, timestampKind)
                          : await window.CG.API_CLIENT.predictImage(file, source, null, observedAt, timestampKind);
        setResult(r);
        toast(lang === 'th' ? 'วิเคราะห์สำเร็จ' : 'Analysis complete', 'success');
      } catch (e) { toast(e.message, 'error'); }
      finally { setBusy(false); }
    };

    useEffect(() => {
      if (file && source !== 'csv' && !busy && !result) run();
    }, [file]);

    const SRC = [
      { value: 'leaf', label: t('src_leaf') }, { value: 'plant', label: t('src_plant') },
      { value: 'canopy', label: t('src_canopy') }, { value: 'csv', label: t('src_csv') },
    ];
    const workflowStep = result ? 3 : (file || busy) ? 2 : 1;

    const steps = [
      [1, 'camera', lang === 'th' ? 'เลือกรูป' : 'Add photo', lang === 'th' ? 'ถ่ายหรืออัปโหลดภาพทั้งต้น' : 'Capture or upload the whole plant'],
      [2, 'brain', lang === 'th' ? 'ประมวลผลอัตโนมัติ' : 'Auto analyze', lang === 'th' ? 'AI อ่านภาพให้ทันที' : 'The AI reads it instantly'],
      [3, 'leaf', lang === 'th' ? 'ดูผลวิเคราะห์' : 'See results', lang === 'th' ? 'ดูโรค ความมั่นใจ และคำแนะนำ' : 'See disease, confidence, and guidance'],
    ];

    return (
      <div className="max-w-6xl mx-auto diagnosis-workspace">
        {/* Bento hero: one dominant capture card + a compact side rail — replaces
            the old stacked intro/stepper/tip/uploader sections. */}
        <div className={`grid gap-4 ${result || busy ? '' : 'lg:grid-cols-[1.6fr_1fr]'}`}>
          <Card className="animate-fadeup capture-card capture-hero">
            <div ref={uploaderRef}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="diagnosis-kicker"><Icon name="leaf" className="w-4 h-4" /> CASSAVAGUARD VISION</span>
                <div className="txt font-extrabold text-2xl sm:text-3xl mt-2 leading-tight">{file ? (lang === 'th' ? 'ตรวจสอบรูปภาพ' : 'Check your photo') : (lang === 'th' ? 'ตรวจสุขภาพจากภาพเดียว' : 'Understand health from one photo')}</div>
                <div className="txt-soft text-sm mt-1.5 max-w-md">{file ? (lang === 'th' ? 'JPG หรือ PNG • ใช้ภาพต้นฉบับที่ไม่ผ่านฟิลเตอร์' : 'JPG or PNG • use an original, unfiltered photo') : (lang === 'th' ? 'ถ่ายภาพทั้งต้นในแปลง ระบบวิเคราะห์สุขภาพและประเมินผลผลิตโดยไม่ต้องขุดหัว' : 'Photograph the standing plant — analyze health and estimate yield with no digging.')}</div>
              </div>
              <Badge tone="green" className="shrink-0">1 {lang === 'th' ? 'รูป' : 'photo'}</Badge>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current.click()}
              className={`capture-zone cursor-pointer ${drag ? 'is-dragging' : ''} ${preview ? 'has-preview' : ''}`}>
              {preview ? (
                <img src={preview} alt={lang === 'th' ? 'รูปที่เลือกสำหรับวิเคราะห์' : 'Selected photo for analysis'} className="max-h-[350px] w-full rounded-2xl object-contain" />
              ) : file ? (
                <div className="txt-soft"><Icon name="soil" className="w-10 h-10 mx-auto mb-2 text-brand-400" /><div className="txt font-medium text-sm">{file.name}</div></div>
              ) : (
                <div className="txt-dim">
                  <div className="capture-orb"><Icon name="camera" className="w-9 h-9" /><span className="capture-orb-ring" /></div>
                  <div className="txt text-xl font-extrabold">{lang === 'th' ? 'แตะเพื่อเลือกรูปทั้งต้น' : 'Tap to choose a whole-plant photo'}</div>
                  <div className="txt-dim text-sm mt-2">{lang === 'th' ? 'หรือลากรูปมาวางตรงนี้' : 'or drag and drop it here'}</div>
                </div>
              )}
              <input ref={inputRef} type="file" className="hidden"
                     accept={source === 'csv' ? '.csv' : 'image/*'}
                     onChange={(e) => pick(e.target.files[0])} />
            </div>

            {source !== 'csv' && (
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <button onClick={() => setCamOpen(true)}
                  className="primary-action">
                  <Icon name="camera" className="w-5 h-5" />{t('take_photo')}
                </button>
                <button onClick={() => inputRef.current.click()}
                  className="secondary-action">
                  <Icon name="upload" className="w-5 h-5" />{t('upload_file')}
                </button>
              </div>
            )}

            {source === 'leaf' && file && <div className="evidence-panel mt-4">
              <div className="flex items-center justify-between gap-3">
                <div><div className="txt text-sm font-bold">{lang === 'th' ? 'เพิ่มภาพทั้งต้นเพื่อผลที่รอบด้านขึ้น' : 'Add a whole-plant view for stronger evidence'}</div><p className="txt-dim text-xs mt-1">{lang === 'th' ? 'ระบบจะรวมความน่าจะเป็นจากภาพใบและภาพต้น พร้อมตรวจว่าผลตรงกันหรือไม่' : 'We fuse leaf and plant probabilities and report whether the views agree.'}</p></div>
                <Badge tone={plantFile ? 'low' : 'slate'}>{plantFile ? '2/2' : '1/2'}</Badge>
              </div>
              {plantFile ? <div className="evidence-photo mt-3"><img src={plantPreview} alt={lang === 'th' ? 'ภาพต้นมันสำปะหลัง' : 'Whole cassava plant'} /><div><strong className="txt text-sm block">{lang === 'th' ? 'ภาพทั้งต้นพร้อมแล้ว' : 'Whole-plant view ready'}</strong><span className="txt-dim text-xs block truncate max-w-[210px]">{plantFile.name}</span></div><button onClick={() => { setPlantFile(null); setPlantPreview(null); }} aria-label={lang === 'th' ? 'ลบภาพต้น' : 'Remove plant photo'}><Icon name="close" className="w-4 h-4" /></button></div>
                : <button type="button" onClick={() => plantInputRef.current?.click()} className="add-evidence-button mt-3"><Icon name="plus" className="w-4 h-4" />{lang === 'th' ? 'เพิ่มภาพทั้งต้น' : 'Add whole-plant photo'}</button>}
              <input ref={plantInputRef} type="file" className="hidden" accept="image/*" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) { setPlantFile(selected); setPlantPreview(URL.createObjectURL(selected)); setResult(null); } }} />
            </div>}

            <div className="mt-3">
              <button type="button" onClick={() => setAdvancedOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 txt-soft hover:txt text-xs font-semibold py-1.5 transition">
                <span className="flex items-center gap-1.5"><Icon name="cpu" className="w-3.5 h-3.5" />{lang === 'th' ? 'ตัวเลือกขั้นสูง' : 'Advanced options'}</span>
                <Icon name={advancedOpen ? 'close' : 'grid'} className="w-3.5 h-3.5" />
              </button>
              {advancedOpen && (
                <div className="mt-2 space-y-3 animate-fadeup rounded-xl border hair p-3">
                  <div>
                    <label className="txt-dim text-xs">{lang === 'th' ? 'ชนิดภาพ' : 'Image type'}</label>
                    <div className="mt-1"><Segmented options={SRC} value={source} onChange={(v) => { setSource(v); setResult(null); }} /></div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={run} disabled={busy || !file}
              className="analyze-action disabled:opacity-40">
              {busy ? <><Spinner className="w-5 h-5" />{t('analyzing')}</> : <><Icon name="brain" className="w-5 h-5" />{t('analyze')}</>}
            </button>

            {source !== 'csv' && !file && <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border border-brand-500/25 bg-brand-500/10 p-3">
                <div className="font-semibold text-brand-300 flex items-center gap-1"><Icon name="check" className="w-3.5 h-3.5" />{lang === 'th' ? 'ภาพที่เหมาะ' : 'Good photo'}</div>
                <div className="txt-soft mt-1 leading-relaxed">{lang === 'th' ? 'แสงธรรมชาติ ภาพคม ใบกินพื้นที่ส่วนใหญ่ และถ่ายหลายมุม' : 'Natural light, sharp focus, leaf fills the frame, multiple angles.'}</div>
              </div>
              <div className="rounded-xl border border-rose-500/25 bg-red-500/10 p-3">
                <div className="font-semibold text-red-500 flex items-center gap-1"><Icon name="close" className="w-3.5 h-3.5" />{lang === 'th' ? 'ควรถ่ายใหม่' : 'Retake'}</div>
                <div className="txt-soft mt-1 leading-relaxed">{lang === 'th' ? 'ภาพสั่น ย้อนแสง ใบเล็ก พื้นหลังรก เปียกน้ำ หรือผ่านฟิลเตอร์สี' : 'Blur, backlight, tiny leaf, clutter, wet leaf, or color filters.'}</div>
              </div>
            </div>}
            </div>
          </Card>

          {/* Side rail: compact vertical "how it works" list — replaces the old
              full-width horizontal 3-step banner. Only shown before a result exists. */}
          {!result && !busy && (
            <div className="space-y-4">
              <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}>
                <ol className="step-rail" aria-label={lang === 'th' ? 'ขั้นตอนการวิเคราะห์' : 'Analysis steps'}>
                  {steps.map(([number, icon, title, sub]) => (
                    <li key={number} className={workflowStep >= number ? 'active' : ''}>
                      <span className="step-rail-dot"><Icon name={icon} className="w-4 h-4" /></span>
                      <div><b>{title}</b><p>{sub}</p></div>
                    </li>
                  ))}
                </ol>
              </Card>
              <Card className="animate-fadeup flex items-start gap-3" style={{ animationDelay: '100ms' }}>
                <Icon name="camera" className="w-5 h-5 shrink-0 text-brand-500 mt-0.5" />
                <p className="txt-soft text-sm">{lang === 'th' ? 'เคล็ดลับ: ถ่ายให้เห็นทั้งต้นตั้งแต่โคนถึงยอด มีวัตถุเทียบขนาด และหลีกเลี่ยงย้อนแสง' : 'Tip: show the whole plant base to canopy, include a scale reference, and avoid backlight.'}</p>
              </Card>
              <Card className="animate-fadeup flex flex-col gap-2 text-sm" style={{ animationDelay: '140ms' }}>
                <span className="flex items-center gap-2 txt"><Icon name="check" className="w-4 h-4 text-brand-500" />{lang === 'th' ? 'ปลอดภัยด้วยบัญชีของคุณ' : 'Secured with your account'}</span>
                <span className="flex items-center gap-2 txt"><Icon name="cpu" className="w-4 h-4 text-brand-500" />{lang === 'th' ? 'โมเดล 5 คลาส' : '5-class model'}</span>
              </Card>
            </div>
          )}
        </div>

        {/* results — full width below the hero once an analysis is running or done */}
        {(result || busy) && <div className="space-y-4 mt-4">
          {busy && <AnalyzingSkeleton />}
          {!busy && !result && <Card className="min-h-[300px] grid place-items-center animate-fadeup"><Empty icon="brain" text={lang === 'th' ? 'อัปโหลดไฟล์เพื่อเริ่มการวิเคราะห์' : 'Upload a file to begin analysis'} /></Card>}
          {!busy && result && (result.source === 'csv'
            ? <CsvResult r={result} onRetake={retake} />
            : <ImageResult r={result} preview={preview} onRetake={retake} />)}
        </div>}

        <CameraModal open={camOpen} onClose={() => setCamOpen(false)}
          onCapture={(f) => { pick(f, 'camera_capture'); setCamOpen(false); }} />
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

  function ImageResult({ r, preview, onRetake }) {
    const { t, lang } = window.CG.Store.useStore();
    const top = r.top3[0];
    const [visualMode, setVisualMode] = useState('heat');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const whiteflyFinding = r.auxiliary_findings?.find((item) => item.key === 'whitefly');

    return (
      <>
        {/* Primary card: the 5 things a user needs without scrolling */}
        <Card className="animate-fadeup">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge tone={top.key} dot>{lang === 'th' ? top.th : top.en}</Badge>
            {r.model_basis && (
              <Badge tone={r.model_basis[top.key] === 'trained_ml' ? 'low' : 'info'}>
                {r.model_basis[top.key] === 'trained_ml'
                  ? (lang === 'th' ? 'โมเดลที่เทรนจริง' : 'Trained model')
                  : (lang === 'th' ? 'กฎการประเมิน (ยังไม่มีข้อมูลจริง)' : 'Heuristic (no dataset yet)')}
              </Badge>
            )}
            {r.multi_view && <Badge tone={r.multi_view.agreement === 1 ? 'low' : 'medium'}>{lang === 'th' ? `หลายมุม ${Math.round(r.multi_view.agreement * 100)}% ตรงกัน` : `Multi-view ${Math.round(r.multi_view.agreement * 100)}% agreement`}</Badge>}
          </div>

          {r.severity && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge tone={r.severity.level === 'severe' ? 'high' : r.severity.level === 'moderate' ? 'medium' : 'low'}>
                {lang === 'th'
                  ? { mild: 'อาการเล็กน้อย', moderate: 'อาการปานกลาง', severe: 'อาการรุนแรง' }[r.severity.level]
                  : { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' }[r.severity.level]}
              </Badge>
              <span className="txt-dim text-[11px]">{lang === 'th' ? r.severity.note_th : r.severity.note_en}</span>
            </div>
          )}

          {r.capture_context && <CaptureTimeCard context={r.capture_context} />}

          <div className="flex items-center gap-4">
            <ProgressRing value={top.confidence * 100} size={84} label={t('confidence')} />
            <div className="flex-1 min-w-0">
              {r.health_score && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="text-2xl font-bold txt tabular-nums">
                    {r.health_score.score}<span className="text-xs txt-dim font-normal">/100</span>
                  </div>
                  <span className="txt-dim text-[11px]">{lang === 'th' ? r.health_score.note_th : r.health_score.note_en}</span>
                </div>
              )}
              {r.requires_review ? (
                <div
                  className="rounded-xl border p-3 text-xs leading-relaxed"
                  style={{ color: 'var(--cg-warm-ink)', background: 'var(--cg-warm-soft)', borderColor: 'rgba(239,157,19,.22)' }}
                >
                  {lang === 'th'
                    ? `ผลนี้ต้องตรวจทานโดยผู้เชี่ยวชาญก่อนดำเนินการกับแปลง (${(r.review_reasons || []).join(', ')})`
                    : `Expert review is required before field action (${(r.review_reasons || []).join(', ')})`}
                </div>
              ) : (
                <p className="txt-soft text-xs leading-relaxed">{lang === 'th' ? r.explanation_th : r.explanation_en}</p>
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-4 glass rounded-xl p-3">
            <div className="txt-soft text-xs font-semibold mb-1.5 flex items-center gap-1.5"><Icon name="bulb" className="w-3.5 h-3.5 text-amber-400" />{lang === 'th' ? 'คำแนะนำ' : 'Recommendation'}</div>
            <p className="txt-soft text-xs leading-relaxed">{lang === 'th' ? r.explanation_th : r.explanation_en}</p>
          </div>

          <button onClick={onRetake} className="w-full mt-4 glass rounded-xl py-2.5 flex items-center justify-center gap-2 txt-soft hover:txt transition text-sm font-medium">
            <Icon name="history" className="w-4 h-4" />{lang === 'th' ? 'ถ่ายใหม่' : 'Retake'}
          </button>
        </Card>

        <CassavaPlantModel result={r} />

        {/* Advanced Details: attribution map, auxiliary findings, symptoms, feature importance, full distribution */}
        <button onClick={() => setDetailsOpen((v) => !v)}
          className="w-full glass rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 txt-soft hover:txt text-xs font-semibold transition animate-fadeup">
          <span className="flex items-center gap-1.5"><Icon name="cpu" className="w-3.5 h-3.5" />{lang === 'th' ? 'รายละเอียดขั้นสูง' : 'Advanced Details'}</span>
          <Icon name={detailsOpen ? 'close' : 'grid'} className="w-3.5 h-3.5" />
        </button>

        {detailsOpen && <>
        <Card className="animate-fadeup">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              <div className="txt-soft text-xs">{t('top3')}</div>
              {r.top3.map((x, i) => (
                <div key={x.key} className="flex items-center gap-2 mt-1.5">
                  <span className={`w-5 text-center text-[11px] font-bold ${i === 0 ? 'text-brand-400' : 'txt-dim'}`}>#{i + 1}</span>
                  <span className="txt text-xs flex-1 truncate">{lang === 'th' ? x.th : x.en}</span>
                  <span className="txt-soft text-xs font-mono tabular-nums">{(x.confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
              <div className="glass rounded-xl p-3 mt-3">
                <div className="txt-soft text-xs font-semibold mb-1.5 flex items-center gap-1.5"><Icon name="bulb" className="w-3.5 h-3.5 text-amber-400" />{t('explain')}</div>
                <p className="txt-soft text-xs leading-relaxed">{lang === 'th' ? r.explanation_th : r.explanation_en}</p>
              </div>
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
                  <div
                    className="mt-2 rounded-lg border px-3 py-2 text-[11px]"
                    style={{ color: 'var(--cg-warm-ink)', background: 'var(--cg-warm-soft)', borderColor: 'rgba(239,157,19,.22)' }}
                  >
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
        </>}
      </>
    );
  }

  function CaptureTimeCard({ context }) {
    const { lang } = window.CG.Store.useStore();
    const actual = context.is_actual_capture_time;
    const captured = new Date(context.captured_at);
    const shown = Number.isNaN(captured.getTime()) ? context.captured_at : captured.toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB');
    const cropDays = context.crop_timing?.days_after_planting_at_capture;
    return <div className="mb-3 rounded-xl border border-sky-500/25 bg-sky-500/[.07] p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="txt text-xs font-semibold flex items-center gap-1.5"><Icon name="history" className="w-4 h-4 text-sky-300" />{lang === 'th' ? 'วิเคราะห์ช่วงเวลาถ่าย' : 'Capture-time analysis'}</div>
        <Badge tone={actual ? 'low' : 'medium'}>{actual ? (lang === 'th' ? 'เวลาจาก EXIF' : 'EXIF time') : (lang === 'th' ? 'เวลาทดแทน' : 'Fallback time')}</Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
        <div><div className="txt-dim text-[10px]">{lang === 'th' ? 'วันและเวลา' : 'Date & time'}</div><div className="txt font-semibold mt-0.5">{shown}</div></div>
        <div><div className="txt-dim text-[10px]">{lang === 'th' ? 'ช่วงวัน' : 'Day period'}</div><div className="txt font-semibold mt-0.5">{lang === 'th' ? context.period_of_day.th : context.period_of_day.en}</div></div>
        <div><div className="txt-dim text-[10px]">{lang === 'th' ? 'ช่วงฤดู' : 'Season'}</div><div className="txt font-semibold mt-0.5">{lang === 'th' ? context.season.th : context.season.en}</div></div>
        <div><div className="txt-dim text-[10px]">{lang === 'th' ? 'อายุแปลง ณ ตอนถ่าย' : 'Crop age at capture'}</div><div className="txt font-semibold mt-0.5">{Number.isFinite(cropDays) && cropDays >= 0 ? (lang === 'th' ? `${cropDays} วัน` : `${cropDays} days`) : '—'}</div></div>
      </div>
      {!actual && <p className="text-amber-300 text-[10px] mt-2 leading-relaxed">{lang === 'th' ? context.warnings?.[0]?.th : context.warnings?.[0]?.en}</p>}
      <p className="txt-dim text-[10px] mt-1">{lang === 'th' ? 'ข้อมูลเวลาช่วยอธิบายบริบทเท่านั้น ไม่เปลี่ยนค่าความน่าจะเป็นโรคของโมเดล' : 'Time adds context only and does not alter model disease probabilities.'}</p>
    </div>;
  }

  function CassavaPlantModel({ result }) {
    const { lang } = window.CG.Store.useStore();
    const [ageMonths, setAgeMonths] = useState(10);
    const [heightCm, setHeightCm] = useState(220);
    const [stemCount, setStemCount] = useState(1);
    const [yieldEstimate, setYieldEstimate] = useState(null);
    const [yieldBusy, setYieldBusy] = useState(false);
    const [yieldError, setYieldError] = useState('');
    const [refineOpen, setRefineOpen] = useState(false);
    const top = result.top3[0];
    const severity = result.severity?.level || (top.key === 'healthy' ? 'mild' : 'moderate');
    const health = Number(result.health_score?.score ?? Math.round((1 - top.confidence * 0.55) * 100));
    const affectedCount = top.key === 'healthy' ? 0 : { mild: 2, moderate: 4, severe: 7 }[severity] || 4;
    const diseaseLabel = lang === 'th' ? top.th : top.en;
    const maturity = Math.max(0.08, Math.min(1, (ageMonths - 3) / 9));
    const condition = health >= 80 ? 'good' : health >= 60 ? 'fair' : 'poor';

    useEffect(() => {
      if (!result.prediction_id) return undefined;
      let active = true;
      const timer = setTimeout(async () => {
        setYieldBusy(true); setYieldError('');
        try {
          const value = await window.CG.API_CLIENT.yieldEstimate({
            prediction_id: result.prediction_id,
            age_months: ageMonths,
            height_cm: heightCm,
            stem_count: stemCount,
          });
          if (active) setYieldEstimate(value);
        } catch (error) {
          if (active) setYieldError(error.message || 'Yield estimate unavailable');
        } finally {
          if (active) setYieldBusy(false);
        }
      }, 250);
      return () => { active = false; clearTimeout(timer); };
    }, [result.prediction_id, ageMonths, heightCm, stemCount]);

    const weight = yieldEstimate?.estimated_fresh_root_weight_kg_per_plant;
    const rootSize = yieldEstimate?.estimated_root_size;

    return (
      <Card className="animate-fadeup overflow-hidden cassava-model-card">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2"><span className="model-live-dot" /><h3 className="txt text-base font-bold">{lang === 'th' ? 'ประเมินขนาดและผลผลิต' : 'Size & yield estimate'}</h3></div>
            <p className="txt-dim text-xs mt-1">{lang === 'th' ? 'คำนวณอัตโนมัติจากผลวิเคราะห์ภาพล่าสุด' : 'Calculated automatically from the latest image result'}</p>
          </div>
          <Badge tone={top.key}>{diseaseLabel}</Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="model-stat"><span className="txt-soft">{lang === 'th' ? 'สุขภาพโดยประมาณ' : 'Estimated health'}</span><strong className="txt">{health}/100</strong><div className="model-meter"><span style={{ width: `${Math.max(0, Math.min(100, health))}%` }} /></div></div>
          <div className="model-stat model-weight"><span className="txt-soft">{lang === 'th' ? 'น้ำหนักหัวสดประมาณ/ต้น' : 'Estimated fresh root weight'}</span><strong className="txt">{yieldBusy && !weight ? <Spinner className="w-4 h-4" /> : weight ? `≈ ${weight.midpoint.toFixed(2)} kg` : '—'}</strong>{weight && <div className="weight-range col-span-2"><span style={{ left: `${Math.max(4, Math.min(88, weight.midpoint / weight.high * 100))}%` }} /><small>{weight.low.toFixed(2)}–{weight.high.toFixed(2)} kg</small></div>}</div>
          <div className="model-stat"><span className="txt-soft">{lang === 'th' ? 'ความสมบูรณ์ของต้น' : 'Plant condition'}</span><strong className={condition === 'good' ? 'text-emerald-500' : condition === 'fair' ? 'text-amber-500' : 'text-rose-500'}>{lang === 'th' ? { good: 'สมบูรณ์ดี', fair: 'ควรเฝ้าระวัง', poor: 'มีความเสี่ยง' }[condition] : { good: 'Good', fair: 'Monitor', poor: 'At risk' }[condition]}</strong></div>
          <div className="model-stat"><span className="txt-soft">{lang === 'th' ? 'ใบที่มีอาการโดยประมาณ' : 'Estimated affected leaves'}</span><strong className="txt">{affectedCount}/8</strong></div>
        </div>
        <div className="root-size-grid mt-3">
          <div><span>{lang === 'th' ? 'จำนวนหัว' : 'Root count'}</span><b>{rootSize ? `≈ ${rootSize.root_count}` : '—'}</b></div>
          <div><span>{lang === 'th' ? 'ความยาวเฉลี่ย' : 'Mean length'}</span><b>{rootSize ? `≈ ${rootSize.length_cm.midpoint.toFixed(1)} cm` : '—'}</b></div>
          <div><span>{lang === 'th' ? 'เส้นผ่านศูนย์กลาง' : 'Diameter'}</span><b>{rootSize ? `≈ ${rootSize.diameter_cm.midpoint.toFixed(1)} cm` : '—'}</b></div>
          <div><span>{lang === 'th' ? 'ระดับขนาด' : 'Size class'}</span><b>{rootSize ? (lang === 'th' ? { small: 'เล็ก', medium: 'ปานกลาง', large: 'ใหญ่' }[rootSize.size_class] : rootSize.size_class) : '—'}</b></div>
        </div>

        <button type="button" className="add-evidence-button mt-4" onClick={() => setRefineOpen((value) => !value)}><Icon name="cpu" className="w-4 h-4" />{lang === 'th' ? 'ปรับข้อมูลเพิ่มเติม (ไม่บังคับ)' : 'Refine optional inputs'}</button>
        {refineOpen && <div className="model-inputs mt-3">
          <label><span>{lang === 'th' ? 'อายุพืช' : 'Plant age'} <b>{ageMonths} {lang === 'th' ? 'เดือน' : 'months'}</b></span><input type="range" min="3" max="18" value={ageMonths} onChange={(event) => setAgeMonths(Number(event.target.value))} /></label>
          <label><span>{lang === 'th' ? 'ความสูงโดยประมาณ' : 'Approx. height'} <b>{heightCm} cm</b></span><input type="range" min="50" max="400" step="10" value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} /></label>
          <label><span>{lang === 'th' ? 'จำนวนลำต้น' : 'Stem count'} <b>{stemCount}</b></span><input type="range" min="1" max="6" value={stemCount} onChange={(event) => setStemCount(Number(event.target.value))} /></label>
        </div>}
        <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 p-3 mt-4">
          <strong className="txt text-sm">{lang === 'th' ? 'การประเมินผลผลิตแบบไม่ขุด' : 'Non-destructive yield estimate'}</strong>
          <p className="txt-soft text-xs mt-1">{lang === 'th' ? 'คำนวณจากภาพทั้งต้น อายุ ความสูง จำนวนลำต้น ผลโรค และข้อมูลแปลง ผลลัพธ์เป็นช่วงพยากรณ์ ไม่ใช่น้ำหนักที่วัดโดยตรง' : 'Uses the whole-plant image, age, height, stems, disease and field context. This is a prediction interval, not a direct weight measurement.'}</p>
        </div>
        <p className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs txt-soft leading-relaxed">{yieldError || (yieldEstimate ? (lang === 'th' ? `${yieldEstimate.disclaimer_th} จำนวนและขนาดหัวเป็นค่าจำลองจากอายุ ความสูง จำนวนลำต้น และผลวิเคราะห์โรค` : `${yieldEstimate.disclaimer_en} Root count and dimensions are scenarios based on age, height, stem count and disease result.`) : (lang === 'th' ? 'กำลังคำนวณช่วงจากข้อมูลที่กรอก' : 'Calculating a range from the supplied observations'))}</p>
      </Card>
    );
  }

  function CsvResult({ r, onRetake }) {
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
        <button onClick={onRetake} className="w-full mt-4 glass rounded-xl py-2.5 flex items-center justify-center gap-2 txt-soft hover:txt transition text-sm font-medium">
          <Icon name="history" className="w-4 h-4" />{lang === 'th' ? 'ถ่ายใหม่' : 'Retake'}
        </button>
      </Card>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Predict = PredictPage;
})();
