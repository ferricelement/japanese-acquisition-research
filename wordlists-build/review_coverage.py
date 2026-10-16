#!/usr/bin/env python3
"""Which entries the reviewers actually read, from their transcripts (the ## <id> headers in Read results),
and a gap batch (review/gap-NN.md) for every entry nobody read. Usage: python3 review_coverage.py <run dir>... [per_batch]"""
import glob, json, os, re, sys
from review_batches import render  # noqa  (importing re-renders review/*.md; harmless once the run is over)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
dirs = [a for a in sys.argv[1:] if os.path.isdir(a)]
per = int(next((a for a in sys.argv[1:] if a.isdigit()), 200))
seen = set()
for d in dirs:
    for f in glob.glob(os.path.join(d, 'agent-*.jsonl')):
        for line in open(f):
            seen |= set(re.findall(r'## ([wspg]-[a-z0-9-]+)', line))
todo = []
for f in ('23-list-core.json', '24-list-sets.json', '25-list-phrases.json', '26-list-conjugations.json'):
    for b in json.load(open(os.path.join(ROOT, f)))['blocks']:
        todo += [it for it in b['items'] if it['id'] not in seen]
names = []
for i in range(0, len(todo), per):
    name = f'gap-{i // per + 1:02d}.md'
    open(os.path.join(HERE, 'review', name), 'w').write('\n\n'.join(render(it) for it in todo[i:i + per]) + '\n')
    names.append(name)
print(f'{len(seen)} entries read by reviewers; {len(todo)} unread -> {names}')
