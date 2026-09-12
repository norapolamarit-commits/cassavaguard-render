import * as THREE from 'three';

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
    const [fields, setFields] = useState([]);
    const [fieldId, setFieldId] = useState('');
    const [drag, setDrag] = useState(false);
    const [camOpen, setCamOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const inputRef = useRef(null);
    const plantInputRef = useRef(null);
    const uploaderRef = useRef(null);

    useEffect(() => { window.CG.API_CLIENT.fields().then(setFields).catch(() => {}); }, []);

    const pick = (f) => {
      if (!f) return;
      setFile(f); setResult(null);
      if (f.type.startsWith('image/')) { const url = URL.createObjectURL(f); setPreview(url); }
      else setPreview(null);
    };

    const retake = () => {
      setFile(null); setPreview(null); setPlantFile(null); setPlantPreview(null); setResult(null);
      uploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const openAdvancedForField = () => {
      setAdvancedOpen(true);
      uploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const run = async () => {
      if (!file) { toast(lang === 'th' ? 'กรุณาเลือกไฟล์' : 'Please choose a file', 'warn'); return; }
      const isCsv = source === 'csv' || file.name.toLowerCase().endsWith('.csv');
      setBusy(true); setResult(null);
      try {
        const r = isCsv ? await window.CG.API_CLIENT.predictCsv(file, fieldId || null)
                        : plantFile
                          ? await window.CG.API_CLIENT.predictImages([
                              { file, source }, { file: plantFile, source: 'plant' },
                            ], fieldId || null)
                          : await window.CG.API_CLIENT.predictImage(file, source, fieldId || null);
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

    return (
      <div className="space-y-6 max-w-6xl mx-auto diagnosis-workspace">
        <section className="diagnosis-intro animate-fadeup">
          <div>
            <span className="diagnosis-kicker"><Icon name="leaf" className="w-4 h-4" /> CASSAVAGUARD VISION</span>
            <h1 className="txt">{lang === 'th' ? 'ตรวจสุขภาพมันสำปะหลังจากภาพเดียว' : 'Understand cassava health from one photo'}</h1>
            <p className="txt-soft">{lang === 'th' ? 'ถ่ายภาพทั้งต้นที่ยังอยู่ในแปลง ระบบจะวิเคราะห์สุขภาพและประเมินช่วงผลผลิตโดยไม่ต้องขุดหัว' : 'Photograph the standing plant to analyze health and estimate a non-destructive yield range.'}</p>
          </div>
          <div className="diagnosis-trust"><span><Icon name="check" className="w-4 h-4" />{lang === 'th' ? 'ไม่ต้องเข้าสู่ระบบ' : 'No sign-in'}</span><span><Icon name="cpu" className="w-4 h-4" />{lang === 'th' ? 'โมเดล 5 คลาส' : '5-class model'}</span></div>
        </section>

        <ol className="workflow-steps" aria-label={lang === 'th' ? 'ขั้นตอนการวิเคราะห์' : 'Analysis steps'}>
          {[
            [1, 'camera', lang === 'th' ? 'เลือกรูป' : 'Add photo'],
            [2, 'brain', lang === 'th' ? 'ประมวลผลอัตโนมัติ' : 'Auto analyze'],
            [3, 'leaf', lang === 'th' ? 'ดูผลและ 3D' : 'Result & 3D'],
          ].map(([number, icon, text]) => <li key={number} className={workflowStep >= number ? 'active' : ''}><span><Icon name={icon} className="w-4 h-4" /></span><b>{text}</b>{number < 3 && <i />}</li>)}
        </ol>

        <div className="diagnosis-tip">
          <Icon name="camera" className="w-5 h-5" />
          <span>{lang === 'th' ? 'เคล็ดลับ: ถ่ายให้เห็นทั้งต้นตั้งแต่โคนถึงยอด มีวัตถุเทียบขนาด และหลีกเลี่ยงย้อนแสง' : 'Tip: Show the whole plant from base to canopy, include a scale reference, and avoid backlight.'}</span>
        </div>

        <div className={`grid gap-4 ${result || busy ? 'lg:grid-cols-5' : ''}`}>
          {/* uploader */}
          <Card className={`${result || busy ? 'lg:col-span-2' : 'max-w-3xl w-full mx-auto'} animate-fadeup capture-card`}>
            <div ref={uploaderRef}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="txt font-bold text-lg">{file ? (lang === 'th' ? 'ตรวจสอบรูปภาพ' : 'Check your photo') : (lang === 'th' ? 'เลือกรูปเพื่อเริ่ม' : 'Choose a photo to begin')}</div>
                <div className="txt-dim text-sm mt-0.5">{lang === 'th' ? 'JPG หรือ PNG • ใช้ภาพต้นฉบับที่ไม่ผ่านฟิลเตอร์' : 'JPG or PNG • use an original, unfiltered photo'}</div>
              </div>
              <Badge tone="green">1 {lang === 'th' ? 'รูป' : 'photo'}</Badge>
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
                  {source !== 'csv' && <div>
                    <label className="txt-dim text-xs">{lang === 'th' ? 'แปลงปลูก (ไม่บังคับ)' : 'Field (optional)'}</label>
                    <select value={fieldId} onChange={(e) => setFieldId(e.target.value)}
                            className="w-full mt-1 glass rounded-xl px-3 py-2.5 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40">
                      <option value="" className="bg-ink-800">— {lang === 'th' ? 'วิเคราะห์จากรูปเท่านั้น' : 'Photo analysis only'} —</option>
                      {fields.map((f) => <option key={f.id} value={f.id} className="bg-ink-800">{lang === 'th' ? f.name_th || f.name : f.name}</option>)}
                    </select>
                    <p className="txt-dim text-xs mt-1.5">{lang === 'th' ? 'เลือกเมื่อต้องการเสริมผลด้วยอากาศ ภูมิประเทศ และดาวเทียม' : 'Select to add weather, terrain, and satellite context.'}</p>
                  </div>}
                  {source === 'csv' && <div>
                    <label className="txt-dim text-xs">{t('select_field')}</label>
                    <select value={fieldId} onChange={(e) => setFieldId(e.target.value)}
                            className="w-full mt-1 glass rounded-xl px-3 py-2 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40">
                      <option value="" className="bg-ink-800">— {t('all_fields')} —</option>
                      {fields.map((f) => <option key={f.id} value={f.id} className="bg-ink-800">{lang === 'th' ? f.name_th || f.name : f.name}</option>)}
                    </select>
                  </div>}
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
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3">
                <div className="font-semibold text-rose-300 flex items-center gap-1"><Icon name="close" className="w-3.5 h-3.5" />{lang === 'th' ? 'ควรถ่ายใหม่' : 'Retake'}</div>
                <div className="txt-soft mt-1 leading-relaxed">{lang === 'th' ? 'ภาพสั่น ย้อนแสง ใบเล็ก พื้นหลังรก เปียกน้ำ หรือผ่านฟิลเตอร์สี' : 'Blur, backlight, tiny leaf, clutter, wet leaf, or color filters.'}</div>
              </div>
            </div>}
            </div>
          </Card>

          {/* results */}
          {(result || busy) && <div className="lg:col-span-3 space-y-4">
            {busy && <AnalyzingSkeleton />}
            {!busy && !result && <Card className="min-h-[300px] grid place-items-center animate-fadeup"><Empty icon="brain" text={lang === 'th' ? 'อัปโหลดไฟล์เพื่อเริ่มการวิเคราะห์' : 'Upload a file to begin analysis'} /></Card>}
            {!busy && result && (result.source === 'csv'
              ? <CsvResult r={result} onRetake={retake} />
              : <ImageResult r={result} preview={preview} fieldId={fieldId} onRetake={retake} onOpenAdvanced={openAdvancedForField} />)}
          </div>}
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

  function ImageResult({ r, preview, fieldId, onRetake, onOpenAdvanced }) {
    const { t, lang } = window.CG.Store.useStore();
    const top = r.top3[0];
    const [visualMode, setVisualMode] = useState('heat');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const whiteflyFinding = r.auxiliary_findings?.find((item) => item.key === 'whitefly');
    const [multimodal, setMultimodal] = useState(fieldId ? undefined : null);
    const displayedRecs = multimodal?.recommendations;

    useEffect(() => {
      if (!fieldId || !r.prediction_id) { setMultimodal(null); return; }
      let cancelled = false;
      setMultimodal(undefined);
      window.CG.API_CLIENT.predictionContext(r.prediction_id)
        .then((d) => { if (!cancelled) setMultimodal(d); })
        .catch((error) => { if (!cancelled) setMultimodal({ evidence: [], recommendations: [], partial: true, errors: [{ source: 'environment', error: error.message }] }); });
      return () => { cancelled = true; };
    }, [fieldId, r.prediction_id]);

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
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-xs leading-relaxed">
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
            {!fieldId ? (
              <button onClick={onOpenAdvanced} className="text-brand-300 hover:text-brand-200 text-xs font-medium flex items-center gap-1.5 transition">
                {lang === 'th' ? 'เลือกแปลงเพื่อรับคำแนะนำเฉพาะเจาะจง' : 'Attach a field for tailored recommendations'} <span aria-hidden="true">→</span>
              </button>
            ) : multimodal === undefined ? (
              <div className="flex items-center gap-2 txt-dim text-xs"><Spinner className="w-4 h-4" />{lang === 'th' ? 'ผล AI พร้อมแล้ว · กำลังโหลดอากาศ ภูมิประเทศ และดาวเทียมเบื้องหลัง...' : 'AI result ready · loading weather, terrain and satellite evidence in the background...'}</div>
            ) : displayedRecs && displayedRecs.length > 0 ? (
              <ul className="space-y-2">
                {displayedRecs.slice(0, 2).map((rec, i) => (
                  <li key={i} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="txt font-semibold">{lang === 'th' ? rec.title_th : rec.title_en}</span>
                      <Badge tone={rec.severity}>{Math.round(rec.confidence * 100)}%</Badge>
                    </div>
                    {(lang === 'th' ? rec.actions_th : rec.actions_en)?.[0] && (
                      <div className="txt-soft mt-0.5 flex items-start gap-1.5">
                        <Icon name="check" className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
                        {(lang === 'th' ? rec.actions_th : rec.actions_en)[0]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="txt-dim text-xs">{lang === 'th' ? 'ยังไม่มีคำแนะนำสำหรับแปลงนี้ในขณะนี้' : 'No recommendations for this field right now.'}</p>
            )}
          </div>

          {multimodal && <div className="mt-3 rounded-xl border border-cyan-500/25 bg-cyan-500/[.07] p-3">
            <div className="txt text-xs font-semibold flex items-center gap-1.5"><Icon name="map" className="w-4 h-4 text-cyan-300" />{lang === 'th' ? 'หลักฐานประกอบจากแปลง' : 'Field evidence used'}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {multimodal.evidence.map((item) => {
                const labels = {
                  weather: lang === 'th' ? 'สภาพอากาศ' : 'Weather',
                  terrain: lang === 'th' ? 'ภูมิประเทศ' : 'Terrain',
                  satellite: lang === 'th' ? 'ดาวเทียม' : 'Satellite',
                };
                const value = item.source === 'weather'
                  ? `${item.summary?.rain_7d_mm ?? '—'} mm/7d`
                  : item.source === 'terrain'
                    ? `${item.elevation_m ?? '—'} m`
                    : `NDVI ${item.summary?.ndvi ?? '—'}`;
                return <div key={item.source} className="glass rounded-lg p-2"><div className="txt-dim text-[10px]">{labels[item.source]}</div><div className={`text-xs font-semibold mt-0.5 ${item.available ? 'txt' : 'text-amber-300'}`}>{value}</div></div>;
              })}
            </div>
            <p className="txt-dim text-[10px] mt-2 leading-relaxed">{lang === 'th' ? multimodal.disclaimer_th : multimodal.disclaimer_en}</p>
          </div>}

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
        </>}
      </>
    );
  }

  function CassavaPlantModel({ result }) {
    const { lang } = window.CG.Store.useStore();
    const [ageMonths, setAgeMonths] = useState(10);
    const [heightCm, setHeightCm] = useState(220);
    const [stemCount, setStemCount] = useState(1);
    const [yieldEstimate, setYieldEstimate] = useState(null);
    const [yieldBusy, setYieldBusy] = useState(false);
    const [yieldError, setYieldError] = useState('');
    const [measurementOpen, setMeasurementOpen] = useState(false);
    const [measurementBusy, setMeasurementBusy] = useState(false);
    const [measurementSaved, setMeasurementSaved] = useState(null);
    const [measuredTotal, setMeasuredTotal] = useState('');
    const [measuredPlants, setMeasuredPlants] = useState('1');
    const [measurementNotes, setMeasurementNotes] = useState('');
    const [measurementVariety, setMeasurementVariety] = useState('KU50');
    const [measurementField, setMeasurementField] = useState('');
    const [measurementSeason, setMeasurementSeason] = useState('');
    const [measurementRootPhotos, setMeasurementRootPhotos] = useState([]);
    const [measurementLocation, setMeasurementLocation] = useState(null);
    const [referenceSpan, setReferenceSpan] = useState('');
    const [reconstruction, setReconstruction] = useState(null);
    const [rootVideo, setRootVideo] = useState(null);
    const [rootValidationOpen, setRootValidationOpen] = useState(false);
    const [refineOpen, setRefineOpen] = useState(false);
    const [rootPhoto, setRootPhoto] = useState(null);
    const [rootView, setRootView] = useState('side');
    const [rootAnalysis, setRootAnalysis] = useState(null);
    const [rootBusy, setRootBusy] = useState(false);
    const [rootError, setRootError] = useState('');
    const [rootVolume, setRootVolume] = useState('');
    const [rootPlantCount, setRootPlantCount] = useState('1');
    const [rootWeight, setRootWeight] = useState(null);
    const [rootWeightBusy, setRootWeightBusy] = useState(false);
    const [rootWeightError, setRootWeightError] = useState('');
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
    const visualWeight = Number(rootWeight?.estimated_fresh_root_weight_kg_per_plant?.midpoint || weight?.midpoint || 2.5);
    const measuredVolumeScale = rootWeight ? Math.cbrt(Number(rootVolume) / 4000) : 1;
    const rootAbundance = Math.max(0.28, Math.min(1.6, visualWeight / 4.2));
    const estimatedRootCount = Number(rootSize?.root_count || Math.round(4 + maturity * 3));
    const rootLength = Number(rootSize?.length_cm?.midpoint || 28) * measuredVolumeScale;
    const rootDiameter = Number(rootSize?.diameter_cm?.midpoint || 5) * measuredVolumeScale;
    const analyzeRoot = async () => {
      if (!rootPhoto) return;
      setRootBusy(true); setRootError(''); setRootAnalysis(null);
      try { setRootAnalysis(await window.CG.API_CLIENT.rootSize(rootPhoto, rootView)); }
      catch (error) { setRootError(error.message || 'Root analysis unavailable'); }
      finally { setRootBusy(false); }
    };
    const analyzeRootWeight = async (event) => {
      event.preventDefault();
      setRootWeightBusy(true); setRootWeightError(''); setRootWeight(null);
      try {
        setRootWeight(await window.CG.API_CLIENT.rootWeight({
          volume_cm3_per_plant: Number(rootVolume),
          plant_count: Number(rootPlantCount),
        }));
      } catch (error) { setRootWeightError(error.message || 'Root-weight analysis unavailable'); }
      finally { setRootWeightBusy(false); }
    };
    const runReconstruction = async (imageSet) => {
      let job = await window.CG.API_CLIENT.startRootReconstruction({ set_id: imageSet.set_id, reference_span_cm: Number(referenceSpan) });
      setReconstruction({ ...job, extractedFrames: imageSet.view_count, videoQuality: imageSet.quality });
      while (!['complete', 'failed'].includes(job.status)) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        job = await window.CG.API_CLIENT.rootReconstructionStatus(job.job_id);
        setReconstruction((old) => ({ ...job, extractedFrames: old?.extractedFrames, videoQuality: old?.videoQuality }));
      }
      if (job.status === 'failed') throw new Error(job.error);
      setRootVolume(String(Math.round(job.result.volume_cm3)));
      setRootWeight(job.result.weight);
    };
    const reconstructRoot = async () => {
      setRootWeightError(''); setReconstruction({ status: 'uploading', progress: 0 });
      try {
        const imageSet = await window.CG.API_CLIENT.saveRootImageSet(measurementRootPhotos);
        await runReconstruction(imageSet);
      } catch (error) { setRootWeightError(error.message || '3-D reconstruction failed'); setReconstruction((old) => ({ ...old, status: 'failed' })); }
    };
    const reconstructVideo = async () => {
      setRootWeightError(''); setReconstruction({ status: 'extracting_video', progress: 0 });
      try { await runReconstruction(await window.CG.API_CLIENT.saveRootVideoSet(rootVideo)); }
      catch (error) { setRootWeightError(error.message || 'Video reconstruction failed'); setReconstruction((old) => ({ ...old, status: 'failed' })); }
    };
    const saveMeasurement = async (event) => {
      event.preventDefault();
      setMeasurementBusy(true);
      try {
        const rootSet = measurementRootPhotos.length >= 3
          ? await window.CG.API_CLIENT.saveRootImageSet(measurementRootPhotos)
          : { images: [] };
        const saved = await window.CG.API_CLIENT.saveHarvestMeasurement({
          prediction_id: result.prediction_id,
          age_months: ageMonths,
          height_cm: heightCm,
          stem_count: stemCount,
          variety: measurementVariety,
          field_code: measurementField,
          season: measurementSeason,
          latitude: measurementLocation?.latitude ?? null,
          longitude: measurementLocation?.longitude ?? null,
          root_volume_cm3_per_plant: rootVolume ? Number(rootVolume) : null,
          root_images: rootSet.images,
          total_fresh_root_weight_kg: Number(measuredTotal),
          harvested_plant_count: Number(measuredPlants),
          notes: measurementNotes,
        });
        setMeasurementSaved(saved);
      } catch (error) {
        setMeasurementSaved({ error: error.message || 'Unable to save measurement' });
      } finally {
        setMeasurementBusy(false);
      }
    };

    return (
      <Card className="animate-fadeup overflow-hidden cassava-model-card">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2"><span className="model-live-dot" /><h3 className="txt text-base font-bold">{lang === 'th' ? 'แบบจำลองต้นมันสำปะหลัง' : 'Cassava plant model'}</h3></div>
            <p className="txt-dim text-xs mt-1">{lang === 'th' ? 'สร้างอัตโนมัติจากผลวิเคราะห์ภาพล่าสุด' : 'Generated automatically from the latest image result'}</p>
          </div>
          <Badge tone={top.key}>{diseaseLabel}</Badge>
        </div>

        <div className="grid sm:grid-cols-[minmax(250px,1fr)_minmax(190px,.75fr)] gap-4 items-center">
          <div className="plant-stage" role="img" aria-label={lang === 'th' ? `แบบจำลองสามมิติต้นมันสำปะหลัง ผล ${diseaseLabel}` : `3D cassava plant simulation showing ${diseaseLabel}`}>
            <Cassava3DCanvas disease={top.key} affectedCount={affectedCount} severity={severity} maturity={maturity} health={health} stemCount={stemCount} rootAbundance={rootAbundance} rootCount={estimatedRootCount} rootLength={rootLength} rootDiameter={rootDiameter} />
            <div className="plant-3d-badge">3D LIVE • {lang === 'th' ? 'ลากหมุน • เลื่อนซูม' : 'drag to rotate • scroll to zoom'}</div>
            <div className="plant-stage-legend"><span><i className="legend-leaf" />{lang === 'th' ? 'ทรงพุ่ม' : 'Canopy'}</span><span><i className="legend-root" />{lang === 'th' ? 'หัวใต้ดินจำลอง' : 'Simulated roots'}</span></div>
            <div className="plant-stage-caption">{lang === 'th' ? 'ภาพจำลองตามสถานการณ์ • ไม่ใช่การสแกนโครงสร้างจริง' : 'Scenario visualization • not an actual structural scan'}</div>
          </div>

          <div className="space-y-3">
            <div className="model-stat"><span className="txt-soft">{lang === 'th' ? 'สุขภาพโดยประมาณ' : 'Estimated health'}</span><strong className="txt">{health}/100</strong><div className="model-meter"><span style={{ width: `${Math.max(0, Math.min(100, health))}%` }} /></div></div>
            <div className="model-stat model-weight"><span className="txt-soft">{lang === 'th' ? 'น้ำหนักหัวสดประมาณ/ต้น' : 'Estimated fresh root weight'}</span><strong className="txt">{yieldBusy && !weight ? <Spinner className="w-4 h-4" /> : weight ? `≈ ${weight.midpoint.toFixed(2)} kg` : '—'}</strong>{weight && <div className="weight-range col-span-2"><span style={{ left: `${Math.max(4, Math.min(88, weight.midpoint / weight.high * 100))}%` }} /><small>{weight.low.toFixed(2)}–{weight.high.toFixed(2)} kg</small></div>}</div>
            <div className="root-size-grid">
              <div><span>{lang === 'th' ? 'จำนวนหัว' : 'Root count'}</span><b>{rootSize ? `≈ ${rootSize.root_count}` : '—'}</b></div>
              <div><span>{lang === 'th' ? 'ความยาวเฉลี่ย' : 'Mean length'}</span><b>{rootSize ? `≈ ${rootSize.length_cm.midpoint.toFixed(1)} cm` : '—'}</b></div>
              <div><span>{lang === 'th' ? 'เส้นผ่านศูนย์กลาง' : 'Diameter'}</span><b>{rootSize ? `≈ ${rootSize.diameter_cm.midpoint.toFixed(1)} cm` : '—'}</b></div>
              <div><span>{lang === 'th' ? 'ระดับขนาด' : 'Size class'}</span><b>{rootSize ? (lang === 'th' ? { small: 'เล็ก', medium: 'ปานกลาง', large: 'ใหญ่' }[rootSize.size_class] : rootSize.size_class) : '—'}</b></div>
            </div>
            <div className="model-stat"><span className="txt-soft">{lang === 'th' ? 'ความสมบูรณ์ของต้น' : 'Plant condition'}</span><strong className={condition === 'good' ? 'text-emerald-500' : condition === 'fair' ? 'text-amber-500' : 'text-rose-500'}>{lang === 'th' ? { good: 'สมบูรณ์ดี', fair: 'ควรเฝ้าระวัง', poor: 'มีความเสี่ยง' }[condition] : { good: 'Good', fair: 'Monitor', poor: 'At risk' }[condition]}</strong></div>
            <div className="model-stat"><span className="txt-soft">{lang === 'th' ? 'ใบที่แสดงอาการในแบบจำลอง' : 'Affected leaves in model'}</span><strong className="txt">{affectedCount}/8</strong></div>
          </div>
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
        <button type="button" className="add-evidence-button mt-3" onClick={() => setRootValidationOpen((value) => !value)}><Icon name="check" className="w-4 h-4" />{lang === 'th' ? 'โหมดตรวจสอบด้วยการขุดและ 3D (ไม่บังคับ)' : 'Optional harvest/3-D validation mode'}</button>
        {rootValidationOpen && <>
        <div className="root-ml-panel mt-4">
          <div>
            <strong className="txt">{lang === 'th' ? 'วิเคราะห์ขนาดรากด้วย ML จริง' : 'Real ML root-size analysis'}</strong>
            <p className="txt-dim text-xs mt-1">{lang === 'th' ? 'ใช้ภาพหัวที่ขุดแล้วบนพื้นหลังสีดำ มีวงกลมอ้างอิง 2 นิ้ว' : 'Use an excavated-root photo on black cloth with a 2-inch reference disk.'}</p>
          </div>
          <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 mt-3">
            <input type="file" accept="image/*" onChange={(event) => { setRootPhoto(event.target.files[0] || null); setRootAnalysis(null); }} />
            <select value={rootView} onChange={(event) => setRootView(event.target.value)}><option value="side">{lang === 'th' ? 'มุมด้านข้าง' : 'Side view'}</option><option value="top">{lang === 'th' ? 'มุมด้านบน' : 'Top view'}</option></select>
            <button type="button" className="primary-action px-4" disabled={!rootPhoto || rootBusy} onClick={analyzeRoot}>{rootBusy ? <Spinner className="w-4 h-4" /> : <Icon name="brain" className="w-4 h-4" />}{lang === 'th' ? 'วิเคราะห์ราก' : 'Analyze roots'}</button>
          </div>
          {rootError && <p className="text-rose-500 text-xs mt-2">{rootError}</p>}
          {rootAnalysis && <div className="root-ml-results mt-3">
            {Object.entries(rootAnalysis.measurements).map(([key, value]) => <div key={key}><span>{key}</span><b>{Number(value).toLocaleString()}</b></div>)}
            <p>{lang === 'th' ? `โมเดล ${rootAnalysis.model_id} • ฝึก ${rootAnalysis.training_samples} ภาพ • ผลเป็นหน่วย DIRT` : `${rootAnalysis.model_id} • ${rootAnalysis.training_samples} training images • DIRT units`}</p>
          </div>}
        </div>
        <form className="root-ml-panel mt-4" onSubmit={analyzeRootWeight}>
          <div>
            <strong className="txt">{lang === 'th' ? 'วิเคราะห์น้ำหนักผลผลิตด้วย ML' : 'ML fresh-root weight analysis'}</strong>
            <p className="txt-dim text-xs mt-1">{lang === 'th' ? 'กรอกปริมาตรรากสดต่อต้นหลังขุด วัดด้วยถังล้น/การแทนที่น้ำ หรือแบบจำลอง 3D หลายมุม' : 'Enter excavated fresh-root volume per plant measured by water displacement or multi-view 3-D reconstruction.'}</p>
          </div>
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 mt-3">
            <label><span>{lang === 'th' ? 'ปริมาตรราก/ต้น (ซม.³)' : 'Root volume/plant (cm³)'}</span><input type="number" min="200" max="20000" step="1" required placeholder="เช่น 4000" value={rootVolume} onChange={(event) => setRootVolume(event.target.value)} /></label>
            <label><span>{lang === 'th' ? 'จำนวนต้น' : 'Plant count'}</span><input type="number" min="1" max="1000" step="1" required value={rootPlantCount} onChange={(event) => setRootPlantCount(event.target.value)} /></label>
            <button type="submit" className="primary-action px-4 self-end" disabled={rootWeightBusy || !rootVolume}>{rootWeightBusy ? <Spinner className="w-4 h-4" /> : <Icon name="brain" className="w-4 h-4" />}{lang === 'th' ? 'คำนวณน้ำหนัก' : 'Estimate weight'}</button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <strong className="txt text-sm">{lang === 'th' ? 'สร้างปริมาตร 3D อัตโนมัติจากภาพหลายมุม' : 'Automatic multi-view 3-D volume'}</strong>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mt-2">
              <b className="txt text-sm">{lang === 'th' ? 'แนะนำ: อัปโหลดวิดีโอเดินรอบหัวมัน' : 'Recommended: upload an orbit video'}</b>
              <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2 mt-2">
                <input type="file" accept="video/mp4,video/quicktime,video/webm,.m4v" onChange={(event) => setRootVideo(event.target.files?.[0] || null)} />
                <label><span>{lang === 'th' ? 'ความกว้างจริงสูงสุด (ซม.)' : 'Measured max span (cm)'}</span><input type="number" min="5" max="300" step="0.1" value={referenceSpan} onChange={(event) => setReferenceSpan(event.target.value)} /></label>
                <button type="button" className="primary-action px-4 self-end" disabled={!rootVideo || !referenceSpan || (reconstruction && !['complete', 'failed'].includes(reconstruction.status))} onClick={reconstructVideo}><Icon name="play" className="w-4 h-4" />{lang === 'th' ? 'วิดีโอ → 3D' : 'Video → 3-D'}</button>
              </div>
              <p className="txt-dim text-xs mt-2">{lang === 'th' ? 'รองรับ MP4/MOV/WebM สูงสุด 250 MB ความยาว 4–90 วินาที ระบบคัดเฟรมคมและไม่ซ้ำให้อัตโนมัติ' : 'MP4/MOV/WebM up to 250 MB, 4–90 seconds. Sharp, non-duplicate frames are selected automatically.'}</p>
            </div>
            <p className="txt-dim text-xs mt-3">{lang === 'th' ? 'หรือเลือกภาพหลายมุมเอง' : 'Or select multiple photos manually'}</p>
            <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2 mt-2">
              <input type="file" accept="image/*" multiple onChange={(event) => setMeasurementRootPhotos(Array.from(event.target.files || []))} />
              <label><span>{lang === 'th' ? 'ความกว้างจริงสูงสุด (ซม.)' : 'Measured max span (cm)'}</span><input type="number" min="5" max="300" step="0.1" value={referenceSpan} onChange={(event) => setReferenceSpan(event.target.value)} /></label>
              <button type="button" className="primary-action px-4 self-end" disabled={measurementRootPhotos.length < 12 || !referenceSpan || (reconstruction && !['complete', 'failed'].includes(reconstruction.status))} onClick={reconstructRoot}><Icon name="cube" className="w-4 h-4" />{lang === 'th' ? 'สร้าง 3D' : 'Build 3-D'}</button>
            </div>
            <p className="txt-dim text-xs mt-2">{lang === 'th' ? `เลือกอย่างน้อย 12 ภาพ (แนะนำ 20–30) เดินถ่ายรอบหัวให้ภาพซ้อนกัน 70–80% • เลือกแล้ว ${measurementRootPhotos.length} ภาพ` : `Use at least 12 views (20–30 recommended) with 70–80% overlap • ${measurementRootPhotos.length} selected`}</p>
            {reconstruction && <div className="model-meter mt-2"><span style={{ width: `${reconstruction.progress || 0}%` }} /></div>}
            {reconstruction && <p className="text-xs txt-soft mt-1">{reconstruction.status} {reconstruction.stage ? `• ${reconstruction.stage}` : ''} • {reconstruction.progress || 0}%</p>}
            {reconstruction?.extractedFrames && <p className="text-xs text-emerald-500 mt-1">{lang === 'th' ? `คัดจากวิดีโอแล้ว ${reconstruction.extractedFrames} เฟรม` : `${reconstruction.extractedFrames} video frames selected`}</p>}
          </div>
          {rootWeightError && <p className="text-rose-500 text-xs mt-2">{rootWeightError}</p>}
          {rootWeight && <div className="root-ml-results mt-3">
            <div><span>{lang === 'th' ? 'น้ำหนักสด/ต้น' : 'Fresh weight/plant'}</span><b>{rootWeight.estimated_fresh_root_weight_kg_per_plant.midpoint.toFixed(2)} kg</b></div>
            <div><span>{lang === 'th' ? 'ช่วงคาดการณ์ 95%' : '95% prediction range'}</span><b>{rootWeight.estimated_fresh_root_weight_kg_per_plant.low.toFixed(2)}–{rootWeight.estimated_fresh_root_weight_kg_per_plant.high.toFixed(2)} kg</b></div>
            <div><span>{lang === 'th' ? 'น้ำหนักรวม' : 'Total weight'}</span><b>{rootWeight.estimated_total_weight_kg.midpoint.toFixed(2)} kg</b></div>
            <p>{lang === 'th' ? `ข้อมูลชั่งจริง ${rootWeight.model.samples} ตัวอย่าง / ${rootWeight.model.cultivars} พันธุ์ • ทดสอบแบบเว้นทีละพันธุ์: R² ${rootWeight.model.r2.toFixed(3)}, MAE ${rootWeight.model.mae_kg.toFixed(2)} กก. • ${rootWeight.in_training_domain ? 'อยู่ในช่วงข้อมูลฝึก' : 'อยู่นอกช่วงข้อมูลฝึก—ช่วงถูกขยาย'}` : `${rootWeight.model.samples} weighed samples / ${rootWeight.model.cultivars} cultivars • leave-one-cultivar-out R² ${rootWeight.model.r2.toFixed(3)}, MAE ${rootWeight.model.mae_kg.toFixed(2)} kg • ${rootWeight.in_training_domain ? 'within training range' : 'outside training range—interval widened'}`}</p>
          </div>}
          <p className="text-xs txt-soft mt-3">{lang === 'th' ? 'สำคัญ: ภาพใบใช้บอกโรค แต่ไม่เห็นหัวใต้ดิน จึงต้องวัดปริมาตรรากหลังขุด ระบบนี้ยังเป็นงานทดลองและไม่ใช้แทนการชั่งซื้อขาย' : 'Important: a leaf photo cannot reveal underground roots. Measure excavated-root volume. This experimental model does not replace trade weighing.'}</p>
        </form>
        </>}
        <p className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs txt-soft leading-relaxed">{yieldError || (yieldEstimate ? (lang === 'th' ? `${yieldEstimate.disclaimer_th} จำนวนและขนาดหัวเป็นค่าจำลองจากอายุ ความสูง จำนวนลำต้น และผลวิเคราะห์โรค` : `${yieldEstimate.disclaimer_en} Root count and dimensions are scenarios based on age, height, stem count and disease result.`) : (lang === 'th' ? 'กำลังคำนวณช่วงจากข้อมูลที่กรอก' : 'Calculating a range from the supplied observations'))}</p>
        <button type="button" onClick={() => setMeasurementOpen((value) => !value)} className="add-evidence-button mt-3" aria-expanded={measurementOpen}>
          <Icon name="check" className="w-4 h-4" />
          {lang === 'th' ? 'บันทึกน้ำหนักที่ขุดชั่งจริงเพื่อพัฒนาโมเดล' : 'Record an actual harvest weight to improve the model'}
        </button>
        {measurementOpen && (
          <form onSubmit={saveMeasurement} className="harvest-form mt-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <label><span>{lang === 'th' ? 'น้ำหนักหัวสดรวม (กก.)' : 'Total fresh-root weight (kg)'}</span><input type="number" min="0.02" max="2000" step="0.01" required value={measuredTotal} onChange={(event) => setMeasuredTotal(event.target.value)} /></label>
              <label><span>{lang === 'th' ? 'จำนวนต้นที่ขุดชั่ง' : 'Number of harvested plants'}</span><input type="number" min="1" max="1000" step="1" required value={measuredPlants} onChange={(event) => setMeasuredPlants(event.target.value)} /></label>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-3">
              <label><span>{lang === 'th' ? 'พันธุ์มันสำปะหลัง' : 'Variety'}</span><input required value={measurementVariety} onChange={(event) => setMeasurementVariety(event.target.value)} /></label>
              <label><span>{lang === 'th' ? 'รหัสแปลง' : 'Field code'}</span><input required value={measurementField} onChange={(event) => setMeasurementField(event.target.value)} placeholder="FIELD-001" /></label>
              <label><span>{lang === 'th' ? 'ฤดู/รอบปลูก' : 'Season'}</span><input required value={measurementSeason} onChange={(event) => setMeasurementSeason(event.target.value)} placeholder="2026-rainy" /></label>
            </div>
            <label className="mt-3"><span>{lang === 'th' ? 'ภาพรากหลายมุม (อย่างน้อย 3; แนะนำ 20–30 ภาพ)' : 'Multi-view root photos (minimum 3; recommended 20–30)'}</span><input type="file" accept="image/*" multiple required onChange={(event) => setMeasurementRootPhotos(Array.from(event.target.files || []))} /></label>
            <button type="button" className="add-evidence-button mt-3" onClick={() => navigator.geolocation?.getCurrentPosition((position) => setMeasurementLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }))}><Icon name="map" className="w-4 h-4" />{measurementLocation ? `${measurementLocation.latitude.toFixed(5)}, ${measurementLocation.longitude.toFixed(5)}` : (lang === 'th' ? 'แนบพิกัดแปลง (สมัครใจ)' : 'Attach field coordinates (optional)')}</button>
            <label className="mt-3"><span>{lang === 'th' ? 'หมายเหตุการเก็บตัวอย่าง (ถ้ามี)' : 'Sampling notes (optional)'}</span><textarea rows="2" maxLength="1000" value={measurementNotes} onChange={(event) => setMeasurementNotes(event.target.value)} /></label>
            {measurementSaved && <p className={`text-sm mt-3 ${measurementSaved.error ? 'text-rose-400' : 'text-emerald-500'}`}>{measurementSaved.error || (lang === 'th' ? `บันทึกแล้ว: ${measurementSaved.weight_kg_per_plant} กก./ต้น` : `Saved: ${measurementSaved.weight_kg_per_plant} kg/plant`)}</p>}
            <button className="primary-action w-full mt-3" disabled={measurementBusy || Boolean(measurementSaved && !measurementSaved.error)}>{measurementBusy ? <Spinner className="w-4 h-4" /> : <Icon name="check" className="w-4 h-4" />}{lang === 'th' ? 'บันทึกค่าที่วัดจริง' : 'Save measured value'}</button>
          </form>
        )}
      </Card>
    );
  }

  function Cassava3DCanvas({ disease, affectedCount, severity, maturity, health, stemCount, rootAbundance, rootCount, rootLength, rootDiameter }) {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch (_error) {
        canvas.dataset.webglUnavailable = 'true';
        return undefined;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0.15, 2.45, 7.6);
      camera.lookAt(0, 1.05, 0);
      scene.fog = new THREE.FogExp2(0x071b22, 0.045);
      scene.add(new THREE.HemisphereLight(0xdaf8ff, 0x4b2d16, 2.35));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(4, 7, 5); keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024); keyLight.shadow.camera.near = 0.5; keyLight.shadow.camera.far = 18; scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x22d3ee, 1.1);
      rimLight.position.set(-4, 3, -4); scene.add(rimLight);
      const warmLight = new THREE.PointLight(0xffb86b, 1.2, 10);
      warmLight.position.set(2.5, 0.2, 3.5); scene.add(warmLight);

      const plant = new THREE.Group();
      scene.add(plant);
      const materials = [];
      const geometries = [];
      const material = (options) => { const value = new THREE.MeshStandardMaterial(options); materials.push(value); return value; };
      const mesh = (geometry, meshMaterial) => { geometries.push(geometry); const value = new THREE.Mesh(geometry, meshMaterial); value.castShadow = true; value.receiveShadow = true; return value; };
      const healthyLeaf = material({ color: 0x27a84b, roughness: 0.68, side: THREE.DoubleSide });
      const youngLeaf = material({ color: 0x5bcf67, roughness: 0.7, side: THREE.DoubleSide });
      const symptomColors = { cbb: 0x7c3d12, cbsd: 0xeab308, cmd: 0xfacc15, cgm: 0x9a6410 };
      const affectedLeaf = material({ color: symptomColors[disease] || 0xa16207, roughness: 0.8, side: THREE.DoubleSide });
      const stemMaterial = material({ color: 0x3f7d3a, roughness: 0.96 });
      const stemNodeMaterial = material({ color: 0x6d944d, roughness: 1 });
      const petioleMaterial = material({ color: 0xb45555, roughness: 0.86 });
      const rootMaterial = material({ color: 0xc9874c, roughness: 0.92, metalness: 0.01 });
      const rootHighlightMaterial = material({ color: 0xe0a66b, roughness: 0.9 });
      const rootTipMaterial = material({ color: 0x81502d, roughness: 1 });
      const soilMaterial = material({ color: 0x59351f, roughness: 1, transparent: true, opacity: 0.52 });
      const leafGroups = [];

      const ground = mesh(new THREE.CylinderGeometry(2.15, 2.0, 0.58, 64, 1, true, 0, Math.PI * 1.72), soilMaterial);
      ground.position.y = -0.72; ground.receiveShadow = true; plant.add(ground);
      const soilTop = mesh(new THREE.CircleGeometry(2.14, 64, 0.2, Math.PI * 1.68), material({ color: 0x714526, roughness: 1, side: THREE.DoubleSide }));
      soilTop.rotation.x = -Math.PI / 2; soilTop.position.y = -0.43; plant.add(soilTop);
      const baseShadow = mesh(new THREE.CircleGeometry(2.35, 64), material({ color: 0x020b0e, transparent: true, opacity: 0.34, roughness: 1 }));
      baseShadow.rotation.x = -Math.PI / 2; baseShadow.position.y = -1.83; baseShadow.receiveShadow = true; plant.add(baseShadow);
      const stemHeight = 2.55 + maturity * 0.45;

      const cylinderBetween = (start, end, radius, meshMaterial, sides = 8) => {
        const delta = new THREE.Vector3().subVectors(end, start);
        const part = mesh(new THREE.CylinderGeometry(radius * 0.78, radius, delta.length(), sides), meshMaterial);
        part.position.copy(start).add(end).multiplyScalar(0.5);
        part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
        return part;
      };
      const visibleStemCount = Math.max(1, Math.min(4, Math.round(stemCount || 1)));
      for (let stemIndex = 0; stemIndex < visibleStemCount; stemIndex += 1) {
        const stemAngle = stemIndex / visibleStemCount * Math.PI * 2 + 0.35;
        const base = new THREE.Vector3(Math.cos(stemAngle) * stemIndex * 0.045, -0.48, Math.sin(stemAngle) * stemIndex * 0.045);
        const tip = new THREE.Vector3(Math.cos(stemAngle) * stemIndex * 0.16, stemHeight - 0.48 - stemIndex * 0.08, Math.sin(stemAngle) * stemIndex * 0.16);
        plant.add(cylinderBetween(base, tip, 0.075 - stemIndex * 0.006, stemMaterial, 14));
        for (let node = 0; node < 8; node += 1) {
          const amount = (node + 1) / 10;
          const ring = mesh(new THREE.TorusGeometry(0.077 - stemIndex * 0.006, 0.009, 5, 18), stemNodeMaterial);
          ring.position.lerpVectors(base, tip, amount); ring.rotation.x = Math.PI / 2; plant.add(ring);
        }
      }

      const visibleRootCount = Math.max(3, Math.min(12, Math.round(rootCount || 6)));
      const normalizedLength = Math.max(0.62, Math.min(1.45, Number(rootLength || 28) / 28));
      const normalizedDiameter = Math.max(0.62, Math.min(1.55, Number(rootDiameter || 5) / 5));
      for (let index = 0; index < visibleRootCount; index += 1) {
        const angle = index / visibleRootCount * Math.PI * 2 + 0.28;
        const variation = 0.80 + (index % 4) * 0.075;
        const points = [
          new THREE.Vector2(0.018, 0), new THREE.Vector2(0.08 * normalizedDiameter, 0.08),
          new THREE.Vector2(0.18 * normalizedDiameter * variation * rootAbundance, 0.26),
          new THREE.Vector2(0.20 * normalizedDiameter * variation * rootAbundance, 0.56),
          new THREE.Vector2(0.15 * normalizedDiameter * variation * rootAbundance, 0.82),
          new THREE.Vector2(0.055 * normalizedDiameter, 1.05), new THREE.Vector2(0.008, 1.18),
        ];
        const root = mesh(new THREE.LatheGeometry(points, 28), index % 3 === 0 ? rootHighlightMaterial : rootMaterial);
        root.scale.y = normalizedLength * variation;
        root.position.set(Math.cos(angle) * 0.30, -0.48, Math.sin(angle) * 0.30);
        root.rotation.z = Math.cos(angle) * (0.30 + (index % 2) * 0.10); root.rotation.x = Math.sin(angle) * (0.30 + (index % 2) * 0.10);
        root.rotation.y = -angle;
        plant.add(root);
        for (let ridgeIndex = 1; ridgeIndex <= 3; ridgeIndex += 1) {
          const ridge = mesh(new THREE.TorusGeometry(0.12 * normalizedDiameter * variation * rootAbundance, 0.006, 5, 24), rootTipMaterial);
          ridge.position.set(Math.cos(angle) * (0.30 + ridgeIndex * 0.035), -0.48 - ridgeIndex * 0.22 * normalizedLength * variation, Math.sin(angle) * (0.30 + ridgeIndex * 0.035));
          ridge.rotation.x = Math.PI / 2; ridge.rotation.z = Math.cos(angle) * 0.32; plant.add(ridge);
        }
        const tipStart = new THREE.Vector3(Math.cos(angle) * 0.68, -1.34 * normalizedLength * variation, Math.sin(angle) * 0.68);
        const tipEnd = new THREE.Vector3(Math.cos(angle + 0.18) * 0.92, tipStart.y - 0.26, Math.sin(angle + 0.18) * 0.92);
        plant.add(cylinderBetween(tipStart, tipEnd, 0.014, rootTipMaterial, 6));
        const feederCurve = new THREE.CatmullRomCurve3([
          tipEnd,
          new THREE.Vector3(Math.cos(angle + 0.28) * 1.05, tipEnd.y - 0.16, Math.sin(angle + 0.28) * 1.05),
          new THREE.Vector3(Math.cos(angle + 0.42) * 1.18, tipEnd.y - 0.34, Math.sin(angle + 0.42) * 1.18),
        ]);
        plant.add(mesh(new THREE.TubeGeometry(feederCurve, 10, 0.008, 5, false), rootTipMaterial));
      }

      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(0.09, 0.08, 0.19, 0.30, 0.13, 0.62);
      leafShape.bezierCurveTo(0.07, 0.88, 0, 1.04, 0, 1.10);
      leafShape.bezierCurveTo(0, 1.04, -0.07, 0.88, -0.13, 0.62);
      leafShape.bezierCurveTo(-0.19, 0.30, -0.09, 0.08, 0, 0);
      const leafCount = 14;
      for (let index = 0; index < leafCount; index += 1) {
        const angle = index * 2.399963;
        const height = 0.62 + (index % 5) * 0.43;
        const branchLength = 0.72 + (index % 3) * 0.13;
        const branchStart = new THREE.Vector3(0, height, 0);
        const branchEnd = new THREE.Vector3(Math.cos(angle) * branchLength, height + 0.18, Math.sin(angle) * branchLength);
        plant.add(cylinderBetween(branchStart, branchEnd, 0.022, petioleMaterial));
        const leafGroup = new THREE.Group();
        leafGroup.position.copy(branchEnd);
        leafGroup.rotation.set(-1.08 + (index % 3) * 0.05, 0, -angle - Math.PI / 2);
        leafGroup.userData.baseX = leafGroup.rotation.x;
        leafGroup.userData.phase = index * 0.73;
        leafGroups.push(leafGroup);
        const isAffected = index < Math.round(affectedCount * 1.5);
        const leafScale = severity === 'severe' && isAffected ? 0.76 : 1;
        for (let lobe = 0; lobe < 7; lobe += 1) {
          const lobeAngle = (lobe - 3) * 0.39;
          const leafletMaterial = isAffected ? affectedLeaf : index > 10 ? youngLeaf : healthyLeaf;
          const leaflet = mesh(new THREE.ShapeGeometry(leafShape, 8), leafletMaterial);
          const lobeLength = (lobe === 3 ? 0.68 : 0.52 - Math.abs(lobe - 3) * 0.025) * leafScale;
          leaflet.scale.set(lobeLength, lobeLength, 1);
          leaflet.rotation.x = (lobe % 2 ? -0.08 : 0.06) + (100 - health) * 0.0015;
          leaflet.rotation.z = -lobeAngle;
          leaflet.position.set(Math.sin(lobeAngle) * 0.075, Math.cos(lobeAngle) * 0.075, (lobe - 3) * 0.004);
          leafGroup.add(leaflet);
          const veinEnd = new THREE.Vector3(-Math.sin(lobeAngle) * lobeLength * 0.04, Math.cos(lobeAngle) * lobeLength * 0.88, 0.006);
          leafGroup.add(cylinderBetween(new THREE.Vector3(0, 0, 0.006), veinEnd, 0.006, stemMaterial, 5));
          if (isAffected && lobe % 2 === 0) {
            const spot = mesh(new THREE.CircleGeometry(0.035, 10), material({ color: 0x7c2d12, side: THREE.DoubleSide, roughness: 1 }));
            spot.position.set(Math.sin(lobeAngle) * 0.08, 0.23 + Math.cos(lobeAngle) * 0.05, 0.012);
            leafGroup.add(spot);
          }
        }
        plant.add(leafGroup);
      }

      plant.position.y = 0.05;
      plant.rotation.x = -0.06;
      let animation;
      let dragging = false;
      let previousX = 0;
      let userRotation = 0;
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
        camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize); observer.observe(canvas);
      const pointerDown = (event) => { dragging = true; previousX = event.clientX; canvas.setPointerCapture?.(event.pointerId); };
      const pointerMove = (event) => { if (!dragging) return; userRotation += (event.clientX - previousX) * 0.012; previousX = event.clientX; };
      const pointerUp = () => { dragging = false; };
      const wheel = (event) => { event.preventDefault(); camera.position.z = Math.max(5.2, Math.min(10, camera.position.z + event.deltaY * 0.006)); };
      canvas.addEventListener('pointerdown', pointerDown);
      canvas.addEventListener('pointermove', pointerMove);
      canvas.addEventListener('pointerup', pointerUp);
      canvas.addEventListener('pointercancel', pointerUp);
      canvas.addEventListener('wheel', wheel, { passive: false });
      const clock = new THREE.Clock();
      const draw = () => {
        const elapsed = clock.getElapsedTime();
        if (!dragging) userRotation += 0.003;
        plant.rotation.y = userRotation;
        plant.position.y = 0.05 + Math.sin(elapsed * 1.2) * 0.015;
        leafGroups.forEach((leaf, index) => {
          leaf.rotation.x = leaf.userData.baseX + Math.sin(elapsed * 1.35 + leaf.userData.phase) * (0.015 + (100 - health) * 0.00015);
          leaf.rotation.y = Math.sin(elapsed * 0.9 + index) * 0.018;
        });
        renderer.render(scene, camera);
        animation = requestAnimationFrame(draw);
      };
      draw();
      return () => {
        cancelAnimationFrame(animation); observer.disconnect();
        canvas.removeEventListener('pointerdown', pointerDown);
        canvas.removeEventListener('pointermove', pointerMove);
        canvas.removeEventListener('pointerup', pointerUp);
        canvas.removeEventListener('pointercancel', pointerUp);
        canvas.removeEventListener('wheel', wheel);
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((item) => item.dispose());
        renderer.dispose();
      };
    }, [disease, affectedCount, severity, maturity, health, stemCount, rootAbundance, rootCount, rootLength, rootDiameter]);
    return <canvas ref={canvasRef} className="plant-3d-canvas" tabIndex="0" aria-label="Interactive WebGL cassava model. Drag to rotate and scroll to zoom." />;
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
