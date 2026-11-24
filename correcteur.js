/* GSTF : relecteur de français qui fonctionne sur l'appareil (rien n'est envoyé sur Internet).
   Il utilise Grammalecte (Olivier R., grammalecte.net), sous licence GNU GPL 3 (voir LICENSE-GPL3.txt) ;
   ce fichier et les petites adaptations de chemins faites dans fr/conj.js, fr/mfsp.js, fr/phonet.js et graphspell/ibdawg.js
   sont sous la même licence. Source d'origine : grammalecte.net (paquet repris de github.com/ONLYOFFICE/plugin-grammalecte). */
self.window = self; self.GL_BASE = new URL('./', self.location.href).href;
importScripts('graphspell/helpers.js', 'graphspell/lexgraph_fr.js', 'graphspell/char_player.js', 'fr/conj.js', 'fr/mfsp.js', 'fr/phonet.js', 'fr/gc_options.js', 'fr/gc_engine.js', 'fr/gc_functions.js',
  'fr/gc_rules.js', 'fr/gc_rules_graph.js', 'fr/cregex.js', 'text.js', 'graphspell/spellchecker.js', 'graphspell/tokenizer.js', 'fr/textformatter.js', 'graphspell/str_transform.js', 'graphspell/ibdawg.js', 'api.js');
let G = null;
self.onmessage = e => {
  const { id, paras, ignorer } = e.data || {};
  try {
    if (!G) G = new GrammarChecker(self.GL_BASE, ['Grammalecte'], 'fr');
    if (e.data.majuscules) {   // « EGLISE » → « ÉGLISE » : la forme accentuée que connaît le dictionnaire
      const sa = x => x.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), maj = {};
      for (const w of e.data.majuscules) { const lw = w.toLowerCase(); if (G.oSpellChecker.isValid(lw)) continue; const s = (G.suggest(lw, 12) || []).find(x => x !== lw && sa(x) === sa(lw)); if (s) maj[w] = w === w.toUpperCase() ? s.toUpperCase() : s.charAt(0).toUpperCase() + s.slice(1); }
      postMessage({ id, ok: true, maj }); return; }
    const ign = new Set((ignorer || []).map(x => String(x).toLowerCase()));
    const out = (paras || []).map(p => {
      const g = Array.from(G._oGce.parse(p, 'FR', false, null, false) || []).map(x => ({ d: x.nStart, f: x.nEnd, msg: x.sMessage, sug: (x.aSuggestions || []).slice(0, 4), regle: x.sRuleId || x.sLineId || '', type: 'g' }));
      const s = (G.oSpellChecker.parseParagraph(p) || []).filter(t => !ign.has(String(t.sValue).toLowerCase())).map(t => ({ d: t.nStart, f: t.nEnd, mot: t.sValue, msg: 'Mot inconnu du dictionnaire', sug: G.suggest(t.sValue, 4), type: 'o' }));
      return [...g, ...s].sort((a, b) => a.d - b.d);
    });
    postMessage({ id, ok: true, out });
  } catch (er) { postMessage({ id, ok: false, err: String((er && er.message) || er) }); }
};
postMessage({ pret: true });
