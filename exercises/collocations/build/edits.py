"""Apply field edits (the lean review's format, also used for hand edits) to scripts keyed by number."""

def apply(scripts, edits):
    applied, skipped, removals = [], [], {}
    for e in edits:
        s = scripts.get(e['script'])
        try:
            i, sub, f, v = e['index'] - 1, e['sub'] - 1, e['field'], e['value']
            if e['kind'] == 'line':
                s['lines'][i][f] = [x.strip() for x in v.split(',') if x.strip()] if f == 'uses' else v
            elif e['kind'] == 'question':
                s['questions'][i][f] = v
            elif e['kind'] == 'choice':
                s['questions'][i]['choices'][sub][f] = v
            elif e['kind'] == 'modelAnswer':
                s['questions'][i]['modelAnswers'][sub][f] = v
            elif e['kind'] == 'newWord':
                s['newWords'][i][f] = v
            elif e['kind'] == 'addNewWord':
                ro, ja, en = [x.strip() for x in v.split('|', 2)]
                s['newWords'].append({'romaji': ro, 'ja': ja, 'english': en})
            elif e['kind'] == 'removeNewWord':
                removals.setdefault(e['script'], set()).add(i)
            elif e['kind'] == 'meta' and f in ('title', 'setting'):
                s[f] = v
            else:
                raise ValueError('unknown edit')
            applied.append(e)
        except (IndexError, KeyError, ValueError, TypeError, AttributeError) as err:
            skipped.append({**e, 'error': repr(err)})
    for n, idxs in removals.items():
        scripts[n]['newWords'] = [w for k, w in enumerate(scripts[n]['newWords']) if k not in idxs]
    return applied, skipped
