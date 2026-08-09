/* System & Models: registry, performance, comparison, server/GPU status, logs. */
(function () {
  const { useState, useEffect } = React;
  const { Card, SectionTitle, Badge, Icon, Skeleton } = window.CG.UI;
  const { RadarChart, BarChart } = window.CG.Charts;

  function SystemPage() {
    const { t, lang, toast, user } = window.CG.Store.useStore();
    const [reg, setReg] = useState(null);
    const [cmp, setCmp] = useState(null);
    const [sys, setSys] = useState(null);
    const [logs, setLogs] = useState(null);
    const [users, setUsers] = useState(null);
    const metric = (value) => value == null ? '—' : `${(value * 100).toFixed(1)}%`;
    const chartColors = [
      '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#f43f5e',
      '#14b8a6', '#84cc16', '#3b82f6', '#e879f9', '#fb7185',
    ];
    const readinessLabel = (status) => {
      const labels = {
        serving_trained_model: lang === 'th' ? 'ใช้งานจริง' : 'serving',
        serving_trained_auxiliary_model: lang === 'th' ? 'ใช้งานจริง · หัวเสริม' : 'serving · auxiliary',
        serving_experimental_auxiliary_model: lang === 'th' ? 'ทดลองใช้งาน · ต้องตรวจซ้ำ' : 'experimental · review required',
        serving_experimental_detector: lang === 'th' ? 'ตัวตรวจจับทดลอง · ต้องตรวจซ้ำ' : 'experimental detector · review required',
        dataset_available_training_required: lang === 'th' ? 'มีข้อมูล · รอฝึก' : 'data ready · train pending',
        real_dataset_downloaded_training_required: lang === 'th' ? 'ข้อมูลจริงพร้อม · รอฝึก' : 'real data ready · train pending',
        real_dataset_downloaded_detector_training_required: lang === 'th' ? 'ข้อมูลกรอบวัตถุพร้อม · รอฝึก' : 'boxed data ready · detector pending',
        real_data_insufficient_synthetic_seed: lang === 'th' ? 'ข้อมูลจริงยังน้อย · มีภาพสังเคราะห์ตั้งต้น' : 'real data insufficient · synthetic seed',
        synthetic_seed_real_data_required: lang === 'th' ? 'มีภาพสังเคราะห์ตั้งต้น · ต้องหาข้อมูลจริง' : 'synthetic seed · real data required',
        synthetic_seed_real_paired_data_required: lang === 'th' ? 'มีภาพสังเคราะห์ · ต้องเก็บข้อมูลจริงจับคู่' : 'synthetic seed · paired real data required',
        blocked_missing_labeled_images: lang === 'th' ? 'ขาดภาพติดป้าย' : 'blocked · missing labelled images',
        blocked_missing_paired_labels: lang === 'th' ? 'ขาดข้อมูลจับคู่' : 'blocked · missing paired labels',
      };
      return labels[status] || status;
    };
    const readinessTone = (status) => (
      status.startsWith('serving_trained_') ? 'online'
        : ['serving_experimental_auxiliary_model', 'serving_experimental_detector'].includes(status) ? 'medium'
        : status.includes('dataset_downloaded') || status === 'dataset_available_training_required'
          ? 'medium' : 'slate'
    );

    useEffect(() => {
      const API = window.CG.API_CLIENT;
      API.models().then(setReg).catch((e) => toast(e.message, 'error'));
      API.modelCompare().then(setCmp).catch(() => {});
      API.systemStatus().then(setSys).catch(() => {});
      if (user.role === 'admin') {
        API.logs().then(setLogs).catch(() => setLogs([]));
        API.adminUsers().then(setUsers).catch(() => setUsers([]));
      }
      const iv = setInterval(() => API.systemStatus().then(setSys).catch(() => {}), 5000);
      return () => clearInterval(iv);
    }, []);

    const updateRole = async (id, role) => {
      try {
        await window.CG.API_CLIENT.updateUserRole(id, role);
        setUsers(await window.CG.API_CLIENT.adminUsers());
        toast(lang === 'th' ? 'อัปเดตบทบาทแล้ว' : 'Role updated', 'success');
      } catch (error) {
        toast(error.message, 'error');
      }
    };

    return (
      <div className="space-y-5">
        {/* server + gpu + inference */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="animate-fadeup">
            <div className="flex items-center justify-between"><span className="txt-soft text-xs font-semibold">{t('server_status')}</span><span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" /></div>
            <div className="txt text-2xl font-bold mt-2">{sys ? 'Online' : <Skeleton className="h-7 w-20" />}</div>
            <div className="txt-dim text-[11px] mt-1">{sys ? `uptime ${Math.floor(sys.server.uptime_s / 60)}m · load ${sys.server.load_1m}` : ''}</div>
          </Card>
          <Card className="animate-fadeup" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-between"><span className="txt-soft text-xs font-semibold">Compute</span><Icon name="cpu" className="w-4 h-4 text-cyan2-light" /></div>
            <div className="txt text-lg font-bold mt-2">{sys ? sys.gpu.device : <Skeleton className="h-6 w-24" />}</div>
            <div className="txt-dim text-[11px] mt-1">{sys ? sys.gpu.backend : ''}</div>
          </Card>
          <Card className="animate-fadeup" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between"><span className="txt-soft text-xs font-semibold">Inference</span><Icon name="brain" className="w-4 h-4 text-brand-400" /></div>
            <div className="txt text-2xl font-bold mt-2 tabular-nums">{sys && sys.inference.avg_ms != null ? sys.inference.avg_ms : '—'}{sys && sys.inference.avg_ms != null && <span className="text-sm txt-soft">ms</span>}</div>
            <div className="txt-dim text-[11px] mt-1">{sys && sys.inference.throughput_img_s != null ? `${sys.inference.throughput_img_s} img/s` : (lang === 'th' ? 'ยังไม่มีตัวอย่าง' : 'No samples yet')}</div>
          </Card>
          <Card className="animate-fadeup" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between"><span className="txt-soft text-xs font-semibold">Dataset</span><Icon name="grid" className="w-4 h-4 text-violet-400" /></div>
            <div className="txt text-2xl font-bold mt-2 tabular-nums">{sys ? (sys.dataset.train + sys.dataset.val + sys.dataset.test).toLocaleString() : '–'}</div>
            <div className="txt-dim text-[11px] mt-1">{sys ? (
              lang === 'th'
                ? `${sys.dataset.classes} คลาสที่เทรน · ${sys.dataset.reference_only_classes || 0} คลาสข้อมูลอ้างอิง`
                : `${sys.dataset.classes} trained · ${sys.dataset.reference_only_classes || 0} reference-only`
            ) : ''}</div>
            {sys && !sys.dataset.field_validated && <div className="text-amber-300 text-[10px] mt-1">
              {lang === 'th' ? 'ยังไม่ผ่านการตรวจสอบอิสระกับภาพแปลงไทย' : 'Not independently validated on Thai field photos'}
            </div>}
          </Card>
        </div>

        {/* model registry */}
        <Card className="animate-fadeup">
          <SectionTitle icon="cpu" title={lang === 'th' ? 'ทะเบียนโมเดล' : 'Model Registry'}
            right={reg && <Badge tone="brand">active · {reg.active}</Badge>} />
          {reg ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="txt-dim text-xs border-b hair">
                  {['Model', 'Version', 'Accuracy', 'F1 / mAP50', 'Params', 'Size', 'Speed', ''].map((h, i) => <th key={i} className="text-left font-medium py-2 px-2">{h}</th>)}
                </tr></thead>
                <tbody>
                  {reg.models.map((m) => (
                    <tr key={m.id} className="border-b hair hover:bg-white/[.02]">
                      <td className="py-2.5 px-2 txt font-medium text-xs">{m.name}</td>
                      <td className="py-2.5 px-2 txt-soft font-mono text-xs">{m.version}</td>
                      <td className="py-2.5 px-2 txt font-mono text-xs">{metric(m.accuracy)}</td>
                      <td className="py-2.5 px-2 txt-soft font-mono text-xs">
                        {m.map50 != null ? `mAP50 ${metric(m.map50)}` : metric(m.f1)}
                      </td>
                      <td className="py-2.5 px-2 txt-soft font-mono text-xs">{m.params_m != null ? m.params_m + 'M' : '—'}</td>
                      <td className="py-2.5 px-2 txt-soft font-mono text-xs">{m.size_mb != null ? m.size_mb + 'MB' : '—'}</td>
                      <td className="py-2.5 px-2 txt-soft font-mono text-xs">{m.avg_inference_ms != null ? m.avg_inference_ms + 'ms' : '—'}</td>
                      <td className="py-2.5 px-2">
                        {m.experimental
                          ? <Badge tone="medium">
                              {m.runtime_enabled
                                ? (lang === 'th' ? 'ทดลอง · ต้องตรวจซ้ำ' : 'experimental · review only')
                                : (lang === 'th' ? 'ทดลอง · ปิด' : 'experimental · off')}
                            </Badge>
                          : m.active
                            ? <Badge tone="online" dot>active</Badge>
                            : <Badge tone="slate">standby</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Skeleton className="h-32" />}
        </Card>

        {/* Honest multi-head coverage for every displayed class */}
        {reg?.class_readiness && <Card className="animate-fadeup">
          <SectionTitle icon="check"
            title={lang === 'th' ? 'ความพร้อมของคลาสทั้ง 13' : 'Readiness of all 13 classes'}
            sub={lang === 'th'
              ? 'โรค · แมลง · ภาวะเครียด ใช้หัวโมเดลคนละชนิด และไม่สร้างคะแนนปลอม'
              : 'Diseases, pests and stresses use separate model heads; no fabricated probabilities'}
            right={<Badge tone="info">
              {reg.readiness_summary.serving_classes}/{reg.readiness_summary.display_classes} {lang === 'th' ? 'คลาสใช้งานจริง' : 'serving'}
            </Badge>} />
          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-sm">
              <thead><tr className="txt-dim text-xs border-b hair">
                <th className="text-left font-medium py-2 px-2">{lang === 'th' ? 'คลาส' : 'Class'}</th>
                <th className="text-left font-medium py-2 px-2">{lang === 'th' ? 'งานโมเดล' : 'Model task'}</th>
                <th className="text-left font-medium py-2 px-2">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                <th className="text-left font-medium py-2 px-2">{lang === 'th' ? 'ข้อมูล/เหตุผล' : 'Data / reason'}</th>
              </tr></thead>
              <tbody>{reg.class_readiness.map((row) => (
                <tr key={row.key} className="border-b hair align-top">
                  <td className="py-2.5 px-2">
                    <div className="txt text-xs font-medium">{lang === 'th' ? row.th : row.en}</div>
                    <div className="txt-dim font-mono text-[10px] mt-0.5">{row.key}</div>
                  </td>
                  <td className="py-2.5 px-2 txt-soft font-mono text-[11px]">{row.task}</td>
                  <td className="py-2.5 px-2">
                    <Badge tone={readinessTone(row.status)} dot={row.production_output}>
                      {readinessLabel(row.status)}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 txt-soft text-[11px] max-w-md">
                    <div>{row.reason}</div>
                    {row.dataset?.name && <div className="txt-dim mt-1">
                      {row.dataset.name} · {row.dataset.license}
                      {row.dataset.images ? ` · ${row.dataset.images.toLocaleString()} images` : ''}
                    </div>}
                    {row.synthetic?.images > 0 && <div className="text-amber-300/80 mt-1">
                      {lang === 'th'
                        ? `สังเคราะห์ ${row.synthetic.images} ภาพ · train-only · ห้ามใช้วัดผล`
                        : `${row.synthetic.images} synthetic · train-only · excluded from evaluation`}
                    </div>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>}

        <div className="grid lg:grid-cols-2 gap-4">
          {/* performance radar */}
          <Card className="animate-fadeup">
            <SectionTitle icon="brain" title={t('model_cmp')} sub="accuracy · F1 · precision · recall" />
            {cmp ? (
              <RadarChart height={280}
                labels={['Accuracy', 'F1', 'Precision', 'Recall']}
                series={cmp.models.map((m, i) => ({
                  label: m.name.split(' ').slice(-1)[0],
                  data: [m.accuracy, m.f1, m.precision, m.recall]
                    .map((v) => v == null ? null : Math.round(v * 100)),
                  color: chartColors[i % chartColors.length],
                }))} />
            ) : <Skeleton className="h-64" />}
          </Card>

          {/* size vs speed */}
          <Card className="animate-fadeup" style={{ animationDelay: '60ms' }}>
            <SectionTitle icon="cpu" title={lang === 'th' ? 'ขนาด vs ความเร็ว' : 'Size vs Speed'} sub="MB · inference ms" />
            {cmp ? (
              <BarChart height={280} labels={cmp.models.map((m) => m.name.split(' ').slice(-1)[0])}
                series={[
                  { label: 'Size MB', data: cmp.models.map((m) => m.size_mb), color: '#8b5cf6' },
                  { label: 'Speed ms', data: cmp.models.map((m) => m.avg_inference_ms), color: '#06b6d4' },
                ]} />
            ) : <Skeleton className="h-64" />}
          </Card>
        </div>

        {/* user roles (admin only) */}
        {user.role === 'admin' && <Card className="animate-fadeup">
          <SectionTitle icon="check" title={lang === 'th' ? 'ผู้ใช้และสิทธิ์' : 'Users & roles'}
            sub={lang === 'th' ? 'บัญชีใหม่เริ่มต้นเป็นเกษตรกร' : 'New accounts start as Farmer'} />
          {users ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="txt-dim text-xs border-b hair">
                  <th className="text-left font-medium py-2 px-2">Email</th>
                  <th className="text-left font-medium py-2 px-2">{lang === 'th' ? 'ชื่อ' : 'Name'}</th>
                  <th className="text-left font-medium py-2 px-2">{lang === 'th' ? 'บทบาท' : 'Role'}</th>
                </tr></thead>
                <tbody>{users.map((account) => (
                  <tr key={account.id} className="border-b hair">
                    <td className="py-2.5 px-2 txt font-mono text-xs">{account.email}</td>
                    <td className="py-2.5 px-2 txt-soft text-xs">{account.full_name || '—'}</td>
                    <td className="py-2.5 px-2">
                      <select value={account.role} onChange={(event) => updateRole(account.id, event.target.value)}
                        className="glass rounded-lg px-2 py-1 txt text-xs bg-transparent">
                        <option value="farmer" className="bg-ink-800">Farmer</option>
                        <option value="researcher" className="bg-ink-800">Researcher</option>
                        <option value="admin" className="bg-ink-800">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <Skeleton className="h-24" />}
        </Card>}

        {/* logs (admin only) */}
        {user.role === 'admin' && <Card className="animate-fadeup">
          <SectionTitle icon="history" title={t('training_logs')} sub={lang === 'th' ? 'บันทึกคำขอ API ล่าสุด' : 'Recent API requests'} />
          {logs ? (
            <div className="font-mono text-[11px] space-y-1 max-h-64 overflow-y-auto no-scrollbar">
              {logs.slice(0, 40).map((l) => (
                <div key={l.id} className="flex items-center gap-2 txt-soft">
                  <span className="txt-dim">{l.at.slice(11, 19)}</span>
                  <span className={`w-12 ${l.status < 300 ? 'text-brand-400' : l.status < 400 ? 'text-amber-400' : 'text-rose-400'}`}>{l.status}</span>
                  <span className="w-14 txt-dim">{l.method}</span>
                  <span className="flex-1 truncate">{l.path}</span>
                  <span className="txt-dim tabular-nums">{l.ms}ms</span>
                </div>
              ))}
            </div>
          ) : <Skeleton className="h-32" />}
        </Card>}
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.System = SystemPage;
})();
