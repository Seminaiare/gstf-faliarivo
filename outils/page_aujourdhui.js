#!/usr/bin/env node
/* Page ultra-légère « aujourdhui.html » du Grand Séminaire de Faliarivo (pour la 2G et les vieux téléphones).
   Lancée chaque heure par GitHub (.github/workflows/pages-articles.yml), à côté des pages des articles.
   Texte seul : aucune police extérieure, aucune image, aucun script ; moins de 15 Ko.
   Lit seulement des données PUBLIQUES, comme un visiteur non connecté (clé publique du site) :
   l’agenda public et les réponses de « Aide » complétées par l’administration (horaires des messes).
   La liturgie vient de outils/liturgie.js, copie exacte du calcul du site (faire_liturgie.py).
   Essai sans réseau : AGENDA_JSON=fichier.json AIDE_JSON=fichier.json node outils/page_aujourdhui.js */
'use strict';
const fs = require('fs'), path = require('path');
const { liturgieDuJour, iso, plusJours, parseIso } = require('./liturgie.js');
const SITE = 'https://gstf-faliarivo.ovh';
const SB = 'https://lznusbdqkzcxhskgdyip.supabase.co';
const CLE = 'sb_publishable_o9nFSTGscnNs3K14ADejxA_X6hPgTDW';   // clé PUBLIQUE (la même que dans le site)
const RACINE = path.dirname(__dirname);
const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function lire(nom, url) {
  const f = process.env[nom + '_JSON']; if (f) return JSON.parse(fs.readFileSync(f, 'utf8'));
  const r = await fetch(SB + url, { headers: { apikey: CLE, Authorization: 'Bearer ' + CLE } });
  if (!r.ok) throw new Error(nom + ' : ' + r.status);
  return r.json();
}
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const dateFr = d => { const x = parseIso(d); return `${JOURS[x.getDay()]} ${x.getDate() === 1 ? '1er' : x.getDate()} ${MOIS[x.getMonth()]} ${x.getFullYear()}`; };

async function main() {
  const mg = new Date(Date.now() + 3 * 3600e3);   // heure de Madagascar (UTC+3, sans heure d’été)
  const auj = `${mg.getUTCFullYear()}-${String(mg.getUTCMonth() + 1).padStart(2, '0')}-${String(mg.getUTCDate()).padStart(2, '0')}`;
  const maj = dateFr(auj);   // la date seule : la page ne change qu’une fois par jour (ou quand l’agenda change), donc peu d’enregistrements
  const L = liturgieDuJour(auj);
  let ag = [], plus = [];
  try { ag = await lire('AGENDA', `/rest/v1/agenda?select=titre,debut,fin,heure&public=eq.true&debut=gte.${auj}&order=debut&limit=7`); } catch (e) { console.error(e.message); }
  try { const r = await lire('AIDE', '/rest/v1/reglages?select=valeur&cle=eq.aide_plus'); plus = (r[0] && r[0].valeur) || []; if (!Array.isArray(plus)) plus = plus.liste || []; } catch (e) { console.error(e.message); }
  const fiche = t => plus.find(x => x && x.q === t);
  const messes = fiche('Horaires des messes au Séminaire');
  const fete = L.fete ? `<p><b>${E(L.fete)}</b>${L.rang ? ` (${E(L.rang.toLowerCase())})` : ''}</p>` : L.facult.length ? `<p>Mémoire facultative : ${E(L.facult.join(' ; '))}</p>` : '';
  const evts = ag.map(a => `<li><b>${E(dateFr(a.debut))}</b>${a.heure ? ` · ${E(a.heure)}` : ''}<br>${E(a.titre)}</li>`).join('');
  const ld = ag.map(a => ({ '@context': 'https://schema.org', '@type': 'Event', name: a.titre, startDate: a.debut, ...(a.fin ? { endDate: a.fin } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: 'Grand Séminaire de Théologie de Faliarivo', address: { '@type': 'PostalAddress', streetAddress: 'Faliarivo - Ambanidia, Lot VB 5 bis', postalCode: '101', addressLocality: 'Antananarivo', addressCountry: 'MG' } },
    organizer: { '@type': 'Organization', name: 'Grand Séminaire de Théologie Sainte Thérèse de l’Enfant-Jésus', url: SITE + '/' } }));
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aujourd’hui au Grand Séminaire de Faliarivo (version légère)</title>
<meta name="description" content="Liturgie du jour, prochains événements, horaires et contact du Grand Séminaire de Théologie de Faliarivo, en version très légère.">
<link rel="canonical" href="${SITE}/aujourdhui.html">
${ld.length ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : ''}
<style>body{margin:0 auto;max-width:40em;padding:12px 16px;font:16px/1.5 sans-serif;color:#222;background:#fff}h1{font-size:20px;margin:.2em 0}h2{font-size:17px;margin:1.2em 0 .3em;border-bottom:1px solid #ddd}a{color:#8c2a34}ul{padding-left:1.2em}small{color:#666}</style></head><body>
<p><small>Grand Séminaire de Théologie Sainte Thérèse de l’Enfant-Jésus · Faliarivo</small></p>
<h1>Aujourd’hui · Androany</h1>
<p><b>${E(dateFr(auj))}</b></p>
<h2>Liturgie du jour</h2>
<p>${E(L.libelle)} · temps : ${E(L.temps)} · couleur : ${E(L.couleur)}</p>
${fete}
<p><a href="${E(L.aelf)}">Lectures de la messe du jour (AELF)</a></p>
<h2>Prochains événements · Fandaharana</h2>
${evts ? `<ul>${evts}</ul>` : '<p>Aucun événement public annoncé pour l’instant.</p>'}
<h2>Horaires</h2>
<p>Secrétariat : du lundi au vendredi, 8 h – 12 h et 14 h – 16 h.</p>
${messes ? `<p>Messes : ${E((messes.e || []).join(' '))}</p>` : '<p>Messes : demandez au secrétariat.</p>'}
<h2>Contact · Fifandraisana</h2>
<p>Faliarivo – Ambanidia, Lot VB 5 bis, 101 Antananarivo<br>Tél. <a href="tel:+261382122021">+261 38 21 220 21</a> · <a href="mailto:seminairetheo@yahoo.fr">seminairetheo@yahoo.fr</a></p>
<h2>Plus</h2>
<p><a href="/le-seminaire.html">Le Séminaire</a> · <a href="/inscription-seminaire.html">Inscription</a> · <a href="/bibliotheque-seminaire.html">Bibliothèque</a> · <a href="/contact-acces.html">Contact et accès</a> · <a href="/soutenir-seminaire.html">Soutenir</a> · <a href="/">Le site complet</a></p>
<p><small>Page mise à jour le ${E(maj)}. Si cette date n’est pas celle d’aujourd’hui, la mise à jour automatique s’est arrêtée : le site complet reste à jour.</small></p>
</body></html>
`;
  fs.writeFileSync(path.join(RACINE, 'aujourdhui.html'), html);
  console.log('aujourdhui.html :', Buffer.byteLength(html), 'octets ·', L.libelle, '·', ag.length, 'événement(s)');
}
main().catch(e => { console.error(e); process.exit(1); });
