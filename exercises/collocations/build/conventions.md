# Collocation listening scripts: conventions

One short listening script per chunk of `21-list-collocations.json` (94 chunks, 405 collocations). Each script is a
scene in natural spoken Japanese where the chunk's collocations come up several times, followed by quiz questions.

## The learner

An English speaker learning Japanese by ear. They never read kana or kanji: they hear the script as text-to-speech
audio, answer the questions by ear, then check the romaji transcript. Production matters more than recognition, so
half the quiz has them say something.

## Romaji (kotoba's spelling, used everywhere in romaji fields)

- Modified Hepburn, all lowercase, names included (yuki, kenta, tanaka-san). No macrons.
- Long vowels spelled as the kana are: ou, uu, ei, ii; katakana ー doubles the vowel (koohii, keeki).
- Particles are written wa, o, e. Words are separated by spaces; particles are separate words.
- Small っ doubles the next consonant; before ch it is t (matchi, itte, kitto).
- n' (with apostrophe) before a vowel or y: ten'in, fun'iki, kin'en. Otherwise n (shinbun, sanpo).
- Inflections stay attached to their verb or adjective: futteru, furareta, ikimasu, samukatta, futtemasu.
  Copula and sentence-final bits are separate words: da, desu, yo, ne, n da, no, ka, kana, kedo.
- Sentence punctuation: . , ? ! only.

## Japanese fields

- `ja`: natural written Japanese (kanji + kana; katakana for cast names: ユキ, ケンタ). Japanese punctuation 。、？！
- `kana`: the full reading in hiragana, cast names included (ゆき), same punctuation, so a voice that misreads a kanji
  can use it instead.
- `english`: a natural translation, not word for word.
- romaji, ja and kana must say exactly the same thing, word for word.

## The cast (same voices in every script, so the audio stays consistent)

| id | name | voice | who |
|---|---|---|---|
| yuki | Yuki | female, late 20s, bright and friendly | office worker; Kenta's old friend; Mai's coworker; Kenji's big sister |
| kenta | Kenta | male, late 20s, relaxed and easygoing | Yuki's old friend; shares a flat with Sora; likes football and cooking |
| mai | Mai | female, late 20s, warm, a little shy | Yuki's coworker (Kimura-san at work); has a cat |
| sora | Sora | male, mid 20s, light voice, playful | Kenta's flatmate; student turned part-timer at a café |
| tanaka | Tanaka-san | male, 40s, calm and kind, polite office speech | Yuki and Mai's manager |
| kenji | Kenji | male, late teens, sleepy, mumbling | Yuki's little brother, high school |
| okaasan | Okaasan | female, 50s, warm, motherly | Yuki and Kenji's mother |
| satou | Satou-san | male, 70s, polite, kind, unhurried | the elderly neighbour |

One-off roles are fine when a scene needs them (a doctor, shop staff, a station announcement): give them an id, a role
name (Doctor, Staff) and a voice hint. Keep each cast member's voice text exactly as above.

Speech style follows the relationship: friends and family speak casually; Tanaka-san and staff are polite; Yuki and Mai
speak politely to Tanaka-san and Satou-san and casually to each other.

## Shape of a script

- A dialogue of 10–18 lines, or a monologue of 7–12 lines (a voicemail, a vlog, someone talking to their cat, a
  diary-style recap). Short lines: one or two short sentences each.
- A simple, plausible everyday scene with a small point to it (a plan changes, something goes wrong, a small surprise),
  so the gist question has a real answer.
- Register: `casual`, `polite` or `mixed`, matching the scene.

## Targets, review and level

- Every target collocation of the chunk is heard at least twice (three times is better), in its core sense, in natural
  inflections (futteru, futte kita, furisou). Particle dropping in casual speech is fine (ame futteru) and still counts.
  Don't force it: if a line would sound like a drill, rewrite the scene instead.
- Where the chunk's mix-ups note sets two items against each other, let the listener hear the contrast in the scene.
- Use 1–3 review collocations from the brief's `reviewPool` (earlier chunks), where they fit naturally.
- Every line lists in `uses` the ids of the target and review collocations it contains.
- Allowed words: items of `collocations-build/versatility-items.txt` whose stage (5th column) is at or below the
  script's stage; the nouns, verbs and adjectives inside this chunk's targets and the review pool; cast names; numbers,
  days and times. Every other content word (noun, verb, adjective, adverb) goes in `newWords` with romaji, ja and a
  short English gloss. Aim for 6 new words or fewer; reuse them rather than adding more.

## Questions

1. One `gist` question first: what happened, or what someone decided. Three English choices.
2. Then one question per target collocation, in the chunk's order, each with `targets: [that id]`:
   - `heard`: which phrase did a character say? Three choices in romaji (each with a short English gloss). The right one
     is the target as heard. Wrong ones are what an English speaker might say instead (the target's trap, a word-for-word
     calque) or the chunk's contrast partner when it doesn't fit the moment. The explanation says why each wrong one is
     wrong.
   - `meaning`: what did the phrase mean right there, or what happened because of it? Three English choices.
   - `respond`: a cast member says a cue line (the question's ja/kana/romaji) and the listener answers out loud using
     the target. No choices. `answer` says what to say; give two `modelAnswers` (romaji, ja, english) that both use the
     target, one casual and one polite or a second natural variant.
   At least half of the target questions (rounded up) are `respond`. With three or more targets, use all three types.
3. Every question is answerable by ear: never mention line numbers in the question itself (explanations may cite them).
   Exactly one choice is right; the wrong ones are plausible, not silly. Choices are in random-looking order (the answer
   is not always A).
4. For `gist`, `heard` and `meaning`, the question's ja/kana/romaji is a short spoken Japanese version of the question
   at the script's level (何がありましたか？ nani ga arimashita ka?; ユキさんは何と言いましたか？).
