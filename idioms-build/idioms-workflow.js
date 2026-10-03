export const meta = {
  name: 'japanese-idioms-250',
  description: 'Build a list of the ~250 most common Japanese idioms (kanyouku, sayings, four-character phrases) by commonness: wider gap hunt, selection, write, review, chunk, order, cut reasons',
  phases: [
    { title: 'Gaps', detail: 'sayings, four-character phrases, non-body kanyouku, daily situations, corpus; loop until dry' },
    { title: 'Select', detail: '3 selectors + boundary, ~250 by commonness' },
    { title: 'Write', detail: 'full entries per topic' },
    { title: 'Verify', detail: 'naturalness, meaning & literal sense, register & real use, form' },
    { title: 'Fix', detail: 'apply reviews' },
    { title: 'Chunk', detail: 'learning blocks per topic' },
    { title: 'Cuts', detail: 'a reason for every candidate left out' },
    { title: 'Assemble', detail: 'consistency and course order' },
  ],
}

const RESEARCH = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research'
const IB = RESEARCH + '/idioms-build'
const CB = RESEARCH + '/collocations-build'
const TSV = IB + '/candidates.tsv'
const CJSON = IB + '/candidates.json'
const COLL = RESEARCH + '/21-list-collocations.json'
const VLIST = CB + '/versatility-items.txt'
const CLI = CB + '/count_cli.py'
const PAIRS = CB + '/corpus/pairs.tsv'
const TARGET = 250

const CATS = [
  ['mood', 'Feelings & temper', 'anger, worry, relief, nerves, embarrassment, disgust, being moved'],
  ['character', 'What people are like', 'personality, temperament, skill, taste, stubborn, picky, talkative, discreet'],
  ['relations', 'Getting on with people', 'getting along, favours, owing, helping, hindering, trust, face, showing up'],
  ['talk', 'Talking & listening', 'speaking up, interrupting, secrets, slips, listening, hearing, nonsense, gossip'],
  ['effort', 'Effort, ease & difficulty', 'easy, hard, too much to handle, slacking off, busy, worn out, trying hard'],
  ['attention', 'Noticing & the mind', 'attention, overlooking, can not stop thinking, being crazy about something, understanding, guessing'],
  ['fortune', 'Luck, trouble & outcomes', 'bad experiences, getting fired, getting carried away, getting caught, settling things, risk, success, fate'],
]
const CKEYS = CATS.map(c => c[0])
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai', 'formal', 'humble', 'saying', 'four-character']

const COMMON = `CONTEXT
The learner studies Japanese audio-first (listening and speaking, romaji only, production over recognition). They have a 484-item versatility list (${VLIST}) and a collocation list of literal noun + verb sets (${COLL}). This is the IDIOM list: Japanese idioms in their own right — kanyouku (te o kasu, atama ni kuru, ki ga au, kao ga hiroi, mimi ga itai, hara ga tatsu, saba o yomu, goma o suru), plus the sayings (kotowaza) and four-character phrases (yojijukugo) that people genuinely say in conversation (saru mo ki kara ochiru, jigou jitoku, isseki nichou).

THE CRITERION IS COMMONNESS: the idioms people actually say, most common first. WHETHER ENGLISH HAS AN EQUIVALENT DOES NOT MATTER — the goal is Japanese idioms, not Japanese versions of English idioms. A rare or bookish idiom does not belong, however colourful; a common one belongs even if it has no English counterpart at all.

THE EVIDENCE — ${TSV}: 758 candidates, most frequent first: id, category, romaji, english, literal, english_idiom, count (occurrences in 3.17M lines of Japanese film/TV subtitles), per_million, typical, source (pairs = the noun + verb pair on dictionary forms, any inflection; phrase = the idiom's written forms), pair_count (a raw pair count set aside because other uses dominate it), judged_commonness (1–5), flags. Full light entries by id are in ${CJSON}.
COUNT ANYTHING YOURSELF: \`python3 ${CLI} pair <noun_romaji> <verb_romaji> <nounJa> <verbJa>\` or \`python3 ${CLI} phrase <form> [<form>...]\` (written forms: kanji and kana variants, verb stems so inflections match: 猿も木から落ち, 一石二鳥, 胡麻をす, ごまをす, ゴマす). Under half a second each; use absolute paths (the shell's cwd resets).
CAVEATS — correct with judgement: the corpus is mostly subtitles for foreign films, so dramatic lines are over-counted and casual Japanese talk is under-counted; counts under ~20 are noisy; a literal twin can share a count (te o ageru = raise your hand / raise a hand to someone).

OUT OF SCOPE: literal collocations (in ${COLL} — ki ni iru, osewa ni naru, yaku ni tatsu, ki ga tsuku, ki o tsukau, me ga sameru...; never repeat them); the versatility list's ki ni naru, ki ni suru, ki ga suru, ki o tsukeru; single words, even slangy ones (rakushou, yabai, kiraku — name them in notes as plain alternatives); bookish or literary sayings people rarely say aloud.

ENTRY CONVENTIONS: romaji = the plain form as people say it, verbs in dictionary form (te o kasu, atama ni kuru); fixed forms stay as said (kentou mo tsukanai, ii kagen ni shite). polite = desu/masu form, or null when there is no register difference. Romaji: modified Hepburn, lowercase, no macrons, long vowels spelled out (sou, koohii), particles wa/o/e, っ doubles the next consonant (t before ch), words separated by spaces, verb + auxiliaries joined (atama ni kita), copula and sentence-final particles separate.`

const NSTR = { type: ['string', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }
const STRS = { type: 'array', items: { type: 'string' } }
const LIGHT_PROPS = {
  slug: { type: 'string' }, romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' },
  literal: { type: 'string' }, english: { type: 'string' }, englishIdiom: NSTR,
  noun: NSTR, nounJa: NSTR, particle: NSTR, verb: NSTR, verbJa: NSTR,
  surface: STRS, count: { type: 'integer', description: 'from count_cli.py; 0 if none' }, countSource: { type: 'string', enum: ['pairs', 'phrase', 'none'] },
  commonness: SCORE, speakNeed: SCORE, category: { type: 'string', enum: CKEYS },
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } }, why: { type: 'string' },
}
const ADD_SCHEMA = { type: 'object', required: ['additions', 'notes'], properties: {
  additions: { type: 'array', items: { type: 'object', required: [...Object.keys(LIGHT_PROPS), 'gap'], properties: { ...LIGHT_PROPS, gap: { type: 'string' } } } },
  notes: { type: 'string' } } }
const SEL_SCHEMA = { type: 'object', required: ['keep', 'notes'], properties: { keep: STRS, notes: { type: 'string' } } }
const FINAL_ROW = { type: 'object', required: ['id', 'category', 'romaji', 'english'], properties: {
  id: { type: 'string' }, category: { type: 'string', enum: CKEYS }, romaji: { type: 'string' }, english: { type: 'string' } } }
const BOUND_SCHEMA = { type: 'object', required: ['final', 'notes'], properties: { final: { type: 'array', items: FINAL_ROW }, notes: { type: 'string' } } }
const EX = { type: 'object', required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } }
const ITEM_PROPS = {
  slug: { type: 'string', description: 'the candidate id, unchanged' }, romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, politeJa: NSTR,
  english: { type: 'string' }, literal: { type: 'string' }, englishIdiom: NSTR, use: { type: 'string' },
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
const CONS_SCHEMA = { type: 'object', required: ['fixes', 'drops', 'notes'], properties: {
  fixes: { type: 'array', items: { type: 'object', required: ['id', 'field', 'value'], properties: {
    id: { type: 'string' }, field: { type: 'string', enum: ['romaji', 'polite', 'english', 'literal', 'englishIdiom', 'use', 'notes', 'contrastGroup', 'flags'] },
    value: { type: ['string', 'array', 'null'], items: { type: 'string' } } } } },
  drops: { type: 'array', items: { type: 'object', required: ['id', 'reason'], properties: { id: { type: 'string' }, reason: { type: 'string' } } } },
  notes: { type: 'string' } } }
const ORDER_SCHEMA = { type: 'object', required: ['stages'], properties: { stages: { type: 'array', items: { type: 'object', required: ['name', 'summary', 'chunkIds'], properties: {
  name: { type: 'string' }, summary: { type: 'string' }, chunkIds: STRS } } } } }

const catText = CATS.map(([k, n, s]) => `${k} — ${n}: ${s}`).join('\n')
const norm = s => String(s || '').replace(/[\s・。、？?！!…〜~-]/g, '').toLowerCase()

// ---------- Gaps ----------
const CRITICS = [
  { key: 'sayings', lens: 'SAYINGS (kotowaza) people actually say in conversation, as a comment or a punchline: saru mo ki kara ochiru, nana korobi ya oki, hana yori dango, ishi no ue ni mo sannen, kahou wa nete mate, uso mo houben, warau kado ni wa fuku kitaru, isogaba maware, neko ni koban, mikka bouzu, chiri mo tsumoreba yama to naru... Count each; keep the ones heard in real talk, not the ones only learned at school.' },
  { key: 'four-character', lens: 'FOUR-CHARACTER PHRASES (yojijukugo) that people really say aloud: isseki nichou, jigou jitoku, ichigo ichie, isshou kenmei, juunin toiro, ittaku kaihou?, kiki ippatsu, ichi ka bachi ka (not yoji but fixed), zettai zetsumei, kanzen muketsu, jiga jisan, happou bijin, mikka bouzu, ishin denshin, issho kenmei... Count each; keep the spoken ones.' },
  { key: 'objects-nature', lens: 'KANYOUKU WITHOUT BODY PARTS: animals (neko o kaburu, saba o yomu, uma ga au, tsuru no hitokoe, nekojita? single word), food (goma o suru, abura o uru, aji o shimeru, shio o maku?), objects and tools (kugi o sasu, tana ni ageru, ita ni tsuku, hashi ni mo bou ni mo kakaranai, ki ni naru? no), nature and fire (mizu ni nagasu, hi ni abura o sosogu, yama o kakeru, ki ga moeru?), numbers and colours, places and the road (michi o tsukeru?, ato no matsuri), money and trade (sumi ni okenai...). Count each.' },
  { key: 'situations', lens: 'EVERYDAY SITUATIONS. Walk through ~40 conversations — at work (a pushy boss, a lazy colleague, an impossible deadline, office politics, getting praised), with friends (gossip, teasing, a crush, a breakup, someone showing off, someone two-faced, someone who never pays), at home (nagging, family quarrels, a messy room), feelings (fed up, nervous, relieved, embarrassed, moved, bored), luck (a near miss, a stroke of luck, being blamed), money (broke, stingy, splurging) — and list every common Japanese idiom a native speaker would naturally use there that is not in the pool.' },
  { key: 'corpus', lens: `CORPUS SWEEP. Read ${PAIRS} (tab-separated: noun_kana, noun, verb_kana, verb, pos, count, per_million, share_n, ...) from the most frequent rows down to count 8, and pick out every FIGURATIVE set (any noun, not only body parts) that people say in everyday life and that is not in the pool. Ignore literal pairs and film-plot lines.` },
]
const additions = []
const poolNote = `The pool so far: the 758 candidates in ${TSV} (grep it for the romaji or the Japanese before proposing anything) plus this run's additions listed below.`
for (let round = 1; round <= 3; round++) {
  phase('Gaps')
  const prior = additions.map(a => a.romaji).join(', ') || '(none)'
  const res = await parallel(CRITICS.map(cr => () => agent(`Gap hunt, round ${round}, for a list of the ~${TARGET} most common Japanese idioms.

${COMMON}

CATEGORIES (assign each by meaning):
${catText}

YOUR LENS: ${cr.lens}

${poolNote}
THIS RUN'S ADDITIONS SO FAR: ${prior}

Propose only idioms people commonly say that are missing (not a variant, inflection or polite form of one already in). For each: count it with ${CLI} (pair for noun + verb idioms, phrase with surface forms otherwise; put the forms in surface), fill every field (slug ascii from romaji, literal word for word, english meaning, englishIdiom only if a natural English idiom exists — null is fine, count, countSource, judged commonness / speakNeed, category, flags incl. saying / four-character, why). gap: what showed it was missing.${round > 1 ? ' An empty list is fine when nothing common is missing.' : ''}`,
    { label: `gaps:${cr.key} r${round}`, phase: 'Gaps', schema: ADD_SCHEMA })))
  let fresh = 0
  res.forEach((r, ci) => {
    if (!r) return
    for (const a of r.additions) {
      if (additions.some(x => norm(x.romaji) === norm(a.romaji) || norm(x.ja) === norm(a.ja))) continue
      let slug = String(a.slug || a.romaji).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      while (additions.some(x => x.slug === slug)) slug = `${slug}-g`
      additions.push({ ...a, slug, id: slug, source: `gap:${CRITICS[ci].key}:${round}` })
      fresh++
    }
  })
  log(`Gaps round ${round}: +${fresh} (${additions.length} new candidates)`)
  if (fresh < 8) break
}
const addLines = additions.map(a => `${a.id}\t${a.category}\t${a.romaji}\t${a.english}\t${a.literal}\t${a.englishIdiom || ''}\t${a.count}\t\t\t${a.countSource}\t\t${a.commonness}\t${(a.flags || []).join(',')}`).join('\n')

// ---------- Select ----------
phase('Select')
const SELECTORS = [
  { key: 'data', lens: 'DATA-FIRST: rank by count and trust the corpus, except where an idiom is plainly a film-drama line or its count is mostly a literal twin.' },
  { key: 'everyday', lens: 'EVERYDAY-JAPAN-FIRST: you are a native speaker in Japan. Pick the idioms people really say in daily conversation, lifting casual ones the foreign-film corpus under-counts and dropping dramatic lines it over-counts.' },
  { key: 'coverage', lens: 'COVERAGE: every topic has its core idioms; natural pairs stay together (kuchi ga karui / katai, kubi ni naru / kubi ni suru, te ni ireru / te ni hairu); the commonly said sayings and four-character phrases are represented; then fill with the most common remaining.' },
]
const sels = await parallel(SELECTORS.map(s => () => agent(`Select the ~${TARGET} idioms (${TARGET - 15}–${TARGET + 15}) for the list from the 758 candidates in ${TSV} and this run's new candidates below. Read the whole file in pieces.

${COMMON}

YOUR LENS: ${s.lens}

NEW CANDIDATES FROM THIS RUN (id, category, romaji, english, literal, english_idiom, count, -, -, source, -, judged_commonness, flags):
${addLines || '(none)'}

Rules: one entry per idiom — variants (kentou ga tsuku / tsukanai / mo tsukanai; aite ni suru / shinai) count once, keep the form people say most; never pick anything in the collocation list; whether an English equivalent exists plays no part. Every topic should have plenty. Return the ids to keep and a short note on your hardest calls.`,
  { label: `select:${s.key}`, phase: 'Select', schema: SEL_SCHEMA })))
const votes = {}
const okSels = sels.filter(Boolean)
okSels.forEach(s => new Set(s.keep).forEach(id => { votes[id] = (votes[id] || 0) + 1 }))
const base = Object.keys(votes).filter(id => votes[id] >= 2)
const fewer = Object.keys(votes).filter(id => votes[id] < 2)
log(`Selection: ${base.length} with 2+ votes, ${fewer.length} with fewer`)
const bound = await agent(`Three selectors voted on the idiom list. Settle it at ${TARGET} (${TARGET - 10}–${TARGET + 10}) and return the FINAL list with metadata (id, category, romaji, english) — from ${TSV} for table ids, or from the new candidates below.

${COMMON}

BASE (2+ votes): ${base.join(', ')}
FEWER VOTES: ${fewer.map(id => `${id}(${votes[id]})`).join(', ')}
NEW CANDIDATES FROM THIS RUN:
${addLines || '(none)'}
SELECTOR NOTES:
${okSels.map((s, i) => `${SELECTORS[i].key}: ${s.notes}`).join('\n')}

Merge variants into the most-said form, keep natural pairs whole, keep every topic well represented, exclude anything in the collocation list, let commonness decide the boundary, use only ids that exist. You may move an item to a better topic.`,
  { label: 'select:boundary', phase: 'Select', schema: BOUND_SCHEMA })
if (!bound) throw new Error('boundary failed')
const final = []
const seen = new Set()
for (const r of bound.final) if (!seen.has(r.id)) { seen.add(r.id); final.push(r) }
log(`Final selection: ${final.length} (${final.filter(r => additions.some(a => a.id === r.id)).length} from this run's gap hunt)`)
const finalLines = final.map(r => `${r.id} | ${r.category} | ${r.romaji} | ${r.english}`).join('\n')

// ---------- Cut reasons (beside the writing) ----------
const cutsPromise = parallel(CATS.map(([key, name]) => () => agent(`Give a verdict and a one-line plain-English reason (for a learner deciding whether to ask for it back) to every candidate in topic "${key}" that is NOT in the final list: the lines of ${TSV} with category = ${key}, plus this run's new candidates in that topic.

${COMMON}

Verdicts: maybe (a strong idiom that only just missed — the best ~10%), covered (a kept idiom says the same or it is a variant; name it in coveredBy), less-common (cite the count when it helps), bookish, literal (not figurative, or in the collocation list), single-word, narrow.

FINAL LIST (id | topic | romaji | english):
${finalLines}
NEW CANDIDATES FROM THIS RUN:
${addLines || '(none)'}`,
  { label: `cuts:${key}`, phase: 'Cuts', schema: CUTS_SCHEMA })))

// ---------- Write -> Verify -> Fix -> Chunk ----------
const LENSES = [
  { key: 'natural', text: 'LENS: NATIVE-SPEAKER NATURALNESS. You are a native Japanese speaker (Tokyo, 30s). Is the headword the form people really say? Would a real person say each example and examplePolite exactly like that, in that situation? Flag stiff phrasing, translationese, idioms used in the wrong situation, casual sentences that are secretly polite or the reverse, and English that misses the meaning. Put the full corrected sentence (romaji + ja + english) in fix.' },
  { key: 'meaning', text: 'LENS: MEANING & LITERAL SENSE. Is english exactly what the idiom means? Is literal a faithful word-for-word reading? Is englishIdiom a real English idiom with the same meaning and tone — null is better than a loose match, and most entries need none? Does use say when, about whom and in what form it is said (mostly negative, mostly past), and what it gets confused with?' },
  { key: 'register', text: 'LENS: REGISTER & REAL-LIFE USE. Is each idiom really said in everyday conversation today, or mostly written, formal, old-fashioned or dramatic? (Cut it with the reason if it does not belong among the ~250 most common.) Are the flags right (rough, slang, humble, formal, saying, four-character)? Is the polite form something people say (null when an idiom has no natural polite use)? Is anything literal or already in the collocation list (cut it)?' },
  { key: 'form', text: `LENS: FORM & DATA. Romaji follows the convention exactly and matches ja / kana sound for sound; kana is the right reading; polite / politeJa agree and are correctly conjugated; example romaji matches example ja word for word; noun / particle / verb fields match the headword or are null; every listLinks id exists in ${VLIST}; no two entries are the same idiom. Put the exact corrected value in fix.` },
]
const byCat = CATS.map(([key, name]) => ({ key, name, rows: final.filter(r => r.category === key) })).filter(c => c.rows.length)
const built = await pipeline(byCat,
  c => agent(`Write full entries for the ${c.rows.length} idioms in topic "${c.key}" — ${c.name}. Light entries: table ids in ${CJSON} (look up by id); this run's new candidates are below with their light fields.

${COMMON}

IDS: ${c.rows.map(r => r.id).join(', ')}
THIS RUN'S NEW CANDIDATES (light entries):
${JSON.stringify(additions.filter(a => c.rows.some(r => r.id === a.id)), null, 1)}
WHOLE FINAL LIST (for contrast references):
${finalLines}

FIELDS (slug = the id): romaji, polite, ja, kana, politeJa (null when polite is null); english (what it means, 2–8 words); literal (word for word); englishIdiom (only when a natural English idiom with the same meaning and tone exists — null otherwise, and null is fine); use (one or two plain sentences: when you say it, about whom, the form you'll hear most, what it gets confused with); noun / nounJa / particle / verb / verbJa for noun + verb idioms, else null; flags (incl. saying, four-character); contrastGroup (shared name for idioms learned side by side, or null); example (ONE short casual sentence, 3–10 words, a native speaker would really say to a friend); examplePolite (same sentence in desu/masu to a coworker; null when too casual or rough for polite speech); commonness / speakNeed; listLinks (ids from ${VLIST}; grep, don't guess); alsoIn ("21-list-collocations: <romaji>" when a related literal set is in that list, else []); notes (null or one short line — a plain single-word alternative, a variant form).`,
    { label: `write:${c.key}`, phase: 'Write', schema: ITEMS_SCHEMA }),
  (draft, c) => draft ? parallel(LENSES.map(l => () => agent(`Review topic "${c.key}" — ${c.name} — of a Japanese idiom list (casual default, polite pair, romaji-first, audio-first learner).

${COMMON}

${l.text}

DRAFT:
${JSON.stringify(draft, null, 1)}

Report every problem (slug, field, problem, exact fix, severity: fatal / major / minor). Idioms that should not be in the list go in cut. summary: 2–3 lines.`,
      { label: `verify:${c.key} ${l.key}`, phase: 'Verify', schema: ISSUES_SCHEMA })))
      .then(reviews => ({ draft, reviews: reviews.map((r, i) => r ? { lens: LENSES[i].key, ...r } : null).filter(Boolean) })) : null,
  (dr, c) => dr ? agent(`Finalise topic "${c.key}" — ${c.name} — of the idiom list. Below: the draft and ${dr.reviews.length} reviews.

${COMMON}

Apply every fatal and major fix unless clearly wrong; apply minor fixes that are clearly right. Naturalness wins on wording, meaning on meaning, register on whether an idiom is really said. Drop an idiom only when two or more reviewers want it cut or it is wrong beyond repair (list it in dropped). Never add items. Keep slugs. Return every remaining item with every field, a changelog and dropped.

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
- blocks: group by meaning first (a feeling, a situation, a natural pair), 4–5 idioms per block (3 or 6 when natural; never pad, never split a pair). Order blocks from the most common idioms to less common ones, and idioms within a block the same way. label: 1–4 plain words, unique within the topic. rationale: one line. interference: one line, or "none". Every id in exactly one block.
- contrastGroups: one row per id with its group (or null).`,
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

Check: (1) duplicates across topics (the same idiom, or two forms of one) — drop the weaker; (2) anything in the collocation list (${COLL}) — drop it; (3) spelling consistency; (4) natural pairs share one contrast group name. Return fixes (id, field, full new value), drops and notes. Only change what is wrong.

IDIOMS (id | romaji | english | literal | contrastGroup | block):
${[...placed.keys()].map(id => { const e = byId[id]; return `${id} | ${e.romaji} | ${e.english} | ${e.literal} | ${e.contrastGroup || '—'} | ${placed.get(id)}` }).join('\n')}`,
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

Versatility stages: Stage 1 — greetings, what/who/where, basic verbs, past and negative. Stage 2 — eat/drink/sleep, look, know, say/ask, think/feel, give/get; -te forms, -teru. Stage 3 — plans, meeting up, buy/use/make, trouble. Stage 4 — start/stop, take/put/cost/call, patterns like -sugiru.

Principles: the most common idioms first, and short, simple ones before long or grammatically harder ones (fixed negatives, sayings); interleave topics so each stage covers several; keep each topic's internal chunk order (mood-1 before mood-2); roughly equal item counts per stage. Every chunkId exactly once. name "Stage 1" … "Stage 4"; summary: one plain line on what the learner can say after it.

CHUNKS (chunkId | topic | label | idioms):
${allBlocks.map(b => `${b.id} | ${b.topicName} | ${b.label} | ${b.ids.map(id => byId[id].romaji).join(', ')}`).join('\n')}`,
  { label: 'assemble:course-order', phase: 'Assemble', schema: ORDER_SCHEMA })
const cutVerdicts = (await cutsPromise).filter(Boolean).flatMap(r => r.verdicts)
log(`Final: ${placed.size} idioms in ${allBlocks.length} chunks; ${cutVerdicts.length} cut verdicts`)

return {
  additions, final, votes, selectorNotes: okSels.map(s => s.notes), boundaryNotes: bound.notes,
  entries: entries.filter(e => placed.has(e.slug)),
  topics: topics.map(t => ({ key: t.key, name: t.name, blocks: t.chunk ? t.chunk.blocks : [], contrastGroups: t.chunk ? t.chunk.contrastGroups : [], changelog: t.fixed.changelog, dropped: t.fixed.dropped, unreconciled: !!t.fixed.unreconciled })),
  droppedInFix: topics.flatMap(t => t.fixed.dropped), consistency: cons, unplaced,
  stages: order ? order.stages : null, cutVerdicts,
}