// Service worker CES Yanequén — réseau d'abord pour la page (les mises à jour
// s'affichent toujours), cache en secours. Cache v2.
const CACHE = "ces-yanequen-v2";
const ASSETS = [
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const isHTML = e.request.mode === "navigate" || e.request.destination === "document";
  if (isHTML) {
    // Réseau d'abord : on récupère toujours la dernière version en ligne.
    e.respondWith(
      fetch(e.request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
        .catch(() => caches.match(e.request).then((c) => c || caches.match("./index.html")))
    );
  } else {
    // Reste (icônes, manifest) : cache d'abord.
    e.respondWith(caches.match(e.request).then((c) => c || fetch(e.request)));
  }
});
