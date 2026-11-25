/* GSTF : application installable.
   Rapide : la page du site est servie tout de suite depuis le téléphone, puis mise à jour en arrière-plan
   (le site affiche « Nouvelle version disponible » quand il y en a une). Sans Internet, le site s'ouvre quand même ;
   la toute première fois sans Internet, la page « hors connexion » montre la carte d’étudiant et les prières.
   v328 : les contenus déjà vus (prières, agenda, livres, articles) restent lisibles sans Internet. */
const CACHE = 'gstf-v8';
const HORS_LIGNE = ['/offline.html', '/icon-192.png', '/badge-96.png', '/therese.jpg'];
const PAGE = '/', STATIQUES = ['/i18n.js', '/fiches.js'];
// v328 : dès la première visite, la page, son code et ses programmes sont gardés (avant : il fallait deux visites)
async function garderPage() {
  const r = await fetch('/', { cache: 'no-cache', credentials: 'same-origin' }); if (!r.ok) return;
  const html = await r.clone().text(), m = html.match(/\/app\.js\?v=[\w.-]+/);
  if (!await stylesGardes(html)) return;   // v515
  if (m) { const a = await scriptVersionne(new URL(m[0], self.location.origin)).catch(() => null); if (!a || !a.ok) return; await garderTout(m[0].split('v=')[1], html).catch(() => {}); }
  for (const u of html.match(/https:\/\/cdn\.jsdelivr\.net\/[^"'\s]+@\d+\.\d+\.\d+\/[^"'\s]+/g) || []) await cdnVersionne(new Request(u, { mode: 'cors' })).catch(() => {});
  const c = await caches.open(CACHE);
  for (const x of STATIQUES) { const y = await fetch(x, { credentials: 'same-origin' }).catch(() => null); if (y && y.ok) await c.put(x, y); }
  await c.put(PAGE, r);
}
/* v515 : les styles sont dans site.css?v=<empreinte> ; une page n'est gardée qu'avec ses styles (sinon, hors ligne, une page sans mise en forme) */
async function stylesGardes(html) {
  const m = html.match(/\/site\.css\?v=[\w.-]+/); if (!m) return true;
  const r = await scriptVersionne(new URL(m[0], self.location.origin)).catch(() => null); return !!(r && r.ok);
}
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(HORS_LIGNE)).then(() => garderPage().catch(() => {})).then(() => self.skipWaiting())); });
// « gstf-donnees » : la dernière copie des contenus (prières, agenda, livres, articles…) gardée par la page, à ne pas effacer
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE && n !== 'gstf-donnees' && n !== LUS).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
// Le code du site (app.js?v=…, espace.js?v=… pour le personnel, aide.js?v=… pour « Aide ») : une version = un contenu ; gardée sur le téléphone, les anciennes versions effacées
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
/* v450 : à chaque nouvelle version, garder tout de suite tout le code (Aide, nouveautés) et les pages du Séminaire */
const PAGES_SEMINAIRE = ['/le-seminaire.html', '/programme-des-etudes.html', '/corps-enseignant.html', '/calendrier-academique.html', '/contact-acces.html', '/inscription-seminaire.html', '/bibliotheque-seminaire.html', '/soutenir-seminaire.html'];
/* v513 : chaque fichier a sa propre empreinte, écrite dans la page (window.GSTF_EMP = {"aide.js": "…", …}) */
function empreintes(html) { try { const m = html.match(/GSTF_EMP=(\{[^<]*?\})<\/script>/); return m ? JSON.parse(m[1]) : {}; } catch (_) { return {}; } }
/* v514 (vitesse) : l'Aide et les nouveautés ne sont gardées d'avance que pour ceux qui les ont déjà ouvertes sur cet appareil ;
   une page du Séminaire n'est relue que si son empreinte a changé */
async function dejaGarde(c, chemin) { for (const k of await c.keys()) if (new URL(k.url).pathname === chemin) return true; return false; }
async function garderTout(v, html) {
  const emp = empreintes(html), n = (html.match(/GSTF_V=(\d+)/) || [0, v])[1];
  const c = await caches.open(CACHE), marque = '/__gstf-tout-' + n;
  if (await c.match(marque)) return;
  for (const s of ['aide.js', 'nouveautes.js', ...Object.keys(emp).filter(k => /^m-[a-z]+\.js$/.test(k))]) if (emp[s] && await dejaGarde(c, '/' + s)) /* v522 : aussi les morceaux déjà ouverts */ await scriptVersionne(new URL('/' + s + '?v=' + emp[s], self.location.origin)).catch(() => null);
  const l = await caches.open(LUS);
  for (const p of PAGES_SEMINAIRE) { try {
    const e = emp[p.slice(1)], avant = await l.match(p);
    if (e && avant && avant.headers.get('x-gstf-emp') === e) continue;   // v514 : inchangée, rien à télécharger
    const x = await fetch(p, { cache: 'no-cache', credentials: 'same-origin' });
    if (x.ok) { const h = new Headers(x.headers); h.set('x-gstf-lu', new Date().toISOString()); if (e) h.set('x-gstf-emp', e); await l.put(p, new Response(await x.blob(), { status: 200, headers: h })); } } catch (_) {} }
  for (const k of await c.keys()) if (/\/__gstf-tout-/.test(k.url)) await c.delete(k);
  await c.put(marque, new Response('1'));
}
async function rapideEtFrais(e, cle, url) {
  const c = await caches.open(CACHE), enCache = await c.match(cle);
  const reseau = fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).then(async r => {
    if (!r.ok) return r;
    if (cle === PAGE) {
      const html = await r.clone().text(), m = html.match(/\/app\.js\?v=[\w.-]+/);
      if (!await stylesGardes(html)) return r;   // v515
      if (m) { const a = await scriptVersionne(new URL(m[0], self.location.origin)).catch(() => null); if (!a || !a.ok) return r;
        const v = m[0].split('v=')[1]; const g = garderTout(v, html).catch(() => {}); try { e.waitUntil(g); } catch (_) {} }   // v450
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
/* v346 : les pages publiques lues (articles, homélies, pages du Séminaire) restent lisibles hors connexion :
   les 10 derniers articles ou homélies lus, et les pages du Séminaire ; hors ligne, un bandeau dit de quand date la copie */
const LUS = 'gstf-lus';
async function pageLue(r, u) {
  try {
    const x = await fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' });
    if (x.ok) {
      const c = await caches.open(LUS), h = new Headers(x.headers); h.set('x-gstf-lu', new Date().toISOString());
      await c.put(u.pathname, new Response(await x.clone().blob(), { status: 200, headers: h }));
      const k = (await c.keys()).filter(q => /\/(articles|homelies)\//.test(q.url));
      for (const q of k.slice(0, Math.max(0, k.length - 10))) await c.delete(q);   // les plus anciens d’abord
    }
    return x;
  } catch (_) {
    const en = await caches.match(u.pathname, { cacheName: LUS });
    if (!en) return (await caches.match('/offline.html')) || Response.error();
    const d = new Date(en.headers.get('x-gstf-lu') || Date.now()), j = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const video = /\/homelies\//.test(u.pathname) ? ' La vidéo de l’homélie se regarde quand vous aurez Internet.' : '';
    const bandeau = `<div style="background:#fff4d6;color:#5a4300;padding:8px 12px;font:14px/1.4 sans-serif;text-align:center">📴 Hors connexion – informations du ${j} (copie gardée sur cet appareil).${video}</div>`;
    const html = (await en.text()).replace(/<body([^>]*)>/i, m => m + bandeau);
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
}
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method === 'GET' && u.origin === 'https://cdn.jsdelivr.net' && /@\d+\.\d+\.\d+\//.test(u.pathname)) { e.respondWith(cdnVersionne(r).catch(() => fetch(r))); return; }
  if (u.origin !== location.origin || r.method !== 'GET') return;
  if (r.mode === 'navigate') {
    if (u.pathname === '/' || u.pathname === '/index.html') { e.respondWith(rapideEtFrais(e, PAGE, '/').catch(() => caches.match('/offline.html'))); return; }
    if (u.pathname === '/aujourdhui.html') {   // v344 : la page légère du jour reste lisible hors ligne (avec la date du jour où elle a été lue)
      e.respondWith(fetch(r.url, { cache: 'no-cache' }).then(async x => { if (x.ok) { const c = await caches.open(CACHE); await c.put('/aujourdhui.html', x.clone()); } return x; })
        .catch(async () => (await caches.match('/aujourdhui.html')) || caches.match('/offline.html'))); return;
    }
    if (/^\/(articles|homelies)\/[^/]+$/.test(u.pathname) || /^\/[a-z0-9-]+\.html$/.test(u.pathname)) { e.respondWith(pageLue(r, u)); return; }   // v346
    e.respondWith(fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => caches.match('/offline.html'))); return;
  }
  if (u.pathname === '/app.js' || u.pathname === '/espace.js' || u.pathname === '/aide.js' || u.pathname === '/nouveautes.js' || (u.pathname === '/site.css' && u.search) || /^\/m-[a-z]+\.js$/.test(u.pathname)) { /* v522 : les morceaux */ e.respondWith(scriptVersionne(u)); return; }
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
