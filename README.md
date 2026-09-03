# Cadence Lab

Paper-based practice for NCEA Level 3 Music Studies AS 91421.

## Put it on GitHub Pages

1. Create a GitHub repository and add these files, including `vendor/`.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select `main` and the repository root, then save.

The app is entirely static. It has no API key, database, package-manager install, framework or build step.

## Question bank and sources

`question-bank.js` contains 32 hand-authored templates:

| Family | Count |
| --- | ---: |
| Roman-numeral analysis | 6 |
| Keys and modulation | 6 |
| SATB / vocal completion | 4 |
| Piano completion | 4 |
| Jazz / rock notation | 6 |
| Harmonic or tonal feature | 6 |

Every question has either `sourceType: "nzqa-reference"` or `sourceType: "original-practice"`. The eight reference templates include two examples from each of 2021, 2022, 2023 and 2024, with question, part, extract, creator, title, location and acknowledgement metadata. The PDFs are external source material and are not stored in the repository. `docs/nzqa-task-map.md` maps all exam families to their matching assessment-schedule evidence.

The reference templates are compact teaching reductions of the named published extracts. Original templates are paired with the same major task families without being presented as NZQA material. The source filter and badges preserve that distinction in the interface and on printouts.

There is no procedural music generator. All pitches, rhythms, measures, harmonic changes and answer anchors are explicitly authored.

## Notation architecture

- `question-bank.js` owns assessment content and authored score data.
- `score-renderer.js` adapts the data into responsive VexFlow systems without question-specific drawing code.
- `question-validator.js` checks structural and music-theory invariants when the static app loads.
- `vendor/vexflow-bravura-4.2.5.js` is the pinned VexFlow 4.2.5 browser build. Its MIT licence is in `vendor/VEXFLOW-LICENSE.txt`.

All production questions use `score.measures`. The renderer preserves event durations, dotted values, rests, time-signature and key-signature changes, measure boundaries, ties, automatic beams and optional begin/end barlines. Supported barline values are `none`, `single`, `double`, `end`, `repeat-begin`, `repeat-end` and `repeat-both`.

Legacy `score.chords` input remains a renderer compatibility path only. It stays unmetered and cannot create inferred rhythm, metre or barlines. The current question bank has zero legacy scores.

### Note events and harmonic events

Rhythmic notation and harmonic analysis are intentionally separate:

```js
{
  measures: [
    { events: [
      { treble: ["E4", "G4", "C5"], bass: ["C3"], duration: "h" },
      { treble: ["D4", "F4", "B4"], bass: ["G2"], duration: "h" }
    ] }
  ],
  harmonicEvents: [
    {
      measure: 1,
      beat: 1,
      event: 0,
      localKey: "C major",
      romanNumeral: "I",
      chordSymbol: "C",
      analysisBox: true,
      modelLabel: "C: I"
    }
  ]
}
```

`measure` and `beat` carry the musical location; `event` is a zero-based anchor within that measure. A melody can therefore contain many note events while creating only one analysis box for the active harmony. Answer boxes are drawn inside the score SVG and the renderer calculates top and bottom decoration space from the actual overlays, including modulation brackets.

### SATB and completion data

SATB uses explicit named voices:

```js
{
  voices: { soprano: "F5", alto: "A4", tenor: "C3", bass: "F2" },
  questionVoices: { soprano: "F5", bass: "F2" },
  duration: "q"
}
```

Each named voice accepts one pitch per event. Mixing named and legacy stave fields, supplying an unknown voice, or placing more than two pitches on a legacy SATB stave throws a development error. Question-only fields are selected before VexFlow notes are constructed, so omitted answer pitches do not leak into score metadata, accidentals or spacing.

Piano completion events use the corresponding `qTreble` and `qBass` fields to keep the melody or supplied accompaniment visible while hiding notes the learner must write.

## Validation scope

The validator checks that:

- question IDs and score signatures are distinct;
- every production score has explicit measures whose durations fill the stated metre;
- every harmonic event resolves to an authored note-event anchor;
- each declared chord symbol is fully supported by the displayed pitch-class set and slash bass, without omitted defining tones or unlabelled added tones;
- Roman-numeral roots agree with their declared local keys for the supported diatonic cases;
- declared non-harmonic notes are outside the active chord;
- all SATB events contain four named voices in non-crossing order;
- reference metadata, year distribution, category counts and the zero-legacy target are preserved;
- the final tonic-sixth voicing in the C turnaround remains C–E–G–A.

Chord validation verifies support for the intended symbol. It does not claim to enumerate every plausible contextual analysis. `acceptableChordSymbols` remains available when the author deliberately permits more than one reading.

The Achievement/Merit/Excellence checklists follow the recurring progression in the published schedules: isolated correct evidence; secure consecutive/contextual work; then extended analysis or convincing stylistic realisation. They are not percentage cut-offs and are not official marking judgements.

## Browser QA

Serve the repository root over HTTP, then open `tests/renderer-smoke.html`. The smoke page validates the full bank and renders every question and model score at desktop and mobile widths. `tests/visual-gallery.html?category=analysis&width=780` provides a category-by-category visual review; the category can be `analysis`, `modulation`, `satb`, `piano`, `jazz` or `features`, and the width can be `780` or `390`.

Cadence Lab is not an official NZQA resource.
