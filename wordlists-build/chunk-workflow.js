export const meta = {
  name: 'wordlists-chunk-phrases',
  description: 'Re-chunk the conversation phrases by chat move, and review the newly written phrases',
  phases: [{ title: 'Chunk and review', detail: 'one chunker per group of moves, one reviewer per ~140 new phrases' }],
}

// args: chunk-args.json — { cv, review, chunks: [tsv files], reviews: [md files], moves: {key: description} }
const CHUNKS = {
  type: 'object',
  properties: {
    chunks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          move: { type: 'string' }, label: { type: 'string' }, rationale: { type: 'string' }, interference: { type: 'string' },
          members: { type: 'array', items: { type: 'string' } }, stage: { type: 'integer', minimum: 1, maximum: 3 },
        },
        required: ['move', 'label', 'rationale', 'interference', 'members', 'stage'],
      },
    },
  },
  required: ['chunks'],
}
const moves = Object.entries(args.moves).map(([k, v]) => `- ${k}: ${v}`).join('\n')
const chunkPrompt = (f) => `You are a native Japanese speaker and teacher organising conversation phrases for an adult English speaker who learns Japanese audio-first in romaji. The goal is to sustain casual conversation with friends.

Read ${args.cv}/${f}: phrases with their chat move, id, romaji, meaning, conversational value (cv 1-5) and role. The moves:
${moves}

Group the phrases of each move into chunks of 4-5 (3 to 6 allowed) by what they do in a conversation: phrases a learner would reach for in the same moment go together (surprise reactions; ways to ask "and then?"; soft disagreement ...). A chunk never mixes moves. Order chunks within a move from the most useful in everyday chat to the least, and the phrases within a chunk the same way.

Each chunk: move, label (2-5 plain words, no colon), rationale (one short sentence: what the chunk lets you do in a conversation), interference (one short sentence on what gets mixed up, or "None."), members (ids, in order), stage (1 = needed in your first real conversations: small talk, getting to know someone, trading opinions, and the reactions and follow-ups those run on; 2 = soon after; 3 = later). Every id in the file goes in exactly one chunk; don't add or drop any.`

const REVIEW = {
  type: 'object',
  properties: {
    edits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          field: { enum: ['romaji', 'polite', 'english', 'use', 'ja', 'kana', 'politeJa', 'notes',
            'example.romaji', 'example.ja', 'example.english', 'examplePolite.romaji', 'examplePolite.ja', 'examplePolite.english'] },
          value: { type: ['string', 'null'] }, why: { type: 'string' },
        },
        required: ['id', 'field', 'value', 'why'],
      },
    },
    drops: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'reason'] } },
  },
  required: ['edits', 'drops'],
}
const reviewPrompt = (f) => `You are a native Japanese speaker and an experienced teacher reviewing new conversation phrases for an English-speaking adult who learns Japanese audio-first in romaji, to chat with friends. Read ${args.review}/${f}. Each entry shows its id, headword, polite form, meaning, use, written forms, a casual and a polite example and notes.

Check every entry: would friends really say this, in this form and register? Is the example a natural bit of casual conversation, and the polite one natural desu/masu? Is the English right and not misleading? Do romaji, ja and kana say the same words, in kotoba spelling (modified Hepburn, lowercase, no macrons, long vowels as spelled, n' before a vowel or y, tch for っち, particles wa / o / e, words spaced with endings attached)?

Return only what needs changing, as edits {id, field, value (the full replacement), why}; when you change an example's ja, also give its romaji. drops: only an entry that isn't something people really say, or duplicates another entry, with the reason. Never add entries.`

phase('Chunk and review')
const runs = [
  ...args.chunks.map((f, i) => () => agent(chunkPrompt(f), { label: `chunk:${i + 1}`, phase: 'Chunk and review', schema: CHUNKS }).then((r) => r && { file: f, ...r })),
  ...args.reviews.map((f, i) => () => agent(reviewPrompt(f), { label: `review-new:${i + 1}`, phase: 'Chunk and review', schema: REVIEW }).then((r) => r && { file: f, ...r })),
]
const results = (await parallel(runs)).filter(Boolean)
log(`${results.length}/${runs.length} returned`)
return results
