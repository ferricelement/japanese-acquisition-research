#!/usr/bin/env python3
"""Conversation pass, step 1: the scoring run's results (cv-result.json, from journal.py) become
  cv.json        {item id: {cv, move}} for every entry of the four lists
  hunted.json    the new conversation phrases, minus anything a list already teaches, with corpus counts
  write/phrases-<n>.json + write-args.json entries for the writers (about 90 phrases each)
"""
import gzip, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
# cv-result.json: the scoring run (cv judges + two hunters); focus-result.json: the focus run (entries that serve small
# talk, getting to know someone and opinions, which come first; plus a hunter for those moves)
res = {**json.load(open(os.path.join(HERE, 'cv-result.json'))), **json.load(open(os.path.join(HERE, 'focus-result.json')))}
TOP = {'c-intro', 'c-likes', 'c-opine', 'c-catchup'}

cv = {}
for label, r in res.items():
    if label.startswith('cv:'):
        for it in r['items']:
            cv[it['id']] = {'cv': it['cv'], **({'move': it['move']} if it.get('move') else {})}
for label, r in res.items():
    if label.startswith('focus:'):
        for it in r['focus']:
            if it['id'] in cv:
                cv[it['id']]['focus'] = True
                if it.get('move') and it['id'].startswith('p-'):
                    cv[it['id']]['move'] = it['move']
# Hand additions: asking someone's age, family size or how long they've been here needs the numbers 0-10 and people counts.
for iid in ('s-zero', 's-ichi', 's-ni', 's-san', 's-yon', 's-go', 's-roku', 's-nana', 's-hachi', 's-kyuu', 's-juu',
            's-hitori', 's-futari', 's-sannin', 's-yonin', 's-nannin'):
    if iid in cv:
        cv[iid]['focus'] = True
json.dump(cv, open(os.path.join(HERE, 'cv.json'), 'w'), ensure_ascii=False, indent=0)

# Everything already taught, by written form and by romaji with spaces and punctuation ignored.
key = lambda r: re.sub(r'[^a-z]', '', (r or '').lower())
taught_ja, taught_ro = set(), set()
for f in ('20-list-versatile.json', '21-list-collocations.json', '22-list-idioms.json', '23-list-core.json',
          '24-list-sets.json', '25-list-phrases.json', '26-list-conjugations.json'):
    for b in json.load(open(os.path.join(ROOT, f)))['blocks']:
        for it in b['items']:
            taught_ja.update(x for x in (it['ja'], it.get('kana'), it.get('politeJa')) if x)
            taught_ro.add(key(it['romaji']))

# Once the hunted phrases are written they're in the lists, so a second pass would dedupe them all away:
# keep hunted.json and the writer batches unless --rehunt is given.
if os.path.exists(os.path.join(HERE, 'hunted.json')) and '--rehunt' not in sys.argv:
    print('cv.json rewritten; kept hunted.json and the writer batches (pass --rehunt to redo them)')
    sys.exit(0)

hunted, dup = [], []
for label, r in res.items():
    if not label.startswith('hunt:'):
        continue
    for x in r['items']:
        if x['ja'] in taught_ja or x.get('kana') in taught_ja or key(x['romaji']) in taught_ro or x['cv'] < 4:
            dup.append(x['romaji'])
            continue
        taught_ja.add(x['ja'])
        taught_ro.add(key(x['romaji']))
        hunted.append({**x, 'key': x['move'], 'score': x['cv'], 'focus': x['move'] in TOP, 'source': 'conversation-hunt'})

corpus = os.path.join(ROOT, 'collocations-build', 'corpus', 'ja.txt.gz')
with gzip.open(corpus, 'rt', encoding='utf-8') as fh:
    text = fh.read()
for x in hunted:
    forms = sorted({s for s in (x.get('surface') or []) + [x['ja']] if s and len(s) >= 3}, key=len, reverse=True)
    x['count'] = len(re.findall('|'.join(map(re.escape, forms)), text)) if forms else None
json.dump(hunted, open(os.path.join(HERE, 'hunted.json'), 'w'), ensure_ascii=False, indent=0)

# Writer batches, appended after the round's original batches so their written/ files stay matched.
tax = json.load(open(os.path.join(HERE, 'taxonomy.json')))
args = json.load(open(os.path.join(HERE, 'write-args.json')))
args['batches'] = [b for b in args['batches'] if not (b['kind'] == 'phrases' and b['n'] > 5)]
moves = list(tax['move'])
hunted.sort(key=lambda x: (moves.index(x['move']) if x['move'] in moves else 99, -(x['count'] or 0)))
parts = -(-len(hunted) // 90) if hunted else 0  # at most 4 batches: labels phrases:6-9 sort after the old ones
size = -(-len(hunted) // parts) if parts else 0
for i in range(parts):
    sl = hunted[i * size:(i + 1) * size]
    n = 6 + i
    keys = list(dict.fromkeys(x['move'] for x in sl))
    payload = {'situations': {k: tax['move'][k] for k in keys},
               'items': [{'src': x['ja'], 'ja': x['ja'], 'kana': x['kana'], 'romaji': x['romaji'], 'en': x['en'], 'polite': x.get('polite'),
                          'key': x['move'], 'score': x['cv'], 'count': x['count'], 'rank': None} for x in sl]}
    json.dump(payload, open(os.path.join(HERE, 'write', f'phrases-{n}.json'), 'w'), ensure_ascii=False, indent=1)
    args['batches'].append({'file': f'phrases-{n}.json', 'kind': 'phrases', 'n': n})
json.dump(args, open(os.path.join(HERE, 'write-args.json'), 'w'), indent=1)

from collections import Counter
print(f'cv for {len(cv)} items:', dict(sorted(Counter(v['cv'] for v in cv.values()).items())), '| focus:', Counter(k.split('-')[0] for k, v in cv.items() if v.get('focus')))
print('phrase moves:', Counter(v.get('move') for k, v in cv.items() if k.startswith('p-')).most_common())
print(f'hunted: {len(hunted)} new, {len(dup)} already taught or below cv 4;', Counter(x['move'] for x in hunted).most_common())
print('writer batches:', [b['file'] for b in args['batches'] if b['kind'] == 'phrases' and b['n'] > 5])
