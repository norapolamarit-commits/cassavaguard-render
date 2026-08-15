/* Global app store via React context: theme, language, app user, toasts. */
(function () {
  const { createContext, useContext, useState, useEffect, useCallback, useRef } = React;
  const Ctx = createContext(null);

  function Provider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('cg_theme') || 'dark');
    const [lang, setLang]   = useState(() => localStorage.getItem('cg_lang') || 'en');
    const [user, setUser]   = useState(null);
    const [booted, setBooted] = useState(false);
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(1);

    useEffect(() => {
      const el = document.documentElement;
      el.classList.toggle('dark', theme === 'dark');
      el.classList.toggle('light', theme === 'light');
      localStorage.setItem('cg_theme', theme);
    }, [theme]);

    useEffect(() => {
      localStorage.setItem('cg_lang', lang);
      document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
      const API = window.CG.API_CLIENT;
      API.setToken('');
      API.me().then(setUser).finally(() => setBooted(true));
    }, []);

    const toast = useCallback((msg, kind = 'info', ttl = 4200) => {
      const id = toastId.current++;
      setToasts((t) => [...t, { id, msg, kind }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
    }, []);
    const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

    const t = window.CG.makeT(lang);
    const value = { theme, setTheme, toggleTheme: () => setTheme((v) => v === 'dark' ? 'light' : 'dark'),
      lang, setLang, toggleLang: () => setLang((v) => v === 'th' ? 'en' : 'th'),
      user, setUser, booted,
      toast, toasts, dismissToast, t };
    return React.createElement(Ctx.Provider, { value }, children);
  }

  window.CG.Store = { Provider, useStore: () => useContext(Ctx) };
})();
