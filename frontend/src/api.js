/* CassavaGuard API client — thin fetch wrapper with JWT + error handling. */
(function () {
  const TOKEN_KEY = 'cg_token';

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
  function setToken(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); }

  async function request(path, { method = 'GET', body, form, auth = true, raw = false } = {}) {
    const headers = {};
    if (auth && getToken()) headers['Authorization'] = 'Bearer ' + getToken();
    let payload;
    if (form) { payload = form; }
    else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

    const res = await fetch(window.CG.API + path, { method, headers, body: payload });
    if (raw) {
      if (auth && res.status === 401) {
        setToken('');
        window.dispatchEvent(new Event('cg:unauthorized'));
      }
      return res;
    }
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      if (auth && res.status === 401) {
        setToken('');
        window.dispatchEvent(new Event('cg:unauthorized'));
      }
      const msg = (data && data.detail) ? data.detail : (typeof data === 'string' ? data : 'Request failed');
      const err = new Error(msg); err.status = res.status; err.data = data; throw err;
    }
    return data;
  }

  const API = {
    getToken, setToken,
    get: (p) => request(p),
    post: (p, body) => request(p, { method: 'POST', body }),
    patch: (p, body) => request(p, { method: 'PATCH', body }),
    delete: (p) => request(p, { method: 'DELETE' }),
    postForm: (p, form) => request(p, { method: 'POST', form }),
    raw: (p, opts) => request(p, { ...opts, raw: true }),

    // auth
    health: () => request('/api/health', { auth: false }),
    login: (email, password) => request('/api/auth/login-json', { method: 'POST', body: { email, password }, auth: false }),
    register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),
    forgot: (email) => request('/api/auth/forgot', { method: 'POST', body: { email }, auth: false }),
    reset: (token, new_password) => request('/api/auth/reset', { method: 'POST', body: { token, new_password }, auth: false }),
    me: () => request('/api/auth/me'),
    updateMe: (payload) => request('/api/auth/me', { method: 'PATCH', body: payload }),
    adminUsers: () => request('/api/admin/users'),
    updateUserRole: (id, role) => request(`/api/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),

    // domain
    kpis: () => request('/api/dashboard/kpis'),
    riskDist: () => request('/api/dashboard/risk-distribution'),
    healthByField: () => request('/api/dashboard/health-by-field'),
    fields: () => request('/api/fields'),
    fieldsGeo: () => request('/api/fields/geojson'),
    field: (id) => request('/api/fields/' + id),
    createField: (payload) => request('/api/fields', { method: 'POST', body: payload }),

    predictImage: (file, source, field_id) => {
      const fd = new FormData(); fd.append('file', file); fd.append('source', source);
      if (field_id) fd.append('field_id', field_id);
      return request('/api/predict/image', { method: 'POST', form: fd });
    },
    predictCsv: (file, field_id) => {
      const fd = new FormData(); fd.append('file', file);
      if (field_id) fd.append('field_id', field_id);
      return request('/api/predict/csv', { method: 'POST', form: fd });
    },
    classes: () => request('/api/predict/classes'),

    satMeta: () => request('/api/satellite/meta'),
    satTimeline: (id, months = 12) => request(`/api/satellite/${id}/timeline?months=${months}`),
    satGrid: (id, index, date) => request(`/api/satellite/${id}/grid?index=${index}` + (date ? `&date=${date}` : '')),
    satPasses: (id) => request(`/api/satellite/${id}/passes`),
    satCompare: (id, index, a, b) => request(
      `/api/satellite/${id}/compare?index=${encodeURIComponent(index)}`
      + (a ? `&date_a=${encodeURIComponent(a)}` : '')
      + (b ? `&date_b=${encodeURIComponent(b)}` : '')
    ),

    weatherCurrent: (fid) => request('/api/weather/current' + (fid ? `?field_id=${fid}` : '')),
    weatherHistory: (fid, days = 30) => request(`/api/weather/history?days=${days}` + (fid ? `&field_id=${fid}` : '')),
    weatherForecast: (fid, days = 7) => request(`/api/weather/forecast?days=${days}` + (fid ? `&field_id=${fid}` : '')),
    weatherSummary: (fid) => request('/api/weather/summary' + (fid ? `?field_id=${fid}` : '')),

    soil: (id) => request('/api/soil/' + id),
    soilMoisture: (id, days = 30) => request(`/api/soil/${id}/moisture?days=${days}`),
    soilAll: () => request('/api/soil'),
    soilSamples: (id) => request(`/api/soil/${id}/samples`),
    createSoilSample: (id, payload) => request(`/api/soil/${id}/samples`, { method: 'POST', body: payload }),

    notifications: (unread) => request('/api/notifications' + (unread ? '?unread_only=true' : '')),
    markRead: (id) => request(`/api/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request('/api/notifications/read-all', { method: 'POST' }),

    history: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request('/api/history/predictions' + (q ? '?' + q : ''));
    },
    historyDetail: (id) => request('/api/history/predictions/' + id),
    deletePrediction: (id) => request('/api/history/predictions/' + id, { method: 'DELETE' }),
    exportCsv: () => request('/api/history/predictions/export.csv', { raw: true }),

    models: () => request('/api/models'),
    modelCompare: () => request('/api/models/compare'),
    systemStatus: () => request('/api/models/system'),
    logs: () => request('/api/logs'),
  };

  window.CG.API_CLIENT = API;
})();
