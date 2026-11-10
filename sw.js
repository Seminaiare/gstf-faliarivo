/* GSTF : application installable. Le site est toujours chargé en ligne (jamais de version périmée) ;
   sans Internet, une page « Pas de connexion » s’affiche. */
const CACHE = 'gstf-v1';
const HORS_LIGNE = ['/offline.html', '/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(HORS_LIGNE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => caches.match('/offline.html'))); return; }
  if (new URL(r.url).pathname === '/icon-192.png') e.respondWith(caches.match(r).then(x => x || fetch(r)));
});
