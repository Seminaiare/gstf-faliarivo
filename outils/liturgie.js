// Fabriqué par faire_liturgie.py à partir du site : ne pas modifier à la main.
"use strict";
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = s => new Date(s + 'T12:00:00');
function datePaques(an) {   // calcul grégorien (Meeus)
  const a = an % 19, b = Math.floor(an / 100), c = an % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mois = Math.floor((h + l - 7 * m + 114) / 31), jour = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(an, mois - 1, jour);
}
const plusJours = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const CAL_ROMAIN_TXT = `01-01 S b Sainte Marie, Mère de Dieu
01-02 M b Saint Basile le Grand et saint Grégoire de Nazianze, évêques et docteurs de l’Église
01-03 m b Le Saint Nom de Jésus
01-07 m b Saint Raymond de Penyafort, prêtre
01-13 m b Saint Hilaire, évêque et docteur de l’Église
01-17 M b Saint Antoine, abbé
01-20 m r Saint Fabien, pape et martyr
01-20 m r Saint Sébastien, martyr
01-21 M r Sainte Agnès, vierge et martyre
01-22 m r Saint Vincent, diacre et martyr
01-24 M b Saint François de Sales, évêque et docteur de l’Église
01-25 F b La Conversion de saint Paul, apôtre
01-26 M b Saint Timothée et saint Tite, évêques
01-27 m b Sainte Angèle Merici, vierge
01-28 M b Saint Thomas d’Aquin, prêtre et docteur de l’Église
01-31 M b Saint Jean Bosco, prêtre
02-02 L b La Présentation du Seigneur au Temple
02-03 m r Saint Blaise, évêque et martyr
02-03 m b Saint Anschaire, évêque
02-05 M r Sainte Agathe, vierge et martyre
02-06 M r Saint Paul Miki et ses compagnons, martyrs
02-08 m b Saint Jérôme Émilien
02-08 m b Sainte Joséphine Bakhita, vierge
02-10 M b Sainte Scholastique, vierge
02-11 m b Notre-Dame de Lourdes
02-14 M b Saint Cyrille, moine, et saint Méthode, évêque
02-17 m b Les sept saints fondateurs des Servites de Marie
02-21 m b Saint Pierre Damien, évêque et docteur de l’Église
02-22 F b La Chaire de saint Pierre, apôtre
02-23 M r Saint Polycarpe, évêque et martyr
02-27 m b Saint Grégoire de Narek, abbé et docteur de l’Église
03-04 m b Saint Casimir
03-07 M r Sainte Perpétue et sainte Félicité, martyres
03-08 m b Saint Jean de Dieu, religieux
03-09 m b Sainte Françoise Romaine, religieuse
03-17 m b Saint Patrick, évêque
03-18 m b Saint Cyrille de Jérusalem, évêque et docteur de l’Église
03-19 S b Saint Joseph, époux de la Vierge Marie
03-23 m b Saint Turibio de Mogrovejo, évêque
03-25 S b L’Annonciation du Seigneur
04-02 m b Saint François de Paule, ermite
04-04 m b Saint Isidore, évêque et docteur de l’Église
04-05 m b Saint Vincent Ferrier, prêtre
04-07 M b Saint Jean-Baptiste de La Salle, prêtre
04-11 M r Saint Stanislas, évêque et martyr
04-13 m r Saint Martin Ier, pape et martyr
04-21 m b Saint Anselme, évêque et docteur de l’Église
04-23 m r Saint Georges, martyr
04-23 m r Saint Adalbert, évêque et martyr
04-24 m r Saint Fidèle de Sigmaringen, prêtre et martyr
04-25 F r Saint Marc, évangéliste
04-28 m r Saint Pierre Chanel, prêtre et martyr
04-28 m b Saint Louis-Marie Grignion de Montfort, prêtre
04-29 M b Sainte Catherine de Sienne, vierge et docteur de l’Église
04-30 m b Saint Pie V, pape
05-01 m b Saint Joseph, travailleur
05-02 M b Saint Athanase, évêque et docteur de l’Église
05-03 F r Saint Philippe et saint Jacques, apôtres
05-10 m b Saint Jean d’Avila, prêtre et docteur de l’Église
05-12 m r Saint Nérée et saint Achille, martyrs
05-12 m r Saint Pancrace, martyr
05-13 m b Notre-Dame de Fatima
05-14 F r Saint Matthias, apôtre
05-18 m r Saint Jean Ier, pape et martyr
05-20 m b Saint Bernardin de Sienne, prêtre
05-21 m r Saint Christophe Magallanes, prêtre, et ses compagnons, martyrs
05-22 m b Sainte Rita de Cascia, religieuse
05-25 m b Saint Bède le Vénérable, prêtre et docteur de l’Église
05-25 m b Saint Grégoire VII, pape
05-25 m b Sainte Marie-Madeleine de Pazzi, vierge
05-26 M b Saint Philippe Néri, prêtre
05-27 m b Saint Augustin de Cantorbéry, évêque
05-29 m b Saint Paul VI, pape
05-31 F b La Visitation de la Vierge Marie
06-01 M r Saint Justin, martyr
06-02 m r Saint Marcellin et saint Pierre, martyrs
06-03 M r Saint Charles Lwanga et ses compagnons, martyrs
06-05 M r Saint Boniface, évêque et martyr
06-06 m b Saint Norbert, évêque
06-08 M r Saint Jacques Berthieu, prêtre et martyr de Madagascar
06-09 m b Saint Éphrem, diacre et docteur de l’Église
06-11 M r Saint Barnabé, apôtre
06-13 M b Saint Antoine de Padoue, prêtre et docteur de l’Église
06-19 m b Saint Romuald, abbé
06-21 M b Saint Louis de Gonzague, religieux
06-22 m b Saint Paulin de Nole, évêque
06-22 m r Saint Jean Fisher, évêque, et saint Thomas More, martyrs
06-24 S b La Nativité de saint Jean-Baptiste
06-27 m b Saint Cyrille d’Alexandrie, évêque et docteur de l’Église
06-28 M r Saint Irénée, évêque, martyr et docteur de l’Église
06-29 S r Saint Pierre et saint Paul, apôtres
06-30 m r Les premiers martyrs de l’Église de Rome
07-03 F r Saint Thomas, apôtre
07-04 m b Sainte Élisabeth de Portugal
07-05 m b Saint Antoine-Marie Zaccaria, prêtre
07-06 m r Sainte Maria Goretti, vierge et martyre
07-09 m r Saint Augustin Zhao Rong, prêtre, et ses compagnons, martyrs
07-11 M b Saint Benoît, abbé
07-13 m b Saint Henri
07-14 m b Saint Camille de Lellis, prêtre
07-15 M b Saint Bonaventure, évêque et docteur de l’Église
07-16 m b Notre-Dame du Mont-Carmel
07-20 m r Saint Apollinaire, évêque et martyr
07-21 m b Saint Laurent de Brindes, prêtre et docteur de l’Église
07-22 F b Sainte Marie Madeleine
07-23 m b Sainte Brigitte, religieuse
07-24 m b Saint Charbel Makhlouf, prêtre
07-25 F r Saint Jacques, apôtre
07-26 M b Saint Joachim et sainte Anne, parents de la Vierge Marie
07-29 M b Sainte Marthe, sainte Marie et saint Lazare
07-30 m b Saint Pierre Chrysologue, évêque et docteur de l’Église
07-31 M b Saint Ignace de Loyola, prêtre
08-01 M b Saint Alphonse-Marie de Liguori, évêque et docteur de l’Église
08-02 m b Saint Eusèbe de Verceil, évêque
08-02 m b Saint Pierre-Julien Eymard, prêtre
08-04 M b Saint Jean-Marie Vianney, prêtre
08-05 m b La Dédicace de la basilique Sainte-Marie-Majeure
08-06 L b La Transfiguration du Seigneur
08-07 m r Saint Sixte II, pape, et ses compagnons, martyrs
08-07 m b Saint Gaétan, prêtre
08-08 M b Saint Dominique, prêtre
08-09 m r Sainte Thérèse-Bénédicte de la Croix, vierge et martyre
08-10 F r Saint Laurent, diacre et martyr
08-11 M b Sainte Claire, vierge
08-12 m b Sainte Jeanne-Françoise de Chantal, religieuse
08-13 m r Saint Pontien, pape, et saint Hippolyte, prêtre, martyrs
08-14 M r Saint Maximilien-Marie Kolbe, prêtre et martyr
08-15 S b L’Assomption de la Vierge Marie
08-16 m b Saint Étienne de Hongrie
08-19 m b Saint Jean Eudes, prêtre
08-20 M b Saint Bernard, abbé et docteur de l’Église
08-21 M b Bienheureuse Victoire Rasoamanarivo
08-22 M b La Vierge Marie Reine
08-23 m b Sainte Rose de Lima, vierge
08-24 F r Saint Barthélemy, apôtre
08-25 m b Saint Louis
08-25 m b Saint Joseph de Calasanz, prêtre
08-27 M b Sainte Monique
08-28 M b Saint Augustin, évêque et docteur de l’Église
08-29 M r La Passion de saint Jean-Baptiste
09-03 M b Saint Grégoire le Grand, pape et docteur de l’Église
09-08 F b La Nativité de la Vierge Marie
09-09 m b Saint Pierre Claver, prêtre
09-12 m b Le Saint Nom de Marie
09-13 M b Saint Jean Chrysostome, évêque et docteur de l’Église
09-14 L r La Croix glorieuse
09-15 M b Notre-Dame des Douleurs
09-16 M r Saint Corneille, pape, et saint Cyprien, évêque, martyrs
09-17 m b Saint Robert Bellarmin, évêque et docteur de l’Église
09-17 m b Sainte Hildegarde de Bingen, vierge et docteur de l’Église
09-19 m r Saint Janvier, évêque et martyr
09-20 M r Saint André Kim Tae-gon, saint Paul Chong Ha-sang et leurs compagnons, martyrs
09-21 F r Saint Matthieu, apôtre et évangéliste
09-23 M b Saint Pio de Pietrelcina, prêtre
09-26 m r Saint Côme et saint Damien, martyrs
09-27 M b Saint Vincent de Paul, prêtre
09-28 m r Saint Venceslas, martyr
09-28 m r Saint Laurent Ruiz et ses compagnons, martyrs
09-29 F b Saint Michel, saint Gabriel et saint Raphaël, archanges
09-30 M b Saint Jérôme, prêtre et docteur de l’Église
10-01 S b Sainte Thérèse de l’Enfant-Jésus, vierge et docteur de l’Église, patronne du Séminaire
10-02 M b Les saints Anges gardiens
10-04 M b Saint François d’Assise
10-05 m b Sainte Faustine Kowalska, vierge
10-06 m b Saint Bruno, prêtre
10-07 M b Notre-Dame du Rosaire
10-09 m r Saint Denis, évêque, et ses compagnons, martyrs
10-09 m b Saint Jean Leonardi, prêtre
10-11 m b Saint Jean XXIII, pape
10-14 m r Saint Calliste Ier, pape et martyr
10-15 M b Sainte Thérèse d’Avila, vierge et docteur de l’Église
10-16 m b Sainte Edwige, religieuse
10-16 m b Sainte Marguerite-Marie Alacoque, vierge
10-17 M r Saint Ignace d’Antioche, évêque et martyr
10-18 F r Saint Luc, évangéliste
10-19 m r Saint Jean de Brébeuf, saint Isaac Jogues et leurs compagnons, martyrs
10-19 m b Saint Paul de la Croix, prêtre
10-22 m b Saint Jean-Paul II, pape
10-23 m b Saint Jean de Capistran, prêtre
10-24 m b Saint Antoine-Marie Claret, évêque
10-28 F r Saint Simon et saint Jude, apôtres
11-01 S b Tous les Saints
11-02 S v Commémoration de tous les fidèles défunts
11-03 m b Saint Martin de Porrès, religieux
11-04 M b Saint Charles Borromée, évêque
11-09 L b La Dédicace de la basilique du Latran
11-10 M b Saint Léon le Grand, pape et docteur de l’Église
11-11 M b Saint Martin de Tours, évêque
11-12 M r Saint Josaphat, évêque et martyr
11-15 m b Saint Albert le Grand, évêque et docteur de l’Église
11-16 m b Sainte Marguerite d’Écosse
11-16 m b Sainte Gertrude, vierge
11-17 M b Sainte Élisabeth de Hongrie, religieuse
11-18 m b La Dédicace des basiliques de saint Pierre et de saint Paul
11-21 M b La Présentation de la Vierge Marie
11-22 M r Sainte Cécile, vierge et martyre
11-23 m r Saint Clément Ier, pape et martyr
11-23 m b Saint Colomban, abbé
11-24 M r Saint André Dung-Lac, prêtre, et ses compagnons, martyrs
11-25 m r Sainte Catherine d’Alexandrie, vierge et martyre
11-30 F r Saint André, apôtre
12-03 M b Saint François Xavier, prêtre
12-04 m b Saint Jean de Damas, prêtre et docteur de l’Église
12-06 m b Saint Nicolas, évêque
12-07 M b Saint Ambroise, évêque et docteur de l’Église
12-08 S b L’Immaculée Conception de la Vierge Marie
12-09 m b Saint Juan Diego Cuauhtlatoatzin
12-10 m b Notre-Dame de Lorette
12-11 m b Saint Damase Ier, pape
12-12 m b Notre-Dame de Guadalupe
12-13 M r Sainte Lucie, vierge et martyre
12-14 M b Saint Jean de la Croix, prêtre et docteur de l’Église
12-21 m b Saint Pierre Canisius, prêtre et docteur de l’Église
12-23 m b Saint Jean de Kenty, prêtre
12-25 S b La Nativité du Seigneur
12-26 F r Saint Étienne, premier martyr
12-27 F b Saint Jean, apôtre et évangéliste
12-28 F r Les saints Innocents, martyrs
12-29 m r Saint Thomas Becket, évêque et martyr
12-31 m b Saint Sylvestre Ier, pape`;
const CAL_ROMAIN = {};
CAL_ROMAIN_TXT.split('\n').forEach(l => { const [md, rang, c, ...n] = l.trim().split(' '); (CAL_ROMAIN[md] = CAL_ROMAIN[md] || []).push({ rang, c, nom: n.join(' ') }); });
const COUL_LIT = { b: 'blanche', r: 'rouge', v: 'violette' };
const RANG_LIT = { S: 'Solennité', L: 'Fête du Seigneur', F: 'Fête', M: 'Mémoire', m: 'Mémoire facultative' };
// Célébrations à date mobile et solennités déplacées, pour une année
function calMobile(an) {
  const P = datePaques(an), k = d => iso(d), M = {};
  const n = new Date(an, 11, 25), avent = plusJours(n, -(n.getDay() || 7) - 21), j2 = new Date(an, 0, 2), epi = plusJours(j2, (7 - j2.getDay()) % 7);
  const ajout = (d, rang, c, nom) => { (M[k(d)] = M[k(d)] || []).push({ rang, c, nom }); };
  ajout(epi, 'S', 'b', 'L’Épiphanie du Seigneur');
  ajout(plusJours(epi, epi.getDate() >= 7 ? 1 : 7), 'L', 'b', 'Le Baptême du Seigneur');
  ajout(plusJours(P, 39), 'S', 'b', 'L’Ascension du Seigneur');
  ajout(plusJours(P, 50), 'M', 'b', 'La Bienheureuse Vierge Marie, Mère de l’Église');
  ajout(plusJours(P, 56), 'S', 'b', 'La Sainte Trinité');
  ajout(plusJours(P, 63), 'S', 'b', 'Le Saint-Sacrement du Corps et du Sang du Christ');
  ajout(plusJours(P, 68), 'S', 'b', 'Le Sacré-Cœur de Jésus');
  ajout(plusJours(P, 69), 'M', 'b', 'Le Cœur immaculé de Marie');
  ajout(plusJours(avent, -7), 'S', 'b', 'Notre-Seigneur Jésus Christ, Roi de l’univers');
  const dimOct = [26, 27, 28, 29, 30, 31].map(j => new Date(an, 11, j)).find(d => d.getDay() === 0);
  ajout(dimOct || new Date(an, 11, 30), 'L', 'b', 'La Sainte Famille de Jésus, Marie et Joseph');
  return { M, P, avent };
}
const CAL_CACHE = {};
// La célébration du jour selon l'ordre de préséance (simplifié) du calendrier romain
function celebrationDuJour(d, temps, dim) {
  const D = parseIso(d), an = D.getFullYear(), Y = CAL_CACHE[an] || (CAL_CACHE[an] = calMobile(an)), P = Y.P;
  const D0 = new Date(an, D.getMonth(), D.getDate()), e = x => Math.round((D0 - new Date(x.getFullYear(), x.getMonth(), x.getDate())) / 864e5);
  const eP = e(P), md = d.slice(5);
  const fort = (eP >= -46 && eP <= -43) || (eP >= -7 && eP <= 7);    // Cendres, Semaine sainte, octave de Pâques : rien ne les remplace
  const dimFort = dim && ['Avent', 'Carême', 'Semaine sainte', 'Temps pascal'].includes(temps);
  let L = [...(Y.M[d] || []), ...(CAL_ROMAIN[md] || [])];
  // Solennités déplacées : saint Joseph et l'Annonciation (Carême, Semaine sainte, octave de Pâques), Immaculée Conception (dimanche de l'Avent)
  const transfert = (mmdd, nom) => { const o = new Date(an, +mmdd.slice(0, 2) - 1, +mmdd.slice(3)), eo = e(o);
    const x = Math.round((o - new Date(P.getFullYear(), P.getMonth(), P.getDate())) / 864e5); let cible = null;
    if (x >= -7 && x <= 7) cible = mmdd === '03-19' ? plusJours(P, -8) : plusJours(P, 8);
    else if (o.getDay() === 0 && (x < 0 && x >= -46 || mmdd === '12-08')) cible = plusJours(o, 1);
    if (cible) { if (eo === 0) L = L.filter(c => c.nom !== nom); if (iso(cible) === d) L.unshift({ rang: 'S', c: 'b', nom: nom + ' (reportée)' }); } };
  transfert('03-19', 'Saint Joseph, époux de la Vierge Marie'); transfert('03-25', 'L’Annonciation du Seigneur'); transfert('12-08', 'L’Immaculée Conception de la Vierge Marie');
  const ordre = { S: 0, L: 1, F: 2, M: 3, m: 4 };
  L.sort((a, b) => ordre[a.rang] - ordre[b.rang]);
  const top = L[0];
  if (!top) return null;
  if (fort || dimFort) return top.nom.includes('reportée') ? top : null;   // seules les solennités reportées y trouvent place
  if (dim && !['S', 'L'].includes(top.rang)) return null;                       // le dimanche l'emporte sur les fêtes et mémoires
  const avPrive = (temps === 'Carême') || (temps === 'Avent' && D.getMonth() === 11 && D.getDate() >= 17);
  if (top.rang === 'M' && avPrive) return { ...top, rang: 'm', commemoration: true };   // en Carême et du 17 au 24 décembre : simple commémoraison
  return { ...top, autres: ['M', 'm'].includes(top.rang) ? L.slice(1).filter(c => c.rang === 'm' || c.rang === top.rang) : [] };
}

/* ---------- Liturgie du jour : temps liturgique, couleur, fête, lectures (AELF) ---------- */
const LIT_COUL = { verte: '#2e7d32', violette: '#6a1b9a', blanche: '#efe8d2', rouge: '#c62828', rose: '#e58fb0' };
const JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const ordinal = n => n === 1 ? '1re' : n + 'e', ordinalM = n => n === 1 ? '1er' : n + 'e';   // 1re semaine, 1er dimanche
function liturgieDuJour(d = TODAY) {
  const D = parseIso(d), an = D.getFullYear(), D0 = new Date(an, D.getMonth(), D.getDate()), ecart = x => Math.round((D0 - new Date(x.getFullYear(), x.getMonth(), x.getDate())) / 864e5);
  const aventDe = a => { const n = new Date(a, 11, 25); return plusJours(n, -(n.getDay() || 7) - 21); };
  const P = datePaques(an), cendres = plusJours(P, -46), avent = aventDe(an), roi = plusJours(avent, -7), noel = new Date(an, 11, 25);
  const j2 = new Date(an, 0, 2), epi = plusJours(j2, (7 - j2.getDay()) % 7), bapt = plusJours(epi, epi.getDate() >= 7 ? 1 : 7);
  const jour = JOURS_FR[D.getDay()], dim = D.getDay() === 0, J = jour[0].toUpperCase() + jour.slice(1);
  let temps, libelle, couleur = 'verte';
  if (ecart(avent) >= 0 && D < noel) { const s = Math.floor(ecart(avent) / 7) + 1; temps = 'Avent'; couleur = dim && s === 3 ? 'rose' : 'violette';
    libelle = dim ? `${ordinalM(s)} dimanche de l’Avent` : `${J} de la ${ordinal(s)} semaine de l’Avent`; }
  else if (D >= noel || ecart(bapt) <= 0) { temps = 'Temps de Noël'; couleur = 'blanche'; libelle = ecart(bapt) === 0 ? 'Baptême du Seigneur' : dim ? 'Dimanche du temps de Noël' : `${J} du temps de Noël`; }
  else if (ecart(cendres) < 0) { const s = Math.floor(ecart(bapt) / 7) + 1; temps = 'Temps ordinaire';
    libelle = dim ? `${ordinalM(s + 1)} dimanche du temps ordinaire` : `${J} de la ${ordinal(s)} semaine du temps ordinaire`; }
  else if (ecart(P) < -3) { const e = ecart(cendres); temps = 'Carême'; couleur = 'violette';
    if (e < 4) libelle = e === 0 ? 'Mercredi des Cendres' : `${J} après les Cendres`;
    else { const s = Math.floor((e - 4) / 7) + 1; if (s >= 6) { temps = 'Semaine sainte'; libelle = dim ? 'Dimanche des Rameaux et de la Passion' : `${J} saint`; if (dim) couleur = 'rouge'; }
      else { libelle = dim ? `${ordinalM(s)} dimanche de Carême` : `${J} de la ${ordinal(s)} semaine de Carême`; if (dim && s === 4) couleur = 'rose'; } } }
  else if (ecart(P) < 0) { temps = 'Triduum pascal'; const e = ecart(P); libelle = e === -3 ? 'Jeudi saint, la Cène du Seigneur' : e === -2 ? 'Vendredi saint, la Passion du Seigneur' : 'Samedi saint';
    couleur = e === -3 ? 'blanche' : e === -2 ? 'rouge' : 'violette'; }
  else if (ecart(P) <= 49) { const e = ecart(P), s = Math.floor(e / 7) + 1; temps = 'Temps pascal'; couleur = e === 49 ? 'rouge' : 'blanche';
    libelle = e === 0 ? 'Dimanche de Pâques' : e === 49 ? 'Pentecôte' : e < 7 ? `${J} de l’octave de Pâques` : dim ? `${ordinalM(s)} dimanche de Pâques` : `${J} de la ${ordinal(s)} semaine de Pâques`; }
  else { const s = ecart(roi) >= 0 ? 34 : 34 - Math.ceil(-ecart(roi) / 7); temps = 'Temps ordinaire';
    libelle = ecart(roi) === 0 ? 'Christ, Roi de l’univers' : dim ? `${ordinalM(s)} dimanche du temps ordinaire` : `${J} de la ${ordinal(s)} semaine du temps ordinaire`; }
  const cel = celebrationDuJour(d, temps, dim);
  let fete = '', rang = '', facult = [];
  if (cel) {
    if (cel.rang === 'm') facult = [cel, ...(cel.autres || [])].filter(x => x.rang === 'm');
    else { fete = cel.nom; rang = RANG_LIT[cel.rang]; couleur = COUL_LIT[cel.c] || couleur; facult = (cel.autres || []).filter(x => x.rang === 'm'); }
  }
  if (!fete && !facult.length && temps === 'Temps ordinaire' && D.getDay() === 6) facult = [{ nom: 'Sainte Marie le samedi', c: 'b' }];
  return { temps, libelle, couleur, fete, rang, facult: facult.map(x => x.nom + (x.commemoration ? ' (commémoraison)' : '')), aelf: `https://www.aelf.org/${d}/romain/messe` };
}
module.exports = { liturgieDuJour, iso, parseIso, plusJours };
