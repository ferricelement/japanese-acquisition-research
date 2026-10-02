#!/usr/bin/env python3
"""Merge the main workflow result with the restored, re-added and maybe additions, fix known issues,
renumber in course order, and write ../20-list-versatile.json, ../index.html (GitHub Pages) and
artifact.html (the same page as a fragment for the claude.ai artifact)."""
import json, re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_JSON = os.path.join(HERE, '..', '20-list-versatile.json')
OUT_INDEX = os.path.join(HERE, '..', 'index.html')
OUT_HTML = os.path.join(HERE, 'artifact.html')

d = json.load(open(os.path.join(HERE, 'result.json')))
adds = json.load(open(os.path.join(HERE, 'additions-result.json')))
# Re-adds from the cuts review; their blocks may join an existing block (joinBlock).
for name in ('readds-result.json', 'maybes-result.json'):
    path = os.path.join(HERE, name)
    adds += json.load(open(path)) if os.path.exists(path) else []
# placement: {"<cat>:<block label>": ["<stage index 0-3>", "<insert after chunk id>"]}
placement = json.load(open(os.path.join(HERE, 'placement.json')))

cats = {c['key']: c for c in d['categories']}
log = []

# 1. Add the restored and re-added blocks to their categories.
for a in adds:
    c = cats[a['cat']]
    for b in a['blocks']:
        for it in b['items']:
            it['id'] = f"{a['cat']}-{it['slug']}"
        target = next((x for x in c['blocks'] if x['id'] == b.get('joinBlock')), None)
        if target:
            target['items'] += b['items']
            for f in ('label', 'rationale', 'interference'):
                target[f] = b[f]
            log.append(f"joined {target['id']} {target['label']}: +{', '.join(it['romaji'] for it in b['items'])} (now {len(target['items'])})")
            if len(target['items']) > 6:
                log.append(f"WARNING {target['id']} has {len(target['items'])} items")
            continue
        b.pop('joinBlock', None)
        b['id'] = f"{a['cat']}{len(c['blocks']) + 1}"
        c['blocks'].append(b)
        key = f"{a['cat']}:{b['label']}"
        if key not in placement:
            sys.exit(f'no placement for {key}')
        si, after = placement[key]
        chunk_ids = d['stages'][si]['chunkIds']
        chunk_ids.insert(chunk_ids.index(after) + 1 if after in chunk_ids else len(chunk_ids), b['id'])
        log.append(f"added {b['id']} {b['label']} ({len(b['items'])}) -> stage {si + 1} after {after}")
    for x in a.get('dropped', []):
        log.append(f"addition dropped by review: {a['cat']}-{x['slug']} — {x['reason']}")

# 1b. Edits to existing items that the re-add writers asked for (pairing groups, cross-references, order).
edits = json.load(open(os.path.join(HERE, 'existing-edits.json')))
by_id = {it['id']: it for c in d['categories'] for b in c['blocks'] for it in b['items']}
for iid, field, value in edits['set']:
    by_id[iid][field] = value
for bid, order in edits['order'].items():
    b = next(b for c in d['categories'] for b in c['blocks'] if b['id'] == bid)
    assert sorted(order) == sorted(it['id'] for it in b['items']), bid
    b['items'] = [by_id[i] for i in order]
log.append(f"edited {len(edits['set'])} existing fields, reordered {list(edits['order'])}")

items = [it for c in d['categories'] for b in c['blocks'] for it in b['items']]
ids = [it['id'] for it in items]
assert len(ids) == len(set(ids)), 'duplicate ids'

# 2. kotoba writes っ before ch as t (kotchi); fix leftover cchi spellings in text fields.
CCH = re.compile(r'\b(ko|so|a|do)cchi\b')
def fix_text(s):
    return CCH.sub(lambda m: m.group(1) + 'tchi', s) if isinstance(s, str) else s
for c in d['categories']:
    for b in c['blocks']:
        for f in ('label', 'rationale', 'interference'):
            b[f] = fix_text(b[f])
        for it in b['items']:
            for f in ('romaji', 'polite', 'use', 'notes', 'english'):
                it[f] = fix_text(it[f])
            for ex in (it['example'], it['examplePolite']):
                if ex:
                    ex['romaji'] = fix_text(ex['romaji'])

# 3. Prereqs are slugs; turn them into item ids (same category first).
by_slug = {}
for c in d['categories']:
    for b in c['blocks']:
        for it in b['items']:
            by_slug.setdefault(it['slug'], []).append((c['key'], it['id']))
unresolved = []
for c in d['categories']:
    for b in c['blocks']:
        for it in b['items']:
            out = []
            for p in it['prereqs']:
                if p in ids:
                    out.append(p); continue
                cands = by_slug.get(p, [])
                same = [i for k, i in cands if k == c['key']]
                pick = same[0] if same else (cands[0][1] if len(cands) == 1 else None)
                if pick:
                    out.append(pick)
                else:
                    unresolved.append(f"{it['id']}: {p}")
            it['prereqs'] = [p for p in out if p != it['id']]
if unresolved:
    log.append(f'unresolved prereqs dropped: {unresolved}')

# 4. Renumber in course order.
block_by_id = {b['id']: (c, b) for c in d['categories'] for b in c['blocks']}
seen = set()
n = 1
for si, st in enumerate(d['stages']):
    for oi, cid in enumerate(st['chunkIds']):
        c, b = block_by_id[cid]
        seen.add(cid)
        b['stage'], b['order'] = si + 1, oi + 1
        start = n
        for it in b['items']:
            it['n'] = n
            n += 1
        b['range'] = f'{start}-{n - 1}'
missing = set(block_by_id) - seen
assert not missing, f'chunks not in any stage: {missing}'
total = n - 1

# A prereq taught after the item can't be a prereq; drop it.
pos = {it['id']: it['n'] for c in d['categories'] for b in c['blocks'] for it in b['items']}
for c in d['categories']:
    for b in c['blocks']:
        for it in b['items']:
            late = [p for p in it['prereqs'] if pos[p] > it['n']]
            if late:
                log.append(f"dropped forward prereq {it['id']} -> {late}")
                it['prereqs'] = [p for p in it['prereqs'] if p not in late]

# Cuts: everything not in the list, with the cuts-review verdict when one exists.
cuts_full = json.load(open(os.path.join(HERE, 'cuts-full.json')))
vpath = os.path.join(HERE, 'cuts-verdicts.json')
verdicts = json.load(open(vpath)) if os.path.exists(vpath) else {}
cut_rows = []
for x in cuts_full:
    if x['id'] in ids or x['romaji'] in {it['romaji'] for it in items if it['id'].startswith(x['cat'] + '-')}:
        continue
    v = verdicts.get(x['id'], {})
    cut_rows.append({k: x.get(k) for k in ('id', 'cat', 'romaji', 'polite', 'ja', 'english', 'freqRank', 'flags', 'votes')}
                    | {'verdict': v.get('verdict'), 'reason': v.get('reason'), 'coveredBy': v.get('coveredBy')})

# 5. Research JSON, same top-level shape as lists 10-13 (blocks in course order).
ITEM_KEYS = ['n', 'id', 'romaji', 'polite', 'english', 'use', 'ja', 'kana', 'politeJa', 'flags', 'contrastGroup',
             'example', 'examplePolite', 'freqRank', 'freqNote', 'spread', 'reach', 'speakNeed', 'prereqs', 'alsoIn', 'notes']
course_blocks = []
for st in d['stages']:
    for cid in st['chunkIds']:
        c, b = block_by_id[cid]
        course_blocks.append({
            'id': b['id'], 'range': b['range'], 'stage': b['stage'], 'category': c['name'],
            'label': b['label'], 'rationale': b['rationale'], 'interference': b['interference'],
            'items': [{k: it.get(k) for k in ITEM_KEYS} for it in b['items']],
        })
stage_counts = [sum(len(block_by_id[cid][1]['items']) for cid in st['chunkIds']) for st in d['stages']]
research = {
    'orderingVariable': 'COURSE ORDER — 4 stages that interleave all ten categories, so each stage adds new kinds of things you can say; within a category, chunks run simple to complex and prerequisites come first.',
    'whyThatVariable': 'Versatility = spoken frequency (rank in jiten.moe drama subtitles, 3,030 dramas) x spread across topics x reach (how many sentences it attaches to) x speaking need. Casual is the default form (romaji); the polite desu/masu counterpart sits beside it (polite).',
    'conventions': {
        'romaji': "kotoba's stored spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled (sou, daijoubu, kirei), wa/o/e particles, っ before ch = t (kotchi). Leading hyphen = attaches to a word.",
        'register': 'romaji = casual form, learned first; polite = desu/masu counterpart, or null when there is no register difference.',
        'freqRank': 'rank in jiten.moe drama frequency list (CC BY-SA 4.0); freqNote explains tokenizer-split forms. null = no usable rank.',
        'scores': 'spread / reach / speakNeed, 1-5, judged.',
        'prereqs': 'item ids to learn first.',
        'contrastGroup': 'items sharing a group name are learned side by side; their examples share a base sentence.',
    },
    'stats': {
        'total': total, 'chunks': len(block_by_id),
        'byCategory': {c['name']: sum(len(b['items']) for b in c['blocks']) for c in d['categories']},
        'byStage': {st['name']: cnt for st, cnt in zip(d['stages'], stage_counts)},
        'candidatePool': d['stats']['poolSize'],
    },
    'stages': [{'name': st['name'], 'summary': st['summary'], 'items': cnt, 'chunkIds': st['chunkIds']} for st, cnt in zip(d['stages'], stage_counts)],
    'categories': [{'key': c['key'], 'name': c['name'], 'scope': c['scope'], 'chunkIds': [b['id'] for b in c['blocks']]} for c in d['categories']],
    'blocks': course_blocks,
    'notes': [
        'Out of scope by design: topic nouns, numbers, counters, clock times, dates, day-of-week and month names, keigo beyond desu/masu.',
        'Relative time words (asa, yoru, raishuu, kotoshi...) and several endings (darou, n da yo, -te ne, plus the mostly-heard sa / wa / zo / yo na) were cut by the selection panel and restored afterwards through the same write and three-lens review steps.',
        'A second review of all 621 cuts (per-category reviewer + usage and redundancy checks) re-added 33 clear gaps plus 10 strong maybes and boku (learner request): e.g. atsui, samui, itai, kirei, otsukare, oyasumi, hisashiburi, tetsudau, okureru, -you ni, the passive. Cut verdicts are stored on each entry in cuts.',
        'The remaining 16 maybes were then added at the learner\'s request (nakanaka, douse, nigate, hazukashii, nagai, abunai, -kawari ni, wake nai, moshimoshi, bikkuri shita, ki o tsukete, ireru, tariru, okoru, -sasete, dou iu); all joined existing chunks.',
        'No pitch-accent numbers: the recorded audio carries accent; guessed accents were the main error source in earlier lists.',
    ],
    'cuts': cut_rows,
}
json.dump(research, open(OUT_JSON, 'w'), ensure_ascii=False, indent=1)

# 6. Page.
page_data = {
    'stages': [{'name': st['name'], 'summary': st['summary'], 'chunkIds': st['chunkIds']} for st in d['stages']],
    'categories': [{'key': c['key'], 'name': c['name'], 'scope': c['scope'], 'blocks': [
        {k: b[k] for k in ('id', 'label', 'rationale', 'interference', 'stage', 'order', 'range')} |
        {'items': [{k: it.get(k) for k in ITEM_KEYS} for it in b['items']]} for b in c['blocks']]} for c in d['categories']],
}
if verdicts:
    page_data['cuts'] = [{k: r[k] for k in ('cat', 'romaji', 'polite', 'ja', 'english', 'freqRank', 'flags', 'votes', 'verdict', 'reason', 'coveredBy')} for r in cut_rows]
tpl = open(os.path.join(HERE, 'page-template.html')).read()
blob = json.dumps(page_data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
page = tpl.replace('/*DATA*/', blob)
open(OUT_HTML, 'w').write(page)
# Pages needs a full document: title, fonts and styles go in <head>.
split = page.index('<header class="top wrap">')
open(OUT_INDEX, 'w').write(
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    f'<meta name="description" content="{total} high-versatility Japanese words, endings and patterns, casual first with the polite form beside it.">\n'
    + page[:split] + '</head>\n<body>\n' + page[split:] + '</body>\n</html>\n')

print('\n'.join(log))
print(f'total {total} items, {len(block_by_id)} chunks; stages {stage_counts}')
print('wrote', *(f'{os.path.relpath(p, HERE)} ({os.path.getsize(p)} bytes)' for p in (OUT_JSON, OUT_INDEX, OUT_HTML)))
