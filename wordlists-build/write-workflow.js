export const meta = {
  name: 'wordlists-write',
  description: 'Write entries and chunks for the core, sets, phrases and conjugations lists; writers save to written/ in parts',
  phases: [{ title: 'Write', detail: 'one writer per batch file in write/' }],
}

// args: { dir, batches: [{ file, kind, n }] } — kind is core | sets | phrases | conj | patterns
const DIR = args.dir
const ROMAJI = `Romaji follows kotoba's spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled (sou, kirei, daijoubu, koohii), n' before a vowel or y (ten'in, kon'ya), n before b/p (ganbaru), tch for っち (kotchi), particles written wa / o / e, words separated by spaces with endings attached (tabemashita, tabete iru, tabetakatta), a leading hyphen for a suffix (-sai).`
const EXAMPLES = `Examples: a casual sentence a native speaker would really say (plain forms, natural particle drops, yo/ne where natural), 4-12 words, using the word in its most common sense and typical form; then the same situation in desu/masu (examplePolite), or null when the item itself only lives in one register. Each example has romaji, ja (natural kanji/kana, the same words as the romaji) and a natural English translation.`
const LEARNER = `The learner is an adult English speaker learning Japanese audio-first (listening and speaking, romaji only) for everyday conversation. Write for that learner: plain, short, concrete English; no filler.`
const CHUNKS = `Chunks: group the entries into chunks of 4-5 (3 to 6 allowed) by meaning first — a shared function or meaning family, natural pairs (open/close, give/receive) together — then by how common they are. Order chunks simple to complex, and items within a chunk most common first. Each chunk: label (2-5 plain words, no colon), rationale (one short sentence: what the chunk lets you say), interference (one short sentence on what gets mixed up, or "None."), members (the src of each entry, in order). Every entry belongs to exactly one chunk.`

const SAVED = {
  type: 'object',
  properties: { files: { type: 'array', items: { type: 'string' } }, entries: { type: 'integer' }, chunks: { type: 'integer' } },
  required: ['files', 'entries', 'chunks'],
}
const SHAPE = `Entry JSON shape (null where a field doesn't apply):
{"src": "...", "ja": "...", "kana": "...", "romaji": "...", "polite": "..."|null, "politeJa": "..."|null, "english": "...", "use": "..."|null,
 "pos": "...", "flags": [], "example": {"romaji": "...", "ja": "...", "english": "..."}, "examplePolite": {"romaji": "...", "ja": "...", "english": "..."}|null,
 "notes": "..."|null}
Phrases add "role": "say"|"hear"|"both"; conjugations and patterns add "name" and "formation".
Chunk JSON shape: {"label": "...", "rationale": "...", "interference": "...", "members": ["src", ...], "stage": 1-4 (sets, phrases, patterns), "set": "s-..." (sets only)}`
const saveRule = (base) => `How to deliver: read only your batch file — don't explore the repository or read other files. Save your work with the Write tool as JSON files in ${DIR}/../written/:
- ${base}.part1.json, ${base}.part2.json, ...: each a JSON array of at most 20 entries, written as you go.
- ${base}.chunks.json: {"chunks": [...], "drops": [{"src": "...", "reason": "..."}]}.
After writing, check every file parses: python3 -c "import json,sys; [json.load(open(f)) for f in sys.argv[1:]]" <files>. Then return the list of files you wrote and the counts.

${SHAPE}`

const COMMON = `${LEARNER}

${ROMAJI}

Entry fields:
- src: the input's src, unchanged (the join key).
- ja, kana (hiragana reading), romaji: the casual headword — dictionary form for verbs and adjectives, the noun alone for nouns, "X suru" for a suru-noun people mostly use as a verb.
- polite / politeJa: the desu/masu counterpart (verbs -masu; adjectives "X desu"); null for nouns, adverbs and words with no register difference.
- english: the meaning, main sense first, senses separated by "; ". Short.
- use: one sentence on when and how it's used, only what the English doesn't already say; null if nothing to add.
- pos: verb / suru-verb / i-adj / na-adj / noun / adverb / connector / pronoun / counter / number / phrase / expression.
- flags: only when they apply (rough, masc, fem, slang, formal, humble, casual-only, dated, needs-negative).
- example / examplePolite: see below.
- notes: null, or one or two short sentences: a second common sense, the mix-up to avoid, register, the verb or noun it usually goes with.

${EXAMPLES}

${CHUNKS}

drops: only an input that duplicates another input or isn't a real word (a tokenizer fragment); give a reason. Never add items that aren't in the input.`

const PROMPTS = {
  core: (f) => `Write learner entries for the everyday words in ${f} (JSON: each candidate has src, ja, kana, romaji, en, pos, key = meaning domain, rank = rank in a drama-subtitle frequency list or null, score = judged everyday commonness 1-5). Write one entry per candidate, then chunk them.

${COMMON}`,
  sets: (f) => `Write the closed word sets described in ${f}: a learner learns each set whole (numbers, counters, days, months, colours, family, body parts, positions, pronouns ...). The file gives each set's key and scope, plus "include" items other judges routed to that set (use their ja as src). Make each set complete for everyday use and no bigger: include every member a learner needs, with the sound changes that trip learners (sanbyaku, roppyaku, ippon, sanbon, juppun, tsuitachi, hatsuka, yokka). For members not in "include", set src to the romaji.

${COMMON}

Extra rules for sets:
- Counters: one entry per counter with the counter as headword (-hon, -mai), its irregular readings for 1-10 and "how many" in use (ippon, nihon, sanbon, roppon, happon, juppon, nanbon). Days of the month and counting people: one entry per irregular member (tsuitachi, futsuka ...; hitori, futari), regular ones covered by one pattern entry (juugo-nichi, sannin).
- One entry per member. Grids that are only memorised together (ichi .. juu) may be chunked as one chunk of up to 6 in order; split longer sequences into chunks of 4-6 in their natural order.
- Give every chunk a stage 1-4: 1 = needed in the first weeks (numbers 1-10, days of the week, family basics, body basics), 4 = needed later or rarely.
- Give every chunk its set key (set: "s-numbers" ...); a chunk never mixes two sets.
- For family words, the headword is the casual form a learner uses for their own family in casual talk; put the someone-else's / polite counterpart in polite where it differs (haha → okaasan), and say in use which is for whose family.`,
  phrases: (f) => `Write learner entries for the set phrases in ${f} (each candidate has src, ja, kana, romaji, polite, en, key = situation, score = judged commonness 1-5, count = times heard in 3.17M lines of film and TV subtitles, or null).

${COMMON}

Extra rules for phrases:
- The headword is the phrase as people say it; when its usual form is polite (irasshaimase, arigatou gozaimasu) that is the headword and polite is null.
- role: say (you'll need to say it), hear (mostly said to you: staff, announcements), or both.
- use says the situation and who says it to whom, and what to answer when that matters.
- Give every chunk a stage 1-4: 1 = needed in the first weeks, 4 = later or rarer.`,
  conj: (f) => `Write learner entries for the conjugation forms in ${f}. Each item has a key, a label, a brief, and a table already generated by code (the form for 13 model verbs, or for takai / ii / kirei / gakusei) with the count from a subtitle corpus where measured. Don't write tables; the code's table is shown beside your entry.

${LEARNER}

${ROMAJI}

For each item return: src (the key), romaji (the label, as given or tidied), name (a short English name: "te-form", "polite past"), ja (the ending in Japanese, e.g. 〜て), kana (same in hiragana), english (what it does, one line), use (when people use it, 1-2 sentences), formation (how to make it from the dictionary form for ichidan, godan, suru/kuru, plus any exception; 1-3 short sentences that agree with the table), polite (the polite counterpart's label, e.g. "-mashita", or null), politeJa (null), pos ("form" or "rule"), flags, example, examplePolite (the same idea politely, or null), notes (null or the mix-up to avoid).

${EXAMPLES}
For a rule item, the examples show the rule at work in a sentence.

chunks: return one chunk per distinct "chunk" value in the file, in the file's order, with your label (you may keep the given one), rationale, interference and members (keys in the file's order). drops: [].`,
  patterns: (f) => `Write learner entries for the grammar patterns in ${f}: expressions that attach to words or clauses (koto ni naru, kamoshirenai, ni totte, no sei de ...). Each has src, ja, romaji, en and score (judged everyday commonness 1-5). The file also lists the patterns the main list already teaches (mainList) and the forms the conjugation list teaches (conjugationList); don't repeat those — drop an input that duplicates one of them or another input, or that is a plain conjugated form rather than a pattern, with the reason.

${COMMON}

For patterns: the headword shows the attachment with a hyphen where it attaches (-koto ni naru, -kamoshirenai); ja the same (〜ことになる); formation says what it attaches to (dictionary form, -ta form, noun + no ...); pos "pattern". Give every chunk a stage 1-4.`,
}

phase('Write')
const runs = args.batches.map((b) => () =>
  agent(PROMPTS[b.kind](`${DIR}/${b.file}`) + '\n\n' + saveRule(b.file.replace(/\.json$/, '')), { label: `write:${b.kind}:${b.n}`, phase: 'Write', schema: SAVED })
    .then((r) => r && { ...b, ...r }))
const results = (await parallel(runs)).filter(Boolean)
log(`${results.length}/${runs.length} writers returned; ${results.reduce((s, r) => s + r.entries, 0)} entries`)
return results
