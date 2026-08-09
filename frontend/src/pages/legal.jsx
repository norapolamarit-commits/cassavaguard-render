/* Public-facing privacy, terms and contact information. */
(function () {
  const { Card, Icon, Badge } = window.CG.UI;

  function LegalPage() {
    const { lang } = window.CG.Store.useStore();
    const th = lang === 'th';
    const sections = th ? [
      ['privacy', 'ความเป็นส่วนตัว', 'ระบบรับข้อมูลแปลง พิกัด ภาพพืช ผลตรวจดิน และประวัติการวิเคราะห์เพื่อให้บริการตามที่ผู้ใช้ร้องขอ หลีกเลี่ยงการอัปโหลดใบหน้า เอกสาร ป้ายทะเบียน หรือข้อมูลส่วนบุคคลที่ไม่เกี่ยวข้อง'],
      ['database', 'การเก็บและลบข้อมูล', 'ผลวิเคราะห์และ metadata ถูกบันทึกในฐานข้อมูล ส่วนภาพอาจถูกเก็บในพื้นที่ไฟล์ ผู้ใช้สามารถลบผลและภาพที่เกี่ยวข้องจากเมนูประวัติ การสำรองข้อมูลอาจคงอยู่ตามรอบการสำรองของผู้ให้บริการ'],
      ['users', 'การเข้าถึงในเวอร์ชันปัจจุบัน', 'ระบบไม่บังคับ Login ผู้ที่มี URL อาจเห็นและใช้งานข้อมูลชุดเดียวกัน จึงไม่ควรใส่ข้อมูลลับหรือข้อมูลส่วนบุคคลจนกว่าจะเปิดระบบบัญชีผู้ใช้'],
      ['alert', 'เงื่อนไขการใช้ AI', 'ผล AI เป็นการคัดกรอง ไม่ใช่การยืนยันจากห้องปฏิบัติการ ห้ามใช้เป็นเหตุผลเดียวในการถอนต้น ใช้สารเคมี หรือดำเนินการที่อาจสร้างความเสียหาย'],
      ['cloud', 'บริการภายนอก', 'ข้อมูลอากาศมาจาก Open-Meteo และข้อมูลดาวเทียมมาจาก Sentinel-2/Earth Search ข้อมูลอาจล่าช้า ไม่ครบ หรือไม่พร้อมใช้งานชั่วคราว'],
      ['mail', 'ติดต่อผู้ดูแล', 'หากต้องการแจ้งปัญหา ขอแก้ไข หรือลบข้อมูลเพิ่มเติม โปรดติดต่อผู้ดูแลผ่าน Repository: github.com/norapolamarit-commits/cassavaguard-render'],
    ] : [
      ['privacy', 'Privacy', 'The service processes field details, coordinates, crop photos, measured soil results and prediction history to provide requested features. Do not upload faces, documents, licence plates or unrelated personal data.'],
      ['database', 'Storage and deletion', 'Predictions and metadata are stored in the database, while images may be stored as files. Delete a result and its related images from History. Backups may remain according to the provider backup cycle.'],
      ['users', 'Current access model', 'Login is not required. Anyone with the URL may access the same shared dataset, so do not enter confidential or personal information until user accounts are enabled.'],
      ['alert', 'AI terms', 'AI results are screening support, not laboratory confirmation. Never use them as the sole basis for roguing, chemical treatment or other potentially harmful action.'],
      ['cloud', 'External services', 'Weather is provided by Open-Meteo and satellite observations by Sentinel-2/Earth Search. Data can be delayed, incomplete or temporarily unavailable.'],
      ['mail', 'Contact', 'To report a problem or request further correction or deletion, contact the administrator through github.com/norapolamarit-commits/cassavaguard-render.'],
    ];
    return <div className="space-y-5 max-w-5xl mx-auto pb-10">
      <Card className="animate-fadeup bg-gradient-to-br from-brand-500/10 to-cyan2/5">
        <Badge tone="info">{th ? 'ปรับปรุงล่าสุด 9 สิงหาคม 2569' : 'Last updated 9 August 2026'}</Badge>
        <h2 className="txt text-2xl sm:text-3xl font-black mt-4">{th ? 'ความเป็นส่วนตัว เงื่อนไข และการติดต่อ' : 'Privacy, terms and contact'}</h2>
        <p className="txt-soft text-sm leading-relaxed mt-2">{th ? 'ข้อมูลสำคัญที่ควรอ่านก่อนอัปโหลดภาพหรือบันทึกข้อมูลแปลง' : 'Important information to read before uploading photos or recording field data.'}</p>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map(([icon, title, body]) => <Card key={title} className="animate-fadeup">
          <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-300 grid place-items-center shrink-0"><Icon name={icon} /></div>
            <div><h3 className="txt font-bold">{title}</h3><p className="txt-soft text-sm leading-relaxed mt-2">{body}</p></div></div>
        </Card>)}
      </div>
    </div>;
  }
  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Legal = LegalPage;
})();
