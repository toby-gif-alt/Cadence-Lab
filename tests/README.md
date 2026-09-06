# Cadence Lab browser QA

Cadence Lab has production-order tests plus lower-level renderer fixtures.

## Production-order tests

These load the real `../index.html`, so they exercise the same script order and composed question bank that learners receive on GitHub Pages. **Use these when checking current reference counts, exact-source overlays, filters, bar numbering, answer boxes, submit/reveal behaviour, playback permissions, and learner interaction.**

- `interaction-smoke.html` — current production interaction suite: source/year filters, paper completion and playback, print separation, contextual self-check, Roman pivot semantics and auto-advance, semantic key relationships, authored jazz-builder coverage, generated variants, and current exact-reference counts.
- `score-display-consistency-smoke.html` — repo-wide bar-number mapping, Roman/jazz answer-box/location consistency, single-score reveal for browser analysis, and separate-model reveal for every paper completion.
- `exact-2025-q1-production-smoke.html` — focused 2025 Q1(a–c) production regression, including 2025 (3), exact source bars, Q1(a) blank Roman boxes, Q1(b) X/Y/Z, and the Q1(c) paper workflow.

## Lower-level renderer fixtures

`renderer-smoke.html` loads the base authoring files directly and remains useful for low-level VexFlow, notation, validator and engraving regressions. Its local `CadenceData` is a base-bank fixture rather than the final composed production bank, so current source counts should be checked through the production-order tests above.

`exact-2025-q1-smoke.html` is the focused data/renderer fixture for the 2025 Q1 overlays themselves.

`visual-gallery.html` is for manual engraving review and can be filtered by category/source/year where supported.
