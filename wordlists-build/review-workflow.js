export const meta = {
  name: 'wordlists-review',
  description: 'One native-speaker review per batch of written entries, returning field edits and drops only',
  phases: [{ title: 'Review', detail: 'one reviewer per review/*.md batch' }],
}

// args: { dir, files: [names] } — each file is a batch of entries rendered as text, with code-check flags inline.
const ROMAJI = `kotoba spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled (sou, kirei, daijoubu, koohii), n' before a vowel or y, n before b/p, tch for っち, particles wa / o / e, words separated by spaces with endings attached (tabemashita, tabete iru)`
const OUT = {
  type: 'object',
  properties: {
    edits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          field: { enum: ['romaji', 'polite', 'english', 'use', 'ja', 'kana', 'politeJa', 'notes', 'formation', 'name',
            'example.romaji', 'example.ja', 'example.english', 'examplePolite.romaji', 'examplePolite.ja', 'examplePolite.english'] },
          value: { type: ['string', 'null'] },
          why: { type: 'string' },
        },
        required: ['id', 'field', 'value', 'why'],
      },
    },
    drops: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'reason'] } },
  },
  required: ['edits', 'drops'],
}

const prompt = (f) => `You are a native Japanese speaker and an experienced teacher reviewing entries for an English-speaking adult who learns Japanese audio-first in romaji, for everyday conversation. Read ${args.dir}/${f}. Each entry shows its id, headword, polite form, meaning, use, written forms, a casual and a polite example and notes; "FLAG" lines are problems an automatic check found (some are false alarms: kanji readings vary, particles は/へ read as ha/he).

Check every entry:
1. Examples: would a native speaker really say this, in this register? Natural word choice, particles, contractions and sentence-final particles; the casual one casual, the polite one desu/masu; the word used in its most common sense and form.
2. Meaning: the English gloss, use and notes are correct and not misleading; the main sense comes first.
3. Agreement: romaji, ja and kana say the same words, in ${ROMAJI}; example romaji matches its ja word for word; the polite form is right.
4. Every FLAG: fix the cause or ignore it if it's a false alarm.

Return only what needs changing, as edits: {id, field, value (the full replacement text for that field), why (a few words)}. Field names: romaji, polite, english, use, ja, kana, politeJa, notes, formation, name, example.romaji, example.ja, example.english, examplePolite.romaji, examplePolite.ja, examplePolite.english. When you change an example's ja, also give its romaji (and English if it changed). Don't rewrite text that is already fine, and don't restyle.
drops: only an entry that shouldn't be in the list at all (a duplicate of another entry, or not a word people really say), with the reason. Never add entries.`

phase('Review')
const runs = args.files.map((f, i) => () => agent(prompt(f), { label: `review:${i + 1}`, phase: 'Review', schema: OUT }).then((r) => r && { file: f, ...r }))
const results = (await parallel(runs)).filter(Boolean)
log(`${results.length}/${runs.length} reviewers returned; ${results.reduce((s, r) => s + r.edits.length, 0)} edits, ${results.reduce((s, r) => s + r.drops.length, 0)} drops`)
return results
