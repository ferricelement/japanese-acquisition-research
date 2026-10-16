#!/usr/bin/env python3
"""Build the candidate pool for the new lists from the jiten.moe drama frequency list.

Takes the most frequent dictionary words, drops what the versatility, collocation and idiom lists already
teach, tags each with its part of speech (fugashi + unidic-lite) and writes pool.json / pool.tsv.
Run with the collocations venv: ../collocations-build/.venv/bin/python pool.py [top_n]
"""
import csv, json, os, re, sys
from fugashi import Tagger

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
TOP = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
t = Tagger()

def lemmas(s):
    out = set()
    for w in t(s or ''):
        lem = re.sub(r'-.*$', '', w.feature.lemma or w.surface)
        out.update((lem, w.surface))
    return out

# What the existing lists already teach: headwords plus their component lemmas.
covered = {}
for f in ('20-list-versatile.json', '21-list-collocations.json', '22-list-idioms.json'):
    for b in json.load(open(os.path.join(ROOT, f)))['blocks']:
        for it in b['items']:
            for k in ('ja', 'kana', 'politeJa', 'nounJa', 'verbJa'):
                v = it.get(k)
                if isinstance(v, str):
                    for x in {v} | lemmas(v):
                        covered.setdefault(x, it['id'])

rows = []
with open(os.path.join(ROOT, 'versatility-build', 'jiten_freq_Drama.csv'), encoding='utf-8') as fh:
    for r in csv.DictReader(fh):
        rows.append((int(r['Rank']), r['Word'], r['Form']))
rows.sort()
seen, top = set(), []
for rk, w, fm in rows:
    if w not in seen:
        seen.add(w)
        top.append((rk, w, fm))
    if len(top) >= TOP:
        break

LAUGH = re.compile(r'^[ハフヘホアウオエイッーぁ-ぉァ-ォっ]+$|^(ハハ|フフ|ヘヘ|ホホ)')
pool, dropped = [], {}
for rk, w, fm in top:
    toks = list(t(w))
    f = toks[0].feature if toks else None
    pos = f.pos1 if f else ''
    pos2 = f.pos2 if f else ''
    multi = len(toks) > 1
    why = None
    if w in covered or fm in covered:
        why = 'covered'
    elif re.search(r'[0-9０-９]', w) or (not multi and pos == '名詞' and pos2 == '数詞'):
        why = 'number'
    elif not multi and pos in ('助詞', '助動詞', '記号', '補助記号', '接尾辞', '接頭辞'):
        why = 'grammar-token'
    elif not multi and pos2 == '固有名詞':
        why = 'name'
    elif LAUGH.match(w):
        why = 'sound'
    if why:
        dropped[why] = dropped.get(why, 0) + 1
        continue
    kind = 'expr' if multi else {'名詞': 'noun', '動詞': 'verb', '形容詞': 'adj-i', '形状詞': 'adj-na', '副詞': 'adverb',
                                 '代名詞': 'pronoun', '連体詞': 'prenominal', '接続詞': 'conjunction', '感動詞': 'interjection'}.get(pos, pos)
    if kind == 'noun' and f.pos3 == 'サ変可能':
        kind = 'noun-suru'
    pool.append({'rank': rk, 'ja': w, 'kana': fm, 'pos': kind})

json.dump({'top': TOP, 'dropped': dropped, 'pool': pool}, open(os.path.join(HERE, 'pool.json'), 'w'), ensure_ascii=False, indent=0)
with open(os.path.join(HERE, 'pool.tsv'), 'w') as fh:
    for p in pool:
        fh.write(f"{p['rank']}\t{p['ja']}\t{p['kana']}\t{p['pos']}\n")
from collections import Counter
print('top', TOP, 'pool', len(pool), 'dropped', dropped)
print(Counter(p['pos'] for p in pool).most_common())
