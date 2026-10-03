export const meta = {
  name: 'japanese-collocations-list',
  description: 'Build a ~160-item Japanese collocation list (noun + verb pairings like ame ga furu) with casual/polite forms, verified and placed into the 4 course stages',
  phases: [
    { title: 'Harvest', detail: 'one agent per domain, candidates with component frequency ranks' },
    { title: 'Gaps', detail: 'situations / English-verb traps / verb families / noun data sweep, loop until dry' },
    { title: 'Select', detail: '3-lens selection panel + boundary reconcile' },
    { title: 'Write', detail: 'full entries, casual+polite examples, 4-5 item chunks' },
    { title: 'Verify', detail: 'naturalness, trap truth, nuance, form lenses per domain' },
    { title: 'Fix', detail: 'apply reviews per domain' },
    { title: 'Assemble', detail: 'consistency, cut reasons, course order' },
  ],
}

const SP = '/private/tmp/claude-501/-Users-main-Developer-Projects-claude-projects/666a0dd4-1c14-46e0-80e1-0fbb2656b52c/scratchpad'
const RESEARCH = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research'
const FREQ = RESEARCH + '/versatility-build/freq.py'
const CSV = RESEARCH + '/versatility-build/jiten_freq_Drama.csv'
const VLIST = SP + '/versatility-items.txt'
const VVERBS = SP + '/versatility-verbs-adj.txt'
const VT = '/Users/main/Developer/Projects/claude-projects/vocab-trainer/content/'
const TARGET = 160

const COMMON = `CONTEXT
The learner studies Japanese audio-first: listening and speaking only, romaji as the only notation (no kana/kanji reading), production over recognition. Goal: conversational competence. They already have a 484-item "versatility list" (time words, connectors, endings, responses, general verbs, adjectives, patterns) taught in 4 stages. This new list sits beside it.

THIS LIST: ~${TARGET} COLLOCATIONS — the fixed pairings of a noun with the verb or adjective that native speakers use, which a learner must learn as a unit because they cannot guess the partner. The classic case is when English leads to the wrong verb: rain "falls" = ame ga FURU (not ochiru); catch a cold = kaze o HIKU; take medicine = kusuri o NOMU; take a shower = shawaa o ABIRU; wear = kiru (tops) / haku (shoes, trousers) / kaburu (hats) / kakeru (glasses) / suru (watch, tie); make a phone call = denwa o KAKERU; it takes time = jikan ga KAKARU; strong coffee = KOI koohii (not tsuyoi). Also where English uses one word and Japanese a noun phrase: get hungry = onaka ga suku; tall = se ga takai; have a fever = netsu ga aru. Also transitive/intransitive pairs on the same noun, learned together: denki ga tsuku / denki o tsukeru; doa ga aku / doa o akeru; ame ga yamu.
Shape: noun + particle + verb (ame ga furu, kaze o hiku, densha ni noru), noun + ga + adjective (se ga takai, nodo ga itai), or adjective + noun (koi koohii, takai netsu). The pairing is the item.

SELECTION VALUE = (1) commonness — how often a native says this in everyday conversation (1–5, judged); (2) trapRisk — how likely an English speaker gets the pairing wrong (1–5; 5 = English pushes them to a wrong verb, 1 = fully guessable); (3) speakNeed — how much a learner needs to say it themselves (1–5). Everyday life only: weather, body, clothes, home routine, food, phone/media, getting around, time/money/plans, work/school, people, hobbies, senses, describing people.

OUT OF SCOPE (never include):
- Figurative idioms (kanyouku) whose meaning is a metaphor: kao ga hiroi, ki ga au, ki ga mijikai, atama ni kuru, hara ga tatsu, mimi ga itai, hone o oru, te o kasu, te ga hanasenai, me ga nai, asameshi mae, ashi o arau. A separate idiom list comes later. Borderline rule: if a native would call it the plain, literal way to say the thing (se ga takai = tall, onaka ga suku = get hungry, ki ga tsuku = notice, ki ni iru = like/be pleased with), it is IN; if it describes character or uses a body part as a metaphor, it is OUT.
- Transparent kango + suru verbs (benkyou suru, souji suru, ryokou suru, shokuji suru) — they are just verbs. Noun + suru is IN only when the suru pairing itself is unguessable (tokei o suru = wear a watch, oto ga suru = hear a sound, kega o suru = get hurt, iya na kao o suru = make a face).
- Single verbs (hareru, kumoru, norikaeru) — mention them in partners/notes instead.
- Proverbs, four-character compounds, keigo beyond desu/masu, written-only or technical phrases, narrow topic phrases.
- Already in the versatility list, so NOT repeated here (link them with listLinks instead): ki ni naru, ki ni suru, ki ga suru, ki o tsukeru, ki o tsukete, renraku suru, benkyou suru.

REGISTER: the headword (romaji) is the plain dictionary form of the whole collocation: ame ga furu, kaze o hiku, se ga takai, koi koohii. polite = the desu/masu form: ame ga furimasu, kaze o hikimasu, se ga takai desu (null for adjective + noun phrases like koi koohii, which have no register form). Examples show the form people actually say most: ame futteru, kaze hiita, megane kaketeru. Casual speech often drops ga/o (kaze hiita, onaka suita) — the headword keeps the particle; casual examples may drop it the way natives do. Flag rough, gendered, slangy, dated or regional forms.

ROMAJI CONVENTION (the learner's app spelling): modified Hepburn, all lowercase, NO macrons — long vowels as the kana are written: sou, daijoubu, ookii, kirei, koohii, juuden. Particles は/を/へ are wa/o/e. っ doubles the next consonant (chotto, kitto, matte) and is t before ch (matchi). ん is n. Words separated by spaces, particles as separate words (ame ga futteru). Verb + auxiliaries joined (futteru, hiichatta, kaketeru, ikanakya); copula and sentence-final particles separate (sou da yo ne, ii desu ne).

FREQUENCY TOOL — real spoken data, but for single words only: \`python3 ${FREQ} <word> [<word> ...]\` looks up ranks in jiten.moe's drama-subtitle frequency list (3,030 live-action TV dramas, rank 1 = most frequent; e.g. 雨 and 降る both exist). Exact match on dictionary-form spelling or kana — pass both (e.g. \`眼鏡 めがね メガネ\`) and batch many words per call. The list has no phrase counts, so record the NOUN's rank in nounRank and the VERB/ADJECTIVE's rank (dictionary form) in verbRank; never estimate a rank — use null and say why in freqNote. commonness is your native judgement of the whole pairing. Use absolute paths in every shell command (the shell's cwd resets).

VERSATILITY LIST LINKS: ${VVERBS} holds the versatility list's verbs, adjectives and ki- phrases (id | casual | polite | english | stage | category); ${VLIST} holds all 484 items. listLinks = ids of versatility items this collocation is built on or must be kept apart from — e.g. shashin o toru -> H-toru; netsu ga deru -> H-deru; ki ga tsuku -> H-ki-ni-naru (contrast). Only ids that exist in those files. Grep them; don't guess ids.

EXISTING MATERIAL — cross-reference only, never a reason to drop an item: ${RESEARCH}/10-list-nouns.json (180 nouns as strings like "8. kasa [1] umbrella"; pointer "10-list-nouns #8"); vocab-trainer ${VT}utility-vocab.json (words with set_id, romaji; pointer "vocab-trainer utility-vocab: <set_id>"). Grep, don't read whole files.`

const CATS = [
  { key: 'weather', name: 'Weather & nature', quota: 13,
    scope: 'Rain, snow, wind, thunder, sun, clouds, temperature, seasons: ame ga furu / yuki ga furu, ame ga yamu, ame ni furareru (get caught in the rain), kaze ga fuku, kaze ga tsuyoi, tsuyoi ame (heavy rain), kaminari ga naru, hi ga deru / taiyou ga deru, hi ga kureru (get dark), niji ga deru, kasa o sasu, kion ga agaru / sagaru, ase o kaku (if not in body), tenki ga ii.',
    boundary: 'ase o kaku -> body; heat/cold as feelings (atsui, samui) are adjectives already in the versatility list.' },
  { key: 'body', name: 'Body & health', quota: 16,
    scope: 'Illness, pain, symptoms, hunger and thirst, injury, medicine, the doctor: kaze o hiku, netsu ga aru / netsu ga deru, takai netsu, seki ga deru, hanamizu ga deru, nodo ga itai, atama ga itai, onaka ga itai, onaka ga suku, onaka ga ippai, nodo ga kawaku, kusuri o nomu, kega o suru, chi ga deru, ase o kaku, guai ga warui, memai ga suru / samuke ga suru, chuusha o utsu, ashi o kujiku, me ga tsukareru, toshi o toru.',
    boundary: 'grooming and bathing (ha o migaku, shawaa o abiru, kami o arau) -> home; describing appearance (se ga takai, me ga warui as eyesight) -> describing.' },
  { key: 'clothes', name: 'Clothes & wearing', quota: 12,
    scope: 'Putting on and taking off by body part — the whole wearing system: fuku/shatsu o kiru, zubon/sukaato/kutsu/kutsushita o haku, boushi o kaburu, megane o kakeru, tokei/nekutai/masuku/mafuraa o suru, nekutai o shimeru, tebukuro/yubiwa o hameru, akusesarii/iyaringu o tsukeru, keshou o suru, fuku o nugu, kutsu o nugu, boushi o toru, megane o hazusu, tokei o hazusu, kami o musubu.',
    boundary: 'hair-cutting and washing -> home/body. Keep the wear verbs and their take-off verbs as contrast sets.' },
  { key: 'home', name: 'Home & daily routine', quota: 16,
    scope: 'Waking, washing, switches, doors, chores, sleeping: me ga sameru, mezamashi o kakeru, ha o migaku, kao o arau, shawaa o abiru, ofuro ni hairu, ofuro o wakasu, kami o kawakasu, denki o tsukeru / kesu, denki ga tsuku / kieru, terebi o tsukeru, eakon o tsukeru / kakeru, mado o akeru / doa ga aku, kagi o kakeru, sentaku o suru? (only if a trap), sentakumono o hosu, gomi o dasu, futon o shiku, heya o katazukeru, oyu o wakasu, mizu o dasu / mizu ga deru.',
    boundary: 'cooking and drinks (ocha o ireru, gohan o taku) -> food; phone charging -> media.' },
  { key: 'food', name: 'Food & drink', quota: 10,
    scope: 'Cooking, drinks, taste, eating out, alcohol, smoking: gohan o taku (cook rice), ocha / koohii o ireru, oyu o wakasu (if not in home), koi / usui (strong/weak coffee, taste), aji ga koi / usui, aji ga suru, osake ni you (get drunk), osake ga tsuyoi (can hold drink), tabako o suu, chuumon o suru? (only if a trap), okawari o suru, ryouri o tsukuru, niku o yaku, mizu o tsugu?',
    boundary: 'kusuri o nomu -> body; onaka ga suku -> body; paying the bill -> time-money.' },
  { key: 'media', name: 'Phone, photos & screens', quota: 12,
    scope: 'Phone, messages, photos, music, TV, battery, internet: denwa o kakeru, denwa ni deru, denwa o kiru, denwa ga naru, meeru o okuru, meeru ga kuru, shashin o toru, douga o toru, ongaku o kiku / ongaku o kakeru, terebi o miru?, juuden ga kireru (battery dies), juuden suru, denpa ga warui (bad signal), netto ni tsunagu / tsunagaru, akaunto o tsukuru?, oto o dasu / oto o sageru (volume).',
    boundary: 'switching the TV on -> home (with the other switches); contacting someone in general (renraku suru) is in the versatility list.' },
  { key: 'travel', name: 'Getting around', quota: 13,
    scope: 'Trains, buses, cars, walking, directions: densha ni noru, densha o oriru, basu ni noru, takushii o hirou / yobu, kuruma o unten suru, jitensha ni noru, michi o wataru, michi ni mayou, kado o magaru, eki ni tsuku, densha ni maniau, densha ga okureru, michi ga komu (traffic is heavy), kuruma o tomeru, shingou o mamoru?, jiko ni au, nimotsu o azukeru, michi o kiku / oshieru.',
    boundary: 'being late as a time word (okureru) is in the versatility list — keep only the noun pairings (densha ni okureru / densha ga okureru) as collocations.' },
  { key: 'time-money', name: 'Time, money & plans', quota: 14,
    scope: 'Time, money, appointments, plans, bookings: jikan ga kakaru, jikan ga aru, jikan ni maniau, okane ga kakaru, okane o harau, okane o orosu, okane o kasu / kariru / kaesu, okane ga tamaru / okane o tameru, yakusoku o suru, yakusoku o mamoru / yaburu, yotei ga aru, yotei o tateru / keikaku o tateru, yoyaku o suru / toru, jikan o tsubusu, ki ga kawaru? (if not idiom).',
    boundary: 'work holidays (yasumi o toru) -> work-school.' },
  { key: 'work-school', name: 'Work & school', quota: 11,
    scope: 'Jobs, classes, exams, homework, time off: shigoto o yasumu, yasumi o toru, kaisha ni tsutomeru, shigoto ni tsuku?, kaigi ni deru, jugyou ni deru, shiken o ukeru, shiken ni ukaru / ochiru, shukudai o dasu, shukudai o suru, ten o toru (get a score), zangyou o suru?, kaisha o yameru, shigoto ga owaru, menkyo o toru, shikaku o toru.',
    boundary: 'meetings as appointments -> time-money if only about scheduling.' },
  { key: 'people', name: 'People & talk', quota: 15,
    scope: 'Talking, favours, relationships, trouble: hanashi o suru, uso o tsuku, shitsumon o suru, henji o suru, koe o kakeru, aisatsu o suru, sodan ni noru, meiwaku o kakeru, shinpai o kakeru, ki o tsukau, jama o suru, kenka o suru, nakanaori o suru, tomodachi ga dekiru, kareshi / kanojo ga dekiru, sewa o suru, rei o iu, yakusoku... (in time-money), tasuke o motomeru?, hanashi ga au?',
    boundary: 'ki ni naru, ki ni suru, ki o tsukeru are in the versatility list (link, do not repeat); ki ga au is an idiom (out).' },
  { key: 'hobbies', name: 'Hobbies, sport & games', quota: 9,
    scope: 'The "play" problem and other pastimes: piano / gitaa o hiku, fue o fuku, taiko o tataku, sakkaa / tenisu o suru, geemu o suru, e o kaku, uta o utau, shiai ni katsu / makeru, shiai ni deru, chiimu ni hairu, shashin? (media), sanpo o suru?, tsuri o suru?',
    boundary: 'photos -> media; music listening -> media.' },
  { key: 'senses', name: 'Senses & mind', quota: 10,
    scope: 'Perceiving and noticing: oto ga suru, nioi ga suru, aji ga suru (if not food), koe ga suru, kanji ga suru, samuke ga suru (if not body), yume o miru, ki ga tsuku (notice), ki ni iru (like, be pleased with), kyoumi ga aru, kioku ga aru?, me ni hairu?, oto ga kikoeru, me ga sameru (if not home), kotae ga wakaru?',
    boundary: 'ki ga suru / ki ni naru / ki ni suru are in the versatility list — link with listLinks, do not repeat. Character idioms (ki ga tsuyoi, ki ga au) are out.' },
  { key: 'describing', name: 'Describing people', quota: 8,
    scope: 'The X ga ADJ way of describing someone, which English says with one word: se ga takai / hikui (tall / short), atama ga ii (smart), me ga warui / ii (eyesight), mimi ga ii?, ashi ga hayai (fast runner), kami ga nagai / mijikai, kao ga chiisai?, karada ga yowai (often ill), genki ga nai (low), toshi ue / toshi shita?',
    boundary: 'character idioms (kao ga hiroi, ki ga mijikai, kuchi ga warui) are figurative -> out (idiom list later).' },
]
const CAT_KEYS = CATS.map(c => c.key)
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai']
const NSTR = { type: ['string', 'null'] }
const NINT = { type: ['integer', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }
const STRS = { type: 'array', items: { type: 'string' } }

const LIGHT_PROPS = {
  slug: { type: 'string', description: 'ascii id from the romaji, e.g. "ame-ga-furu"' },
  romaji: { type: 'string', description: 'plain dictionary form of the whole collocation, e.g. "ame ga furu"' },
  polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, english: { type: 'string' },
  noun: { type: 'string', description: 'romaji of the noun part, e.g. "ame"' }, nounJa: { type: 'string' },
  particle: { type: ['string', 'null'], description: 'ga / o / ni / de ... or null for adjective + noun' },
  verb: { type: 'string', description: 'romaji dictionary form of the verb or adjective partner, e.g. "furu", "takai", "koi"' }, verbJa: { type: 'string' },
  englishVerb: { type: ['string', 'null'], description: 'the English word a learner would reach for and translate literally, e.g. "fall", "catch", "take", "wear", "strong"; null if none' },
  trap: { type: ['string', 'null'], description: 'the mistake an English speaker would make, in one line (e.g. "Not ame ga ochiru: falling from the sky is furu."), or null' },
  nounRank: NINT, verbRank: NINT, freqNote: NSTR,
  commonness: SCORE, trapRisk: SCORE, speakNeed: SCORE,
  why: { type: 'string' }, listLinks: STRS, alsoIn: STRS,
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } },
}
const LIGHT_REQ = Object.keys(LIGHT_PROPS)
const CAND_SCHEMA = { type: 'object', required: ['candidates', 'outOfScope'], properties: {
  candidates: { type: 'array', items: { type: 'object', required: LIGHT_REQ, properties: LIGHT_PROPS } },
  outOfScope: { type: 'array', items: { type: 'string' }, description: 'pairings considered and deliberately left out or to another domain, with the reason' } } }
const ADD_SCHEMA = { type: 'object', required: ['additions', 'notes'], properties: {
  additions: { type: 'array', items: { type: 'object', required: ['category', ...LIGHT_REQ, 'gap'],
    properties: { category: { type: 'string', enum: CAT_KEYS }, ...LIGHT_PROPS, gap: { type: 'string' } } } },
  notes: { type: 'string' } } }
const SEL_SCHEMA = { type: 'object', required: ['keep', 'notes'], properties: { keep: STRS, notes: { type: 'string' } } }
const BOUND_SCHEMA = { type: 'object', required: ['add', 'remove', 'dupResolutions', 'notes'], properties: {
  add: STRS, remove: STRS,
  dupResolutions: { type: 'array', items: { type: 'object', required: ['keep', 'drop'], properties: { keep: { type: 'string' }, drop: { type: 'string' } } } },
  notes: { type: 'string' } } }
const EX = { type: 'object', required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } }
const ITEM_PROPS = {
  slug: { type: 'string' }, romaji: { type: 'string' }, polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, politeJa: NSTR,
  english: { type: 'string' }, use: { type: 'string' },
  noun: { type: 'string' }, nounJa: { type: 'string' }, particle: NSTR, verb: { type: 'string' }, verbJa: { type: 'string' },
  verbSense: { type: 'string', description: 'what the verb/adjective means on its own, so the pairing makes sense, e.g. furu: "fall from the sky (rain, snow)"' },
  englishVerb: NSTR, trap: NSTR,
  partners: { type: 'array', items: { type: 'string' }, description: 'up to 4 other nouns that take this verb in the same sense, as "yuki (snow)"' },
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } }, contrastGroup: NSTR,
  example: EX,
  examplePolite: { type: ['object', 'null'], required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } },
  nounRank: NINT, verbRank: NINT, freqNote: NSTR, commonness: SCORE, trapRisk: SCORE, speakNeed: SCORE,
  listLinks: STRS, alsoIn: STRS, notes: NSTR,
}
const BLOCK = { type: 'object', required: ['label', 'rationale', 'interference', 'items'], properties: {
  label: { type: 'string' }, rationale: { type: 'string' }, interference: { type: 'string' },
  items: { type: 'array', items: { type: 'object', required: Object.keys(ITEM_PROPS), properties: ITEM_PROPS } } } }
const BLOCKS_SCHEMA = { type: 'object', required: ['blocks'], properties: { blocks: { type: 'array', items: BLOCK } } }
const FINAL_SCHEMA = { type: 'object', required: ['blocks', 'changelog', 'dropped'], properties: {
  blocks: { type: 'array', items: BLOCK },
  changelog: { type: 'array', items: { type: 'object', required: ['slug', 'change'], properties: { slug: { type: 'string' }, change: { type: 'string' } } } },
  dropped: { type: 'array', items: { type: 'object', required: ['slug', 'reason'], properties: { slug: { type: 'string' }, reason: { type: 'string' } } } } } }
const ISSUES_SCHEMA = { type: 'object', required: ['issues', 'cut', 'summary'], properties: {
  issues: { type: 'array', items: { type: 'object', required: ['slug', 'field', 'problem', 'fix', 'severity'], properties: {
    slug: { type: 'string' }, field: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    severity: { type: 'string', enum: ['fatal', 'major', 'minor'] } } } },
  cut: { type: 'array', items: { type: 'object', required: ['slug', 'reason'], properties: { slug: { type: 'string' }, reason: { type: 'string' } } } },
  summary: { type: 'string' } } }
const FIX_FIELDS = ['romaji', 'polite', 'ja', 'kana', 'politeJa', 'english', 'use', 'verbSense', 'englishVerb', 'trap', 'partners', 'contrastGroup', 'notes', 'listLinks', 'alsoIn', 'flags']
const CONS_SCHEMA = { type: 'object', required: ['fixes', 'drops', 'notes'], properties: {
  fixes: { type: 'array', items: { type: 'object', required: ['id', 'field', 'value'], properties: {
    id: { type: 'string' }, field: { type: 'string', enum: FIX_FIELDS },
    value: { type: ['string', 'array', 'null'], items: { type: 'string' } } } } },
  drops: { type: 'array', items: { type: 'object', required: ['id', 'reason'], properties: { id: { type: 'string' }, reason: { type: 'string' } } } },
  notes: { type: 'string' } } }
const CUTS_SCHEMA = { type: 'object', required: ['verdicts'], properties: {
  verdicts: { type: 'array', items: { type: 'object', required: ['id', 'verdict', 'reason', 'coveredBy'], properties: {
    id: { type: 'string' },
    verdict: { type: 'string', enum: ['covered', 'less-common', 'guessable', 'idiom', 'not-a-collocation', 'narrow', 'maybe'] },
    reason: { type: 'string' }, coveredBy: NSTR } } } } }
const ORDER_SCHEMA = { type: 'object', required: ['stages'], properties: {
  stages: { type: 'array', items: { type: 'object', required: ['name', 'summary', 'chunkIds'], properties: {
    name: { type: 'string' }, summary: { type: 'string' }, chunkIds: STRS } } } } }

const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'
const norm = s => String(s || '').replace(/[〜～~\s・。、？?！!…]/g, '').toLowerCase()
const catSummary = CATS.map(c => `${c.key} — ${c.name}`).join('\n')

// ---------- Harvest ----------
const harvestPrompt = c => `Harvest collocation candidates for the domain "${c.key}" — ${c.name} — of a ~${TARGET}-item Japanese collocation list.

${COMMON}

DOMAIN SCOPE (starting points, not exhaustive — find the full set; question marks mean "only if it earns a place")
${c.scope}
Belongs elsewhere (do not include): ${c.boundary}

All domains, for boundary reference:
${catSummary}

Produce about ${Math.round(c.quota * 1.5)} candidates, ranked best-first — roughly ${c.quota} will survive selection, so include strong reserves. Keep sets complete (every wearing verb, both halves of a transitive/intransitive pair) so the selector can decide. For each candidate run the frequency tool on the noun and the verb/adjective (batch the lookups) and fill every field: slug, romaji, polite, ja, kana, english (2–6 words), noun / nounJa, particle, verb / verbJa (dictionary form), englishVerb, trap, nounRank, verbRank, freqNote, commonness / trapRisk / speakNeed, why (one line), listLinks (grep ${VVERBS}), alsoIn (grep the existing material), flags. In outOfScope list what you deliberately left out and why (idioms, guessable pairings, too narrow).`

phase('Harvest')
const harvests = await parallel(CATS.map(c => () =>
  agent(harvestPrompt(c), { label: `harvest:${c.key}`, phase: 'Harvest', schema: CAND_SCHEMA })))

const ids = new Set()
const pool = []
const outOfScope = []
const uniqueId = base => { let id = base, k = 2; while (ids.has(id)) id = `${base}-${k++}`; ids.add(id); return id }
const addToPool = (cand, cat, source) => {
  const k = norm(cand.kana || cand.ja)
  if (pool.some(p => norm(p.kana || p.ja) === k || norm(p.romaji) === norm(cand.romaji))) return false
  const id = uniqueId(slugify(cand.slug || cand.romaji))
  const entry = {}
  for (const f of LIGHT_REQ) entry[f] = cand[f]
  pool.push({ ...entry, slug: id, id, cat, source })
  return true
}
CATS.forEach((c, i) => {
  const r = harvests[i]
  if (!r) { log(`harvest ${c.key} failed — domain has no candidates`); return }
  outOfScope.push(...(r.outOfScope || []).map(s => `${c.key}: ${s}`))
  for (const cand of r.candidates) addToPool(cand, c.key, 'harvest')
})
log(`Harvest: ${pool.length} candidates — ` + CATS.map(c => `${c.key} ${pool.filter(p => p.cat === c.key).length}`).join(', '))

// ---------- Gaps (loop until dry) ----------
const CRITICS = [
  { key: 'situations', lens: 'SITUATIONAL WALK-THROUGH. Walk through ~30 everyday scenes: waking up and getting ready, getting dressed for cold or rain, the commute, small talk about the weather, feeling sick and seeing a doctor, an injury, evening at home, cooking dinner, a café or restaurant, drinking with friends, phone calls and messages, taking photos, shopping and paying, making and breaking plans, booking things, a day at work, school and exams, hobbies and sport, a trip, getting lost, meeting new people, a falling-out and making up, describing someone to a friend, noticing a sound or smell, a dream. For each, script 3–4 lines of natural casual dialogue in your head and list every noun + verb (or noun + adjective) pairing a learner would need that is NOT in the pool and that they could not guess from English.' },
  { key: 'english-traps', lens: 'ENGLISH-VERB TRAP SWEEP. For each high-frequency English verb or adjective that maps to several Japanese partners — take, make, do, have, get, put on, take off, wear, play, turn on, turn off, open, close, catch, break, give, hold, keep, run, fall, go out, come out, pay, cut, hit, set, lose, miss, win, call, change, check, wash, clean, put, ride, drive, sit, stand, tell, hear, smell, look, feel, grow, spend, waste, save, pass, fail, strong, weak, heavy, light, high, low, thick, thin, deep, hard, soft — list the everyday Japanese collocations whose verb an English speaker would get wrong, and check each against the pool.' },
  { key: 'verb-families', lens: 'JAPANESE VERB-FAMILY SWEEP. For each high-reach Japanese verb with many noun partners — kakeru, kakaru, toru, deru, dasu, tsuku, tsukeru, hiku, kiru, suru, naru, dekiru, aru, ireru, hairu, ageru, agaru, sageru, ataru, tatsu, tateru, okuru, ukeru, harau, mamoru, utsu, nuku, kesu, kieru, ochiru, otosu, sasu, noru, oriru, tsukau, tsukuru, hiraku, shimeru, kaesu, nokoru, tamaru, kowasu, kowareru, magaru, mayou — list its most common everyday noun partners (the ones a learner could not guess) and check each against the pool. Include intransitive/transitive partners on the same noun.' },
  { key: 'data-sweep', lens: `NOUN DATA SWEEP. Use the frequency CSV directly (${CSV}; columns Word,Form,Rank). Write the pool's nounJa values to ${SP}/coll-pool-ROUND.txt (via a heredoc), then use python to list the top ~4000-ranked rows. Go through them and pick out everyday NOUNS (body, weather, home, objects, time, money, people, activities) that are not yet a pool noun and that have a verb or adjective partner a learner could not guess (e.g. 風邪 -> hiku, 眼鏡 -> kakeru, 傘 -> sasu, 熱 -> deru/aru). Propose the collocation, not the noun.` },
]
const gapLog = []
for (let round = 1; round <= 3; round++) {
  phase('Gaps')
  const lines = pool.map(p => `${p.id} | ${p.cat} | ${p.romaji} | ${p.english}`).join('\n')
  const res = await parallel(CRITICS.map(cr => () => agent(`Completeness hunt, round ${round}. The pool below holds ${pool.length} candidates for a ~${TARGET}-item Japanese collocation list across these domains:
${catSummary}

${COMMON}

YOUR LENS: ${cr.lens.replace('ROUND', String(round))}

POOL (id | domain | romaji | english):
${lines}

Propose only genuinely missing, genuinely useful everyday collocations — not idioms, not guessable pairings, not near-duplicates of something in the pool (a different inflection or the polite form is not a new item; the other half of a transitive/intransitive pair IS a new item). For each addition give the domain key and every light field with the frequency lookups done; in gap say what showed it was missing.${round > 1 ? ' Earlier rounds already added items; an empty list is the right answer if nothing important is missing.' : ''}`,
    { label: `gaps:${cr.key} r${round}`, phase: 'Gaps', schema: ADD_SCHEMA })))
  let fresh = 0
  for (const r of res.filter(Boolean)) for (const a of r.additions) {
    if (!CAT_KEYS.includes(a.category)) continue
    if (addToPool(a, a.category, `gap-r${round}`)) {
      fresh++
      gapLog.push(`r${round} ${a.category} ${a.romaji} — ${a.gap}`)
    }
  }
  log(`Gaps round ${round}: +${fresh} new (pool ${pool.length})`)
  if (fresh < 6) break
}

// ---------- Select ----------
phase('Select')
const poolLine = p => `${p.id} | ${p.cat} | ${p.romaji} | ${p.english} | c${p.commonness} t${p.trapRisk} n${p.speakNeed} | noun ${p.nounRank != null ? '#' + p.nounRank : '—'} verb ${p.verbRank != null ? '#' + p.verbRank : '—'}${p.flags && p.flags.length ? ' [' + p.flags.join(',') + ']' : ''}${p.trap ? ' | trap: ' + p.trap : ''}`
const poolText = pool.map(poolLine).join('\n')
const quotaText = CATS.map(c => `${c.key} ${c.name}: ~${c.quota} (pool ${pool.filter(p => p.cat === c.key).length})`).join('\n')
const SELECTORS = [
  { key: 'commonness', lens: 'COMMONNESS-FIRST: weigh how often natives actually say the pairing in daily life most heavily (commonness, then the noun and verb drama ranks as supporting evidence). A learner should hear these every week.' },
  { key: 'traps', lens: 'TRAP-FIRST: weigh trapRisk and speakNeed most heavily — the pairings an English speaker will get wrong when they try to speak, which is the whole reason this list exists. Guessable pairings (trapRisk 1–2) need very high commonness to stay.' },
  { key: 'coverage', lens: 'COVERAGE-FIRST: make sure every everyday situation has its pairings and every set is whole — all the wearing verbs with their take-off verbs, both halves of transitive/intransitive pairs, the "take" / "play" / "make" families, the sense verbs (oto / nioi / aji ga suru) — then fill with the strongest remaining items.' },
]
const sels = await parallel(SELECTORS.map(s => () => agent(`Select the final ~${TARGET} collocations (${TARGET - 10}–${TARGET + 10}) for a Japanese collocation list from a pool of ${pool.length} candidates.

${COMMON}

YOUR LENS: ${s.lens}

Domain guidance (±30% is fine — follow the evidence, not the quota):
${quotaText}

Rules: keep contrast sets whole (wearing verbs; denki ga tsuku / denki o tsukeru); prefer the more common of two near-synonymous pairings unless the difference is itself a trap; drop anything that is really a figurative idiom or a guessable pairing with low commonness. Score key: c/t/n = commonness / trapRisk / speakNeed (1–5); noun/verb = drama-subtitle frequency rank of the parts (lower = more frequent).

POOL (id | domain | romaji | english | scores | ranks | flags | trap):
${poolText}

Return the ids to keep and a short note on your hardest calls.`,
  { label: `select:${s.key}`, phase: 'Select', schema: SEL_SCHEMA })))
const validIds = new Set(pool.map(p => p.id))
const votes = {}
const okSels = sels.filter(Boolean)
okSels.forEach(s => new Set(s.keep.filter(id => validIds.has(id))).forEach(id => { votes[id] = (votes[id] || 0) + 1 }))
const need = okSels.length >= 2 ? 2 : 1
const keep = new Set(Object.keys(votes).filter(id => votes[id] >= need))
log(`Selection panel: ${okSels.length} selectors, ${keep.size} items with ≥${need} votes`)
const addPool = pool.filter(p => !keep.has(p.id) && (votes[p.id] || 0) >= 1)
const removePool = pool.filter(p => keep.has(p.id) && votes[p.id] < okSels.length)
const bound = await agent(`Three independent selectors voted on a Japanese collocation list. Items with ${need}+ votes form the base set: ${keep.size} items. Bring the final set to ${TARGET} (${TARGET - 5}–${TARGET + 5}) and resolve near-duplicates.

${COMMON}

Base set by domain (count / guidance):
${CATS.map(c => `${c.key} ${c.name}: ${pool.filter(p => p.cat === c.key && keep.has(p.id)).length} / ~${c.quota}`).join('\n')}

BASE SET:
${pool.filter(p => keep.has(p.id)).map(poolLine).join('\n')}

CANDIDATES TO ADD (fewer votes):
${addPool.map(p => poolLine(p) + ` | votes ${votes[p.id]}`).join('\n') || '(none)'}

CANDIDATES TO REMOVE (in base, not unanimous):
${removePool.map(p => poolLine(p) + ` | votes ${votes[p.id]}`).join('\n') || '(none)'}

SELECTOR NOTES:
${okSels.map((s, i) => `${SELECTORS[i] ? SELECTORS[i].key : i}: ${s.notes}`).join('\n')}

Near-duplicates are the same pairing in another shape (netsu ga aru vs netsu ga deru are DIFFERENT and can both stay; ame ga furu vs ame ga futteru are the same). Keep contrast sets intact. Return add / remove id lists and dupResolutions.`,
  { label: 'select:boundary', phase: 'Select', schema: BOUND_SCHEMA })
if (bound) {
  bound.add.filter(id => validIds.has(id)).forEach(id => keep.add(id))
  bound.remove.forEach(id => keep.delete(id))
  bound.dupResolutions.forEach(d => { if (keep.has(d.keep)) keep.delete(d.drop) })
}
log(`Selected ${keep.size} items — ` + CATS.map(c => `${c.key} ${pool.filter(p => p.cat === c.key && keep.has(p.id)).length}`).join(', '))

// ---------- Write -> Verify -> Fix ----------
const keptByCat = CATS.map(c => ({ cat: c, items: pool.filter(p => p.cat === c.key && keep.has(p.id)) })).filter(x => x.items.length)
const otherLines = CATS.map(c => `${c.key}: ${pool.filter(p => p.cat === c.key && keep.has(p.id)).map(p => p.romaji).join(', ')}`).join('\n')
const lightJson = items => JSON.stringify(items.map(p => { const o = {}; for (const f of LIGHT_REQ) o[f] = p[f]; o.slug = p.slug; return o }), null, 1)

const LENSES = [
  { key: 'natural', text: 'LENS: NATIVE-SPEAKER NATURALNESS. You are a native Japanese speaker (Tokyo, 30s) reviewing a learner list. First the pairing itself: is this the verb/adjective natives actually use with this noun in everyday speech, and the most common choice? (e.g. eakon o tsukeru vs ireru vs kakeru; densha ni noru; shashin o toru.) Then every example and examplePolite: would a real person say exactly this? Flag stiff textbook phrasing, translationese, wrong particles, unnatural subject use, casual sentences that are secretly polite or vice versa, polite versions that change the meaning, and English translations that miss what the Japanese means. Casual examples should drop particles where natives would (kaze hiita). Put the full corrected sentence (romaji + ja + english) in fix.' },
  { key: 'traps', text: 'LENS: TRAP TRUTH & PARTNERS. This list lives or dies on its trap claims, so check each one hard. For every trap: is the "wrong" form really wrong or clearly unnatural — not just less common, and not acceptable in some region or register? If the alternative is also fine, the trap must say so or be rewritten. Is englishVerb the word an English speaker would actually reach for? Is verbSense an accurate core meaning? Does every partner noun really take this verb in the SAME sense (yuki ga furu yes; do not list partners that need a different verb)? Is any item really a figurative idiom (out of scope) or so guessable it does not earn a place (list in cut with the reason)? Are transitive/intransitive pairs labelled correctly (which is ga, which is o)?' },
  { key: 'nuance', text: 'LENS: MEANING, REGISTER & LEARNING VALUE. Check every english gloss and use line (does use name the form people actually say, e.g. ame futteru = it is raining; does it note particle drop, aspect traps like kaze o hiite iru = HAS a cold, or netsu ga aru vs netsu ga deru?). Is each polite form a true desu/masu counterpart with the same meaning? Are rough / slang / gendered forms flagged? Are commonness / trapRisk / speakNeed scores sane? Is the chunking meaning-first with coherent 4–5 item blocks ordered simple -> complex, with contrast sets kept in one block? List any item that does not earn its place in cut with the reason.' },
  { key: 'form', text: `LENS: FORM & DATA INTEGRITY. Check mechanically: romaji follows the convention exactly (no macrons; long vowels as spelled — koohii, juuden, sou; wa/o/e particles; っ doubling; spacing; auxiliaries joined) and matches ja/kana sound for sound; kana is the right reading of ja; polite and politeJa agree and the masu form is correctly conjugated (furimasu, hikimasu, kakemasu, abimasu); example romaji matches example ja word for word, including dropped particles; noun / verb / particle fields match the headword; spot-check at least 12 nounRank / verbRank values with the frequency tool (plus any that look surprising); every listLinks id exists in ${VLIST} (grep it); spot-check alsoIn pointers; no duplicate slugs; every block has 3–6 items. Put the exact corrected value in fix.` },
]

const built = await pipeline(keptByCat,
  x => agent(`Write the final entries for the domain "${x.cat.key}" — ${x.cat.name} — of the Japanese collocation list.

${COMMON}

DOMAIN SCOPE
${x.cat.scope}
Belongs elsewhere: ${x.cat.boundary}

THE ${x.items.length} ITEMS SELECTED FOR THIS DOMAIN (light entries; nounRank / verbRank are real tool output — keep them unless you re-run the tool and find an error):
${lightJson(x.items)}

ALL SELECTED ITEMS BY DOMAIN (for contrast references only — write entries only for this domain):
${otherLines}

WRITE every item above — no additions, no omissions (merge only exact duplicates, keeping the first slug). Keep each slug exactly as given. Fields:
- romaji: plain dictionary form of the collocation. polite: its desu/masu form (null only for adjective + noun phrases). ja / kana: the casual form in normal written Japanese and in kana. politeJa: the polite form in Japanese (null when polite is null).
- english: short gloss (2–6 words). use: one or two plain sentences — when you say it, the form you'll actually hear most (ame futteru = it's raining), particle drop, and any aspect trap (kaze hiite ru = has a cold now).
- noun / nounJa / particle / verb / verbJa: the parts, verb in dictionary form. verbSense: what the verb or adjective means on its own, so the pairing makes sense (furu: "fall from the sky — rain, snow"; kakeru: "hang or put something onto something").
- englishVerb: the English word the learner would reach for (null if none). trap: one line — the wrong form an English speaker would produce and why it fails, or null when there is no real trap. Never call a form wrong if natives accept it; if a variant is also fine, say so.
- partners: up to 4 other everyday nouns that take this verb in the SAME sense ("yuki (snow)"), [] if none worth listing.
- example: ONE short casual sentence (3–9 words) a native speaker would actually say to a friend, using the collocation in its most common spoken form. Drop particles the way real casual speech does. romaji (convention above, word for word with ja), ja, english (natural English for what it means in context).
- examplePolite: the SAME sentence in desu/masu speech to a coworker or stranger. null only for slang/rough items.
- contrastGroup: a short shared name for items learned side by side because they are easily confused (e.g. "wear-verbs", "denki-tsuku-tsukeru", "take-verbs", "sense-ga-suru"). Groups may span domains — use the same name. Items in one group should share a base sentence where natural so only the collocation changes. null if none.
- flags, nounRank, verbRank, freqNote, commonness, trapRisk, speakNeed, listLinks, alsoIn: carry over from the light entry, correcting anything wrong (listLinks must be ids from ${VVERBS} / ${VLIST}). notes: null or one short line (regional variant, related single verb like hareru).

CHUNK the items into blocks:
- Group by meaning first (a situation, a contrast set, a verb family), then aim for 4–5 items per block. A natural group of 3 or 6 is fine; never pad a block with an unrelated item, and never split a contrast set across blocks.
- Order blocks simple -> complex (commonness, then trap difficulty), and items within a block simple -> complex.
- label: a plain short name, 1–4 words (e.g. "Rain and snow", "Putting clothes on", "Switches"). rationale: one line on why these belong together. interference: one line on which items get confused and how to keep them apart (or "none").
Every item appears in exactly one block.`,
    { label: `write:${x.cat.key}`, phase: 'Write', schema: BLOCKS_SCHEMA }),
  (draft, x) => draft ? parallel(LENSES.map(l => () => agent(`Review the domain "${x.cat.key}" — ${x.cat.name} — of a Japanese collocation list (casual default, polite pair, romaji-first, audio-first learner).

${COMMON}

${l.text}

DRAFT:
${JSON.stringify(draft, null, 1)}

Report every problem you find (slug, field, problem, exact fix, severity: fatal = wrong/misleading, major = unnatural or inaccurate, minor = polish). Items that should not be in the list go in cut. summary: 2–3 lines on overall quality.`,
    { label: `verify:${x.cat.key} ${l.key}`, phase: 'Verify', schema: ISSUES_SCHEMA }))).then(reviews => ({ draft, reviews: reviews.map((r, i) => r ? { lens: LENSES[i].key, ...r } : null).filter(Boolean) })) : null,
  (dr, x) => dr ? agent(`Finalise the domain "${x.cat.key}" — ${x.cat.name} — of the Japanese collocation list. Below: the draft and ${dr.reviews.length} independent reviews (naturalness, trap truth, nuance, form).

${COMMON}

Apply every fatal and major fix unless it is clearly wrong; apply minor fixes that are clearly right. When reviewers conflict, the native-naturalness view wins on wording, the trap-truth view wins on whether a form is wrong, and the nuance view wins on meaning. Drop an item only when two or more reviewers want it cut, or it is wrong beyond repair — list it in dropped with the reason. Never add items. Re-chunk if drops leave a block below 3 items (merge into the nearest related block). Keep slugs unchanged. Return the complete corrected blocks (every remaining item, every field), a changelog (one line per item you changed) and dropped.

DRAFT:
${JSON.stringify(dr.draft, null, 1)}

REVIEWS:
${JSON.stringify(dr.reviews, null, 1)}`,
    { label: `fix:${x.cat.key}`, phase: 'Fix', schema: FINAL_SCHEMA })
    .then(r => r ? { ...r, cat: x.cat, reviewSummaries: dr.reviews.map(v => `${v.lens}: ${v.summary}`) } : { blocks: dr.draft.blocks, changelog: [], dropped: [], cat: x.cat, unreconciled: true, reviewSummaries: dr.reviews.map(v => `${v.lens}: ${v.summary}`) }) : null
)

// ---------- Assemble ----------
phase('Assemble')
const finalCats = built.filter(Boolean)
const missingCats = keptByCat.filter(x => !finalCats.some(f => f.cat.key === x.cat.key)).map(x => x.cat.key)
if (missingCats.length) log(`WARNING: domains failed to build: ${missingCats.join(', ')}`)
const writeLosses = []
for (const fc of finalCats) {
  const got = new Set(fc.blocks.flatMap(b => b.items.map(it => it.slug)))
  const dropped = new Set(fc.dropped.map(d => d.slug))
  for (const p of keptByCat.find(x => x.cat.key === fc.cat.key).items)
    if (!got.has(p.slug) && !dropped.has(p.slug)) writeLosses.push(`${p.id} ${p.romaji}`)
}
if (writeLosses.length) log(`Items silently lost in writing: ${writeLosses.join(', ')}`)

const gids = new Set()
const byId = {}
for (const fc of finalCats) fc.blocks.forEach((b, bi) => {
  b.id = `${fc.cat.key}-${bi + 1}`
  b.items.forEach(it => {
    let id = `c-${slugify(it.slug)}`, k = 2
    while (gids.has(id)) id = `c-${slugify(it.slug)}-${k++}`
    gids.add(id); it.id = id; byId[id] = { it, b }
  })
})
const allItems = () => finalCats.flatMap(fc => fc.blocks.flatMap(b => b.items))
const itemLine = it => `${it.id} | ${it.romaji} | ${it.polite || '—'} | ${it.ja} | ${it.english} | verb:${it.verb} | cg:${it.contrastGroup || '—'} | links:${(it.listLinks || []).join(',') || '—'} | block:${byId[it.id].b.id} ${byId[it.id].b.label}`
const cutPool = pool.filter(p => !keep.has(p.id))
const droppedInFix = finalCats.flatMap(fc => fc.dropped.map(d => ({ ...d, cat: fc.cat.key })))

const [cons, cutVerdicts] = await parallel([
  () => agent(`Cross-domain consistency pass over the final Japanese collocation list (${allItems().length} items in ${finalCats.length} domains).

${COMMON}

Check: (1) the same word is spelled identically in romaji everywhere (koohii, eakon, juuden; "te iru" contractions consistent) — follow the convention above; (2) true duplicates across domains (same pairing, same sense) — drop the weaker placement; (3) contrast groups that span domains use one group name, and pairs that should be linked are (wearing verbs with their take-off verbs; tsuku/tsukeru pairs); (4) every listLinks id exists in ${VLIST} (grep; fix to the right id or remove); (5) romaji convention violations (macrons, wo, capitals, kana in romaji); (6) englishVerb values use one spelling per word ("take", not "take (medicine)"). Return fixes (id, field, full new value — for listLinks / alsoIn / flags / partners give the whole array), drops, notes. Be conservative: only change what is wrong.

ITEMS (id | casual | polite | ja | english | verb | contrastGroup | listLinks | block):
${allItems().map(itemLine).join('\n')}`,
    { label: 'assemble:consistency', phase: 'Assemble', schema: CONS_SCHEMA }),
  () => agent(`These candidates were cut from a ~${TARGET}-item Japanese collocation list (or dropped by reviewers). Give each a verdict and a one-line plain-English reason a learner can read, so they can decide whether to re-add any.

${COMMON}

Verdicts: covered (another kept item says the same — name it in coveredBy), less-common (real and correct, but not said often enough to make the cut), guessable (an English speaker would get it right without help), idiom (figurative — belongs in the later idiom list), not-a-collocation (a single verb, a transparent suru verb, or a free combination), narrow (only one topic or situation), maybe (a strong candidate the learner might want back — use sparingly, for the best ~10%).

KEPT ITEMS (for coveredBy):
${allItems().map(it => `${it.romaji} — ${it.english}`).join('\n')}

CUT (id | domain | romaji | english | scores | ranks | votes):
${cutPool.map(p => `${poolLine(p)} | votes ${votes[p.id] || 0}`).join('\n')}
${droppedInFix.map(d => `${d.slug} | ${d.cat} | (dropped by reviewers: ${d.reason})`).join('\n')}

Return one verdict per id (for reviewer drops, use the slug as id).`,
    { label: 'assemble:cut-reasons', phase: 'Assemble', schema: CUTS_SCHEMA }),
])

const consApplied = [], consDropped = []
if (cons) {
  for (const f of cons.fixes) {
    const e = byId[f.id]
    if (!e || !FIX_FIELDS.includes(f.field)) continue
    let v = f.value
    if (['listLinks', 'alsoIn', 'flags', 'partners'].includes(f.field)) v = Array.isArray(v) ? v : (v ? String(v).split(',').map(s => s.trim()).filter(Boolean) : [])
    if (f.field === 'flags') v = v.filter(x => FLAGS.includes(x))
    e.it[f.field] = v
    consApplied.push(`${f.id}.${f.field}`)
  }
  for (const d of cons.drops) {
    const e = byId[d.id]
    if (!e) continue
    e.b.items = e.b.items.filter(it => it.id !== d.id)
    consDropped.push({ id: d.id, romaji: e.it.romaji, reason: d.reason })
  }
  for (const fc of finalCats) fc.blocks = fc.blocks.filter(b => b.items.length)
}
log(`Consistency: ${consApplied.length} fixes, ${consDropped.length} drops`)

const romajiProblems = allItems().filter(it => /[āīūēōâîûêôA-Z\u3040-\u30ff\u4e00-\u9fff]/.test(it.romaji + ' ' + (it.polite || '') + ' ' + it.example.romaji + ' ' + (it.examplePolite ? it.examplePolite.romaji : '')) || /\bwo\b/.test(it.example.romaji)).map(it => `${it.id}: ${it.romaji} / ${it.example.romaji}`)
const oddBlocks = finalCats.flatMap(fc => fc.blocks.filter(b => b.items.length < 3 || b.items.length > 6).map(b => `${b.id} ${b.label} (${b.items.length})`))

const chunks = finalCats.flatMap(fc => fc.blocks.map(b => ({ fc, b })))
const order = await agent(`Order the ${chunks.length} chunks of a Japanese collocation list (${allItems().length} items) into 4 stages that run alongside the learner's versatility list (Stage 1–4). A collocation chunk placed in Stage N is learned during versatility Stage N.

Versatility stages, for alignment:
- Stage 1: greet, thank, apologise, ask what/who/where, say what you do, have and where you're going today or did yesterday, linked with but and because (basic verbs suru, naru, aru, iru, iku, kuru, deru, hairu; past and negative).
- Stage 2: eat/drink/sleep, look, know, say/ask, think/feel (ki ni naru), give/get; -te forms, -teru.
- Stage 3: plans, meeting up, buy/use/make, trouble; more connectors and endings.
- Stage 4: start/stop, take/put/cost/call (toru, kakaru, kakeru, dasu, ireru), patterns like -sugiru, -you ni naru.

Principles: most common and most needed-for-speaking first (high commonness and high trapRisk early: weather, getting hungry, catching a cold, wearing, phone calls are early needs); simpler forms before complex ones; interleave domains so each stage covers several areas of daily life rather than finishing one domain first; keep each domain's internal block order (weather-1 before weather-2); a chunk whose verbs the versatility list teaches at Stage N fits well at Stage N or later, but a very common chunk may come earlier because the chunk itself teaches the verb. Aim for roughly equal item counts, with Stage 1 allowed to be a little smaller. Every chunkId exactly once. name: "Stage 1" ... "Stage 4". summary: one plain line on what the learner can talk about after it.

CHUNKS (chunkId | domain | label | items with commonness c and trapRisk t | versatility links):
${chunks.map(({ fc, b }) => `${b.id} | ${fc.cat.name} | ${b.label} | ${b.items.map(it => `${it.romaji} c${it.commonness} t${it.trapRisk}`).join(', ')} | ${[...new Set(b.items.flatMap(it => it.listLinks || []))].join(', ') || '—'}`).join('\n')}`,
  { label: 'assemble:course-order', phase: 'Assemble', schema: ORDER_SCHEMA })
const blockById = {}
chunks.forEach(({ fc, b }) => { blockById[b.id] = { fc, b } })
const seenC = new Set(), stages = []
for (const st of (order ? order.stages : [])) {
  const cids = st.chunkIds.filter(id => blockById[id] && !seenC.has(id))
  cids.forEach(id => seenC.add(id))
  if (cids.length) stages.push({ name: st.name, summary: st.summary, chunkIds: cids })
}
const missingChunks = Object.keys(blockById).filter(id => !seenC.has(id))
if (missingChunks.length) {
  log(`Course order missed ${missingChunks.length} chunks — appended to the last stage`)
  if (stages.length) stages[stages.length - 1].chunkIds.push(...missingChunks)
  else stages.push({ name: 'Stage 1', summary: '', chunkIds: missingChunks })
}
let n = 1
stages.forEach((st, si) => st.chunkIds.forEach((cid, ci) => {
  const b = blockById[cid].b
  b.stage = si + 1; b.order = ci + 1
  const start = n
  b.items.forEach(it => { it.n = n++ })
  b.range = `${start}-${n - 1}`
}))

const verdictById = {}
for (const v of (cutVerdicts ? cutVerdicts.verdicts : [])) verdictById[v.id] = v
const cuts = [
  ...cutPool.map(p => ({ id: p.id, cat: p.cat, romaji: p.romaji, polite: p.polite, ja: p.ja, english: p.english, nounRank: p.nounRank, verbRank: p.verbRank, commonness: p.commonness, trapRisk: p.trapRisk, trap: p.trap, votes: votes[p.id] || 0, stage: 'selection', ...(verdictById[p.id] ? { verdict: verdictById[p.id].verdict, reason: verdictById[p.id].reason, coveredBy: verdictById[p.id].coveredBy } : {}) })),
  ...droppedInFix.map(d => { const p = pool.find(x => x.slug === d.slug) || {}; return { id: d.slug, cat: d.cat, romaji: p.romaji || d.slug, polite: p.polite || null, ja: p.ja || null, english: p.english || null, nounRank: p.nounRank ?? null, verbRank: p.verbRank ?? null, commonness: p.commonness ?? null, trapRisk: p.trapRisk ?? null, trap: p.trap ?? null, votes: votes[d.slug] || 0, stage: 'review', reviewReason: d.reason, ...(verdictById[d.slug] ? { verdict: verdictById[d.slug].verdict, reason: verdictById[d.slug].reason, coveredBy: verdictById[d.slug].coveredBy } : {}) } }),
  ...consDropped.map(d => ({ id: d.id, romaji: d.romaji, stage: 'consistency', reviewReason: d.reason })),
]
const total = allItems().length
log(`Final: ${total} items, ${chunks.length} chunks, ${stages.length} stages, ${cuts.length} cuts`)

return {
  stats: { total, chunks: chunks.length, poolSize: pool.length, selected: keep.size },
  stages,
  categories: finalCats.map(fc => ({ key: fc.cat.key, name: fc.cat.name, scope: fc.cat.scope, blocks: fc.blocks, changelog: fc.changelog, dropped: fc.dropped, unreconciled: !!fc.unreconciled, reviewSummaries: fc.reviewSummaries })),
  checks: { romajiProblems, oddBlocks, writeLosses, missingCats, consApplied, consDropped, consNotes: cons ? cons.notes : null },
  selection: { selectorNotes: okSels.map(s => s.notes), boundaryNotes: bound ? bound.notes : null },
  gapLog, outOfScope, cuts,
}