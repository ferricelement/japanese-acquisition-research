#!/usr/bin/env python3
"""How much of the drama frequency list the lists teach: for the top N dictionary words, the share whose form appears
as a headword (or a part of one) in the old lists alone and with the round-7 lists. Grammar tokens, names, numbers and
laughs count as not taught, so the ceiling is below 100%.
Run with the collocations venv: ../collocations-build/.venv/bin/python coverage.py"""
import csv, json, os, re
from fugashi import Tagger

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
t = Tagger()


def forms(files):
    out = set()
    for f in files:
        for b in json.load(open(os.path.join(ROOT, f)))['blocks']:
            for it in b['items']:
                for k in ('ja', 'kana', 'politeJa', 'nounJa', 'verbJa'):
                    v = (it.get(k) or '').lstrip('〜')
                    if v:
                        out.add(v)
                        out.update(re.sub(r'-.*$', '', w.feature.lemma or w.surface) for w in t(v))
                        out.update(w.surface for w in t(v))
    return out


OLD = ['20-list-versatile.json', '21-list-collocations.json', '22-list-idioms.json']
NEW = ['23-list-core.json', '24-list-sets.json', '25-list-phrases.json', '26-list-conjugations.json']
old, both = forms(OLD), forms(OLD + NEW)
rows, seen = [], set()
with open(os.path.join(ROOT, 'versatility-build', 'jiten_freq_Drama.csv'), encoding='utf-8') as fh:
    for r in sorted(csv.DictReader(fh), key=lambda r: int(r['Rank'])):
        if r['Word'] not in seen:
            seen.add(r['Word'])
            rows.append((r['Word'], r['Form']))
for n in (500, 1000, 2000, 3000, 5000):
    a = sum(1 for w, k in rows[:n] if w in old or k in old)
    b = sum(1 for w, k in rows[:n] if w in both or k in both)
    print(f'top {n}: {a / n:.0%} -> {b / n:.0%}')
