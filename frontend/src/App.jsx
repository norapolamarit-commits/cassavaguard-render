/* CassavaGuard consumer shell: photo-first, calm, and touch-friendly. */
(function () {
  const { useState, useEffect, useCallback } = React;
  const { Icon, ToastHost, Modal, Spinner } = window.CG.UI;
  const P = window.CG.Pages;
  // Mobile floating pill nav: 4 quick-reach items + a "Menu" pill for the rest.
  const PRIMARY = [
    { key: 'predict', icon: 'camera', th: 'วิเคราะห์', en: 'Analyze' },
    { key: 'history', icon: 'history', th: 'ประวัติ', en: 'History' },
    { key: 'system', icon: 'cpu', th: 'สถานะ AI', en: 'AI status' },
    { key: 'guide', icon: 'book', th: 'วิธีใช้งาน', en: 'How to use' },
  ];
  const MORE = [
    { key: 'legal', icon: 'privacy', th: 'ความเป็นส่วนตัว', en: 'Privacy' },
  ];
  // Desktop side rail: every destination in one flat icon+label list.
  const ALL_NAV = [...PRIMARY, ...MORE];

  function App() {
    const { lang, theme, toggleTheme, toggleLang, user, booted, logout, justLoggedIn, clearJustLoggedIn } = window.CG.Store.useStore();
    const [route, setRoute] = useState('predict');
    const [routeArg, setRouteArg] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [preAuthView, setPreAuthView] = useState(null); // null | 'guide' | 'legal'
    const [welcomeOpen, setWelcomeOpen] = useState(false);
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

    // Pop a quick-start guide right after a login/register/guest action
    // succeeds — not on every reload of an already-signed-in session.
    useEffect(() => {
      if (justLoggedIn) { setWelcomeOpen(true); clearJustLoggedIn(); }
    }, [justLoggedIn]);

    if (!booted) return <div className="min-h-screen theme-bg grid place-items-center"><div className="brand-orbit"><Icon name="leaf" className="w-7 h-7" /></div></div>;
    if (!user) {
      if (preAuthView) {
        return (
          <div className="min-h-screen theme-bg">
            <header className="content-topbar">
              <button onClick={() => setPreAuthView(null)} className="utility-button"><Icon name="chevron" className="w-4 h-4 rotate-180" />{lang === 'th' ? 'กลับไปเข้าสู่ระบบ' : 'Back to sign in'}</button>
            </header>
            <main className="max-w-4xl mx-auto w-full px-3 sm:px-6 py-6">{preAuthView === 'legal' ? <P.Legal /> : <P.Guide />}</main>
          </div>
        );
      }
      return <P.Auth onGuide={() => setPreAuthView('guide')} onPrivacy={() => setPreAuthView('legal')} />;
    }

    const renderPage = () => {
      switch (route) {
        case 'predict': return <P.Predict />;
        case 'history': return <P.History />;
        case 'system': return <P.System />;
        case 'guide': return <P.Guide />;
        case 'legal': return <P.Legal />;
        default: return <P.Predict />;
      }
    };
    const current = ALL_NAV.find((item) => item.key === route);
    const pageDescriptions = {
      history: { th: 'ย้อนดูผลวิเคราะห์และติดตามการเปลี่ยนแปลง', en: 'Review analyses and track changes over time' },
      system: { th: 'ข้อมูลโมเดล คุณภาพ และความพร้อมของระบบ', en: 'Model quality, evidence, and system readiness' },
      guide: { th: 'ถ่ายภาพและอ่านผลให้ถูกต้อง', en: 'Capture better photos and understand results' },
      legal: { th: 'การใช้ข้อมูล ข้อจำกัด และช่องทางติดต่อ', en: 'Data use, limitations, and contact information' },
    };

    return (
      <div className="min-h-screen theme-bg pb-28 md:pb-0">
        <a href="#main-content" className="skip-link">{lang === 'th' ? 'ข้ามไปยังเนื้อหาหลัก' : 'Skip to main content'}</a>

        {/* Desktop: wide labeled rail — icon + full-size text side by side,
            every destination in one flat readable list, no hidden "More". */}
        <nav className="side-rail" aria-label={lang === 'th' ? 'เมนูหลัก' : 'Main navigation'}>
          <button onClick={() => go('predict')} className="side-brand" aria-label="CassavaGuard">
            <span className="side-brand-mark brand-mark"><Icon name="leaf" className="w-5 h-5" /></span>
            <span className="txt font-extrabold text-base">CassavaGuard</span>
          </button>
          {ALL_NAV.map((item) => (
            <button key={item.key} onClick={() => go(item.key)} className={`side-item ${route === item.key ? 'active' : ''}`}>
              <Icon name={item.icon} className="side-item-icon" /><span>{label(item)}</span>
            </button>
          ))}
          <div className="side-rail-spacer" />
          <div className="side-foot">
            <button onClick={toggleLang} className="utility-button" aria-label={lang === 'th' ? 'เปลี่ยนเป็นภาษาอังกฤษ' : 'Switch to Thai'}><Icon name="globe" className="w-4 h-4" />{lang === 'th' ? 'เปลี่ยนเป็น English' : 'Switch to Thai'}</button>
            <button onClick={toggleTheme} className="utility-button" aria-label={lang === 'th' ? 'เปลี่ยนธีม' : 'Change theme'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />{theme === 'dark' ? (lang === 'th' ? 'โหมดสว่าง' : 'Light mode') : (lang === 'th' ? 'โหมดมืด' : 'Dark mode')}</button>
            <button onClick={logout} className="utility-button" title={user.full_name || user.email} aria-label={lang === 'th' ? 'ออกจากระบบ' : 'Log out'}><Icon name="logout" className="w-4 h-4" />{lang === 'th' ? 'ออกจากระบบ' : 'Log out'}</button>
          </div>
        </nav>

        <div className="app-main">
          {/* Slim contextual topbar — the one place a page's name/description shows. */}
          <header className="content-topbar">
            <span className="page-icon shrink-0"><Icon name={current?.icon || 'leaf'} className="w-4 h-4" /></span>
            <div className="min-w-0 flex-1">
              <h1 className="txt text-base sm:text-lg font-extrabold leading-tight truncate">{current ? label(current) : 'CassavaGuard'}</h1>
              {pageDescriptions[route] && <p className="txt-dim text-xs mt-0.5 truncate hidden sm:block">{lang === 'th' ? pageDescriptions[route].th : pageDescriptions[route].en}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0 md:hidden">
              <button onClick={toggleLang} className="utility-button square" aria-label={lang === 'th' ? 'เปลี่ยนเป็นภาษาอังกฤษ' : 'Switch to Thai'}><span className="text-[11px]">{lang === 'th' ? 'EN' : 'ไทย'}</span></button>
              <button onClick={toggleTheme} className="utility-button square" aria-label={lang === 'th' ? 'เปลี่ยนธีม' : 'Change theme'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" /></button>
            </div>
          </header>

          <main id="main-content" tabIndex="-1" className="w-full px-3 sm:px-6 py-4 sm:py-7"><div key={route} className="page-enter">{renderPage()}</div></main>
        </div>

        {/* Mobile: floating pill nav instead of a card-grid dock. */}
        <nav className="mobile-pill-nav md:hidden" aria-label={lang === 'th' ? 'เมนูหลัก' : 'Main navigation'}>
          {PRIMARY.map((item) => <PillButton key={item.key} item={item} active={route === item.key} label={label(item)} onClick={() => go(item.key)} />)}
          <PillButton item={{ icon: 'menu' }} active={MORE.some((m) => m.key === route)} label={lang === 'th' ? 'เมนู' : 'Menu'} cta onClick={() => setMenuOpen(true)} />
        </nav>

        <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title={lang === 'th' ? 'เมนูทั้งหมด' : 'All features'}>
          <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl" style={{ background: 'var(--cg-surface-2)' }}>
            <span className="brand-mark shrink-0" style={{ width: 40, height: 40 }}><Icon name="leaf" className="w-5 h-5" /></span>
            <div className="min-w-0 flex-1"><div className="txt font-bold text-sm truncate">{user.full_name || user.email}</div><div className="txt-soft text-xs truncate">{user.email}</div></div>
            <button onClick={logout} className="utility-button square shrink-0" aria-label={lang === 'th' ? 'ออกจากระบบ' : 'Log out'}><Icon name="logout" className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ALL_NAV.map((item) => <button key={item.key} onClick={() => go(item.key)} className={`menu-tile ${route === item.key ? 'active' : ''}`}><span className="menu-tile-icon"><Icon name={item.icon} className="w-5 h-5" /></span><span>{label(item)}</span></button>)}
          </div>
        </Modal>
        <WelcomeGuideModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} lang={lang} go={go} userName={user.full_name} />
        <AdviceChatbot lang={lang} />
        <ToastHost />
      </div>
    );
  }

  // Condensed 3-step quick-start, popped as a message right after sign-in —
  // not the full Guide page, just enough to get a first-time user moving.
  function WelcomeGuideModal({ open, onClose, lang, go, userName }) {
    const th = lang === 'th';
    const steps = th ? [
      ['camera', 'ถ่ายภาพต้นมันสำปะหลัง', 'ให้เห็นทั้งต้นในแสงธรรมชาติ ชัด ไม่ย้อนแสง'],
      ['brain', 'กด "วิเคราะห์"', 'ระบบ AI จำแนกโรคให้ภายในไม่กี่วินาที'],
      ['bulb', 'ดูผลและคำแนะนำ', 'อ่านความมั่นใจของผล แล้วทำตามคำแนะนำการดูแล'],
    ] : [
      ['camera', 'Photograph the plant', 'Show the whole plant in natural light, in focus.'],
      ['brain', 'Tap "Analyze"', 'The AI classifies the disease in a few seconds.'],
      ['bulb', 'Read the result', 'Check the confidence, then follow the care guidance.'],
    ];
    return (
      <Modal open={open} onClose={onClose} title={th ? `ยินดีต้อนรับ${userName ? ', ' + userName : ''} 🌿` : `Welcome${userName ? ', ' + userName : ''} 🌿`}>
        <p className="txt-soft text-sm leading-relaxed mb-4">{th ? 'เริ่มต้นใช้งาน CassavaGuard AI ง่ายๆ ใน 3 ขั้นตอน' : 'Get started with CassavaGuard AI in three simple steps.'}</p>
        <ol className="step-rail">
          {steps.map(([icon, title, body]) => (
            <li key={title} className="active">
              <span className="step-rail-dot"><Icon name={icon} className="w-4 h-4" /></span>
              <div><b>{title}</b><p>{body}</p></div>
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button onClick={() => { go('guide'); onClose(); }} className="secondary-action text-sm"><Icon name="book" className="w-4 h-4" />{th ? 'คู่มือฉบับเต็ม' : 'Full guide'}</button>
          <button onClick={onClose} className="primary-action text-sm"><Icon name="camera" className="w-4 h-4" />{th ? 'เริ่มใช้งานเลย' : 'Start now'}</button>
        </div>
      </Modal>
    );
  }

  function PillButton({ item, active, label, onClick, cta }) {
    return (
      <button onClick={onClick} className={`pill-item ${cta ? 'pill-cta' : ''} ${active ? 'active' : ''}`} aria-label={label} title={label}>
        <Icon name={item.icon} className={cta ? 'w-6 h-6' : 'w-5 h-5'} />
      </button>
    );
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
