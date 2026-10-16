#!/usr/bin/env python3
"""Map corpus-tails.tsv (conj_tag.py) onto named forms and write conj-measured.json.

Each rule looks at the head (v / i / na), its conjugation form and the tail of auxiliaries after it.
Counts are approximate: the tokenizer can't tell potential from passive -rareru on ichidan verbs, and
godan potentials it lemmatizes as their own verbs (yomeru) are missed.
"""
import json, os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
LINES = 3170155


def load():
    rows = []
    for line in open(os.path.join(HERE, 'corpus-tails.tsv'), encoding='utf-8'):
        head, ctype, cform, tail, n = line.rstrip('\n').split('\t')
        toks = [t.split('/', 1) for t in tail.split()] if tail else []
        toks = [(s, l.split(':')[0], l.split(':')[1] if ':' in l else '') for s, l in toks]
        rows.append((head, ctype, cform, toks, int(n)))
    return rows


def S(toks):
    return [t[0] for t in toks]


def L(toks):
    return [t[1] for t in toks]


def starts(toks, *lemmas):
    return L(toks)[:len(lemmas)] == list(lemmas)


TE = ('て',)
RULES = {
    # verbs
    'dict': lambda h, c, f, t: h == 'v' and f in ('終止形', '連体形') and not t,
    'masu': lambda h, c, f, t: h == 'v' and starts(t, 'ます') and t[0][2] in ('終止形', '連体形') and len(t) == 1,
    'mashita': lambda h, c, f, t: h == 'v' and starts(t, 'ます', 'た') and t[0][0] == 'まし',
    'masen': lambda h, c, f, t: h == 'v' and starts(t, 'ます') and t[0][0] == 'ませ' and not starts(t, 'ます', 'ず', 'です'),
    'masen-deshita': lambda h, c, f, t: h == 'v' and starts(t, 'ます', 'ず', 'です'),
    'mashou': lambda h, c, f, t: h == 'v' and starts(t, 'ます') and t[0][0] == 'ましょう',
    'ta': lambda h, c, f, t: h == 'v' and f == '連用形' and t[:1] and t[0][1] == 'た' and t[0][0] in ('た', 'だ'),
    'te': lambda h, c, f, t: h == 'v' and f == '連用形' and len(t) == 1 and t[0][1] == 'て' and t[0][0] in ('て', 'で'),
    'nai': lambda h, c, f, t: h == 'v' and t[:1] and t[0][1] in ('ない', '無い') and t[0][2] in ('終止形', '連体形') and len(t) == 1,
    'nakatta': lambda h, c, f, t: h == 'v' and starts(t, 'ない', 'た'),
    'nakute': lambda h, c, f, t: h == 'v' and starts(t, 'ない', 'て') and t[1][0] == 'て' and len(t) == 2,
    'naide': lambda h, c, f, t: h == 'v' and starts(t, 'ない', 'て') and t[1][0] == 'で',
    'nakereba': lambda h, c, f, t: h == 'v' and t[:1] and t[0][1] == 'ない' and t[0][2] == '仮定形',
    'nakucha': lambda h, c, f, t: h == 'v' and starts(t, 'ない', 'て') and t[1][0] in ('ちゃ', 'ては'),
    'teru': lambda h, c, f, t: h == 'v' and (starts(t, 'てる') or starts(t, 'て', '居る') or starts(t, 'て', 'いる')),
    'tai': lambda h, c, f, t: h == 'v' and starts(t, 'たい'),
    'vol': lambda h, c, f, t: h == 'v' and f == '意志推量形',
    'tara': lambda h, c, f, t: h == 'v' and t[:1] and t[0][1] == 'た' and t[0][0] in ('たら', 'だら'),
    'ba': lambda h, c, f, t: h == 'v' and f == '仮定形' and starts(t, 'ば'),
    'pot': lambda h, c, f, t: h == 'v' and (f == '可能' or c.startswith('サ行変格') and False),
    'pas-rareru': lambda h, c, f, t: h == 'v' and t[:1] and t[0][1] in ('れる', 'られる'),
    'cau': lambda h, c, f, t: h == 'v' and t[:1] and t[0][1] in ('せる', 'させる') and not (len(t) > 1 and t[1][1] in ('れる', 'られる')),
    'cp': lambda h, c, f, t: h == 'v' and t[:2] and len(t) > 1 and t[0][1] in ('せる', 'させる') and t[1][1] in ('れる', 'られる'),
    'imp': lambda h, c, f, t: h == 'v' and f == '命令形' and not any(x in c for x in ('下さる', '為さる', '呉れる')),
    'na': lambda h, c, f, t: h == 'v' and f == '終止形' and t[:1] and t[0][0] == 'な' and len(t) == 1,
    'nasai': lambda h, c, f, t: h == 'v' and starts(t, '為さる'),
    'te-kudasai': lambda h, c, f, t: h == 'v' and starts(t, 'て', '下さる'),
    'te-kure': lambda h, c, f, t: h == 'v' and starts(t, 'て', '呉れる') and t[1][2] == '命令形',
    'te-kureru': lambda h, c, f, t: h == 'v' and starts(t, 'て', '呉れる') and t[1][2] != '命令形',
    'te-morau': lambda h, c, f, t: h == 'v' and starts(t, 'て', '貰う'),
    'te-ageru': lambda h, c, f, t: h == 'v' and starts(t, 'て', '上げる'),
    'chau': lambda h, c, f, t: h == 'v' and (starts(t, 'ちゃう') or starts(t, 'じゃう') or starts(t, 'て', '仕舞う')),
    'toku': lambda h, c, f, t: h == 'v' and (starts(t, 'て', '置く') or starts(t, 'とく') or starts(t, 'どく')),
    'te-miru': lambda h, c, f, t: h == 'v' and starts(t, 'て', '見る'),
    'te-kuru': lambda h, c, f, t: h == 'v' and starts(t, 'て', '来る'),
    'te-iku': lambda h, c, f, t: h == 'v' and starts(t, 'て', '行く'),
    'te-mo': lambda h, c, f, t: h == 'v' and starts(t, 'て', 'も') and not (len(t) > 2 and t[2][1] == '良い'),
    'te-mo-ii': lambda h, c, f, t: h == 'v' and starts(t, 'て', 'も', '良い'),
    'cha': lambda h, c, f, t: h == 'v' and t[:1] and t[0][1] == 'て' and t[0][0] in ('ちゃ', 'じゃ', 'ては', 'では'),
    'tari': lambda h, c, f, t: h == 'v' and t[:1] and t[0][0] in ('たり', 'だり'),
    'nagara': lambda h, c, f, t: h == 'v' and starts(t, 'ながら'),
    'sou': lambda h, c, f, t: h == 'v' and t[:1] and t[0][0] == 'そう',
    'sugiru': lambda h, c, f, t: h == 'v' and starts(t, '過ぎる'),
    'yasui-nikui': lambda h, c, f, t: h == 'v' and t[:1] and t[0][1] in ('易い', '難い'),
    'zu': lambda h, c, f, t: h == 'v' and t[:1] and t[0][1] == 'ず' and t[0][0] in ('ず', 'ずに'),
    'te-hoshii': lambda h, c, f, t: h == 'v' and starts(t, 'て', '欲しい'),
    # i-adjectives (ii counted with them)
    'i-plain': lambda h, c, f, t: h == 'i' and f in ('終止形', '連体形') and not t,
    'i-katta': lambda h, c, f, t: h == 'i' and f == '連用形' and t[:1] and t[0][1] == 'た' and t[0][0] == 'た',
    'i-kunai': lambda h, c, f, t: h == 'i' and f == '連用形' and t[:1] and t[0][1] in ('無い', 'ない') and len(t) == 1,
    'i-kunakatta': lambda h, c, f, t: h == 'i' and t[:2] and len(t) > 1 and t[0][1] in ('無い', 'ない') and t[1][1] == 'た',
    'i-kute': lambda h, c, f, t: h == 'i' and f == '連用形' and starts(t, 'て'),
    'i-ku': lambda h, c, f, t: h == 'i' and f == '連用形' and not t,
    'i-kereba': lambda h, c, f, t: h == 'i' and f == '仮定形',
    'i-kattara': lambda h, c, f, t: h == 'i' and t[:1] and t[0][0] == 'たら',
    'i-sou': lambda h, c, f, t: h == 'i' and t[:1] and t[0][0] == 'そう',
    'i-sugiru': lambda h, c, f, t: h == 'i' and starts(t, '過ぎる'),
    # na-adjectives + copula
    'na-na': lambda h, c, f, t: h == 'na' and t[:1] and t[0][0] == 'な' and t[0][1] == 'だ',
    'na-ni': lambda h, c, f, t: h == 'na' and t[:1] and t[0][0] == 'に',
    'na-da': lambda h, c, f, t: h == 'na' and t[:1] and t[0][0] == 'だ' and len(t) == 1,
    'na-desu': lambda h, c, f, t: h == 'na' and t[:1] and t[0][0] == 'です',
    'na-datta': lambda h, c, f, t: h == 'na' and t[:2] and t[0][0] == 'だっ',
    'na-ja-nai': lambda h, c, f, t: h == 'na' and t[:2] and len(t) > 1 and t[0][0] in ('じゃ', 'では') and t[1][1] in ('無い', 'ない'),
    'na-de': lambda h, c, f, t: h == 'na' and t[:1] and t[0][0] == 'で' and len(t) == 1,
    'na-nara': lambda h, c, f, t: h == 'na' and t[:1] and t[0][0] == 'なら',
}
GROUPS = {'teru': 'te-iru'}


def main():
    rows = load()
    totals = Counter()
    counts = Counter()
    for h, c, f, t, n in rows:
        totals[h] += n
        for key, rule in RULES.items():
            try:
                if rule(h, c, f, t):
                    counts[key] += n
            except IndexError:
                pass
    out = {}
    for key in RULES:
        h = 'i' if key.startswith('i-') else 'na' if key.startswith('na-') else 'v'
        n = counts[key]
        # zero means the tokenizer can't see the form (potential verbs, -yasui), not that nobody says it
        out[key] = {'count': n, 'perMillion': round(n / LINES * 1e6, 1), 'shareOfHeads': round(n / totals[h], 4)} if n else None
    json.dump({'lines': LINES, 'heads': dict(totals), 'forms': out}, open(os.path.join(HERE, 'conj-measured.json'), 'w'), ensure_ascii=False, indent=1)
    for k, v in sorted(out.items(), key=lambda kv: -(kv[1] or {'count': 0})['count']):
        print(f"{k:16} {v and v['count']}  {v and v['shareOfHeads']}")


if __name__ == '__main__':
    main()
