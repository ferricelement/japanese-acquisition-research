#!/usr/bin/env python3
"""Merge workflow results into store.json, check them, and write ../collocation-scripts.json (course order).

  python3 merge.py <workflow run json>...   add or replace scripts (keyed by chunk), then check
  python3 merge.py                          check only

A run json is a workflow record (its result.scripts) or a plain {"scripts": [...]}. hand-edits.json is applied last.
Checks (checks.py): the structure rules, each target heard at least twice and tested once, romaji against the kana.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..', '..')
from checks import issues  # noqa: E402
from edits import apply  # noqa: E402

STORE = os.path.join(HERE, 'store.json')
OUT = os.path.join(HERE, '..', 'collocation-scripts.json')
index = json.load(open(os.path.join(HERE, 'index.json')))
coll = {it['id']: it for b in json.load(open(os.path.join(ROOT, '21-list-collocations.json')))['blocks'] for it in b['items']}

store = json.load(open(STORE)) if os.path.exists(STORE) else {'scripts': {}}
for path in sys.argv[1:]:
    run = json.load(open(path))
    rows = (run.get('result') or run)['scripts']
    for r in rows:
        if r and r.get('script'):
            store['scripts'][r['chunkId']] = {'script': r['script'], 'remaining': r.get('remaining', []), 'rounds': r.get('rounds')}
    print(f"{path}: {sum(1 for r in rows if r and r.get('script'))} scripts")

# Hand edits after review (same format as the review's edits), applied on top of the stored scripts every time.
hpath = os.path.join(HERE, 'hand-edits.json')
if os.path.exists(hpath):
    by_n = {ix['n']: store['scripts'][ix['chunkId']]['script'] for ix in index if ix['chunkId'] in store['scripts']}
    done, bad = apply(by_n, json.load(open(hpath))['edits'])
    print(f"hand edits: {len(done)} applied" + (f", {len(bad)} skipped: {bad}" if bad else ''))

problems = {}
def flag(cid, msg):
    problems.setdefault(cid, []).append(msg)

ordered = []
for ix in index:
    rec = store['scripts'].get(ix['chunkId'])
    if not rec:
        continue
    s = rec['script']
    cid = ix['chunkId']
    for msg in issues(s, ix, index):
        flag(cid, msg)
    if rec['remaining']:
        flag(cid, f"{len(rec['remaining'])} blocking issue(s) left by the workflow")
    ordered.append({'n': ix['n'], 'stage': ix['stage'], 'chunkId': cid, 'label': ix['label'],
                    'targets': [{'id': t, 'romaji': coll[t]['romaji'], 'english': coll[t]['english']} for t in ix['targets']],
                    'review': [{'id': r, 'romaji': coll[r]['romaji'], 'english': coll[r]['english']} for r in s['reviewUsed'] if r in coll],
                    **{k: v for k, v in s.items() if k != 'chunkId'}})

json.dump(store, open(STORE, 'w'), ensure_ascii=False, indent=1)
print(f"{len(store['scripts'])}/{len(index)} scripts stored; {sum(len(v) for v in problems.values())} problems in {len(problems)} scripts")
for cid, msgs in problems.items():
    print(' ', cid)
    for m in msgs[:12]:
        print('    -', m)
conv = open(os.path.join(HERE, 'conventions.md')).read()
cast = [dict(zip(('id', 'name', 'voice', 'who'), (c.strip() for c in row.strip('|').split('|'))))
        for row in conv.split('## The cast')[1].split('##')[0].splitlines() if row.startswith('| ') and not row.startswith('| id')]
json.dump({
    'title': 'Collocation listening scripts',
    'intro': ("Listening scripts for the collocations list (21-list-collocations.json), one per chunk, in course order. "
              "Each script is a short scene where that chunk's collocations come up several times, plus a few from earlier "
              "chunks for review. For each one: make the audio from the Japanese (one voice per speaker, the same voices in "
              "every script; if a voice misreads a kanji, use the kana version of that line), listen without looking at any "
              "text, answer the questions out loud, then check the answers and the romaji transcript. Say-it questions (type "
              "respond) have no choices: a character says the cue line and you answer in Japanese. Words outside the versatility list (up "
              "to the script's stage) and the collocations so far are listed as new words."),
    'conventions': 'build/conventions.md',
    'cast': cast,
    'stats': {'scripts': len(ordered), 'lines': sum(len(s['lines']) for s in ordered),
              'questions': sum(len(s['questions']) for s in ordered), 'targets': sum(len(s['targets']) for s in ordered)},
    'scripts': ordered,
}, open(OUT, 'w'), ensure_ascii=False, indent=1)
