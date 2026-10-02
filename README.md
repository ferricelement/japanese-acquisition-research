# Japanese acquisition-order research

**Versatility list (live):** https://ferricelement.github.io/japanese-acquisition-research/

Audio-first, romaji-only, listening/speaking target (~6,000 words).
Generated 2026-08-20 by a 12-agent workflow plus a 4-agent recovery run.

Published artifacts:
- Acquisition order (deep, item-level): https://claude.ai/code/artifact/c80d7b7c-06ff-45eb-8054-c92d062b35a8
- Strategy overview (audio-first):      https://claude.ai/code/artifact/2751fdac-b23c-46b8-bc73-954a343de1f2

## Files
- `01-synthesis.json` — 11 ordering laws, 21 stages, 10 contested calls, 10 deviations
  from standard curricula. The core deliverable.
- `02-completeness-critique.md` — adversarial review of the synthesis. Finds the
  remaining structural gaps: within-stage order absent, the ~35 -te dependents never
  enumerated, ~25 named items with no scheduled position, the -eru disambiguation
  broken on 5 of 6 cited pairs, and the steelmanned case that order buys ~20% and
  input volume buys the rest.
- `03-phonology-corrections.md` — merged output of three adversarial lenses (phonetics,
  SLA methodology, implementability) against the perceptual-foundation layer.
  Kills the 20%-inter-mora-variance gate, the 40-trial/90% exit, and the six-TTS-voices
  = high-variability-training assumption.
- `04-phonology-analysis.json` — the original perceptual-foundation analysis those
  corrections apply to (25 units, 8 principles).
- `05-acquisition-order.html` — source of the published artifact.

## Known open items
1. Emit the full ordered ledger (one row per item, index + gate + interference partner).
   The 60-verb ledger is done and lives in the artifact; the ~180 nouns, ~60 adjectives,
   the 35 -te dependents, and the 140-item exit battery are still unenumerated.
2. Reconcile the -eru separation (5 weeks) with the kango homophone window (200 items
   = 10 days at N=20). Currently inconsistent.
3. Re-derive the daily braid under the concession that input volume dominates order.

---

## Round 2 — the ledger (2026-08-20, later)

Published: https://claude.ai/code/artifact/b2900235-7fc1-4d17-9e08-bc7706d07d11

- `10-list-nouns.json` — 180 nouns, sorted by special-mora load ascending, accents + glosses
- `11-list-adjectives.json` — 63 adjectives, class-tagged, sorted by the stage-10 induction gate
- `12-list-te-dependents.json` — 65 nodes: 33 true -te dependents ranked by fanout x frequency,
  8 on the -ta branch, 13 IMPOSTORS that take the i-stem, 6 homophone collisions
- `13-list-exit-battery.json` — 140 items with stimuli, allocated by expected error mass
- `14-input-rebalance.md` — the big one. The coverage gate, not the card budget, caused the
  input starvation. Repealing it frees ~50 min/day at every phase. 2.9x listening at month 9.
- `15-separation-rule.md` — interval(i) >= [R/(1-R)] * c * k. Cue overlap is direction-specific:
  homophones are a listening problem, near-synonyms a speaking problem. Plus the real -eru
  collision inventory: 14 live, 4 blocked, ~30 that never needed separating.
- `16-verifier-findings.json` — 116 findings (18 fatal, 51 major, 47 minor)

### Fix these before recording any TTS
1. -te chant has no ichidan row (taberu > tabete) and no irregular row (suru/kuru). Add R0, R6.
2. Voiced allomorphs missing everywhere: -jau, -yondoku, -yondara, -yonja dame.
3. Adjective list omits the i-adjective `nai`.
4. Battery writes `sensei`/`kirei` — must be `sensee`/`kiree`. Global -ei- sweep needed.
5. Noun list: separate te/me, kippu/koppu; flag soba and kawa as accent-identical homophones.
6. `au` is [1] not [0], which breaks the atte/atte pitch-separation claim.

### Still open
- The ~47 minor verifier findings are unapplied.
- Noun ordering variable does no work over items 1-120; restate as a partition, not a sort.
- Within-stage ordering exists now for stage 17 only (in 15-separation-rule.md).

---

## Round 3 — the versatility list (2026-10-01)

Published: https://claude.ai/artifact/FpmB4qyuKhsYdVTHMZdqBo

- `20-list-versatile.json` — 484 items, 113 chunks, 4 stages. The words, endings and patterns that
  work in almost any conversation: time & sequence, degree, stance, adjectives, connectors,
  sentence endings, responses & set phrases, general verbs, grammar patterns, ko/so/a/do & question words.
  Casual form is the headword (`romaji`); the desu/masu counterpart sits beside it (`polite`).
  Every item has a casual and a polite example sentence (romaji, ja, english).
  Romaji uses kotoba's stored spelling (sou, daijoubu, kotchi), not the soo/kiree style above.
- Frequency: `freqRank` = rank in jiten.moe's drama-subtitle list (3,030 TV dramas, CC BY-SA 4.0).
  Contractions are split by its tokenizer; `freqNote` says what was looked up instead. 31 items have no usable rank.
- Built by an 85-agent workflow: per-category harvest (662) → 3 rounds of gap hunting (pool 1,049) →
  3-judge selection → write → naturalness / nuance / form review → fix → cross-category consistency
  → course order. The panel cut the relative time words (asa, raishuu, kotoshi...) and several endings
  (darou, n da yo, -te ne, sa/wa/zo/yo na); those were restored through the same write+review steps.
- `cuts` in the JSON lists the 561 candidates that didn't make it, each with a verdict (covered / skip) and reason.
- 2026-10-02: a second review of all 621 cuts (per-category reviewer + usage and redundancy checks) re-added 33 clear gaps,
  10 strong maybes and boku (atsui, samui, itai, kirei, otsukare, oyasumi, hisashiburi, tetsudau, okureru, -you ni, the passive...).
  Most joined existing chunks; 8 existing items got small edits so the new partners pair up (existing-edits in the merge step).
- Item ids (`A-ima`, `J-kotchi`) are stable keys; `prereqs` are item ids, all pointing backward in course order.
- 2026-10-02 (later): the remaining 16 maybes were added at the learner's request (nakanaka, douse, nigate, hazukashii,
  nagai, abunai, -kawari ni, wake nai, moshimoshi, bikkuri shita, ki o tsukete, ireru, tariru, okoru, -sasete, dou iu).
  All joined existing chunks; 12 chunks now sit at the 6-item maximum.

### Rebuilding the versatility list

`versatility-build/` holds everything `index.html` and `20-list-versatile.json` are generated from:
the workflow outputs (`result.json`, `additions-result.json`, `readds-result.json`, `maybes-result.json`),
the cuts review (`cuts-full.json`, `cuts-verdicts.json`), stage placement for added chunks (`placement.json`),
edits to existing items (`existing-edits.json`), the page template and the merge script.
`workflow-main.js` is the original 75-agent workflow script, kept for reference.

```bash
cd versatility-build && python3 merge.py
```

`freq.py` looks words up in the jiten.moe drama frequency list, which is not committed (CC BY-SA 4.0, 7.8 MB):

```bash
curl -L -o versatility-build/jiten_freq_Drama.csv "https://api.jiten.moe/api/frequency-list/download?mediaType=Drama&downloadType=csv"
```
