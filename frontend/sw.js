// CassavaGuard AI service worker — caches the static app shell so the
// installed PWA still opens when the phone is offline. API calls remain online-only.
const CACHE_NAME = "cassavaguard-shell-offline-ai-v1";
const SHELL_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/dist/app.css?v=20261011-mobile-parity",
  "/dist/app.js?v=20261011-mobile-parity",
  "/vendor/react.js",
  "/vendor/prop-types.js",
  "/vendor/react-dom.js",
  "/vendor/chart.js",
  "/vendor/leaflet/leaflet.js",
  "/vendor/leaflet/leaflet.css",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(SHELL_ASSETS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "reload" });
        if (response.ok) await cache.put(url, response);
      } catch (_) { /* Keep installation usable on intermittent networks. */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("cassavaguard-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    try {
      const response = await fetch(request);
      if (response.ok && (url.pathname.startsWith("/dist/") || url.pathname.startsWith("/vendor/")))
        await cache.put(request, response.clone());
      return response;
    } catch (error) {
      if (cached) return cached;
      if (url.pathname === "/dist/ort/ort-wasm-simd-threaded.wasm") {
        const runtime = await caches.open("cassavaguard-ort-runtime-v1");
        const wasm = await runtime.match(url.pathname);
        if (wasm) return wasm;
      }
      if (request.mode === "navigate") {
        const shell = await cache.match("/");
        if (shell) return shell;
      }
      throw error;
    }
  })());
});
