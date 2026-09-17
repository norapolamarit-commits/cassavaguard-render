/* Authentication: login / register / forgot-reset. Warm split layout matching
   the rest of the app's design system. Renders outside <main>, so its form
   controls are sized explicitly here rather than relying on the global
   `main input` rule. */
(function () {
  const { useState, useEffect } = React;
  const { Icon, Spinner } = window.CG.UI;

  const DEMO = [
    { role: 'admin', email: 'admin@cassavaguard.ai', pw: 'admin123' },
    { role: 'researcher', email: 'researcher@cassavaguard.ai', pw: 'research123' },
    { role: 'farmer', email: 'farmer@cassavaguard.ai', pw: 'farmer123' },
  ];

  function AuthPage({ onGuide, onPrivacy }) {
    const { t, lang, toggleLang, theme, toggleTheme, login, register, toast } = window.CG.Store.useStore();
    const queryResetToken = new URLSearchParams(window.location.search).get('reset_token') || '';
    const [mode, setMode] = useState(queryResetToken ? 'reset' : 'login'); // login | register | forgot | reset
    const [resetToken, setResetToken] = useState(queryResetToken);
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [modelStats, setModelStats] = useState(null);
    const [numClasses, setNumClasses] = useState(null);
    const [publicConfig, setPublicConfig] = useState({
      demo_mode: false,
      environmental_data_mode: 'synthetic',
      public_registration: true,
      allow_guest_access: false,
      password_reset_available: false,
    });

    useEffect(() => {
      // Public model metadata is shown without exposing operational logs or private data.
      window.CG.API_CLIENT.health().then(setPublicConfig).catch(() => {});
      window.CG.API_CLIENT.models().then((r) => {
        setModelStats(r.models.find((m) => m.id === r.active) || r.models[0]);
      }).catch(() => {});
      window.CG.API_CLIENT.classes().then((r) => setNumClasses(r.length)).catch(() => {});
    }, []);

    const submit = async (e) => {
      e.preventDefault(); setBusy(true);
      try {
        if (mode === 'login') { await login(email, pw); toast(lang === 'th' ? 'ยินดีต้อนรับ' : 'Welcome back', 'success'); }
        else if (mode === 'register') { await register({ email, password: pw, full_name: name, language: lang }); toast(lang === 'th' ? 'สมัครสำเร็จ' : 'Account created', 'success'); }
        else if (mode === 'forgot') {
          const r = await window.CG.API_CLIENT.forgot(email);
          if (r.demo_token) {
            setResetToken(r.demo_token); setPw(''); setMode('reset');
            toast(lang === 'th' ? 'โหมดเดโม: ตั้งรหัสผ่านใหม่ได้เลย' : 'Demo mode: enter a new password', 'info');
          } else {
            toast(lang === 'th' ? 'หากมีบัญชีนี้ ระบบจะส่งลิงก์รีเซ็ตให้' : r.message, 'info');
            setMode('login');
          }
        } else {
          await window.CG.API_CLIENT.reset(resetToken, pw);
          window.history.replaceState({}, '', window.location.pathname);
          setPw(''); setMode('login');
          toast(lang === 'th' ? 'เปลี่ยนรหัสผ่านแล้ว' : 'Password updated', 'success');
        }
      } catch (err) { toast(err.message, 'error'); }
      finally { setBusy(false); }
    };

    const fillDemo = (d) => { setEmail(d.email); setPw(d.pw); setMode('login'); };

    // One-tap entry for someone who just wants to try the app: silently
    // registers a throwaway farmer account behind the scenes so there is no
    // form to fill in first.
    const [guestBusy, setGuestBusy] = useState(false);
    const continueAsGuest = async () => {
      setGuestBusy(true);
      try {
        const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        await register({
          email: `guest.${stamp}@cassavaguard.demo`,
          password: `Guest-${stamp}-${Math.random().toString(36).slice(2, 8)}`,
          full_name: lang === 'th' ? 'ผู้เยี่ยมชม' : 'Guest User',
          language: lang,
        });
        toast(lang === 'th' ? 'เข้าใช้งานแบบผู้เยี่ยมชมแล้ว' : 'Continuing as guest', 'success');
      } catch (err) { toast(err.message, 'error'); }
      finally { setGuestBusy(false); }
    };

    const heading = mode === 'login' ? t('login') : mode === 'register' ? t('register') : mode === 'reset' ? (lang === 'th' ? 'ตั้งรหัสผ่านใหม่' : 'Set new password') : t('forgot_pw');
    const subheading = mode === 'login' ? (lang === 'th' ? 'เข้าสู่แดชบอร์ดของคุณ' : 'Sign in to your dashboard')
      : mode === 'register' ? (lang === 'th' ? 'บัญชีใหม่จะเริ่มต้นเป็นเกษตรกร' : 'New accounts start with the Farmer role')
      : mode === 'reset' ? (lang === 'th' ? 'รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร' : 'Use at least 10 characters')
      : (lang === 'th' ? 'ระบบจะส่งลิงก์รีเซ็ตที่มีอายุ 30 นาที' : 'Receive a reset link valid for 30 minutes');
    const modeIcon = mode === 'register' ? 'user' : mode === 'reset' || mode === 'forgot' ? 'lock' : 'logout';

    // Safe, icon-only illustration: a big leaf badge with smaller leaves
    // floating around it — no hand-drawn paths, so nothing to get "crooked".
    const HeroArt = ({ size = 260 }) => (
      <div className="auth-hero-art" style={{ width: size, height: size }}>
        <div className="auth-hero-core"><Icon name="leaf" className="w-14 h-14" /></div>
        <div className="auth-hero-leaf l1"><Icon name="leaf" className="w-6 h-6" /></div>
        <div className="auth-hero-leaf l2"><Icon name="drop" className="w-5 h-5" /></div>
        <div className="auth-hero-leaf l3"><Icon name="sun" className="w-6 h-6" /></div>
        <div className="auth-hero-leaf l4"><Icon name="cloud" className="w-4 h-4" /></div>
      </div>
    );

    return (
      <div className="min-h-screen theme-bg grid lg:grid-cols-2">
        {/* brand side (desktop) */}
        <div className="relative hidden lg:flex flex-col justify-between p-14 overflow-hidden auth-dotgrid" style={{ background: 'var(--cg-brand-softer)' }}>
          <div className="absolute -right-24 top-1/4 w-[420px] h-[420px] rounded-full grad-brand opacity-[.16] blur-3xl animate-floaty" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full" style={{ background: 'var(--cg-warm-soft)', filter: 'blur(60px)' }} />
          <div className="relative flex items-center gap-3">
            <span className="brand-mark"><Icon name="leaf" className="w-6 h-6" /></span>
            <div><div className="txt font-extrabold text-lg">CassavaGuard <span className="grad-text">AI</span></div><div className="txt-dim text-sm">{t('app_tag')}</div></div>
          </div>
          <div className="relative grid xl:grid-cols-[1fr_260px] items-center gap-8">
            <div>
              <h1 className="txt text-4xl xl:text-5xl font-extrabold leading-tight">{lang === 'th' ? 'เกษตรแม่นยำ' : 'Precision agriculture'}<br /><span className="grad-text">{lang === 'th' ? 'ขับเคลื่อนด้วย AI' : 'powered by AI'}</span></h1>
              <p className="txt-soft text-base mt-5 max-w-md leading-relaxed">{lang === 'th' ? 'ระบบสนับสนุนการตัดสินใจสำหรับเกษตรกรมันสำปะหลัง — วิเคราะห์ภาพ สภาพอากาศ ภูมิประเทศ และดาวเทียมพร้อมหลักฐานอ้างอิง' : 'Decision support for cassava farmers using image diagnosis, weather, terrain, and satellite evidence.'}</p>
              <div className="flex gap-7 mt-9">
                {[
                  [modelStats && modelStats.accuracy != null ? (modelStats.accuracy * 100).toFixed(1) + '%' : '—', lang === 'th' ? 'ความแม่นยำ (จริง)' : 'Accuracy (real)'],
                  [numClasses != null ? String(numClasses) : '—', lang === 'th' ? 'คลาสโรค' : 'Classes'],
                  ['8/13', lang === 'th' ? 'คลาสที่มีโมเดลทำงาน' : 'classes with executable models'],
                ].map(([v, l], i) => (
                  <div key={i}><div className="grad-text text-3xl font-extrabold">{v}</div><div className="txt-dim text-xs mt-1 max-w-[9rem]">{l}</div></div>
                ))}
              </div>
            </div>
            <div className="hidden xl:block"><HeroArt size={260} /></div>
          </div>
          <div className="relative flex items-center justify-between">
            <span className="txt-dim text-xs">© 2026 CassavaGuard AI · Precision Agriculture Platform</span>
            <button onClick={onPrivacy} className="txt-dim hover:txt text-xs font-semibold underline underline-offset-2">{lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy policy'}</button>
          </div>
        </div>

        {/* form side */}
        <div className="flex items-center justify-center p-6 py-10">
          <div className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-4 lg:mb-6">
              <div className="lg:hidden flex items-center gap-2.5">
                <span className="brand-mark" style={{ width: 38, height: 38 }}><Icon name="leaf" className="w-5 h-5" /></span>
                <span className="txt font-extrabold">CassavaGuard AI</span>
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={toggleLang} className="utility-button" aria-label={lang === 'th' ? 'เปลี่ยนเป็นภาษาอังกฤษ' : 'Switch to Thai'}>{lang === 'th' ? 'EN' : 'ไทย'}</button>
                <button onClick={toggleTheme} className="utility-button square" aria-label={lang === 'th' ? 'เปลี่ยนธีม' : 'Change theme'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" /></button>
              </div>
            </div>

            {/* mobile-only hero: keeps the phone view from opening on a bare form */}
            <div className="lg:hidden flex flex-col items-center text-center mb-5">
              <HeroArt size={168} />
              <h1 className="txt text-2xl font-extrabold leading-tight mt-2">{lang === 'th' ? 'ดูแลมันสำปะหลัง' : 'Protect cassava'} <span className="grad-text">{lang === 'th' ? 'ด้วย AI' : 'with AI'}</span></h1>
              <p className="txt-soft text-sm mt-2 max-w-xs leading-relaxed">{lang === 'th' ? 'ถ่ายรูปเดียว รู้ผลทันที พร้อมคำแนะนำที่เข้าใจง่าย' : 'One photo, instant results, guidance you can act on.'}</p>
            </div>

            <div className="glass-strong rounded-3xl p-7 animate-fadeup">
              <div className="flex items-center gap-3.5">
                <span className="auth-mode-badge"><Icon name={modeIcon} className={`w-5 h-5 ${modeIcon === 'logout' ? 'rotate-180' : ''}`} /></span>
                <div>
                  <h2 className="txt text-2xl font-extrabold leading-tight">{heading}</h2>
                  <p className="txt-dim text-sm mt-0.5 leading-relaxed">{subheading}</p>
                </div>
              </div>
              <div className="mt-6">
              <form onSubmit={submit} className="space-y-4">
                {mode === 'register' && (
                  <Field icon="user" label={t('full_name')} value={name} onChange={setName} />
                )}
                {mode !== 'reset' && <Field icon="mail" label={t('email')} type="email" value={email} onChange={setEmail} required />}
                {mode !== 'forgot' && <Field icon="lock" label={t('password')} type="password" value={pw} onChange={setPw} required minLength={mode === 'login' ? undefined : 10} />}
                {mode === 'login' && publicConfig.password_reset_available && <button type="button" onClick={() => setMode('forgot')} className="text-sm font-semibold hover:underline" style={{ color: 'var(--cg-brand-strong)' }}>{t('forgot_pw')}</button>}

                {mode === 'register' && (
                  <p className="txt-dim text-xs leading-relaxed">
                    {lang === 'th' ? 'การสร้างบัญชีถือว่าคุณยอมรับ ' : 'By creating an account you agree to the '}
                    <button type="button" onClick={onPrivacy} className="font-semibold hover:underline" style={{ color: 'var(--cg-brand-strong)' }}>{lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}</button>
                  </p>
                )}

                <button disabled={busy} className="primary-action w-full">
                  {busy ? <Spinner className="w-5 h-5" /> : <Icon name="logout" className="w-4 h-4 rotate-180" />}
                  {mode === 'login' ? t('login') : mode === 'register' ? t('register') : mode === 'reset' ? (lang === 'th' ? 'บันทึกรหัสผ่าน' : 'Save password') : (lang === 'th' ? 'ส่งลิงก์' : 'Send link')}
                </button>
              </form>

              <div className="mt-5 text-center text-sm txt-soft">
                {mode === 'login' && publicConfig.public_registration ? (
                  <>{t('no_account')} <button onClick={() => setMode('register')} className="font-semibold hover:underline" style={{ color: 'var(--cg-brand-strong)' }}>{t('register')}</button></>
                ) : mode === 'register' || mode === 'forgot' ? (
                  <>{t('have_account')} <button onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: 'var(--cg-brand-strong)' }}>{t('login')}</button></>
                ) : null}
              </div>

              {publicConfig.allow_guest_access && (mode === 'login' || mode === 'register') && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px" style={{ background: 'var(--cg-border)' }} />
                    <span className="txt-dim text-xs font-bold uppercase tracking-wide">{lang === 'th' ? 'หรือ' : 'or'}</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--cg-border)' }} />
                  </div>
                  <button type="button" onClick={continueAsGuest} disabled={guestBusy} className="secondary-action w-full">
                    {guestBusy ? <Spinner className="w-5 h-5" /> : <Icon name="play" className="w-4 h-4" />}
                    {lang === 'th' ? 'ดำเนินการต่อแบบผู้เยี่ยมชม' : 'Continue as Guest'}
                  </button>
                  <p className="txt-dim text-xs text-center mt-2.5 leading-relaxed">{lang === 'th' ? 'สร้างบัญชีเกษตรกรชั่วคราวให้อัตโนมัติ ไม่ต้องกรอกฟอร์ม' : 'Creates a temporary Farmer account instantly — no form needed.'}</p>
                </>
              )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button onClick={onGuide} className="secondary-action text-sm">
                <Icon name="book" className="w-4 h-4" style={{ color: 'var(--cg-brand-strong)' }} />{t('nav_guide')}
              </button>
              <button onClick={onPrivacy} className="secondary-action text-sm">
                <Icon name="privacy" className="w-4 h-4" style={{ color: 'var(--cg-brand-strong)' }} />{lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy'}
              </button>
            </div>

            {/* demo accounts */}
            {publicConfig.demo_mode && <div className="mt-4 glass rounded-2xl p-4 animate-fadeup" style={{ animationDelay: '80ms' }}>
              <div className="txt-dim text-xs font-bold uppercase mb-2.5 flex items-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5" />{t('demo_accounts')}</div>
              <div className="space-y-1.5">
                {DEMO.map((d) => (
                  <button key={d.role} onClick={() => fillDemo(d)} className="w-full flex items-center justify-between glass rounded-xl px-3.5 py-2.5 hover:brightness-95 transition text-left">
                    <span className="txt text-sm font-semibold capitalize">{t(d.role)}</span>
                    <span className="txt-dim text-xs font-mono">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>}
            {publicConfig.environmental_data_mode === 'synthetic' && (
              <p className="txt-dim text-xs text-center mt-3 leading-relaxed">
                {lang === 'th' ? 'ข้อมูลอากาศ ดาวเทียม และดินในรุ่นนี้เป็นข้อมูลจำลองสำหรับสาธิต' : 'Weather, satellite, and soil data are synthetic in this demo build.'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function Field({ icon, label, type = 'text', value, onChange, required, minLength }) {
    return (
      <div>
        <label className="txt-soft text-sm font-semibold">{label}</label>
        <div className="relative mt-1.5">
          <Icon name={icon} className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 txt-dim" />
          <input type={type} value={value} required={required} minLength={minLength} onChange={(e) => onChange(e.target.value)}
                 className="w-full glass rounded-2xl pl-12 pr-4 py-3.5 txt text-base bg-transparent focus:outline-none focus:ring-4 transition"
                 style={{ '--tw-ring-color': 'var(--cg-brand-soft)' }} />
        </div>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Auth = AuthPage;
})();
