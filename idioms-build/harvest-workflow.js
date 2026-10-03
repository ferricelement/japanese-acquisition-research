export const meta = {
  name: 'harvest-japanese-idioms',
  description: 'Gather candidates for a list of the most common Japanese idioms (kanyouku and figurative set phrases), with corpus evidence, gap hunts and an English-idiom map',
  phases: [
    { title: 'Harvest', detail: 'one agent per source: ki, head/face/eyes, mouth/ears, hands, legs/body, animals/objects, modern set phrases' },
    { title: 'Gaps', detail: 'situations / English idioms / corpus sweep, loop until dry' },
  ],
}

const RESEARCH = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research'
const CB = RESEARCH + '/collocations-build'
const FREQ = RESEARCH + '/versatility-build/freq.py'
const VLIST = CB + '/versatility-items.txt'
const COLL = RESEARCH + '/21-list-collocations.json'

const CATS = [
  ['mood', 'Feelings & temper', 'anger, worry, relief, nerves, embarrassment, disgust, being moved'],
  ['character', 'What people are like', 'personality, temperament, skill, taste, being stubborn, picky, talkative, discreet'],
  ['relations', 'Getting on with people', 'getting along, favours, owing someone, helping, hindering, trust, showing up, face'],
  ['talk', 'Talking & listening', 'speaking up, interrupting, secrets, slips, listening, hearing, nonsense, gossip'],
  ['effort', 'Effort, ease & difficulty', 'easy, hard, too much to handle, slacking off, busy, worn out, trying hard'],
  ['attention', 'Noticing & the mind', 'paying attention, overlooking, can not stop thinking, being crazy about something, understanding, guessing'],
  ['fortune', 'Luck, trouble & outcomes', 'bad experiences, getting fired, getting carried away, getting caught, settling things, risk, success'],
]
const CKEYS = CATS.map(c => c[0])
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai', 'formal', 'humble']
const NSTR = { type: ['string', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }
const STRS = { type: 'array', items: { type: 'string' } }

const COMMON = `CONTEXT
The learner studies Japanese audio-first (listening and speaking, romaji only, production over recognition). They already have a 484-item versatility list (${VLIST}: id | romaji | polite | english | stage | category) and a collocation list of literal noun + verb sets (${COLL}: ame ga furu, doa o akeru, kaze o hiku). Now: a list of IDIOMS — the Japanese equivalents of "break the ice" or "piece of cake": set phrases whose meaning is figurative, mostly kanyouku (te o kasu = lend a hand, atama ni kuru = get mad, ki ga au = get along, kao ga hiroi = know everyone, mimi ga itai = it hurts to hear (because it's true), asameshi mae = piece of cake).

THE CRITICS ARE COMMONNESS AND TYPICALITY: the learner wants the idioms people actually say in everyday conversation, most common first. Bookish, literary or rare idioms do not belong, however colourful.

IN SCOPE: kanyouku and other figurative set phrases said in ordinary conversation, casual or polite; the few proverbs, sayings and four-character compounds that people genuinely say in casual talk (judge strictly — most are written or formal).
OUT OF SCOPE: literal collocations (they are in the collocation list — e.g. kaze o hiku, doa o akeru, ki ni iru, osewa ni naru, yaku ni tatsu, ki ga tsuku, ki o tsukau are already there); single words, even slangy ones (yabai, rakushou, yoyuu) — those can be mentioned as plain alternatives; the versatility list's ki ni naru, ki ni suru, ki ga suru, ki o tsukeru.

EVIDENCE YOU CAN USE:
- ${CB}/idiom-candidates.json: 175 figurative sets found by counting noun + verb pairs in 3.17M lines of Japanese film/TV subtitles (romaji, ja, english, count).
- ${CB}/idiom-pairs.tsv: every pair in that corpus whose noun is a body part, ki, kokoro, mushi, an animal and so on, seen 10+ times (noun, verb lemma, count, share_n = typicality, particles). Most kanyouku show up here.
- \`python3 ${CB}/phrase_count.py in.json out.json\` counts written forms in the corpus (in.json: [{"id": ..., "surface": ["朝飯前", "あさめしまえ"]}]); verb idioms give stems ("手を貸", "手貸") so every inflection counts. Takes about a second. Use absolute paths; the shell's cwd resets. Remember the corpus is mostly subtitles for foreign films, so counts are evidence, not the last word.
- \`python3 ${FREQ} <word>\` gives drama-subtitle ranks for single words.

ENTRY CONVENTIONS: romaji = the plain (casual) form as people say it, verbs in dictionary form (te o kasu, atama ni kuru). polite = desu/masu form (te o kashimasu), or null when no register difference (asameshi mae). Romaji: modified Hepburn, lowercase, no macrons, long vowels spelled out (koohii, sou), particles wa/o/e, っ doubles the next consonant (t before ch), words separated by spaces, verb + auxiliaries joined.`

const LIGHT_PROPS = {
  slug: { type: 'string', description: 'ascii from romaji, e.g. "te-o-kasu"' },
  romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' },
  literal: { type: 'string', description: 'word-for-word English, e.g. "lend a hand", "my ears hurt"' },
  english: { type: 'string', description: 'what it actually means, 2-8 words' },
  englishIdiom: { type: ['string', 'null'], description: 'the closest English idiom, if one exists, e.g. "piece of cake"' },
  noun: NSTR, nounJa: NSTR, particle: NSTR, verb: NSTR, verbJa: NSTR,
  surface: { type: 'array', items: { type: 'string' }, description: 'literal written forms to count in subtitles: kanji and kana variants, verb stems so inflections match, common particle drops (手を貸, 手貸; 頭に来, 頭にく, 頭来)' },
  commonness: SCORE, speakNeed: SCORE,
  category: { type: 'string', enum: CKEYS },
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } },
  why: { type: 'string' }, listLinks: STRS,
}
const LIGHT_REQ = Object.keys(LIGHT_PROPS)
const CAND_SCHEMA = { type: 'object', required: ['candidates', 'outOfScope'], properties: {
  candidates: { type: 'array', items: { type: 'object', required: LIGHT_REQ, properties: LIGHT_PROPS } },
  outOfScope: STRS } }
const ADD_SCHEMA = { type: 'object', required: ['additions', 'fromEnglish', 'notes'], properties: {
  additions: { type: 'array', items: { type: 'object', required: [...LIGHT_REQ, 'gap'], properties: { ...LIGHT_PROPS, gap: { type: 'string' } } } },
  fromEnglish: { type: 'array', description: 'English idioms with NO Japanese idiom equivalent: how Japanese people say it instead', items: { type: 'object', required: ['english', 'japanese', 'romaji', 'note'], properties: {
    english: { type: 'string' }, japanese: { type: 'string' }, romaji: { type: 'string' }, note: { type: 'string' } } } },
  notes: { type: 'string' } } }

const catText = CATS.map(([k, n, s]) => `${k} — ${n}: ${s}`).join('\n')
const FIELDS = `For each candidate fill every field: slug, romaji, polite, ja, kana, literal, english, englishIdiom, noun / nounJa / particle / verb / verbJa (when the idiom is noun + particle + verb or adjective, e.g. te / o / kasu; else null), surface (forms to count), commonness (1–5: how often people say it in everyday conversation; 5 = every week), speakNeed (1–5), category, flags (formal / humble / rough / slang / dated...), why (one line), listLinks (versatility-list ids it builds on; grep ${VLIST}, don't guess).`

const SOURCES = [
  { key: 'ki-inner', lens: 'ki (気) and the "inner body": ki, kokoro, mune, hara, mushi, kimochi, shinkei, ki-bun — ki ga au, ki ga kiku, ki ga mijikai, ki ga omoi, ki ga raku, ki ni kuwanai, ki ga ki ja nai, ki ga sumu, ki o otosu, ki ga nukeru, mune ga ippai, mune o haru, hara ga tatsu, hara o kukuru, mushi ga ii, kokoro o hiraku...' },
  { key: 'head-face-eyes', lens: 'head, face and eyes: atama, kao, me, hana, mayu, hitai — atama ni kuru, atama ga katai, atama o sageru, atama ga agaranai, kao ga hiroi, kao o dasu, kao ni deru, kao o tateru, kao ga kiku, me ga nai, me ni au (hidoi me ni au), me ga takai, oome ni miru, me o hanasu, me o tsuburu, me ga mawaru, hana ga takai, hana ni tsuku...' },
  { key: 'mouth-ears', lens: 'mouth, ears, teeth, tongue, voice: kuchi, mimi, ha, shita, koe, nodo — kuchi ga warui, kuchi ga karui / katai, kuchi o dasu, kuchi o hasamu, kuchi o suberaseru, mimi ga itai, mimi o kasu, mimi ni suru, mimi o utagau, ha ga tatanai, shita o maku, nodo kara te ga deru...' },
  { key: 'hands', lens: 'hands, arms, fingers: te, ude, yubi, tsume — te o kasu, te ga hanasenai, te ga kakaru, te o dasu, te ni ireru, te o nuku, te ni oenai, te o utsu, te ga todoku, te o kiru, ude ga ii, ude o ageru, yubi o kuwaete miru...' },
  { key: 'legs-body', lens: 'legs, back, shoulders, neck, bones, body: ashi, koshi, se, kata, kubi, hone, mi, shiri, hiza, karada — ashi o hipparu, ashi ga deru, ashi o arau, ashi ga bou ni naru, koshi ga hikui, kata o motsu, kata no ni ga oriru, kubi ni naru, kubi o kiru, kubi o tsukkomu, hone o oru, mi ni tsukeru, mi ni shimiru, shiri ni shikareru...' },
  { key: 'animals-objects', lens: 'animals, food, objects, nature and well-worn sayings: neko o kaburu, nekojita (single word: note only), neko no te mo karitai, saba o yomu, abura o uru, goma o suru, asameshi mae, tana ni ageru, kugi o sasu, yama o kakeru, mizu ni nagasu, hi ni abura o sosogu, uri futatsu, plus the very few proverbs and four-character compounds people really say in casual talk (judge strictly).' },
  { key: 'modern', lens: 'modern everyday figurative set phrases heard in casual talk, dramas and variety TV: kuuki o yomu (read the room), choushi ni noru, ki ga kiku, hanashi ni naranai, ichi ka bachi ka, hara ga heru? (literal — out), me ga nai, yaru ki ga deru? (literal — out), ashi ga deru, uso deshou?... — figurative sets only, not single slang words.' },
]

phase('Harvest')
const harvests = await parallel(SOURCES.map(s => () => agent(`Harvest idiom candidates from one source for a Japanese idiom list of the ~100 most common idioms in everyday conversation.

${COMMON}

YOUR SOURCE: ${s.lens}
Starting points, not a limit — find the idioms people really say from this source, check the corpus evidence files, and run phrase_count.py on anything you are unsure about.

CATEGORIES (assign each candidate to one, by meaning):
${catText}

Produce 35–50 candidates, most common first, including strong reserves. ${FIELDS} In outOfScope list what you deliberately left out (bookish, literal, single word) and why.`,
  { label: `harvest:${s.key}`, phase: 'Harvest', schema: CAND_SCHEMA })))

const norm = s => String(s || '').replace(/[\s・。、？?！!…〜~-]/g, '').toLowerCase()
const pool = []
const outOfScope = []
const add = (c, source) => {
  if (pool.some(p => norm(p.romaji) === norm(c.romaji) || (c.kana && norm(p.kana) === norm(c.kana)))) return false
  const base = String(c.slug || c.romaji).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  let id = base, k = 2
  while (pool.some(p => p.id === id)) id = `${base}-${k++}`
  const e = {}
  for (const f of LIGHT_REQ) e[f] = c[f]
  pool.push({ ...e, id, slug: id, source })
  return true
}
SOURCES.forEach((s, i) => {
  const r = harvests[i]
  if (!r) { log(`harvest ${s.key} failed`); return }
  outOfScope.push(...r.outOfScope.map(x => `${s.key}: ${x}`))
  r.candidates.forEach(c => add(c, `harvest:${s.key}`))
})
log(`Harvest: ${pool.length} candidates — ` + CKEYS.map(k => `${k} ${pool.filter(p => p.category === k).length}`).join(', '))

const CRITICS = [
  { key: 'situations', lens: 'SITUATIONAL WALK-THROUGH. Walk through ~30 everyday conversations: complaining about a boss or coworker, gossip, praising someone, teasing a friend, being swamped at work, slacking off, owing someone a favour, asking for help, apologising, a friend who talks too much or can not keep a secret, someone showing off, someone two-faced, being nervous, being fed up, relief after something is over, a near miss, getting scolded, getting fired, a bad day, being head over heels for something, someone picky about food, someone who knows everyone, meeting someone you get along with, reading the room at a party. For each, think which idioms a native speaker would naturally use and list any common one NOT in the pool.' },
  { key: 'english', lens: 'ENGLISH IDIOM SWEEP. Go through ~150 of the most common English idioms in everyday speech (piece of cake, break the ice, under the weather, cost an arm and a leg, hit the nail on the head, let the cat out of the bag, pull someone\'s leg, on cloud nine, a pain in the neck, keep an eye on, give someone a hand, get cold feet, see eye to eye, bite the bullet, call it a day, in hot water, over the moon, butterflies in my stomach, the last straw, out of the blue, behind someone\'s back, play it by ear, read between the lines...). For each, find the Japanese idiom people use for the same idea. Add those not in the pool as candidates (set englishIdiom). When Japanese has NO idiom for it, put it in fromEnglish with how Japanese people say it instead (e.g. break the ice -> ba o nagomaseru, or the loanword aisubureiku; piece of cake -> asameshi mae or the word rakushou).' },
  { key: 'corpus', lens: `CORPUS SWEEP. Go through ${CB}/idiom-pairs.tsv and ${CB}/idiom-candidates.json from the most frequent rows down. Find every figurative set that people really say in everyday life and that is not in the pool; check doubtful ones with phrase_count.py. Ignore literal pairs (te o arau, me o tojiru) and film-plot sets.` },
]
const gapLog = []
const fromEnglish = []
for (let round = 1; round <= 3; round++) {
  phase('Gaps')
  const lines = pool.map(p => `${p.id} | ${p.category} | ${p.romaji} | ${p.english}`).join('\n')
  const res = await parallel(CRITICS.map(cr => () => agent(`Completeness hunt, round ${round}, for a list of the ~100 most common Japanese idioms. The pool holds ${pool.length} candidates.

${COMMON}

CATEGORIES:
${catText}

YOUR LENS: ${cr.lens}

POOL (id | category | romaji | english):
${lines}

Propose only common idioms that are genuinely missing (not a variant or the polite form of one in the pool). ${FIELDS} In gap say what showed it was missing.${round > 1 ? ' Earlier rounds already added items; an empty list is the right answer if nothing common is missing.' : ''}${cr.key === 'english' ? '' : ' Leave fromEnglish empty.'}`,
    { label: `gaps:${cr.key} r${round}`, phase: 'Gaps', schema: ADD_SCHEMA })))
  let fresh = 0
  for (const r of res.filter(Boolean)) {
    for (const a of r.additions) if (add(a, `gap:r${round}`)) { fresh++; gapLog.push(`r${round} ${a.romaji} — ${a.gap}`) }
    for (const f of r.fromEnglish) if (!fromEnglish.some(x => norm(x.english) === norm(f.english))) fromEnglish.push(f)
  }
  log(`Gaps round ${round}: +${fresh} (pool ${pool.length}); ${fromEnglish.length} English idioms with no Japanese idiom`)
  if (fresh < 5) break
}

return { pool, fromEnglish, outOfScope, gapLog }