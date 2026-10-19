export const meta = {
  name: 'wordlists-conversation',
  description: 'Score every Round 7 entry for conversational value, re-key phrases by chat move, hunt missing conversation phrases',
  phases: [{ title: 'Score', detail: '5 judges over the four lists, 2 hunters for chat phrases' }],
}

const DIR = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research/wordlists-build/cv'
const RUBRIC = `${DIR}/rubric.md`
const ROMAJI = `romaji in kotoba spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled (sou, kirei, daijoubu), n' before a vowel or y, tch for っち, particles wa / o / e, words separated by spaces with endings attached`

const SCORES = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, cv: { type: 'integer', minimum: 1, maximum: 5 }, move: { type: 'string' } },
        required: ['id', 'cv'],
      },
    },
  },
  required: ['items'],
}
const FOUND = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ja: { type: 'string' }, kana: { type: 'string' }, romaji: { type: 'string' }, polite: { type: ['string', 'null'] },
          en: { type: 'string' }, move: { type: 'string' }, cv: { type: 'integer', minimum: 1, maximum: 5 },
          surface: { type: 'array', items: { type: 'string' } },
        },
        required: ['ja', 'kana', 'romaji', 'en', 'move', 'cv'],
      },
    },
  },
  required: ['items'],
}

const judge = (b, phrases) => `You are a native Japanese speaker and teacher. Read ${RUBRIC} first: the conversational-value scale (cv) and, for phrases, the chat moves.

Then read ${DIR}/${b}.tsv (id, romaji, english, current topic, use). For EVERY line return {id, cv}${phrases ? ', plus move: the chat-move key (c-react ... c-errands) this phrase belongs to. Use c-errands for anything whose home is a shop, restaurant, office, phone call with a business, travel or an emergency, or that staff say to customers' : ''}.

Judge each item by how much it helps someone keep a casual conversation going with friends, not by how common it is in general. A common word that mostly serves errands (receipt, platform, insurance card, "do you need a bag?") scores low; a modest word people use constantly when chatting (hima, mukatsuku, kekkyoku, uketa) scores high. Honorific and humble business forms score low unless friends really use them. One record per line, same id; nothing added.`

const MOVE_GROUPS = [['c-react', 'c-ask', 'c-agree', 'c-opine', 'c-repair', 'c-flow'], ['c-tell', 'c-feel', 'c-catchup', 'c-plans', 'c-banter', 'c-social']]
const hunt = (moves) => `You are a native Japanese speaker and teacher. The learner is an adult English speaker learning Japanese audio-first in romaji, and the goal is to SUSTAIN CASUAL CONVERSATION with Japanese friends — not to handle shopping, travel or service encounters. Read ${RUBRIC} for the cv scale and the chat moves.

List about 120 conversation phrases for these moves: ${moves.join(', ')} — the set expressions and short ready-made lines that keep a chat going: reactions, follow-up questions, hedges, ways to agree or push back, story glue, ways to show sympathy or tease. Spread them over the moves by how much each move happens in real chat. Favour what friends actually say, in casual register, including contractions and sentence-final particles as said (maji de?, sore na, da yo ne~, ...tte koto?).

${DIR}/have.txt lists the ${'~900'} items the learner's lists already teach (romaji and meaning). Don't repeat them or trivial variants of them; a clearly different set phrase built on one of them is fine.

For each phrase: ja (natural written form), kana, romaji (${ROMAJI}), polite (the polite counterpart if one is used, else null), en (natural English for what it does), move (one of the keys above), cv (4 or 5 only; leave out anything lower), surface (1-3 literal strings of at least 3 characters to count it in a subtitle corpus).`

phase('Score')
const runs = [
  ...['phrases', 'sets-conj', 'core-1', 'core-2', 'core-3'].map((b) => () =>
    agent(judge(b, b === 'phrases'), { label: `cv:${b}`, phase: 'Score', schema: SCORES }).then((r) => r && { batch: b, ...r })),
  ...MOVE_GROUPS.map((m, i) => () =>
    agent(hunt(m), { label: `hunt:${i + 1}`, phase: 'Score', schema: FOUND }).then((r) => r && { batch: `hunt-${i + 1}`, ...r })),
]
const results = (await parallel(runs)).filter(Boolean)
log(`${results.length}/${runs.length} returned; ${results.reduce((s, r) => s + r.items.length, 0)} records`)
return results