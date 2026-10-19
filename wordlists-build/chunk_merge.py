#!/usr/bin/env python3
"""Conversation pass, step 3: split the chunk run's results (chunk-result.json, from journal.py) into
phrase-chunks.json (the chat-move chunks merge.py uses) and review-conv-result.json (edits to the new phrases)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
res = json.load(open(os.path.join(HERE, 'chunk-result.json')))
chunks = [c for k, v in sorted(res.items()) if k.startswith('chunk:') for c in v['chunks']]
# the errands phrases were chunked in a run of their own
er = os.path.join(HERE, 'chunk-errands-result.json')
if os.path.exists(er):
    chunks += [{**c, 'move': 'c-errands', 'stage': 4} for v in json.load(open(er)).values() for c in v['chunks']]
json.dump({'chunks': chunks}, open(os.path.join(HERE, 'phrase-chunks.json'), 'w'), ensure_ascii=False, indent=1)
rev = {k: v for k, v in res.items() if k.startswith('review-new:')}
json.dump(rev, open(os.path.join(HERE, 'review-conv-result.json'), 'w'), ensure_ascii=False, indent=1)
print(f"{len(chunks)} chunks; {sum(len(v['edits']) for v in rev.values())} edits, {sum(len(v['drops']) for v in rev.values())} drops")
