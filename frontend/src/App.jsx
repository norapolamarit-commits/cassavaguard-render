/* CassavaGuard consumer shell: photo-first, calm, and touch-friendly. */
(function () {
  const { useState, useEffect, useCallback } = React;
  const { Icon, ToastHost, Modal } = window.CG.UI;
  const P = window.CG.Pages;
  const PRIMARY = [
    { key: 'predict', icon: 'camera', th: 'วิเคราะห์', en: 'Analyze' },
    { key: 'history', icon: 'history', th: 'ประวัติ', en: 'History' },
    { key: 'recommendations', icon: 'bulb', th: 'คำแนะนำ', en: 'Advice' },
    { key: 'weather', icon: 'cloud', th: 'อากาศ', en: 'Weather' },
  ];
  const MORE = [
    { key: 'map', icon: 'map', th: 'แผนที่แปลง', en: 'Field map' },
    { key: 'satellite', icon: 'satellite', th: 'ข้อมูลดาวเทียม', en: 'Satellite' },
    { key: 'dashboard', icon: 'grid', th: 'ภาพรวมข้อมูล', en: 'Overview' },
    { key: 'system', icon: 'cpu', th: 'สถานะ AI', en: 'AI status' },
    { key: 'guide', icon: 'book', th: 'วิธีใช้งาน', en: 'How to use' },
    { key: 'legal', icon: 'privacy', th: 'ความเป็นส่วนตัว', en: 'Privacy' },
  ];

  function App() {
    const { lang, theme, toggleTheme, toggleLang, user, booted } = window.CG.Store.useStore();
    const [route, setRoute] = useState('predict');
    const [routeArg, setRouteArg] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const label = (item) => lang === 'th' ? item.th : item.en;
    const go = useCallback((next, arg = null) => {
      setRoute(next); setRouteArg(arg); setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
      if (!user) return;
      window.CG.API_CLIENT.classes().then((classes) => {
        window.CG._classMap = {};
        classes.forEach((item) => { window.CG._classMap[item.key] = item; });
      }).catch(() => {});
    }, [user]);

    if (!booted) return <div className="min-h-screen theme-bg grid place-items-center"><div className="brand-orbit"><Icon name="leaf" className="w-7 h-7" /></div></div>;
    if (!user) return <div className="min-h-screen theme-bg grid place-items-center px-6 text-center"><div><div className="txt text-xl font-bold">CassavaGuard AI</div><p className="txt-soft mt-2">{lang === 'th' ? 'ไม่สามารถเชื่อมต่อ API ได้ กรุณาตรวจสอบว่า backend กำลังทำงาน' : 'Unable to connect to the API. Check that the backend is running.'}</p></div></div>;

    const renderPage = () => {
      switch (route) {
        case 'predict': return <P.Predict />;
        case 'history': return <P.History />;
        case 'recommendations': return <P.Recommendations initialField={routeArg} />;
        case 'weather': return <P.Weather initialField={routeArg} />;
        case 'map': return <P.FieldMap go={go} />;
        case 'satellite': return <P.Satellite initialField={routeArg} />;
        case 'dashboard': return <P.Dashboard go={go} />;
        case 'system': return <P.System />;
        case 'guide': return <P.Guide />;
        case 'legal': return <P.Legal />;
        default: return <P.Predict />;
      }
    };
    const current = [...PRIMARY, ...MORE].find((item) => item.key === route);
    const pageDescriptions = {
      history: { th: 'ย้อนดูผลวิเคราะห์และติดตามการเปลี่ยนแปลง', en: 'Review analyses and track changes over time' },
      recommendations: { th: 'แนวทางดูแลที่เชื่อมกับผลวิเคราะห์ล่าสุด', en: 'Care guidance linked to your latest results' },
      weather: { th: 'สภาพอากาศจริงสำหรับวางแผนงานในแปลง', en: 'Live weather context for field planning' },
      map: { th: 'ดูตำแหน่งและสถานะของแต่ละแปลง', en: 'View the location and status of every field' },
      satellite: { th: 'ติดตามความเขียวและการเปลี่ยนแปลงจากดาวเทียม', en: 'Track vegetation and change from satellite data' },
      dashboard: { th: 'สรุปสิ่งสำคัญจากทุกแปลงในหน้าเดียว', en: 'The important signals across all fields' },
      system: { th: 'ข้อมูลโมเดล คุณภาพ และความพร้อมของระบบ', en: 'Model quality, evidence, and system readiness' },
      guide: { th: 'ถ่ายภาพและอ่านผลให้ถูกต้อง', en: 'Capture better photos and understand results' },
      legal: { th: 'การใช้ข้อมูล ข้อจำกัด และช่องทางติดต่อ', en: 'Data use, limitations, and contact information' },
    };

    return (
      <div className="min-h-screen theme-bg pb-24 md:pb-0">
        <a href="#main-content" className="skip-link">{lang === 'th' ? 'ข้ามไปยังเนื้อหาหลัก' : 'Skip to main content'}</a>
        <header className="sticky top-0 z-[800] app-header">
          <div className="max-w-7xl mx-auto h-[72px] px-4 sm:px-6 flex items-center gap-4">
            <button onClick={() => go('predict')} className="flex items-center gap-3 shrink-0" aria-label="CassavaGuard">
              <span className="brand-mark"><Icon name="leaf" className="w-6 h-6" /></span>
              <span className="hidden sm:block text-left"><span className="txt block font-extrabold text-base leading-none">CassavaGuard</span><span className="brand-copy block mt-1">AI ตรวจสุขภาพมันสำปะหลัง</span></span>
            </button>
            <nav className="hidden md:flex items-center justify-center gap-1 ml-auto" aria-label={lang === 'th' ? 'เมนูหลัก' : 'Main navigation'}>
              {PRIMARY.map((item) => <NavButton key={item.key} item={item} active={route === item.key} text={label(item)} onClick={() => go(item.key)} />)}
              <button onClick={() => setMenuOpen(true)} className="nav-pill txt-soft"><Icon name="grid" className="w-4 h-4" />{lang === 'th' ? 'เพิ่มเติม' : 'More'}</button>
            </nav>
            <div className="flex items-center gap-2 md:ml-3 ml-auto">
              <button onClick={toggleLang} className="utility-button" aria-label={lang === 'th' ? 'เปลี่ยนเป็นภาษาอังกฤษ' : 'Switch to Thai'}>{lang === 'th' ? 'EN' : 'ไทย'}</button>
              <button onClick={toggleTheme} className="utility-button square" aria-label={lang === 'th' ? 'เปลี่ยนธีม' : 'Change theme'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" /></button>
              <button onClick={() => setMenuOpen(true)} className="utility-button square md:hidden" aria-label={lang === 'th' ? 'เปิดเมนู' : 'Open menu'}><Icon name="menu" className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        {route !== 'predict' && <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-7"><div className="route-heading"><span className="page-icon"><Icon name={current?.icon || 'leaf'} className="w-5 h-5" /></span><div><h1 className="txt text-2xl sm:text-3xl font-extrabold">{current ? label(current) : 'CassavaGuard'}</h1>{pageDescriptions[route] && <p className="txt-soft text-sm mt-1">{lang === 'th' ? pageDescriptions[route].th : pageDescriptions[route].en}</p>}</div></div></div>}
        <main id="main-content" tabIndex="-1" className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-7"><div key={route} className="page-enter">{renderPage()}</div></main>

        <nav className="mobile-dock md:hidden" aria-label={lang === 'th' ? 'เมนูหลัก' : 'Main navigation'}>
          {PRIMARY.slice(0, 3).map((item) => <DockButton key={item.key} item={item} active={route === item.key} text={label(item)} onClick={() => go(item.key)} />)}
          <DockButton item={{ icon: 'menu' }} active={MORE.some((item) => item.key === route) || route === 'weather'} text={lang === 'th' ? 'เมนู' : 'Menu'} onClick={() => setMenuOpen(true)} />
        </nav>

        <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title={lang === 'th' ? 'เมนูทั้งหมด' : 'All features'}>
          <div className="grid grid-cols-2 gap-3">
            {[...PRIMARY, ...MORE].map((item) => <button key={item.key} onClick={() => go(item.key)} className={`menu-tile ${route === item.key ? 'active' : ''}`}><span className="menu-tile-icon"><Icon name={item.icon} className="w-5 h-5" /></span><span>{label(item)}</span></button>)}
          </div>
        </Modal>
        <AdviceChatbot lang={lang} />
        <ToastHost />
      </div>
    );
  }

  function NavButton({ item, active, text, onClick }) {
    return <button onClick={onClick} className={`nav-pill ${active ? 'active' : 'txt-soft'}`}><Icon name={item.icon} className="w-4 h-4" />{text}</button>;
  }
  function DockButton({ item, active, text, onClick }) {
    return <button onClick={onClick} className={`dock-item ${active ? 'active' : ''}`}><Icon name={item.icon} className="w-5 h-5" /><span>{text}</span></button>;
  }
  function AdviceChatbot({ lang }) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const messagesRef = React.useRef(null);
    const [messages, setMessages] = useState([{ role: 'assistant', text: lang === 'th' ? 'สวัสดีครับ ผมช่วยอธิบายผลล่าสุดและแนะนำขั้นตอนดูแลได้' : 'Hello. I can explain your latest result and suggest next care steps.' }]);
    React.useEffect(() => {
      if (!open) return undefined;
      const scrollY = window.scrollY;
      document.documentElement.classList.add('chat-modal-open');
      return () => {
        document.documentElement.classList.remove('chat-modal-open');
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      };
    }, [open]);
    const send = async (value) => {
      const text = (value || input).trim(); if (!text || busy) return;
      setMessages((items) => [...items, { role: 'user', text }]); setInput(''); setBusy(true);
      try {
        const result = await window.CG.API_CLIENT.chat(text, lang);
        setMessages((items) => [...items, {
          role: 'assistant', text: result.reply, quick: result.quick_replies,
          source: result.llm_used ? `LLM · ${result.model}` : (lang === 'th' ? 'คำแนะนำสำรองที่ตรวจสอบแล้ว' : 'Verified fallback guidance')
        }]);
      } catch (error) {
        setMessages((items) => [...items, { role: 'assistant', text: error.message || (lang === 'th' ? 'เชื่อมต่อผู้ช่วยไม่ได้' : 'Assistant unavailable') }]);
      } finally { setBusy(false); }
    };
    React.useEffect(() => {
      const box = messagesRef.current;
      if (box) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    }, [messages, busy]);
    return <div className={`advice-chat ${open ? 'open' : ''}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
      {open && <button type="button" className="advice-chat-backdrop" onClick={() => setOpen(false)} aria-label={lang === 'th' ? 'ปิดผู้ช่วย' : 'Close assistant'} />}
      {open && <section className="advice-chat-panel" aria-label={lang === 'th' ? 'ผู้ช่วยแนะนำ' : 'Advice assistant'} onClick={(event) => event.stopPropagation()}>
        <header><div><b>{lang === 'th' ? 'ผู้ช่วย CassavaGuard' : 'CassavaGuard Assistant'}</b><span>{lang === 'th' ? 'อ้างอิงผลวิเคราะห์ล่าสุด' : 'Grounded in your latest result'}</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Close"><Icon name="close" className="w-5 h-5" /></button></header>
        <div ref={messagesRef} className="advice-chat-messages" aria-live="polite">{messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}><p>{message.text}</p>{message.source && <span className="chat-source">{message.source}</span>}{message.quick && <div className="chat-quick">{message.quick.map((item) => <button type="button" key={item} onClick={() => send(item)}>{item}</button>)}</div>}</div>)}{busy && <div className="chat-message assistant"><Spinner className="w-4 h-4" /></div>}</div>
        <form onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); send(); }}><input maxLength="500" value={input} onChange={(event) => setInput(event.target.value)} placeholder={lang === 'th' ? 'ถามเรื่องผล โรค น้ำ ปุ๋ย หรือผลผลิต…' : 'Ask about results, disease, water, fertilizer…'} /><button type="submit" disabled={busy || !input.trim()}><Icon name="play" className="w-4 h-4" /></button></form>
        <small>{lang === 'th' ? 'คำแนะนำเพื่อคัดกรอง ไม่แทนผู้เชี่ยวชาญหรือผลห้องปฏิบัติการ' : 'Screening guidance; not a substitute for expert or laboratory confirmation.'}</small>
      </section>}
      <button type="button" className="advice-chat-fab" onClick={() => setOpen((value) => !value)} aria-label={lang === 'th' ? 'เปิดผู้ช่วยแนะนำ' : 'Open advice assistant'}><Icon name={open ? 'close' : 'bulb'} className="w-6 h-6" /><span>{lang === 'th' ? 'ถามผู้ช่วย' : 'Ask'}</span></button>
    </div>;
  }
  window.CG.App = App;
})();
