/* Public welcome page: a clear, polished entry point without reintroducing login. */
(function () {
  const { Card, Badge, Icon } = window.CG.UI;

  function WelcomePage({ go }) {
    const { lang } = window.CG.Store.useStore();
    const th = lang === 'th';
    const features = th ? [
      ['brain', 'วิเคราะห์ภาพด้วย AI', 'จำแนกโรคหลัก พร้อมตรวจ Brown Leaf Spot, White Leaf Spot และ Whitefly แบบโปร่งใส'],
      ['satellite', 'ข้อมูลแปลงแบบรอบด้าน', 'ดูอากาศ ภาพดาวเทียม ดิน และประวัติร่วมกับผลจากภาพ'],
      ['book', 'มีคู่มือทุกขั้นตอน', 'แนะนำการถ่ายภาพ อ่าน Confidence และตรวจยืนยันผลก่อนตัดสินใจ'],
    ] : [
      ['brain', 'AI image diagnosis', 'Primary disease classification plus transparent Brown Leaf Spot, White Leaf Spot and Whitefly checks.'],
      ['satellite', 'Whole-field context', 'Review weather, satellite, soil and history alongside image evidence.'],
      ['book', 'Guidance at every step', 'Learn photo capture, confidence interpretation and field verification before acting.'],
    ];

    return (
      <div className="space-y-6 pb-10">
        <section className="relative overflow-hidden rounded-[2rem] border hair min-h-[470px] glass animate-fadeup">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-cyan2/10" />
          <div className="absolute -top-28 -right-16 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-cyan2/15 blur-3xl" />
          <div className="absolute right-[8%] top-[14%] hidden lg:grid w-60 h-60 rounded-full border border-brand-400/20 place-items-center">
            <div className="absolute inset-5 rounded-full border border-cyan2/20 animate-spin" style={{ animationDuration: '18s' }} />
            <div className="w-32 h-32 rounded-[2.5rem] grad-brand grid place-items-center text-white shadow-2xl shadow-brand-500/40 rotate-6">
              <Icon name="leaf" className="w-16 h-16 -rotate-6" />
            </div>
            <span className="absolute -left-8 top-9 glass rounded-2xl px-3 py-2 text-xs txt-soft">AI + Field data</span>
            <span className="absolute -right-10 bottom-8 glass rounded-2xl px-3 py-2 text-xs text-brand-300">{th ? '5 คลาสหลัก + ผลเสริม' : '5 primary + auxiliary'}</span>
          </div>

          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20 max-w-3xl">
            <Badge tone="online" dot>{th ? 'ระบบออนไลน์ · พร้อมเริ่มใช้งาน' : 'System online · Ready to begin'}</Badge>
            <h2 className="txt text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mt-6">
              {th ? 'ดูแลมันสำปะหลัง' : 'Protect cassava'}<br />
              <span className="grad-text">{th ? 'ด้วยข้อมูลและ AI' : 'with data and AI'}</span>
            </h2>
            <p className="txt-soft text-base sm:text-lg leading-relaxed mt-5 max-w-2xl">
              {th
                ? 'CassavaGuard รวมภาพถ่ายจากแปลง อากาศ ดาวเทียม และข้อมูลดิน เพื่อช่วยคัดกรองความเสี่ยงและติดตามสุขภาพพืชในที่เดียว'
                : 'CassavaGuard combines field photos, weather, satellite and soil evidence to screen risks and monitor crop health in one place.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button onClick={() => go('predict')} className="grad-brand text-white rounded-2xl px-6 py-3.5 font-bold flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 hover:scale-[1.02] active:scale-[.98] transition">
                <Icon name="brain" className="w-5 h-5" />{th ? 'เริ่มวิเคราะห์ภาพ' : 'Start image analysis'}
              </button>
              <button onClick={() => go('guide')} className="glass rounded-2xl px-6 py-3.5 txt font-semibold flex items-center justify-center gap-2 hover:bg-white/[.07] transition">
                <Icon name="book" className="w-5 h-5 text-brand-300" />{th ? 'ดูคู่มือการใช้งาน' : 'Open user guide'}
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
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-cyan2/10 text-brand-300 grid place-items-center"><Icon name={icon} /></div>
              <h3 className="txt font-bold mt-4">{title}</h3>
              <p className="txt-soft text-sm leading-relaxed mt-2">{body}</p>
            </Card>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
          <Card className="animate-fadeup">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 grid place-items-center shrink-0"><Icon name="alert" /></div>
              <div className="flex-1">
                <h3 className="txt font-semibold">{th ? 'AI ช่วยคัดกรอง ไม่ใช่ผลยืนยันจากห้องปฏิบัติการ' : 'AI screening is not laboratory confirmation'}</h3>
                <p className="txt-soft text-xs leading-relaxed mt-1">{th ? 'ตรวจต้นจริง เปรียบเทียบหลายภาพ และปรึกษาผู้เชี่ยวชาญก่อนถอนต้นหรือใช้สารเคมี' : 'Inspect plants, compare multiple photos and consult an expert before roguing or chemical treatment.'}</p>
              </div>
              <button onClick={() => go('system')} className="rounded-xl border hair px-4 py-2 txt-soft hover:txt text-xs font-semibold transition">{th ? 'ดูสถานะโมเดล' : 'Model status'}</button>
            </div>
          </Card>
          <Card className="animate-fadeup bg-gradient-to-br from-brand-500/10 to-cyan2/5">
            <div className="flex items-center justify-between gap-4 h-full">
              <div><div className="txt-dim text-xs">{th ? 'แนะนำสำหรับครั้งแรก' : 'Recommended first step'}</div><div className="txt font-bold mt-1">{th ? 'สร้างแปลงด้วยพิกัดจริง' : 'Create a field with real coordinates'}</div></div>
              <button onClick={() => go('map')} className="w-11 h-11 rounded-xl grad-brand text-white grid place-items-center hover:scale-105 transition"><Icon name="map" /></button>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Welcome = WelcomePage;
})();
