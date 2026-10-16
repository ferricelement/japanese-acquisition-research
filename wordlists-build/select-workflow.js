export const meta = {
  name: 'wordlists-select',
  description: 'Route and score 3,477 frequent words, hunt everyday words the drama list misses, harvest set phrases',
  phases: [{ title: 'Select', detail: '7 judges over the frequency pool, 1 everyday-word hunter, 1 phrase harvester' }],
}

const DIR = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research/wordlists-build/select'
const CTX = `${DIR}/context.md`
const ROMAJI = `romaji in kotoba spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled (sou, kirei, daijoubu, koohii), n' before a vowel or y (ten'in), tch for っち (kotchi), particles wa/o/e; verbs and adjectives in dictionary form`
const SCORE = `score = how common it is in everyday conversation among Japanese adults (not in drama plots): 5 said daily by nearly everyone; 4 said most weeks in ordinary life; 3 common but bound to a situation or topic; 2 mostly heard in drama, news or narrow settings; 1 rare, bookish or dated`
const LEARNER = `The learner is an adult English speaker learning Japanese audio-first (listening and speaking, romaji only), aiming at everyday conversation. Selection is about how common and typical an item is in real everyday speech. Never cut or keep something for being easy to guess or for being hard for English speakers; that is only ever a note.`

const JUDGE = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ja: { type: 'string' },
          romaji: { type: 'string' },
          route: { enum: ['core', 'set', 'phrase', 'pattern', 'cut'] },
          key: { type: 'string' },
          en: { type: 'string' },
          score: { type: 'integer', minimum: 1, maximum: 5 },
          why: { type: 'string' },
        },
        required: ['ja', 'route', 'score'],
      },
    },
  },
  required: ['items'],
}
const NEW = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ja: { type: 'string' }, kana: { type: 'string' }, romaji: { type: 'string' },
          polite: { type: ['string', 'null'] }, en: { type: 'string' },
          route: { enum: ['core', 'set', 'phrase', 'pattern'] }, key: { type: 'string' },
          score: { type: 'integer', minimum: 1, maximum: 5 },
          surface: { type: 'array', items: { type: 'string' } },
        },
        required: ['ja', 'kana', 'romaji', 'en', 'route', 'key', 'score'],
      },
    },
  },
  required: ['items'],
}

const BATCHES = ['verbs', 'adj-adv-other', 'suru-nouns', 'nouns-1', 'nouns-2', 'expressions-1', 'expressions-2']

const judgePrompt = (b) => `You are a native-level Japanese teacher choosing vocabulary. ${LEARNER}

Read ${CTX} first: the routes, the keys for each route, and the 484 items the main list already teaches.
Then read your batch, ${DIR}/${b}.tsv: frequent words from a spoken-Japanese frequency list (rank among words in 3,030 TV dramas; columns rank, ja, kana, part of speech from a tokenizer). None of them is taught by the existing lists.

For EVERY line return one record with the same ja:
- route: core / set / phrase / pattern / cut.
- key: the core domain, set or phrase key from the context; "pattern" for patterns; empty for cuts.
- romaji: ${ROMAJI}.
- en: a short English gloss, at most 6 words (skip for cuts).
- ${SCORE}.
- why (cuts only): name / fragment (grammar the main list already teaches, or a piece of a longer phrase) / covered (a variant of a word the main list teaches, e.g. sugu ni when sugu is taught) / drama (common only in drama plots) / rare / bookish / dialect / sound (laughs, grunts) / other: <a few words>.

Rules:
- Correct the drama skew: crime, rescue and confrontation words rank high in dramas (殺す, 犯人, 証拠). Score them by everyday life, and keep the ones ordinary people really say about news, films and their own lives.
- Rough or slangy words people really say keep their score.
- An entry the tokenizer split but that is really one word (お母さん, 一度, 可能性, 関係ない, 二度と, 目の前, 久しぶりに) is routed as a word (core or set), not cut as a fragment.
- Family words, pronouns, numbers, counters, colours, body parts, days and months go to route set with the matching s- key.
- Greetings, thanks, apologies, service phrases and set reactions go to route phrase with a ph- key.
- One record per input line, nothing added.`

const gapPrompt = `You are a native-level Japanese teacher. ${LEARNER}

The candidate words for this course come from TV-drama subtitles, which under-count ordinary daily life. List about 300 everyday words a native speaker says at least most weeks that a drama-based frequency list would rank low: home and chores, food and cooking, shopping, transport, school, office work, health and the doctor's, clothes, weather, phones and apps, hobbies, plus the sound-and-feeling words (mimetics) people use constantly (about 60 of those: gussuri, pittari, girigiri, perapera, dokidoki, nikoniko, gorogoro, sukkiri, iraira, wakuwaku ...).

Read ${CTX} for the routes and keys and the main list's 484 items (don't repeat them). Duplicates of other frequent words are removed later by code, so favour coverage of daily life over guessing what's already there.

For each word: ja (usual written form), kana, romaji (${ROMAJI}), en (at most 6 words), route (core, or set when it belongs to an s- set), key, and score (${SCORE}).`

const phrasePrompt = `You are a native-level Japanese teacher. ${LEARNER}

List about 320 set phrases — formulas said as a whole — that a learner needs for everyday life in Japan, spread over the ph- keys in ${CTX}. Cover both what you say and what is said to you (staff phrases, what a host or a colleague says). Read the context: the main list already teaches 59 responses and social phrases (arigatou, gomen, sumimasen, onegai, douzo, ohayou, itadakimasu, gochisousama, otsukare, oyasumi, omedetou ...); don't repeat those, though a longer or more polite set form of one can be its own phrase when people say it as a unit (arigatou gozaimasu, gomen nasai, sumimasen deshita).

${DIR}/canned-kioku.txt is a 250-phrase deck the learner studies elsewhere (romaji | english). Treat it as one source to consider, not a list to copy: include its phrases only when they are true set phrases people say as a unit.

For each phrase:
- ja (natural written form), kana, romaji (${ROMAJI}, but write the phrase as said, e.g. itte kimasu, irasshaimase),
- polite: the polite counterpart when the headword is casual and a different polite form is used (e.g. otsukare → otsukaresama desu), else null,
- en (natural English for what it does), key (a ph- key), score (${SCORE}),
- surface: 1-3 literal strings to count it in a subtitle corpus — distinctive substrings of the written phrase in the spellings subtitles use (e.g. ["いってきます", "行ってきます"]), at least 3 characters each.
Route is always "phrase".`

phase('Select')
const runs = [
  ...BATCHES.map((b) => () => agent(judgePrompt(b), { label: `judge:${b}`, phase: 'Select', schema: JUDGE }).then((r) => r && { batch: b, ...r })),
  () => agent(gapPrompt, { label: 'hunt:everyday', phase: 'Select', schema: NEW }).then((r) => r && { batch: 'gap', ...r }),
  () => agent(phrasePrompt, { label: 'harvest:phrases', phase: 'Select', schema: NEW }).then((r) => r && { batch: 'phrases', ...r }),
]
const results = (await parallel(runs)).filter(Boolean)
log(`${results.length}/${runs.length} agents returned; ${results.reduce((s, r) => s + r.items.length, 0)} records`)
return results