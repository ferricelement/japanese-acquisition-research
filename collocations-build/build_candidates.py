#!/usr/bin/env python3
"""Join the first workflow's candidate pool with the collocations mined from the subtitle corpus into one table
for re-selection: candidates.json (full light entries) and candidates.tsv (one line each, most frequent first).
Also writes idiom-candidates.json, the figurative sets saved for the idiom list."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
from measure import load, lookup

idx = load()
pool = json.load(open(os.path.join(HERE, 'pool-measured.json')))
mined = json.load(open(os.path.join(HERE, 'mined.json')))
classified = json.load(open(os.path.join(HERE, 'classified.json')))['rows']
current = json.load(open(os.path.join(HERE, '..', '21-list-collocations.json')))
in_list = {it['romaji']: it['id'] for b in current['blocks'] for it in b['items']}

norm = lambda s: re.sub(r'[\s・。、？?！!〜~-]', '', s or '').lower()
cands, seen, ids = [], {}, set()

def add(c, source, measured):
    key = norm(c['romaji'])
    if key in seen:
        return seen[key]
    slug = re.sub(r'[^a-z0-9]+', '-', c['romaji'].lower()).strip('-')
    sid, k = slug, 2
    while sid in ids:
        sid, k = f'{slug}-{k}', k + 1
    ids.add(sid)
    row = {
        'id': sid, 'source': source, 'domain': c.get('domain') or c.get('cat'),
        'inCurrentList': c['romaji'] in in_list, 'currentId': in_list.get(c['romaji']),
        'measured': measured,
        **{f: c.get(f) for f in ('romaji', 'polite', 'ja', 'kana', 'english', 'noun', 'nounJa', 'particle', 'verb', 'verbJa',
                                  'englishVerb', 'trap', 'commonness', 'trapRisk', 'speakNeed', 'flags', 'why', 'nounRank', 'verbRank', 'freqNote')},
    }
    cands.append(row)
    seen[key] = sid
    return sid

# The current list first, so its spellings and slugs win; then the rest of the first pool; then the corpus finds.
for c in sorted(pool, key=lambda c: not c['inCurrentList']):
    add(c, 'pool', c['measured'])
idioms, mined_added = [], 0
for r in classified:
    m = mined[r['i']]
    if r['verdict'] == 'idiom' and r.get('idiom'):
        idioms.append({**r['idiom'], 'count': m['count'], 'shareN': m['shareN'], 'pair': f"{m['noun']}+{m['verb']}"})
    if r['verdict'] != 'collocation' or not r.get('entry'):
        continue
    e = r['entry']
    measured = lookup(idx, e['noun'], e['verb'], e['nounJa'], e['verbJa'])
    before = len(cands)
    add(e, 'corpus', measured)
    mined_added += len(cands) > before

# Items restored by hand (kaze ga fuku) are in the current list but not marked in the pool file.
for c in cands:
    if c['romaji'] in in_list:
        c['inCurrentList'], c['currentId'] = True, in_list[c['romaji']]

cands.sort(key=lambda c: -((c['measured'] or {}).get('count') or 0))
json.dump(cands, open(os.path.join(HERE, 'candidates.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(sorted(idioms, key=lambda x: -x['count']), open(os.path.join(HERE, 'idiom-candidates.json'), 'w'), ensure_ascii=False, indent=1)

with open(os.path.join(HERE, 'candidates.tsv'), 'w') as fh:
    fh.write('id\tdomain\tromaji\tenglish\tcount\tper_million\ttypical\tlog_dice\tparticles\tjudged_commonness\tin_current_list\tsource\ttrap\n')
    for c in cands:
        m = c['measured'] or {}
        fh.write('\t'.join(str(x) for x in (
            c['id'], c['domain'], c['romaji'], c['english'], m.get('count', 0), m.get('perMillion', 0),
            f"{m['shareN']:.2f}" if m else '', m.get('logDice', ''), m.get('particles', ''),
            c['commonness'], 'yes' if c['inCurrentList'] else '', c['source'], c['trap'] or '')) + '\n')

print(f'{len(cands)} candidates ({len(pool)} from the first pool, {mined_added} new from the corpus); '
      f'{sum(1 for c in cands if c["measured"])} with counts; {len(idioms)} idiom candidates saved')
