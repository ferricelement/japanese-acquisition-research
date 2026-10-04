#!/usr/bin/env python3
"""Apply the lean review's field edits to the drafts (and the scripts it wrote), then hand the result to merge.py.

  python3 apply_edits.py <lean run output json>   writes run-lean-applied.json and review-edits.json, then merges
"""
import json, os, subprocess, sys

from edits import apply

HERE = os.path.dirname(os.path.abspath(__file__))
run = json.load(open(sys.argv[1]))
batches = (run.get('result') or run)['batches']
index = {i['n']: i for i in json.load(open(os.path.join(HERE, 'index.json')))}

scripts = {}
for b in batches:
    for n in b['reviewed']:
        path = os.path.join(HERE, 'drafts', f'{n:02d}.json')
        if os.path.exists(path):
            scripts[n] = json.load(open(path))
    for n, s in b['written'].items():
        scripts[int(n)] = s
        json.dump(s, open(os.path.join(HERE, 'drafts', f'{int(n):02d}.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

applied, skipped = apply(scripts, [e for b in batches for e in b['edits']])
json.dump({'applied': applied, 'skipped': skipped}, open(os.path.join(HERE, 'review-edits.json'), 'w'), ensure_ascii=False, indent=1)
rows = [{'n': n, 'chunkId': index[n]['chunkId'], 'script': {**s, 'chunkId': index[n]['chunkId']}, 'rounds': 1, 'remaining': []}
        for n, s in sorted(scripts.items())]
out = os.path.join(HERE, 'run-lean-applied.json')  # scratch file for merge.py, deleted after
json.dump({'scripts': rows}, open(out, 'w'), ensure_ascii=False)
print(f"{len(rows)} scripts; {len(applied)} edits applied, {len(skipped)} skipped")
for e in skipped:
    print('  skipped', e['script'], e['kind'], e['index'], e['sub'], e['field'], e['error'])
subprocess.run([sys.executable, os.path.join(HERE, 'merge.py'), out], check=True)
os.remove(out)
