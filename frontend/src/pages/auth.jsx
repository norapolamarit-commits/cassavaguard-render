/* Authentication: login / register / forgot-reset with glass split layout. */
(function () {
  const { useState, useEffect } = React;
  const { Icon, Spinner } = window.CG.UI;

  const DEMO = [
    { role: 'admin', email: 'admin@cassavaguard.ai', pw: 'admin123' },
    { role: 'researcher', email: 'researcher@cassavaguard.ai', pw: 'research123' },
    { role: 'farmer', email: 'farmer@cassavaguard.ai', pw: 'farmer123' },
  ];

  function AuthPage({ onGuide }) {
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
    const [publicConfig, setPublicConfig] = useState({ demo_mode: false, environmental_data_mode: 'synthetic' });

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

    return (
      <div className="min-h-screen theme-bg grid lg:grid-cols-2">
        {/* brand side */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 grad-brand opacity-[.08]" />
          <div className="absolute -right-20 top-1/4 w-96 h-96 rounded-full grad-brand opacity-20 blur-3xl animate-floaty" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl grad-brand grid place-items-center text-white shadow-lg"><Icon name="leaf" className="w-6 h-6" /></div>
            <div><div className="txt font-bold text-lg">CassavaGuard <span className="grad-text">AI</span></div><div className="txt-dim text-xs">{t('app_tag')}</div></div>
          </div>
          <div className="relative">
            <h1 className="txt text-4xl font-bold leading-tight">{lang === 'th' ? 'เกษตรแม่นยำ' : 'Precision agriculture'}<br /><span className="grad-text">{lang === 'th' ? 'ขับเคลื่อนด้วย AI' : 'powered by AI'}</span></h1>
            <p className="txt-soft mt-4 max-w-md">{lang === 'th' ? 'ระบบสนับสนุนการตัดสินใจอัจฉริยะสำหรับเกษตรกรมันสำปะหลัง — วินิจฉัยโรค วิเคราะห์ดาวเทียม ดิน และสภาพอากาศ พร้อมคำแนะนำที่มีหลักฐานรองรับ' : 'An intelligent decision-support platform for cassava farmers — disease diagnosis, satellite, soil & weather analytics with evidence-based recommendations.'}</p>
            <div className="flex gap-6 mt-8">
              {[
                [modelStats && modelStats.accuracy != null ? (modelStats.accuracy * 100).toFixed(1) + '%' : '—', lang === 'th' ? 'ความแม่นยำ (จริง)' : 'Accuracy (real)'],
                [numClasses != null ? String(numClasses) : '—', lang === 'th' ? 'คลาสโรค' : 'Classes'],
                ['8/13', lang === 'th' ? 'คลาสที่มีโมเดลทำงาน' : 'classes with executable models'],
              ].map(([v, l], i) => (
                <div key={i}><div className="grad-text text-2xl font-bold">{v}</div><div className="txt-dim text-xs">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="relative txt-dim text-xs">© 2026 CassavaGuard AI · Precision Agriculture Platform</div>
        </div>

        {/* form side */}
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl grad-brand grid place-items-center text-white"><Icon name="leaf" className="w-5 h-5" /></div>
                <span className="txt font-bold">CassavaGuard AI</span>
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={toggleLang} className="glass rounded-lg px-2.5 py-1.5 txt-soft text-xs font-semibold hover:txt">{lang === 'th' ? 'EN' : 'ไทย'}</button>
                <button onClick={toggleTheme} className="glass rounded-lg w-8 h-8 grid place-items-center txt-soft hover:txt"><Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-6 animate-fadeup">
              <h2 className="txt text-xl font-bold">{mode === 'login' ? t('login') : mode === 'register' ? t('register') : mode === 'reset' ? (lang === 'th' ? 'ตั้งรหัสผ่านใหม่' : 'Set new password') : t('forgot_pw')}</h2>
              <p className="txt-dim text-sm mt-1 mb-5">{mode === 'login' ? (lang === 'th' ? 'เข้าสู่แดชบอร์ดของคุณ' : 'Sign in to your dashboard') : mode === 'register' ? (lang === 'th' ? 'บัญชีใหม่จะเริ่มต้นเป็นเกษตรกร' : 'New accounts start with the Farmer role') : mode === 'reset' ? (lang === 'th' ? 'รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร' : 'Use at least 10 characters') : (lang === 'th' ? 'ระบบจะส่งลิงก์รีเซ็ตที่มีอายุ 30 นาที' : 'Receive a reset link valid for 30 minutes')}</p>

              <form onSubmit={submit} className="space-y-3">
                {mode === 'register' && (
                  <Field icon="bell" label={t('full_name')} value={name} onChange={setName} />
                )}
                {mode !== 'reset' && <Field icon="globe" label={t('email')} type="email" value={email} onChange={setEmail} required />}
                {mode !== 'forgot' && <Field icon="cpu" label={t('password')} type="password" value={pw} onChange={setPw} required minLength={mode === 'login' ? undefined : 10} />}
                {mode === 'login' && <button type="button" onClick={() => setMode('forgot')} className="text-xs text-brand-400 hover:underline">{t('forgot_pw')}</button>}
                <button disabled={busy} className="w-full grad-brand text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110 transition shadow-lg shadow-brand-500/20">
                  {busy ? <Spinner className="w-5 h-5" /> : <Icon name="logout" className="w-4 h-4 rotate-180" />}
                  {mode === 'login' ? t('login') : mode === 'register' ? t('register') : mode === 'reset' ? (lang === 'th' ? 'บันทึกรหัสผ่าน' : 'Save password') : (lang === 'th' ? 'ส่งลิงก์' : 'Send link')}
                </button>
              </form>

              <div className="mt-4 text-center text-sm txt-soft">
                {mode === 'login' ? (
                  <>{t('no_account')} <button onClick={() => setMode('register')} className="text-brand-400 font-semibold hover:underline">{t('register')}</button></>
                ) : mode === 'register' || mode === 'forgot' ? (
                  <>{t('have_account')} <button onClick={() => setMode('login')} className="text-brand-400 font-semibold hover:underline">{t('login')}</button></>
                ) : null}
              </div>
            </div>

            <button onClick={onGuide}
              className="w-full mt-3 glass rounded-xl px-4 py-2.5 txt-soft hover:txt flex items-center justify-center gap-2 text-sm font-medium">
              <Icon name="book" className="w-4 h-4 text-brand-400" />{t('nav_guide')}
            </button>

            {/* demo accounts */}
            {publicConfig.demo_mode && <div className="mt-4 glass rounded-2xl p-4 animate-fadeup" style={{ animationDelay: '80ms' }}>
              <div className="txt-dim text-xs font-semibold uppercase mb-2 flex items-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5" />{t('demo_accounts')}</div>
              <div className="space-y-1.5">
                {DEMO.map((d) => (
                  <button key={d.role} onClick={() => fillDemo(d)} className="w-full flex items-center justify-between glass rounded-lg px-3 py-2 hover:bg-white/[.04] transition text-left">
                    <span className="txt text-xs font-medium capitalize">{t(d.role)}</span>
                    <span className="txt-dim text-[11px] font-mono">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>}
            {publicConfig.environmental_data_mode === 'synthetic' && (
              <p className="txt-dim text-[11px] text-center mt-3">
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
        <label className="txt-dim text-xs">{label}</label>
        <div className="relative mt-1">
          <Icon name={icon} className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 txt-dim" />
          <input type={type} value={value} required={required} minLength={minLength} onChange={(e) => onChange(e.target.value)}
                 className="w-full glass rounded-xl pl-9 pr-3 py-2.5 txt text-sm bg-transparent focus:outline-none focus:ring-2 ring-brand-500/40" />
        </div>
      </div>
    );
  }

  window.CG.Pages = window.CG.Pages || {};
  window.CG.Pages.Auth = AuthPage;
})();
