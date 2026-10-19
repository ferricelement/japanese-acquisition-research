export const meta = {
  name: 'wordlists-focus',
  description: 'Tag entries that serve small talk, getting to know someone and opinions; hunt phrases for those moves',
  phases: [{ title: 'Focus', detail: '3 judges tag focus entries, 1 hunter for the top-tier moves' }],
}

const DIR = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research/wordlists-build/cv'
const ROMAJI = `romaji in kotoba spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled (sou, kirei, daijoubu), n' before a vowel or y, tch for っち, particles wa / o / e, words separated by spaces with endings attached`
const TAGS = {
  type: 'object',
  properties: {
    focus: {
      type: 'array',
      items: { type: 'object', properties: { id: { type: 'string' }, move: { type: 'string' } }, required: ['id'] },
    },
  },
  required: ['focus'],
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

const judge = (files, phrases) => `You are a native Japanese speaker and teacher. Read ${DIR}/focus.md first: what counts as FOCUS (small talk, getting to know someone, trading opinions on a topic) and the chat moves.

Then read ${files.map((f) => `${DIR}/${f}`).join(' and ')} (id, romaji, english, topic, use). Return in "focus" every item that is FOCUS — and only those${phrases ? `. For each phrase you return, also give move: the top-tier move it serves (c-intro, c-likes, c-opine or c-catchup), or its current kind of move (c-react, c-ask, c-agree ...) when it is a reaction, follow-up or hedge those exchanges run on` : ''}. Be selective: focus is what a learner needs in their first conversations with new friends, not everything that could come up.`

const hunt = `You are a native Japanese speaker and teacher. The learner is an adult English speaker learning Japanese audio-first in romaji. Above everything else they want SMALL TALK, GETTING TO KNOW SOMEONE, and TRADING OPINIONS ON A TOPIC. Read ${DIR}/focus.md for the moves.

List about 150 conversation phrases for c-intro, c-likes, c-opine and c-catchup: the questions people ask a new friend and the ways to answer them (job, studies, hometown, family, where you live, how long, why Japan, hobbies, weekends, food, music, travel), small-talk openers and replies, and ways to ask what someone thinks about a topic, give your view, compare and hedge it. Casual register as friends speak, with the polite counterpart where one is used; question-and-answer pairs are welcome as separate entries. ${DIR}/have.txt lists what the learner's lists already teach; don't repeat those or trivial variants.

For each phrase: ja (natural written form), kana, romaji (${ROMAJI}), polite (or null), en (natural English for what it does), move (c-intro, c-likes, c-opine or c-catchup), cv (5 for the essentials, 4 otherwise; nothing lower), surface (1-3 literal strings of at least 3 characters to count it in a subtitle corpus).`

phase('Focus')
const runs = [
  () => agent(judge(['core-1.tsv', 'core-2.tsv'], false), { label: 'focus:core-a', phase: 'Focus', schema: TAGS }).then((r) => r && { batch: 'core-a', ...r }),
  () => agent(judge(['core-3.tsv', 'sets-conj.tsv'], false), { label: 'focus:core-b', phase: 'Focus', schema: TAGS }).then((r) => r && { batch: 'core-b', ...r }),
  () => agent(judge(['phrases.tsv'], true), { label: 'focus:phrases', phase: 'Focus', schema: TAGS }).then((r) => r && { batch: 'phrases', ...r }),
  () => agent(hunt, { label: 'hunt:top', phase: 'Focus', schema: FOUND }).then((r) => r && { batch: 'hunt-top', ...r }),
]
const results = (await parallel(runs)).filter(Boolean)
log(`${results.length}/${runs.length} returned`)
return results