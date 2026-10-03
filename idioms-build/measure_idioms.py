#!/usr/bin/env python3
"""Attach subtitle-corpus counts to every idiom candidate (harvest.json -> candidates.json, candidates.tsv).

Noun + particle + verb idioms are counted from the tokenized pairs (any inflection, particle dropped or not);
everything else, and a cross-check for the rest, from the written forms in `surface` (phrase_count.py).
The corpus and both counters live in ../collocations-build.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CB = os.path.join(HERE, '..', 'collocations-build')
sys.path.insert(0, CB)
from measure import load, lookup

h = json.load(open(os.path.join(HERE, 'harvest.json')))
pool = h['pool']
tmp_in, tmp_out = os.path.join(HERE, '.phrases-in.json'), os.path.join(HERE, '.phrases-out.json')
json.dump([{'id': c['id'], 'surface': c.get('surface') or []} for c in pool], open(tmp_in, 'w'), ensure_ascii=False)
subprocess.run([sys.executable, os.path.join(CB, 'phrase_count.py'), tmp_in, tmp_out], check=True)
phrase = json.load(open(tmp_out))
os.remove(tmp_in), os.remove(tmp_out)

idx = load()
for c in pool:
    pair = lookup(idx, c['noun'], c['verb'], c.get('nounJa') or '', c.get('verbJa') or '') if c.get('noun') and c.get('verb') else None
    ph = phrase.get(c['id'])
    pc = ph['count'] if ph else 0
    # The pair count catches inflections and dropped particles, but a noun + verb pair can be mostly other uses
    # (ii ki ni naru shares ki + naru with ki ni naru). Trust it only when the written forms account for at least
    # half of it; then take the larger count. Otherwise the written forms are the measure.
    if pair and pc >= 0.5 * pair['count']:
        n = max(pair['count'], pc)
        c['measured'] = {'count': n, 'perMillion': round(pair['perMillion'] * n / pair['count'], 2), 'shareN': pair['shareN'],
                         'source': 'pairs', 'pairCount': pair['count'], 'phraseCount': pc}
    elif ph and pc:
        c['measured'] = {'count': pc, 'perMillion': ph['perMillion'], 'source': 'phrase', 'pairCount': pair['count'] if pair else None}
    else:
        c['measured'] = None
pool.sort(key=lambda c: -((c['measured'] or {}).get('count') or 0))
json.dump(pool, open(os.path.join(HERE, 'candidates.json'), 'w'), ensure_ascii=False, indent=1)
with open(os.path.join(HERE, 'candidates.tsv'), 'w') as fh:
    fh.write('id\tcategory\tromaji\tenglish\tliteral\tenglish_idiom\tcount\tper_million\ttypical\tsource\tpair_count\tjudged_commonness\tflags\n')
    for c in pool:
        m = c['measured'] or {}
        fh.write('\t'.join(str(x) for x in (c['id'], c['category'], c['romaji'], c['english'], c['literal'], c.get('englishIdiom') or '',
                                             m.get('count', 0), m.get('perMillion', 0), m.get('shareN', ''), m.get('source', ''),
                                             m.get('pairCount', ''), c['commonness'], ','.join(c.get('flags') or []))) + '\n')
print(f"{len(pool)} candidates; {sum(1 for c in pool if c['measured'])} with counts "
      f"({sum(1 for c in pool if (c['measured'] or {}).get('source') == 'pairs')} from pairs)")
