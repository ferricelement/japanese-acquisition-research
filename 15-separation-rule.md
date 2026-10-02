# Part 1 — One separation rule

## The diagnosis

The two numbers conflicted because they were measuring different things and neither was measuring the thing that matters. "Five weeks" is calendar time. "200 items" is queue position. Neither is interference. Interference is a competition at a shared retrieval cue, and what determines its outcome is the **retrieval strength of the incumbent at the moment the competitor arrives** — which in an SRS is neither calendar time nor card count, because a lapsed card has short strength no matter how long ago you learned it.

So the separation must be expressed in **the incumbent's current scheduling interval**, queried at queue-build time. That makes it self-correcting: if the incumbent lapses, the gate re-closes automatically.

## The rule

At a shared cue, the probability of retrieving incumbent *i* rather than newcomer *N* follows a strength-ratio competition:

```
P(i) = S_i / (S_i + c·k·S_N)
```

Requiring `P(i) ≥ R`, and substituting `S ≈ current interval` (the FSRS stability proxy) with `S_N = 1 day` (a newcomer's post-learning interval):

> **N may enter the new-card queue on the first day when, for every unconsolidated competitor *i* on N's cue:**
> **`interval(i)  ≥  [R/(1−R)] · c(i,N) · k   days`**
>
> - `R` = target retention **for interfered items only**. Set **R = 0.95**, not the course-wide 0.90 — a lapse at a shared cue is a *mis-retrieval*, which retrieval-strengthens the wrong association, unlike an ordinary blank. **R/(1−R) = 19.**
> - `c(i,N)` = cue overlap, 0–1, computed **per card direction** (below).
> - `k` = count of unconsolidated competitors on the cue. **Unconsolidated = interval < 30 days.** Items past 30 days have been discriminated and drop out of the fan; if one lapses back under 30, it re-enters and re-closes the gate.

The constant 19 is not a round number — it is the retention odds you chose. At R = 0.90 it is 9; at R = 0.98 it is 49.

**The critical refinement: c is direction-specific.** This course has recognition cards (audio → meaning) and production cards (meaning → audio). Compute `c_R` from acoustic overlap of the prompts, `c_P` from situational/semantic overlap.

| Relationship | c_R | c_P | Where the interference lives |
|---|---|---|---|
| Bare segmental+accentual homophone | 1.00 | 0.00 | Recognition only |
| Homophone with 2–4 mora collocation frame | 0.75 | 0.00 | Recognition only |
| Homophone with differing accent + frame | 0.45 | 0.00 | Recognition only |
| Shared suffix, different stem, differing aspectual wrapper | 0.35 | 0.10 | Recognition |
| Same form, different grammar (-rareru readings) | 0.90 | 0.60 | Both |
| Near-synonyms, no acoustic overlap (mitai / rashii) | 0.05 | 0.75 | **Production only** |

This is the finding that dissolves the contradiction. Homophones are a listening problem; near-synonyms are a speaking problem. The plan was applying one window to both.

**Interval → elapsed-day translation** (no-lapse ladder at ~90% retention; planning approximation only — the gate is the scheduler query, not this table):

| Days since introduction | 0 | 1 | 4 | 12 | 32 | 82 |
|---|---|---|---|---|---|---|
| Current interval | 1 | 3 | 8 | 20 | 50 | 120 |

## Applied to Case A — potential (wk 13) vs. transitivity pairs

First, the plan applied one separation to a set where **most members have no collision at all.** Here is the actual collision inventory. These are the only transitivity pairs whose intransitive member is segmentally identical to a live potential:

**Live collisions (intransitive ‖ potential of a godan verb) — 14:**

1. **kireru** ‖ pot. of *kiru* (cut)
2. **yakeru** ‖ pot. of *yaku* (bake/burn)
3. **toreru** ‖ pot. of *toru* (take)
4. **wareru** ‖ pot. of *waru* (split)
5. **nukeru** ‖ pot. of *nuku* (pull out)
6. **oreru** ‖ pot. of *oru* (fold)
7. **ureru** ‖ pot. of *uru* (sell)
8. **tokeru** ‖ pot. of *toku* (solve/untie)
9. **mukeru** ‖ pot. of *muku* (peel)
10. **nureru** ‖ pot. of *nuru* (paint)
11. **yabureru** ‖ pot. of *yaburu* (tear)
12. **kakeru** ‖ pot. of *kaku* (write)
13. **hodokeru** ‖ pot. of *hodoku* (untie)
14. **sakeru** ‖ pot. of *saku* (tear)

**Blocked collisions (the -eru form is the *transitive*; the potential reading is semantically dead because the subject would be inanimate) — 4:** *tsukeru* ‖ pot. of *tsuku*; *tateru* ‖ pot. of *tatsu*; *todokeru* ‖ pot. of *todoku*; *akeru* ‖ pot. of *aku*. These need no separation.

**Zero-collision pairs — everything else,** roughly 30 of them: *deru/dasu, hairu/ireru, kieru/kesu, ochiru/otosu, okiru/okosu, oriru/orosu, naoru/naosu, kowareru/kowasu, shimaru/shimeru, hajimaru/hajimeru, tomaru/tomeru, kimaru/kimeru, mitsukaru/mitsukeru, agaru/ageru, sagaru/sageru, atsumaru/atsumeru, nokoru/nokosu, mawaru/mawasu, taoreru/taosu, yogoreru/yogosu, koboreru/kobosu, hazureru/hazusu, narabu/naraberu, tsubureru/tsubusu, nagareru/nagasu, sugiru/sugosu, noru/noseru, wakareru/wakeru, tsutawaru/tsutaeru, susumu/susumeru.* **These required 0 weeks of separation from the potential and should never have been held to month 8.**

Now the arithmetic for the 14 that do collide. Two competitors exist, not one:

*Per-item:* incumbent = the specific potential card (e.g. *kireru* "can cut"). With the intransitive carded in an eventive frame, `c_R = 0.35`, `k = 1`:
`interval ≥ 19 × 0.35 × 1 = 6.65 days` → clears 4 days after that potential card.

*Schema-level:* incumbent = the rule "V-eru = potential," whose strength is the median interval of its exemplar cards. Every lexical -eru intransitive is a counterexample attacking that one cue, so `k` = the number of unconsolidated intransitives in flight. Holding `k ≤ 3`:
`interval ≥ 19 × 0.30 × 3 = 17.1 days` → the schema's median exemplar interval must be ≥ 17 days, reached ~12 days after the last potential exemplar card.

**Committed answer for Case A:** with the potential introduced wk 13 and exemplars added through wk 15, the first -eru intransitive opens in **week 17** — a separation of **4 weeks from the potential's first card, 12 days of interval from its last.** Intake capped at **3 unconsolidated -eru intransitives at a time**, i.e. ~3 every 12 days, so the 14 land across **wks 17–25**. If they were carded bare instead of framed (`c_R = 0.85`), `19 × 0.85 × 3 = 48.5 days` of required interval → week 20, and the residual confusion is permanent. Frame them.

The plan's "five weeks" was accidentally in the right ballpark and had no mechanism; its actual month-8 placement was ~15 weeks of over-conservatism applied to 30 pairs that were never at risk.

## Applied to Case B — competing kango readings

Same formula, different parameters, recognition direction, `k = 1` (the binding incumbent is always the most recent family member; earlier ones have consolidated past 30 days):

- **Framed homophone, member 2:** `19 × 0.75 × 1 = 14.25 days` of interval → **~12 elapsed days ≈ 240 cards** at 20/day. The plan's 200-item window was right to within one review step.
- **Member 3:** 12 days after member 2 → **24 days / ~480 cards after member 1.**
- **Member 4:** → **36 days / ~720 cards after member 1.**
- **Batching two members on one day is automatically forbidden:** for the second, `k = 2`, requiring `19 × 0.75 × 2 = 28.5 days` of interval on a card introduced hours earlier. Impossible. The rule enforces the cadence without a separate policy.
- **Wago homophones separated by accent** (`c_R = 0.45`): `19 × 0.45 = 8.55 days` → **~4 elapsed days.** *ame* [1] rain / *ame* [0] candy; *hana* [2] flower / *hana* [0] nose; *kaki* [1] oyster / *kaki* [0] persimmon can sit nearly adjacent. But *kami* paper / *kami* hair (both ~[2]) and *kumo* cloud / *kumo* spider (both ~[1]) are true collisions at c_R = 0.75 and take the full 12 days. (Accents approximate.)

**The kango families that actually matter in a 6,000-word conversational vocabulary,** with member ordering by conversational frequency and the committed gap. Frame each with its 2–4 mora collocation:

| # | Family | Order (frame) | Gap |
|---|---|---|---|
| 1 | **seikaku** | seikaku *ga ii* (personality) → seikaku *ni* (accurate) | 12 d |
| 2 | **kikai** | kikai *ga aru* (opportunity) → kikai *o tsukau* (machine) | 12 d |
| 3 | **kikan** | kikan *chuu* (period) → kikan *no hito* (institution) | 12 d |
| 4 | **kagaku** | kagaku *no hon* (science) → kagaku *no jikken* (chemistry) | 12 d |
| 5 | **kooen** | kooen *de asobu* (park) → kooen *o kiku* (lecture) | 12 d |
| 6 | **shiritsu** | shiritsu *no gakkoo* (private) → shiritsu *no toshokan* (municipal) | 12 d |
| 7 | **kanshin** | kanshin *ga aru* (interest) → kanshin *shita* (impressed) | 12 d |
| 8 | **kootai** | kootai *suru* (take turns) → kootai *shita* (retreat) | 12 d |
| 9 | **sansei** | sansei *desu* (agree) → sansei *no* (acidic) | 12 d |
| 10 | **jiki** | jiki *ga kuru* (season) → jiki *o obiru* (magnetism) | 12 d |
| 11 | **seisan** | seisan *o suru* (settle up) → seisan *ryoo* (production) | 12 d |
| 12 | **shikai** | shikai *o suru* (MC) → shikai *ga warui* (visibility) | 12 d |
| 13 | **kansei** | kansei *shita* (completion) → kansei *ga agaru* (cheer) | 12 d |
| 14 | **kyooryoku** | kyooryoku *suru* (cooperate) → kyooryoku *na* (powerful) | 12 d |
| 15 | **kikoo** | kikoo *ga ii* (climate) → kikoo *o kaeru* (mechanism) | 12 d |
| 16 | **hikaku** | hikaku *suru* (compare) → hikaku *seihin* (leather) | 12 d |
| 17 | **shiyoo** | shiyoo *ga nai* (no help for it) → shiyoo *chuu* (in use) → shiyoo *o kimeru* (spec) | 12 d, 24 d |
| 18 | **hoshoo** | hoshoo *kikan* (guarantee) → hoshoo *suru* (security) → hoshoo *o harau* (compensation) | 12 d, 24 d |
| 19 | **taishoo** | taishoo *ni naru* (target) → taishoo *teki* (contrast) → taishoo *na katachi* (symmetry) | 12 d, 24 d |
| 20 | **kaihoo** | kaihoo *suru* (release) → kaihoo *teki* (open) → kaihoo *ni mukau* (recovery) | 12 d, 24 d |
| 21 | **ishi** | ishi *ni iku* (doctor) → ishi *ga tsuyoi* (will) → ishi *o tsutaeru* (intention) | 12 d, 24 d |
| 22 | **kootei** | kootei *suru* (affirm) → kootei *ga susumu* (process) → kootei *de asobu* (schoolyard) | 12 d, 24 d |
| 23 | **shinkoo** | shinkoo *chuu* (in progress) → shinkoo *shin* (faith) → shinkoo *kigyoo* (new/emerging) | 12 d, 24 d |
| 24 | **kanshoo** | kanshoo *suru* (appreciate) → kanshoo *suru* (interfere) → kanshoo *teki* (sentimental) | 12 d, 24 d |
| 25 | **jitai** | sore *jitai* (itself) → hijoo *jitai* (situation) → jitai *suru* (decline) | 12 d, 24 d |

Worth carding explicitly: Japanese itself repairs the worst of these in speech — *kagaku* → **bakegaku** for chemistry, *shiritsu* → **watakushiritsu** / **ichiritsu**. Teach the repair form alongside the collision; it is the native listener's own disambiguation strategy and it is audio-native.

## Implementation

The gate is one query at queue-build time, not a calendar:

```
eligible(N) = all(interval(i) >= 19 * c(i,N) * k
                  for i in cue_family(N) if interval(i) < 30)
```

Store `c` as a sparse edge list on the card graph, one edge per collision pair with a direction tag (R or P). Roughly 300 edges cover the whole 6,000-item course.

---

# Part 2 — The -eru disambiguation

## The ga/o cue is dead, and worse than the plan thinks

"Potential takes *ga*, transitive takes *o*" fails for all 14 live collisions above, because every one is a potential colliding with an **intransitive**, where both members take *ga*. And a course that cards *-teru*, *-chau*, *-tte*, *-n da* as citation forms is a course that has trained the learner to expect particle-dropped speech, so the one cue it leans on is the one it taught them not to hear.

It is worse than a one-cell collision. The potential of a godan verb **is itself an ichidan verb on the same stem**, so the paradigms are segmentally identical throughout:

| | *kiru* (cut) → potential | *kireru* (snap, intr.) |
|---|---|---|
| non-past | kireru | kireru |
| negative | kirenai | kirenai |
| past | kireta | kireta |
| -te | kirete | kirete |
| polite | kiremasu | kiremasu |
| conditional | kirereba | kirereba |

There is no cell where the paradigms diverge. Any diagnostic must come from outside the verb.

## Verdicts on each proposed cue

**Accent — does not work. Kill it.** The lexical -eru intransitive and the derived -eru potential descend from the *same* Old Japanese shimo-nidan derivation, so they share an accent class. *kireru* [2] = *kireru* [2]; *yakeru* [0] = *yakeru* [0]; *toreru* [2] = *toreru* [2]; *wareru* [2] = *wareru* [2]. (Accents approximate.) There is no accentual daylight, and the plan should stop hoping for any.

**-tai / -hoshii — null cue both ways.** \*_kiretai_ is ungrammatical (want-to-be-able-to is *kireru yoo ni naritai*), and the intransitive's inanimate subject blocks *-tai* too. *-te hoshii* ("kirete hoshii") is a weak positive for the intransitive but too rare to card.

**Does the intransitive have a potential? — Structurally interesting, diagnostically useless.** The intransitives are ichidan, so their potentials would be *-rareru* (*kirerareru*), and inanimacy blocks them anyway. So the ambiguity is always exactly two-way, never three-way, and always resolves to {ability-of-animate, spontaneous-change-of-inanimate}. That constrains the search space but does not resolve a token.

**Aspectual restriction — this is the one that works.** The potential is a **state**; the -eru intransitive is a **change of state**. Every eventive-selecting morpheme in the course is therefore a positive marker of the intransitive, and this course already cards the two highest-frequency ones as citation forms.

**Animate experiencer presence — the second one that works,** and it survives particle drop because the cue is the *lexical presence* of an animate NP, not its case marking. *"Boku kore kireru?"* vs *"Ito kirechatta."*

## The committed cascade

Apply in order; stop at the first hit.

1. **Eventive wrapper → INTRANSITIVE.** If the form appears under **-teru** (resultative), **-chau / -chatta**, or **-te shimau**: *kireteru, yaketeru, toreteru, wareteru, nuketeru, kirechatta, warechatta.* The potential is stative and resists both. ~90% reliable (the residual: habitual potentials like *saikin yoku nemureteru* do occur). One-way — absence proves nothing.
2. **Animate NP present in the clause or the prior turn, and it is not the theme → POTENTIAL.** Overt *boku / watashi / kimi* / a name, or a second-person question addressed to the listener.
3. **`-ru yoo ni natta` → POTENTIAL, 100%, low coverage.** *kireru yoo ni natta* is only acquisition of ability; intransitives use *-chatta*.
4. **Adverb class.** *zenzen ~nai, nakanaka ~nai, chanto, umaku, yatto, yoku* → potential. *katte ni, hitorideni, kyuu ni, ikinari, moo* → intransitive.
5. **Instrument phrase** (*hasami de, kono naifu ja*) → potential, since only the transitive event has an instrument.

Coverage: roughly 85–90% of conversational tokens. **The residue must be handled by context frames, not by rule.** That is the honest answer, and it forces four card-design changes:

- **-eru lexical intransitives are never carded in bare non-past.** Every card wraps them in *-teru* or *-chatta*, making cue 1 a property of the card rather than a rule the learner must apply. This is also what drops `c_R` from 0.85 to 0.35 and buys back the schedule in Part 1.
- **Potential cards for colliding stems carry an overt animate topic.** No bare *"kireru."*
- **One explicit contrast card per collision pair**, both frames back to back. Overt simultaneous contrast converts a covert competitor into a discriminating feature; this is the one case where co-presentation beats separation.
- **Bare non-past intransitives enter last**, and only for the ~6 stems where the bare form is genuinely frequent: *kireru, ureru, toreru, tokeru, nukeru, oreru.*

Frame pairs for the top eight:

| Stem | Potential frame | Intransitive frame |
|---|---|---|
| kireru | *boku, kore kireru?* | *denchi kirechatta* |
| yakeru | *watashi mo pan yakeru yo* | *sakana yakechatta* |
| toreru | *chiketto toreta!* | *botan ga toreteru* |
| wareru | *kore, waremasu ka* | *koppu warechatta* |
| nukeru | *kugi nukeru?* | *ha ga nuketa* |
| tokeru | *kono mondai tokeru?* | *koori toketeru* |
| nureru | *kabe nureru?* | *fuku nurechatta* |
| ureru | *kore mada ureru yo* | *kore yoku ureteru* |

One thing worth not spending capacity on: for a real share of tokens the two readings are **truth-conditionally near-equivalent in context** — *"kono hasami ja kirenai"* conveys the same practical fact whether it is "I can't cut with these" or "these don't cut." Residual ambiguity there costs the learner nothing.

## The bigger collision the plan never named

**-rareru is a 4-way fan, and it is worse than -eru.** For the ~30% of the verb inventory that is ichidan, *taberareru* is simultaneously (a) potential, (b) direct passive, (c) adversative passive, (d) honorific. Two committed fixes collapse it:

1. **Card *ra-nuki* as the citation potential for ichidan verbs: *tabereru, mireru, dereru, koreru, okireru*.** This course already commits to contractions as citation forms and targets casual spoken register, where ra-nuki is ubiquitous. It removes the potential from the -rareru cue entirely: *tabereru* = potential only, *taberareru* = passive only. This is the single highest-leverage change available and it is free.
2. **Drop honorific -rareru from the curriculum.** It is rare in the casual register this learner is targeting, *o-…-ni naru* and plain polite forms cover the need, and it is pure fan cost.

Treat direct / adversative / possessor passive as **one form with three argument frames**, not three competitors. The fan goes 4 → 1.

---

# Part 3 — Within-stage ordering

## The rule

**Ordering variable: descending conversational token frequency, constrained by prerequisite closure and by the Part 1 separation gate, packed with a class-induction quota.** Five keys, applied in strict order. It is mechanical — no judgment call survives past K3.

**K1 (hard) — Prerequisite closure.** Topologically sort. B follows A if B's citation form contains A, or B is defined by contrast with A. Never violated.

**K2 (hard) — Separation gate.** Run the Part 1 rule against every already-carded item in the stage *and* outside it. Compute `c_R` and `c_P` separately; each direction's card is scheduled independently. Violations push the item later, never earlier.

**K3 (primary sort) — Descending conversational token frequency** within each prerequisite layer. Ranked against CEJC-like conversational data, not written or lecture corpora. Approximate.

**K4 (tiebreak) — Ascending derivational depth**: fewest morphological operations from an already-known form goes first.

**K5 (packing) — three constraints:**
- **Anchor isolation.** The highest-frequency member of each subsystem shares its day only with items from the same subsystem. Everything else in the subsystem is learned by contrast with it, so it must be retrievable first.
- **Class-induction quota.** Where a subsystem has morphological classes, front-load 4 regular members of one class before opening the next — the same induction gate the plan already uses for verb coda classes.
- **Pair co-presentation carve-out.** A transitivity pair enters as one unit on one day, both members, both directions, never split — even though `c` between them is high. Interference comes from *covert* competition; overt simultaneous contrast converts the competitor into a discriminating feature. This is the only place K2 is deliberately overridden, and it is overridden by design, not by exception.

**Structural consequence: a "stage" is a two-track object, not a block.** The R-track and the P-track have different fan structures and close on different days. Stage 17's R-track closes in 13 days; its P-track takes 39. Any plan that treats a stage as a contiguous block is mis-specified.

## Stage 17, recomputed contents

Parts 1 and 2 change what belongs in this stage before ordering begins.

**Removed:**
- The **14 -eru-colliding pairs** — moved to wks 17–25 per Part 1.
- **Honorific -rareru** — deleted from the curriculum (Part 2).
- **soo da (hearsay)** — deferred. Highest in-family `c_P` in the stage (0.85 against *-soo* conjecture, identical segmental string), lowest conversational frequency of the ten, and *-tte* already carries the function as a citation form. It buys nothing and costs the most.
- **beki** — deferred to a formal-register stage. Low conversational frequency.
- **kawaru / kaeru** — deferred. *kaeru* is a four-way collision (change / return home / potential of *kau* / frog) and *kaeru/kaesu* is already in this stage. The gate blocks it; do not force it.

**Retained: 40 items.** 30 non-colliding transitivity pairs; 8 evidentials (kamo, mitai, deshoo/daroo, -soo, hazu, rashii, -ppoi, -garu); passive as 1 item with 3 argument frames; -te aru.

## The ledger

Notation: **R** = recognition card, **P** = production card. Gate arithmetic shown where it binds.

**DAY 1 — transitivity anchor day (4 slots)** — class A (-aru/-eru), induction quota
1. aku / akeru — R+P *(anchor: highest-frequency pair in the stage)*
2. shimaru / shimeru — R+P
3. hajimaru / hajimeru — R+P
4. tomaru / tomeru — R+P  ← class A gate: 4/4

**DAY 2 — E2 anchor day (5)** — class C (-eru/-asu, -reru/-su)
5. **kamo** — R+P *(E2 anchor; highest-frequency evidential in casual speech)*
6. deru / dasu — R+P
7. kieru / kesu — R+P
8. taoreru / taosu — R+P
9. kowareru / kowasu — R+P ← class C gate: 4/4

**DAY 3 — E1 anchor day (5)** — class D (-iru/-osu)
10. **mitai** — **R only** *(E1 anchor. Its P is blocked: needs interval(kamo P) ≥ 19 × 0.2 × 1 = 3.8 d; kamo is at 3 d today. Misses by 0.8 days.)*
11. ochiru / otosu — R+P
12. okiru / okosu — R+P
13. oriru / orosu — R+P
14. sugiru / sugosu — R+P ← class D gate: 4/4

**DAY 4 (5)** — class E (-ru/-su)
15. **mitai** — **P** *(gate now clears: interval(kamo) = 8 ≥ 3.8)*
16. **deshoo / daroo** — **R only** *(c_R vs kamo ≈ 0; P deferred)*
17. naoru / naosu — R+P
18. kaeru / kaesu — R+P *(gate vs kaeru = pot. of kau: mature, ✓. kawaru/kaeru held out of the stage.)*
19. nokoru / nokosu — R+P

**DAY 5 (5)** — class B (-u/-eru)
20. mawaru / mawasu — R+P ← class E gate: 4/4
21. **-soo (conjecture)** — **R only** *(c_R vs mitai ≈ 0.05, no constraint)*
22. tsuku / tsukeru — R+P
23. todoku / todokeru — R+P
24. tatsu / tateru — R+P *(blocked-type collision with pot. of tatsu; mature, ✓)*

**DAY 6 — passive anchor day (4)**
25. **Direct passive -(r)areru, frame set A** — R+P *(anchor. Gate vs ichidan potential: `c_R` = 0.90, but the potential has been ra-nuki since wk 13, so the cue is not shared at all — the Part 2 fix makes this gate vacuous.)*
26. narabu / naraberu — R+P ← class B gate: 4/4
27. hairu / ireru — R+P
28. noru / noseru — R+P

**DAY 7 (5)** — class A tail
29. **hazu** — **R only**
30. kimaru / kimeru — R+P
31. mitsukaru / mitsukeru — R+P
32. agaru / ageru — R+P
33. sagaru / sageru — R+P

**DAY 8 (3)**
34. **-te aru** — R+P *(K1 layer 1: requires ≥ 6 pairs with a transitive member — 28 carded, ✓ — and contrast with -teru, mature, ✓)*
35. kakaru / kakeru — R+P *(gate vs kakeru = pot. of kaku: mature, ✓)*
36. atsumaru / atsumeru — R+P

**DAY 9 (2)**
37. **rashii** — **R only**
38. yogoreru / yogosu — R+P

**DAY 11 (2)**
39. hazureru / hazusu — R+P *(K2 caught this: `hazu` is acoustically inside `hazureru`, c_R = 0.3, so it needed interval(hazu) ≥ 19 × 0.3 = 5.7 d. hazu entered day 7, hits interval 8 on day 11. It was originally scheduled day 9 and was pushed.)* ← 30/30 pairs complete
40. **-ppoi** — **R only**

**DAY 13 (1)**
41. **-garu** — R+P *(gate vs -tai / -hoshii: c_P = 0.7 / 0.6, both mature since the -tai stage, ✓. vs evidentials: c_P ≈ 0.1, trivially clear.)* ← **R-track closes**

**DAY 14 (1)**
42. **deshoo / daroo** — **P** *(interval(kamo P, day 2) = 20 ≥ 19 × 0.65 = 12.35 ✓)*

**DAY 15 (1)**
43. **-soo (conjecture)** — **P** *(interval(mitai P, day 4) = 20 ≥ 19 × 0.7 = 13.3 ✓)*

**DAY 18 (1)**
44. **Adversative passive, frame set B** *(interval(direct passive, day 6) = 20 ≥ 19 × 0.6 = 11.4 ✓. Originally slotted day 8; pushed 10 days by the gate.)*

**DAY 26 (1)**
45. **hazu** — **P** *(binding incumbent is deshoo P, day 14: interval 20 ≥ 19 × 0.6 = 11.4 ✓. kamo cleared long ago.)*

**DAY 27 (1)**
46. **rashii** — **P** *(binding incumbent is -soo P, day 15: interval 20 ≥ 19 × 0.6 = 11.4 ✓)*

**DAY 30 (1)**
47. **Possessor passive, frame set C** *(interval(adversative, day 18) = 20 ≥ 19 × 0.5 = 9.5 ✓)*

**DAY 39 (1)**
48. **-ppoi** — **P** *(binding incumbent is rashii P, day 27: interval 20 ≥ 19 × 0.6 = 11.4 ✓)* ← **P-track closes**

## What the ledger shows

The three evidentials most confused by learners — **kamo, deshoo, hazu** — end up with production cards on days 2, 14, and 26. The rule spaced them by weeks without being told to. It also caught *hazu* / *hazureru*, a collision that is invisible at the category level and obvious once you compute acoustic overlap mechanically.

The stage's shape is the real answer to "stage contents are not ordered": **40 items, R-track 13 days, P-track 39 days, five items pushed by the gate.** Sixteen days of the schedule are single-item days late in the stage — a stage does not empty at a constant rate, and any plan that assumes it does will silently violate the separation rule at exactly the points where interference is worst.