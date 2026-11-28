#!/usr/bin/env python3
"""Pages publiques des articles et des homélies du Grand Séminaire de Faliarivo.

Lancé chaque heure par GitHub (.github/workflows/pages-articles.yml). Lit, comme un VISITEUR
NON CONNECTÉ, les articles publics et les homélies (clé publique du site : les règles de Supabase
ne laissent voir que ce qui est public, déjà paru et sans lecteurs choisis). Écrit :
  articles/<id>-<titre>.html   une page par article (titre, auteur, résumé, texte gratuit, image)
  articles/index.html          la liste des articles
  homelies/<date>-<video>.html une page par homélie (titre, date, vidéo)
  sitemap-articles.xml         le plan de ces pages pour Google
Rien n’est écrit ailleurs. Aucun secret : la clé publique est déjà dans le site.
Essai sans réseau : ARTICLES_JSON=fichier.json HOMELIES_JSON=fichier.json python3 outils/pages_articles.py
"""
import html, json, os, re, sys, unicodedata, urllib.request, datetime

SITE = 'https://gstf-faliarivo.ovh'
SB = 'https://lznusbdqkzcxhskgdyip.supabase.co'
CLE = 'sb_publishable_o9nFSTGscnNs3K14ADejxA_X6hPgTDW'   # clé PUBLIQUE (la même que dans le site)
E = html.escape
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def lire(table, champs, filtres=''):
    env = os.environ.get(table.upper() + '_JSON')
    if env:
        return json.load(open(env, encoding='utf-8'))
    url = f'{SB}/rest/v1/{table}?select={champs}{filtres}'
    req = urllib.request.Request(url, headers={'apikey': CLE, 'Authorization': 'Bearer ' + CLE})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def slug(t):
    """Même règle que artSlug() dans le site."""
    s = str(t or '').replace('œ', 'oe').replace('Œ', 'oe').replace('æ', 'ae').replace('Æ', 'ae')
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:60].rstrip('-')
    return s or 'article'


def nom_article(a):
    return f"{a['id']}-{slug(a.get('titre'))}.html"


def texte_html(t):
    """Même mise en forme que artTexteHtml() dans le site : ## titres, ### sous-titres, *italique*, ((notes)), > citations, – listes."""
    notes, out = [], []
    def ligne(s):
        s = E(s)
        def note(m):
            notes.append(m.group(1)); n = len(notes)
            return f'<sup><a href="#note-{n}" id="ref-{n}">{n}</a></sup>'
        s = re.sub(r'\(\(([\s\S]+?)\)\)', note, s)
        return re.sub(r'\*([^*\n]+)\*', r'<i>\1</i>', s)
    for l in str(t or '').split('\n'):
        s = l.strip()
        if not s: continue
        if re.match(r'^###\s', s): out.append(f'<h3>{ligne(s[4:])}</h3>')
        elif re.match(r'^##\s', s): out.append(f'<h2>{ligne(s[3:])}</h2>')
        elif re.match(r'^>\s?', s): out.append('<blockquote>' + ligne(re.sub(r'^>\s?', '', s)) + '</blockquote>')
        elif re.match(r'^[–•-]\s', s): out.append(f'<p class="li">{ligne(s)}</p>')
        else: out.append(f'<p>{ligne(s)}</p>')
    if notes:
        out.append('<ol class="notes">' + ''.join(f'<li id="note-{i+1}">{E(n)} <a href="#ref-{i+1}" aria-label="Retour au texte">↩</a></li>' for i, n in enumerate(notes)) + '</ol>')
    return '\n'.join(out)


MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
def date_fr(iso):
    try:
        t = str(iso)
        if len(t) > 10:   # heure de publication → jour à Madagascar (UTC+3), comme sur le site
            d = (datetime.datetime.fromisoformat(t.replace('Z', '+00:00')) + datetime.timedelta(hours=3)).date()
        else:
            d = datetime.date.fromisoformat(t[:10])
        return f'{d.day} {MOIS[d.month-1]} {d.year}'
    except Exception:
        return ''


CSS = '''*{box-sizing:border-box}body{margin:0;font:18px/1.65 Georgia,'Times New Roman',serif;color:#222;background:#f6f4f1}a{color:#8c2a34}
header{background:#8c2a34;color:#fff;padding:12px 18px}header a{color:#fff;text-decoration:none}header b{font-size:18px}header small{display:block;opacity:.85;font:13px system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:22px 18px 40px}h1{font-size:30px;line-height:1.2;color:#5a161f;margin:6px 0 10px}h2{font-size:22px;color:#5a161f;margin:24px 0 6px}h3{font-size:19px;margin:18px 0 4px}
.meta{font:14px system-ui,sans-serif;color:#666;margin:0 0 14px}.resume{font-style:italic;font-size:19px;border-left:3px solid #c9a24a;padding-left:12px}
img.couv{max-width:100%;max-height:420px;display:block;margin:10px 0 16px;border-radius:8px}blockquote{margin:12px 0;padding-left:14px;border-left:3px solid #ddd;font-style:italic}.li{padding-left:14px}
.notes{font-size:15px;border-top:1px solid #ddd;padding-top:10px}.btn{display:inline-block;background:#8c2a34;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font:600 16px system-ui,sans-serif;margin:6px 6px 6px 0}
.btn2{display:inline-block;color:#8c2a34;border:1px solid #8c2a34;padding:11px 18px;border-radius:999px;text-decoration:none;font:600 15px system-ui,sans-serif;margin:6px 6px 6px 0}
ul.liste{list-style:none;padding:0}ul.liste li{padding:10px 0;border-bottom:1px solid #e5e0d8}ul.liste small{color:#666;font:13px system-ui,sans-serif}
.video{position:relative;padding-top:56.25%;margin:12px 0}.video iframe{position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:8px}
footer{text-align:center;font:13px system-ui,sans-serif;color:#666;padding:20px}'''


def page(chemin, titre, desc, image, corps, type_og='article', jsonld=None):
    url = f'{SITE}/{chemin}'
    img = image or f'{SITE}/partage.jpg'
    return f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(titre)} – Grand Séminaire de Faliarivo</title><meta name="description" content="{E(desc[:300])}"><link rel="canonical" href="{url}">
<meta property="og:type" content="{type_og}"><meta property="og:site_name" content="Grand Séminaire de Théologie de Faliarivo"><meta property="og:title" content="{E(titre)}">
<meta property="og:description" content="{E(desc[:300])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{E(img)}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/favicon-48.png"><meta name="theme-color" content="#8c2a34"><style>{CSS}</style>
{f'<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>' if jsonld else ''}</head><body>
<header><a href="/"><b>Grand Séminaire de Théologie</b><small>Sainte Thérèse de l’Enfant-Jésus · Faliarivo · Antananarivo</small></a></header>
<main>{corps}</main>
<footer>© {datetime.date.today().year} Grand Séminaire de Théologie Sainte Thérèse de l’Enfant-Jésus – Faliarivo · <a href="/">gstf-faliarivo.ovh</a> · <a href="/articles/">Tous les articles</a></footer></body></html>'''


def ecrire(chemin, contenu):
    p = os.path.join(RACINE, chemin)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    ancien = open(p, encoding='utf-8').read() if os.path.exists(p) else None
    if ancien != contenu:
        open(p, 'w', encoding='utf-8').write(contenu)


# v599 : GARDE-FOU. Contrôle fait JUSTE APRÈS la lecture de Supabase, AVANT d’écrire ou d’effacer le moindre fichier.
# Une réponse vide ou très réduite n’est pas une « erreur » pour Supabase, mais elle effacerait les pages publiques.
# Une page ne compte comme supprimée que si son NUMÉRO d’article disparaît (un titre corrigé = même numéro, nouveau nom).
# Pour les homélies : c’est la vidéo (video_id) qui compte, pas la date.
# Déblocage volontaire : onglet « Actions » › « Pages des articles » › « Run workflow », cocher « J’autorise les suppressions ».
MAX_SUPPR = 3


def deja_la(dossier, motif):
    d = os.path.join(RACINE, dossier)
    if not os.path.isdir(d):
        return set()
    return {m.group(1) for f in os.listdir(d) for m in [re.match(motif, f)] if m}


def garde_fou(A, H):
    if os.environ.get('AUTORISER_SUPPRESSIONS') == 'oui':
        print('Déblocage manuel : les suppressions sont autorisées pour cette fois.')
        return
    pb = []
    for quoi, avant, apres in (
        ('articles', deja_la('articles', r'^(\d+)-.*\.html$'), {str(a['id']) for a in A}),
        ('homélies', deja_la('homelies', r'^(?:\d{4}-\d{2}-\d{2}|sans-date)-([A-Za-z0-9_-]{11})\.html$'), {h['video_id'] for h in H}),
    ):
        partis = sorted(avant - apres)
        if avant and not apres:
            pb.append(f'{quoi} : Supabase n’en donne AUCUN, alors que {len(avant)} page(s) existent')
        elif len(avant) >= 4 and len(apres) < len(avant) / 2:
            pb.append(f'{quoi} : Supabase en donne {len(apres)}, moins de la moitié des {len(avant)} page(s) existantes')
        elif len(partis) > MAX_SUPPR:
            pb.append(f'{quoi} : {len(partis)} page(s) disparaîtraient d’un coup (plus de {MAX_SUPPR}) : {", ".join(partis)}')
    if pb:
        print('ARRÊT PAR PRUDENCE (v599) : aucun fichier n’a été écrit ni effacé.', file=sys.stderr)
        for x in pb:
            print(' – ' + x, file=sys.stderr)
        print('Si c’est voulu : Actions › Pages des articles › Run workflow, cocher « J’autorise les suppressions ».', file=sys.stderr)
        sys.exit(1)


def main():
    A = lire('articles', 'id,titre,auteur,resume,texte,couverture,affiche,rubrique,publie_le,modifie_le,payant,fichier,public,destinataires',
             '&public=eq.true&order=publie_le.desc&limit=1000')
    def paru(a):   # date déjà passée (un article programmé attend son jour)
        try: return datetime.datetime.fromisoformat(str(a.get('publie_le')).replace('Z', '+00:00')) <= datetime.datetime.now(datetime.timezone.utc)
        except Exception: return False
    if not isinstance(A, list): raise ValueError('réponse inattendue de Supabase pour les articles')   # v599
    A = [a for a in A if a.get('public') and not a.get('destinataires') and paru(a)]
    H = lire('homelies', 'video_id,titre,dimanche,publie_le,visible', '&visible=eq.true&order=dimanche.desc.nullslast&limit=500')
    if not isinstance(H, list): raise ValueError('réponse inattendue de Supabase pour les homélies')   # v599
    H = [h for h in H if h.get('visible', True) and re.match(r'^[A-Za-z0-9_-]{11}$', str(h.get('video_id', '')))]
    # Une seule homélie par dimanche, comme sur le site : si deux vidéos annoncent le même dimanche, la plus tardive
    # reçoit le dimanche de sa mise en ligne (titre mal daté par la chaîne) ; s'il est déjà pris, elle n'a pas de page.
    def dim_pub(p):
        try:
            d = (datetime.datetime.fromisoformat(str(p).replace('Z', '+00:00')) + datetime.timedelta(hours=3)).date()
        except Exception:
            return None
        j = (d.weekday() + 1) % 7          # 0 = dimanche, comme en JavaScript
        dec = 0 if j == 0 else (7 - j if j >= 5 else -j)
        return (d + datetime.timedelta(days=dec)).isoformat()
    vus = {}
    for h in sorted(H, key=lambda x: str(x.get('publie_le') or '')):
        d = h.get('dimanche')
        if d and d in vus:
            d2 = dim_pub(h.get('publie_le'))
            h['dimanche'] = d2 if (d2 and d2 not in vus) else None
        if h.get('dimanche'): vus[h['dimanche']] = h
    H = [h for h in H if h.get('dimanche')]
    H.sort(key=lambda x: x['dimanche'], reverse=True)
    for h in H:   # un seul format de titre pour toutes les homélies
        h['titre_source'] = h.get('titre') or ''
        h['titre'] = f"Homélie du dimanche {date_fr(h['dimanche'])}"

    garde_fou(A, H)   # v599 : avant toute écriture
    gardes = set(); plan = []
    for a in A:
        nom = nom_article(a); gardes.add(nom)
        titre = a.get('titre') or 'Article'
        desc = (a.get('resume') or '').strip() or (re.sub(r'[#*>()–-]', ' ', a.get('texte') or '')[:240].strip()) or 'Article du Grand Séminaire de Théologie de Faliarivo.'
        image = a.get('affiche') or a.get('couverture') or ''
        if image and not image.startswith('https://'): image = ''
        lien_site = f"/?src=page-article#article={a['id']}"
        corps = f'''<p class="meta">{E(a.get('rubrique') or 'Articles')} · {date_fr(a.get('publie_le'))}{(' · ' + E(a['auteur'])) if a.get('auteur') else ''}</p>
<h1>{E(titre)}</h1>
{f'<img class="couv" src="{E(image)}" alt="">' if image else ''}
{f'<p class="resume">{E(a["resume"])}</p>' if a.get('resume') else ''}
{texte_html(a.get('texte')) if (a.get('texte') and not a.get('payant')) else ''}
{'<p><b>Cet article se lit sur le site du Séminaire.</b></p>' if a.get('payant') else ''}
{'<p>Le texte complet est en PDF sur le site du Séminaire.</p>' if (a.get('fichier') and not a.get('texte') and not a.get('payant')) else ''}
<p style="margin-top:26px"><a class="btn" href="{lien_site}">Lire sur le site du Séminaire →</a> <a class="btn2" href="/articles/">Tous les articles</a></p>'''
        ld = {"@context": "https://schema.org", "@type": "Article", "headline": titre[:110], "datePublished": a.get('publie_le'),
              "dateModified": a.get('modifie_le') or a.get('publie_le'), "author": {"@type": "Person", "name": a.get('auteur') or 'Grand Séminaire de Faliarivo'},
              "publisher": {"@type": "Organization", "name": "Grand Séminaire de Théologie de Faliarivo", "logo": {"@type": "ImageObject", "url": f"{SITE}/icon-512.png"}},
              "mainEntityOfPage": f"{SITE}/articles/{nom}", **({"image": image} if image else {})}
        ecrire(f'articles/{nom}', page(f'articles/{nom}', titre, desc, image, corps, 'article', ld))
        plan.append((f'articles/{nom}', str(a.get('modifie_le') or a.get('publie_le') or '')[:10], '0.7'))

    # les pages d’articles retirés (dépubliés, supprimés, titre changé) disparaissent
    dossier = os.path.join(RACINE, 'articles')
    if os.path.isdir(dossier):
        for f in os.listdir(dossier):
            if re.match(r'^\d+-.*\.html$', f) and f not in gardes:
                os.remove(os.path.join(dossier, f)); print('Page retirée : articles/' + f)   # v599 : journal

    liste = ''.join(f'<li><a href="/articles/{nom_article(a)}">{E(a.get("titre") or "")}</a><br><small>{E(a.get("rubrique") or "Articles")} · {date_fr(a.get("publie_le"))}{(" · " + E(a["auteur"])) if a.get("auteur") else ""}</small></li>' for a in A)
    ecrire('articles/index.html', page('articles/', 'Articles, homélies et méditations', 'Les articles, homélies et méditations du Grand Séminaire de Théologie de Faliarivo, Antananarivo.', '',
                                       f'<h1>Articles, homélies et méditations</h1><ul class="liste">{liste}</ul>' + (f'<h2>Homélies du dimanche (vidéo)</h2><ul class="liste">' + ''.join(
                                           f'<li><a href="/homelies/{h.get("dimanche") or "sans-date"}-{h["video_id"]}.html">{E(h.get("titre") or "Homélie")}</a><br><small>{date_fr(h.get("dimanche"))}</small></li>' for h in H) + '</ul>' if H else ''), 'website'))
    plan.append(('articles/', datetime.date.today().isoformat(), '0.8'))

    gardesH = set()
    for h in H:
        nom = f'{h.get("dimanche") or "sans-date"}-{h["video_id"]}.html'; gardesH.add(nom)
        titre = h.get('titre') or 'Homélie du dimanche'
        vid = h['video_id']
        corps = f'''<p class="meta">Homélie du dimanche · {date_fr(h.get("dimanche"))}{(' · vidéo « ' + E(h['titre_source']) + ' »') if h.get('titre_source') else ''}</p><h1>{E(titre)}</h1>
<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/{vid}" title="{E(titre)}" loading="lazy" allowfullscreen></iframe></div>
<p><a class="btn" href="https://www.youtube.com/watch?v={vid}" rel="noopener">Voir sur YouTube</a> <a class="btn2" href="/?src=page-homelie#accueil">Le site du Séminaire</a></p>'''
        ecrire(f'homelies/{nom}', page(f'homelies/{nom}', titre, f'Homélie du dimanche {date_fr(h.get("dimanche"))} – Grand Séminaire de Théologie de Faliarivo.', f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg', corps, 'video.other'))
        plan.append((f'homelies/{nom}', str(h.get('dimanche') or h.get('publie_le') or '')[:10], '0.5'))
    dossierH = os.path.join(RACINE, 'homelies')
    if os.path.isdir(dossierH):
        for f in os.listdir(dossierH):
            if f.endswith('.html') and f not in gardesH:
                os.remove(os.path.join(dossierH, f)); print('Page retirée : homelies/' + f)   # v599 : journal

    date_ok = re.compile(r'^\d{4}-\d{2}-\d{2}$')
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        '  <url><loc>' + SITE + '/' + c + '</loc>' + ('<lastmod>' + d + '</lastmod>' if date_ok.match(d) else '') + '<priority>' + p + '</priority></url>\n' for c, d, p in plan) + '</urlset>\n'
    ecrire('sitemap-articles.xml', sm)
    print(f'{len(A)} article(s), {len(H)} homélie(s)')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('Erreur :', e, file=sys.stderr); sys.exit(1)
