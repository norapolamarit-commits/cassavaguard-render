/* Global app store via React context: theme, language, auth session, toasts. */
(function () {
  const { createContext, useContext, useState, useEffect, useCallback, useRef } = React;
  const Ctx = createContext(null);

  function Provider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('cg_theme') || 'light');
    const [lang, setLang]   = useState(() => localStorage.getItem('cg_lang') || 'th');
    const [user, setUser]   = useState(null);
    const [booted, setBooted] = useState(false);
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(1);
    // True right after a login/register/guest action succeeds — App uses this
    // to pop the quick-start guide once, without showing it on every reload
    // of an already-signed-in session.
    const [justLoggedIn, setJustLoggedIn] = useState(false);

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

    // Resume a saved session (if any) instead of always wiping the token on
    // every reload. A missing/expired token still resolves to "signed out"
    // rather than an error — the auth page then handles sign-in/sign-up.
    useEffect(() => {
      const API = window.CG.API_CLIENT;
      API.me().then(setUser).catch(() => { API.setToken(''); setUser(null); }).finally(() => setBooted(true));
    }, []);

    // A 401 from any request (e.g. an expired token) drops the session so the
    // auth page reappears instead of the app silently failing every call.
    useEffect(() => {
      const onUnauthorized = () => setUser(null);
      window.addEventListener('cg:unauthorized', onUnauthorized);
      return () => window.removeEventListener('cg:unauthorized', onUnauthorized);
    }, []);

    const toast = useCallback((msg, kind = 'info', ttl = 4200) => {
      const id = toastId.current++;
      setToasts((t) => [...t, { id, msg, kind }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
    }, []);
    const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

    const login = useCallback(async (email, password) => {
      const API = window.CG.API_CLIENT;
      const r = await API.login(email, password);
      API.setToken(r.access_token);
      setUser(r.user);
      setJustLoggedIn(true);
      return r.user;
    }, []);

    const register = useCallback(async (payload) => {
      const API = window.CG.API_CLIENT;
      const r = await API.register(payload);
      API.setToken(r.access_token);
      setUser(r.user);
      setJustLoggedIn(true);
      return r.user;
    }, []);

    const logout = useCallback(() => {
      window.CG.API_CLIENT.setToken('');
      setUser(null);
    }, []);

    const t = window.CG.makeT(lang);
    const value = { theme, setTheme, toggleTheme: () => setTheme((v) => v === 'dark' ? 'light' : 'dark'),
      lang, setLang, toggleLang: () => setLang((v) => v === 'th' ? 'en' : 'th'),
      user, setUser, booted, login, register, logout,
      justLoggedIn, clearJustLoggedIn: () => setJustLoggedIn(false),
      toast, toasts, dismissToast, t };
    return React.createElement(Ctx.Provider, { value }, children);
  }

  window.CG.Store = { Provider, useStore: () => useContext(Ctx) };
})();
