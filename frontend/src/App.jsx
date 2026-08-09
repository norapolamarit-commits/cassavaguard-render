/* App shell: sidebar, navbar, notification center, FAB, page router. */
(function () {
  const { useState, useEffect, useCallback } = React;
  const { Icon, Badge, ToastHost, Modal } = window.CG.UI;
  const P = window.CG.Pages;

  const NAV = [
    { group: 'group_monitor', items: [
      { key: 'dashboard', icon: 'grid', label: 'nav_dashboard' },
      { key: 'map', icon: 'map', label: 'nav_map' },
    ]},
    { group: 'group_ai', items: [
      { key: 'predict', icon: 'brain', label: 'nav_predict' },
      { key: 'recommendations', icon: 'bulb', label: 'nav_reco' },
    ]},
    { group: 'group_data', items: [
      { key: 'satellite', icon: 'satellite', label: 'nav_satellite' },
      { key: 'weather', icon: 'cloud', label: 'nav_weather' },
      { key: 'soil', icon: 'soil', label: 'nav_soil' },
      { key: 'history', icon: 'history', label: 'nav_history' },
      { key: 'system', icon: 'cpu', label: 'nav_system' },
    ]},
    { group: 'group_help', items: [
      { key: 'guide', icon: 'book', label: 'nav_guide' },
    ]},
  ];

  function App() {
    const store = window.CG.Store.useStore();
    const { t, lang, theme, toggleTheme, toggleLang, user, booted } = store;
    const [route, setRoute] = useState('dashboard');
    const [routeArg, setRouteArg] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifs, setNotifs] = useState({ unread: 0, items: [] });

    const go = useCallback((r, arg = null) => { setRoute(r); setRouteArg(arg); setMobileNav(false); }, []);

    // load classes into a lookup + fetch notifications
    useEffect(() => {
      if (!user) return;
      window.CG.API_CLIENT.classes().then((cs) => { window.CG._classMap = {}; cs.forEach((c) => window.CG._classMap[c.key] = c); }).catch(() => {});
      const loadN = () => window.CG.API_CLIENT.notifications().then(setNotifs).catch(() => {});
      loadN(); const iv = setInterval(loadN, 20000); return () => clearInterval(iv);
    }, [user]);

    if (!booted) return <div className="min-h-screen theme-bg grid place-items-center"><div className="w-10 h-10 rounded-2xl grad-brand grid place-items-center text-white animate-pulse"><Icon name="leaf" className="w-6 h-6" /></div></div>;
    if (!user) return <div className="min-h-screen theme-bg grid place-items-center px-6 text-center"><div><div className="txt font-bold">CassavaGuard AI</div><div className="txt-soft text-sm mt-2">ไม่สามารถเชื่อมต่อ API ได้ กรุณาตรวจสอบว่า backend กำลังทำงาน</div></div></div>;

    const markAll = () => window.CG.API_CLIENT.markAllRead().then(() => window.CG.API_CLIENT.notifications().then(setNotifs));
    const markOne = (id) => window.CG.API_CLIENT.markRead(id).then(() => window.CG.API_CLIENT.notifications().then(setNotifs));

    const pageTitle = {
      dashboard: ['dash_title', 'dash_sub'], map: ['nav_map', 'dash_sub'],
      predict: ['predict_title', 'predict_sub'], recommendations: ['nav_reco', 'dash_sub'],
      satellite: ['nav_satellite', 'veg_indices'], weather: ['nav_weather', 'forecast'],
      soil: ['nav_soil', 'soil_profile'], history: ['nav_history', 'dash_sub'], system: ['nav_system', 'model_perf'],
      guide: ['nav_guide', 'app_tag'],
    }[route] || ['app_name', 'app_tag'];

    // Render the active page directly as a stable component element.
    // (Do NOT wrap in inline arrow components — a new function identity each
    //  render remounts the page and wipes its state on every App update.)
    const renderPage = () => {
      switch (route) {
        case 'dashboard': return <P.Dashboard go={go} />;
        case 'map': return <P.FieldMap go={go} />;
        case 'predict': return <P.Predict />;
        case 'recommendations': return <P.Recommendations initialField={routeArg} />;
        case 'satellite': return <P.Satellite initialField={routeArg} />;
        case 'weather': return <P.Weather initialField={routeArg} />;
        case 'soil': return <P.Soil initialField={routeArg} />;
        case 'history': return <P.History />;
        case 'system': return <P.System />;
        case 'guide': return <P.Guide />;
        default: return <div className="txt">Not found</div>;
      }
    };

    const sidebarW = collapsed ? 'lg:w-[76px]' : 'lg:w-64';
    return (
      <div className="min-h-screen theme-bg flex">
        {/* sidebar */}
        <aside className={`fixed lg:sticky top-0 z-[1000] h-screen shrink-0 transition-all duration-300 ${sidebarW} ${mobileNav ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'} `}>
          <div className="h-full glass-strong border-r hair flex flex-col">
            <div className="p-4 flex items-center gap-3 border-b hair h-16">
              <div className="w-9 h-9 rounded-xl grad-brand grid place-items-center text-white shrink-0 shadow-lg"><Icon name="leaf" className="w-5 h-5" /></div>
              {!collapsed && <div className="min-w-0"><div className="txt font-bold text-sm leading-tight">CassavaGuard <span className="grad-text">AI</span></div><div className="txt-dim text-[10px] truncate">{t('app_tag')}</div></div>}
            </div>

            <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
              {NAV.map((grp) => (
                <div key={grp.group}>
                  {!collapsed && <div className="txt-dim text-[10px] font-bold uppercase tracking-wider px-3 mb-1.5">{t(grp.group)}</div>}
                  <div className="space-y-1">
                    {grp.items.map((it) => {
                      const active = route === it.key;
                      return (
                        <button key={it.key} onClick={() => go(it.key)} title={t(it.label)}
                          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition group relative ${active ? 'grad-brand text-white shadow-lg shadow-brand-500/20' : 'txt-soft hover:txt hover:bg-white/[.04]'}`}>
                          <Icon name={it.icon} className="w-5 h-5 shrink-0" />
                          {!collapsed && <span className="text-sm font-medium truncate">{t(it.label)}</span>}
                          {active && !collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3 border-t hair">
              <div className={`flex items-center gap-3 rounded-xl px-2 py-2 glass ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-lg grad-brand grid place-items-center text-white text-xs font-bold shrink-0">{(user.full_name || user.email)[0].toUpperCase()}</div>
                {!collapsed && <div className="min-w-0 flex-1"><div className="txt text-xs font-semibold truncate">{user.full_name || user.email.split('@')[0]}</div><div className="txt-dim text-[10px] capitalize">{t(user.role)}</div></div>}
              </div>
              <button onClick={() => setCollapsed((v) => !v)} className="hidden lg:flex w-full mt-2 items-center justify-center txt-dim hover:txt py-1.5 rounded-lg hover:bg-white/[.04]">
                <Icon name="chevron" className={`w-4 h-4 transition ${collapsed ? '' : 'rotate-180'}`} />
              </button>
            </div>
          </div>
        </aside>
        {mobileNav && <div className="fixed inset-0 z-[999] bg-black/50 lg:hidden" onClick={() => setMobileNav(false)} />}

        {/* main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* navbar */}
          <header className="sticky top-0 z-[800] h-16 glass-strong border-b hair flex items-center gap-3 px-4 lg:px-6">
            <button onClick={() => setMobileNav(true)} className="lg:hidden txt-soft hover:txt"><Icon name="menu" /></button>
            <div className="min-w-0">
              <h1 className="txt font-bold text-base lg:text-lg leading-tight truncate">{t(pageTitle[0])}</h1>
              <p className="txt-dim text-[11px] truncate hidden sm:block">{t(pageTitle[1])}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={toggleLang} className="glass rounded-lg px-2.5 py-1.5 txt-soft text-xs font-semibold hover:txt">{lang === 'th' ? 'EN' : 'ไทย'}</button>
              <button onClick={toggleTheme} className="glass rounded-lg w-9 h-9 grid place-items-center txt-soft hover:txt"><Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" /></button>
              <button onClick={() => setNotifOpen(true)} className="glass rounded-lg w-9 h-9 grid place-items-center txt-soft hover:txt relative">
                <Icon name="bell" className="w-4 h-4" />
                {notifs.unread > 0 && <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center">{notifs.unread}</span>}
              </button>
            </div>
          </header>

          {/* page body */}
          <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
            {renderPage()}
          </main>
        </div>

        {/* FAB */}
        {route !== 'predict' && (
          <button onClick={() => go('predict')} title={t('nav_predict')}
            className="fixed bottom-6 right-6 z-[850] w-14 h-14 rounded-2xl grad-brand text-white grid place-items-center shadow-2xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition animate-floaty">
            <Icon name="brain" className="w-6 h-6" />
          </button>
        )}

        {/* notifications drawer */}
        <Modal open={notifOpen} onClose={() => setNotifOpen(false)} title={t('notifications')}>
          <div className="flex justify-end mb-3">
            <button onClick={markAll} className="txt-soft hover:txt text-xs flex items-center gap-1"><Icon name="check" className="w-3.5 h-3.5" />{t('mark_all_read')}</button>
          </div>
          <div className="space-y-2">
            {notifs.items.length === 0 && <div className="txt-dim text-sm text-center py-8">{t('no_data')}</div>}
            {notifs.items.map((n) => (
              <div key={n.id} onClick={() => markOne(n.id)}
                className={`rounded-xl p-3 cursor-pointer transition ${n.read ? 'glass opacity-60' : 'glass hover:bg-white/[.04]'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${n.severity === 'high' ? 'bg-rose-500/15 text-rose-300' : n.severity === 'medium' ? 'bg-amber-500/15 text-amber-300' : 'bg-cyan2/15 text-cyan2-light'}`}>
                    <Icon name={{ disease: 'brain', nutrient: 'soil', water: 'drop', weather: 'cloud' }[n.kind] || 'bell'} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="txt text-sm font-semibold">{lang === 'th' ? n.title_th : n.title}</span>{!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}</div>
                    <p className="txt-soft text-xs mt-0.5 leading-snug">{lang === 'th' ? n.message_th : n.message}</p>
                    <div className="txt-dim text-[10px] mt-1">{n.created_at.replace('T', ' ').slice(0, 16)}{n.field_name ? ` · ${lang === 'th' ? n.field_name_th || n.field_name : n.field_name}` : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal>

        <ToastHost />
      </div>
    );
  }

  window.CG.App = App;
})();
