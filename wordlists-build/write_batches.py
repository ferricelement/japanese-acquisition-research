#!/usr/bin/env python3
"""Split selected.json into the writers' batch files (write/*.json) and write write-args.json for write-workflow.js.

Core words go out by meaning domain, about 70 per writer (big domains split by rank, small ones merged with the
next domain); sets by group of sets; phrases by situation; conjugations by the inventory's chunks, with tables.
"""
import json, os
from collections import defaultdict
from conjugate import table

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'write')
TARGET, MAX = 66, 80
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))

sel = json.load(open(os.path.join(HERE, 'selected.json')))
tax = json.load(open(os.path.join(HERE, 'taxonomy.json')))
batches = []


def put(kind, payload):
    n = sum(1 for b in batches if b['kind'] == kind) + 1
    name = f'{kind}-{n}.json'
    json.dump(payload, open(os.path.join(OUT, name), 'w'), ensure_ascii=False, indent=1)
    size = len(payload.get('items') or payload.get('sets') or [])
    batches.append({'file': name, 'kind': kind, 'n': n, 'size': size})


def slim(x, *extra):
    d = {'src': x['ja'], 'ja': x['ja'], 'kana': x.get('kana'), 'romaji': x.get('romaji'), 'en': x.get('en'),
         'rank': x.get('rank'), 'score': x['score']}
    for k in extra:
        d[k] = x.get(k)
    return d


# Core: every word in domain order (then by rank), cut into equal slices; a domain split across two writers
# just means two sets of chunks for it.
order = list(tax['core'])
core = sorted(sel.get('core', []), key=lambda x: (order.index(x['key']) if x['key'] in order else 99, x['rank'] or 99999))
parts = -(-len(core) // 68)
size = -(-len(core) // parts)
for i in range(0, len(core), size):
    sl = core[i:i + size]
    keys = list(dict.fromkeys(x['key'] for x in sl))
    put('core', {'domains': {k: tax['core'].get(k, k) for k in keys}, 'items': [slim(x, 'key', 'tpos') for x in sl]})

# Sets: five groups of sets, each with the items the judges routed there.
set_groups = [
    ['s-numbers', 's-native', 's-people'],
    ['s-counters', 's-clock', 's-years'],
    ['s-weekdays', 's-dates', 's-months', 's-relative', 's-dayparts'],
    ['s-seasons', 's-colors', 's-taste', 's-countries', 's-position'],
    ['s-family', 's-body', 's-pronouns'],
]
routed = defaultdict(list)
for x in sel.get('set', []):
    routed[x['key']].append(slim(x))
for g in set_groups:
    put('sets', {'sets': [{'key': k, 'scope': tax['set'][k], 'include': routed.get(k, [])} for k in g]})
stray = {k for k in routed} - {k for g in set_groups for k in g}
if stray:
    print('set keys with no group:', stray)

# Phrases: in situation order, cut into slices of about 86.
pkeys = list(tax['phrase'])
phr = sorted(sel.get('phrase', []), key=lambda x: (pkeys.index(x['key']) if x['key'] in pkeys else 99, -(x.get('count') or 0)))
parts = -(-len(phr) // 86)
size = -(-len(phr) // parts)
for i in range(0, len(phr), size):
    sl = phr[i:i + size]
    keys = list(dict.fromkeys(x['key'] for x in sl))
    put('phrases', {'situations': {k: tax['phrase'].get(k, k) for k in keys}, 'items': [slim(x, 'polite', 'key', 'count') for x in sl]})

# Conjugations: the inventory in two halves by chunk, each item with its rule-built table and measured count.
inv = json.load(open(os.path.join(HERE, 'conj-inventory.json')))
meas = json.load(open(os.path.join(HERE, 'conj-measured.json')))['forms']
chunks = list(dict.fromkeys(e['chunk'] for e in inv))
half = set(chunks[:len(chunks) // 2])
for part in (half, set(chunks) - half):
    items = [{**e, 'table': [{k: r[k] for k in ('word', 'romaji', 'ja')} for r in table(e['table'])],
              'measured': meas.get(e.get('measured') or '')} for e in inv if e['chunk'] in part]
    put('conj', {'items': items})

# Patterns, with what the main list already teaches as endings and patterns.
vl = json.load(open(os.path.join(HERE, '..', '20-list-versatile.json')))
main = [f"{it['romaji']} ({it['ja']})" for b in vl['blocks'] if b['category'] in ('Sentence endings & intent', 'Grammar patterns as vocabulary', 'Connectors & conditionals') for it in b['items']]
if sel.get('pattern'):
    put('patterns', {'mainList': main, 'conjugationList': [e['label'] for e in inv], 'items': [slim(x) for x in sel['pattern']]})

json.dump({'dir': OUT, 'batches': [{k: b[k] for k in ('file', 'kind', 'n')} for b in batches]},
          open(os.path.join(HERE, 'write-args.json'), 'w'), indent=1)
for b in batches:
    print(b['file'], b['size'])
print(len(batches), 'batches')
