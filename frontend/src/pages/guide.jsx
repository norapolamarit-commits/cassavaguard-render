/* In-app bilingual user guide. Keep operational caveats next to the workflow. */
(function () {
  const { Card, SectionTitle, Badge, Icon } = window.CG.UI;

  const STEPS = {
    th: [
      ['สร้างแปลง', 'ไปที่ “แผนที่แปลง” กด “เพิ่มแปลง” แล้วกรอกชื่อ จังหวัด พันธุ์ พื้นที่ และพิกัดจริง'],
      ['บันทึกข้อมูลจริง', 'ไปที่ “ดิน” แล้วเพิ่มผลแล็บ เซนเซอร์ หรือชุดตรวจภาคสนาม ช่องที่ไม่ได้ตรวจให้เว้นว่าง'],
      ['ถ่ายภาพให้ชัด', 'ใช้แสงธรรมชาติ ภาพไม่สั่น เห็นใบหรือต้นเต็มส่วนที่มีอาการ และหลีกเลี่ยงพื้นหลังรก'],
      ['วิเคราะห์ด้วย AI', 'เลือกชนิดภาพและแปลง อัปโหลด JPG/PNG แล้วกด “วิเคราะห์” สำหรับแมลงหวี่ขาวควรถ่ายใต้ใบระยะใกล้และใช้ภาพความละเอียดเต็ม'],
      ['ตรวจผลก่อนลงมือ', 'อ่านความมั่นใจ เหตุผลที่ต้องตรวจซ้ำ ผลเสริม และกรอบแมลง เปรียบเทียบกับอาการจริงก่อนดำเนินการ'],
      ['ติดตามผล', 'ดูประวัติ คำแนะนำ ดาวเทียม อากาศ และข้อมูลดินร่วมกัน ไม่ตัดสินจากภาพเดียว'],
    ],
    en: [
      ['Create a field', 'Open Field Map, choose Add field, then enter the real name, province, variety, area and coordinates.'],
      ['Record measured data', 'Open Soil and add laboratory, sensor or field-kit results. Leave untested values blank.'],
      ['Capture a clear photo', 'Use daylight, avoid blur, show the affected leaf or plant clearly and keep the background simple.'],
      ['Run AI analysis', 'Choose the image type and field, upload JPG/PNG, then Analyze. For whitefly, photograph the leaf underside closely at full resolution.'],
      ['Review before acting', 'Check confidence, review reasons, auxiliary findings and insect boxes against the plant before taking action.'],
      ['Monitor over time', 'Use History, Recommendations, Satellite, Weather and Soil together instead of relying on one photo.'],
    ],
  };

  const FEATURES = {
    th: [
      ['แผนที่แปลง', 'เพิ่มและเลือกแปลง ดูขอบเขต ความเสี่ยง และชั้นข้อมูล NDVI/NDMI/SAVI'],
      ['วิเคราะห์ด้วย AI', 'จำแนก 5 คลาสหลัก พร้อม Brown Leaf Spot และผลทดลอง White Leaf Spot/Whitefly แบบต้องตรวจซ้ำ'],
      ['ดาวเทียมและอากาศ', 'ใช้ Sentinel-2 และ Open-Meteo แบบ live พร้อมแหล่งที่มาและเวลา'],
      ['ดิน', 'เก็บเฉพาะค่าที่วัดจริง ระบบไม่สร้างค่า N/P/K/pH ทดแทนข้อมูลที่ขาด'],
      ['คำแนะนำและประวัติ', 'รวมหลักฐานหลายแหล่ง บันทึกผล และส่งออก CSV/PDF'],
      ['ระบบและโมเดล', 'ตรวจสถานะเซิร์ฟเวอร์ ผลวัดโมเดล และความพร้อมของคลาสทั้ง 13'],
    ],
    en: [
      ['Field Map', 'Create and select fields; inspect boundaries, risk and NDVI/NDMI/SAVI layers.'],
      ['AI Diagnosis', 'Five primary classes plus Brown Leaf Spot and review-only White Leaf Spot/Whitefly findings.'],
      ['Satellite and weather', 'Live Sentinel-2 and Open-Meteo data with provider and timestamp provenance.'],
      ['Soil', 'Stores measured values only; missing N/P/K/pH values are never invented.'],
      ['Recommendations and history', 'Combines evidence, records results and exports CSV/PDF.'],
      ['System and models', 'Inspect server health, measured model metrics and readiness for all 13 classes.'],
    ],
  };

  function GuidePage() {
    const { lang } = window.CG.Store.useStore();
    const steps = STEPS[lang] || STEPS.en;
    const features = FEATURES[lang] || FEATURES.en;
    const th = lang === 'th';
    return (
      <div className="space-y-5">
        <Card className="animate-fadeup overflow-hidden relative">
          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl" />
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

        <Card className="animate-fadeup border border-brand-500/20">
          <SectionTitle icon="play" title={th ? 'เริ่มใช้งานแบบเร็วใน 3 นาที' : 'Three-minute quick start'} />
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {(th ? [
              ['1', 'เพิ่มแปลง', 'เปิด “แผนที่แปลง” เพิ่มชื่อแปลงและพิกัดจริง เพื่อให้ข้อมูลอากาศและดาวเทียมตรงพื้นที่'],
              ['2', 'อัปโหลดภาพ', 'เปิด “วิเคราะห์ด้วย AI” เลือกแปลงและชนิดภาพ แล้วใช้ภาพ JPG/PNG ที่ชัดและไม่เกิน 10 MB'],
              ['3', 'อ่านและยืนยันผล', 'ดู Confidence และสถานะตรวจซ้ำ เปรียบเทียบหลายภาพ แล้วบันทึกผลไว้ในประวัติ'],
            ] : [
              ['1', 'Add a field', 'Open Field Map and enter the real field name and coordinates so weather and satellite data match the site.'],
              ['2', 'Upload a photo', 'Open AI Diagnosis, choose the field and image type, then use a clear JPG/PNG up to 10 MB.'],
              ['3', 'Review and verify', 'Read confidence and review status, compare multiple photos, then retain the result in History.'],
            ]).map(([number, title, body]) => (
              <div key={number} className="rounded-xl border hair p-3">
                <div className="flex items-center gap-2"><Badge tone="medium">{number}</Badge><span className="txt font-semibold">{title}</span></div>
                <p className="txt-soft text-xs leading-relaxed mt-2">{body}</p>
              </div>
            ))}
          </div>
          <p className="txt-muted text-xs mt-3">
            {th ? 'หากใช้งานบน Render Free หลังไม่มีผู้ใช้งาน ระบบอาจใช้เวลาประมาณหนึ่งนาทีในการเริ่มทำงานครั้งแรก ให้รอแล้วรีเฟรชอีกครั้ง' : 'On Render Free, the first request after inactivity can take about a minute. Wait and refresh once.'}
          </p>
        </Card>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {steps.map(([title, body], index) => (
            <Card key={title} className="animate-fadeup" style={{ animationDelay: `${index * 45}ms` }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl grad-brand text-white grid place-items-center font-bold shrink-0">{index + 1}</div>
                <div><h3 className="txt font-semibold text-sm">{title}</h3><p className="txt-soft text-xs leading-relaxed mt-1">{body}</p></div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="animate-fadeup">
          <SectionTitle icon="grid" title={th ? 'แต่ละเมนูใช้ทำอะไร' : 'What each area does'} />
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            {features.map(([title, body]) => (
              <div key={title} className="flex gap-3">
                <Icon name="check" className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <div><div className="txt text-sm font-medium">{title}</div><div className="txt-soft text-xs leading-relaxed mt-0.5">{body}</div></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="animate-fadeup">
          <SectionTitle icon="activity" title={th ? 'ความหมายของสถานะผลวิเคราะห์' : 'Understanding result status'} />
          <div className="grid md:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
              <div className="font-semibold text-emerald-300">{th ? 'พร้อมใช้งาน' : 'Ready'}</div>
              <div className="txt-soft mt-1">{th ? 'โมเดลโหลดสำเร็จและสร้างผลได้ แต่ยังต้องเทียบกับอาการจริงในแปลง' : 'The model loaded and can produce results, which must still be checked against the field.'}</div>
            </div>
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
              <div className="font-semibold text-amber-300">{th ? 'ต้องตรวจซ้ำ / Review only' : 'Review required / Review only'}</div>
              <div className="txt-soft mt-1">{th ? 'ผลมีความไม่แน่นอนหรือโมเดลยังไม่ผ่านการยืนยันภาคสนาม ห้ามใช้เป็นเหตุผลเดียวในการใช้สารเคมี' : 'The result is uncertain or not field-validated; never use it alone to justify chemical treatment.'}</div>
            </div>
            <div className="rounded-xl border border-slate-500/25 bg-slate-500/10 p-3">
              <div className="font-semibold txt">{th ? 'ยังไม่รองรับ' : 'Unsupported'}</div>
              <div className="txt-soft mt-1">{th ? 'ยังไม่มีข้อมูลติดป้ายเพียงพอ ระบบจึงไม่สร้างคำวินิจฉัยของคลาสนั้น' : 'There is not enough labelled evidence, so the app does not invent a diagnosis for that class.'}</div>
            </div>
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3">
              <div className="font-semibold text-rose-300">{th ? 'โมเดลไม่พร้อม / บริการขัดข้อง' : 'Model unavailable / Service error'}</div>
              <div className="txt-soft mt-1">{th ? 'อย่าใช้ผลเดิมแทน ให้ลองใหม่ เปิด “ระบบ & โมเดล” และแจ้งผู้ดูแลหากยังไม่พร้อม' : 'Do not substitute an old result. Retry, inspect System & Models, and notify the administrator if it persists.'}</div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="animate-fadeup">
            <SectionTitle icon="camera" title={th ? 'ภาพที่เหมาะกับ AI' : 'Photos suitable for AI'} />
            <ul className="space-y-2 txt-soft text-sm">
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
              ]).map((row) => <li key={row} className="flex gap-2"><span className="text-brand-400">•</span><span>{row}</span></li>)}
            </ul>
          </Card>
          <Card className="animate-fadeup">
            <SectionTitle icon="alert" title={th ? 'ข้อจำกัดที่ต้องรู้' : 'Important limitations'} />
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-200">
                {th ? 'White Leaf Spot และ Whitefly เป็นโมเดลทดลองแบบ review-only ยังไม่ผ่านชุดทดสอบแปลงไทยอิสระ' : 'White Leaf Spot and Whitefly are review-only experimental models without an independent Thai-field holdout.'}
              </div>
              <div className="rounded-xl border hair p-3 txt-soft">
                {th ? 'CAD, SED, Mealybug, Water Stress และ Nutrient Deficiency ยังมีข้อมูลติดป้ายไม่พอ จึงไม่สร้างผลวินิจฉัยจากภาพแบบปลอม' : 'CAD, SED, Mealybug, Water Stress and Nutrient Deficiency lack sufficient labelled data, so the app does not fabricate image diagnoses.'}
              </div>
              <div className="rounded-xl border hair p-3 txt-soft">
                {th ? 'ข้อมูลอากาศเป็นผลแบบจำลองจากผู้ให้บริการ และภาพดาวเทียมอาจล่าช้าจากเมฆหรือรอบการผ่าน' : 'Weather is provider model output, and satellite imagery can be delayed by cloud cover or revisit timing.'}
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
