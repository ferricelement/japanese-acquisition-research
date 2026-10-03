#!/usr/bin/env python3
"""Shared helpers: load corpus/pairs.tsv and look up a collocation's measured counts by its romaji parts."""
import csv, math, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
PAIRS = os.path.join(HERE, 'corpus', 'pairs.tsv')

H = dict(zip('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゔ',
             'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa o n ga gi gu ge go za ji zu ze zo da ji zu de do ba bi bu be bo pa pi pu pe po vu'.split()))
YOON = {'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo'}
SMALL = {'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o'}

def romaji(kana):
    """Kana (either script) to the list's romaji: no macrons, long vowels spelled out, っ before ch = t."""
    s = ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in kana)
    out, i = '', 0
    while i < len(s):
        c = s[i]
        if c == 'っ':
            nxt = romaji(s[i + 1:i + 3]) if i + 1 < len(s) else ''
            out += 't' if nxt.startswith('ch') else nxt[:1]
        elif c == 'ー':
            out += out[-1] if out else ''
        elif c in H and i + 1 < len(s) and s[i + 1] in YOON:
            base = H[c][:-1]
            out += base + (YOON[s[i + 1]][1:] if base in ('sh', 'ch', 'j') else YOON[s[i + 1]])
            i += 1
        elif c in H and i + 1 < len(s) and s[i + 1] in SMALL:
            out += H[c][:-1] + SMALL[s[i + 1]]
            i += 1
        elif c in H:
            out += H[c]
        else:
            out += c
        i += 1
    return out

def load():
    """{noun_romaji: [row, ...], ('lemma', 家): [row, ...]} — every pair row for a noun, whatever its verb."""
    idx = {}
    with open(PAIRS, encoding='utf-8') as fh:
        for r in csv.DictReader(fh, delimiter='\t'):
            for k in ('count', 'noun_total', 'verb_total'):
                r[k] = int(r[k])
            for k in ('per_million', 'share_n', 'share_v', 'log_dice'):
                r[k] = float(r[k])
            r['verb_romaji'] = romaji(r['verb_kana'])
            idx.setdefault(romaji(r['noun_kana']), []).append(r)
            # Also by the written noun: the tokenizer reads 家 as ie, so uchi ni kaeru is found through 家.
            idx.setdefault(('lemma', r['noun']), []).append(r)
    return idx

KANJI = re.compile(r'[\u4e00-\u9fff]')

# The dictionary files ii under yoi (良い).
VERB_ALIASES = {'ii': 'yoi'}

def lookup(idx, noun, verb, noun_ja='', verb_ja=''):
    """Measured counts for a collocation's parts, or None.
    The tokenizer guesses kanji readings (開く as hiraku, 空く as suku or aku), so a row matches on the verb's
    reading or on its written dictionary form, and every reading of the same verb is added together.
    Homophone nouns (kaze 風 / 風邪) are told apart by the item's kanji. A compound noun is counted by its last word."""
    n = noun.split()[-1].replace('-', '')
    v = VERB_ALIASES.get(verb, verb)
    nk = ''.join(KANJI.findall(noun_ja))[-2:]
    rows = [r for r in idx.get(n, []) if not nk or nk in r['noun'] or not KANJI.search(r['noun'])]
    if noun_ja and KANJI.search(noun_ja):
        rows += [r for r in idx.get(('lemma', noun_ja), []) if r not in rows]
    hits = [r for r in rows if r['verb_romaji'] == v or (verb_ja and KANJI.search(verb_ja) and r['verb'] == verb_ja)]
    if not hits:
        return None
    # Keep the verb whose readings add up to the most; a different verb with the same reading (聞く/効く) is left out.
    by_lemma = {}
    for r in hits:
        by_lemma.setdefault(r['verb'], []).append(r)
    if verb_ja and verb_ja in by_lemma:
        lemma_ = verb_ja
    else:
        lemma_ = max(by_lemma, key=lambda k: sum(r['count'] for r in by_lemma[k]))
    # Every reading the tokenizer gave that verb (お腹が空く is split between suku and aku).
    group = [r for r in rows if r['verb'] == lemma_]
    count = sum(r['count'] for r in group)
    top = max(group, key=lambda r: r['count'])
    # The noun's total over every reading counted (家 as ie and as uchi are separate rows).
    nt = sum({(r['noun_kana'], r['noun']): r['noun_total'] for r in rows}.values())
    vt = sum(r['verb_total'] for r in group)
    return {
        'count': count,
        'perMillion': round(top['per_million'] * count / top['count'], 2),
        'shareN': round(count / nt, 4),
        'shareV': round(count / vt, 4),
        'logDice': round(14 + math.log2(2 * count / (nt + vt)), 2),
        'nounTotal': nt,
        'particles': top['particles'],
        'lemma': f"{top['noun']}+{top['verb']}",
    }
