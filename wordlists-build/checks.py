#!/usr/bin/env python3
"""Free checks over the four new lists before any reviewer sees them; writes flags.json {id: [problems]}.

- headword and polite romaji spell their kana (particles allowed either way)
- each example's romaji matches the tokenizer's reading of its ja (fuzzy: readings of kanji vary)
- polite example present when the entry has a polite form; required text not empty
- chunk sizes 3-6; the same written word twice across the new lists or already in the old ones
Run with the collocations venv: ../collocations-build/.venv/bin/python checks.py
"""
import difflib, json, os, re
from collections import defaultdict
from fugashi import Tagger
from romaji import compare, kana_to_romaji, to_hira

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
FILES = ['23-list-core.json', '24-list-sets.json', '25-list-phrases.json', '26-list-conjugations.json']
t = Tagger()


# Kanji the tokenizer reads one way where speech usually says another (asu for 明日, nanaji for 七時).
READ = {'明日': 'あした', '七時': 'しちじ', '二十歳': 'はたち', '一回': 'いっかい', '何時': 'なんじ', '一人': 'ひとり', '二人': 'ふたり',
        'お父さん': 'おとうさん', 'お母さん': 'おかあさん', '今日': 'きょう', '昨日': 'きのう', '後で': 'あとで', '上手': 'じょうず',
        '下手': 'へた', '大人': 'おとな', '今年': 'ことし', '今朝': 'けさ', '一緒': 'いっしょ', '何人': 'なんにん', '九時': 'くじ',
        '四時': 'よじ', '何度': 'なんど', '何年': 'なんねん', '何回': 'なんかい', '何か': 'なにか', '何で': 'なんで'}


def reading(ja):
    for k, v in READ.items():
        ja = ja.replace(k, v)
    out = []
    for w in t(ja):
        k = getattr(w.feature, 'pron', None) or getattr(w.feature, 'kana', None)
        # the pronunciation field writes long vowels with ー; the kana field keeps the spelling (kirei, not kiree)
        k = getattr(w.feature, 'kana', None) or k
        out.append(to_hira(k) if k and k != '*' else to_hira(w.surface))
    return ' '.join(out)


def norm(r):
    r = r.lower().replace("'", '')
    r = re.sub(r'[^a-z]', '', r)
    return r.replace('wa', 'ha').replace('wo', 'o').replace('e', 'e')


def ratio(romaji, ja):
    a = norm(romaji)
    b = norm(''.join(kana_to_romaji(p) for p in reading(ja).split()))
    return difflib.SequenceMatcher(None, a, b).ratio(), b


old = set()
for f in ('20-list-versatile.json', '21-list-collocations.json', '22-list-idioms.json'):
    for b in json.load(open(os.path.join(ROOT, f)))['blocks']:
        for it in b['items']:
            old.add(it['ja'])

flags = defaultdict(list)
seen = defaultdict(list)
same_ro = defaultdict(list)
for f in FILES:
    d = json.load(open(os.path.join(ROOT, f)))
    for b in d['blocks']:
        if not 3 <= len(b['items']) <= 6 and not f.startswith('26'):
            flags[b['items'][0]['id']].append(f'chunk "{b["label"]}" has {len(b["items"])} items')
        for it in b['items']:
            iid = it['id']
            for k in ('english', 'romaji', 'ja'):
                if not (it.get(k) or '').strip():
                    flags[iid].append(f'empty {k}')
            if not f.startswith('26'):
                if it.get('kana') and not compare(it['romaji'].lstrip('-'), it['kana'].lstrip('〜')):
                    flags[iid].append(f"headword romaji '{it['romaji']}' vs kana {it['kana']} ({kana_to_romaji(it['kana'])})")
                seen[it['ja']].append(iid)
                same_ro[re.sub(r'[^a-z]', '', it['romaji'].lower())].append(iid)
                if it['ja'] in old and not f.startswith('24'):
                    flags[iid].append(f"{it['ja']} is already taught by an older list")
            if it.get('polite') and not it.get('examplePolite'):
                flags[iid].append('has a polite form but no polite example')
            for label in ('example', 'examplePolite'):
                ex = it.get(label)
                if not ex:
                    continue
                r, heard = ratio(ex['romaji'], ex['ja'])
                if r < 0.84:
                    flags[iid].append(f"{label} romaji may not match its ja (tokenizer reads '{heard}', {r:.2f})")
for ja, ids in seen.items():
    if len(ids) > 1:
        for iid in ids:
            flags[iid].append(f'{ja} also appears as {", ".join(x for x in ids if x != iid)}')

for ro, ids in same_ro.items():
    if len(ids) > 1 and len({i[0] for i in ids}) == 1:
        for iid in ids:
            flags[iid].append(f'same romaji as {", ".join(x for x in ids if x != iid)} (one may be a duplicate)')

json.dump(flags, open(os.path.join(HERE, 'flags.json'), 'w'), ensure_ascii=False, indent=1)
n = sum(len(v) for v in flags.values())
print(f'{len(flags)} items flagged, {n} problems')
kinds = defaultdict(int)
for v in flags.values():
    for p in v:
        kinds[p.split(' ')[0] + ' ' + p.split(' ')[1]] += 1
print(dict(sorted(kinds.items(), key=lambda kv: -kv[1])[:12]))
