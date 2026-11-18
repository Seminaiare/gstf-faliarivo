#!/usr/bin/env python3
"""Surveillance du site du Grand Séminaire de Faliarivo, lancée par GitHub toutes les 15 minutes
(.github/workflows/surveillance.yml). Si une sonde échoue, le travail échoue et GitHub envoie un email
au propriétaire du dépôt. Lit seulement du public. Aucun secret.
Sondes : 1. l’accueil répond en moins de 10 s ; 2. version.json contient un numéro ; 3. la base répond
(une lecture publique légère) ; 4. le certificat HTTPS expire dans plus de 14 jours ; 5. la page légère
« aujourdhui.html » porte la date du jour (après 3 h du matin à Madagascar ; si elle existe déjà)."""
import json, re, socket, ssl, sys, time, urllib.request, datetime
SITE = 'gstf-faliarivo.ovh'
SB = 'https://lznusbdqkzcxhskgdyip.supabase.co'
CLE = 'sb_publishable_o9nFSTGscnNs3K14ADejxA_X6hPgTDW'   # clé PUBLIQUE (la même que dans le site)
def get(url, h=None, t=10):
    req = urllib.request.Request(url, headers={'User-Agent': 'GSTF-surveillance', **(h or {})})
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=t) as r: return r.status, r.read(), time.time() - t0
ok, msg = True, []
def sonde(nom, f):
    global ok
    try: f(); msg.append('✅ ' + nom)
    except Exception as e: ok = False; msg.append(f'❌ {nom} : {e}')
def s1():
    st, b, dt = get(f'https://{SITE}/', t=10)
    if st != 200 or dt > 10: raise Exception(f'statut {st}, {dt:.1f} s')
def s2():
    st, b, _ = get(f'https://{SITE}/version.json?t={int(time.time())}')
    v = json.loads(b).get('v')
    if not isinstance(v, int): raise Exception('pas de numéro de version')
def s3():
    st, b, _ = get(f'{SB}/rest/v1/reglages?select=cle&cle=eq.pied_page&limit=1', {'apikey': CLE, 'Authorization': 'Bearer ' + CLE})
    if st != 200 or not isinstance(json.loads(b), list): raise Exception(f'statut {st}')
def s4():
    ctx = ssl.create_default_context()
    with socket.create_connection((SITE, 443), timeout=10) as s, ctx.wrap_socket(s, server_hostname=SITE) as t:
        fin = datetime.datetime.strptime(t.getpeercert()['notAfter'], '%b %d %H:%M:%S %Y %Z')
    jours = (fin - datetime.datetime.utcnow()).days
    if jours < 14: raise Exception(f'le certificat expire dans {jours} jours')
def s5():
    try: st, b, _ = get(f'https://{SITE}/aujourdhui.html?t={int(time.time())}')
    except urllib.error.HTTPError as e:
        if e.code == 404: return   # pas encore créée
        raise
    mg = datetime.datetime.utcnow() + datetime.timedelta(hours=3)
    mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
    jour = f"{'1er' if mg.day == 1 else mg.day} {mois[mg.month - 1]} {mg.year}"
    if jour not in b.decode('utf-8', 'replace'):
        if mg.hour >= 3: raise Exception('la page légère n’a pas été refaite aujourd’hui')
sonde('Accueil du site', s1); sonde('Version du site', s2); sonde('Base de données', s3); sonde('Certificat HTTPS', s4); sonde('Page légère du jour', s5)
print('\n'.join(msg)); sys.exit(0 if ok else 1)
