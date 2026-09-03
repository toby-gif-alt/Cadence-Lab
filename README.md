# Cadence Lab

Paper-based practice for NCEA Level 3 Music Studies AS 91421.

## Put it on GitHub Pages

1. Create a new GitHub repository.
2. Upload the repository contents, including `vendor/`, to the repository root.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select the `main` branch and the root folder, then save.

The app is entirely static. It does not need an API key, database, or build step.

## Notation architecture

- `question-bank.js` contains the existing assessment content and score data.
- `score-renderer.js` adapts that data into responsive VexFlow systems without coupling notation layout to individual questions.
- `vendor/vexflow-bravura-4.2.5.js` is the pinned VexFlow 4.2.5 browser build. Its MIT licence is included in `vendor/VEXFLOW-LICENSE.txt`.

The renderer accepts treble, bass, grand-staff, piano and SATB layouts, exact enharmonic spellings, key signatures, multiple durations, beams, ties, measures and multi-system extracts. Question-only note arrays (`qTreble` and `qBass`) are selected before notation objects are built, so omitted completion pitches are not emitted into the question score.

The questions and score extracts are original practice material informed by the published 2021–2024 AS 91421 assessment structure. This is not an official NZQA resource.
