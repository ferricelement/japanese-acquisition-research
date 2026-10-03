#!/usr/bin/env python3
"""Count written forms of fixed phrases in the subtitle corpus (corpus/ja.txt.gz).

Usage: python3 phrase_count.py in.json out.json
in.json: [{"id": ..., "surface": ["朝飯前", "あさめしまえ"]}, ...] — literal strings; a verb idiom gives its stem
("手を貸", "手貸") so every inflection counts. Each id's count is the number of matches of any of its forms.
"""
import gzip, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'corpus', 'ja.txt.gz')

def main(src, dst):
    cands = json.load(open(src))
    with gzip.open(SRC, 'rt', encoding='utf-8') as fh:
        text = fh.read()
    lines = text.count('\n')
    out = {}
    for c in cands:
        forms = sorted({s for s in c.get('surface') or [] if s and len(s) >= 2}, key=len, reverse=True)
        if not forms:
            out[c['id']] = None
            continue
        n = len(re.findall('|'.join(map(re.escape, forms)), text))
        out[c['id']] = {'count': n, 'perMillion': round(n / lines * 1e6, 2), 'forms': forms}
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=1)
    print(f'{len(cands)} phrases counted over {lines:,} lines -> {dst}')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
