#!/usr/bin/env python3
"""Build ../21-list-collocations.json, which the site reads.

Sources, in order:
  result.json      first workflow: the written entries of the first list
  edits.json       base: hand edits to those entries (kaze ga fuku restored); final: hand edits after re-selection
  reselect.json    second workflow: the final selection (by commonness and typicality), new entries, chunks,
                   contrast groups, course order and a verdict for every cut
  candidates.json  every candidate with its light entry (for the cuts list)
  corpus/pairs.tsv measured counts (python3 count.py with the venv; see README)
"""
import json, re, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_JSON = os.path.join(HERE, '..', '21-list-collocations.json')
sys.path.insert(0, HERE)
from measure import load, lookup

first = json.load(open(os.path.join(HERE, 'result.json')))
edits = json.load(open(os.path.join(HERE, 'edits.json')))
rs = json.load(open(os.path.join(HERE, 'reselect.json')))
cands = {c['id']: c for c in json.load(open(os.path.join(HERE, 'candidates.json')))}
vl = json.load(open(os.path.join(HERE, '..', '20-list-versatile.json')))
vl_romaji = {it['id']: it['romaji'] for b in vl['blocks'] for it in b['items']}
idx = load()
log = []

# 1. The written entries of the first list, with the base hand edits.
base = {it['id']: it for c in first['categories'] for b in c['blocks'] for it in b['items']}
for a in edits['base'].get('add', []):
    base[a['item']['id']] = a['item']
for iid, field, value in edits['base'].get('set', []):
    base[iid][field] = value
base_by_romaji = {it['romaji']: it for it in base.values()}

# 2. Final items: written ones keep their id (so links and anchors survive); new ones get c-<slug>.
new_by_slug = {it['slug']: it for it in rs['newEntries']}
items, cid_to_item = {}, {}
for r in rs['final']:
    cid = r['id']
    if cid in new_by_slug:
        it = dict(new_by_slug[cid])
        it['id'] = f'c-{cid}'
    elif r['existing'] or (cid in cands and cands[cid]['inCurrentList']):
        src = base_by_romaji.get(cands[cid]['romaji'] if cid in cands else r['romaji'])
        if not src:
            log.append(f'no written entry for {cid}')
            continue
        it = dict(src)
    else:
        continue  # new, but dropped in review
    cid_to_item[cid] = it
    items[it['id']] = it

# 3. Chunks, contrast groups and text fixes from the re-chunking; then consistency and hand fixes.
blocks = []
for t in rs['topics']:
    groups = {g['id']: g['group'] for g in t['contrastGroups']}
    for b in t['blocks']:
        members = [cid_to_item[i] for i in b['ids'] if i in cid_to_item]
        for i in b['ids']:
            if i in cid_to_item and i in groups:
                cid_to_item[i]['contrastGroup'] = groups[i]
        if members:
            blocks.append({'id': b['id'], 'topic': t['key'], 'topicName': t['name'], 'label': b['label'],
                           'rationale': b['rationale'], 'interference': b['interference'], 'items': members})
    for f in t['textFixes']:
        if f['id'] in cid_to_item:
            cid_to_item[f['id']][f['field']] = f['value']
for f in (rs.get('consistency') or {}).get('fixes', []):
    it = cid_to_item.get(f['id']) or items.get(f['id'])
    if it:
        it[f['field']] = f['value']
# Hand restores: the other half of a natural pair the selection split (megane o kakeru kept, megane o hazusu cut).
for romaji_, bid, after in edits['final'].get('restore', []):
    b = next(b for b in blocks if b['id'] == bid)
    partner = next(m for m in b['items'] if m['romaji'] == after)
    it = dict(base_by_romaji[romaji_])
    if not partner.get('contrastGroup'):
        partner['contrastGroup'] = f"{partner['noun']}-pair"
    it['contrastGroup'] = partner['contrastGroup']
    b['items'].insert(b['items'].index(partner) + 1, it)
    items[it['id']] = it
    log.append(f"restored {romaji_} beside {after} in {bid} ({len(b['items'])} items)")
for iid, field, value in edits['final'].get('set', []):
    items[iid][field] = value
for iid, reason in edits['final'].get('drop', []):
    for b in blocks:
        b['items'] = [m for m in b['items'] if m['id'] != iid]
    items.pop(iid, None)
    log.append(f'hand drop {iid}: {reason}')
blocks = [b for b in blocks if b['items']]
in_blocks = {m['id'] for b in blocks for m in b['items']}
for s in sorted(set(items) - in_blocks):
    log.append(f'not in any chunk, left out: {s}')
    items.pop(s)

# 3b. The expansion to ~400 (expand.json): new entries, a fresh chunking of every topic, contrast groups, text fixes,
#     consistency, course order and cut verdicts. Blocks name old entries by item id (c-...) and new ones as c-<slug>.
xpath = os.path.join(HERE, 'expand.json')
ex = json.load(open(xpath)) if os.path.exists(xpath) else None
stage_src, verdict_src, votes = rs['stages'], list(rs['cutVerdicts']), dict(rs['selection']['votes'])
if ex:
    for e in ex['newEntries']:
        it = dict(e)
        it['id'] = f"c-{e['slug']}"
        if it['id'] in items:
            log.append(f"expansion id already used, skipped: {it['id']}")
            continue
        items[it['id']] = it
    blocks = []
    for t in ex['topics']:
        groups = {g['id']: g['group'] for g in t['contrastGroups']}
        for f in t['textFixes']:
            if f['id'] in items:
                items[f['id']][f['field']] = f['value']
        for b in t['blocks']:
            unknown = [i for i in b['ids'] if i not in items]
            if unknown:
                log.append(f"expansion block {b['id']} names unknown ids, skipped: {unknown}")
            members = [items[i] for i in b['ids'] if i in items]
            for m in members:
                if m['id'] in groups:
                    m['contrastGroup'] = groups[m['id']]
            if members:
                blocks.append({'id': b['id'], 'topic': t['key'], 'topicName': t['name'], 'label': b['label'],
                               'rationale': b['rationale'], 'interference': b['interference'], 'items': members})
    cons_x = ex.get('consistency') or {}
    for f in cons_x.get('fixes', []):
        if f['id'] in items:
            items[f['id']][f['field']] = f['value']
    for d in cons_x.get('drops', []):
        for b in blocks:
            b['items'] = [m for m in b['items'] if m['id'] != d['id']]
    blocks = [b for b in blocks if b['items']]
    in_blocks = {m['id'] for b in blocks for m in b['items']}
    for s_ in sorted(set(items) - in_blocks):
        log.append(f'not placed after the expansion, left out: {s_}')
        items.pop(s_)
    # Gap-hunt finds join the candidate pool so the ones not added show up among the cuts.
    for a in ex['additions']:
        cands.setdefault(a['id'], {**a, 'measured': {'count': a['count'], 'shareN': a.get('typical')} if a.get('count') else None,
                                   'inCurrentList': False})
    stage_src = ex['stages']
    verdict_src += ex['cutVerdicts']
    votes |= ex['votes']
    log.append(f"expansion: +{len(ex['newEntries'])} entries, {len(blocks)} chunks")

# 4. Romaji leftovers (kotoba writes っ before ch as t), links into the versatility list, measured counts.
fix_ro = lambda s: s.replace('cch', 'tch') if isinstance(s, str) else s
for it in items.values():
    for f in ('romaji', 'polite', 'noun', 'verb'):
        it[f] = fix_ro(it[f])
    for ex in (it['example'], it['examplePolite']):
        if ex:
            ex['romaji'] = fix_ro(ex['romaji'])
    links = it.get('listLinks') or []
    if any(x not in vl_romaji for x in links):
        log.append(f"dropped unknown listLinks {it['id']}: {[x for x in links if x not in vl_romaji]}")
    it['listLinks'] = [x for x in links if x in vl_romaji]
    it['partners'] = it.get('partners') or []
    it['measured'] = lookup(idx, it['noun'], it['verb'], it.get('nounJa', ''), it.get('verbJa', ''))

# 5. Learners never see ids (c-kaze-o-hiku, H-toru) or chunk ids (weather-2) in prose.
romaji_of = {k: v['romaji'] for k, v in cands.items()} | vl_romaji | {it['id']: it['romaji'] for it in items.values()}
label_of = {b['id']: b['label'] for b in blocks}
def humanize(s):
    if not isinstance(s, str):
        return s
    s = re.sub(r'\bc(?:-[a-z0-9]+)+\b', lambda m: romaji_of.get(m.group(0), romaji_of.get(m.group(0)[2:], m.group(0))), s)
    s = re.sub(r'\b[A-J](?:-[a-z0-9]+)+\b', lambda m: romaji_of.get(m.group(0), m.group(0)), s)
    s = re.sub(r'\b[a-z]+(?:-[a-z]+)?-\d{1,2}\b', lambda m: f'"{label_of[m.group(0)]}"' if m.group(0) in label_of else m.group(0), s)
    return s
for b in blocks:
    b['rationale'], b['interference'] = humanize(b['rationale']), humanize(b['interference'])
for it in items.values():
    for f in ('use', 'notes', 'trap'):
        it[f] = humanize(it.get(f))

# 6. Course order.
by_bid = {b['id']: b for b in blocks}
stages, seen = [], set()
for st in stage_src:
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

# 7. Cuts: every candidate not in the list, with its verdict.
verdicts = {v['id']: v for v in verdict_src}
kept_romaji = {it['romaji'] for it in items.values()}
dropped = {d['slug']: d['reason'] for d in rs['droppedInFix']} | {d['id']: d['reason'] for d in rs.get('consDrops', [])}
cut_rows = []
for cid, c in cands.items():
    if c['romaji'] in kept_romaji:
        continue
    v, m = verdicts.get(cid, {}), c.get('measured') or {}
    cut_rows.append({
        'id': cid, 'cat': c['domain'], 'romaji': c['romaji'], 'polite': c.get('polite'), 'ja': c.get('ja'), 'english': c.get('english'),
        'count': m.get('count'), 'typical': m.get('shareN'), 'commonness': c.get('commonness'), 'trap': c.get('trap'),
        'votes': votes.get(cid, 0), 'wasInList': c['inCurrentList'],
        'verdict': v.get('verdict'), 'reason': humanize(v.get('reason') or dropped.get(cid)), 'coveredBy': humanize(v.get('coveredBy')),
    })
cut_rows.sort(key=lambda r: -(r['count'] or 0))

ITEM_KEYS = ['n', 'id', 'romaji', 'polite', 'english', 'use', 'ja', 'kana', 'politeJa', 'noun', 'nounJa', 'particle', 'verb', 'verbJa',
             'verbSense', 'englishVerb', 'trap', 'partners', 'flags', 'contrastGroup', 'example', 'examplePolite', 'measured',
             'nounRank', 'verbRank', 'freqNote', 'commonness', 'trapRisk', 'speakNeed', 'listLinks', 'alsoIn', 'notes']
topics = []
for t in rs['topics']:
    ids_ = sorted((b['id'] for b in course if b['topic'] == t['key']), key=lambda x: int(x.rsplit('-', 1)[1]))
    if ids_:
        topics.append({'key': t['key'], 'name': t['name'], 'chunkIds': ids_})
stage_counts = [sum(len(by_bid[c]['items']) for c in st['chunkIds']) for st in stages]
measured_n = sum(1 for it in items.values() if it['measured'])
out = {
    'orderingVariable': "COURSE ORDER — 4 stages that run alongside the versatility list's stages (a chunk in Stage N is learned during versatility Stage N). The most common, most typical sets first; each stage mixes several areas of daily life; within a topic, chunks run from the most common sets to less common ones.",
    'whyThatVariable': 'Selected on how common and how typical each set is: measured in 3.17M lines of Japanese film and TV subtitles (OpenSubtitles 2018, counted on dictionary forms), corrected by native judgement where foreign-film subtitles over-count plot sets and under-count Japanese daily life. Whether English misleads the learner is a note on the entry (trap), not a reason to keep or cut.',
    'conventions': {
        'romaji': "kotoba's stored spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled (koohii, juuden, sou), wa/o/e particles, っ before ch = t.",
        'register': 'romaji = the plain dictionary form of the whole set; polite = its desu/masu form, or null for adjective + noun. Examples use the form people say most (ame futteru), often without ga/o.',
        'parts': 'noun + particle + verb (verb also holds the adjective in se ga takai or koi koohii); verbSense = what the verb means on its own.',
        'measured': "count = occurrences in the subtitle corpus (with any particle, or none); perMillion = per million lines; shareN = typicality, the share of everything said with the noun that goes to this verb; shareV = the noun's share of the verb's nouns; logDice = association (10+ strong); particles = the particle mix (∅ = dropped). null = too rare in films to count.",
        'ranks': 'nounRank / verbRank = ranks of the parts in the jiten.moe drama frequency list (CC BY-SA 4.0).',
        'scores': 'commonness / trapRisk / speakNeed, 1-5, judged.',
        'trap': 'the mistake an English speaker would make, or null. englishVerb = the English word they would reach for.',
        'listLinks': 'ids of items in 20-list-versatile.json that the set builds on.',
        'contrastGroup': 'items sharing a group name are learned side by side; groups can span topics.',
    },
    'stats': {
        'total': total, 'chunks': len(course), 'measured': measured_n, 'corpusLines': 3170155,
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
        'Out of scope by design: figurative idioms (te o kasu, ki ga au, atama ni kuru) — saved for a separate idiom list; grammar patterns (hitsuyou ga aru, shikata ga nai); plain noun + suru verbs (shinpai suru); free combinations; sets common only in film plots.',
        'Not repeated from the versatility list: ki ni naru, ki ni suru, ki ga suru, ki o tsukeru, renraku suru.',
        'Two workflows: the first gathered 595 candidates by topic and gap hunts and wrote the first list; the second counted every noun + verb pair in the subtitle corpus, sorted the 1,848 most frequent typical pairs (520 new everyday sets, 175 idioms saved), and re-selected the list on commonness and typicality with three judges (data, everyday Japan, complete sets). New entries were reviewed four ways (native naturalness, whether each trap is really a mistake, meaning and register, romaji and data).',
        'The corpus is mostly subtitles for foreign films, so Japan-specific daily life (konbini, warikan, kasa o sasu) is under-counted; those sets were judged on native commonness instead.',
    ],
    'cuts': cut_rows,
}
json.dump(out, open(OUT_JSON, 'w'), ensure_ascii=False, indent=1)

print('\n'.join(log))
print(f'total {total} items ({measured_n} with counts), {len(course)} chunks; stages {stage_counts}; cuts {len(cut_rows)}')
print('wrote', os.path.relpath(OUT_JSON, HERE), os.path.getsize(OUT_JSON), 'bytes')
