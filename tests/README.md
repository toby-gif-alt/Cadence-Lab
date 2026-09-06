# Cadence Lab browser QA

Cadence Lab has two kinds of browser fixtures.

## Production-order tests

These load the real `../index.html`, so they exercise the same script order and composed question bank that learners receive on GitHub Pages. **Use these when checking current reference counts, exact-source overlays, filters, bar numbering, answer boxes, and submit/reveal behaviour.**

- `score-display-consistency-smoke.html` — repo-wide bar-number mapping, Roman/jazz answer-box/location consistency, single-score reveal for browser analysis, and separate-model reveal for every paper completion.
- `exact-2025-q1-production-smoke.html` — focused 2025 Q1(a–c) production regression, including 2025 (3), exact source bars, Q1(a) blank Roman boxes, Q1(b) X/Y/Z, and the Q1(c) paper workflow.

## Base-bank / renderer fixtures

`renderer-smoke.html` and the older top-level portions of `interaction-smoke.html` load the base authoring files directly. They remain useful for renderer, semantic-builder, generator, playback, and low-level validation regressions, but their local top-level `CadenceData` does **not** compose later exact-source overlay files in the same way as `index.html`.

Do not use a base-bank fixture's local source counts to decide what the production app contains. Production source/year behaviour must be checked through one of the production-order tests above.

`visual-gallery.html` is for manual engraving review and can be filtered by category/source/year where supported.
