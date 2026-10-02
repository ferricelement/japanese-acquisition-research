export const meta = {
  name: 'japanese-versatility-list',
  description: 'Build a ~400-item high-versatility Japanese list (casual default + polite pair) with real spoken-frequency ranks, verified and chunked',
  phases: [
    { title: 'Harvest', detail: 'one agent per category, candidates with drama-subtitle ranks' },
    { title: 'Gaps', detail: 'situational / frequency-sweep / expressiveness critics, loop until dry' },
    { title: 'Select', detail: '3-lens selection panel + boundary reconcile to ~400' },
    { title: 'Write', detail: 'full entries, casual+polite examples, 4-5 item chunks' },
    { title: 'Verify', detail: 'naturalness, nuance, form lenses per category' },
    { title: 'Fix', detail: 'apply reviews per category' },
    { title: 'Assemble', detail: 'cross-category consistency and course order' },
  ],
}

const SCRATCH = '/private/tmp/claude-501/-Users-main-Developer-Projects-claude-projects/3d891c74-82df-42a0-abb0-5e44db922794/scratchpad'
const FREQ = SCRATCH + '/freq.py'
const CSV = SCRATCH + '/jiten_freq_Drama.csv'
const RESEARCH = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research'
const KOTOBA_PARTICLES = '/Users/main/Developer/Projects/claude-projects/kotoba/src/data/particles.json'
const VT = '/Users/main/Developer/Projects/claude-projects/vocab-trainer/content/'
const TARGET = 400

const COMMON = `CONTEXT
The learner studies Japanese audio-first: listening and speaking only, romaji as the only notation (no kana/kanji reading), production over recognition. Goal: conversational competence. They study in their own app (kotoba), which stores Japanese text + romaji + English and plays recorded audio.

THIS LIST: ~${TARGET} high-versatility items — the words, endings and patterns that pay off in almost any conversation regardless of topic (the glue and the dials, not topic nouns). Versatility = (1) spoken frequency, (2) spread across topics, (3) reach: how many sentences it can attach to, (4) speaking need: the learner must produce it, not just recognise it.

REGISTER: CASUAL is the default — the romaji field is the casual form, learned first. Every item also carries its polite (desu/masu) counterpart in the polite field — what you'd say to a coworker, shop clerk or stranger (plain desu/masu speech, not keigo). Examples: da yo -> desu yo; iku -> ikimasu; un -> hai; gomen -> sumimasen; jan -> ja nai desu ka; -nakya -> -nakya ikemasen; takai -> takai desu; kocchi -> kochira; dare -> donata. Use null when there is no register difference (kinou, chotto, demo). Flag rough, gendered, slangy, dated or regional forms with flags — never include them unflagged.

ROMAJI CONVENTION (kotoba's stored spelling): modified Hepburn, all lowercase, NO macrons — long vowels spelled as the kana are written: sou, daijoubu, ookii, kirei, sensei, chiisai, kuuki, benkyou. Particles は/を/へ are wa/o/e. っ doubles the next consonant (chotto, kitto, matte) and is t before ch (matchi). ん is n. Words separated by spaces, particles as separate words (kinou wa ame datta). Verb + auxiliaries written joined (tabeteru, ikitai, tabechatta, ikanakya); copula and sentence-final particles separate (sou da yo ne, ii desu ne, iku n da). Pattern items take a leading hyphen for the attaching part: -tai, -te mo ii, -nakya, -chau.

FREQUENCY TOOL — real spoken data: \`python3 ${FREQ} <word> [<word> ...]\` looks up ranks in jiten.moe's drama-subtitle frequency list (3,030 live-action Japanese TV dramas, ~221k entries, rank 1 = most frequent; e.g. ちょっと #46, やっぱり #150, じゃん #363, 一応 #779). Exact match on dictionary-form spelling or kana — pass both (e.g. \`結構 けっこう\`) and batch many words per call. Caveat: the tokenizer splits contractions and multi-word expressions, so items like なんか (filler), なきゃ, でしょ, ちゃう come back missing or misleadingly low. Then look up the most informative full or component form (何か, でしょう, しまう) and explain in freqNote (e.g. "tokenizer splits; rank of でしょう"). Every freqRank must come from actual tool output — never estimate one; use null with freqNote "no usable rank — judgement" when nothing applies. Use absolute paths in every shell command (the shell's cwd resets).

EXISTING MATERIAL — cross-reference only. Never drop an item because it exists elsewhere (this list stands on its own); put pointers in alsoIn:
- ${RESEARCH}/10-list-nouns.json (180 nouns), 11-list-adjectives.json (63 adjectives), 12-list-te-dependents.json (-te forms/auxiliaries), 13-list-exit-battery.json (grammar battery), 05-acquisition-order.html (contains a 60-verb ledger). Items there are strings like "1. ii [1] — i — good"; pointer format "11-list-adjectives #1".
- kotoba particles (${KOTOBA_PARTICLES}): wa ga o ni e de to mo no kara made yori ya ka ne yo dake shika kurai gurai hodo koso sae bakari tte. Pointer "kotoba particles: ne".
- vocab-trainer: ${VT}utility-vocab.json (520 words in 62 themed sets; words have set_id, hiragana, romaji), core-vocab.json (182 words), learner-phrases.json (11 phrases). Pointer "vocab-trainer utility-vocab: <set_id>".
Grep these files; don't read them whole.

OUT OF SCOPE for the whole list: topic nouns (foods, places, objects), numbers, counters, clock times, dates, day-of-week and month names (closed calendar systems drilled separately), keigo beyond desu/masu (except fixed social set phrases), written-only vocabulary.`

const CATS = [
  { key: 'A', name: 'Time & sequence', short: 'relative time, aspect/timing adverbs, frequency, time clauses', quota: 45,
    scope: 'Relative time points: ima, kyou, ashita, kinou, ototoi, asatte, kesa, konban, asa, hiru, yoru, konshuu/senshuu/raishuu, kongetsu/sengetsu/raigetsu, kotoshi/kyonen/rainen, saikin, mukashi, sakki, kondo, kono aida, ima made, korekara, mae, ato. Aspect & timing adverbs: mou, mada, sugu, zutto, yatto, tsui ni, sorosoro, mazu, saisho, saigo, tsugi, ichido, mata. Frequency: itsumo, tokidoki, yoku, tama ni, taitei, mettani (+neg), mainichi. Time clauses that attach to verbs/nouns: -toki, -mae ni, -ta ato de, -te kara, -nagara, -made, -made ni, -uchi ni, -aida, -goro.',
    boundary: 'conditionals (-tara, -ba, -to, -nara) -> E; calendar names, clock times, numbers -> out of scope; zutto meaning "by far" -> B; chotto -> B.' },
  { key: 'B', name: 'Degree, amount & limits', short: 'intensity, comparison, totality, limiting/approximating', quota: 35,
    scope: 'Intensity: chotto, sukoshi, totemo, sugoku, kanari, kekkou, daibu, zuibun, nakanaka, mecha (slang), chou (slang), sonna ni, amari (+neg), zenzen (+neg), mattaku. Comparison: motto, ichiban, mou sukoshi, mou chotto, zutto (by far), -yori, onaji gurai. Amount & totality: zenbu, minna (everyone/everything), takusan, ippai, hanbun, hotondo, daitai. Limits & approximations: dake, shika (+neg), bakari, -gurai/-kurai, -hodo.',
    boundary: 'frequency adverbs -> A; attitude/stance -> C; -sugiru -> I.' },
  { key: 'C', name: 'Stance, attitude & manner', short: 'how the speaker feels about what they say; manner adverbs', quota: 35,
    scope: 'Expectation & certainty: yappari (polite pair yahari), tabun, kitto, zettai, tashika, mochiron, masaka, jitsu wa, hontou ni / honto ni, maji de (slang). Attitude: betsu ni (+neg), sasuga, douse, sekkaku, kekkyoku, toriaezu, ichiou, nantonaku, tsui, wazawaza, mushiro, tokuni, futsuu ni. Manner: chanto, yukkuri, issho ni, hitori de, jibun de, shikkari, hakkiri, isshoukenmei, tekitou ni, dondon, sukkari.',
    boundary: 'fillers and reactions (maa, nanka, eeto) -> G; degree -> B; time -> A.' },
  { key: 'D', name: 'Versatile adjectives', short: 'i-/na-adjectives that apply across almost any topic', quota: 40,
    scope: 'Evaluation: ii, warui, dame, sugoi, yabai (slang), saikou, saiaku, hen, futsuu, tekitou. Difficulty & effort: kantan, muzukashii, raku, taihen, muri, kitsui, tsurai, mendokusai. Feelings: tanoshii, ureshii, kanashii, kowai, sabishii, hazukashii, natsukashii, kimochi ii, kimochi warui, suki, kirai, daisuki. People & skill: jouzu, heta, tokui, nigate, yasashii, kawaii, kakkoii, kirei, majime, okashii. State: isogashii, hima, daijoubu, genki, shizuka, urusai, abunai, hitsuyou, benri, taisetsu/daiji, onaji, iroiro, betsu, tadashii. Wide-reach dimensions: hayai/osoi, ooi/sukunai, takai/yasui, atarashii/furui, tooi/chikai, ookii/chiisai, nagai/mijikai, omoshiroi/tsumaranai, oishii/mazui. Prefer words used across many domains and metaphorically; cut narrowly physical ones. Polite = adjective + desu (na-adj: + desu).',
    boundary: 'adverbs (yoku, hayaku) only as notes unless a distinct high-frequency adverb (yoku "often" -> A); reply phrases (ii yo, daijoubu da yo) -> G.' },
  { key: 'E', name: 'Connectors & conditionals', short: 'what links one idea to the next', quota: 35,
    scope: 'Sentence-initial: demo, dakedo, dakara, de / sorede, sore ni, soshite, sorekara, jaa, tsumari, tatoeba, sore demo, sou ieba, tokoro de, datte, sore to, soretomo, toiuka / tteka (slang), ato (and also). Clause-linking: -kedo, -kara, -node, -shi, -noni, -te mo, -tari ... -tari, -toka, -tte (quote), -ka (or), -ka dou ka, -te (and then). Conditionals: -tara, -ba, -nara, -to (whenever / if), -te mo (even if).',
    boundary: 'time-clause links (-toki, -mae ni, -te kara, -nagara) -> A; sentence-final hearsay -tte -> F; advice -tara ii / -ba ii -> I.' },
  { key: 'F', name: 'Sentence endings & intent', short: 'sentence-final particles, certainty/evidence, suggestions, requests', quota: 50,
    scope: 'Particles & combos: ne, yo, yo ne, na, sa, kana, kke, jan, no (casual question), no / n da (explaining), n da yo, n da kedo (soft lead-in), -te ne, -te yo, yo na, zo / ze (rough), wa (feminine / Kansai), kashira (feminine, dated), mon (excuse). Certainty & evidence: deshou / desho (casual, rising), darou, kamo, -kamo shirenai, -to omou, -n janai, -ja nai?, -hazu, mitai, rashii, -sou (looks like: oishisou), -sou da (hearsay), -tte (I heard), -ppoi, -n da tte. Suggestions & invitations: -ou ka (ikou ka), -ou yo, -nai? (ikanai? = want to go?), -tara? (shitara? = why not). Requests: -te kureru? / -te kurenai?, -te (please). These are learned side by side in contrast sets, not alone.',
    boundary: 'auxiliaries that change the verb meaning (want, must, try, permission, ability) -> I; responses said on their own (sou da ne, naruhodo) -> G.' },
  { key: 'G', name: 'Responses, reactions, fillers & social phrases', short: 'what you say on its own or to keep a conversation going', quota: 40,
    scope: 'Backchannel & agreement: un, uun, sou, sou da ne, sou da yo ne, sou ka, sou nan da, naruhodo, hee, tashika ni, da yo ne. Surprise & disbelief: e?, uso, maji?, honto?, masaka, sugoi. Fillers & hesitation: eeto, ano, nanka, maa, sono, are (that thing), ja nakute (I mean). Accept & refuse: ii yo, daijoubu, ii ya / ii desu (no thanks), chotto... (soft no), dame, ryoukai. Feelings: yokatta, zannen, shouganai, dou shiyou, yatta, aa, are? (huh?). Daily formulas: arigatou, gomen, sumimasen, otsukare, yoroshiku, ohayou, oyasumi, jaa ne, mata ne, itadakimasu, gochisousama, tadaima / okaeri, itte kimasu / itterasshai, ki o tsukete, ganbatte, onegai, chotto matte, ojama shimasu, hisashiburi, omedetou. Repair: nani?, nante?, mou ikkai, dou iu imi?, wakatta / wakannai.',
    boundary: 'adjectives as words (daijoubu, ii) have their primary entry in D — include only fixed reply forms (ii yo) here; sou meaning "that way" -> J.' },
  { key: 'H', name: 'General verbs', short: 'highest-reach verbs; casual = dictionary form, polite = masu form', quota: 45,
    scope: 'Structural: suru, naru, aru, iru, dekiru, yaru. Motion: iku, kuru, kaeru, deru, hairu, modoru, tsuku. Thinking & saying: omou, wakaru, shiru (shitteru), iu, hanasu, kiku, kangaeru, oboeru, wasureru, kimeru, kanjiru. Perception: miru, mieru, kikoeru. Giving & receiving: ageru, kureru, morau. Daily: taberu, nomu, neru, okiru, matsu, au, kau, tsukau, tsukuru, motsu, oshieru, tetsudau, tanomu, yasumu, hataraku, asobu. Change & phases: hajimeru, hajimaru, owaru, tsuzukeru, yameru, kawaru, kaeru (change), tomaru. Judgement & state: chigau, komaru, tsukareru, tasukaru, mitsukeru, mitsukaru, niau, kamau (kamawanai), iru (need). Set verb phrases: ki ni naru, ki ni suru, ki o tsukeru, ki ga suru. Examples should show the verb in its most common spoken form (-teru, past, -te, negative).',
    boundary: 'auxiliary uses (-te miru, -te shimau, -te oku, -te kureru, -te morau, -te ageru) -> I; -koto ga dekiru -> I.' },
  { key: 'I', name: 'Grammar patterns as vocabulary', short: 'attachments bolted onto any verb or adjective', quota: 35,
    scope: 'Desire: -tai, -te hoshii. Permission & prohibition: -te mo ii, -cha dame / -ja dame, -nakute mo ii, -naide. Obligation: -nakya, -nakucha, -nai to. Aspect: -teru / -te iru, -te miru, -chau / -te shimau, -toku / -te oku, -te aru, -te kuru, -te iku. Favours: -te kureru, -te morau, -te ageru. Advice: -hou ga ii, -ta hou ga ii, -tara ii, -ba ii. Intention & plans: -ou / -you (volitional), -ou to omou, -tsumori, -yotei. Experience & ability: -ta koto ga aru, -koto ga dekiru, potential (-eru / -rareru). Degree & ease: -sugiru, -yasui, -nikui, -kata. Change: -ku naru / -ni naru, -you ni naru, -koto ni suru, -koto ni naru. Purpose: -ni iku / -ni kuru. Polite counterparts: -tai -> -tai desu; -nakya -> -nakya ikemasen; -chau -> -chaimasu.',
    boundary: 'evidentials and sentence-final stance (-sou, mitai, rashii, -ppoi, kamo, deshou) -> F; time clauses (-te kara, -nagara) -> A; conditionals -> E; invitations (-ou ka, -nai?) and requests (-te kureru?) -> F.' },
  { key: 'J', name: 'Pointing, question & people words', short: 'ko/so/a/do series, question words, indefinites, pronouns', quota: 50,
    scope: 'Closed families — be complete. ko/so/a/do: kore/sore/are/dore; kono/sono/ano/dono; koko/soko/asoko/doko; kocchi/socchi/acchi/docchi; konna/sonna/anna/donna; kou/sou/aa/dou. Question words: nani / nan, dare, itsu, naze, nande, doushite, ikura, ikutsu, dono kurai / dore kurai. Indefinites & universals: nanika, dareka, dokoka, itsuka, nanimo, daremo, dokomo, nandemo, daredemo, itsudemo, dokodemo. People & self: watashi, boku, ore, atashi, anata, kimi, omae (rough), kare, kanojo, jibun, minna, -san / -kun / -chan. Polite pairs exist here (kocchi -> kochira, docchi -> dochira, doko -> dochira, dare -> donata). Note which members are near-essential and which are rare (aa, acchi).',
    boundary: 'sou as a reply (sou da ne) -> G; minna as "everything" quantity -> B (one primary entry only).' },
]
const CAT_KEYS = CATS.map(c => c.key)
const FLAGS = ['casual-only', 'rough', 'masc', 'fem', 'slang', 'dated', 'kansai', 'needs-negative', 'fixed-phrase']
const NSTR = { type: ['string', 'null'] }
const SCORE = { type: 'integer', minimum: 1, maximum: 5 }
const STRS = { type: 'array', items: { type: 'string' } }

const LIGHT_PROPS = {
  slug: { type: 'string', description: 'short ascii id, e.g. "yappari", "te-mo-ii"' },
  romaji: { type: 'string', description: 'casual form' },
  polite: NSTR, ja: { type: 'string' }, kana: { type: 'string' }, english: { type: 'string' },
  freqRank: { type: ['integer', 'null'] }, freqNote: NSTR,
  spread: SCORE, reach: SCORE, speakNeed: SCORE,
  why: { type: 'string' }, alsoIn: STRS, prereqs: STRS,
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } },
}
const LIGHT_REQ = Object.keys(LIGHT_PROPS)
const CAND_SCHEMA = { type: 'object', required: ['candidates', 'outOfScope'], properties: {
  candidates: { type: 'array', items: { type: 'object', required: LIGHT_REQ, properties: LIGHT_PROPS } },
  outOfScope: { type: 'array', items: { type: 'string' }, description: 'items considered and deliberately left to another category or out of scope, with the reason' } } }
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
  flags: { type: 'array', items: { type: 'string', enum: FLAGS } }, contrastGroup: NSTR,
  example: EX,
  examplePolite: { type: ['object', 'null'], required: ['romaji', 'ja', 'english'], properties: { romaji: { type: 'string' }, ja: { type: 'string' }, english: { type: 'string' } } },
  freqRank: { type: ['integer', 'null'] }, freqNote: NSTR, spread: SCORE, reach: SCORE, speakNeed: SCORE,
  prereqs: STRS, alsoIn: STRS, notes: NSTR,
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
const FIX_FIELDS = ['romaji', 'polite', 'ja', 'kana', 'politeJa', 'english', 'use', 'prereqs', 'contrastGroup', 'notes', 'alsoIn', 'flags']
const CONS_SCHEMA = { type: 'object', required: ['fixes', 'drops', 'notes'], properties: {
  fixes: { type: 'array', items: { type: 'object', required: ['id', 'field', 'value'], properties: {
    id: { type: 'string' }, field: { type: 'string', enum: FIX_FIELDS },
    value: { type: ['string', 'array', 'null'], items: { type: 'string' } } } } },
  drops: { type: 'array', items: { type: 'object', required: ['id', 'reason'], properties: { id: { type: 'string' }, reason: { type: 'string' } } } },
  notes: { type: 'string' } } }
const ORDER_SCHEMA = { type: 'object', required: ['stages'], properties: {
  stages: { type: 'array', items: { type: 'object', required: ['name', 'summary', 'chunkIds'], properties: {
    name: { type: 'string' }, summary: { type: 'string' }, chunkIds: STRS } } } } }

const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'
const norm = s => String(s || '').replace(/[〜～~\s・。、？?！!…]/g, '').toLowerCase()
const catOf = k => CATS.find(c => c.key === k)
const catSummary = CATS.map(c => `${c.key} — ${c.name}: ${c.short}`).join('\n')

// ---------- Harvest ----------
const harvestPrompt = c => `Harvest candidates for category ${c.key} — ${c.name} — of a ~${TARGET}-item Japanese versatility list.

${COMMON}

CATEGORY SCOPE (starting points, not exhaustive — find the full set)
${c.scope}
Belongs elsewhere (do not include): ${c.boundary}

All 10 categories, for boundary reference:
${catSummary}

Produce about ${Math.round(c.quota * 1.35)} candidates, ranked best-first — roughly ${c.quota} will survive selection, so include strong reserves. Be exhaustive within closed families (include every member so the selector can decide). For each candidate run the frequency tool (batch the lookups) and fill: slug (ascii), romaji (casual form), polite (desu/masu counterpart or null), ja, kana, english (2–6 words), freqRank + freqNote, spread / reach / speakNeed (1–5 each; 5 = applies in nearly any conversation / attaches to nearly any sentence / a learner must say it constantly), why (one line), alsoIn (pointers into existing material — grep for it), prereqs (romaji of items to learn first, any category), flags. In outOfScope list what you deliberately left out and why.`

phase('Harvest')
const harvests = await parallel(CATS.map(c => () =>
  agent(harvestPrompt(c), { label: `harvest:${c.key} ${c.name}`, phase: 'Harvest', schema: CAND_SCHEMA })))

const ids = new Set()
const pool = []
const outOfScope = []
const uniqueId = base => { let id = base, k = 2; while (ids.has(id)) id = `${base}-${k++}`; ids.add(id); return id }
const addToPool = (cand, cat, source) => {
  const k = norm(cand.kana || cand.ja)
  if (pool.some(p => p.cat === cat && norm(p.kana || p.ja) === k)) return false
  if (source !== 'harvest' && pool.some(p => norm(p.romaji) === norm(cand.romaji) || (norm(p.kana || p.ja) === k && norm(p.english) === norm(cand.english)))) return false
  const id = uniqueId(`${cat}-${slugify(cand.slug || cand.romaji)}`)
  const entry = {}
  for (const f of LIGHT_REQ) entry[f] = cand[f]
  pool.push({ ...entry, slug: id.slice(cat.length + 1), id, cat, source })
  return true
}
CATS.forEach((c, i) => {
  const r = harvests[i]
  if (!r) { log(`harvest ${c.key} failed — category has no candidates`); return }
  outOfScope.push(...(r.outOfScope || []).map(s => `${c.key}: ${s}`))
  for (const cand of r.candidates) addToPool(cand, c.key, 'harvest')
})
log(`Harvest: ${pool.length} candidates — ` + CATS.map(c => `${c.key} ${pool.filter(p => p.cat === c.key).length}`).join(', '))

// ---------- Gaps (loop until dry) ----------
const CRITICS = [
  { key: 'situations', lens: 'SITUATIONAL WALK-THROUGH. Walk through ~30 everyday conversations: greeting a friend, making plans, suggesting, accepting and declining an invite, asking for and giving opinions, agreeing and disagreeing politely, asking for help or a favour, apologising, thanking, complaining, telling a story about yesterday, describing a problem, shopping, ordering food, talking about feelings, changing the subject, checking you understood, hedging, guessing, reporting what someone said, comparing, making excuses, encouraging, teasing, ending a conversation. For each, script 3–4 lines of natural casual dialogue in your head and list every function word, ending, pattern, versatile verb or adjective it needs that is NOT in the pool.' },
  { key: 'freq-sweep', lens: `DATA SWEEP. Use the frequency CSV directly (${CSV}; columns Word,Form,Rank). Write the pool's ja and kana values to a file in ${SCRATCH} (name it pool-ROUND-sweep.txt, via a heredoc), then use python to list the top ~4000-ranked entries whose Word and Form are not in the pool. Go through that list and pick out versatile, learnable items — function words, adverbs, adjectives, general verbs, interjections, auxiliaries, endings — that a learner needs across topics. Ignore topic nouns, names, numbers, calendar words, and tokenizer fragments that aren't learnable units on their own (but if a fragment reveals a missing ending or contraction, propose the real unit).` },
  { key: 'expressiveness', lens: 'EXPRESSIVENESS AND FAMILY COMPLETENESS. List the communicative moves a speaker needs — softening, hedging, emphasising, conceding, contrasting, giving reasons, conditions, guessing, reporting speech, obligation, permission, desire, ability, intention, surprise, relief, regret, requesting, offering, inviting, refusing, correcting yourself, approximating, listing examples, comparing, summarising, changing topic — and check each has a natural casual tool in the pool. Then check closed families are complete (each ko/so/a/do series, question words with their -ka/-mo/-demo indefinites, the ne / yo / yo ne set, giving/receiving trio, paired adjectives). Propose what is missing.' },
]
const gapLog = []
for (let round = 1; round <= 3; round++) {
  phase('Gaps')
  const lines = pool.map(p => `${p.id} | ${p.romaji} | ${p.ja} | ${p.english}`).join('\n')
  const res = await parallel(CRITICS.map(cr => () => agent(`Completeness hunt, round ${round}. The pool below holds ${pool.length} candidates for a ~${TARGET}-item Japanese versatility list across 10 categories:
${catSummary}

${COMMON}

YOUR LENS: ${cr.lens.replace('ROUND', String(round))}

POOL (id | romaji | ja | english):
${lines}

Propose only genuinely missing, genuinely versatile items — not topic nouns, not near-duplicates of something in the pool, not variants already covered (a polite form is a field of an existing item, not a new item). For each addition give the category key and every light field with the frequency lookup done; in gap say what showed it was missing.${round > 1 ? ' Earlier rounds already added items; an empty list is the right answer if nothing important is missing.' : ''}`,
    { label: `gaps:${cr.key} r${round}`, phase: 'Gaps', schema: ADD_SCHEMA })))
  let fresh = 0
  for (const r of res.filter(Boolean)) for (const a of r.additions) {
    if (!CAT_KEYS.includes(a.category)) continue
    if (addToPool(a, a.category, `gap-r${round}-${a.gap ? 'x' : ''}`.replace(/-x$/, ''))) {
      fresh++
      gapLog.push(`r${round} ${a.category} ${a.romaji} — ${a.gap}`)
    }
  }
  log(`Gaps round ${round}: +${fresh} new (pool ${pool.length})`)
  if (fresh < 8) break
}

// ---------- Select ----------
phase('Select')
const dupIndex = {}
for (const p of pool) { const k = norm(p.kana || p.ja); if (!dupIndex[k]) dupIndex[k] = []; dupIndex[k].push(p.id) }
const dupNote = p => { const others = dupIndex[norm(p.kana || p.ja)].filter(x => x !== p.id); return others.length ? ` | dup:${others.join(',')}` : '' }
const poolLine = p => `${p.id} | ${p.romaji}${p.polite ? ' / ' + p.polite : ''} | ${p.english} | ${p.freqRank != null ? '#' + p.freqRank : 'rank —'}${p.freqNote ? '*' : ''} | s${p.spread} r${p.reach} n${p.speakNeed}${p.flags && p.flags.length ? ' [' + p.flags.join(',') + ']' : ''}${dupNote(p)}`
const poolText = pool.map(poolLine).join('\n')
const quotaText = CATS.map(c => `${c.key} ${c.name}: ~${c.quota} (pool ${pool.filter(p => p.cat === c.key).length})`).join('\n')
const SELECTORS = [
  { key: 'frequency', lens: 'FREQUENCY-FIRST: weigh the real spoken rank most heavily — the data is the best evidence of what learners will hear. Ranks marked * have a tokenizer caveat; judge those on merit rather than their rank.' },
  { key: 'speaking', lens: 'SPEAKING-FIRST: weigh speakNeed and reach most heavily — what a learner must produce to hold casual conversations with friends, and what bolts onto the most sentences.' },
  { key: 'coverage', lens: 'COVERAGE-FIRST: make sure every communicative function and every family is covered with no holes — complete ko/so/a/do series, contrast sets kept whole, every common intent (agree, refuse, hedge, guess, request, invite, explain, concede) has its tools — then fill with the strongest remaining items.' },
]
const sels = await parallel(SELECTORS.map(s => () => agent(`Select the final ~${TARGET} items (${TARGET - 10}–${TARGET + 10}) for a Japanese versatility list from a pool of ${pool.length} candidates.

${COMMON}

YOUR LENS: ${s.lens}

Category guidance (±30% is fine — follow the evidence, not the quota):
${quotaText}

Rules: keep closed families whole (if you keep kore/sore/are keep dore; keep a ko/so/a/do series together or cut it whole); keep contrast sets together (ne / yo / yo ne); dup: marks the same kana in another candidate — if it is the same word with the same function keep only the better placement, but different functions (sou "that way" vs -sou "looks like") can both stay; prefer the general item over a narrower synonym; slang is fine when very frequent, but keep heavily flagged items few. Score key: #rank = drama-subtitle frequency rank (lower = more frequent), * = tokenizer caveat, s/r/n = spread / reach / speakNeed (1–5).

POOL (id | casual / polite | english | rank | scores | flags | dups):
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
const keptDups = Object.values(dupIndex).map(g => g.filter(id => keep.has(id))).filter(g => g.length > 1)
const addPool = pool.filter(p => !keep.has(p.id) && (votes[p.id] || 0) >= 1)
const removePool = pool.filter(p => keep.has(p.id) && votes[p.id] < okSels.length)
const bound = await agent(`Three independent selectors voted on a Japanese versatility list. Items with ${need}+ votes form the base set: ${keep.size} items. Bring the final set to ${TARGET} (${TARGET - 5}–${TARGET + 5}) and resolve duplicates.

${COMMON}

Base set by category (count / guidance):
${CATS.map(c => `${c.key} ${c.name}: ${pool.filter(p => p.cat === c.key && keep.has(p.id)).length} / ~${c.quota}`).join('\n')}

BASE SET (id | casual / polite | english | rank | scores):
${pool.filter(p => keep.has(p.id)).map(poolLine).join('\n')}

CANDIDATES TO ADD (fewer votes, id | ... | votes):
${addPool.map(p => poolLine(p) + ` | votes ${votes[p.id]}`).join('\n') || '(none)'}

CANDIDATES TO REMOVE (in base, not unanimous):
${removePool.map(p => poolLine(p) + ` | votes ${votes[p.id]}`).join('\n') || '(none)'}

POSSIBLE DUPLICATES INSIDE THE BASE (same kana): ${keptDups.map(g => g.join(' + ')).join('; ') || '(none)'}
For each pair decide: same word and same function -> keep one (dupResolutions); different functions -> leave both.

SELECTOR NOTES:
${okSels.map((s, i) => `${SELECTORS[i] ? SELECTORS[i].key : i}: ${s.notes}`).join('\n')}

Keep families and contrast sets intact. Return add / remove id lists and dupResolutions.`,
  { label: 'select:boundary', phase: 'Select', schema: BOUND_SCHEMA })
if (bound) {
  bound.add.filter(id => validIds.has(id)).forEach(id => keep.add(id))
  bound.remove.forEach(id => keep.delete(id))
  bound.dupResolutions.forEach(d => { if (keep.has(d.keep)) keep.delete(d.drop) })
}
log(`Selected ${keep.size} items — ` + CATS.map(c => `${c.key} ${pool.filter(p => p.cat === c.key && keep.has(p.id)).length}`).join(', '))

// ---------- Write -> Verify -> Fix ----------
const keptByCat = CATS.map(c => ({ cat: c, items: pool.filter(p => p.cat === c.key && keep.has(p.id)) })).filter(x => x.items.length)
const otherLines = CATS.map(c => `${c.key} ${c.name}: ${pool.filter(p => p.cat === c.key && keep.has(p.id)).map(p => p.romaji).join(', ')}`).join('\n')
const lightJson = items => JSON.stringify(items.map(p => { const o = {}; for (const f of LIGHT_REQ) o[f] = p[f]; o.slug = p.slug; return o }), null, 1)

const LENSES = [
  { key: 'natural', text: 'LENS: NATIVE-SPEAKER NATURALNESS. You are a native Japanese speaker (Tokyo, 30s) reviewing a learner list. For every example and examplePolite: would a real person say exactly this in daily conversation? Flag stiff textbook phrasing, translationese, wrong collocations, wrong or missing particles, unnatural subject use (watashi wa ... in casual chat), casual sentences that are secretly polite or vice versa, polite versions that change the meaning, and English translations that miss what the Japanese actually means in context. Also flag any casual romaji form that is not how people really say it casually. Put the full corrected sentence (romaji + ja + english) in fix.' },
  { key: 'nuance', text: 'LENS: MEANING, NUANCE & PRAGMATICS. Check every english gloss, use line, flag and contrastGroup. Are intent descriptions accurate (ne vs yo vs yo ne; kana vs kamo vs deshou; explanatory n da; jan; demo vs kedo vs noni; zenzen/amari need a negative; betsu ni; yappari; chotto as a soft refusal)? Is each polite form a true register counterpart with the same meaning, not a different word? Are rough/gendered/slang/dated/regional forms flagged? Are learner traps noted where they matter? Is each item genuinely versatile — list any that does not earn a place in a 400-item versatility list in cut with the reason. Is the chunking meaning-first with coherent 4–5 item blocks ordered simple -> complex?' },
  { key: 'form', text: 'LENS: FORM & DATA INTEGRITY. Check mechanically: romaji follows the convention exactly (no macrons; long vowels as spelled — sou/daijoubu/kirei; wa/o/e particles; っ doubling; spacing; leading hyphen for attaching patterns) and matches ja/kana sound for sound; kana is the right reading of ja; polite and politeJa agree; conjugations are correct (masu forms, -te forms, contractions -chau/-toku/-teru/-nakya); example romaji matches example ja word for word; spot-check at least 15 freqRank values with the frequency tool (plus any that look surprising); spot-check at least 10 alsoIn pointers by grepping the files; prereqs name real items; no duplicate slugs; every block has 3–6 items. Put the exact corrected value in fix.' },
]

const built = await pipeline(keptByCat,
  x => agent(`Write the final entries for category ${x.cat.key} — ${x.cat.name} — of the versatility list.

${COMMON}

CATEGORY SCOPE
${x.cat.scope}
Belongs elsewhere: ${x.cat.boundary}

THE ${x.items.length} ITEMS SELECTED FOR THIS CATEGORY (light entries; freqRank values are real tool output — keep them unless you re-run the tool and find an error):
${lightJson(x.items)}

ALL SELECTED ITEMS BY CATEGORY (for prereqs and contrast references only — write entries only for this category):
${otherLines}

WRITE every item above — no additions, no omissions (merge only exact duplicates, keeping the first slug). Keep each slug exactly as given. Fields:
- romaji: casual form (the default). polite: its desu/masu counterpart in romaji, or null when there is no register difference. ja / kana: the casual form in normal written Japanese and in kana. politeJa: the polite form in Japanese (null when polite is null).
- english: short gloss (2–6 words). use: one plain sentence on what it does and when — for endings and stance words, the speaker's intent; note grammatical constraints (needs a negative, attaches to the -te form, etc.).
- example: ONE short casual sentence (3–9 words) a native speaker would actually say to a friend in daily life, using the item in its most common function. Drop subjects and particles the way real casual speech does. romaji (convention above, word for word with ja), ja, english (natural English for what it means in context).
- examplePolite: the SAME sentence as you'd say it in desu/masu speech to a coworker or stranger (romaji, ja, english). null only for casual-only / slang / rough items where a polite version would not be said.
- contrastGroup: a short shared name for items learned side by side because they are easily confused or differ by one nuance (e.g. "ne-yo", "zenzen-amari", "kamo-deshou-to-omou", "demo-kedo-noni"). Items in one group should use the same base sentence in their examples so only the item changes (ashita da ne / ashita da yo / ashita da yo ne). null if none.
- flags, freqRank, freqNote, spread, reach, speakNeed, prereqs, alsoIn: carry over from the light entry, correcting anything wrong. prereqs = romaji of items (any category) that should be learned first. notes: null or one short line (learner trap, regional note).

CHUNK the items into blocks:
- Group by meaning first (a shared family, function, or contrast set), then aim for 4–5 items per block. A natural group of 3 or 6 is fine; never pad a block with an unrelated item, and never split a tight family (a ko/so/a/do series, a contrast set) across blocks.
- Order blocks simple -> complex (frequency, abstraction, grammatical complexity), and items within a block simple -> complex.
- label: a plain short name, 1–4 words (e.g. "Already / not yet", "Agreeing", "this/that: places"). rationale: one line on why these belong together. interference: one line on which items get confused and how to keep them apart (or "none").
Every item appears in exactly one block.`,
    { label: `write:${x.cat.key} ${x.cat.name}`, phase: 'Write', schema: BLOCKS_SCHEMA }),
  (draft, x) => draft ? parallel(LENSES.map(l => () => agent(`Review category ${x.cat.key} — ${x.cat.name} — of a Japanese versatility list (casual default, polite pair, romaji-first, audio-first learner).

${COMMON}

${l.text}

DRAFT:
${JSON.stringify(draft, null, 1)}

Report every problem you find (slug, field, problem, exact fix, severity: fatal = wrong/misleading, major = unnatural or inaccurate, minor = polish). Items that should not be in the list go in cut. summary: 2–3 lines on overall quality.`,
    { label: `verify:${x.cat.key} ${l.key}`, phase: 'Verify', schema: ISSUES_SCHEMA }))).then(reviews => ({ draft, reviews: reviews.map((r, i) => r ? { lens: LENSES[i].key, ...r } : null).filter(Boolean) })) : null,
  (dr, x) => dr ? agent(`Finalise category ${x.cat.key} — ${x.cat.name} — of the Japanese versatility list. Below: the draft and ${dr.reviews.length} independent reviews (naturalness, nuance, form).

${COMMON}

Apply every fatal and major fix unless it is clearly wrong; apply minor fixes that are clearly right. When reviewers conflict, the native-naturalness view wins on wording and the nuance view wins on meaning. Drop an item only when two or more reviewers want it cut, or it is wrong beyond repair — list it in dropped with the reason. Never add items. Re-chunk if drops leave a block below 3 items (merge into the nearest related block). Keep slugs unchanged. Return the complete corrected blocks (every remaining item, every field), a changelog (one line per item you changed) and dropped.

DRAFT:
${JSON.stringify(dr.draft, null, 1)}

REVIEWS:
${JSON.stringify(dr.reviews, null, 1)}`,
    { label: `fix:${x.cat.key} ${x.cat.name}`, phase: 'Fix', schema: FINAL_SCHEMA })
    .then(r => r ? { ...r, cat: x.cat, reviewSummaries: dr.reviews.map(v => `${v.lens}: ${v.summary}`) } : { blocks: dr.draft.blocks, changelog: [], dropped: [], cat: x.cat, unreconciled: true, reviewSummaries: dr.reviews.map(v => `${v.lens}: ${v.summary}`) }) : null
)

// ---------- Assemble ----------
phase('Assemble')
const finalCats = built.filter(Boolean)
const missingCats = keptByCat.filter(x => !finalCats.some(f => f.cat.key === x.cat.key)).map(x => x.cat.key)
if (missingCats.length) log(`WARNING: categories failed to build: ${missingCats.join(', ')}`)
const writeLosses = []
for (const fc of finalCats) {
  const got = new Set(fc.blocks.flatMap(b => b.items.map(it => it.slug)))
  const dropped = new Set(fc.dropped.map(d => d.slug))
  for (const p of keptByCat.find(x => x.cat.key === fc.cat.key).items)
    if (!got.has(p.slug) && !dropped.has(p.slug)) writeLosses.push(`${p.id} ${p.romaji}`)
}
if (writeLosses.length) log(`Items silently lost in writing: ${writeLosses.length}`)

const gids = new Set()
const byId = {}
for (const fc of finalCats) fc.blocks.forEach((b, bi) => {
  b.id = `${fc.cat.key}${bi + 1}`
  b.items.forEach(it => {
    let id = `${fc.cat.key}-${it.slug}`, k = 2
    while (gids.has(id)) id = `${fc.cat.key}-${it.slug}-${k++}`
    gids.add(id); it.id = id; byId[id] = { it, b }
  })
})
const allItems = () => finalCats.flatMap(fc => fc.blocks.flatMap(b => b.items))
const itemLine = it => `${it.id} | ${it.romaji} | ${it.polite || '—'} | ${it.ja} | ${it.english} | pre:${(it.prereqs || []).join(', ')} | cg:${it.contrastGroup || '—'} | block:${byId[it.id].b.id} ${byId[it.id].b.label}`
const cons = await agent(`Cross-category consistency pass over the final Japanese versatility list (${allItems().length} items in ${finalCats.length} categories).

${COMMON}

Check: (1) the same word or ending is spelled identically in romaji everywhere (e.g. "ja nai" vs "janai", "n da" vs "nda") — follow the convention above; (2) every prereq names an item that exists in the list (fix it to the exact romaji, or remove it); (3) true duplicates across categories (same word, same function) — drop the weaker placement; different functions of the same word are fine; (4) contrast groups that span categories use the same group name; (5) romaji convention violations (macrons, wo, capitals, kana in romaji). Return fixes (id, field, full new value — for prereqs / alsoIn / flags give the whole array), drops, notes. Be conservative: only change what is wrong.

ITEMS (id | casual | polite | ja | english | prereqs | contrastGroup | block):
${allItems().map(itemLine).join('\n')}`,
  { label: 'assemble:consistency', phase: 'Assemble', schema: CONS_SCHEMA })
const consApplied = [], consDropped = []
if (cons) {
  for (const f of cons.fixes) {
    const e = byId[f.id]
    if (!e || !FIX_FIELDS.includes(f.field)) continue
    let v = f.value
    if (['prereqs', 'alsoIn', 'flags'].includes(f.field)) v = Array.isArray(v) ? v : (v ? String(v).split(',').map(s => s.trim()).filter(Boolean) : [])
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
const blockSizes = finalCats.flatMap(fc => fc.blocks.map(b => b.items.length))
const oddBlocks = finalCats.flatMap(fc => fc.blocks.filter(b => b.items.length < 3 || b.items.length > 6).map(b => `${b.id} ${b.label} (${b.items.length})`))

const chunks = finalCats.flatMap(fc => fc.blocks.map(b => ({ fc, b })))
const order = await agent(`Order the ${chunks.length} chunks of a Japanese versatility list (${allItems().length} items) into a learning sequence of 4 stages of roughly equal item count.

Principles: interleave categories so each stage lets the learner say more kinds of things (each stage mixes time words, connectors, endings, responses, verbs, adjectives, pointing words) rather than finishing one category before starting the next; respect prereqs (an item's prereqs come in an earlier stage, or earlier in the same stage); most frequent and most needed-for-speaking first; keep each category's internal block order (A1 before A2) unless a prereq forces otherwise. Every chunkId exactly once. Stage name: "Stage 1" ... "Stage 4". summary: one plain line on what the learner can do after it.

CHUNKS (chunkId | category | label | items (casual romaji, drama rank) | prereqs):
${chunks.map(({ fc, b }) => `${b.id} | ${fc.cat.name} | ${b.label} | ${b.items.map(it => `${it.romaji}${it.freqRank ? ' #' + it.freqRank : ''}`).join(', ')} | ${[...new Set(b.items.flatMap(it => it.prereqs || []))].join(', ') || '—'}`).join('\n')}`,
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

const cuts = pool.filter(p => !keep.has(p.id)).map(p => ({ id: p.id, romaji: p.romaji, english: p.english, freqRank: p.freqRank, votes: votes[p.id] || 0 }))
const total = allItems().length
log(`Final: ${total} items, ${chunks.length} chunks, ${stages.length} stages`)

return {
  title: 'Japanese versatility list',
  orderingVariable: 'Course order: 4 stages interleaving all categories; within a category, chunks run simple -> complex.',
  whyThatVariable: 'Versatility = spoken frequency (jiten.moe drama subtitles) x spread across topics x reach x speaking need. Casual is the default form; the polite (desu/masu) counterpart sits next to it.',
  conventions: { romaji: 'modified Hepburn, lowercase, no macrons, long vowels as spelled (sou, daijoubu, kirei); wa/o/e particles', register: 'romaji = casual (default); polite = desu/masu counterpart or null', freqSource: 'jiten.moe drama frequency list (3,030 live-action dramas), CC BY-SA 4.0' },
  stats: { total, chunks: chunks.length, byCategory: finalCats.map(fc => ({ key: fc.cat.key, name: fc.cat.name, items: fc.blocks.reduce((s, b) => s + b.items.length, 0), blocks: fc.blocks.length })), poolSize: pool.length, selected: keep.size, blockSizes },
  stages,
  categories: finalCats.map(fc => ({ key: fc.cat.key, name: fc.cat.name, scope: fc.cat.short, blocks: fc.blocks, changelog: fc.changelog, dropped: fc.dropped, unreconciled: !!fc.unreconciled, reviewSummaries: fc.reviewSummaries })),
  checks: { romajiProblems, oddBlocks, writeLosses, missingCats, consApplied, consDropped, consNotes: cons ? cons.notes : null },
  selection: { selectorNotes: okSels.map(s => s.notes), boundaryNotes: bound ? bound.notes : null },
  gapLog, outOfScope, cuts,
}
