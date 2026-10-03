#!/usr/bin/env python3
"""Render exercises/stage-1/listening-stories.json as a readable Markdown file next to it.
Order per story: audio script (for TTS), questions, new words, then answers and transcript."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'stage-1', 'listening-stories.json')
OUT = os.path.join(HERE, 'stage-1', 'listening-stories.md')
LIST = os.path.join(HERE, '..', '20-list-versatile.json')

data = json.load(open(SRC))
stories = data['stories']
stage1 = [it for b in json.load(open(LIST))['blocks'] if b['stage'] == 1 for it in b['items']]

md = [f"# {data['title']}", '', data['intro'], '']
for s in stories:
    names = {sp['id']: sp['name'] for sp in s['speakers']}
    md += [f"## {s['n']}. {s['title']}", '',
           f"*{s['register'].capitalize()} {s['format']} · {len(s['lines'])} lines · {', '.join(names.values())}*", '',
           s['setting'], '', '### Audio script', '',
           '| Speaker | Voice |', '|---|---|',
           *[f"| {sp['name']} | {sp['voice']} |" for sp in s['speakers']], '',
           '| # | Speaker | Japanese | Kana (if the voice misreads a kanji) |', '|---|---|---|---|',
           *[f"| {i} | {names.get(l['speaker'], l['speaker'])} | {l['ja']} | {l['kana']} |" for i, l in enumerate(s['lines'], 1)], '',
           '### Questions', '']
    for i, q in enumerate(s['questions'], 1):
        md += [f"{i}. **{q['english']}**  ", f"   {q['romaji']} ({q['ja']})"]
        md += [f"   - {c['key']}. {c['english']}" for c in q['choices']]
        md.append('')
    if s['newWords']:
        md += ['### New words', '', *[f"- **{w['romaji']}** ({w['ja']}): {w['english']}" for w in s['newWords']], '']
    md += ['<details>', '<summary>Answers and transcript</summary>', '']
    for i, q in enumerate(s['questions'], 1):
        if q['modelAnswers']:
            answers = '; '.join(f"*{a['romaji']}* ({a['english']})" for a in q['modelAnswers'])
            md.append(f"{i}. {q['answer']} For example: {answers}. {q['explanation']}")
        else:
            md.append(f"{i}. **{q['answer']}**. {q['explanation']}")
    md += ['', '| # | Speaker | Romaji | English |', '|---|---|---|---|',
           *[f"| {i} | {names.get(l['speaker'], l['speaker'])} | {l['romaji']} | {l['english']} |" for i, l in enumerate(s['lines'], 1)],
           '', '</details>', '']

used = {i for s in stories for i in s['itemsUsed']}
missing = [it['romaji'] for it in stage1 if it['id'] not in used]
md += ['## Stage 1 coverage', '',
       f"The stories use {len(used & {it['id'] for it in stage1})} of the {len(stage1)} Stage 1 items."
       + (f" Not used: {', '.join(missing)}." if missing else '')]
# coverage-audit.json (from the audit workflow) counts each item's hearings in its main job.
audit_path = os.path.join(HERE, 'stage-1', 'coverage-audit.json')
if os.path.exists(audit_path):
    audit = json.load(open(audit_path))['items']
    heard = {k: sum(o['function'] == 'core' for o in v['occurrences']) for k, v in audit.items()}
    few = [f"{audit[k]['romaji']} ({n})" for k, n in heard.items() if n < 3]
    md.append(f"Counting only uses in an item's main job, {sum(n >= 3 for n in heard.values())} of them are heard three or more times"
              + (f"; heard fewer: {', '.join(few)}." if few else '.'))
md.append('')
open(OUT, 'w').write('\n'.join(md))
print('wrote', os.path.relpath(OUT, HERE), f'({len(stories)} stories)')
