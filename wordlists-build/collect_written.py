#!/usr/bin/env python3
"""Gather the writers' files (written/<batch>.part*.json + <batch>.chunks.json) into write-result.json,
keyed like workflow labels (write:<kind>:<n>). Batches with no files are reported, not guessed."""
import glob, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
args = json.load(open(os.path.join(HERE, 'write-args.json')))
out, missing = {}, []
for b in args['batches']:
    base = b['file'][:-5]
    parts = sorted(glob.glob(os.path.join(HERE, 'written', f'{base}.part*.json')), key=lambda p: int(re.search(r'part(\d+)', p).group(1)))
    cpath = os.path.join(HERE, 'written', f'{base}.chunks.json')
    if not parts or not os.path.exists(cpath):
        missing.append(base)
        continue
    entries = [e for p in parts for e in json.load(open(p))]
    ch = json.load(open(cpath))
    out[f"write:{b['kind']}:{b['n']}"] = {'entries': entries, 'chunks': ch.get('chunks', []), 'drops': ch.get('drops', [])}
json.dump(out, open(os.path.join(HERE, 'write-result.json'), 'w'), ensure_ascii=False)
print(f"{len(out)} batches, {sum(len(v['entries']) for v in out.values())} entries" + (f"; no files yet: {missing}" if missing else ''))
