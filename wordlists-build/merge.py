#!/usr/bin/env python3
"""Build ../23-list-core.json, ../24-list-sets.json, ../25-list-phrases.json and ../26-list-conjugations.json.

Sources:
  selected.json / select-cuts.json   the selection run (select_merge.py)
  write-result.json                  the writers' entries and chunks (journal.py over the write run)
  review-result.json, review-gap-result.json   reviewers' field edits and drops (optional)
  edits.json                         hand edits (optional): set [id, field, value]; drop [id, reason]
  conj-inventory.json + conjugate.py the conjugation tables, built by rule
Stages: core chunks by how frequent their words are (drama rank, or judged commonness when unranked);
sets, phrases and patterns by the writer's stage; conjugation chunks by the fixed order below.
"""
import csv, json, os, re
from collections import Counter, defaultdict
from statistics import median
from conjugate import table

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
load = lambda f, d=None: json.load(open(os.path.join(HERE, f))) if os.path.exists(os.path.join(HERE, f)) else d
sel, cuts_sel = load('selected.json'), load('select-cuts.json', [])
written = load('write-result.json')
# review-result.json is the main review; review-gap-result.json covers what its reviewers didn't read
review = {f'{f}:{k}': v for f in ('review-result.json', 'review-gap-result.json', 'review-conv-result.json') for k, v in load(f, {}).items()}
edits = load('edits.json', {})
# conversation pass (2026-10-19): cv = conversational value 1-5 per item id, move = chat-move topic for phrases;
# phrase-chunks.json re-chunks the phrases by chat move
cvs = load('cv.json', {})
phrase_chunks = load('phrase-chunks.json')
tax = load('taxonomy.json')
inv = {e['key']: e for e in load('conj-inventory.json')}
meas = load('conj-measured.json')['forms']
log = []

ranks = {}
with open(os.path.join(ROOT, 'versatility-build', 'jiten_freq_Drama.csv'), encoding='utf-8') as fh:
    for r in csv.DictReader(fh):
        for k in (r['Word'], r['Form']):
            if k not in ranks or int(r['Rank']) < ranks[k]:
                ranks[k] = int(r['Rank'])
cand = {x['ja']: x for v in sel.values() for x in v}
# conversation phrases hunted in the conversation pass (hunted.json: candidates with cv, move and corpus count)
for x in load('hunted.json', []):
    cand.setdefault(x['ja'], x)

vl = json.load(open(os.path.join(ROOT, '20-list-versatile.json')))
vl_items = {it['id']: it for b in vl['blocks'] for it in b['items']}
vl_by_ro = {}
for it in vl_items.values():
    for part in re.split(r'\s*/\s*', it['romaji']):
        vl_by_ro.setdefault(part.strip(), it['id'])

slugify = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower().replace("'", '')).strip('-') or 'x'
fix_ro = lambda s: s.replace('cch', 'tch') if isinstance(s, str) else s
short = lambda desc: desc.split(' (')[0]

LISTS = {
    'core': dict(file='23-list-core.json', prefix='w', unit='words', title='Core words',
                 description='The everyday verbs, nouns, adjectives and adverbs the other lists don’t teach, ordered by how much they help you keep a conversation going.'),
    'sets': dict(file='24-list-sets.json', prefix='s', unit='words', title='Word sets',
                 description='Numbers, counters, days, dates, months, clock time, colours, family, body parts, positions and pronouns: the closed sets you learn whole.'),
    'phrases': dict(file='25-list-phrases.json', prefix='p', unit='phrases', title='Conversation phrases',
                    description='Getting to know someone, small talk and saying what you think, then the reactions, follow-ups and story glue that keep a chat going.'),
    'conjugations': dict(file='26-list-conjugations.json', prefix='g', unit='forms and patterns', title='Conjugations',
                         description='Every verb and adjective form a conversation needs, with tables built by rule and how often each is heard, plus the grammar patterns that attach to them.'),
}
CONJ_STAGE = {
    'How verbs work': 1, 'Now and not': 1, 'The past': 1, 'The te-form': 1,
    'Ongoing and done': 2, 'Wanting and inviting': 2, 'Adjectives and the copula': 2, 'Adjectives that link and change': 2,
    'If and when': 3, 'Must and don\'t have to': 3, 'Helper verbs after -te': 3, 'Doing two things': 3,
    'Can, be done, make do': 4, 'Commands': 4, 'Looks, too much, easy': 4, 'Spoken shortcuts': 4,
}
TOPICS = {
    'core': {
        'v-move': 'Verbs: moving', 'v-body': 'Verbs: the body', 'v-home': 'Verbs: home and routine', 'v-talk': 'Verbs: talking',
        'v-mind': 'Verbs: thinking and feeling', 'v-social': 'Verbs: dealing with people', 'v-change': 'Verbs: change, start and end',
        'v-hands': 'Verbs: handling things', 'v-effort': 'Verbs: effort and results', 'v-trouble': 'Verbs: trouble and conflict',
        'v-life': 'Verbs: life and living', 'n-people': 'People', 'n-life': 'Life and time', 'n-mind': 'Mind and feelings',
        'n-abstract': 'Reasons and situations', 'n-talk': 'Talk and information', 'n-places': 'Places', 'n-home': 'Home and everyday things',
        'n-food': 'Food and drink', 'n-work': 'Work and school', 'n-health': 'Health', 'n-society': 'Society and news',
        'n-travel': 'Getting around', 'n-money': 'Money and shopping', 'n-nature': 'Nature and animals', 'n-fun': 'Free time and tech',
        'n-things': 'Things, kinds and amounts', 'a-feel': 'Adjectives: feelings', 'a-people': 'Adjectives: people',
        'a-things': 'Adjectives: things and situations', 'adv-manner': 'Adverbs: manner and certainty', 'adv-degree': 'Degree words',
        'adv-mimetic': 'Sound and feeling words', 'connect': 'Connectors',
    },
    'sets': {
        's-numbers': 'Numbers', 's-native': 'Counting things', 's-people': 'Counting people', 's-counters': 'Counters',
        's-clock': 'Clock time', 's-weekdays': 'Days of the week', 's-dates': 'Dates', 's-months': 'Months', 's-years': 'Years and age',
        's-relative': 'Days and years around now', 's-dayparts': 'Parts of the day', 's-seasons': 'Seasons and weather', 's-colors': 'Colours',
        's-family': 'Family', 's-body': 'Body', 's-position': 'Position and direction', 's-pronouns': 'Pronouns',
        's-countries': 'Countries and languages', 's-taste': 'Tastes and textures',
    },
    'phrases': {k: short(v) for k, v in tax['phrase'].items()},
    'conjugations': {'verbs': 'Verb forms', 'adjectives': 'Adjectives and the copula', 'patterns': 'Grammar patterns'},
}
MOVE_NAMES = {
    'c-intro': 'Getting to know you', 'c-likes': 'Likes and free time', 'c-opine': 'What do you think', 'c-catchup': 'Small talk',
    'c-react': 'Reacting', 'c-ask': 'Asking and following up', 'c-agree': 'Agreeing and disagreeing',
    'c-tell': 'Telling what happened', 'c-feel': 'Feelings and empathy', 'c-plans': 'Plans and invitations',
    'c-repair': 'Clarifying', 'c-banter': 'Teasing and banter', 'c-flow': 'Opening and changing the subject',
    'c-social': 'Greetings, thanks and sorry', 'c-errands': 'Errands and service',
}
if phrase_chunks:
    TOPICS['phrases'] = MOVE_NAMES

out = {k: {'blocks': [], 'cuts': [], 'stages': [], 'categories': []} for k in LISTS}
used_ids = set()


def new_id(prefix, romaji):
    base = f'{prefix}-{slugify(romaji)}'
    i, cid = 2, base
    while cid in used_ids:
        cid, i = f'{base}-{i}', i + 1
    used_ids.add(cid)
    return cid


def finish(e, prefix, kind):
    """Common fields of a written entry; src is the join key to its candidate."""
    c = cand.get(e['src'], {})
    item = {
        'id': None, 'romaji': fix_ro(e['romaji']), 'polite': fix_ro(e.get('polite')), 'english': e['english'],
        'use': e.get('use'), 'ja': e['ja'], 'kana': e.get('kana') or e['ja'], 'politeJa': e.get('politeJa'),
        'pos': e.get('pos') or c.get('tpos') or '', 'flags': e.get('flags') or [], 'contrastGroup': None,
        'example': e['example'], 'examplePolite': e.get('examplePolite'),
        'freqRank': c.get('rank') or ranks.get(e['ja']) or ranks.get(e.get('kana') or ''),
        'score': c.get('score'), 'notes': e.get('notes'), 'listLinks': [],
    }
    for ex in (item['example'], item['examplePolite']):
        if ex:
            # romaji stays lowercase, sentence starts included (kotoba style: "un, iku yo.")
            ex['romaji'] = fix_ro(ex['romaji']).lower()
    if kind == 'phrases':
        item['role'] = e.get('role') or 'both'
        item['count'] = c.get('count')
    if c.get('cv'):
        item['cv'] = c['cv']
    item['id'] = new_id(prefix, item['romaji'])
    return item


# Written results: label "write:<kind>:<n>" -> {entries, chunks, drops}
pending = defaultdict(list)   # kind -> [(chunk dict, [items], topic key)]
for label, r in sorted(written.items()):
    _, kind, n = label.split(':')
    lst = 'conjugations' if kind in ('conj', 'patterns') else kind
    entries = {e['src']: e for e in r['entries']}
    placed = set()
    for ch in r['chunks']:
        members = [entries[m] for m in ch['members'] if m in entries and m not in placed]
        placed.update(m['src'] for m in members)
        if not members:
            continue
        if kind == 'conj':
            items = []
            for e in members:
                spec = inv.get(e['src'])
                if not spec:
                    log.append(f'conj entry with unknown key {e["src"]}')
                    continue
                it = finish(e, 'g', lst)
                it.update(name=e.get('name'), formation=e.get('formation'), pos='adj' if spec['kind'] == 'adj' else spec['kind'],
                          table=[{k: r_[k] for k in ('word', 'romaji', 'ja')} for r_ in table(spec['table'])],
                          measured=meas.get(spec.get('measured') or ''), freqRank=None, score=None)
                it['id'] = f"g-{spec['key']}"
                for part in re.split(r'\s*/\s*', spec['label']):
                    hit = vl_by_ro.get(part.split(' (')[0].strip())
                    if hit and hit not in it['listLinks']:
                        it['listLinks'].append(hit)
                items.append(it)
            chunk_name = inv[members[0]['src']]['chunk']
            topic = 'adjectives' if inv[members[0]['src']]['kind'] == 'adj' else 'verbs'
            pending[lst].append(({**ch, 'stage': CONJ_STAGE.get(chunk_name, 4)}, items, topic))
            continue
        items = [finish(e, LISTS[lst]['prefix'], lst) for e in members]
        if kind == 'patterns':
            for it, e in zip(items, members):
                it['formation'] = e.get('formation')
                it['name'] = None
            topic = 'patterns'
        else:
            keys = Counter(cand.get(e['src'], {}).get('key') for e in members)
            keys.pop(None, None)
            topic = (ch.get('set') if lst == 'sets' else None) or (keys.most_common(1)[0][0] if keys else None)
        pending[lst].append((ch, items, topic))
    missing = set(entries) - placed
    if missing:
        log.append(f'{label}: {len(missing)} written entries in no chunk: {sorted(missing)[:6]}')
    for d in r.get('drops', []):
        c = cand.get(d['src'], {})
        lst_cut = 'conjugations' if kind in ('conj', 'patterns') else kind
        out[lst_cut]['cuts'].append({'id': f"cut-{slugify(c.get('romaji') or d['src'])}", 'romaji': c.get('romaji') or d['src'],
                                     'ja': c.get('ja') or d['src'], 'english': c.get('en'), 'freqRank': c.get('rank'),
                                     'score': c.get('score'), 'verdict': 'dropped', 'reason': d['reason']})

# Reviews and hand edits, applied by item id.
items_by_id = {it['id']: it for v in pending.values() for _, items, _ in v for it in items}
dropped = {}
# Automatic drops: the same written word twice across the new lists (the first stays), and core or phrase
# entries an older list already teaches (sets stay complete on purpose).
old_ja = {}
for f in ('20-list-versatile.json', '21-list-collocations.json', '22-list-idioms.json'):
    for b in json.load(open(os.path.join(ROOT, f)))['blocks']:
        for it in b['items']:
            old_ja.setdefault(it['ja'], it['romaji'])
first = {}
for lst in ('sets', 'core', 'phrases', 'conjugations'):
    for _, items, _ in pending.get(lst, []):
        for it in items:
            if lst == 'conjugations':
                continue
            if it['ja'] in first:
                dropped[it['id']] = f"Same word as {first[it['ja']]}."
            elif lst != 'sets' and it['ja'] in old_ja:
                dropped[it['id']] = f"Already taught as {old_ja[it['ja']]} in an earlier list."
            else:
                first[it['ja']] = it['romaji']
FIELDS = {'romaji', 'polite', 'english', 'use', 'ja', 'kana', 'politeJa', 'notes', 'formation', 'name', 'role', 'flags',
          'example.romaji', 'example.ja', 'example.english', 'examplePolite', 'examplePolite.romaji', 'examplePolite.ja', 'examplePolite.english'}
applied = 0
for label, r in sorted(review.items()):
    for ed in r.get('edits', []):
        it, f = items_by_id.get(ed['id']), ed['field']
        if not it or f not in FIELDS:
            log.append(f"review edit ignored {ed['id']} {f}")
            continue
        if '.' in f:
            a, b = f.split('.')
            if it.get(a):
                it[a][b] = fix_ro(ed['value']) if b == 'romaji' else ed['value']
        else:
            it[f] = fix_ro(ed['value']) if f in ('romaji', 'polite') else ed['value']
        applied += 1
for label, r in sorted(review.items()):
    for d in r.get('drops', []):
        if d['id'] in items_by_id:
            dropped[d['id']] = d['reason']
for iid, field, value in edits.get('set', []):
    if iid in items_by_id:
        items_by_id[iid][field] = value
for iid, reason in edits.get('drop', []):
    dropped[iid] = reason
log.append(f'review edits applied: {applied}; drops: {len(dropped)}')

# Conversation pass: every item gets its cv; the phrases are regrouped into the chunkers' chat-move chunks, and the
# errands phrases keep their old situation chunks.
for v in pending.values():
    for _, items, _ in v:
        for it in items:
            if it['id'] in cvs:
                it['cv'] = cvs[it['id']]['cv']
                it['focus'] = bool(cvs[it['id']].get('focus'))
            elif cand.get(it.get('ja'), {}).get('focus'):
                it['focus'] = True
if phrase_chunks:
    ph_items = {it['id']: it for _, items, _ in pending['phrases'] for it in items}
    placed, regrouped = set(), []
    for ch in phrase_chunks['chunks']:
        members = [ph_items[i] for i in ch['members'] if i in ph_items and i not in placed]
        placed.update(m['id'] for m in members)
        if members:
            regrouped.append((ch, members, ch['move']))
    for ch, items, _ in pending['phrases']:
        rest = [it for it in items if it['id'] not in placed and (cvs.get(it['id']) or {}).get('move') == 'c-errands']
        if rest:
            placed.update(it['id'] for it in rest)
            regrouped.append(({**ch, 'stage': None}, rest, 'c-errands'))
    unplaced = [i for i in ph_items if i not in placed]
    if unplaced:
        log.append(f'phrases in no chat-move chunk: {unplaced}')
    pending['phrases'] = regrouped

# Stages, numbering and output.
EFF = {5: 800, 4: 2000, 3: 3500, 2: 6000, 1: 9000}
for lst, chunks in pending.items():
    blocks = []
    counters = Counter()
    for ch, items, topic in chunks:
        kept = [it for it in items if it['id'] not in dropped]
        for it in items:
            if it['id'] in dropped:
                out[lst]['cuts'].append({'id': it['id'], 'romaji': it['romaji'], 'ja': it['ja'], 'english': it['english'],
                                         'freqRank': it['freqRank'], 'score': it['score'], 'verdict': 'dropped', 'reason': dropped[it['id']]})
        if not kept:
            continue
        topic = topic or 'other'
        counters[topic] += 1
        prio = median([it['freqRank'] or EFF.get(it['score'] or 3, 3500) for it in kept])
        blocks.append({'id': f'{topic}-{counters[topic]}', 'topic': topic, 'label': ch['label'], 'rationale': ch['rationale'],
                       'interference': ch['interference'], 'items': kept, 'stage': ch.get('stage'), 'prio': prio, 'seq': len(blocks)})
    # a chunk that drops left under 3 joins the nearest chunk on the same topic that has room (6 at most)
    for b in [b for b in blocks if len(b['items']) < 3 and lst != 'conjugations']:
        if not b['items'] or len(b['items']) >= 3:  # emptied or grown by an earlier fold
            continue
        mates = [m for m in blocks if m is not b and m['topic'] == b['topic'] and m['items'] and len(m['items']) + len(b['items']) <= 6]
        if mates:
            m = min(mates, key=lambda m: abs(m['seq'] - b['seq']))
            m['items'] += b['items']
            log.append(f"{lst}: chunk '{b['label']}' ({len(b['items'])}) joined '{m['label']}'")
            b['items'] = []
    blocks = [b for b in blocks if b['items']]
    # Conversation first: chunks are staged by value tier — 1: focus (small talk, getting to know someone, opinions) or
    # mean cv 3.5+; 2: 3.0+; 3: 2.5+; 4: lower. For core words tier 4 is a last stage of errands, chores and formal talk,
    # and for phrases the errands move is; sets and conjugations just learn their low tier last.
    for b in blocks:
        v = [it['cv'] for it in b['items'] if it.get('cv')]
        b['cv'] = sum(v) / len(v) if v else 3
        b['focus'] = sum(1 for it in b['items'] if it.get('focus')) * 2 >= len(b['items'])
        b['tier'] = 1 if b['focus'] or b['cv'] >= 3.5 else 2 if b['cv'] >= 3.0 else 3 if b['cv'] >= 2.5 else 4
        b['errands'] = (b['topic'] == 'c-errands') if lst == 'phrases' else bool(cvs) and lst == 'core' and b['tier'] == 4
    talk = [b for b in blocks if not b['errands']]
    if cvs and lst in ('core', 'sets', 'conjugations'):
        for b in talk:
            # the verb-group rules open the conjugations whatever their score
            b['stage'] = 1 if any(it['pos'] == 'rule' for it in b['items']) else b['tier']
    elif lst == 'core':
        order = sorted(talk, key=lambda b: b['prio'])
        for i, b in enumerate(order):
            b['stage'] = 1 + (4 * i) // len(order)
    for b in talk:
        b['stage'] = b['stage'] or 3
    # no empty stages: a list whose writers used only stages 1-3 gets three
    used = sorted({b['stage'] for b in talk})
    for b in talk:
        b['stage'] = used.index(b['stage']) + 1
    # a last stage under 5% of the list (phrases: 7 of 416) joins the one before
    total_items = sum(len(b['items']) for b in talk)
    while len(used) > 1 and sum(len(b['items']) for b in talk if b['stage'] == len(used)) < 0.05 * total_items:
        for b in talk:
            if b['stage'] == len(used):
                b['stage'] -= 1
        used = used[:-1]
    errands_stage = len(used) + 1 if any(b['errands'] for b in blocks) else None
    for b in blocks:
        if b['errands']:
            b['stage'] = errands_stage
    topic_order = list(TOPICS[lst])
    # core chunks within a stage go most frequent first; the other lists keep the writer's order (monday before friday)
    blocks.sort(key=lambda b: (b['stage'], topic_order.index(b['topic']) if b['topic'] in topic_order else 99, b['prio'] if lst == 'core' else b['seq']))
    n = 1
    stages = []
    for s in range(1, (errands_stage or len(used)) + 1 if blocks else 1):
        sb = [b for b in blocks if b['stage'] == s]
        for b in sb:
            start = n
            for it in b['items']:
                it['n'] = n
                n += 1
            b['range'] = f'{start}-{n - 1}'
            b['category'] = TOPICS[lst].get(b['topic'], b['topic'])
        cnt = sum(len(b['items']) for b in sb)
        ranked = [it['freqRank'] for b in sb for it in b['items'] if it.get('freqRank')]
        if s == errands_stage:
            summary = f"{cnt} {LISTS[lst]['unit']} for {'shops, restaurants and service' if lst == 'phrases' else 'errands, chores, service and formal talk'}: there for when you need them, not for chatting."
        elif lst == 'core' and ranked and cvs:
            what = {1: 'for small talk, getting to know someone and saying what you think', 2: 'that come up in most chats',
                    3: 'for narrower topics'}.get(s, 'for later')
            summary = f"{cnt} words {what}; half of them rank in the top {int(median(ranked)):,} of spoken Japanese."
        elif lst == 'core' and ranked:
            summary = f"{cnt} words; half of them rank in the top {int(median(ranked)):,} of spoken Japanese."
        else:
            names = list(dict.fromkeys(b['category'] for b in sb))
            more = f' and {len(names) - 4} more' if len(names) > 5 else ''
            summary = f"{cnt} {LISTS[lst]['unit']} in {len(sb)} chunks: " + ', '.join(names[:4] if more else names).lower() + more + '.'
        last_name = 'Errands and service' if lst == 'phrases' else 'Errands, chores and formal'
        stages.append({'name': last_name if s == errands_stage else f'Stage {s}', 'summary': summary, 'items': cnt,
                       'chunkIds': [b['id'] for b in sb]})
    cats = []
    for t in topic_order + sorted({b['topic'] for b in blocks} - set(topic_order)):
        ids_ = [b['id'] for b in blocks if b['topic'] == t]
        if ids_:
            scope = {**tax['core'], **tax['set'], **tax['phrase']}.get(t, TOPICS[lst].get(t, t))
            cats.append({'key': t, 'name': TOPICS[lst].get(t, t), 'scope': scope, 'chunkIds': ids_})
    for b in blocks:
        for k in ('prio', 'topic', 'seq', 'cv', 'errands', 'focus', 'tier'):
            b.pop(k, None)
    out[lst].update(blocks=blocks, stages=stages, categories=cats)

# Selection cuts: what the judges left out of the core and phrase lists.
for c in cuts_sel:
    lst = 'phrases' if c['route'] == 'phrase' else 'core' if c['route'] in ('core', 'cut') else None
    # fragments, laughs, names and dialect aren't candidates anyone would ask back for
    if not lst or c['verdict'] not in ('less-common', 'drama', 'covered', 'bookish', 'rare'):
        continue
    out[lst]['cuts'].append({'id': f"cut-{slugify(c.get('romaji') or c['ja'])}", 'romaji': c.get('romaji') or c['ja'], 'ja': c['ja'],
                             'english': c.get('en'), 'freqRank': c.get('rank'), 'score': c.get('score'),
                             'verdict': c['verdict'] if c['verdict'] in ('less-common', 'drama', 'covered', 'bookish', 'rare') else 'other',
                             'reason': c.get('why') if c['verdict'] not in ('less-common',) else f"Judged {c['score']} of 5 for everyday use."})

for lst, meta in LISTS.items():
    o = out[lst]
    o['cuts'].sort(key=lambda c: (c['freqRank'] or 99999))
    total = sum(len(b['items']) for b in o['blocks'])
    doc = {'title': meta['title'], 'description': meta['description'],
           'conventions': vl['conventions'], 'stats': {'total': total, 'chunks': len(o['blocks']), 'candidatePool': total + len(o['cuts'])},
           'stages': o['stages'], 'categories': o['categories'], 'blocks': o['blocks'], 'cuts': o['cuts']}
    json.dump(doc, open(os.path.join(ROOT, meta['file']), 'w'), ensure_ascii=False, indent=1)
    print(f"{meta['file']}: {total} items, {len(o['blocks'])} chunks, {len(o['cuts'])} cuts, stages {[s['items'] for s in o['stages']]}")
print('\n'.join(log))
