export const meta = {
  name: 'classify-mined-collocations',
  description: 'Classify 1,848 frequent noun+verb pairs from a subtitle corpus: everyday collocation, idiom, grammar, suru verb, free combination, film-only or tokenizer artifact',
  phases: [
    { title: 'Classify', detail: 'one agent per ~115 rows, light entries for real collocations' },
    { title: 'Recheck', detail: 'second opinion on frequent rows rejected as free or film-only' },
  ],
}

const DIR = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research/collocations-build'
const FREQ = DIR.replace('collocations-build', 'versatility-build') + '/freq.py'
const TOTAL = 1848
const SIZE = 116
const DOMAINS = ['weather', 'body', 'clothes', 'home', 'food', 'media', 'travel', 'time-money', 'work-school', 'people', 'hobbies', 'senses', 'describing']
const VERDICTS = ['collocation', 'idiom', 'grammar', 'suru-verb', 'free', 'film', 'artifact', 'in-list']
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai']
const NSTR = { type: ['string', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }

const ROW = { type: 'object', required: ['i', 'verdict', 'note'], properties: {
  i: { type: 'integer', description: 'row index from mined.json' },
  verdict: { type: 'string', enum: VERDICTS },
  note: { type: 'string', description: 'a few words on why' },
  idiom: { type: ['object', 'null'], description: 'for idiom rows only', properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } },
  entry: { type: ['object', 'null'], description: 'for collocation rows only', required: ['slug', 'romaji', 'polite', 'ja', 'kana', 'english', 'noun', 'nounJa', 'particle', 'verb', 'verbJa', 'englishVerb', 'trap', 'commonness', 'trapRisk', 'speakNeed', 'domain', 'flags', 'why'], properties: {
    slug: { type: 'string' }, romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, english: { type: 'string' },
    noun: { type: 'string' }, nounJa: { type: 'string' }, particle: NSTR, verb: { type: 'string' }, verbJa: { type: 'string' },
    englishVerb: NSTR, trap: NSTR, commonness: SCORE, trapRisk: SCORE, speakNeed: SCORE,
    domain: { type: 'string', enum: DOMAINS }, flags: { type: 'array', items: { type: 'string', enum: FLAGS } }, why: { type: 'string' } } },
} }
const SCHEMA = { type: 'object', required: ['rows'], properties: { rows: { type: 'array', items: ROW } } }

const RULES = `CONTEXT
The learner studies Japanese audio-first (listening and speaking, romaji only). We are building a list of the most COMMON and TYPICAL collocations in everyday Japanese: the noun + verb (or noun + adjective) sets native speakers actually use together — rain falls (ame ga furu), wind blows (kaze ga fuku), open the door (doa o akeru), read a book (hon o yomu), wash your hands (te o arau), catch a cold (kaze o hiku). How common and how typical the set is decides what goes in. Whether English would mislead the learner is a bonus note (trap), never a reason to keep or reject.

THE DATA: ${DIR}/mined.json holds pairs counted in 3.17M lines of Japanese film/TV subtitles (OpenSubtitles), on dictionary forms from a tokenizer. Fields: noun, verb (dictionary lemma; 為る = suru, 有る = aru, 成る = naru, 良い = ii), count (occurrences), shareN (this verb's share of everything said with the noun — typicality), logDice (association; 10+ is strong), particles (particle mix; ∅ = dropped particle; ADJ = adjective before the noun). CAVEATS: most of the corpus is subtitles for FOREIGN films, so crime/action/drama-plot pairs are over-counted and Japanese home life, konbini, phones and casual talk are under-counted; the tokenizer sometimes splits fixed expressions (いい子 -> 子+良い, いい加減 -> 加減+良い, 長い間 -> 間+長い).

VERDICTS (one per row):
- collocation: a typical noun + verb/adjective set used in everyday conversation in Japan, with a literal or near-literal meaning — including fully guessable ones (hon o yomu, doa o akeru, te o arau, uchi ni kaeru, kuruma ni noru, okane o harau). Write an entry.
- idiom: figurative meaning (te o kasu = lend a hand, me o hanasu = take your eyes off, te ni ireru = obtain, ki ga au, atama ni kuru, kao o dasu). Give romaji / ja / english — saved for a separate idiom list.
- grammar: a functional pattern rather than a set (hitsuyou ga aru, mondai nai, shikata ga nai, machigai nai, chigai nai, ki ga suru, kankei nai, imi ga nai?, moushiwake nai, ma mo nai).
- suru-verb: noun + suru that is simply a verb (shinpai suru, anshin suru, shokuji suru, manzoku suru, iraira suru).
- free: a free combination — the verb is a generic one any noun takes, so it is not a set (basho o shiru, namae o shiru, ii nyuusu, ii shirase, jikan ga aru is borderline: keep only if it is a fixed everyday set).
- film: common only because of film plots, not everyday life in Japan (juu o motsu, juu o orosu, inochi o sukuu, kiken o okasu, shinjitsu o hanasu).
- artifact: a tokenizer split or mis-parse (ko + ii from いい子, kagen + ii, aida + nagai, oki + hairu from お気に入り).
- in-list: already covered elsewhere — the versatility list's ki ni naru, ki ni suru, ki ga suru, ki o tsukeru, ki ni iru-type set phrases, renraku suru, benkyou suru.

ENTRY FIELDS for collocation rows:
- slug: ascii from romaji (doa-o-akeru). romaji: plain dictionary form of the whole set with the particle natives normally use (pick from the particle mix; doa o akeru, uchi ni kaeru, onaka ga heru; adjective + noun as "tsuyoi ame"). For 家, use uchi when that is how people say it in this set (uchi ni kaeru). polite: desu/masu form (null for adjective + noun). ja / kana: casual form in Japanese and in kana. english: 2–6 words.
- noun / nounJa, particle (null for adjective + noun), verb / verbJa (dictionary form; ii not yoi).
- englishVerb: the English word a learner would reach for, or null. trap: one line on the mistake English leads to, or null when there is none (null is fine and common now).
- commonness (1–5): how often people in Japan say this set in everyday life — correct for the corpus skew. trapRisk (1–5), speakNeed (1–5).
- domain: weather, body (health, illness, body actions), clothes, home (routine, washing, doors, switches, chores), food, media (phone, messages, photos, TV, music), travel, time-money, work-school, people (talk, favours, relationships), hobbies, senses (perceiving, noticing, feelings), describing (what people are like).
- flags, why (one line).

ROMAJI: modified Hepburn, lowercase, no macrons, long vowels spelled out (koohii, sou, juuden), particles wa/o/e, っ doubles the next consonant (t before ch), words separated by spaces. You may use \`python3 ${FREQ} <word>\` for drama-subtitle ranks if useful, but it is not required here.`

phase('Classify')
const slices = []
for (let a = 0; a < TOTAL; a += SIZE) slices.push([a, Math.min(TOTAL, a + SIZE)])
const results = await parallel(slices.map(([a, b]) => () => agent(`Classify rows ${a}–${b - 1} of ${DIR}/mined.json (a JSON array; each row has an "i" field equal to its index). Read them with python3 (e.g. json.load, then rows[${a}:${b}]).

${RULES}

Return one result per row, ${b - a} in all, each with its i. Be decisive; the note is a few words.`,
  { label: `classify:${a}-${b - 1}`, phase: 'Classify', schema: SCHEMA })))

const rows = results.filter(Boolean).flatMap(r => r.rows)
const seen = new Set(rows.map(r => r.i))
const missing = []
for (let i = 0; i < TOTAL; i++) if (!seen.has(i)) missing.push(i)
log(`Classified ${rows.length} rows; missing ${missing.length}`)
const tally = {}
rows.forEach(r => { tally[r.verdict] = (tally[r.verdict] || 0) + 1 })
log('Verdicts: ' + Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(', '))

// Second opinion on the frequent rows that were rejected as free, film-only or grammar: a missed everyday set costs the most.
phase('Recheck')
const rejected = rows.filter(r => ['free', 'film', 'grammar'].includes(r.verdict)).map(r => r.i)
const RS = 120
const rslices = []
for (let a = 0; a < rejected.length; a += RS) rslices.push(rejected.slice(a, a + RS))
const rechecks = await parallel(rslices.map((ids, k) => () => agent(`Second opinion. Another reviewer rejected these rows of ${DIR}/mined.json as free combinations, film-only or grammar. Rows (by i): ${ids.join(', ')}. Read them with python3.

${RULES}

Overturn a rejection ONLY when the row is clearly a typical everyday set people in Japan say (return it as collocation with a full entry, or as idiom). Return only the rows you overturn; an empty list is a fine answer.`,
  { label: `recheck:${k + 1}`, phase: 'Recheck', schema: SCHEMA })))
const overturned = rechecks.filter(Boolean).flatMap(r => r.rows).filter(r => r.verdict === 'collocation' || r.verdict === 'idiom')
const byI = new Map(rows.map(r => [r.i, r]))
overturned.forEach(r => { const old = byI.get(r.i); byI.set(r.i, { ...r, note: `${r.note} (overturned: ${old ? old.verdict : '?'})` }) })
log(`Recheck overturned ${overturned.length} of ${rejected.length}`)

return { rows: [...byI.values()].sort((a, b) => a.i - b.i), missing, tally, overturned: overturned.map(r => r.i) }