#!/usr/bin/env python3
"""Conversation pass, step 2: after the new phrases are written and merged, list every phrase that isn't errands by
chat move for the chunkers (cv/chunk-<n>.tsv), and render the new phrases for review (review/new-<n>.md).
Writes chunk-args.json for chunk-workflow.js."""
import json, os
from collections import defaultdict
from review_batches import render

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
cv = json.load(open(os.path.join(HERE, 'cv.json')))
hunted = {x['ja'] for x in json.load(open(os.path.join(HERE, 'hunted.json')))}
tax = json.load(open(os.path.join(HERE, 'taxonomy.json')))
d = json.load(open(os.path.join(ROOT, '25-list-phrases.json')))
items = [it for b in d['blocks'] for it in b['items']]
move = lambda it: (cv.get(it['id']) or {}).get('move') or next((x['move'] for x in json.load(open(os.path.join(HERE, 'hunted.json'))) if x['ja'] == it['ja']), None)
by_move = defaultdict(list)
for it in items:
    m = move(it)
    if m and m != 'c-errands':
        by_move[m].append(it)
groups = [['c-intro', 'c-likes', 'c-opine', 'c-catchup'], ['c-react', 'c-ask', 'c-agree', 'c-repair', 'c-flow'],
          ['c-tell', 'c-feel', 'c-plans', 'c-banter', 'c-social']]
os.makedirs(os.path.join(HERE, 'review'), exist_ok=True)
files = []
for i, g in enumerate(groups, 1):
    lines = ['move\tid\tromaji\tenglish\tcv\trole']
    for m in g:
        for it in by_move.get(m, []):
            lines.append(f"{m}\t{it['id']}\t{it['romaji']}\t{it['english']}\t{it.get('cv') or (cv.get(it['id']) or {}).get('cv')}\t{it.get('role')}")
    open(os.path.join(HERE, 'cv', f'chunk-{i}.tsv'), 'w').write('\n'.join(lines) + '\n')
    files.append(f'chunk-{i}.tsv')
    print(f'chunk-{i}.tsv', len(lines) - 1, {m: len(by_move.get(m, [])) for m in g})
new = [it for it in items if it['ja'] in hunted]
reviews = []
for i in range(0, len(new), 140):
    name = f'new-{i // 140 + 1}.md'
    open(os.path.join(HERE, 'review', name), 'w').write('\n\n'.join(render(it) for it in new[i:i + 140]) + '\n')
    reviews.append(name)
json.dump({'cv': os.path.join(HERE, 'cv'), 'review': os.path.join(HERE, 'review'), 'chunks': files, 'reviews': reviews,
           'moves': tax['move']}, open(os.path.join(HERE, 'chunk-args.json'), 'w'), indent=1)
print('new phrases to review:', len(new), reviews, '| errands kept as they were:', sum(1 for it in items if move(it) == 'c-errands'))
