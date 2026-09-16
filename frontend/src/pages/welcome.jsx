/* Public welcome page: a clear, polished entry point without reintroducing login. */
(function () {
  const { Card, Badge, Icon } = window.CG.UI;

  function WelcomePage({ go }) {
    const { lang } = window.CG.Store.useStore();
    const th = lang === 'th';
    const features = th ? [
      ['brain', 'วิเคราะห์ภาพด้วย AI', 'จำแนกเฉพาะ 5 คลาสหลักที่มีโมเดลรองรับ'],
      ['satellite', 'ข้อมูลแปลงแบบรอบด้าน', 'ดูอากาศ ภูมิประเทศ ภาพดาวเทียม และประวัติร่วมกับผลจากภาพ'],
      ['book', 'มีคู่มือทุกขั้นตอน', 'แนะนำการถ่ายภาพ อ่าน Confidence และตรวจยืนยันผลก่อนตัดสินใจ'],
    ] : [
      ['brain', 'AI image diagnosis', 'Diagnosis is restricted to the five model-backed primary classes.'],
      ['satellite', 'Whole-field context', 'Review weather, terrain, satellite and history alongside image evidence.'],
      ['book', 'Guidance at every step', 'Learn photo capture, confidence interpretation and field verification before acting.'],
    ];

    return (
      <div className="space-y-6 pb-10">
        <section className="relative overflow-hidden rounded-[2rem] min-h-[420px] glass animate-fadeup">
          <div className="absolute right-[6%] top-[10%] hidden lg:grid w-56 h-56 rounded-[3rem] place-items-center rotate-6" style={{ background: 'var(--cg-brand-softer)' }}>
            <div className="w-32 h-32 rounded-[2.2rem] grad-brand grid place-items-center text-white shadow-2xl -rotate-6">
              <Icon name="leaf" className="w-16 h-16 rotate-6" />
            </div>
            <span className="absolute -left-10 top-6 glass rounded-2xl px-3 py-2 text-xs txt-soft shadow-md">AI + Field data</span>
            <span className="absolute -right-8 bottom-4 rounded-2xl px-3 py-2 text-xs font-bold shadow-md" style={{ background: 'var(--cg-warm-soft)', color: 'var(--cg-warm-ink)' }}>{th ? '5 คลาสหลัก' : '5 primary classes'}</span>
          </div>

          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 max-w-3xl">
            <Badge tone="online" dot>{th ? 'ระบบออนไลน์ · พร้อมเริ่มใช้งาน' : 'System online · Ready to begin'}</Badge>
            <h2 className="txt text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mt-6">
              {th ? 'ดูแลมันสำปะหลัง' : 'Protect cassava'}<br />
              <span className="grad-text">{th ? 'ด้วยข้อมูลและ AI' : 'with data and AI'}</span>
            </h2>
            <p className="txt-soft text-base sm:text-lg leading-relaxed mt-5 max-w-2xl">
              {th
                ? 'CassavaGuard รวมภาพถ่ายจากแปลง อากาศ ภูมิประเทศ และดาวเทียม เพื่อช่วยคัดกรองความเสี่ยงและติดตามสุขภาพพืชในที่เดียว'
                : 'CassavaGuard combines field photos, weather, terrain and satellite evidence to screen risks and monitor crop health in one place.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button onClick={() => go('predict')} className="primary-action px-6">
                <Icon name="brain" className="w-5 h-5" />{th ? 'เริ่มวิเคราะห์ภาพ' : 'Start image analysis'}
              </button>
              <button onClick={() => go('guide')} className="secondary-action px-6">
                <Icon name="book" className="w-5 h-5 text-brand-500" />{th ? 'ดูคู่มือการใช้งาน' : 'Open user guide'}
              </button>
            </div>
            <button onClick={() => go('dashboard')} className="txt-dim hover:txt text-sm mt-5 inline-flex items-center gap-2 transition">
              {th ? 'หรือเปิดแดชบอร์ดภาพรวม' : 'Or open the overview dashboard'} <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {features.map(([icon, title, body], index) => (
            <Card key={title} hover className="animate-fadeup relative overflow-hidden" style={{ animationDelay: `${index * 70}ms` }}>
              <div className="cg-section-icon"><Icon name={icon} /></div>
              <h3 className="txt font-bold mt-4 text-lg">{title}</h3>
              <p className="txt-soft text-sm leading-relaxed mt-2">{body}</p>
            </Card>
          ))}
        </section>

        <section>
          <Card className="animate-fadeup">
            <h3 className="txt font-bold text-lg">{th ? 'เกี่ยวกับ CassavaGuard' : 'About CassavaGuard'}</h3>
            <div className="txt-soft text-sm leading-relaxed mt-3 space-y-3">
              {th ? (
                <>
                  <p>CassavaGuard เป็นแอปพลิเคชันบนโทรศัพท์มือถือที่ใช้ปัญญาประดิษฐ์ (AI) เพื่อช่วยเกษตรกรผู้ปลูกมันสำปะหลังในการติดตามสุขภาพของพืชและคัดกรองโรคเบื้องต้น โครงการนี้พัฒนาขึ้นเพื่อแก้ไขปัญหาการผลิตมันสำปะหลัง เช่น การระบาดของโรค และการพึ่งพาการสังเกตด้วยสายตาของเกษตรกรเพียงอย่างเดียว ซึ่งอาจทำให้การจัดการพืชล่าช้าหรือไม่แม่นยำ</p>
                  <p>แอปพลิเคชันวิเคราะห์ภาพใบมันสำปะหลังร่วมกับสภาพอากาศ ภูมิประเทศ และข้อมูลดาวเทียม เพื่อระบุสภาพของพืชในกลุ่มโรคหลัก ได้แก่ Healthy, CBB, CBSD, CMD และ CGM พร้อมแสดงระดับความมั่นใจ ความรุนแรง Heatmap และคำแนะนำที่อ้างอิงหลักฐานของแปลง</p>
                  <p>แอปพลิเคชันนี้ช่วยให้เกษตรกรได้รับข้อมูลที่รวดเร็ว สะดวก และใช้อ้างอิงประกอบการตัดสินใจ เพื่อสนับสนุนการเกษตรแม่นยำ ลดความสูญเสียจากการตรวจพบโรคล่าช้า และวางแผนจัดการแปลงได้ทันท่วงทีมากขึ้น การประเมินภาวะขาดธาตุอาหารและการคาดการณ์ผลผลิตเป็นทิศทางการพัฒนาต่อไปของโครงการ ซึ่งจะเปิดใช้งานเมื่อมีข้อมูลจริงเพียงพอสำหรับฝึกโมเดลอย่างน่าเชื่อถือ</p>
                  <p>ปัจจุบันระบบอยู่ในขั้นผู้ช่วยคัดกรองเบื้องต้น และยังต้องผ่านการทดสอบภาคสนามอย่างเป็นทางการก่อนนำไปใช้ในการตัดสินใจทางการเกษตรโดยอัตโนมัติ ผลวิเคราะห์จากระบบจึงเป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่ผลวินิจฉัยยืนยันที่ใช้แทนผู้เชี่ยวชาญได้</p>
                </>
              ) : (
                <>
                  <p>CassavaGuard is a mobile application that uses artificial intelligence (AI) to help cassava farmers monitor plant health and screen for disease early. The project was built to address problems in cassava production such as disease outbreaks and reliance on visual inspection alone, which can delay or reduce the accuracy of crop management decisions.</p>
                  <p>The application analyzes cassava leaf photos with weather, terrain and satellite evidence to identify the primary classes — Healthy, CBB, CBSD, CMD and CGM — and provides confidence, severity, a heatmap and field-grounded guidance.</p>
                  <p>The application gives farmers fast, convenient information to support decision-making, enabling precision agriculture, reducing losses from delayed disease detection, and allowing more timely field management. Nutrient-deficiency assessment and yield forecasting are future directions for the project, to be enabled once enough real data exists to train those models reliably.</p>
                  <p>The system is currently at the stage of an early screening assistant and still requires formal field validation before its output can be used to automate agricultural decisions. Results from the system are decision-support information, not a confirmed diagnosis that replaces an expert.</p>
                </>
              )}
            </div>
          </Card>
        </section>

        <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
          <Card className="animate-fadeup">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ background: 'var(--cg-warm-soft)', color: 'var(--cg-warm-ink)' }}><Icon name="alert" /></div>
              <div className="flex-1">
                <h3 className="txt font-semibold">{th ? 'AI ช่วยคัดกรอง ไม่ใช่ผลยืนยันจากห้องปฏิบัติการ' : 'AI screening is not laboratory confirmation'}</h3>
                <p className="txt-soft text-xs leading-relaxed mt-1">{th ? 'ตรวจต้นจริง เปรียบเทียบหลายภาพ และปรึกษาผู้เชี่ยวชาญก่อนถอนต้นหรือใช้สารเคมี' : 'Inspect plants, compare multiple photos and consult an expert before roguing or chemical treatment.'}</p>
              </div>
              <button onClick={() => go('system')} className="secondary-action px-4 py-2 min-h-0 text-xs">{th ? 'ดูสถานะโมเดล' : 'Model status'}</button>
            </div>
          </Card>
          <Card className="animate-fadeup" style={{ background: 'var(--cg-brand-softer)' }}>
            <div className="flex items-center justify-between gap-4 h-full">
              <div><div className="txt-dim text-xs">{th ? 'แนะนำสำหรับครั้งแรก' : 'Recommended first step'}</div><div className="txt font-bold mt-1">{th ? 'สร้างแปลงด้วยพิกัดจริง' : 'Create a field with real coordinates'}</div></div>
              <button onClick={() => go('map')} className="w-12 h-12 rounded-xl grad-brand text-white grid place-items-center hover:scale-105 transition shrink-0"><Icon name="map" /></button>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Welcome = WelcomePage;
})();
