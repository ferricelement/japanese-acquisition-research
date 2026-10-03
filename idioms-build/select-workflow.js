export const meta = {
  name: 'select-write-japanese-idioms',
  description: 'Select the ~100 most common Japanese idioms from 758 measured candidates, write and review full entries, chunk, order into 4 stages, and give every cut a reason',
  phases: [
    { title: 'Select', detail: '3 selectors (data / everyday Japan / coverage) + boundary' },
    { title: 'Write', detail: 'full entries per topic' },
    { title: 'Verify', detail: 'naturalness, meaning & literal sense, register & real use, form' },
    { title: 'Fix', detail: 'apply reviews per topic' },
    { title: 'Chunk', detail: 'learning blocks per topic' },
    { title: 'Side', detail: 'cut reasons and the English-idiom map' },
    { title: 'Assemble', detail: 'consistency and course order' },
  ],
}

const RESEARCH = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research'
const IB = RESEARCH + '/idioms-build'
const CB = RESEARCH + '/collocations-build'
const TSV = IB + '/candidates.tsv'
const CJSON = IB + '/candidates.json'
const HARVEST = IB + '/harvest.json'
const COLL = RESEARCH + '/21-list-collocations.json'
const VLIST = CB + '/versatility-items.txt'
const TARGET = 100

const CATS = [
  ['mood', 'Feelings & temper'], ['character', 'What people are like'], ['relations', 'Getting on with people'],
  ['talk', 'Talking & listening'], ['effort', 'Effort, ease & difficulty'], ['attention', 'Noticing & the mind'],
  ['fortune', 'Luck, trouble & outcomes'],
]
const CKEYS = CATS.map(c => c[0])
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai', 'formal', 'humble']

const COMMON = `CONTEXT
The learner studies Japanese audio-first (listening and speaking, romaji only, production over recognition). They have a 484-item versatility list (${VLIST}) and a collocation list of literal noun + verb sets (${COLL}). This is the IDIOM list: the Japanese equivalents of "piece of cake" or "lend a hand" — set phrases whose meaning is figurative (kanyouku and similar).

THE CRITERION IS COMMONNESS: the idioms people actually say in everyday conversation, most common first. The learner said how common a set is, is exactly what makes it belong. Colourful but rare or bookish idioms do not belong.

THE EVIDENCE — ${TSV} (one candidate per line, most frequent first; ${CJSON} has the full light entries by id):
- count / per_million: occurrences in 3.17M lines of Japanese film/TV subtitles. source = pairs (the noun + verb pair on dictionary forms — catches inflections and dropped particles) or phrase (the idiom's written forms). pair_count shows the raw pair when it was set aside because other uses dominate it.
- judged_commonness (1–5): a native-speaker judgement of how often people say it.
CAVEATS — correct with judgement: the corpus is mostly subtitles for foreign films, so dramatic or violent lines are over-counted (te o dasu "don't touch her", mi o mamoru) and casual Japanese talk is under-counted (kuuki o yomu 14, ki ga omoi 8). Counts under ~20 are noisy. Some idioms share a literal twin (te o ageru = raise your hand AND raise a hand to someone) — the count covers both.

OUT OF SCOPE: literal collocations (in ${COLL} — e.g. ki ni iru, osewa ni naru, yaku ni tatsu, ki ga tsuku, ki o tsukau, me ga sameru are there: never repeat them); the versatility list's ki ni naru, ki ni suru, ki ga suru, ki o tsukeru; single words, even slangy ones (rakushou, yabai, kiraku) — they can be named in notes as the plain alternative; bookish proverbs and four-character compounds that people rarely say aloud.

ENTRY CONVENTIONS: romaji = the plain (casual) form as people say it, verbs in dictionary form (te o kasu, atama ni kuru); a fixed negative or fixed form stays as said (kentou mo tsukanai, ii kagen ni shite). polite = its desu/masu form, or null when there is no register difference. Romaji: modified Hepburn, lowercase, no macrons, long vowels spelled out (sou, koohii), particles wa/o/e, っ doubles the next consonant (t before ch), words separated by spaces, verb + auxiliaries joined (atama ni kita, te ga hanasenai), copula and sentence-final particles separate.`

const NSTR = { type: ['string', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }
const STRS = { type: 'array', items: { type: 'string' } }
const SEL_SCHEMA = { type: 'object', required: ['keep', 'notes'], properties: { keep: STRS, notes: { type: 'string' } } }
const FINAL_ROW = { type: 'object', required: ['id', 'category', 'romaji', 'english'], properties: {
  id: { type: 'string' }, category: { type: 'string', enum: CKEYS }, romaji: { type: 'string' }, english: { type: 'string' } } }
const BOUND_SCHEMA = { type: 'object', required: ['final', 'notes'], properties: { final: { type: 'array', items: FINAL_ROW }, notes: { type: 'string' } } }
const EX = { type: 'object', required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } }
const ITEM_PROPS = {
  slug: { type: 'string', description: 'the candidate id, unchanged' }, romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, politeJa: NSTR,
  english: { type: 'string', description: 'what it means, 2-8 words' }, literal: { type: 'string', description: 'word for word' },
  englishIdiom: NSTR, use: { type: 'string' },
  noun: NSTR, nounJa: NSTR, particle: NSTR, verb: NSTR, verbJa: NSTR,
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } }, contrastGroup: NSTR,
  example: EX, examplePolite: { type: ['object', 'null'], required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } },
  commonness: SCORE, speakNeed: SCORE, listLinks: STRS, alsoIn: STRS, notes: NSTR,
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
const CHUNK_SCHEMA = { type: 'object', required: ['blocks', 'contrastGroups'], properties: {
  blocks: { type: 'array', items: { type: 'object', required: ['label', 'rationale', 'interference', 'ids'], properties: {
    label: { type: 'string' }, rationale: { type: 'string' }, interference: { type: 'string' }, ids: STRS } } },
  contrastGroups: { type: 'array', items: { type: 'object', required: ['id', 'group'], properties: { id: { type: 'string' }, group: NSTR } } } } }
const CUTS_SCHEMA = { type: 'object', required: ['verdicts'], properties: { verdicts: { type: 'array', items: { type: 'object', required: ['id', 'verdict', 'reason', 'coveredBy'], properties: {
  id: { type: 'string' }, verdict: { type: 'string', enum: ['maybe', 'covered', 'less-common', 'bookish', 'literal', 'single-word', 'narrow'] },
  reason: { type: 'string' }, coveredBy: NSTR } } } } }
const FE_SCHEMA = { type: 'object', required: ['rows'], properties: { rows: { type: 'array', items: { type: 'object', required: ['english', 'japanese', 'romaji', 'note'], properties: {
  english: { type: 'string' }, japanese: { type: 'string' }, romaji: { type: 'string' }, note: { type: 'string' } } } } } }
const CONS_SCHEMA = { type: 'object', required: ['fixes', 'drops', 'notes'], properties: {
  fixes: { type: 'array', items: { type: 'object', required: ['id', 'field', 'value'], properties: {
    id: { type: 'string' }, field: { type: 'string', enum: ['romaji', 'polite', 'english', 'literal', 'englishIdiom', 'use', 'notes', 'contrastGroup', 'flags'] },
    value: { type: ['string', 'array', 'null'], items: { type: 'string' } } } } },
  drops: { type: 'array', items: { type: 'object', required: ['id', 'reason'], properties: { id: { type: 'string' }, reason: { type: 'string' } } } },
  notes: { type: 'string' } } }
const ORDER_SCHEMA = { type: 'object', required: ['stages'], properties: { stages: { type: 'array', items: { type: 'object', required: ['name', 'summary', 'chunkIds'], properties: {
  name: { type: 'string' }, summary: { type: 'string' }, chunkIds: STRS } } } } }

// ---------- Select ----------
phase('Select')
const SELECTORS = [
  { key: 'data', lens: 'DATA-FIRST: rank by count and trust the corpus, except where an idiom is plainly a film-drama line or its count is mostly a literal twin.' },
  { key: 'everyday', lens: 'EVERYDAY-JAPAN-FIRST: you are a native speaker in Japan. Pick the idioms people really say in daily conversation — with friends, at work, at home, about colleagues and family — using counts as evidence but lifting casual idioms the foreign-film corpus under-counts (kuuki o yomu, ki ga omoi) and dropping dramatic lines it over-counts.' },
  { key: 'coverage', lens: 'COVERAGE: make sure every topic has its core idioms and natural pairs stay together (kuchi ga karui / kuchi ga katai, kubi ni naru / kubi ni suru, te ni ireru / te ni hairu, ki ga au and its opposite if common), and that the idioms behind the most common English ones (piece of cake, lend a hand, I owe you one, read the room) are in — then fill with the most common remaining.' },
]
const sels = await parallel(SELECTORS.map(s => () => agent(`Select the ~${TARGET} idioms (${TARGET - 8}–${TARGET + 8}) for the list from the 758 candidates in ${TSV}. Read the whole file (tab-separated; read it in pieces).

${COMMON}

YOUR LENS: ${s.lens}

Rules: one entry per idiom — variants of one idiom (kentou ga tsuku / kentou ga tsukanai / kentou mo tsukanai; aite ni suru / aite ni shinai) count once: keep the form people say most. Never pick an idiom that is in the collocation list. Every one of the 7 topics should have several. Return the ids to keep and a short note on your hardest calls.`,
  { label: `select:${s.key}`, phase: 'Select', schema: SEL_SCHEMA })))
const votes = {}
const okSels = sels.filter(Boolean)
okSels.forEach(s => new Set(s.keep).forEach(id => { votes[id] = (votes[id] || 0) + 1 }))
const need = okSels.length >= 2 ? 2 : 1
const base = Object.keys(votes).filter(id => votes[id] >= need)
const fewer = Object.keys(votes).filter(id => votes[id] < need)
log(`Selection: ${base.length} ids with ≥${need} votes, ${fewer.length} with fewer`)
const bound = await agent(`Three independent selectors voted on the idiom list. Bring it to ${TARGET} (${TARGET - 5}–${TARGET + 5}) and return the FINAL list with each item's metadata from ${TSV} (id, category, romaji, english). Read the file to look ids up.

${COMMON}

BASE SET (${need}+ votes): ${base.join(', ')}

FEWER VOTES: ${fewer.map(id => `${id}(${votes[id]})`).join(', ')}

SELECTOR NOTES:
${okSels.map((s, i) => `${SELECTORS[i].key}: ${s.notes}`).join('\n')}

Merge variants of one idiom into its most-said form, keep natural pairs whole, keep every topic represented, exclude anything in the collocation list (${COLL}), and let commonness decide the boundary. Use only ids that exist in the file; you may move an item to a better topic.`,
  { label: 'select:boundary', phase: 'Select', schema: BOUND_SCHEMA })
if (!bound) throw new Error('boundary failed')
const final = []
const seen = new Set()
for (const r of bound.final) if (!seen.has(r.id)) { seen.add(r.id); final.push(r) }
log(`Final selection: ${final.length}`)
const finalLines = final.map(r => `${r.id} | ${r.category} | ${r.romaji} | ${r.english}`).join('\n')
const byCat = CATS.map(([key, name]) => ({ key, name, rows: final.filter(r => r.category === key) })).filter(c => c.rows.length)

// ---------- Side: cut reasons and the English-idiom map (need only the final list) ----------
const sidePromise = parallel([
  ...CATS.map(([key, name]) => () => agent(`Give a verdict and a one-line plain-English reason (for a learner deciding whether to ask for it back) to every candidate in topic "${key}" of ${TSV} that is NOT in the final list below. Read the file, filter by category = ${key}, skip ids in the final list.

${COMMON}

Verdicts: maybe (a strong idiom that only just missed — the best ~10%), covered (a kept idiom says the same, or it is a variant of one; name it in coveredBy), less-common (real, but said less than the kept ones — cite the count when it helps), bookish (written, formal or literary), literal (not figurative, or already in the collocation list), single-word (one word, not an idiom), narrow (one situation only).

FINAL LIST (id | topic | romaji | english):
${finalLines}`,
    { label: `cuts:${key}`, phase: 'Side', schema: CUTS_SCHEMA })),
  () => agent(`Check and tidy the "From English" map: English idioms that have NO Japanese idiom behind them, with how Japanese people say the same thing instead. The draft rows are in ${HARVEST} under "fromEnglish" (english, japanese, romaji, note).

${COMMON}

FINAL IDIOM LIST (id | topic | romaji | english):
${finalLines}

Do: (1) drop any row whose English idiom IS covered by an idiom in the final list (those are shown with the idiom instead); (2) keep the ~50 English idioms an English speaker is most likely to reach for in conversation, dropping rare or very British/American-only ones; (3) make sure the Japanese is what people really say (natural, casual unless noted), and the romaji follows the convention and matches the Japanese; (4) note: one short line — the nuance, or a single word that also works (piece of cake -> the word rakushou is the everyday way, if no idiom is in the list for it). Return the rows, most common English idioms first.`,
    { label: 'side:from-english', phase: 'Side', schema: FE_SCHEMA }),
])

// ---------- Write -> Verify -> Fix -> Chunk, per topic ----------
const LENSES = [
  { key: 'natural', text: 'LENS: NATIVE-SPEAKER NATURALNESS. You are a native Japanese speaker (Tokyo, 30s). Is the headword the form people really say (particle, verb form, fixed negatives)? Would a real person say each example and examplePolite exactly like that, in that situation? Flag stiff or textbook phrasing, translationese, idioms used in the wrong situation, casual sentences that are secretly polite or the reverse, and English that misses the meaning. Put the full corrected sentence (romaji + ja + english) in fix.' },
  { key: 'meaning', text: 'LENS: MEANING & LITERAL SENSE. Is english exactly what the idiom means (not too broad, not a different nuance)? Is literal a faithful word-for-word reading of the parts? Is englishIdiom a real English idiom with the same meaning and tone (null is better than a loose match)? Does use say when and how it is said, including fixed forms (mostly negative, mostly past) and anything it is easily confused with? Are contrast pairs right?' },
  { key: 'register', text: 'LENS: REGISTER & REAL-LIFE USE. Is each idiom really said in everyday conversation today, or mostly written, formal, old-fashioned or dramatic? (Cut it with the reason if it does not belong in a list of the ~100 most common.) Who says it, and is it rude, rough, gendered, slangy or humble — are the flags right? Is the polite form something people actually say, with the same meaning (null when an idiom has no natural polite use)? Is anything here really literal or already in the collocation list (cut it)?' },
  { key: 'form', text: `LENS: FORM & DATA. Romaji follows the convention exactly and matches ja / kana sound for sound; kana is the right reading; polite / politeJa agree and are correctly conjugated; example romaji matches example ja word for word; noun / particle / verb fields match the headword or are null; every listLinks id exists in ${VLIST} (grep it); no two entries are the same idiom. Put the exact corrected value in fix.` },
]
const built = await pipeline(byCat,
  c => agent(`Write full entries for the ${c.rows.length} idioms in topic "${c.key}" — ${c.name}. Their light entries (romaji, ja, literal, english, englishIdiom, parts, judged scores, flags, why) and corpus counts are in ${CJSON}; look them up by id.

${COMMON}

IDS: ${c.rows.map(r => r.id).join(', ')}
WHOLE FINAL LIST (for contrast references):
${finalLines}

FIELDS (keep slug = the candidate id):
- romaji, polite, ja, kana, politeJa (null when polite is null).
- english: what it means, 2–8 words. literal: word for word ("lend a hand", "my ears hurt"). englishIdiom: the closest English idiom with the same meaning and tone, or null.
- use: one or two plain sentences — when you say it, about whom, the form you'll hear most (atama ni kita, te ga hanasenai), and what it gets confused with.
- noun / nounJa / particle / verb / verbJa: for noun + particle + verb or adjective idioms (te / o / kasu), else null.
- flags (rough, slang, humble, formal, casual-only...). contrastGroup: a shared name for idioms learned side by side (kuchi ga karui / katai; kubi ni naru / suru), or null.
- example: ONE short casual sentence (3–10 words) a native speaker would really say to a friend, using the idiom in its most common form; examplePolite: the same sentence in desu/masu to a coworker (null when the idiom is too casual or rough for polite speech).
- commonness / speakNeed: carry over, correcting if wrong. listLinks: ids from ${VLIST} the idiom builds on (grep; don't guess). alsoIn: pointers like "21-list-collocations: ki ni iru" when a related literal set is in that list, else []. notes: null or one short line (a plain single-word alternative, a variant form).`,
    { label: `write:${c.key}`, phase: 'Write', schema: ITEMS_SCHEMA }),
  (draft, c) => draft ? parallel(LENSES.map(l => () => agent(`Review topic "${c.key}" — ${c.name} — of a Japanese idiom list (casual default, polite pair, romaji-first, audio-first learner).

${COMMON}

${l.text}

DRAFT:
${JSON.stringify(draft, null, 1)}

Report every problem (slug, field, problem, exact fix, severity: fatal = wrong/misleading, major = unnatural or inaccurate, minor = polish). Idioms that should not be in the list go in cut. summary: 2–3 lines.`,
      { label: `verify:${c.key} ${l.key}`, phase: 'Verify', schema: ISSUES_SCHEMA })))
      .then(reviews => ({ draft, reviews: reviews.map((r, i) => r ? { lens: LENSES[i].key, ...r } : null).filter(Boolean) })) : null,
  (dr, c) => dr ? agent(`Finalise topic "${c.key}" — ${c.name} — of the idiom list. Below: the draft and ${dr.reviews.length} reviews (naturalness, meaning, register, form).

${COMMON}

Apply every fatal and major fix unless it is clearly wrong; apply minor fixes that are clearly right. Naturalness wins on wording, meaning on meaning, register on whether an idiom is really said. Drop an idiom only when two or more reviewers want it cut or it is wrong beyond repair (list it in dropped). Never add items. Keep slugs unchanged. Return every remaining item with every field, a changelog and dropped.

DRAFT:
${JSON.stringify(dr.draft, null, 1)}

REVIEWS:
${JSON.stringify(dr.reviews, null, 1)}`,
    { label: `fix:${c.key}`, phase: 'Fix', schema: FIXED_SCHEMA }).then(r => r || { items: dr.draft.items, changelog: [], dropped: [], unreconciled: true }) : null,
  (fixed, c) => fixed ? agent(`Chunk topic "${c.key}" — ${c.name} — of the idiom list into learning blocks.

${COMMON}

IDIOMS (id | romaji | english | literal | contrastGroup):
${fixed.items.map(it => `${it.slug} | ${it.romaji} | ${it.english} | ${it.literal} | ${it.contrastGroup || '—'}`).join('\n')}

Do:
- blocks: group by meaning first (a feeling, a situation, a natural pair), 4–5 idioms per block (3 or 6 when natural; never pad, never split a pair). Order blocks from the most common idioms to less common ones, and idioms within a block the same way. label: 1–4 plain words. rationale: one line. interference: one line on what gets confused and how to keep it apart, or "none". Every id in exactly one block.
- contrastGroups: one row per id with its group (or null); keep existing names where they fit.`,
    { label: `chunk:${c.key}`, phase: 'Chunk', schema: CHUNK_SCHEMA }).then(ch => ({ key: c.key, name: c.name, fixed, chunk: ch })) : null,
)

// ---------- Assemble ----------
phase('Assemble')
const topics = built.filter(Boolean)
const entries = topics.flatMap(t => t.fixed.items)
const kept = new Set(entries.map(e => e.slug))
const placed = new Map()
topics.forEach(t => t.chunk && t.chunk.blocks.forEach((b, bi) => {
  b.id = `${t.key}-${bi + 1}`
  b.ids = b.ids.filter(id => kept.has(id) && !placed.has(id))
  b.ids.forEach(id => placed.set(id, b.id))
}))
topics.forEach(t => { if (t.chunk) t.chunk.blocks = t.chunk.blocks.filter(b => b.ids.length) })
const unplaced = [...kept].filter(id => !placed.has(id))
if (unplaced.length) log(`Unplaced after chunking: ${unplaced.join(', ')}`)
const byId = Object.fromEntries(entries.map(e => [e.slug, e]))
const cons = await agent(`Cross-topic consistency pass over the final idiom list (${placed.size} idioms).

${COMMON}

Check: (1) true duplicates across topics (the same idiom, or two forms of one) — drop the weaker; (2) anything that is in the collocation list (${COLL}) — drop it; (3) the same word spelled the same way everywhere; (4) natural pairs share a contrast group, with one name. Return fixes (id, field, full new value), drops and notes. Only change what is wrong.

IDIOMS (id | topic | romaji | english | literal | contrastGroup | block):
${[...placed.keys()].map(id => { const e = byId[id]; return `${id} | ${final.find(r => r.id === id)?.category} | ${e.romaji} | ${e.english} | ${e.literal} | ${e.contrastGroup || '—'} | ${placed.get(id)}` }).join('\n')}`,
  { label: 'assemble:consistency', phase: 'Assemble', schema: CONS_SCHEMA })
if (cons) {
  for (const f of cons.fixes) if (byId[f.id]) byId[f.id][f.field] = f.value
  for (const d of cons.drops) {
    const bid = placed.get(d.id)
    topics.forEach(t => t.chunk && t.chunk.blocks.forEach(b => { if (b.id === bid) b.ids = b.ids.filter(id => id !== d.id) }))
    placed.delete(d.id)
  }
  topics.forEach(t => { if (t.chunk) t.chunk.blocks = t.chunk.blocks.filter(b => b.ids.length) })
}
const allBlocks = topics.flatMap(t => t.chunk ? t.chunk.blocks.map(b => ({ ...b, topicName: t.name })) : [])
const order = await agent(`Order the ${allBlocks.length} chunks of the idiom list (${placed.size} idioms) into 4 stages that run alongside the learner's versatility list (a chunk in Stage N is learned during versatility Stage N).

Versatility stages, for alignment: Stage 1 — greetings, what/who/where, basic verbs, past and negative. Stage 2 — eat/drink/sleep, look, know, say/ask, think/feel, give/get; -te forms, -teru. Stage 3 — plans, meeting up, buy/use/make, trouble. Stage 4 — start/stop, take/put/cost/call, patterns like -sugiru.

Principles: the most common idioms first, and simple, short ones before long or grammatically harder ones (fixed negatives, causatives); interleave topics so each stage covers several; keep each topic's internal chunk order (mood-1 before mood-2); roughly equal item counts per stage. Every chunkId exactly once. name: "Stage 1" … "Stage 4". summary: one plain line on what the learner can say after it.

CHUNKS (chunkId | topic | label | idioms):
${allBlocks.map(b => `${b.id} | ${b.topicName} | ${b.label} | ${b.ids.map(id => byId[id].romaji).join(', ')}`).join('\n')}`,
  { label: 'assemble:course-order', phase: 'Assemble', schema: ORDER_SCHEMA })

const side = await sidePromise
const cutVerdicts = side.slice(0, CATS.length).filter(Boolean).flatMap(r => r.verdicts)
const fe = side[CATS.length]
log(`Final: ${placed.size} idioms in ${allBlocks.length} chunks; ${cutVerdicts.length} cut verdicts; ${fe ? fe.rows.length : 0} English idioms without a Japanese idiom`)

return {
  final, votes, selectorNotes: okSels.map(s => s.notes), boundaryNotes: bound.notes,
  entries: entries.filter(e => placed.has(e.slug)),
  topics: topics.map(t => ({ key: t.key, name: t.name, blocks: t.chunk ? t.chunk.blocks : [], contrastGroups: t.chunk ? t.chunk.contrastGroups : [], changelog: t.fixed.changelog, dropped: t.fixed.dropped, unreconciled: !!t.fixed.unreconciled })),
  droppedInFix: topics.flatMap(t => t.fixed.dropped), consistency: cons, unplaced,
  stages: order ? order.stages : null,
  cutVerdicts, fromEnglish: fe ? fe.rows : [],
}