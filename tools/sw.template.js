// Service Worker: App läuft offline, Erinnerungen per Benachrichtigung.
const VERSION = '__VERSION__';
const ASSETS = __ASSETS__;
const CACHE = 'auswahl-' + VERSION;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((r) => r || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});

// Erinnerungen: Chrome weckt installierte Apps gelegentlich (Periodic Background Sync).
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'erinnerung') e.waitUntil(remind());
});

async function remind() {
  const h = new Date().getHours();
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.some((c) => c.visibilityState === 'visible')) return;
  if (h >= 5 && h < 10) return self.registration.showNotification('Morgen-Check-in', { body: 'Schlaf, Energie, Muskelkater, Schmerzen, Stimmung: 30 Sekunden.', icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png', tag: 'morgen' });
  if (h >= 19 && h < 23) return self.registration.showNotification('Mentaltraining', { body: 'Box-Atmung oder ein Abendtext, 5 Minuten.', icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png', tag: 'abend' });
}

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = e.notification.tag === 'abend' ? './#/mental' : './#/sport';
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((cs) => {
    for (const c of cs) { c.navigate(target); return c.focus(); }
    return self.clients.openWindow(target);
  }));
});
