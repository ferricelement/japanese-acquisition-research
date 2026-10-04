"""Rule checks code can do on a script (the same rules the workflow checked), plus romaji against the kana reading."""
import math, os, re, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'collocations-build'))
from measure import romaji as kana_romaji  # noqa: E402

PUNCT = re.compile(r"[\s.,?!'\"…~〜ー\-。、？！「」『』（）()・：:;]")

def same_words(ro, kana):
    """True when romaji matches the kana reading, allowing は/へ read as wa/e."""
    a = PUNCT.sub('', ro.lower())
    b = PUNCT.sub('', kana_romaji(kana).lower())
    pat = re.escape(a).replace('e', '(?:e|he)').replace('wa', '(?:wa|ha)')
    return re.fullmatch(pat, b) is not None

def issues(s, ix, index):
    out = []
    targets = ix['targets']
    allowed = set(targets) | {t for e in index if e['n'] < ix['n'] for t in e['targets']}
    ids = {sp['id'] for sp in s['speakers']}
    for i, l in enumerate(s['lines'], 1):
        if l['speaker'] not in ids:
            out.append(f"line {i}: speaker {l['speaker']} not in speakers")
        for u in l['uses']:
            if u not in allowed:
                out.append(f"line {i}: uses {u} is not a target or an earlier collocation")
        if re.search(r'[A-ZāīūēōâîûêôÂÎÛÊÔ]', l['romaji']):
            out.append(f"line {i}: capitals or macrons in romaji")
        if not same_words(l['romaji'], l['kana']):
            out.append(f"line {i}: romaji/kana differ: {l['romaji']} | {l['kana']}")
    lo, hi = (7, 12) if s['format'] == 'monologue' else (10, 18)
    if not lo <= len(s['lines']) <= hi:
        out.append(f"{len(s['lines'])} lines for a {s['format']} ({lo}-{hi})")
    qs = s['questions']
    if not qs or qs[0]['type'] != 'gist' or sum(q['type'] == 'gist' for q in qs) != 1:
        out.append('needs exactly one gist question, first')
    for t in targets:
        heard = sum(t in l['uses'] for l in s['lines'])
        tested = sum(t in q['targets'] for q in qs if q['type'] != 'gist')
        if heard < 2:
            out.append(f"{t}: heard in {heard} line(s)")
        if tested != 1:
            out.append(f"{t}: {tested} questions")
    need = math.ceil(len(targets) / 2)
    if sum(q['type'] == 'respond' for q in qs) < need:
        out.append(f"fewer than {need} respond questions")
    for qi, q in enumerate(qs, 1):
        if q['type'] == 'respond':
            if q['choices'] or len(q['modelAnswers']) < 2:
                out.append(f"question {qi}: respond needs no choices and two model answers")
        else:
            if len(q['choices']) != 3 or q['answer'] not in {c['key'] for c in q['choices']}:
                out.append(f"question {qi}: needs 3 choices and a valid answer key")
            if q['type'] == 'heard' and not all(c.get('romaji') for c in q['choices']):
                out.append(f"question {qi}: heard choices need romaji")
        if q['romaji'] and q['kana'] and not same_words(q['romaji'], q['kana']):
            out.append(f"question {qi}: romaji/kana differ: {q['romaji']} | {q['kana']}")
    return out
