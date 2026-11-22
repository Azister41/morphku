// Versi cache. Naikkan angkanya kalau suatu saat ingin memaksa semua perangkat membuang cache lama.
const CACHE = "morphku-v1";
const FILES = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // versi baru langsung siap, tidak menunggu aplikasi ditutup
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Internet dulu supaya selalu dapat versi terbaru. Cache hanya cadangan saat offline.
// Permintaan ke Firebase atau situs lain tidak disentuh.
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r, { cache: "no-cache" })
      .then((res) => {
        if (res.ok) { const salinan = res.clone(); caches.open(CACHE).then((c) => c.put(r, salinan)); }
        return res;
      })
      .catch(() => caches.match(r).then((m) => m || caches.match("/index.html")))
  );
});
