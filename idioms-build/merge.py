#!/usr/bin/env python3
"""Build ../22-list-idioms.json, which the site reads.

Sources:
  candidates.json  every candidate with its light entry and corpus count (measure_idioms.py)
  result.json      the idiom workflow: gap-hunt additions (counted in the corpus), final list, written entries,
                   chunks, contrast groups, course order, and a verdict for every cut
  vet.json         the vetting run: the fix step had added idioms nobody selected; three judges voted on them, the
                   ones kept were reviewed four ways, and every topic was re-chunked and the course re-ordered
  edits.json       hand edits after review (optional): set [id, field, value]; drop [id, reason]
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_JSON = os.path.join(HERE, '..', '22-list-idioms.json')
cands = {c['id']: c for c in json.load(open(os.path.join(HERE, 'candidates.json')))}
rs = json.load(open(os.path.join(HERE, 'result.json')))
# Candidates the workflow's gap hunt added carry their own count (count_cli.py) instead of a measured block.
for a in rs.get('additions', []):
    m = {'count': a['count'], 'perMillion': round(a['count'] / 3170155 * 1e6, 2), 'source': a['countSource']} if a.get('count') else None
    cands.setdefault(a['id'], {**a, 'measured': m})
epath = os.path.join(HERE, 'edits.json')
edits = json.load(open(epath)) if os.path.exists(epath) else {}
vl = json.load(open(os.path.join(HERE, '..', '20-list-versatile.json')))
vl_romaji = {it['id']: it['romaji'] for b in vl['blocks'] for it in b['items']}
log = []

vpath = os.path.join(HERE, 'vet.json')
vet = json.load(open(vpath)) if os.path.exists(vpath) else None
selected = {r['id'] for r in rs['final']}

# 1. Written entries, keyed by candidate id; item ids are i-<slug>. With vet.json, only selected idioms come from
#    result.json (the fix step's unasked additions are replaced by the vetted ones).
entries = {}
source = [it for it in rs['entries'] if not vet or it['slug'] in selected] + (vet['vetted'] if vet else [])
for it in source:
    if it['slug'] in entries:
        continue
    it = dict(it)
    it['id'] = f"i-{it['slug']}"
    m = (cands.get(it['slug']) or {}).get('measured')
    it['measured'] = m and {k: m[k] for k in ('count', 'perMillion', 'shareN', 'source') if k in m}
    entries[it['slug']] = it

# 2. Chunks and contrast groups.
blocks = []
for t in (vet or rs)['topics']:
    groups = {g['id']: g['group'] for g in t['contrastGroups']}
    for b in t['blocks']:
        members = [entries[i] for i in b['ids'] if i in entries]
        for m in members:
            if m['slug'] in groups:
                m['contrastGroup'] = groups[m['slug']]
        if members:
            blocks.append({'id': b['id'], 'topic': t['key'], 'topicName': t['name'], 'label': b['label'],
                           'rationale': b['rationale'], 'interference': b['interference'], 'items': members})
items = {m['id']: m for b in blocks for m in b['items']}
for iid, field, value in edits.get('set', []):
    items[iid][field] = value
for iid, reason in edits.get('drop', []):
    for b in blocks:
        b['items'] = [m for m in b['items'] if m['id'] != iid]
    items.pop(iid, None)
    log.append(f'hand drop {iid}: {reason}')
blocks = [b for b in blocks if b['items']]
unplaced = set(e['id'] for e in entries.values()) - set(items)
if unplaced:
    log.append(f'written but not in any chunk: {sorted(unplaced)}')

# 3. Romaji leftovers and links into the versatility list.
fix_ro = lambda s: s.replace('cch', 'tch') if isinstance(s, str) else s
for it in items.values():
    it['romaji'], it['polite'] = fix_ro(it['romaji']), fix_ro(it['polite'])
    for ex in (it['example'], it['examplePolite']):
        if ex:
            ex['romaji'] = fix_ro(ex['romaji'])
    bad = [x for x in it.get('listLinks') or [] if x not in vl_romaji]
    if bad:
        log.append(f"dropped unknown listLinks {it['id']}: {bad}")
    it['listLinks'] = [x for x in it.get('listLinks') or [] if x in vl_romaji]

# 4. No ids in prose.
romaji_of = {k: v['romaji'] for k, v in cands.items()} | vl_romaji | {it['id']: it['romaji'] for it in items.values()}
label_of = {b['id']: b['label'] for b in blocks}
def humanize(s):
    if not isinstance(s, str):
        return s
    s = re.sub(r'\bi(?:-[a-z0-9]+)+\b', lambda m: romaji_of.get(m.group(0), romaji_of.get(m.group(0)[2:], m.group(0))), s)
    s = re.sub(r'\b[A-J](?:-[a-z0-9]+)+\b', lambda m: romaji_of.get(m.group(0), m.group(0)), s)
    s = re.sub(r'\b[a-z]+-\d{1,2}\b', lambda m: f'"{label_of[m.group(0)]}"' if m.group(0) in label_of else m.group(0), s)
    return s
for b in blocks:
    b['rationale'], b['interference'] = humanize(b['rationale']), humanize(b['interference'])
for it in items.values():
    for f in ('use', 'notes'):
        it[f] = humanize(it.get(f))

# 5. Course order.
by_bid = {b['id']: b for b in blocks}
stages, seen = [], set()
for st in (vet or rs)['stages']:
    ids_ = [i for i in st['chunkIds'] if i in by_bid and i not in seen]
    seen.update(ids_)
    stages.append({'name': st['name'], 'summary': st['summary'], 'chunkIds': ids_})
missing = [b['id'] for b in blocks if b['id'] not in seen]
if missing:
    log.append(f'chunks missing from the course order, appended to the last stage: {missing}')
    stages[-1]['chunkIds'] += missing
n, course = 1, []
for si, st in enumerate(stages):
    for cid in st['chunkIds']:
        b = by_bid[cid]
        start = n
        for it in b['items']:
            it['n'] = n
            n += 1
        course.append(b | {'stage': si + 1, 'range': f'{start}-{n - 1}'})
total = n - 1

# 6. Cuts.
verdicts = {v['id']: v for v in rs['cutVerdicts']}
kept = {it['slug'] for it in items.values()}
dropped = {d['slug']: d['reason'] for d in rs.get('droppedInFix', []) + (vet or {}).get('droppedInVet', [])}
cut_rows = []
for cid, c in cands.items():
    if cid in kept:
        continue
    v = verdicts.get(cid, {})
    cut_rows.append({'id': cid, 'cat': c['category'], 'romaji': c['romaji'], 'english': c['english'], 'literal': c.get('literal'),
                     'count': (c.get('measured') or {}).get('count'), 'votes': rs['votes'].get(cid, 0),
                     'verdict': v.get('verdict'), 'reason': humanize(v.get('reason') or dropped.get(cid)), 'coveredBy': humanize(v.get('coveredBy'))})
cut_rows.sort(key=lambda r: -(r['count'] or 0))

ITEM_KEYS = ['n', 'id', 'romaji', 'polite', 'english', 'literal', 'englishIdiom', 'use', 'ja', 'kana', 'politeJa',
             'noun', 'nounJa', 'particle', 'verb', 'verbJa', 'flags', 'contrastGroup', 'example', 'examplePolite',
             'measured', 'commonness', 'speakNeed', 'listLinks', 'alsoIn', 'notes']
topics = []
for t in (vet or rs)['topics']:
    ids_ = sorted((b['id'] for b in course if b['topic'] == t['key']), key=lambda x: int(x.rsplit('-', 1)[1]))
    if ids_:
        topics.append({'key': t['key'], 'name': t['name'], 'chunkIds': ids_})
stage_counts = [sum(len(by_bid[c]['items']) for c in st['chunkIds']) for st in stages]
out = {
    'orderingVariable': "COURSE ORDER — 4 stages that run alongside the versatility list's stages (a chunk in Stage N is learned during versatility Stage N). The most common idioms first; each stage mixes several topics; within a topic, chunks run from the most common idioms to less common ones.",
    'whyThatVariable': 'Selected on how commonly each idiom is said in everyday conversation: counted in 3.17M lines of Japanese film and TV subtitles (OpenSubtitles 2018) and corrected by native judgement where foreign-film subtitles over-count dramatic lines and under-count casual Japanese talk.',
    'conventions': {
        'romaji': "kotoba's stored spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled (sou, koohii), wa/o/e particles, っ before ch = t.",
        'register': 'romaji = the plain form as people say it; polite = its desu/masu form, or null when there is no register difference.',
        'meaning': 'english = what the idiom means; literal = word for word; englishIdiom = a close English idiom when a natural one exists, else null (the list is chosen on Japanese commonness, not English equivalents).',
        'parts': 'noun / particle / verb for noun + verb idioms (te / o / kasu), else null.',
        'measured': 'count = occurrences in the subtitle corpus; source = pairs (the noun + verb pair on dictionary forms, any inflection, particle or none) or phrase (the written forms of the idiom). null = too rare in films to count.',
        'scores': 'commonness / speakNeed, 1-5, judged.',
        'listLinks': 'ids of items in 20-list-versatile.json that the idiom builds on.',
        'contrastGroup': 'idioms sharing a group name are learned side by side.',
    },
    'stats': {
        'total': total, 'chunks': len(course), 'measured': sum(1 for it in items.values() if it['measured']), 'corpusLines': 3170155,
        'byCategory': {t['name']: sum(len(by_bid[c]['items']) for c in t['chunkIds']) for t in topics},
        'byStage': {st['name']: cnt for st, cnt in zip(stages, stage_counts)},
        'candidatePool': len(cands),
    },
    'stages': [{'name': st['name'], 'summary': st['summary'], 'items': cnt, 'chunkIds': st['chunkIds']} for st, cnt in zip(stages, stage_counts)],
    'categories': [{'key': t['key'], 'name': t['name'], 'scope': '', 'chunkIds': t['chunkIds']} for t in topics],
    'blocks': [{'id': b['id'], 'range': b['range'], 'stage': b['stage'], 'category': b['topicName'], 'label': b['label'],
                'rationale': b['rationale'], 'interference': b['interference'],
                'items': [{k: it.get(k) for k in ITEM_KEYS} for it in b['items']]} for b in course],
    'notes': [
        'Kanyouku plus the sayings (kotowaza) and four-character phrases (yojijukugo) people really say; chosen on how common they are in Japanese, whether or not English has an equivalent.',
        'Out of scope by design: literal noun + verb sets (they are in 21-list-collocations.json); single words, even slangy ones (rakushou, yabai) — mentioned in notes where they are the plain alternative; bookish sayings people rarely say aloud.',
        'Built by two workflows: a harvest by source (ki and the inner body, head and face, mouth and ears, hands, legs and body, animals and objects, modern set phrases) with gap hunts, a count of every candidate in the subtitle corpus, then a second, wider gap hunt (sayings, four-character phrases, idioms without body parts, everyday situations, the corpus), a three-judge selection on commonness, writing, four reviews per topic (native naturalness, meaning and literal sense, register and real-life use, romaji and data), chunking and course order.',
        'The corpus is mostly subtitles for foreign films, so dramatic lines are over-counted and casual Japanese talk is under-counted; judged commonness corrects for both.',
    ],
    'cuts': cut_rows,
}
json.dump(out, open(OUT_JSON, 'w'), ensure_ascii=False, indent=1)
print('\n'.join(log))
print(f"total {total} idioms ({out['stats']['measured']} with counts), {len(course)} chunks; stages {stage_counts}; cuts {len(cut_rows)}")
print('wrote', os.path.relpath(OUT_JSON, HERE), os.path.getsize(OUT_JSON), 'bytes')
