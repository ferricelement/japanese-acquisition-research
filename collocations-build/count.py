#!/usr/bin/env python3
"""Count noun + verb/adjective pairings in the OpenSubtitles Japanese corpus (corpus/ja.txt.gz).

Patterns, on dictionary forms from fugashi + unidic-lite:
  noun [particle] [one adverb] verb-or-adjective   (ame ga furu, kaze hiita, se ga takai, onaka ga ippai)
  adjective noun                                   (koi koohii, tsuyoi ame)
Writes corpus/pairs.tsv (pairs seen 3+ times) with how often each pair occurs and how typical it is:
share_n = this verb's share of everything said with the noun, share_v = the noun's share of the verb's nouns.
Run with the venv: .venv/bin/python count.py
"""
import gzip, math, os, sys
from collections import Counter, defaultdict
from multiprocessing import Pool

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'corpus', 'ja.txt.gz')
OUT = os.path.join(HERE, 'corpus', 'pairs.tsv')
PARTICLES = {'が', 'を', 'に', 'で', 'と', 'へ', 'は', 'も', 'から', 'まで'}
PREFIXES = {'御': 'オ'}  # お風呂, お茶; ご is rare in these pairings

tagger = None

def lemma(f):
    return f.lemma.split('-')[0] if f.lemma else ''

def kana_of(f):
    return f.lForm or ''

def pairs_in(line):
    global tagger
    if tagger is None:
        import fugashi
        tagger = fugashi.Tagger()
    toks = [(w.surface, w.feature) for w in tagger(line)]
    out = []
    n = len(toks)
    for i, (_, f) in enumerate(toks):
        pos1, pos2 = f.pos1, f.pos2
        # adjective + noun (attributive): koi koohii
        if pos1 == '形容詞' and (f.cForm or '').startswith('連体形') and i + 1 < n:
            g = toks[i + 1][1]
            if g.pos1 == '名詞' and g.pos2 in ('普通名詞',):
                out.append((kana_of(g), lemma(g), 'ADJ', kana_of(f), lemma(f), '形容詞'))
        if pos1 != '名詞' or pos2 not in ('普通名詞',):
            continue
        # only the last noun of a compound (天気予報 -> 予報)
        if i + 1 < n and toks[i + 1][1].pos1 == '名詞':
            continue
        nk, nl = kana_of(f), lemma(f)
        if i > 0 and toks[i - 1][1].pos1 == '接頭辞' and lemma(toks[i - 1][1]) in PREFIXES:
            nk, nl = PREFIXES[lemma(toks[i - 1][1])] + nk, 'お' + nl
        j = i + 1
        part = '∅'
        if j < n and toks[j][1].pos1 == '助詞' and toks[j][0] in PARTICLES:
            part = toks[j][0]
            j += 1
        if j < n and toks[j][1].pos1 == '副詞':
            j += 1
        if j < n and toks[j][1].pos1 in ('動詞', '形容詞', '形状詞'):
            g = toks[j][1]
            # bare noun + suru is a suru verb (benkyou suru), counted but marked by the particle slot
            out.append((nk, nl, part, kana_of(g), lemma(g), g.pos1 + ('/サ変' if part == '∅' and f.pos3 == 'サ変可能' else '')))
    return out

def work(lines):
    c = Counter()
    for line in lines:
        for nk, nl, part, vk, vl, vpos in pairs_in(line):
            c[(nk, nl, vk, vl, vpos, part)] += 1
    return c, len(lines)

def chunks(path, size=20000):
    buf = []
    with gzip.open(path, 'rt', encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if line:
                buf.append(line)
            if len(buf) >= size:
                yield buf
                buf = []
    if buf:
        yield buf

def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    total = Counter()
    lines = 0
    src = chunks(SRC)
    with Pool(max(1, (os.cpu_count() or 4) - 2)) as pool:
        for k, (c, m) in enumerate(pool.imap_unordered(work, src)):
            total.update(c)
            lines += m
            if k % 20 == 0:
                print(f'{lines:,} lines', file=sys.stderr)
            if limit and lines >= limit:
                pool.terminate()
                break
    # Fold particles into one pair key, keeping the particle mix.
    pair = Counter()
    parts = defaultdict(Counter)
    for (nk, nl, vk, vl, vpos, part), cnt in total.items():
        key = (nk, nl, vk, vl, vpos.split('/')[0])
        pair[key] += cnt
        parts[key][part + ('/サ変' if vpos.endswith('サ変') else '')] += cnt
    n_tot, v_tot = Counter(), Counter()
    for (nk, nl, vk, vl, vpos), cnt in pair.items():
        n_tot[(nk, nl)] += cnt
        v_tot[(vk, vl, vpos)] += cnt
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('noun_kana\tnoun\tverb_kana\tverb\tpos\tcount\tper_million\tshare_n\tshare_v\tlog_dice\tnoun_total\tverb_total\tparticles\n')
        for (nk, nl, vk, vl, vpos), cnt in sorted(pair.items(), key=lambda x: -x[1]):
            if cnt < 3:
                continue
            nt, vt = n_tot[(nk, nl)], v_tot[(vk, vl, vpos)]
            dice = 14 + math.log2(2 * cnt / (nt + vt))
            pm = ' '.join(f'{p}:{c}' for p, c in parts[(nk, nl, vk, vl, vpos)].most_common(4))
            fh.write(f'{nk}\t{nl}\t{vk}\t{vl}\t{vpos}\t{cnt}\t{cnt / lines * 1e6:.2f}\t{cnt / nt:.4f}\t{cnt / vt:.4f}\t{dice:.2f}\t{nt}\t{vt}\t{pm}\n')
    print(f'{lines:,} lines; {len(pair):,} distinct pairs; wrote {OUT}', file=sys.stderr)

if __name__ == '__main__':
    main()
