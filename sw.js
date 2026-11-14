/* GSTF : application installable.
   Rapide : la page du site est servie tout de suite depuis le téléphone, puis mise à jour en arrière-plan
   (le site affiche « Nouvelle version disponible » quand il y en a une). Sans Internet, le site s'ouvre quand même ;
   la toute première fois sans Internet, la page « hors connexion » montre la carte d’étudiant et les prières. */
const CACHE = 'gstf-v6';
const HORS_LIGNE = ['/offline.html', '/icon-192.png', '/badge-96.png', '/therese.jpg'];
const PAGE = '/', STATIQUES = ['/i18n.js', '/fiches.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(HORS_LIGNE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
// Servir depuis le téléphone, puis rafraîchir en arrière-plan
async function rapideEtFrais(e, cle, url) {
  const c = await caches.open(CACHE), enCache = await c.match(cle);
  const reseau = fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { if (r.ok) c.put(cle, r.clone()); return r; });
  if (enCache) { e.waitUntil(reseau.catch(() => {})); return enCache; }
  return reseau;
}
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (u.origin !== location.origin || r.method !== 'GET') return;
  if (r.mode === 'navigate') {
    if (u.pathname === '/' || u.pathname === '/index.html') { e.respondWith(rapideEtFrais(e, PAGE, '/').catch(() => caches.match('/offline.html'))); return; }
    e.respondWith(fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => caches.match('/offline.html'))); return;
  }
  if (STATIQUES.includes(u.pathname)) { e.respondWith(rapideEtFrais(e, u.pathname, u.pathname)); return; }
  if (HORS_LIGNE.includes(u.pathname)) e.respondWith(caches.match(r).then(x => x || fetch(r)));
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
