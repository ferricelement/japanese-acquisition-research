#!/usr/bin/env python3
"""Tag the subtitle corpus once and count what follows every verb, adjective and copula.

For each head (verb / i-adjective / na-adjective + copula / noun + copula) the "tail" is the run of auxiliaries,
conjunctive particles and helper verbs after it (up to 4 tokens), written as lemma:cForm. conj_forms.py maps
tails to named forms, so the corpus is tagged only once. Writes corpus-tails.tsv (head class, head cForm, tail, count).
Run: ../collocations-build/.venv/bin/python conj_tag.py
"""
import gzip, os
from collections import Counter
from multiprocessing import Pool

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'collocations-build', 'corpus', 'ja.txt.gz')
OUT = os.path.join(HERE, 'corpus-tails.tsv')
HELPERS = {'いる', '居る', 'しまう', '仕舞う', 'ちゃう', 'じゃう', 'おく', '置く', 'とく', 'どく', 'みる', '見る', 'くる', '来る',
           'いく', '行く', 'くれる', '呉れる', 'もらう', '貰う', 'あげる', '上げる', 'ある', '有る', 'くださる', '下さる',
           'なさる', '為さる', 'すぎる', '過ぎる', 'やすい', '易い', 'にくい', '難い', 'ほしい', '欲しい', 'できる', '出来る',
           'なる', '成る', 'いい', '良い'}
# heads whose own forms are counted apart: the irregulars and the request verbs
NAMED = {'来る', '為る', '行く', '有る', '居る', '下さる', '為さる', '呉れる', '良い', 'ない', '無い'}
E_ROW = set('えけげせぜてでねへべぺめれ')
TAIL_POS = {'助動詞'}
TAIL_PART = {'て', 'で', 'ば', 'ちゃ', 'じゃ', 'たり', 'だり', 'ながら', 'ても', 'でも', 'と', 'な'}
tagger = None

def lem(f, surface):
    return (f.lemma or surface).split('-')[0]

def tails(line):
    global tagger
    if tagger is None:
        import fugashi
        tagger = fugashi.Tagger()
    toks = [(w.surface, w.feature) for w in tagger(line)]
    out = []
    n = len(toks)
    for i, (s, f) in enumerate(toks):
        if f.pos1 == '動詞' and f.pos2 != '非自立可能':
            head = 'v'
        elif f.pos1 == '動詞':
            # helper verbs only count as heads when nothing verbal precedes them (iru, aru, suru on their own)
            prev = toks[i - 1][1] if i else None
            if prev and (prev.pos1 in ('動詞', '助動詞') or (prev.pos1 == '助詞' and toks[i - 1][0] in TAIL_PART)):
                continue
            head = 'v'
        elif f.pos1 == '形容詞':
            prev = toks[i - 1][0] if i else ''
            if f.pos2 == '非自立可能' and prev in ('て', 'で', 'も'):
                continue
            head = 'i'
        elif f.pos1 == '形状詞':
            head = 'na'
        else:
            continue
        tail = []
        j = i + 1
        while j < n and len(tail) < 4:
            ts, tf = toks[j]
            l = lem(tf, ts)
            after_te = bool(tail) and tail[-1].split('/')[0] in ('て', 'で')
            if tf.pos1 in TAIL_POS or (tf.pos1 == '助詞' and ts in TAIL_PART and tf.pos2 in ('接続助詞', '副助詞', '終助詞')) \
                    or (after_te and ts == 'も') \
                    or (tf.pos1 in ('動詞', '形容詞') and tf.pos2 == '非自立可能' and l in HELPERS) \
                    or (tf.pos1 == '形容詞' and l in ('ない', '無い')) \
                    or (not tail and ts == 'そう' and tf.pos1 == '形状詞'):
                tail.append(f"{ts}/{l}:{(tf.cForm or '-').split('-')[0]}")
                j += 1
            else:
                break
        if head == 'na' and not tail:
            continue
        cform = (f.cForm or '-').split('-')[0]
        # godan potential (読める) comes back as 読む with an e-row stem
        if head == 'v' and (f.cType or '').startswith('五段') and s[-1:] in E_ROW and cform in ('未然形', '連用形'):
            cform = '可能'
        ctype = f.cType.split('-')[0] if f.cType else '-'
        if lem(f, s) in NAMED:
            ctype += ':' + lem(f, s)
        out.append((head, ctype, cform, ' '.join(tail)))
    return out

def work(lines):
    c = Counter()
    for line in lines:
        for k in tails(line):
            c[k] += 1
    return c

def chunks(size=20000):
    buf = []
    with gzip.open(SRC, 'rt', encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if line:
                buf.append(line)
            if len(buf) >= size:
                yield buf
                buf = []
    if buf:
        yield buf

if __name__ == '__main__':
    total = Counter()
    with Pool(max(2, os.cpu_count() - 2)) as p:
        for c in p.imap_unordered(work, chunks()):
            total.update(c)
    with open(OUT, 'w') as fh:
        for (head, ctype, cform, tail), n in total.most_common():
            if n >= 3:
                fh.write(f'{head}\t{ctype}\t{cform}\t{tail}\t{n}\n')
    print('signatures', len(total), '->', OUT)
