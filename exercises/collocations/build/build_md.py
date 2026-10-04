#!/usr/bin/env python3
"""Render ../collocation-scripts.json (written by merge.py) as one Markdown file per stage: ../stage-<n>.md.
Order per script: what it teaches, audio script (for TTS), questions, new words, then answers and transcript."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(HERE, '..', 'collocation-scripts.json')))
scripts, INTRO = data['scripts'], data['intro']

for stage in sorted({s['stage'] for s in scripts}):
    md = [f'# Collocation listening scripts: Stage {stage}', '', INTRO, '']
    for s in [x for x in scripts if x['stage'] == stage]:
        names = {sp['id']: sp['name'] for sp in s['speakers']}
        md += [f"## {s['n']}. {s['title']}", '',
               f"*{s['label']} · {s['register'].capitalize()} {s['format']} · {len(s['lines'])} lines · {', '.join(names.values())}*", '',
               s['setting'], '',
               '**Collocations:** ' + '; '.join(f"*{t['romaji']}* ({t['english']})" for t in s['targets']) + '.',
               '']
        if s['review']:
            md += ['**Review:** ' + '; '.join(f"*{r['romaji']}* ({r['english']})" for r in s['review']) + '.', '']
        md += ['### Audio script', '', '| Speaker | Voice |', '|---|---|',
               *[f"| {sp['name']} | {sp['voice']} |" for sp in s['speakers']], '',
               '| # | Speaker | Japanese | Kana (if the voice misreads a kanji) |', '|---|---|---|---|',
               *[f"| {i} | {names.get(l['speaker'], l['speaker'])} | {l['ja']} | {l['kana']} |" for i, l in enumerate(s['lines'], 1)], '',
               '### Questions', '']
        for i, q in enumerate(s['questions'], 1):
            tag = ' *(say it)*' if q['type'] == 'respond' else ''
            md += [f"{i}. **{q['english']}**{tag}  ", f"   {q['romaji']} ({q['ja']})"]
            for c in q['choices']:
                md.append(f"   - {c['key']}. *{c['romaji']}* ({c['english']})" if c.get('romaji') else f"   - {c['key']}. {c['english']}")
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
    path = os.path.join(HERE, '..', f'stage-{stage}.md')
    open(path, 'w').write('\n'.join(md))
    print('wrote', os.path.relpath(path, HERE), f"({sum(1 for x in scripts if x['stage'] == stage)} scripts)")
