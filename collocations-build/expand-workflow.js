export const meta = {
  name: 'expand-collocations-to-400',
  description: 'Grow the collocation list from 208 to ~400 sets by commonness: gap hunt, selection, write and review new entries, re-chunk, re-order, cut reasons',
  phases: [
    { title: 'Gaps', detail: 'everyday sets still missing from the pool, counted in the corpus' },
    { title: 'Select', detail: '3 selectors + boundary: add ~190 to the 208 kept' },
    { title: 'Write', detail: 'full entries for the additions, per topic' },
    { title: 'Verify', detail: 'naturalness, trap truth, meaning, form' },
    { title: 'Fix', detail: 'apply reviews' },
    { title: 'Chunk', detail: 're-chunk every topic with old and new entries' },
    { title: 'Cuts', detail: 'a reason for every candidate left out' },
    { title: 'Assemble', detail: 'consistency and course order' },
  ],
}

const RESEARCH = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research'
const DIR = RESEARCH + '/collocations-build'
const TSV = DIR + '/expand.tsv'
const CJSON = DIR + '/candidates.json'
const CURRENT = RESEARCH + '/21-list-collocations.json'
const FREQ = RESEARCH + '/versatility-build/freq.py'
const VLIST = DIR + '/versatility-items.txt'
const CLI = DIR + '/count_cli.py'
const PAIRS = DIR + '/corpus/pairs.tsv'
const KEPT = 208
const ADD = 190

const DOMAINS = [
  ['weather', 'Weather & nature'], ['body', 'Body & health'], ['clothes', 'Clothes & wearing'], ['home', 'Home & daily routine'],
  ['food', 'Food & drink'], ['media', 'Phone, photos & screens'], ['travel', 'Getting around'], ['time-money', 'Time, money & plans'],
  ['work-school', 'Work & school'], ['people', 'People & talk'], ['hobbies', 'Hobbies, sport & games'], ['senses', 'Senses & mind'],
  ['describing', 'Describing people'],
]
const DKEYS = DOMAINS.map(d => d[0])

const COMMON = `CONTEXT
The learner studies Japanese audio-first (listening and speaking, romaji only, production over recognition). Beside their 484-item versatility list (4 stages) they have a list of COLLOCATIONS: the noun + verb (or noun + adjective) sets native speakers typically use together — ame ga furu, kaze ga fuku, doa o akeru, hon o yomu, kaze o hiku. The list now holds ${KEPT} sets (${CURRENT}); the learner wants more, so it grows to about ${KEPT + ADD}.

THE CRITERION IS COMMONNESS AND TYPICALITY: how often people say the set and how typical the pairing is. Guessable sets belong as much as tricky ones. A trap (where English misleads) is a note on the entry, never a reason to keep or cut.

THE EVIDENCE — ${TSV}: one candidate per line, most frequent first: id, domain, romaji, english, count (occurrences in 3.17M lines of Japanese film/TV subtitles, on dictionary forms, any particle or none), typical (the share of everything said with the noun that goes to this verb), judged_commonness (1–5, native judgement), status (KEPT <item id> or cut), cut_verdict / cut_reason (the last round's reason), trap. Full light entries by id are in ${CJSON}.
COUNT ANY SET YOURSELF: \`python3 ${CLI} pair <noun_romaji> <verb_romaji> <nounJa> <verbJa>\` (e.g. pair kasa sasu 傘 差す) or \`python3 ${CLI} phrase <form> [<form>...]\` for written forms. Under half a second each; use absolute paths (the shell's cwd resets).
CORPUS CAVEATS — correct with judgement: mostly subtitles for FOREIGN films, so crime / drama-plot sets are over-counted and Japanese daily life (konbini, trains, phones, school, chores, seasonal life) is under-counted; counts under ~20 are noisy; a missing count means "rare in films", not "rare in life".

OUT OF SCOPE: figurative idioms (separate list); grammar patterns (hitsuyou ga aru, shikata ga nai); plain noun + suru verbs (shinpai suru, benkyou suru); free combinations where the verb is generic; film-plot sets; the versatility list's ki ni naru, ki ni suru, ki ga suru, ki o tsukeru, renraku suru.

ENTRY CONVENTIONS: headword = plain dictionary form of the whole set with its usual particle (ame ga furu; adjective + noun as tsuyoi ame). polite = desu/masu form (null for adjective + noun). Examples use the form people say most, dropping ga/o as casual speech does. Romaji: modified Hepburn, lowercase, no macrons, long vowels spelled out (koohii, sou, juuden), particles wa/o/e, っ doubles the next consonant (t before ch), words separated by spaces, verb + auxiliaries joined, copula and sentence-final particles separate.`

const NSTR = { type: ['string', 'null'] }
const NINT = { type: ['integer', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }
const STRS = { type: 'array', items: { type: 'string' } }
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai']
const LIGHT_PROPS = {
  slug: { type: 'string' }, romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, english: { type: 'string' },
  noun: { type: 'string' }, nounJa: { type: 'string' }, particle: NSTR, verb: { type: 'string' }, verbJa: { type: 'string' },
  englishVerb: NSTR, trap: NSTR, count: { type: 'integer', description: 'from count_cli.py; 0 if none' }, typical: { type: ['number', 'null'] },
  commonness: SCORE, trapRisk: SCORE, speakNeed: SCORE, domain: { type: 'string', enum: DKEYS },
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } }, why: { type: 'string' },
}
const ADD_SCHEMA = { type: 'object', required: ['additions', 'notes'], properties: {
  additions: { type: 'array', items: { type: 'object', required: [...Object.keys(LIGHT_PROPS), 'gap'], properties: { ...LIGHT_PROPS, gap: { type: 'string' } } } },
  notes: { type: 'string' } } }
const SEL_SCHEMA = { type: 'object', required: ['add', 'notes'], properties: { add: STRS, notes: { type: 'string' } } }
const FINAL_ROW = { type: 'object', required: ['id', 'domain', 'romaji', 'english'], properties: {
  id: { type: 'string' }, domain: { type: 'string', enum: DKEYS }, romaji: { type: 'string' }, english: { type: 'string' } } }
const BOUND_SCHEMA = { type: 'object', required: ['add', 'notes'], properties: { add: { type: 'array', items: FINAL_ROW }, notes: { type: 'string' } } }
const EX = { type: 'object', required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } }
const ITEM_PROPS = {
  slug: { type: 'string', description: 'the candidate id, unchanged' }, romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, politeJa: NSTR,
  english: { type: 'string' }, use: { type: 'string' },
  noun: { type: 'string' }, nounJa: { type: 'string' }, particle: NSTR, verb: { type: 'string' }, verbJa: { type: 'string' },
  verbSense: { type: 'string' }, englishVerb: NSTR, trap: NSTR,
  partners: STRS, flags: { type: 'array', items: { type: 'string', enum: FLAGS } }, contrastGroup: NSTR,
  example: EX, examplePolite: { type: ['object', 'null'], required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } },
  nounRank: NINT, verbRank: NINT, freqNote: NSTR, commonness: SCORE, trapRisk: SCORE, speakNeed: SCORE,
  listLinks: STRS, alsoIn: STRS, notes: NSTR,
}
const ITEM = { type: 'object', required: Object.keys(ITEM_PROPS), properties: ITEM_PROPS }
const ITEMS_SCHEMA = { type: 'object', required: ['items'], properties: { items: { type: 'array', items: ITEM } } }
const FIXED_SCHEMA = { type: 'object', required: ['items', 'changelog', 'dropped'], properties: {
  items: { type: 'array', items: ITEM },
  changelog: { type: 'array', items: { type: 'object', required: ['slug', 'change'], properties: { slug: { type: 'string' }, change: { type: 'string' } } } },
  dropped: { type: 'array', items: { type: 'object', required: ['slug', 'reason'], properties: { slug: { type: 'string' }, reason: { type: 'string' } } } } } }
const ISSUES_SCHEMA = { type: 'object', required: ['issues', 'cut', 'summary'], properties: {
  issues: { type: 'array', items: { type: 'object', required: ['slug', 'field', 'problem', 'fix', 'severity'], properties: {
    slug: { type: 'string' }, field: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, severity: { type: 'string', enum: ['fatal', 'major', 'minor'] } } } },
  cut: { type: 'array', items: { type: 'object', required: ['slug', 'reason'], properties: { slug: { type: 'string' }, reason: { type: 'string' } } } },
  summary: { type: 'string' } } }
const CHUNK_SCHEMA = { type: 'object', required: ['blocks', 'contrastGroups', 'textFixes'], properties: {
  blocks: { type: 'array', items: { type: 'object', required: ['label', 'rationale', 'interference', 'ids'], properties: {
    label: { type: 'string' }, rationale: { type: 'string' }, interference: { type: 'string' }, ids: STRS } } },
  contrastGroups: { type: 'array', items: { type: 'object', required: ['id', 'group'], properties: { id: { type: 'string' }, group: NSTR } } },
  textFixes: { type: 'array', items: { type: 'object', required: ['id', 'field', 'value'], properties: {
    id: { type: 'string' }, field: { type: 'string', enum: ['use', 'notes', 'trap', 'partners'] }, value: { type: ['string', 'array', 'null'], items: { type: 'string' } } } } } } }
const CUTS_SCHEMA = { type: 'object', required: ['verdicts'], properties: { verdicts: { type: 'array', items: { type: 'object', required: ['id', 'verdict', 'reason', 'coveredBy'], properties: {
  id: { type: 'string' }, verdict: { type: 'string', enum: ['maybe', 'covered', 'less-common', 'film', 'narrow', 'not-a-collocation', 'idiom'] },
  reason: { type: 'string' }, coveredBy: NSTR } } } } }
const CONS_SCHEMA = { type: 'object', required: ['fixes', 'drops', 'notes'], properties: {
  fixes: { type: 'array', items: { type: 'object', required: ['id', 'field', 'value'], properties: {
    id: { type: 'string' }, field: { type: 'string', enum: ['romaji', 'polite', 'english', 'use', 'notes', 'trap', 'partners', 'contrastGroup', 'englishVerb', 'listLinks', 'verbSense'] },
    value: { type: ['string', 'array', 'null'], items: { type: 'string' } } } } },
  drops: { type: 'array', items: { type: 'object', required: ['id', 'reason'], properties: { id: { type: 'string' }, reason: { type: 'string' } } } },
  notes: { type: 'string' } } }
const ORDER_SCHEMA = { type: 'object', required: ['stages'], properties: { stages: { type: 'array', items: { type: 'object', required: ['name', 'summary', 'chunkIds'], properties: {
  name: { type: 'string' }, summary: { type: 'string' }, chunkIds: STRS } } } } }

const norm = s => String(s || '').replace(/[\s・。、？?！!〜~-]/g, '').toLowerCase()

// ---------- Gaps ----------
const CRITICS = [
  { key: 'daily-life', lens: 'JAPANESE DAILY LIFE the film corpus under-counts. Walk through a week in Japan: the morning routine, the commute (trains, buses, IC cards, transfers), the konbini and supermarket, the office (meetings, overtime, emails, breaks), school and club activities, cooking and housework, laundry and bathing, phones and apps, seasons and events (hanami, summer heat, typhoons, New Year), the doctor and pharmacy, going out drinking, family and neighbours. List every common noun + verb set people say that is NOT in the table.' },
  { key: 'verb-families', lens: 'VERB FAMILIES. For each of ~60 high-reach verbs (toru, kakeru, kakaru, deru, dasu, tsuku, tsukeru, hiku, kiru, ireru, hairu, ageru, agaru, sageru, sagaru, ataru, tatsu, tateru, okuru, ukeru, harau, mamoru, utsu, nuku, kesu, kieru, ochiru, otosu, sasu, noru, oriru, tsukau, tsukuru, akeru, shimeru, kaesu, nokoru, tamaru, tameru, magaru, naosu, naoru, kowasu, kowareru, nagasu, nureru, kawaku, yaku, nigiru, hirou, suteru, tomeru, tomaru, mukaeru, wataru, hiraku, tojiru, kasu, kariru), list its everyday noun partners and check each against the table; add the common ones that are missing.' },
  { key: 'data-sweep', lens: `LOWER-FREQUENCY DATA SWEEP. Earlier mining only looked at pairs heard 25+ times. Read ${PAIRS} (tab-separated: noun_kana, noun, verb_kana, verb, pos, count, per_million, share_n, share_v, log_dice, ...) for pairs with count 8–24 and share_n >= 0.08 or log_dice >= 9, and pick out the everyday sets (not grammar, not suru verbs, not film plots, not idioms) that are not in the table.` },
]
const additions = []
const tableNote = `Check the table (${TSV}) before proposing anything: grep for the romaji or the Japanese. Propose only sets that are not in it in any form.`
for (let round = 1; round <= 2; round++) {
  phase('Gaps')
  const prior = additions.map(a => `${a.romaji} (${a.domain})`).join(', ') || '(none)'
  const res = await parallel(CRITICS.map(cr => () => agent(`Gap hunt, round ${round}, for a Japanese collocation list growing from ${KEPT} to ~${KEPT + ADD} sets.

${COMMON}

YOUR LENS: ${cr.lens}

${tableNote} Already proposed this run (skip these too): ${prior}

For each addition: count it with ${CLI} (pair, or phrase if the tokenizer splits it), and fill every field (slug ascii from romaji, count, typical = shareN or null, judged commonness / trapRisk / speakNeed, domain, why). gap: what showed it was missing. Propose only common everyday sets.${round > 1 ? ' An empty list is fine if nothing common is missing.' : ''}`,
    { label: `gaps:${cr.key} r${round}`, phase: 'Gaps', schema: ADD_SCHEMA })))
  let fresh = 0
  for (const r of res.filter(Boolean)) for (const a of r.additions) {
    if (additions.some(x => norm(x.romaji) === norm(a.romaji))) continue
    let slug = String(a.slug || a.romaji).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (additions.some(x => x.slug === slug)) slug = `${slug}-g`
    additions.push({ ...a, slug, id: slug, source: `gap:${round}` })
    fresh++
  }
  log(`Gaps round ${round}: +${fresh} (${additions.length} new candidates)`)
  if (fresh < 10) break
}
const addLines = additions.map(a => `${a.id}\t${a.domain}\t${a.romaji}\t${a.english}\t${a.count}\t${a.typical ?? ''}\t${a.commonness}\tNEW\t\t\t${a.trap || ''}`).join('\n')

// ---------- Select ----------
phase('Select')
const SELECTORS = [
  { key: 'data', lens: 'DATA-FIRST: rank by count and typicality and trust the corpus, except for plain film-plot artefacts.' },
  { key: 'everyday', lens: 'EVERYDAY-JAPAN-FIRST: a native speaker living in Japan picks the sets people say most in daily life, lifting what the foreign-film corpus under-counts and dropping what it over-counts.' },
  { key: 'sets', lens: 'COMPLETE-SETS: complete natural sets around what is already kept (the other half of open/close, on/off, put on/take off, ga/o pairs, rain/snow/wind, the daily routine), cover every topic well, then fill with the most common remaining sets.' },
]
const sels = await parallel(SELECTORS.map(s => () => agent(`The collocation list keeps its ${KEPT} current sets (status KEPT in ${TSV}) and grows by about ${ADD} (${ADD - 15}–${ADD + 15}). Choose the additions from the cut candidates in ${TSV} and the NEW candidates below. Read the whole file in pieces.

${COMMON}

YOUR LENS: ${s.lens}

NEW CANDIDATES FROM THIS RUN (id, domain, romaji, english, count, typical, judged_commonness, status, -, -, trap):
${addLines || '(none)'}

Rules: one entry per set (skip a candidate that says the same as a kept set or another addition); the last round's cut_reason is advice, not a verdict — a "less-common" set with a solid count or a strong everyday judgement can come in now that the list is twice as long; no idioms, grammar, suru verbs or film-plot sets; every topic should grow. Return the ids to add and a short note on your hardest calls.`,
  { label: `select:${s.key}`, phase: 'Select', schema: SEL_SCHEMA })))
const votes = {}
const okSels = sels.filter(Boolean)
okSels.forEach(s => new Set(s.add).forEach(id => { votes[id] = (votes[id] || 0) + 1 }))
const base = Object.keys(votes).filter(id => votes[id] >= 2)
const fewer = Object.keys(votes).filter(id => votes[id] < 2)
const bound = await agent(`Three selectors voted on which sets to ADD to the collocation list (it keeps its ${KEPT} current sets). Settle the additions at ${ADD} (${ADD - 10}–${ADD + 10}) and return each with its metadata (id, domain, romaji, english) — from ${TSV} for table ids, or from the NEW candidates below.

${COMMON}

BASE (2+ votes): ${base.join(', ')}
FEWER VOTES: ${fewer.map(id => `${id}(${votes[id]})`).join(', ')}
NEW CANDIDATES FROM THIS RUN:
${addLines || '(none)'}
SELECTOR NOTES:
${okSels.map((s, i) => `${SELECTORS[i].key}: ${s.notes}`).join('\n')}

Resolve near-duplicates (with each other and with KEPT sets), keep natural sets whole, let commonness and typicality decide the boundary, and use only ids that exist. You may move an item to a better topic.`,
  { label: 'select:boundary', phase: 'Select', schema: BOUND_SCHEMA })
if (!bound) throw new Error('boundary failed')
const adds = []
const seen = new Set()
for (const r of bound.add) if (!seen.has(r.id)) { seen.add(r.id); adds.push(r) }
log(`Adding ${adds.length} sets (${adds.filter(r => additions.some(a => a.id === r.id)).length} found by this run's gap hunt)`)
const addsLines = adds.map(r => `${r.id} | ${r.domain} | ${r.romaji} | ${r.english}`).join('\n')

// ---------- Cut reasons for everything left out (runs beside the writing) ----------
const cutsPromise = parallel(DOMAINS.map(([key, name]) => () => agent(`Give a verdict and a one-line plain-English reason (for a learner deciding whether to ask for it back) to every candidate in topic "${key}" that is NOT kept and NOT being added: the cut lines of ${TSV} with domain = ${key}, plus this run's NEW candidates in that topic, minus the additions below.

${COMMON}

Verdicts: maybe (a strong set that only just missed — the best ~10%), covered (a kept or added set says the same; name it in coveredBy), less-common (cite the count when it helps), film, narrow, not-a-collocation, idiom.

ADDITIONS (id | topic | romaji | english):
${addsLines}
NEW CANDIDATES FROM THIS RUN:
${addLines || '(none)'}`,
  { label: `cuts:${key}`, phase: 'Cuts', schema: CUTS_SCHEMA })))

// ---------- Write -> Verify -> Fix -> Chunk ----------
const LENSES = [
  { key: 'natural', text: 'LENS: NATIVE-SPEAKER NATURALNESS. You are a native Japanese speaker (Tokyo, 30s). Is each set the natural, usual way to say it (verb, particle)? Would a real person say each example and examplePolite exactly like that? Flag stiff phrasing, translationese, wrong particles, unnatural subjects, casual sentences that are secretly polite or the reverse, and English that misses the meaning. Put the full corrected sentence (romaji + ja + english) in fix.' },
  { key: 'traps', text: 'LENS: TRAP TRUTH & PARTNERS. A trap is optional (null is fine). For every non-null trap: is the "wrong" form really wrong, not just less common? If an alternative is also fine, say so or drop the trap. Do not invent traps. Is englishVerb what an English speaker would reach for? Is verbSense accurate? Does each partner noun take this verb in the same sense? Is any item really a figurative idiom (cut it)?' },
  { key: 'nuance', text: 'LENS: MEANING, REGISTER & USE. Does each english gloss and use line say what the set means and the form people actually say (particle drop, aspect traps)? Is the polite form a true desu/masu counterpart? Are rough / slang forms flagged? Is each item really a common everyday set (cut it with the reason if not)?' },
  { key: 'form', text: `LENS: FORM & DATA. Romaji follows the convention exactly and matches ja/kana sound for sound; kana is the right reading; polite / politeJa agree and are correctly conjugated; example romaji matches example ja word for word; noun / particle / verb fields match the headword; spot-check nounRank / verbRank with \`python3 ${FREQ} <word>\`; every listLinks id exists in ${VLIST}. Put the exact corrected value in fix.` },
]
const byDomain = DOMAINS.map(([key, name]) => ({ key, name, rows: adds.filter(r => r.domain === key) }))
const built = await pipeline(byDomain,
  d => d.rows.length ? agent(`Write full entries for the ${d.rows.length} sets being ADDED to topic "${d.key}" — ${d.name}. Light entries: table ids in ${CJSON} (look up by id); this run's new candidates are listed below with their light fields. Read this topic's existing entries in ${CURRENT} (blocks whose category is "${d.name}") and match their tone, length and conventions.

${COMMON}

IDS TO WRITE: ${d.rows.map(r => r.id).join(', ')}
THIS RUN'S NEW CANDIDATES (light entries):
${JSON.stringify(additions.filter(a => d.rows.some(r => r.id === a.id)), null, 1)}

FIELDS (slug = the id): romaji, polite, ja, kana, politeJa (null when polite is null), english (2–6 words), use (one or two plain sentences: when you say it, the form you'll hear most, particle drop, any aspect trap), noun / nounJa / particle / verb / verbJa (dictionary form; ii not yoi), verbSense (what the verb or adjective means on its own), englishVerb (or null), trap (a real English-speaker mistake, or null — null is normal), partners (up to 4 other nouns taking this verb in the same sense, "mado (window)", or []), flags, contrastGroup (shared name for sets learned side by side; reuse names already in ${CURRENT} where they fit), example (ONE short casual sentence, 3–9 words, the most common spoken form), examplePolite (same sentence in desu/masu; null only for slang/rough), nounRank / verbRank (\`python3 ${FREQ} <forms>\`, kanji and kana; null with freqNote when none), commonness / trapRisk / speakNeed, listLinks (ids from ${VLIST}; grep, don't guess), alsoIn ([] unless you find one), notes (null or one short line).`,
    { label: `write:${d.key}`, phase: 'Write', schema: ITEMS_SCHEMA }) : Promise.resolve({ items: [] }),
  (draft, d) => !draft || !draft.items.length ? { draft: draft || { items: [] }, reviews: [] } :
    parallel(LENSES.map(l => () => agent(`Review the entries being added to topic "${d.key}" — ${d.name} — of a Japanese collocation list (casual default, polite pair, romaji-first, audio-first learner).

${COMMON}

${l.text}

DRAFT:
${JSON.stringify(draft, null, 1)}

Report every problem (slug, field, problem, exact fix, severity: fatal / major / minor). Items that should not be added go in cut. summary: 2–3 lines.`,
      { label: `verify:${d.key} ${l.key}`, phase: 'Verify', schema: ISSUES_SCHEMA })))
      .then(reviews => ({ draft, reviews: reviews.map((r, i) => r ? { lens: LENSES[i].key, ...r } : null).filter(Boolean) })),
  (dr, d) => !dr.draft.items.length ? { items: [], changelog: [], dropped: [] } :
    agent(`Finalise the entries being added to topic "${d.key}" — ${d.name}. Below: the draft and ${dr.reviews.length} reviews.

${COMMON}

Apply every fatal and major fix unless clearly wrong; apply minor fixes that are clearly right. Naturalness wins on wording, trap truth on whether a form is wrong, meaning on meaning. Drop an item only when two or more reviewers want it cut or it is wrong beyond repair (list it in dropped). Never add items. Keep slugs. Return every remaining item with every field, a changelog and dropped.

DRAFT:
${JSON.stringify(dr.draft, null, 1)}

REVIEWS:
${JSON.stringify(dr.reviews, null, 1)}`,
      { label: `fix:${d.key}`, phase: 'Fix', schema: FIXED_SCHEMA }).then(r => r || { items: dr.draft.items, changelog: [], dropped: [], unreconciled: true }),
  (fixed, d) => agent(`Re-chunk topic "${d.key}" — ${d.name} — of the collocation list now that it has grown. It holds the sets already written (blocks whose category is "${d.name}" in ${CURRENT}; refer to them by their item id, which starts with "c-") plus the new sets below (refer to them as "c-" + their slug).

${COMMON}

NEW SETS (c-<slug> | romaji | english | contrastGroup):
${fixed.items.map(it => `c-${it.slug} | ${it.romaji} | ${it.english} | ${it.contrastGroup || '—'}`).join('\n') || '(none)'}

Do:
- blocks: every set in the topic (old and new) in exactly one block. Group by meaning first (a situation, a natural set like open/close or on/off, a verb family), 4–5 sets per block (3 or 6 when natural; never pad, never split a natural set). Order blocks from the most common, simplest sets to less common ones, and sets within a block the same way. label: 1–4 plain words, unique within the topic. rationale: one line. interference: one line, or "none".
- contrastGroups: one row per id with its group (or null). Keep existing names where they fit; groups may span topics.
- textFixes: only for OLD entries whose use / notes / trap / partners should now point at a new neighbour or read wrong. Full new value. Usually few.`,
    { label: `chunk:${d.key}`, phase: 'Chunk', schema: CHUNK_SCHEMA }).then(ch => ({ key: d.key, name: d.name, fixed, chunk: ch })),
)

// ---------- Assemble ----------
phase('Assemble')
const topics = built.filter(Boolean)
const newIds = new Set(topics.flatMap(t => t.fixed.items.map(it => `c-${it.slug}`)))
const placed = new Map()
topics.forEach(t => t.chunk && t.chunk.blocks.forEach((b, bi) => {
  b.id = `${t.key}-${bi + 1}`
  b.ids = b.ids.filter(id => !placed.has(id))
  b.ids.forEach(id => placed.set(id, b.id))
}))
const unplacedNew = [...newIds].filter(id => !placed.has(id))
if (unplacedNew.length) log(`New sets not placed in a block: ${unplacedNew.join(', ')}`)
const lines = topics.flatMap(t => t.chunk ? t.chunk.blocks.map(b => `${b.id} | ${t.name} | ${b.label} | ${b.ids.join(', ')}`) : [])
const cons = await agent(`Cross-topic consistency pass over the grown collocation list. Old entries are in ${CURRENT} (by item id); new entries are summarised below. Blocks:
${lines.join('\n')}

NEW ENTRIES (id | romaji | english | contrastGroup):
${topics.flatMap(t => t.fixed.items.map(it => `c-${it.slug} | ${it.romaji} | ${it.english} | ${it.contrastGroup || '—'}`)).join('\n')}

${COMMON}

Check: (1) true duplicates across the whole list (same set, same sense) — drop the weaker NEW one; (2) spelling consistency; (3) natural pairs share a contrast group with one name; (4) englishVerb is one plain word. Return fixes (id, field, full new value; old or new entries), drops (new entries only) and notes. Only change what is wrong.`,
  { label: 'assemble:consistency', phase: 'Assemble', schema: CONS_SCHEMA })
const dropIds = new Set(cons ? cons.drops.map(d => d.id) : [])
topics.forEach(t => t.chunk && t.chunk.blocks.forEach(b => { b.ids = b.ids.filter(id => !dropIds.has(id)) }))
topics.forEach(t => { if (t.chunk) t.chunk.blocks = t.chunk.blocks.filter(b => b.ids.length) })
const allBlocks = topics.flatMap(t => t.chunk ? t.chunk.blocks.map(b => ({ ...b, topicName: t.name })) : [])
const order = await agent(`Order the ${allBlocks.length} chunks of the grown collocation list (~${KEPT + ADD} sets) into 4 stages that run alongside the learner's versatility list (a chunk in Stage N is learned during versatility Stage N). Old entries are in ${CURRENT}; read it for the sets behind old ids.

Versatility stages: Stage 1 — greetings, what/who/where, basic verbs (suru, naru, aru, iru, iku, kuru, deru, hairu), past and negative. Stage 2 — eat/drink/sleep, look, know, say/ask, think/feel, give/get; -te forms, -teru. Stage 3 — plans, meeting up, buy/use/make, trouble. Stage 4 — start/stop, take/put/cost/call (toru, kakaru, kakeru, dasu, ireru), patterns like -sugiru.

Principles: the most common, most typical sets first; simpler forms before complex ones; interleave topics so each stage covers several areas of daily life; keep each topic's internal chunk order (body-1 before body-2); roughly equal item counts per stage (~100 each). Every chunkId exactly once. name "Stage 1" … "Stage 4"; summary: one plain line on what the learner can talk about after it.

CHUNKS (chunkId | topic | label | ids):
${allBlocks.map(b => `${b.id} | ${b.topicName} | ${b.label} | ${b.ids.join(', ')}`).join('\n')}`,
  { label: 'assemble:course-order', phase: 'Assemble', schema: ORDER_SCHEMA })
const cutVerdicts = (await cutsPromise).filter(Boolean).flatMap(r => r.verdicts)
log(`Final: ${placed.size - [...dropIds].filter(id => placed.has(id)).length} sets in ${allBlocks.length} chunks; ${cutVerdicts.length} cut verdicts`)

return {
  additions, adds, votes, selectorNotes: okSels.map(s => s.notes), boundaryNotes: bound.notes,
  newEntries: topics.flatMap(t => t.fixed.items).filter(it => !dropIds.has(`c-${it.slug}`)),
  topics: topics.map(t => ({ key: t.key, name: t.name, blocks: t.chunk ? t.chunk.blocks : [], contrastGroups: t.chunk ? t.chunk.contrastGroups : [], textFixes: t.chunk ? t.chunk.textFixes : [], changelog: t.fixed.changelog, dropped: t.fixed.dropped })),
  droppedInFix: topics.flatMap(t => t.fixed.dropped), consistency: cons, unplacedNew,
  stages: order ? order.stages : null, cutVerdicts,
}