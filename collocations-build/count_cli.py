#!/usr/bin/env python3
"""Count candidates in the subtitle corpus from the command line (for workflow agents).

  python3 count_cli.py pair <noun_romaji> <verb_romaji> [nounJa] [verbJa]   noun + verb pair on dictionary forms
  python3 count_cli.py phrase <form> [<form> ...]                            written forms (kanji/kana, verb stems)
Prints JSON. A pair count catches inflections and dropped particles; a phrase count is literal text matches.
"""
import gzip, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

def main(argv):
    if argv[:1] == ['pair'] and len(argv) >= 3:
        from measure import load, lookup
        noun, verb = argv[1], argv[2]
        m = lookup(load(), noun, verb, argv[3] if len(argv) > 3 else '', argv[4] if len(argv) > 4 else '')
        print(json.dumps(m, ensure_ascii=False))
    elif argv[:1] == ['phrase'] and len(argv) >= 2:
        forms = sorted({f for f in argv[1:] if len(f) >= 2}, key=len, reverse=True)
        with gzip.open(os.path.join(HERE, 'corpus', 'ja.txt.gz'), 'rt', encoding='utf-8') as fh:
            text = fh.read()
        n = len(re.findall('|'.join(map(re.escape, forms)), text)) if forms else 0
        print(json.dumps({'count': n, 'perMillion': round(n / 3170155 * 1e6, 2), 'forms': forms}, ensure_ascii=False))
    else:
        sys.exit(__doc__)

if __name__ == '__main__':
    main(sys.argv[1:])
