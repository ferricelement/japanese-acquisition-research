#!/usr/bin/env python3
"""Turn the selection run (select-result.json, from journal.py) into the candidates each list's writers get.

Judged pool words keep their drama rank; words from the everyday hunt and the phrase harvest are looked up
in the same rank list and, for phrases, counted in the subtitle corpus. Writes selected.json and select-cuts.json.
"""
import csv, gzip, json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
CORE_MIN, CORE_MIN_RANKED = 4, 3        # score to keep; score that's enough when the word is also frequent
RANKED = 3000                           # "frequent" = within this drama rank
PHRASE_MIN = 3
# Hand restores after reading the cuts: everyday words a judge under-scored (nakusu was glossed as losing a loved one).
RESTORE = {'無くす': ('core', 'v-hands', 'lose (keys, a wallet)'), 'なくす': ('core', 'v-hands', 'lose (keys, a wallet)'),
           '船': ('core', 'n-travel', 'boat, ship'), '命': ('core', 'n-life', 'life (being alive)'),
           '光': ('core', 'n-nature', 'light'), '訪ねる': ('core', 'v-move', 'visit (a person or place)')}

res = json.load(open(os.path.join(HERE, 'select-result.json')))
pool = {p['ja']: p for p in json.load(open(os.path.join(HERE, 'pool.json')))['pool']}

ranks = {}
with open(os.path.join(ROOT, 'versatility-build', 'jiten_freq_Drama.csv'), encoding='utf-8') as fh:
    for r in csv.DictReader(fh):
        for k in (r['Word'], r['Form']):
            if k not in ranks or int(r['Rank']) < ranks[k]:
                ranks[k] = int(r['Rank'])

# What the existing lists teach, by written form and romaji.
taught_ja, taught_ro = {}, {}
for f in ('20-list-versatile.json', '21-list-collocations.json', '22-list-idioms.json'):
    for b in json.load(open(os.path.join(ROOT, f)))['blocks']:
        for it in b['items']:
            for k in ('ja', 'kana', 'politeJa'):
                if it.get(k):
                    taught_ja.setdefault(it[k], it['id'])
            taught_ro.setdefault(it['romaji'], it['id'])

recs, log = [], []
for label, r in res.items():
    src = label.split(':', 1)[1]
    for it in r['items']:
        it = dict(it, source=src)
        p = pool.get(it['ja'])
        if p:
            it.setdefault('kana', p['kana'])
            it['rank'], it['tpos'] = p['rank'], p['pos']
        else:
            it['rank'] = ranks.get(it['ja']) or ranks.get(it.get('kana', ''))
        recs.append(it)

judged = [x for x in recs if x['source'] not in ('everyday', 'phrases')]
missing = set(pool) - {x['ja'] for x in judged}
log.append(f'pool words with no verdict: {len(missing)}')

# Hunted and harvested items: drop what the pool, the existing lists or an earlier item already has.
seen = {x['ja'] for x in judged}
fresh = []
for x in recs:
    if x['source'] not in ('everyday', 'phrases'):
        continue
    dup = x['ja'] in seen or x['ja'] in taught_ja or x.get('kana') in taught_ja or x.get('romaji') in taught_ro
    if dup:
        log.append(f"dup {x['source']}: {x['ja']}")
        continue
    seen.add(x['ja'])
    fresh.append(x)

allrec = judged + fresh
for x in allrec:
    if x['ja'] in RESTORE:
        x['route'], x['key'], x['en'] = RESTORE[x['ja']]
        x['score'], x['restored'] = max(x['score'], 4), True
by_route = defaultdict(list)
cuts = []
for x in allrec:
    route, score = x['route'], x['score']
    if route == 'cut':
        cuts.append({**x, 'verdict': x.get('why') or 'cut'})
    elif route == 'core':
        # the everyday hunt exists because drama ranks miss daily life, so its words don't need a rank
        ok = score >= CORE_MIN or (score >= CORE_MIN_RANKED and ((x['rank'] and x['rank'] <= RANKED) or x['source'] == 'everyday'))
        (by_route['core'] if ok else cuts).append(x if ok else {**x, 'verdict': 'less-common'})
    elif route == 'phrase':
        (by_route['phrase'] if score >= PHRASE_MIN else cuts).append(x if score >= PHRASE_MIN else {**x, 'verdict': 'less-common'})
    else:
        (by_route[route] if score >= 3 else cuts).append(x if score >= 3 else {**x, 'verdict': 'less-common'})

# Count phrases in the subtitle corpus: their own surface strings plus the written form.
corpus = os.path.join(ROOT, 'collocations-build', 'corpus', 'ja.txt.gz')
if os.path.exists(corpus):
    with gzip.open(corpus, 'rt', encoding='utf-8') as fh:
        text = fh.read()
    for x in by_route['phrase']:
        forms = sorted({s for s in (x.get('surface') or []) + [x['ja']] if s and len(s) >= 3}, key=len, reverse=True)
        x['count'] = len(re.findall('|'.join(map(re.escape, forms)), text)) if forms else None
        x['countForms'] = forms

out = {k: sorted(v, key=lambda x: (x['rank'] or 99999)) for k, v in by_route.items()}
json.dump(out, open(os.path.join(HERE, 'selected.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(cuts, open(os.path.join(HERE, 'select-cuts.json'), 'w'), ensure_ascii=False, indent=0)
print({k: len(v) for k, v in out.items()}, 'cuts', len(cuts))
print('core by key', Counter(x['key'] for x in out['core']).most_common())
print('core score', Counter(x['score'] for x in out['core']), 'cut verdicts', Counter(c['verdict'] for c in cuts).most_common(12))
print('\n'.join(log[:5]), f'\n... {len(log)} log lines')
