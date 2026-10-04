#!/usr/bin/env python3
"""Rebuild workflow results from a run's journal.jsonl when the run didn't finish (or the session ended).

  python3 recover.py <journal.jsonl> <out.json>   then: python3 merge.py <out.json>

Per chunk it takes the latest script (write:n or fix:n...) and the recheck that followed it, if any.
A script whose last fix was never rechecked is kept, marked as unchecked."""
import json, sys

journal, out = sys.argv[1], sys.argv[2]
label, events = {}, []
for line in open(journal):
    d = json.loads(line)
    if d['type'] == 'started':
        label[d['agentId']] = d['label']
    elif d['type'] == 'result' and d.get('result') is not None:
        events.append((label.get(d['agentId'], ''), d['result']))

by_n = {}
for lab, res in events:
    kind, n = lab.split(':')[:2]
    rec = by_n.setdefault(int(n), {'script': None, 'checked': False, 'issues': [], 'rounds': 0})
    if kind in ('write', 'fix') and isinstance(res, dict) and res.get('lines'):
        rec.update(script=res, checked=False, issues=[])
    elif kind == 'recheck' and isinstance(res, dict):
        rec.update(checked=True, issues=[x for x in res.get('issues', []) if x.get('severity') == 'blocking'], rounds=rec['rounds'] + 1)

rows = []
for n, rec in sorted(by_n.items()):
    if not rec['script']:
        continue
    remaining = rec['issues'] if rec['checked'] else [{'problem': 'last revision not rechecked'}]
    rows.append({'n': n, 'chunkId': rec['script']['chunkId'], 'script': rec['script'], 'rounds': rec['rounds'], 'remaining': remaining})
json.dump({'scripts': rows}, open(out, 'w'), ensure_ascii=False)
print(f"{len(rows)} scripts recovered; {sum(1 for r in rows if not r['remaining'])} rechecked clean")
