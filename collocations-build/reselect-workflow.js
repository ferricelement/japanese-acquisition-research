export const meta = {
  name: 'reselect-collocations-by-commonness',
  description: 'Re-select the collocation list (~200) on measured commonness and typicality, write and review new entries, re-chunk, re-order, and give every cut a reason',
  phases: [
    { title: 'Select', detail: '3 selectors (data / everyday Japan / complete sets) + boundary' },
    { title: 'Write', detail: 'full entries for newly selected items, per topic' },
    { title: 'Verify', detail: 'naturalness, trap truth, meaning, form' },
    { title: 'Fix', detail: 'apply reviews per topic' },
    { title: 'Chunk', detail: 're-chunk each topic with old and new entries' },
    { title: 'Cuts', detail: 'a reason for every candidate left out' },
    { title: 'Assemble', detail: 'consistency and course order' },
  ],
}

const DIR = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research/collocations-build'
const RESEARCH = DIR.replace('/collocations-build', '')
const TSV = DIR + '/candidates.tsv'
const CJSON = DIR + '/candidates.json'
const CURRENT = RESEARCH + '/21-list-collocations.json'
const FREQ = RESEARCH + '/versatility-build/freq.py'
const VLIST = DIR + '/versatility-items.txt'
const TARGET = 200

const DOMAINS = [
  ['weather', 'Weather & nature'], ['body', 'Body & health'], ['clothes', 'Clothes & wearing'], ['home', 'Home & daily routine'],
  ['food', 'Food & drink'], ['media', 'Phone, photos & screens'], ['travel', 'Getting around'], ['time-money', 'Time, money & plans'],
  ['work-school', 'Work & school'], ['people', 'People & talk'], ['hobbies', 'Hobbies, sport & games'], ['senses', 'Senses & mind'],
  ['describing', 'Describing people'],
]
const DKEYS = DOMAINS.map(d => d[0])

const COMMON = `CONTEXT
The learner studies Japanese audio-first (listening and speaking, romaji only, production over recognition). Beside their 484-item versatility list (4 stages) they get a list of COLLOCATIONS: the noun + verb (or noun + adjective) sets native speakers typically use together — rain falls (ame ga furu), wind blows (kaze ga fuku), open the door (doa o akeru), read a book (hon o yomu), catch a cold (kaze o hiku).

THE CRITERION IS COMMONNESS AND TYPICALITY. The learner said so directly: how common and how typical a set is, is exactly what makes it belong. A guessable set (hon o yomu, doa o akeru, te o arau) belongs as much as a tricky one if people say it all the time. Whether English would mislead the learner (trap) is a useful NOTE on the entry, never a reason to keep or cut.

THE EVIDENCE — ${TSV} (one candidate per line, most frequent first; ${CJSON} has the full light entries by id):
- count / per_million: occurrences in 3.17M lines of Japanese film and TV subtitles (OpenSubtitles), counted on dictionary forms with particles dropped or not (kaze hiita counts).
- typical: of everything said with this noun, the share that goes to this verb/adjective (ame -> furu 0.52 is very typical). log_dice: association strength (10+ strong).
- judged_commonness (1–5): a native-speaker judgement of how often people in Japan say it in everyday life.
- in_current_list: already written up in the current list. That saves writing but is NOT a reason to keep it.
- trap: the English-speaker mistake, if any.
CORPUS CAVEATS — correct for these with judgement: most lines are subtitles for FOREIGN films, so crime / action / drama-plot sets are over-counted (keisatsu o yobu, mondai o kakaeru, koi ni ochiru) and Japanese daily life, konbini, phones, casual talk and Japan-specific routines are under-counted (kasa o sasu 3, densha ni maniau 3, warikan, konbini ni yoru: no count). Counts under ~20 are noisy; a missing count means "too rare in films", not "rare in life". The tokenizer splits some sets (ma ni au), so judge those on judged_commonness.

OUT OF SCOPE: figurative idioms (te o kasu, me ga nai, ki ga au, atama ni kuru — a separate idiom list comes later); grammar patterns (hitsuyou ga aru, shikata ga nai, mondai nai); plain noun + suru verbs (shinpai suru, benkyou suru, denwa suru); free combinations where the verb is generic; film-plot sets; items already in the versatility list (ki ni naru, ki ni suru, ki ga suru, ki o tsukeru, renraku suru).

ENTRY CONVENTIONS: headword (romaji) = plain dictionary form of the whole set with its usual particle (ame ga furu, doa o akeru, se ga takai, adjective + noun as tsuyoi ame). polite = desu/masu form (null for adjective + noun). Examples use the form people say most (ame futteru, kaze hiita), dropping ga/o the way casual speech does. Romaji: modified Hepburn, lowercase, no macrons, long vowels spelled out (koohii, sou, juuden), particles wa/o/e, っ doubles the next consonant (t before ch), words separated by spaces, verb + auxiliaries joined (futteru, kaketeru), copula and sentence-final particles separate.`

const NSTR = { type: ['string', 'null'] }
const NINT = { type: ['integer', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }
const STRS = { type: 'array', items: { type: 'string' } }
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai']

const SEL_SCHEMA = { type: 'object', required: ['keep', 'notes'], properties: { keep: STRS, notes: { type: 'string' } } }
const FINAL_ROW = { type: 'object', required: ['id', 'domain', 'romaji', 'english', 'existing'], properties: {
  id: { type: 'string' }, domain: { type: 'string', enum: DKEYS }, romaji: { type: 'string' }, english: { type: 'string' },
  existing: { type: 'boolean', description: 'in_current_list = yes' } } }
const BOUND_SCHEMA = { type: 'object', required: ['final', 'notes'], properties: { final: { type: 'array', items: FINAL_ROW }, notes: { type: 'string' } } }
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
  textFixes: { type: 'array', description: 'fixes to EXISTING entries whose use/notes/trap/partners now point at something cut, or that should mention a new neighbour', items: { type: 'object', required: ['id', 'field', 'value'], properties: {
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

// ---------- Select ----------
phase('Select')
const SELECTORS = [
  { key: 'data', lens: 'DATA-FIRST: rank by count and typicality and trust the corpus, except where a set is plainly a film-plot artefact. A set that is both frequent and typical is the core of this list.' },
  { key: 'everyday', lens: 'EVERYDAY-JAPAN-FIRST: you are a native speaker living in Japan. Pick the sets people actually say most in daily life — home, work, school, shops, trains, weather, health, friends — using the counts as evidence but lifting the daily-life sets the foreign-film corpus under-counts and dropping the film-plot sets it over-counts.' },
  { key: 'sets', lens: 'COMPLETE-SETS: make sure the natural sets are whole and every topic is covered — open and close (door, window), turn on and off (light, TV), put on and take off by body part, the ga / o pairs on one noun (doa ga aku / doa o akeru), rain / snow / wind, the daily routine from waking to sleeping, eating and drinking, going and coming home — then fill with the most common remaining sets.' },
]
const sels = await parallel(SELECTORS.map(s => () => agent(`Select the ~${TARGET} collocations (${TARGET - 10}–${TARGET + 10}) for the list from the ${'1,115'} candidates in ${TSV}. Read the whole file (it is tab-separated; read it in pieces if it is long).

${COMMON}

YOUR LENS: ${s.lens}

Rules: one entry per set — when two candidates are the same set in another shape (onaka ga suku / onaka ga heru are different words and may both stay; doa ga aku listed twice is not), keep the better one. Keep near-identical alternatives only when both are very common. Every one of the 13 topics should have at least a few sets. Return the ids to keep and a short note on your hardest calls.`,
  { label: `select:${s.key}`, phase: 'Select', schema: SEL_SCHEMA })))
const votes = {}
const okSels = sels.filter(Boolean)
okSels.forEach(s => new Set(s.keep).forEach(id => { votes[id] = (votes[id] || 0) + 1 }))
const need = okSels.length >= 2 ? 2 : 1
const base = Object.keys(votes).filter(id => votes[id] >= need)
const maybeAdd = Object.keys(votes).filter(id => votes[id] < need)
log(`Selection: ${okSels.length} selectors; ${base.length} ids with ≥${need} votes, ${maybeAdd.length} with fewer`)
const bound = await agent(`Three independent selectors voted on the collocation list. Bring it to ${TARGET} (${TARGET - 5}–${TARGET + 5}) and return the FINAL list with each item's metadata copied from ${TSV} (id, domain, romaji, english, existing = in_current_list is yes). Read the file to look ids up.

${COMMON}

BASE SET (${need}+ votes): ${base.join(', ')}

FEWER VOTES (candidates to add): ${maybeAdd.map(id => `${id}(${votes[id]})`).join(', ')}

SELECTOR NOTES:
${okSels.map((s, i) => `${SELECTORS[i] ? SELECTORS[i].key : i}: ${s.notes}`).join('\n')}

Resolve near-duplicates, keep natural sets whole, keep every topic represented, and let commonness and typicality decide the boundary. Use only ids that exist in the file. You may move an item to a better topic by changing its domain.`,
  { label: 'select:boundary', phase: 'Select', schema: BOUND_SCHEMA })
if (!bound) throw new Error('boundary selection failed')
const final = []
const seenIds = new Set()
for (const r of bound.final) if (!seenIds.has(r.id)) { seenIds.add(r.id); final.push(r) }
log(`Final selection: ${final.length} (${final.filter(r => r.existing).length} already written, ${final.filter(r => !r.existing).length} new)`)

const byDomain = DOMAINS.map(([key, name]) => ({ key, name, rows: final.filter(r => r.domain === key) })).filter(d => d.rows.length)
const finalLines = final.map(r => `${r.id} | ${r.domain} | ${r.romaji} | ${r.english}${r.existing ? ' | written' : ''}`).join('\n')

// ---------- Cut reasons (needs only the final ids; runs beside the writing) ----------
const cutsPromise = parallel(DOMAINS.map(([key, name]) => () => agent(`Give a verdict and a one-line plain-English reason (for a learner deciding whether to ask for it back) to every candidate in topic "${key}" of ${TSV} that is NOT in the final list below. Read the file and filter by domain = ${key}; skip ids that are in the final list.

${COMMON}

Verdicts: maybe (a strong set that only just missed — use for the best ~10%), covered (a kept set says the same; name it in coveredBy), less-common (real, but said less than the kept ones — cite the count when it helps), film (common only in film plots), narrow (one situation or topic), not-a-collocation (grammar, suru verb, free combination, single verb), idiom (figurative; for the idiom list).

FINAL LIST (id | topic | romaji | english):
${finalLines}`,
  { label: `cuts:${key}`, phase: 'Cuts', schema: CUTS_SCHEMA })))

// ---------- Write -> Verify -> Fix -> Chunk, per topic ----------
const LENSES = [
  { key: 'natural', text: 'LENS: NATIVE-SPEAKER NATURALNESS. You are a native Japanese speaker (Tokyo, 30s). Is each set the natural, usual way to say this (the right verb, the right particle)? Would a real person say each example and examplePolite exactly like that? Flag stiff textbook phrasing, translationese, wrong particles, unnatural subjects, casual sentences that are secretly polite or the reverse, and English that misses the meaning. Casual examples should drop particles where natives would. Put the full corrected sentence (romaji + ja + english) in fix.' },
  { key: 'traps', text: 'LENS: TRAP TRUTH & PARTNERS. A trap is optional (null is fine). For every non-null trap: is the "wrong" form really wrong or clearly unnatural, not just less common or regional? If an alternative is also fine, the trap must say so or be removed. Do not invent traps. Is englishVerb what an English speaker would reach for? Is verbSense accurate? Does each partner noun really take this verb in the same sense? Is any item really a figurative idiom (cut it, with the reason)?' },
  { key: 'nuance', text: 'LENS: MEANING, REGISTER & USE. Check every english gloss and use line: does use name the form people actually say, note particle drop and any aspect trap (kaze hiite ru = has a cold now)? Is the polite form a true desu/masu counterpart with the same meaning? Are rough / slang / gendered forms flagged? Are the scores sane? List any item that is not really a common everyday set in cut with the reason.' },
  { key: 'form', text: `LENS: FORM & DATA. Romaji follows the convention exactly and matches ja/kana sound for sound; kana is the right reading; polite / politeJa agree and the masu form is correctly conjugated; example romaji matches example ja word for word; noun / particle / verb fields match the headword; spot-check nounRank / verbRank with \`python3 ${FREQ} <word>\` (dictionary forms, kanji and kana); every listLinks id exists in ${VLIST} (grep it). Put the exact corrected value in fix.` },
]
const writePrompt = d => `Write full entries for the ${d.rows.filter(r => !r.existing).length} NEW collocations in topic "${d.key}" — ${d.name}. Their light entries (romaji, ja, noun/verb parts, judged scores, trap) are in ${CJSON}; look them up by id. For style and consistency, read this topic's existing entries in ${CURRENT} (blocks[].items[], same fields) — match their tone, length and conventions.

${COMMON}

NEW IDS: ${d.rows.filter(r => !r.existing).map(r => r.id).join(', ')}
ALREADY WRITTEN IN THIS TOPIC (do not rewrite; use for contrast references): ${d.rows.filter(r => r.existing).map(r => r.romaji).join(', ') || '(none)'}
WHOLE FINAL LIST (for contrast references):
${finalLines}

FIELDS (keep slug = the candidate id):
- romaji, polite, ja, kana, politeJa (null when polite is null), english (2–6 words).
- use: one or two plain sentences — when you say it, the form you'll actually hear most, particle drop, any aspect trap.
- noun / nounJa / particle / verb / verbJa (dictionary form; ii, not yoi). verbSense: what the verb or adjective means on its own.
- englishVerb: the English word a learner would reach for, or null. trap: one line on a real English-speaker mistake, or null (null is normal for guessable sets).
- partners: up to 4 other everyday nouns that take this verb in the same sense ("mado (window)"), [] if none worth listing.
- example: ONE short casual sentence (3–9 words) a native speaker would really say to a friend, in the most common spoken form; examplePolite: the same sentence in desu/masu (null only for slang/rough).
- contrastGroup: a shared name for sets learned side by side (open/close pairs, ga/o pairs, wear verbs); reuse names already used in ${CURRENT} where they fit (e.g. wear-verbs, take-verbs, denki-tsuku-tsukeru, furu-sky). null if none.
- nounRank / verbRank: run \`python3 ${FREQ} <noun forms> <verb forms>\` (drama-subtitle ranks; kanji and kana, batch the lookups); null with freqNote when there is no usable rank. commonness / trapRisk / speakNeed: carry over, correcting if wrong.
- listLinks: ids from ${VLIST} that the set builds on (e.g. doa o akeru -> H-akeru if it exists); grep, don't guess. alsoIn: [] unless you find a pointer. flags. notes: null or one short line.`

const built = await pipeline(byDomain,
  d => d.rows.some(r => !r.existing)
    ? agent(writePrompt(d), { label: `write:${d.key}`, phase: 'Write', schema: ITEMS_SCHEMA })
    : Promise.resolve({ items: [] }),
  (draft, d) => !draft || !draft.items.length ? { draft: draft || { items: [] }, reviews: [] } :
    parallel(LENSES.map(l => () => agent(`Review the NEW entries for topic "${d.key}" — ${d.name} — of a Japanese collocation list (casual default, polite pair, romaji-first, audio-first learner).

${COMMON}

${l.text}

DRAFT:
${JSON.stringify(draft, null, 1)}

Report every problem (slug, field, problem, exact fix, severity: fatal = wrong/misleading, major = unnatural or inaccurate, minor = polish). Items that should not be in the list go in cut. summary: 2–3 lines.`,
      { label: `verify:${d.key} ${l.key}`, phase: 'Verify', schema: ISSUES_SCHEMA })))
      .then(reviews => ({ draft, reviews: reviews.map((r, i) => r ? { lens: LENSES[i].key, ...r } : null).filter(Boolean) })),
  (dr, d) => !dr.draft.items.length ? { items: [], changelog: [], dropped: [] } :
    agent(`Finalise the NEW entries for topic "${d.key}" — ${d.name}. Below: the draft and ${dr.reviews.length} independent reviews (naturalness, trap truth, meaning, form).

${COMMON}

Apply every fatal and major fix unless it is clearly wrong; apply minor fixes that are clearly right. Naturalness wins on wording, trap truth on whether a form is wrong, meaning on meaning. Drop an item only when two or more reviewers want it cut or it is wrong beyond repair (list it in dropped). Never add items. Keep slugs unchanged. Return every remaining item with every field, a changelog and dropped.

DRAFT:
${JSON.stringify(dr.draft, null, 1)}

REVIEWS:
${JSON.stringify(dr.reviews, null, 1)}`,
      { label: `fix:${d.key}`, phase: 'Fix', schema: FIXED_SCHEMA }).then(r => r || { items: dr.draft.items, changelog: [], dropped: [], unreconciled: true }),
  (fixed, d) => {
    const existing = d.rows.filter(r => r.existing)
    const lines = [
      ...existing.map(r => `${r.id} | ${r.romaji} | ${r.english} | written (full entry in ${CURRENT}: find the item whose romaji is "${r.romaji}")`),
      ...fixed.items.map(it => `${it.slug} | ${it.romaji} | ${it.english} | new | contrastGroup: ${it.contrastGroup || '—'}`),
    ]
    return agent(`Chunk topic "${d.key}" — ${d.name} — of the collocation list into learning blocks. The topic now holds ${lines.length} sets: some already written (their full entries, with their current contrastGroup, are in ${CURRENT}) and some new.

${COMMON}

SETS (id | romaji | english | status):
${lines.join('\n')}

WHOLE FINAL LIST (for cross-topic contrast groups):
${finalLines}

Do:
- blocks: group by meaning first (a situation, a natural set like open/close or on/off, a verb family), 4–5 sets per block (3 or 6 when natural; never pad, never split a natural set). Order blocks from the most common, simplest sets to less common ones, and sets within a block the same way. label: 1–4 plain words. rationale: one line. interference: one line on what gets confused and how to keep it apart, or "none". Use the ids exactly as given; every id in exactly one block.
- contrastGroups: one row per id with its group name (or null). Keep existing names where they still fit; give new natural pairs/sets a shared name; groups may span topics.
- textFixes: only for WRITTEN entries whose use / notes / trap / partners mention a set that is no longer in the final list in a way that now reads wrong, or that should point at a new neighbour (e.g. doa ga aku now sits beside doa o akeru). Give the full new value. Usually few or none.`,
      { label: `chunk:${d.key}`, phase: 'Chunk', schema: CHUNK_SCHEMA }).then(ch => ({ key: d.key, name: d.name, fixed, chunk: ch }))
  },
)

// ---------- Assemble ----------
phase('Assemble')
const domainsOut = built.filter(Boolean)
const failed = byDomain.filter(d => !domainsOut.some(x => x.key === d.key && x.chunk)).map(d => d.key)
if (failed.length) log(`WARNING: topics without chunks: ${failed.join(', ')}`)
const newById = {}
domainsOut.forEach(x => x.fixed.items.forEach(it => { newById[it.slug] = it }))
const finalIds = new Set(final.map(r => r.id))
const droppedInFix = domainsOut.flatMap(x => x.fixed.dropped.map(dd => ({ ...dd, domain: x.key })))
droppedInFix.forEach(dd => finalIds.delete(dd.slug))
// Every final id must sit in exactly one block; report strays.
const placed = new Map()
domainsOut.forEach(x => x.chunk && x.chunk.blocks.forEach((b, bi) => {
  b.id = `${x.key}-${bi + 1}`
  b.ids = b.ids.filter(id => finalIds.has(id) && !placed.has(id))
  b.ids.forEach(id => placed.set(id, b.id))
}))
domainsOut.forEach(x => { if (x.chunk) x.chunk.blocks = x.chunk.blocks.filter(b => b.ids.length) })
const unplaced = [...finalIds].filter(id => !placed.has(id))
if (unplaced.length) log(`Unplaced after chunking: ${unplaced.join(', ')}`)

const metaById = Object.fromEntries(final.map(r => [r.id, r]))
const itemLine = id => { const m = metaById[id]; const n = newById[id]; return `${id} | ${m.domain} | ${m.romaji} | ${m.english} | ${m.existing ? 'written' : 'new'} | cg:${n ? n.contrastGroup || '—' : 'see entry'} | block:${placed.get(id)}` }
const cons = await agent(`Cross-topic consistency pass over the final collocation list (${placed.size} sets). Written entries are in ${CURRENT}; new entries are summarised below with their contrast groups.

${COMMON}

Check: (1) true duplicates across topics (same set, same sense) — drop the weaker; (2) the same word spelled the same way everywhere (koohii, eakon, -te ru contractions); (3) natural pairs that should share a contrast group do (doa o akeru / doa o shimeru / doa ga aku; denki o tsukeru / kesu; wear verbs and their take-off verbs) and group names are consistent across topics; (4) englishVerb uses one plain word ("take", not "take (medicine)"). Return fixes (id, field, full new value) — they may target written or new entries — drops and notes. Only change what is wrong.

SETS (id | topic | romaji | english | status | contrastGroup | block):
${[...placed.keys()].map(itemLine).join('\n')}`,
  { label: 'assemble:consistency', phase: 'Assemble', schema: CONS_SCHEMA })
const consDrops = cons ? cons.drops.filter(d => placed.has(d.id)) : []
consDrops.forEach(d => {
  const bid = placed.get(d.id)
  domainsOut.forEach(x => x.chunk && x.chunk.blocks.forEach(b => { if (b.id === bid) b.ids = b.ids.filter(id => id !== d.id) }))
  placed.delete(d.id)
})
domainsOut.forEach(x => { if (x.chunk) x.chunk.blocks = x.chunk.blocks.filter(b => b.ids.length) })

const allBlocks = domainsOut.flatMap(x => x.chunk ? x.chunk.blocks.map(b => ({ ...b, domain: x.key, domainName: x.name })) : [])
const order = await agent(`Order the ${allBlocks.length} chunks of the collocation list (${placed.size} sets) into 4 stages that run alongside the learner's versatility list (a chunk in Stage N is learned during versatility Stage N).

Versatility stages, for alignment: Stage 1 — greetings, what/who/where, basic verbs (suru, naru, aru, iru, iku, kuru, deru, hairu), past and negative. Stage 2 — eat/drink/sleep, look, know, say/ask, think/feel, give/get; -te forms, -teru. Stage 3 — plans, meeting up, buy/use/make, trouble. Stage 4 — start/stop, take/put/cost/call (toru, kakaru, kakeru, dasu, ireru), patterns like -sugiru.

Principles: the most common, most typical sets first — the daily routine, weather, eating and drinking, going and coming home, opening and closing, health basics; simpler forms before complex ones; interleave topics so each stage covers several areas of daily life; keep each topic's internal chunk order (body-1 before body-2); roughly equal item counts per stage. Every chunkId exactly once. name: "Stage 1" … "Stage 4". summary: one plain line on what the learner can talk about after it.

CHUNKS (chunkId | topic | label | sets):
${allBlocks.map(b => `${b.id} | ${b.domainName} | ${b.label} | ${b.ids.map(id => metaById[id] ? metaById[id].romaji : id).join(', ')}`).join('\n')}`,
  { label: 'assemble:course-order', phase: 'Assemble', schema: ORDER_SCHEMA })

const cutResults = (await cutsPromise).filter(Boolean).flatMap(r => r.verdicts)
log(`Final: ${placed.size} sets in ${allBlocks.length} chunks; ${cutResults.length} cut verdicts; ${droppedInFix.length} dropped in review; ${consDrops.length} dropped for consistency`)

return {
  final, selection: { votes, selectorNotes: okSels.map(s => s.notes), boundaryNotes: bound.notes },
  newEntries: Object.values(newById).filter(it => placed.has(it.slug)),
  topics: domainsOut.map(x => ({ key: x.key, name: x.name, blocks: x.chunk ? x.chunk.blocks : [], contrastGroups: x.chunk ? x.chunk.contrastGroups : [], textFixes: x.chunk ? x.chunk.textFixes : [], changelog: x.fixed.changelog, dropped: x.fixed.dropped, unreconciled: !!x.fixed.unreconciled })),
  consistency: cons, consDrops, unplaced,
  stages: order ? order.stages : null,
  cutVerdicts: cutResults, droppedInFix,
}