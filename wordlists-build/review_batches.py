#!/usr/bin/env python3
"""Render the merged lists as text batches for reviewers (review/*.md) with the code checks' flags inline,
and write review-args.json for review-workflow.js. Usage: python3 review_batches.py [per_batch]"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
OUT = os.path.join(HERE, 'review')
flags = json.load(open(os.path.join(HERE, 'flags.json')))


def render(it):
    ex = lambda e: f"{e['romaji']} | {e['ja']} | {e['english']}" if e else '—'
    lines = [f"## {it['id']}", f"romaji: {it['romaji']} | polite: {it.get('polite') or '—'} | english: {it['english']}",
             f"ja: {it['ja']} | kana: {it.get('kana')} | politeJa: {it.get('politeJa') or '—'}"]
    if it.get('name') or it.get('formation'):
        lines.append(f"name: {it.get('name')} | formation: {it.get('formation')}")
    if it.get('table'):
        lines.append('table (built by code): ' + ', '.join(f"{r['word']}→{r['romaji']}" for r in it['table']))
    if it.get('use'):
        lines.append(f"use: {it['use']}")
    lines += [f"example: {ex(it['example'])}", f"examplePolite: {ex(it.get('examplePolite'))}"]
    if it.get('notes'):
        lines.append(f"notes: {it['notes']}")
    lines += [f"FLAG: {p}" for p in flags.get(it['id'], [])]
    return '\n'.join(lines)



def main():
    per = int(sys.argv[1]) if len(sys.argv) > 1 else 180
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
    entries = [render(it) for f in ('23-list-core.json', '24-list-sets.json', '25-list-phrases.json', '26-list-conjugations.json')
               for b in json.load(open(os.path.join(ROOT, f)))['blocks'] for it in b['items']]
    files = []
    for i in range(0, len(entries), per):
        name = f'batch-{i // per + 1:02d}.md'
        open(os.path.join(OUT, name), 'w').write('\n\n'.join(entries[i:i + per]) + '\n')
        files.append(name)
    json.dump({'dir': OUT, 'files': files}, open(os.path.join(HERE, 'review-args.json'), 'w'), indent=1)
    print(len(files), 'batches', [os.path.getsize(os.path.join(OUT, x)) // 1000 for x in files], 'KB')


if __name__ == '__main__':
    main()
