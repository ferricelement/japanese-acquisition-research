export const meta = {
  name: 'vet-idiom-extras',
  description: 'Vote on 169 idioms the fix step added unasked, review the ones that make the bar four ways, then re-chunk every topic and re-order the course',
  phases: [
    { title: 'Judge', detail: '3 judges vote each extra in or out against the selected 252' },
    { title: 'Verify', detail: 'naturalness, meaning, register, form for the kept extras' },
    { title: 'Fix', detail: 'apply reviews; no additions' },
    { title: 'Chunk', detail: 're-chunk every topic' },
    { title: 'Assemble', detail: 'course order' },
  ],
}

const RESEARCH = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research'
const IB = RESEARCH + '/idioms-build'
const EXTRAS = IB + '/extras.json'
const SELECTED = IB + '/selected.tsv'
const RESULT = IB + '/result.json'
const COLL = RESEARCH + '/21-list-collocations.json'
const VLIST = RESEARCH + '/collocations-build/versatility-items.txt'
const CLI = RESEARCH + '/collocations-build/count_cli.py'
const CATS = [['mood', 'Feelings & temper'], ['character', 'What people are like'], ['relations', 'Getting on with people'], ['talk', 'Talking & listening'], ['effort', 'Effort, ease & difficulty'], ['attention', 'Noticing & the mind'], ['fortune', 'Luck, trouble & outcomes']]
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai', 'formal', 'humble', 'saying', 'four-character']
const selected = args.selected.map(([id, cat]) => ({ id, cat }))
const extras = args.extras.map(([id, cat]) => ({ id, cat }))
const extraIds = new Set(extras.map(e => e.id))

const COMMON = `CONTEXT
The learner studies Japanese audio-first (listening and speaking, romaji only). This is their IDIOM list: Japanese idioms in their own right (kanyouku, plus the sayings and four-character phrases people really say), chosen by how commonly they are said. Whether English has an equivalent does not matter. Literal collocations live in a separate list (${COLL}) and are never repeated here; single words (otagaisama, tanabota-type words, rakushou) are out unless they are fixed idiomatic phrases.
Romaji: modified Hepburn, lowercase, no macrons, long vowels spelled out, particles wa/o/e, っ doubles the next consonant (t before ch), words separated by spaces, verb + auxiliaries joined. Counts: occurrences in 3.17M lines of Japanese film/TV subtitles (mostly foreign films: dramatic lines over-counted, casual Japanese talk under-counted); \`python3 ${CLI} phrase <forms>\` or \`pair <noun> <verb> <nounJa> <verbJa>\` counts anything.`

const NSTR = { type: ['string', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }
const STRS = { type: 'array', items: { type: 'string' } }
const VOTE = { type: 'object', required: ['keep', 'notes'], properties: { keep: STRS, notes: { type: 'string' } } }
const EX = { type: 'object', required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } }
const ITEM_PROPS = {
  slug: { type: 'string' }, romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, politeJa: NSTR,
  english: { type: 'string' }, literal: { type: 'string' }, englishIdiom: NSTR, use: { type: 'string' },
  noun: NSTR, nounJa: NSTR, particle: NSTR, verb: NSTR, verbJa: NSTR,
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } }, contrastGroup: NSTR,
  example: EX, examplePolite: { type: ['object', 'null'], required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } },
  commonness: SCORE, speakNeed: SCORE, listLinks: STRS, alsoIn: STRS, notes: NSTR,
}
const ITEM = { type: 'object', required: Object.keys(ITEM_PROPS), properties: ITEM_PROPS }
const ISSUES = { type: 'object', required: ['issues', 'cut', 'summary'], properties: {
  issues: { type: 'array', items: { type: 'object', required: ['slug', 'field', 'problem', 'fix', 'severity'], properties: {
    slug: { type: 'string' }, field: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, severity: { type: 'string', enum: ['fatal', 'major', 'minor'] } } } },
  cut: { type: 'array', items: { type: 'object', required: ['slug', 'reason'], properties: { slug: { type: 'string' }, reason: { type: 'string' } } } },
  summary: { type: 'string' } } }
const FIXED = { type: 'object', required: ['items', 'dropped'], properties: { items: { type: 'array', items: ITEM },
  dropped: { type: 'array', items: { type: 'object', required: ['slug', 'reason'], properties: { slug: { type: 'string' }, reason: { type: 'string' } } } } } }
const CHUNK = { type: 'object', required: ['blocks', 'contrastGroups'], properties: {
  blocks: { type: 'array', items: { type: 'object', required: ['label', 'rationale', 'interference', 'ids'], properties: {
    label: { type: 'string' }, rationale: { type: 'string' }, interference: { type: 'string' }, ids: STRS } } },
  contrastGroups: { type: 'array', items: { type: 'object', required: ['id', 'group'], properties: { id: { type: 'string' }, group: NSTR } } } } }
const ORDER = { type: 'object', required: ['stages'], properties: { stages: { type: 'array', items: { type: 'object', required: ['name', 'summary', 'chunkIds'], properties: {
  name: { type: 'string' }, summary: { type: 'string' }, chunkIds: STRS } } } } }

// ---------- Judge ----------
phase('Judge')
const JUDGES = [
  { key: 'data', lens: 'Weigh the counts most: would its count and judged commonness have put it among the selected idioms?' },
  { key: 'everyday', lens: 'You are a native speaker in Japan: do people really say this in everyday conversation, about as often as the selected idioms?' },
  { key: 'scope', lens: 'Check scope as well as commonness: reject literal sets, collocations, single words, near-duplicates of a selected idiom, and bookish sayings; keep the common ones that are true idioms.' },
]
const votesRaw = await parallel(JUDGES.map(j => () => agent(`A list of ~250 common Japanese idioms was selected (${SELECTED}: id, category, romaji, english, count, judged_commonness). A later step wrote ${extras.length} more idioms that the judges never voted on; they are in ${EXTRAS} (each with its count, judged commonness and full entry). Decide which of the extras clear the same bar as the selected list and should join it. The learner asked for more idioms, so keep every extra that is genuinely as common as the selected ones — but no lower bar.

${COMMON}

YOUR LENS: ${j.lens}

Return the extra ids to keep and a short note.`,
  { label: `judge:${j.key}`, phase: 'Judge', schema: VOTE })))
const votes = {}
votesRaw.filter(Boolean).forEach(v => new Set(v.keep.filter(id => extraIds.has(id))).forEach(id => { votes[id] = (votes[id] || 0) + 1 }))
const kept = extras.filter(e => (votes[e.id] || 0) >= 2)
log(`Extras kept: ${kept.length} of ${extras.length}`)

// ---------- Verify -> Fix (kept extras), then Chunk every topic ----------
const LENSES = [
  { key: 'natural', text: 'LENS: NATIVE-SPEAKER NATURALNESS. Is the headword the form people really say? Would a real person say each example and examplePolite exactly like that? Flag stiff phrasing, translationese, wrong situations, register mismatches, and English that misses the meaning. Full corrected sentence (romaji + ja + english) in fix.' },
  { key: 'meaning', text: 'LENS: MEANING & LITERAL SENSE. Is english exactly what the idiom means? Is literal faithful word for word? Is englishIdiom a real English idiom with the same meaning and tone (null is better than a loose match)? Does use say when, about whom and in what form it is said?' },
  { key: 'register', text: 'LENS: REGISTER & REAL-LIFE USE. Is it really said in everyday conversation today? Are the flags right (rough, slang, humble, formal, saying, four-character)? Is the polite form something people say (null when there is no natural polite use)? Is it literal, a single word, or a collocation (cut it)?' },
  { key: 'form', text: `LENS: FORM & DATA. Romaji follows the convention and matches ja / kana sound for sound; kana is the right reading; polite / politeJa agree and are conjugated correctly; example romaji matches example ja word for word; noun / particle / verb fields match the headword or are null; every listLinks id exists in ${VLIST}.` },
]
const built = await pipeline(CATS,
  ([key, name]) => {
    const ids = kept.filter(e => e.cat === key).map(e => e.id)
    if (!ids.length) return { items: [], dropped: [] }
    return parallel(LENSES.map(l => () => agent(`Review these idioms for topic "${key}" — ${name}: ${ids.join(', ')}. Their entries are in ${EXTRAS} (field "entry", matched by id).

${COMMON}

${l.text}

Report every problem (slug, field, problem, exact fix, severity: fatal / major / minor); idioms that should not be in the list go in cut. summary: 2–3 lines.`,
      { label: `verify:${key} ${l.key}`, phase: 'Verify', schema: ISSUES })))
      .then(reviews => agent(`Finalise these idioms for topic "${key}" — ${name}: ${ids.join(', ')}. Their entries are in ${EXTRAS} (field "entry", matched by id). Apply every fatal and major fix unless clearly wrong, and minor fixes that are clearly right; naturalness wins on wording, meaning on meaning, register on whether an idiom is really said. Drop an idiom only when two or more reviewers want it cut. Return ONLY these idioms — never add any — with every field, plus dropped.

${COMMON}

REVIEWS:
${JSON.stringify(reviews.map((r, i) => r ? { lens: LENSES[i].key, ...r } : null).filter(Boolean), null, 1)}`,
        { label: `fix:${key}`, phase: 'Fix', schema: FIXED }))
      .then(r => ({ items: (r ? r.items : []).filter(it => ids.includes(it.slug)), dropped: r ? r.dropped : [] }))
  },
  (fixed, [key, name]) => {
    const sel = selected.filter(s => s.cat === key).map(s => s.id)
    const lines = [
      ...sel.map(id => `${id} | selected (entry in ${RESULT} under "entries", matched by slug)`),
      ...fixed.items.map(it => `${it.slug} | ${it.romaji} | ${it.english} | added`),
    ]
    return agent(`Chunk topic "${key}" — ${name} — of the idiom list into learning blocks. It holds ${lines.length} idioms: the selected ones (look their romaji, english and contrastGroup up in ${RESULT}) and the added ones below.

${COMMON}

IDIOMS:
${lines.join('\n')}

blocks: group by meaning first (a feeling, a situation, a natural pair), 4–5 idioms per block (3 or 6 when natural; never pad, never split a pair); order blocks from the most common idioms to less common ones, and idioms within a block the same way. label: 1–4 plain words, unique within the topic. rationale: one line. interference: one line, or "none". Every id in exactly one block, using the ids exactly as given. contrastGroups: one row per id with its group (or null); keep existing names where they fit.`,
      { label: `chunk:${key}`, phase: 'Chunk', schema: CHUNK }).then(ch => ({ key, name, fixed, chunk: ch, known: [...sel, ...fixed.items.map(it => it.slug)] }))
  },
)

phase('Assemble')
const topics = built.filter(Boolean)
const placed = new Map()
topics.forEach(t => t.chunk && t.chunk.blocks.forEach((b, bi) => {
  b.id = `${t.key}-${bi + 1}`
  b.ids = b.ids.filter(id => t.known.includes(id) && !placed.has(id))
  b.ids.forEach(id => placed.set(id, b.id))
}))
topics.forEach(t => { if (t.chunk) t.chunk.blocks = t.chunk.blocks.filter(b => b.ids.length) })
const unplaced = topics.flatMap(t => t.known.filter(id => !placed.has(id)))
if (unplaced.length) log(`Unplaced: ${unplaced.join(', ')}`)
const allBlocks = topics.flatMap(t => t.chunk ? t.chunk.blocks.map(b => ({ ...b, topicName: t.name })) : [])
const order = await agent(`Order the ${allBlocks.length} chunks of the idiom list (${placed.size} idioms) into 4 stages that run alongside the learner's versatility list (a chunk in Stage N is learned during versatility Stage N). Romaji for selected ids is in ${RESULT} ("entries", by slug); added ones are named in the chunk rows.

Versatility stages: Stage 1 — greetings, what/who/where, basic verbs, past and negative. Stage 2 — eat/drink/sleep, look, know, say/ask, think/feel, give/get; -te forms, -teru. Stage 3 — plans, meeting up, buy/use/make, trouble. Stage 4 — start/stop, take/put/cost/call, patterns like -sugiru.

Principles: the most common idioms first, short and simple before long or harder ones (fixed negatives, sayings); interleave topics; keep each topic's internal chunk order (mood-1 before mood-2); roughly equal item counts per stage. Every chunkId exactly once. name "Stage 1" … "Stage 4"; summary: one plain line on what the learner can say after it.

CHUNKS (chunkId | topic | label | ids):
${allBlocks.map(b => `${b.id} | ${b.topicName} | ${b.label} | ${b.ids.join(', ')}`).join('\n')}`,
  { label: 'assemble:course-order', phase: 'Assemble', schema: ORDER })

return {
  votes, judgeNotes: votesRaw.filter(Boolean).map(v => v.notes), kept: kept.map(e => e.id),
  vetted: topics.flatMap(t => t.fixed.items), droppedInVet: topics.flatMap(t => t.fixed.dropped),
  topics: topics.map(t => ({ key: t.key, name: t.name, blocks: t.chunk ? t.chunk.blocks : [], contrastGroups: t.chunk ? t.chunk.contrastGroups : [] })),
  unplaced, stages: order ? order.stages : null,
}