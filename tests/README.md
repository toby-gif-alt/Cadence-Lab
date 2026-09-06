# Cadence Lab browser QA

Cadence Lab has production-order tests plus lower-level renderer fixtures.

## Production-order tests

These load the real `../index.html`, so they exercise the same script order and composed question bank that learners receive on GitHub Pages. **Use these when checking current reference counts, exact-source overlays, filters, bar numbering, answer boxes, submit/reveal behaviour, playback permissions, and learner interaction.**

- `interaction-smoke.html` — current production interaction suite: source/year filters, paper completion and playback, Roman pivot semantics and auto-advance, semantic key relationships, authored jazz-builder coverage, generated variants, current exact-reference counts, and the scoped reveal rule (Roman/jazz keep their model score; key/modulation suppresses only the redundant duplicate extract).
- `score-display-consistency-smoke.html` — repo-wide bar-number mapping, Roman/jazz answer-box/location consistency, lower clearance for bottom answer-entry boxes, original SATB model checks for consecutive perfect fifths/octaves, scoped key/modulation duplicate suppression, and separate-model reveal for Roman/jazz and paper completions.
- `exact-2025-q1-production-smoke.html` — focused 2025 Q1(a–c) production regression, including 2025 (3), exact source bars, Q1(a) blank Roman boxes and separate model, Q1(b) X/Y/Z with no duplicate second extract, and the Q1(c) paper workflow.
- `integrity-correction-smoke.html` — production-order corrective audit for the 2025 Q1 transcriptions, geometry-positioned analysis boxes, submit/reveal stability, complete original-SATB counterpoint checks, adapted bar numbering, and the Valentine/Commercial content contracts.

## Lower-level renderer fixtures

`renderer-smoke.html` loads the base authoring files directly and remains useful for low-level VexFlow, notation, validator and engraving regressions. Its local `CadenceData` is a base-bank fixture rather than the final composed production bank, so current source counts should be checked through the production-order tests above.

`exact-2025-q1-smoke.html` is the focused data/renderer fixture for the 2025 Q1 overlays themselves.

`visual-gallery.html` is for manual engraving review and can be filtered by category/source/year where supported.
