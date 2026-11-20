/* =====================================================================
   GSTF · « Aide » · PROTOTYPE de reconnaissance du SENS (sans IA)
   À coller dans la console du site (après ouverture de « Aide ») pour l'essayer :
   il se pose PAR-DESSUS l'Aide actuelle, sans rien modifier sur le serveur.
   Quand il ne reconnaît rien de sûr, l'Aide d'aujourd'hui répond exactement comme avant.

   Lecture d'une question en 3 temps :
     1. le CADRE  : la question parle-t-elle du Séminaire / du site, ou du monde extérieur ?
                    (monde extérieur sans aucun lien avec le Séminaire → « je ne peux pas répondre »)
     2. les CONCEPTS : des groupes de sens (FR / EN / IT), ex. PAYER, ENTRER, RÉPONSE…
     3. le choix de la FICHE : une règle = des concepts qui doivent être présents ensemble.
        Une seule règle doit correspondre ; si deux règles différentes correspondent, on ne décide pas
        (l'Aide actuelle reprend la main).
   ===================================================================== */
(function () {
  const N = q => ' ' + (typeof aideNorm === 'function' ? aideNorm(q) : q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ')).replace(/\s+/g, ' ').trim() + ' ';
  const R = s => new RegExp(s);

  // ---------- 1. Le cadre ----------
  // Un mot qui rattache la question au Séminaire ou au site
  const ANCRE = R(' (seminaire|seminaires|seminariste|seminaristes|seminary|seminario|gstf|faliarivo|chez vous|vos|votre|pere|peres|recteur|prefet|formateurs?|secretariat|bureau|site|appli|application|inscription|inscrire|inscris|admis|admission|etudiant|etudiants|etudier|cours|examens?|notes?|bibliotheque|messe|messes|priere|prier|priez|prient|evangile|lectures?|don|soutenir) ');
  // Des objets du monde extérieur (le site n'en parle jamais)
  const DEHORS = R(' (gmail|facebook|tiktok|instagram|youtube|whatsapp business|riz|sucre|essence|gasoil|carburant|meteo|temps fera|pluie|match|foot|football|coupe du monde|barea|score|capitale|moto|voiture|batterie|recette|romazava|cuisine|paludisme|soigner|maladie de|medicament|visa|passeport|cv|un emploi|offre d emploi|salaire|meilleur telephone|acheter un telephone|smartphone a acheter|bitcoin|loto|horoscope) ');

  // ---------- 2. Les concepts ----------
  const C = {
    PAYER:     R(' (cout|coute|couter|coutent|prix|tarif|cher|chere|payer|paye|montant|how much|cost|costs|fee|fees|quanto costa|costa|costo|retta) '),
    FRAIS:     R(' (frais|pension|scolarite|ecolage|retta|tuition|fee|fees) '),
    ETUDES:    R(' (etudier|etudes|seminaire|gstf|par an|annee|annuel|annuelle|yearly|year|study|annuale|mon fils|mensuelle|mois) '),
    ESPACE:    R(' (espace|compte|connecter|connexion|mot de passe|site|appli|application|page) '),
    ENTRER:    R(' (entrer|admis|admission|accepte|acceptes|conditions?|devenir pretre|devenir seminariste|faut il avoir|obligatoire|bac|baccalaureat|age|petit seminaire|philosophie avant|prerequis) '),
    PAPIERS:   R(' (papiers|pieces|documents|dossier|apporter|fournir|papers|documenti) '),
    INSCRIRE:  R(' (inscrire|inscription|inscris|register|apply|iscrizione|candidature) '),
    BUREAU:    R(' (bureau|bureaux|secretariat|office) '),
    HEURE:     R(' (heure|heures|horaire|horaires|ouvre|ouvert|ouverte|ferme|fermee|samedi|dimanche|travaille|matin|apres midi) '),
    VACANCES:  R(' (vacances|fetes de fin d annee|fin d annee|noel|aout|juillet|paques|conges|conge) '),
    SANSREP:   R(' (pas de reponse|aucune reponse|sans reponse|personne ne m a repondu|personne ne repond|toujours rien|et rien|pas repondu|jamais repondu|no answer|no reply) '),
    MAIL:      R(' (email|e mail|mail|courriel|mon adresse) '),
    LIEU:      R(' (ou se trouve|ou est situe|adresse|route|comment venir|comment aller|arriver|arrive t on|taxi brousse|descendre|itineraire|situe|localisation|where is) '),
    VISITE:    R(' (visiter|visite|passer voir|venir voir|voir les lieux|voir le seminaire|come and see) '),
    PROCHE_SEM:R(' (seminariste|seminaire|seminary|seminario|nouvelles|visiter|visit|voir) '),
    DECES:     R(' (decede|decedee|deces|mort|morte|defunt|enterrement|died) '),
    PROCHE:    R(' (mon fils|ma fille|mon neveu|mon frere|mon cousin|my brother|my son|mio figlio|mio fratello) '),
    MESSE:     R(' (messe|messes|mass) '),
    PRIER:     R(' (prier pour|priez pour|prient pour|prie pour|intention|pray for|pregate per) '),
    DON:       R(' (don|dons|offrir de l argent|donner de l argent|soutenir financierement|aider financierement|donation|donate) '),
    SUSPECT:   R(' (inconnu|bizarre|suspect|suspecte|etrange|faux|arnaque) '),
    MESSAGE:   R(' (message|sms|whatsapp|appel|mail|email|demande de l argent|demande d argent) '),
    MDP:       R(' (mot de passe|password|mdp) '),
    OUBLI:     R(' (oublie|oubliee|perdu|retrouve plus|ne me souviens|plus mon) '),
    LENT:      R(' (lent|lente|rame|eternite|met longtemps|trop long a charger|slow) '),
    INSTALLER: R(' (installer|ecran d accueil|avoir l appli|telecharger l appli|appli gstf|application gstf|sur android|sur iphone) '),
    QUI_DIRIGE:R(' (qui est le recteur|qui dirige le seminaire|qui dirige le gstf|qui dirige le grand seminaire|peres formateurs|equipe formatrice|qui sont les formateurs|qui sont les peres) '),
    RECTEUR:   R(' (recteur) '),
    RENCONTRER:R(' (parler au|rencontrer|voir le pere|en personne|rendez vous avec le recteur) '),
    LIVRE:     R(' (livre|livres|bibliotheque|ouvrages) '),
    EXTERIEUR: R(' (pas etudiant|non etudiant|etranger|exterieur|public|visiteur|sur place) '),
    LECTURE_J: R(' (evangile|lectures|textes de la messe|lecture) '),
    AUJOURD:   R(' (aujourd hui|ce jour|du jour|prevu pour ce jour) '),
    CONTACT:   R(' (numero|telephone|email|e mail|joindre) '),
    DU_SEM:    R(' (du seminaire|du gstf|au seminaire|vous joindre|vous contacter|vous appeler|de votre secretariat|du secretariat) '),
    MON_APP:   R(' (mon telephone|sur mon|dans mon|mon portable|mon ordinateur) '),
    AUTRE_SUJET: R(' (billet|billets|sakafo|sakafom|article payant|attestation|releve|carte d etudiant|notes?|heures|ects|credits|livre|livres) ')
  };

  // ---------- 3. Les règles : concepts présents ensemble → fiche ----------
  const REGLES = [
    ['Frais de scolarité et pension',                q => !q.AUTRE_SUJET && !q.DON && (q.FRAIS || (q.PAYER && q.ETUDES))],
    ['Conditions pour entrer au Grand Séminaire',    q => q.ENTRER && !q.PAPIERS && !q.PAYER && !q.ESPACE],
    ['Pièces à fournir pour l’inscription',          q => q.PAPIERS && q.INSCRIRE],
    ['Horaires des bureaux pendant les vacances',    q => q.VACANCES && (q.BUREAU || q.HEURE)],
    ['Horaires du secrétariat',                      q => q.BUREAU && q.HEURE && !q.VACANCES],
    ['Délai de réponse du secrétariat',              q => q.SANSREP],
    ['Adresse du Séminaire et comment venir',        q => q.LIEU && !q.LIVRE && !q.MAIL],
    ['Mon fils (ou un proche) est séminariste : prendre des nouvelles, visiter, écrire', q => q.PROCHE && q.PROCHE_SEM && !q.DECES && !q.PAYER],
    ['Visiter le Séminaire',                         q => q.VISITE && !q.PROCHE],
    ['Horaires des messes au Séminaire',             q => q.MESSE && q.HEURE],
    ['Confier une intention de prière',              q => q.PRIER],
    ['Faire un don au Séminaire',                    q => q.DON],
    ['J’ai reçu un message suspect au nom du Séminaire : que faire ?', q => q.SUSPECT && q.MESSAGE],
    ['J’ai oublié mon mot de passe',                 q => q.MDP && q.OUBLI],
    ['Le site est lent sur mon téléphone (3G, 2G) : que faire ?', q => q.LENT],
    ['Installer l’application GSTF sur mon téléphone', q => q.INSTALLER],
    ['Qui dirige le Séminaire ? (équipe formatrice)', q => q.QUI_DIRIGE],
    ['Rencontrer le Père Recteur',                   q => q.RECTEUR && q.RENCONTRER],
    ['La bibliothèque est-elle ouverte au public ?', q => q.LIVRE && q.EXTERIEUR],
    ['Les lectures de la messe du jour',             q => q.LECTURE_J && q.AUJOURD],
    ['Téléphone et email du Séminaire',              q => q.CONTACT && q.DU_SEM && !q.MON_APP && !q.SANSREP && !q.SUSPECT && !q.MDP]
  ];

  // Lecture complète d'une question
  window.aideSens = function (q0) {
    const n = N(q0 || ''), q = {};
    for (const k in C) q[k] = C[k].test(n);
    const dehors = DEHORS.test(n) && !ANCRE.test(n);
    if (dehors) return { cadre: 'dehors', fiche: null, concepts: [] };
    const ok = REGLES.filter(([, f]) => f(q)).map(([t]) => t);
    return { cadre: 'gstf', concepts: Object.keys(q).filter(k => q[k]), regles: ok, fiche: ok.length === 1 ? ok[0] : null };
  };

  // ---------- Branchement par-dessus l'Aide actuelle (prototype) ----------
  if (window.__aideSensBranche) return; window.__aideSensBranche = true;
  const chercher0 = aideChercher, sur0 = aideSur, intention0 = typeof aideIntention === 'function' ? aideIntention : null, porte0 = typeof aidePorte === 'function' ? aidePorte : null;
  const fiche = t => AIDE.find(a => a.q === t);
  window.aideChercher = function (q) {
    const l = chercher0(q), s = aideSens(q);
    if (s.cadre === 'dehors') return [];                 // monde extérieur : pas de fiche
    const a = s.fiche && fiche(s.fiche);
    if (a) return [a, ...l.filter(x => x !== a)].slice(0, Math.max(l.length, 1));   // la fiche du sens d'abord
    return l;
  };
  aideChercher = window.aideChercher;
  window.aideSur = function (q, l, D) { const s = aideSens(q); if (s.cadre === 'dehors') return false; if (s.fiche && l[0] && l[0].q === s.fiche) return true; return sur0(q, l, D); };
  aideSur = window.aideSur;
  if (intention0) { window.aideIntention = function (q) { const s = aideSens(q); if (s.cadre === 'dehors' || s.fiche) return ''; return intention0(q); }; aideIntention = window.aideIntention; }
  if (porte0) { window.aidePorte = function (q, l) { const s = aideSens(q); if (s.cadre === 'dehors' || s.fiche) return null; return porte0(q, l); }; aidePorte = window.aidePorte; }
})();
