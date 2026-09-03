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

The renderer deliberately supports two score-data contracts:

- Legacy `score.chords` entries are unmetered harmonic events. Events without a supplied duration use neutral, stemless noteheads, wrap directly across systems, and do not create a time signature or barlines. A supplied event duration is honoured, but metrical grouping and automatic beams belong in explicit measures.
- `score.measures` contains intentionally notated music. Event durations, time-signature changes, measure boundaries, ties, automatic beams and optional `beginBarline` / `endBarline` values are preserved. Supported barline values are `none`, `single`, `double`, `end`, `repeat-begin`, `repeat-end` and `repeat-both`.

SATB remains backwards-compatible with two legacy pitches per stave: treble maps to alto/soprano and bass maps to bass/tenor. Richer SATB input must use named voices so no pitch can be silently discarded:

```js
{
  voices: { soprano: "F5", alto: "A4", tenor: "C3", bass: "F2" },
  questionVoices: { soprano: "F5", bass: "F2" }
}
```

Each named voice accepts one pitch (or an empty value/rest) per event. Mixing the named and legacy SATB forms, supplying an unknown voice, or placing more than two pitches on a legacy SATB stave throws a development-time error. Question-only fields are selected before VexFlow notes are constructed, so omitted SATB/piano answer pitches do not affect accidentals, spacing, accessible text or hidden score DOM.

Chord-identification events can declare `expectedChordSymbol`, or `acceptableChordSymbols` when more than one analysis is intentional. Development-time validation requires the displayed pitch-class set (and slash bass, where applicable) to match one accepted symbol, preventing incomplete or added tones from making a supposedly unique answer ambiguous. Pitch rendering continues to use the authored note names, preserving theoretical spellings such as E♯, B♭ and G♭.

The current bank still uses legacy harmonic-event data, so it does not claim exact rhythm, metre, phrasing or intended bar placement. The planned procedural generator should emit `score.measures` whenever those details are musically intentional.

The questions and score extracts are original practice material informed by the published 2021–2024 AS 91421 assessment structure. This is not an official NZQA resource.
