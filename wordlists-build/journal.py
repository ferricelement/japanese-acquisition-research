#!/usr/bin/env python3
"""Pull every agent's result out of a workflow run's journal.jsonl, keyed by label.

  python3 journal.py <journal.jsonl> <out.json>
Works on runs that didn't finish; agents with no result are listed as missing."""
import json, sys

label, results, missing = {}, {}, []
for line in open(sys.argv[1]):
    d = json.loads(line)
    if d.get('type') == 'started':
        label[d['agentId']] = d.get('label', d['agentId'])
    elif d.get('type') == 'result':
        if d.get('result') is None:
            missing.append(label.get(d['agentId'], d['agentId']))
        else:
            results[label.get(d['agentId'], d['agentId'])] = d['result']
json.dump(results, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
print(f"{len(results)} results -> {sys.argv[2]}" + (f"; no result: {missing}" if missing else ''))
