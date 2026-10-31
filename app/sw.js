// Service Worker: App läuft offline, Erinnerungen per Benachrichtigung.
const VERSION = '2956a26b7e';
const ASSETS = [
 "./",
 "./css/app.css",
 "./fonts/barlow-500.woff2",
 "./fonts/barlow-700.woff2",
 "./fonts/barlow-800.woff2",
 "./fonts/sharetech.woff2",
 "./icons/apple-touch-icon.png",
 "./icons/favicon-32.png",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./icons/maskable-192.png",
 "./icons/maskable-512.png",
 "./index.html",
 "./js/app.js",
 "./js/core/availability.js",
 "./js/core/games.js",
 "./js/core/garmin-source.js",
 "./js/core/garmin.js",
 "./js/core/lang.js",
 "./js/core/plan.js",
 "./js/core/planner.js",
 "./js/core/readiness.js",
 "./js/core/rewards.js",
 "./js/core/rules.js",
 "./js/core/speech.js",
 "./js/core/store.js",
 "./js/core/strength.js",
 "./js/core/util.js",
 "./js/core/voiceparse.js",
 "./js/core/weakness.js",
 "./js/data/courses.js",
 "./js/data/english.js",
 "./js/data/exercises.js",
 "./js/data/mental.js",
 "./js/data/requirements.js",
 "./js/ui.js",
 "./js/views/ausdauer.js",
 "./js/views/availability.js",
 "./js/views/figures.js",
 "./js/views/games.js",
 "./js/views/garmin.js",
 "./js/views/kraft.js",
 "./js/views/kurse.js",
 "./js/views/mental.js",
 "./js/views/profile.js",
 "./js/views/reminders.js",
 "./js/views/settings.js",
 "./js/views/sport.js",
 "./js/views/sprache.js",
 "./js/views/test.js",
 "./js/views/timer.js",
 "./js/views/voice.js",
 "./manifest.webmanifest"
];
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
