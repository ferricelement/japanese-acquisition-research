#!/usr/bin/env python3
"""Write one brief per collocation chunk (briefs/<n>-<chunk id>.json) for the script-writing workflow."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..', '..')
data = json.load(open(os.path.join(ROOT, '21-list-collocations.json')))
by_id = {b['id']: b for b in data['blocks']}
course = [by_id[c] for st in data['stages'] for c in st['chunkIds']]

TARGET_KEYS = ['id', 'romaji', 'polite', 'english', 'ja', 'kana', 'politeJa', 'noun', 'particle', 'verb', 'verbJa',
               'verbSense', 'englishVerb', 'trap', 'partners', 'flags', 'use', 'notes', 'example', 'examplePolite']
# Suggestions only, rotated so the scripts don't all star the same two people; the writer may change them.
CAST = [['yuki', 'kenta'], ['kenta', 'sora'], ['yuki', 'mai'], ['mai', 'tanaka'], ['yuki', 'okaasan'],
        ['yuki', 'kenji'], ['satou', 'yuki'], ['sora', 'mai'], ['okaasan', 'kenji'], ['kenta', 'satou']]

out_dir = os.path.join(HERE, 'briefs')
for f in os.listdir(out_dir):
    os.remove(os.path.join(out_dir, f))
index = []
for n, b in enumerate(course, 1):
    earlier = course[:n - 1]
    recent = {e['id'] for e in earlier[-6:]}
    brief = {
        'script': n, 'of': len(course), 'stage': b['stage'], 'chunkId': b['id'], 'label': b['label'],
        'topic': b['category'], 'rationale': b['rationale'], 'mixUps': b['interference'],
        'targets': [{k: it.get(k) for k in TARGET_KEYS} for it in b['items']],
        'reviewPool': [{'id': it['id'], 'romaji': it['romaji'], 'english': it['english'], 'chunk': e['label'],
                        'recent': e['id'] in recent} for e in earlier for it in e['items']],
        'suggested': {'cast': CAST[(n - 1) % len(CAST)], 'format': 'monologue' if n % 5 == 0 else 'dialogue'},
    }
    path = os.path.join(out_dir, f"{n:02d}-{b['id']}.json")
    json.dump(brief, open(path, 'w'), ensure_ascii=False, indent=1)
    index.append({'n': n, 'chunkId': b['id'], 'stage': b['stage'], 'label': b['label'],
                  'targets': [it['id'] for it in b['items']], 'brief': os.path.relpath(path, ROOT)})
json.dump(index, open(os.path.join(HERE, 'index.json'), 'w'), ensure_ascii=False, indent=1)
print(len(index), 'briefs;', sum(len(i['targets']) for i in index), 'targets')
