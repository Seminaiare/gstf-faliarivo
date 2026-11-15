/* GSTF : application installable.
   Rapide : la page du site est servie tout de suite depuis le téléphone, puis mise à jour en arrière-plan
   (le site affiche « Nouvelle version disponible » quand il y en a une). Sans Internet, le site s'ouvre quand même ;
   la toute première fois sans Internet, la page « hors connexion » montre la carte d’étudiant et les prières. */
const CACHE = 'gstf-v8';
const HORS_LIGNE = ['/offline.html', '/icon-192.png', '/badge-96.png', '/therese.jpg'];
const PAGE = '/', STATIQUES = ['/i18n.js', '/fiches.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(HORS_LIGNE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
// Le code du site (app.js?v=…, et espace.js?v=… pour le personnel) : une version = un contenu ; gardée sur le téléphone, les anciennes versions effacées
async function scriptVersionne(u) {
  const c = await caches.open(CACHE), cle = u.pathname + u.search, enCache = await c.match(cle);
  if (enCache) return enCache;
  const r = await fetch(u.href, { credentials: 'same-origin' });
  if (r.ok) {
    await c.put(cle, r.clone());
    for (const k of await c.keys()) { const x = new URL(k.url); if (x.pathname === u.pathname && x.search !== u.search) await c.delete(k); }
  }
  return r;
}
// Servir depuis le téléphone, puis rafraîchir en arrière-plan.
// Une nouvelle page n'est gardée qu'une fois son code (app.js) gardé aussi : l'application s'ouvre toujours, même sans Internet.
async function rapideEtFrais(e, cle, url) {
  const c = await caches.open(CACHE), enCache = await c.match(cle);
  const reseau = fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).then(async r => {
    if (!r.ok) return r;
    if (cle === PAGE) {
      const m = (await r.clone().text()).match(/\/app\.js\?v=[\w.-]+/);
      if (m) { const a = await scriptVersionne(new URL(m[0], self.location.origin)).catch(() => null); if (!a || !a.ok) return r; }
    }
    await c.put(cle, r.clone()); return r;
  });
  if (enCache) { e.waitUntil(reseau.catch(() => {})); return enCache; }
  return reseau;
}
// v275 : les programmes pris sur jsdelivr avec un numéro de version exact (supabase-js…) ne changent jamais : gardés sur le téléphone
async function cdnVersionne(r) {
  const c = await caches.open(CACHE), en = await c.match(r.url);
  if (en) return en;
  const x = await fetch(r);
  if (x.ok && x.type === 'cors') await c.put(r.url, x.clone());
  return x;
}
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method === 'GET' && u.origin === 'https://cdn.jsdelivr.net' && /@\d+\.\d+\.\d+\//.test(u.pathname)) { e.respondWith(cdnVersionne(r).catch(() => fetch(r))); return; }
  if (u.origin !== location.origin || r.method !== 'GET') return;
  if (r.mode === 'navigate') {
    if (u.pathname === '/' || u.pathname === '/index.html') { e.respondWith(rapideEtFrais(e, PAGE, '/').catch(() => caches.match('/offline.html'))); return; }
    e.respondWith(fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => caches.match('/offline.html'))); return;
  }
  if (u.pathname === '/app.js' || u.pathname === '/espace.js') { e.respondWith(scriptVersionne(u)); return; }
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
