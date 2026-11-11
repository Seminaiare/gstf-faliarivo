/* GSTF : application installable. Le site est toujours chargé en ligne (jamais de version périmée) ;
   sans Internet, la page « hors connexion » montre la carte d’étudiant et les prières enregistrées sur le téléphone.
   Les notifications (annonces, actualités, bibliothèque) arrivent ici. */
const CACHE = 'gstf-v4';
const HORS_LIGNE = ['/offline.html', '/icon-192.png', '/badge-96.png', '/therese.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(HORS_LIGNE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.mode === 'navigate') { e.respondWith(fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => caches.match('/offline.html'))); return; }
  if (HORS_LIGNE.includes(new URL(r.url).pathname) && new URL(r.url).origin === location.origin) e.respondWith(caches.match(r).then(x => x || fetch(r)));
});
self.addEventListener('push', e => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch (_) { m = { title: 'Grand Séminaire de Faliarivo', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(m.title || 'Grand Séminaire de Faliarivo', {
    body: m.body || '', icon: '/icon-192.png', badge: '/badge-96.png', tag: m.tag || undefined, renotify: !!m.tag, image: m.image || undefined,
    data: { url: m.url || '/?app=1' }, lang: 'fr', vibrate: [80, 40, 80]
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/?app=1', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    const ouvert = l.find(c => new URL(c.url).origin === self.location.origin);
    if (ouvert) return ouvert.focus().then(c => c.navigate ? c.navigate(url) : c);
    return self.clients.openWindow(url);
  }));
});
