/* In-app bilingual user guide. Keep operational caveats next to the workflow. */
(function () {
  const { Card, SectionTitle, Badge, Icon } = window.CG.UI;

  // One unified workflow from account sign-in through private history.
  const STEPS = {
    th: [
      ['user', 'เข้าสู่ระบบ', 'สมัครบัญชีหรือเข้าสู่ระบบก่อนใช้งาน เพื่อให้รูปและผลวิเคราะห์ถูกบันทึกเป็นข้อมูลของคุณ'],
      ['camera', 'ถ่ายภาพให้ชัด', 'ใช้แสงธรรมชาติ ภาพไม่สั่น เห็นใบหรือต้นเต็มส่วนที่มีอาการ และหลีกเลี่ยงพื้นหลังรก'],
      ['brain', 'วิเคราะห์ด้วย AI', 'อัปโหลดภาพ JPG/PNG แล้วกด “วิเคราะห์” ระบบจำแนกเฉพาะ 5 คลาสหลัก'],
      ['check', 'ตรวจผลก่อนลงมือ', 'อ่านความมั่นใจและเหตุผลที่ต้องตรวจซ้ำ เปรียบเทียบกับอาการจริงก่อนดำเนินการ'],
      ['history', 'เปิดประวัติ', 'ดูภาพต้นฉบับ Heatmap ผลวิเคราะห์ และลบรายการที่ไม่ต้องการได้จากบัญชีของคุณ'],
    ],
    en: [
      ['user', 'Sign in', 'Create an account or sign in first so photos and analyses are saved under your account.'],
      ['camera', 'Capture a clear photo', 'Use daylight, avoid blur, show the affected leaf or plant clearly and keep the background simple.'],
      ['brain', 'Run AI analysis', 'Upload JPG/PNG, then analyze one of the five primary classes.'],
      ['check', 'Review before acting', 'Check confidence and review reasons against the plant before taking action.'],
      ['history', 'Open History', 'Review the original photo, heatmap and result, or delete records you no longer need.'],
    ],
  };

  const FEATURES = {
    th: [
      ['user', 'บัญชีผู้ใช้', 'แยกข้อมูล รูปภาพ และประวัติของผู้ใช้แต่ละบัญชีออกจากกัน'],
      ['brain', 'วิเคราะห์ด้วย AI', 'จำแนกเฉพาะ Healthy, CBB, CBSD, CMD และ CGM'],
      ['history', 'ประวัติส่วนตัว', 'เปิดดูภาพต้นฉบับ Heatmap ลบรายการ และส่งออก CSV/PDF'],
      ['cpu', 'ระบบและโมเดล', 'ตรวจสถานะเซิร์ฟเวอร์และผลวัดโมเดลหลัก 5 คลาส'],
    ],
    en: [
      ['user', 'User account', 'Keeps each account’s data, photos and history separate.'],
      ['brain', 'AI Diagnosis', 'Restricted to Healthy, CBB, CBSD, CMD and CGM.'],
      ['history', 'Private history', 'Review original photos and heatmaps, delete records, and export CSV/PDF.'],
      ['cpu', 'System and models', 'Inspect server health and measured metrics for the five primary classes.'],
    ],
  };

  const STATUS = {
    th: [
      ['ok', 'check', 'พร้อมใช้งาน', 'โมเดลโหลดสำเร็จและสร้างผลได้ แต่ยังต้องเทียบกับอาการจริงในแปลง'],
      ['warn', 'alert', 'ต้องตรวจซ้ำ / Review only', 'ผลมีความไม่แน่นอนหรือโมเดลยังไม่ผ่านการยืนยันภาคสนาม ห้ามใช้เป็นเหตุผลเดียวในการใช้สารเคมี'],
      ['slate', 'grid', 'ยังไม่รองรับ', 'ยังไม่มีข้อมูลติดป้ายเพียงพอ ระบบจึงไม่สร้างคำวินิจฉัยของคลาสนั้น'],
      ['danger', 'close', 'โมเดลไม่พร้อม / บริการขัดข้อง', 'อย่าใช้ผลเดิมแทน ให้ลองใหม่ เปิด “ระบบ & โมเดล” และแจ้งผู้ดูแลหากยังไม่พร้อม'],
    ],
    en: [
      ['ok', 'check', 'Ready', 'The model loaded and can produce results, which must still be checked against the field.'],
      ['warn', 'alert', 'Review required / Review only', 'The result is uncertain or not field-validated; never use it alone to justify chemical treatment.'],
      ['slate', 'grid', 'Unsupported', 'There is not enough labelled evidence, so the app does not invent a diagnosis for that class.'],
      ['danger', 'close', 'Model unavailable / Service error', 'Do not substitute an old result. Retry, inspect System & Models, and notify the administrator if it persists.'],
    ],
  };
  const STATUS_TONE = {
    ok: { fg: 'var(--cg-brand-strong)', bg: 'var(--cg-brand-softer)', border: 'var(--cg-brand-soft)' },
    warn: { fg: 'var(--cg-warm-ink)', bg: 'var(--cg-warm-soft)', border: 'rgba(217,113,31,.28)' },
    slate: { fg: 'var(--cg-text-soft)', bg: 'var(--cg-surface-2)', border: 'var(--cg-border)' },
    danger: { fg: '#fff', bg: 'var(--cg-danger)', border: 'var(--cg-danger)' },
  };

  function GuidePage() {
    const { lang } = window.CG.Store.useStore();
    const steps = STEPS[lang] || STEPS.en;
    const features = FEATURES[lang] || FEATURES.en;
    const statuses = STATUS[lang] || STATUS.en;
    const th = lang === 'th';
    return (
      <div className="space-y-5">
        <Card className="animate-fadeup overflow-hidden relative cassava-model-card">
          <SectionTitle icon="book"
            title={th ? 'เริ่มใช้งาน CassavaGuard AI' : 'Getting started with CassavaGuard AI'}
            sub={th ? 'ลำดับงานที่แนะนำสำหรับข้อมูลภาคสนามจริง' : 'Recommended workflow for real field data'}
            right={<Badge tone="medium">{th ? 'เครื่องมือช่วยตัดสินใจ' : 'decision support'}</Badge>} />
          <p className="txt-soft text-sm leading-relaxed relative">
            {th
              ? 'ผล AI ไม่ใช่ผลยืนยันจากห้องปฏิบัติการ หากระบบแสดง “ต้องตรวจซ้ำ” ให้ตรวจต้นจริง เปรียบเทียบหลายภาพ และปรึกษาผู้เชี่ยวชาญก่อนถอนต้นหรือใช้สารเคมี'
              : 'AI output is not a laboratory confirmation. When review is required, inspect the plant, compare multiple photos and consult an expert before roguing plants or applying chemicals.'}
          </p>
        </Card>

        {/* One unified step timeline (reuses the same vertical-rail pattern as the Analyze page). */}
        <Card className="animate-fadeup">
          <SectionTitle icon="play" title={th ? 'ใช้งานให้ครบวงจรใน 5 ขั้นตอน' : 'The complete workflow in 5 steps'} />
          <ol className="step-rail">
            {steps.map(([icon, title, body]) => (
              <li key={title} className="active">
                <span className="step-rail-dot"><Icon name={icon} className="w-4 h-4" /></span>
                <div><b>{title}</b><p>{body}</p></div>
              </li>
            ))}
          </ol>
          <p className="txt-dim text-xs mt-3 pt-3" style={{ borderTop: '1px solid var(--cg-border-soft)' }}>
            {th ? 'หากใช้งานบน Render Free หลังไม่มีผู้ใช้งาน ระบบอาจใช้เวลาประมาณหนึ่งนาทีในการเริ่มทำงานครั้งแรก ให้รอแล้วรีเฟรชอีกครั้ง' : 'On Render Free, the first request after inactivity can take about a minute. Wait and refresh once.'}
          </p>
        </Card>

        <Card className="animate-fadeup">
          <SectionTitle icon="database" title={th ? 'ระบบเก็บข้อมูลอย่างไร' : 'How your data is stored'} />
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {(th ? [
              ['user', 'ผูกกับบัญชี', 'ทุกผลวิเคราะห์มีรหัสเจ้าของ บัญชีทั่วไปมองเห็นเฉพาะข้อมูลของตนเอง'],
              ['database', 'ฐานข้อมูล', 'บัญชี เวลา ผลตรวจ ความมั่นใจ และโมเดลถูกเก็บใน PostgreSQL ของระบบ'],
              ['camera', 'ไฟล์ภาพ', 'ภาพต้นฉบับและ Heatmap เก็บในพื้นที่ถาวร แยกโฟลเดอร์ตามบัญชี และเปิดผ่านลิงก์ชั่วคราว'],
            ] : [
              ['user', 'Account ownership', 'Every analysis records its owner; standard accounts can only see their own data.'],
              ['database', 'Database', 'Account, time, diagnosis, confidence and model metadata are stored in PostgreSQL.'],
              ['camera', 'Image files', 'Original photos and heatmaps use persistent storage, separated by account and served with short-lived links.'],
            ]).map(([icon, title, body]) => (
              <div key={title} className="rounded-2xl p-3.5" style={{ background: 'var(--cg-surface-2)' }}>
                <div className="flex items-center gap-2 txt font-bold"><Icon name={icon} className="w-4 h-4 text-brand-500" />{title}</div>
                <p className="txt-soft text-xs leading-relaxed mt-2">{body}</p>
              </div>
            ))}
          </div>
          <p className="txt-dim text-xs mt-3 leading-relaxed">
            {th
              ? 'เมื่อลบรายการจากหน้าประวัติ ระบบจะลบทั้งข้อมูลผลวิเคราะห์และไฟล์ภาพที่เกี่ยวข้อง หากต้องการลบบัญชีทั้งหมดให้ติดต่อผู้ดูแลระบบ'
              : 'Deleting an item from History removes both its analysis record and related image files. Contact the administrator to request full account deletion.'}
          </p>
        </Card>

        <Card className="animate-fadeup">
          <SectionTitle icon="grid" title={th ? 'แต่ละเมนูใช้ทำอะไร' : 'What each area does'} />
          <div className="grid md:grid-cols-2 gap-3">
            {features.map(([icon, title, body]) => (
              <div key={title} className="flex gap-3 rounded-2xl p-3" style={{ background: 'var(--cg-surface-2)' }}>
                <span className="cg-section-icon" style={{ width: 38, height: 38 }}><Icon name={icon} className="w-4 h-4" /></span>
                <div><div className="txt text-sm font-bold">{title}</div><div className="txt-soft text-xs leading-relaxed mt-0.5">{body}</div></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="animate-fadeup">
          <SectionTitle icon="activity" title={th ? 'ความหมายของสถานะผลวิเคราะห์' : 'Understanding result status'} />
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {statuses.map(([tone, icon, title, body]) => {
              const c = STATUS_TONE[tone];
              return (
                <div key={title} className="rounded-2xl p-3.5" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-2 font-bold" style={{ color: c.fg }}><Icon name={icon} className="w-4 h-4" />{title}</div>
                  <div className="txt-soft text-xs leading-relaxed mt-1.5">{body}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="animate-fadeup">
            <SectionTitle icon="camera" title={th ? 'ภาพที่เหมาะกับ AI' : 'Photos suitable for AI'} />
            <ul className="space-y-2.5 txt-soft text-sm">
              {(th ? [
                'ถ่ายหลายมุม: ใบด้านหน้า ใต้ใบ และภาพทั้งต้นเมื่ออาการกระจาย',
                'ไม่ใช้ภาพจากอินเทอร์เน็ต ภาพหน้าจอ หรือภาพที่ผ่านฟิลเตอร์สี',
                'Whitefly: ให้ตัวแมลงมีขนาดมองเห็นได้และอย่าลดความละเอียดก่อนอัปโหลด',
                'หลีกเลี่ยงใบเปียก แสงย้อน และเงามือบังอาการ',
              ] : [
                'Capture multiple views: leaf front, underside and whole plant for distributed symptoms.',
                'Do not upload internet images, screenshots or color-filtered photos.',
                'Whitefly: insects must be visible; do not downscale before upload.',
                'Avoid wet leaves, backlighting and hand shadows over symptoms.',
              ]).map((row) => <li key={row} className="flex gap-2.5"><Icon name="check" className="w-4 h-4 shrink-0 mt-0.5 text-brand-500" /><span>{row}</span></li>)}
            </ul>
          </Card>
          <Card className="animate-fadeup">
            <SectionTitle icon="alert" title={th ? 'ข้อจำกัดที่ต้องรู้' : 'Important limitations'} />
            <div className="space-y-3 text-sm leading-relaxed">
              <div className="rounded-2xl p-3.5" style={{ background: 'var(--cg-warm-soft)', color: 'var(--cg-warm-ink)' }}>
                {th ? 'White Leaf Spot และ Whitefly เป็นโมเดลทดลองแบบ review-only ยังไม่ผ่านชุดทดสอบแปลงไทยอิสระ' : 'White Leaf Spot and Whitefly are review-only experimental models without an independent Thai-field holdout.'}
              </div>
              <div className="rounded-2xl p-3.5 txt-soft" style={{ background: 'var(--cg-surface-2)' }}>
                {th ? 'CAD, SED, Mealybug, Water Stress และ Nutrient Deficiency ยังมีข้อมูลติดป้ายไม่พอ จึงไม่สร้างผลวินิจฉัยจากภาพแบบปลอม' : 'CAD, SED, Mealybug, Water Stress and Nutrient Deficiency lack sufficient labelled data, so the app does not fabricate image diagnoses.'}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Guide = GuidePage;
})();
